import { reactive, untrack } from './mini_dom_signal.js';
import { html } from './mini_html.js';
import { createFragment, replaceFragments, clearFragment } from './mini_dom_fragments.js';
import { diffArrays } from './mini_dom_map.js';

export { render, renderClient, onMount, onUnmount, map };


            let mountqueue=[];
            function onMount(fn){
              mountqueue.push(fn);
            }
            let unmountqueue=[];
            function onUnmount(fn){
              unmountqueue.push(fn);
            }

            function _extractunmounts(o, arr=[]) {
                if(o.unmount) {arr.push(o.unmount);delete o.unmount;}
                Object.getOwnPropertySymbols(o).forEach(k=>{if(o[k]?.frag) {_extractunmounts(o[k],arr)}});
                return arr.flat().reverse();
            }


            function renderArray(v, owner) {
                const tmp = document.createComment('rx');
                let nodesarray= new Array(v.length);
                nodesarray=nodesarray.fill(0).map(()=>tmp.cloneNode());
                owner.frag = replaceFragments(owner.frag, nodesarray);        
                for(let i=0; i<v.length; i++){
                  renderFunction(nodesarray[i], ()=>v[i], owner);
                }
            }

            function renderSync(val, owner) {
                if(owner.hidden) owner.hidden=false;
                if(val?.html){ //render SYNC COMPONENT
                  renderClient(owner.frag, val, owner);
                  if(owner.mount) setTimeout(()=>{owner.mount?.forEach(f=>f());owner.mount=undefined},0); //nextTick
                }
                else if(Array.isArray(val)) { //render ARRAY
                  renderArray(val, owner);
                  if(owner.mount) setTimeout(()=>{owner.mount?.forEach(f=>f());owner.mount=undefined},0); //nextTick
                }
                else if(val===false || val==='') { //hide FRAGMENT
                  clearFragment(owner.frag);
                  owner.hidden=true;
                }
                else { //render VALUE
                  let node = owner.frag.prev.nextSibling
                  if(node.nodeType!==3){
                    const tmp = document.createTextNode('');
                    node.replaceWith(tmp);
                    node=tmp;              
                  }
                  if(val!==undefined && node.data!==val) node.data=val;
                }
            }

            function clearSuspenseLoader(owner){
              //find loader's fragment
              const loaderid = Object.getOwnPropertySymbols(owner).filter(k=>owner[k]?.loader)?.[0]
              if(!loaderid) return
              const loaderfrag = owner[loaderid].frag
              clearFragment(loaderfrag)
              delete owner[loaderid]
            }

      function renderFunction(placeholder, fn, owner) {
          const myid=Symbol('$comp')
          owner[myid]={};
          //create fragment markers to allow hide/show switch
          placeholder.before(document.createTextNode(''));
          placeholder.after(document.createTextNode(''));
          owner[myid].frag=createFragment(placeholder);

              //inject or modify owner/myid for internal functions
              if(fn._map) return fn(owner,myid) //map() will call diffArray
              //////////////////////

          //console.log('NEW - reactive')
          reactive(async()=>{

              //intercept stale condition to stop reactivity of this function
              if(!owner[myid]) return;
              if(owner[myid].stale) return delete owner[myid]; 
              if(owner.stale) return delete owner[myid]; //not sure it's needed
              //////////////////////

                //set all children to stale and remove them to functions' tree! 
                //this will stop reactivity next time they get called
                function _staleChildren(o) {
                  Object.getOwnPropertySymbols(o).forEach(k=>{if(o[k]?.frag) {o[k].stale=true; _staleChildren(o[k]); delete o[k]; }})
                }
                _staleChildren(owner[myid])

                const mountlen = mountqueue.length, unmountlen = unmountqueue.length;
                const unmountlist = _extractunmounts(owner[myid]);
                if(unmountlist.length) unmountlist.forEach(f=>(typeof f==='function'&&f()));

              //THIS is where the reactivity magic happens
              //fn: COMPONENT [()=>Component()], COMPONENT/BOOLEAN ()=>signal && Component(), COMPUTED VALUE ()=>signal.value, ...
              let val = fn();
              if(val instanceof Promise) val=await val //an async component
              //////////////////////

                //intercept mount/unmount
                if(mountqueue.length>mountlen) {
                  const x = mountqueue.length-mountlen;
                  owner[myid].mount = mountqueue.splice(-x,x);
                }
                if(unmountqueue.length>unmountlen) {
                  const x = unmountqueue.length-unmountlen;
                  owner[myid].unmount = unmountqueue.splice(-x,x);
                }
                //////////////////////

              //inject or modify owner/myid for internal functions
              if(typeof val === 'function' && val?._map) return val(owner,myid) //map() will call diffArray
              
              if(fn._loader) owner[myid].loader=true
              if(fn._suspense) {
                owner[myid].suspense=true
                clearSuspenseLoader(owner)
                delete fn._suspense
              }
              //////////////////////

              val = typeof val === 'function' ? untrack(val) : val;
              renderSync(val, owner[myid])
                    
          },{effect:true})          
      }


      function map(array,renderItem) {
        const fn = function(...args) {
          const [owner,myid] = args
          clearFragment(owner[myid].frag); //let's have an empty fragment to begin with

          let oldarray;
          reactive(()=>{
            if(owner[myid].stale) return delete owner[myid]; //this will stop reactive chain

            const newarray = array.signal? array.value : array;
            untrack(()=>diffArrays(owner[myid].frag, oldarray, newarray, renderItem, owner[myid]));
            oldarray=newarray;
          },{effect:true});
        }
        fn._map=true
        return fn
      }


      function renderAttribute(placeholder, key, v, owner) {
              function setAttr(el,key,val) {
                  if (val === true) el.setAttribute(key, key);
                  else if (val === false) el.removeAttribute(key);
                  else if (val !== false && val != null) el.setAttribute(key, val);
              }

          const myid=Symbol('$attr')
          owner[myid]={};
          owner[myid].frag=createFragment(placeholder);

          const memo = reactive(v);

          reactive(()=>{
            if(owner[myid].stale) return delete owner[myid]; //this will stop reactive chain
            if(owner.stale) return delete owner[myid]; //this will stop reactive chain

            let val= memo.value;
            if(key==='value') {
              if(val.signal) placeholder.value=val.value;
              else placeholder.value=val;
            }
            else if (key==='ref') {
              placeholder.removeAttribute(key);
              if(v.signal) {
                v.value=placeholder;
              }
            } else {
              setAttr(placeholder,key,val);
            }
          }, {effect: true});
      }

          function findPlaceholder(root,commentText) {
            //crawl for comments
            return document.createTreeWalker(root, 128, /* NodeFilter.SHOW_COMMENT */ { acceptNode:  (node) => node.textContent === commentText? 1 : 2 }).nextNode();
          }

  //@param frag: fragment/node to replace with t.html
  //@param t:  obj {html,reactarray} from html``
  function renderClient(frag, t, _owner={0:{}}) {
    //console.log('renderClient >>',_compcount, t.name||t,)

    if(!frag) return console.error('MiNi: renderClient missing node element');
    if(frag.nodeType) frag=createFragment(frag);

    if(typeof t === 'function' && !t.html) t=t();
    if(typeof t === 'function' && t.html) t=t();

    if(t.html===undefined) return console.error('MiNi: unknown input to renderClient',t);
    //console.log('renderClient ==',_compcount,frag,t);

    const {html, reactarray} = t; //generated by html``
    const tmplt = document.createElement('template');
    tmplt.innerHTML=html;

    //resolve all variables in reactarray and populate template's reactive placeholders (<--!rx0-->)
    const root=frag.prev?.parentNode || frag.parent; 
    //NOTE: use of prev.parentNode needed when hydrating fragment (frag.prev and .next are moved to the DOM but .parent cannot be updated)
    for (let i=0; i<reactarray.length; i++) {
      let placeholder;
      let {type,key,v} = reactarray[i];

      switch(type) {

        case 'node':
            placeholder=findPlaceholder(tmplt.content,'rx'+key);
            if(!placeholder) console.error('MiNi: cannot find placeholder','rx'+key,root);
            else {
                if(typeof v === 'function') {
                  //console.log('FUNC>>',placeholder,v);
                  renderFunction(placeholder, v, _owner);
                }
                else if(v instanceof Promise) { //ALLOWING ${asynccomponent()} WILL BRAKE MOUNT/UNMOUNT
                  console.error('MiNi: wrap async component in ()=>{}');
                }
                else if(v.html === true) { //TEMPLATE: html`` which returns an obj {html,reactarray}
                  placeholder=renderClient(placeholder, v, _owner,);
                }
                else console.error('MiNi: unknown node value',v);
            }  
          break;
        /*
        case 'for':
            placeholder=findPlaceholder(tmplt.content,'rx'+key);
            if(!placeholder) console.error('MiNi: cannot find placeholder','rx'+key,root);
            else renderDiffArray(placeholder, v, _owner);
          break;
        */
        case '@': //create event listener
        case ':': //create reactive attribute
            placeholder = tmplt.content.querySelector(`[${key+i}]`);
            if(!placeholder) console.error('MiNi: cannot find attribute',key+i);
            else {
                placeholder.removeAttribute(key+i);
                if(type===':') {
                  renderAttribute(placeholder, key, v, _owner);
                }
                else if(type==='@') placeholder.addEventListener(key.toLowerCase(), v, key==='onwheel'?{ passive: false }:{});
                else console.error('MiNi: unknown special attr',type,i);
            }
          break;
      }
    }

    //add template to the DOM
    //console.log('add to DOM',frag.next,root);
    clearFragment(frag);
    if(frag.next) frag.next.before(tmplt.content);
    else root?.appendChild(tmplt.content);
    return frag;
  }


  async function render(root, rootComponent, debug) {
    root.appendChild(document.createElement('div'));
    if(typeof rootComponent!=='function') return console.error('MiNi: render 2nd arg must be a function')
    let rootowner ={0:{}};
    try {
      await renderClient(root.children[0], html`${()=>rootComponent()}`,rootowner); //
      if(debug) console.log('rootowner',rootowner);
    }
    catch(err){
      console.error('MiNi: render', err);
    }
  }


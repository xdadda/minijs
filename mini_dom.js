import {reactive, untrack} from './mini_dom_signal.ts';
import { html } from './mini_html.js';
import {diffArrays} from './mini_dom_array.js';
export {render, renderClient, onMount, onUnmount, hydrate, renderAttribute};


import {createFragment, replaceFragments, clearFragment} from './mini_dom_fragments.js';
import {hydrateTree, hydrateAsyncTree} from './mini_dom_hydrate.js';



const DEBUG = false;
const DEBUGfunc = false;
const DEBUGtwin = false;
const DEGUGnohydra = false;
const DEGUGshowreactive = false;
const DEBUGbmk = false;
const DEBUGcounter=true;

let hydrating = false;


  let mountqueue=[];
  function onMount(fn){
    mountqueue.push(fn);
  }
  let unmountqueue=[];
  function onUnmount(fn){
    unmountqueue.push(fn);
  }

////////// RENDER ////////////////////////////////

      function setAttr(el,key,val) {
          if (val === true) el.setAttribute(key, key);
          else if (val === false) el.removeAttribute(key);
          else if (val !== false && val != null) el.setAttribute(key, val);
      }

      function setReactive(node,label){
          let tnode = node[0]||node;
          tnode.reactive = true;
          if(DEGUGshowreactive && tnode.nodeType===1) tnode.style.backgroundColor='yellow';
      }

      function renderSignal(placeholder,v){
          const tmp = document.createTextNode('');
          placeholder.replaceWith(tmp);
          placeholder=tmp;

          if(hydrating) {
            //place comments to separate potentially reactive contents and match with SERVER stream
            placeholder.before(document.createComment(''));
            placeholder.after(document.createComment(''));
            setReactive(placeholder,'SIGNAL');
          }

          reactive(()=>{
            const val = v.value;
            if(placeholder.data!==val) placeholder.data=val;
          }, {effect:true});
      }

      function renderArray(component,v,owner){
          const tmp = document.createComment('rx');
          let nodesarray= new Array(v.length);
          nodesarray=nodesarray.fill(0).map(()=>tmp.cloneNode());
          let newcomponent = replaceFragments(component,nodesarray);        

          for(let i=0; i<v.length; i++){
            renderFunction(nodesarray[i],()=>v[i],owner);
          }
          return newcomponent;
      }


      function _flatten(o) { 
          return [].concat(...Object.keys(o)
            .map(k => typeof o[k] === 'object' ? _flatten(o[k]) : (o[k]))
          );
        };
      let componentcounter=DEBUGcounter?0:'$';
      let compcount=0;
      function renderFunction(placeholder,v, owner){
          if(hydrating) {
            //place comments to separate potentially reactive contents and match with SERVER stream
            placeholder.before(document.createComment(componentcounter));
            placeholder.after(document.createComment(componentcounter));
            DEBUGcounter&&componentcounter++;
          } 
          else {
            placeholder.before(document.createTextNode(''));
            placeholder.after(document.createTextNode('')); //SUPER IMPORTANT! needed if more consecutive components to keep them separate                
          }

          let component = createFragment(placeholder);
          let asynchydrating=hydrating;

          DEBUGfunc&&console.log('renderFunction',placeholder,v?.name||v,component);


          let mountfn, unmountfn;
    
          let myid=++compcount;
          let mystack={[myid]:{}};
          owner[compcount]=mystack;
          let myowner=owner;
    
          let memo;

          reactive(()=>{
              //THIS IS THE HEART WHERE REACTIVITY IS HANDLED

              const unmountlist = _flatten(mystack);
              if(unmountlist.length) {
                unmountlist.reverse().forEach(f=>(typeof f==='function'&&f()));
                mystack={[myid]:{}};
              }

              const mountlen = mountqueue.length, unmountlen = unmountqueue.length;
              
              //// RENDER FUNCTION: v() can be a COMPONENT (sync or promise), an ARRAY, a BOOLEAN STATE, a COMPUTED VALUE
              //console.log('COMPONENTS TREE',myid,v,'owner:',myowner)

              memo=typeof v === 'function' ? v() : v;
              if(mountqueue.length>mountlen) {
                const x = mountqueue.length-mountlen;
                mountfn = mountqueue.splice(-x,x);
              }
              if(unmountqueue.length>unmountlen) {
                const x = unmountqueue.length-unmountlen;
                unmountfn = unmountqueue.splice(-x,x);
                mystack[myid].unmount = unmountfn;
              }

              let val= memo;
              val = typeof val === 'function' ? val() : val; //HANDLE THE FUNCTION              
              //render SYNC COMPONENT -- NOTE: it will be re-run everytime it's recreated after hiding

              _handleRender(val);

              function _reactComments(){
                      if(hydrating){
                        //on first run when component still links to placeholder...
                        if(component[0]===placeholder){
                          //..set comments as reactive to "move" the TOGGLE reference points (prev and next) to the DOM
                          if(placeholder.previousSibling) placeholder.previousSibling.reactive=true;
                          if(placeholder.nextSibling) placeholder.nextSibling.reactive=true;

                          if(v.loader){
                            mystack.loader=placeholder.previousSibling;
                            placeholder.previousSibling.data='lx'+placeholder.previousSibling.data;
                            placeholder.previousSibling.firstloader=true
                            placeholder.nextSibling.data='lx'+placeholder.nextSibling.data;
                          }
                        }
                      }
              }
              async function _removeLoader(v,lx){
                  if(v.suspense && lx){
                    await new Promise(r => setTimeout(r, 0)); //next tick
                    //const lx=myowner[myid-1].loader;
                    DEBUGfunc&&console.log('HIDE LOADER', v.suspense, lx);
                    while (lx.nextSibling && lx.nextSibling.data!==lx.data){
                      //console.log('hiding',lx.nextSibling)
                      lx.nextSibling.toremove=true
                      lx.nextSibling.remove();
                    }
                    //await new Promise(r => setTimeout(r, 0)); //next tick
                  }
              }

              function _handleRender(val){
                      if(val?.html) { 
                        DEBUGfunc&&console.log('RENDER_SYNC_COMPONENT',component,val,v.loader);
                        _reactComments();
                        component= renderClient(component,val,mystack);
                        if(asynchydrating){ //for deeply nested
                          hydrateAsyncTree(placeholder);
                          //asynchydrating=false
                        }
                        if(mountfn) setTimeout(()=>{mountfn.forEach(f=>f());mountfn=undefined},0);
                      }

                      //render ASYNC COMPONENT
                      else if(val instanceof Promise){

                          async function launchAsyncRender(component,vv) {
                            let val = await vv;
                            if(val?.default) val=await val.default(); //from import xxx from 'yyyy'
                            if(val===null) {
                              //ASYNC SERVER ONLY COMPONENT
                              //REMOVE LOADER IF PRESENT!
                              await _removeLoader(v,myowner[myid-1]?.loader)
                            } 
                            else if(val===false || val===''){
                              _reactComments();
                              clearFragment(component);
                              component.next.before(document.createTextNode(''));
                            }
                            else {
                              _reactComments();
                              component= await renderClient(component,val,mystack); //NOTE: await here is important! TBD udnerstand why

                              //REMOVE LOADER IF PRESENT!
                              await _removeLoader(v,myowner[myid-1]?.loader)

                              if(asynchydrating){
                                hydrateAsyncTree(placeholder);
                                //asynchydrating=false;
                              }



                              if(mountfn) setTimeout(()=>{mountfn.forEach(f=>f());mountfn=undefined},0);
                            }
                          }

                        DEBUGfunc&&console.log('RENDER_ASYNC_COMPONENT',component,val);
                        launchAsyncRender(component,val);
                      }

                      //render ARRAY
                      else if(Array.isArray(val)) {
                        DEBUGfunc&&console.log('RENDER_ARRAY',placeholder,component[0]);
                        _reactComments();
                        component = renderArray(component,memo,mystack);
                        if(mountfn) setTimeout(()=>{mountfn.forEach(f=>f());mountfn=undefined},0);
                      }

                      //render SYNC SERVER COMPONENT ..
                      else if(val===null) {
                      }

                      //hide FRAGMENT
                      else if(val===false || val==='') {
                        DEBUGfunc&&console.log('HIDE',component,component.prev,component.next);
                        _reactComments();
                        clearFragment(component);
                        component.next.before(document.createTextNode(''));
                      }

                      //render VALUE
                      else {
                        if(placeholder.nodeType!==3){
                          const tmp = document.createTextNode('');
                          placeholder.replaceWith(tmp);
                          placeholder=tmp;
                          
                          if(asynchydrating){ //for deeply nested
                            setReactive(placeholder,'SIGNAL');
                            //hydrateAsyncTree(x);
                            //asynchydrating=false;
                          }
                          
                        }
                        if(val!==undefined && placeholder.data!==val) placeholder.data=val;

                      }
              }

          },{effect:true});

          return;
      }

      function renderAttribute(placeholder,key,v){
            const memo = reactive(v);

            reactive(()=>{
              let val= memo.value;
              DEBUG && console.log('ATTR update',placeholder,val);
              if(key==='value') {
                if(val.signal) placeholder.value=val.value;
                else placeholder.value=val;
              }
              else if (key==='ref') {
                placeholder.removeAttribute(key);
                if(v.signal) {
                  v.value=placeholder;
                  //setTimeout(()=>v.value=placeholder,0) //nextTick!
                }
              } else {
                setAttr(placeholder,key,val);
              }
            }, {effect: true});
      }


      function findPlaceholder(root,commentText) {
          return document
            .createTreeWalker(
              root,
              128, /* NodeFilter.SHOW_COMMENT */
              {
                  acceptNode:  (node) => node.textContent === commentText
                    ? 1 /* NodeFilter.FILTER_ACCEPT */
                    : 2 /* NodeFilter.FILTER_REJECT */
              }
            )
            .nextNode();
      }
      /*
      function findPlaceholder3(tmplt,commentText){
        //const node = document.evaluate("//comment()[.='"+commentText+"']",tmplt.content.firstChild,null,XPathResult.ANY_TYPE,null).iterateNext()
        const node = document.evaluate("//comment()[.='"+commentText+"']",tmplt.content.firstChild,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue
        //console.log('findCommentNode',tmplt.innerHTML,commentText,node)
        return node
      }
      function findPlaceholder2(tmplt,commentText){
        const node = tmplt.content.getElementById(commentText)
        //console.log('findCommentNode',tmplt.innerHTML,commentText,node)
        return node
      }
      */

  //@param frag: fragment to replace with t.html
  //@param t:  obj {html,reactarray} from html``
  //let rootowner = {0:{}}
  function renderClient(frag, t, owner={0:{}}){
    let stime=performance.now();

    if(!frag) return console.error('MiNi: renderClient missing node element');
    if(!frag.fragment) frag=createFragment(frag);

    if(typeof t === 'function' && !t.html) t=t();
    if(typeof t === 'function' && t.html) t=t();

    if(t.html===undefined) return console.error('MiNi: unknown input to renderClient',t);
    DEBUG&&console.log('renderClient --->',frag,t);

    const tmplt = document.createElement('template');
    tmplt.innerHTML=t.html;

    const root=frag.prev?.parentNode || frag.parent; //NOTE: use of prev.parentElement needed when hydrating fragment (frag.prev and .next are moved to the DOM but .parent cannot be updated)

    const {reactarray} = t;
    for (let i=0; i<reactarray.length; i++) {
      let placeholder;
      let {type,key,v} = reactarray[i];

      switch(type) {

        case 'node':
            placeholder=findPlaceholder(tmplt.content,'rx'+key);
            if(!placeholder) console.error('MiNi: cannot find placeholder','rx'+key,root);
            else {
                if(v.html === true) { //TEMPLATE: html`` which returns an obj {html,reactarray}
                  DEBUG&&console.log('HTML>>',placeholder,v.name);
                  placeholder=renderClient(placeholder,v);
                }
                else if(typeof v === 'function') {
                  DEBUG&&console.log('FUNC>>',placeholder,v);
                  renderFunction(placeholder,v, owner);
                }
                else if(v instanceof Promise) { //ALLOWING ${asynccomponent()} WILL BRAKE MOUNT/UNMOUNT & SERVERFETCH!!
                  console.error('MiNi: wrap async component in ()=>{}');
                }
                else if(v.signal) {
                  DEBUG&&console.log('SIGNAL>>',placeholder);
                  renderSignal(placeholder,v);
                }
                else console.error('MiNi: unknown node value',v);
            }  
          break;

        case '@':
            //create event listener
        case ':':
            //create reactive attribute
            placeholder = tmplt.content.querySelector(`[${key+i}]`);
            DEBUG&&console.log('ATTR>>',key+i,placeholder);

            if(!placeholder) console.error('MiNi: cannot find attribute',key+i);
            else {

                placeholder.removeAttribute(key+i);
                if(type===':') {
                  renderAttribute(placeholder,key,v);
                }
                else if(type==='@') {
                  placeholder.addEventListener(key.toLowerCase(), v, key==='onwheel'?{ passive: false }:{});
                }
                else console.error('MiNi: unknown special attr',type,i);

                if(hydrating){
                  if(!placeholder.reactattr) placeholder.reactattr=[];
                  placeholder.reactattr.push({type,key,v});
                }
            }
          break;

        case 'for':
            placeholder=findPlaceholder(tmplt.content,'rx'+key);
            if(!placeholder) console.error('MiNi: cannot find placeholder','rx'+key,root);
            else {
              DEBUG&&console.log('FOR>>',placeholder,v);
              const frag = createFragment(placeholder);
              frag[0].remove();
              frag.pop(); //let's have an empty fragment to begin with
              let oldarray;              
              reactive(()=>{
                const newarray = v.$array.signal? v.$array.value : v.$array;
                diffArrays(frag,oldarray,newarray,v.$item);
                oldarray=newarray;
              },{effect:true});

            }
          break;
      }
    }

    DEBUG&&console.log('CLEAR',frag[0]);
    clearFragment(frag);
    if(frag.next) {
      DEBUG&&console.log('INSERT BEFORE',frag.next,tmplt.content);
      frag.next.before(tmplt.content);
    }
    else {
      DEBUG&&console.log('INSERT APPEND',root,tmplt);
      root.appendChild(tmplt.content);
    }

    return frag;
  }
//////////////////////////////////////////////////
  
  async function render(root, comp){
    root.appendChild(document.createElement('div'));
    await renderClient(root.children[0], comp);
    compcount=0
  }

  async function hydrate(root, comp){
    if(!root) return console.error('MiNi: hydrate missing root element');

    // Keep trying until root is available. 
    // As the main.js is loaded async it will execute immediately and root may not be ready!
    const ssrtimeout = 500; //ms
    let el, timeout=0, stime=Date.now();
    while(!el && timeout<ssrtimeout) {
      el = await new Promise(r => setTimeout(()=>r(document.querySelector(root)),10)); //
      timeout+=10; //ms
      if(timeout>ssrtimeout) return console.error('MiNi: hydrate timeout');
    }
    root=el;

    hydrating = true;

    let shadowroot = document.createElement('div');
    shadowroot.appendChild(document.createElement('div'));
    await renderClient(shadowroot.children[0], comp);
    compcount=0

    //FOR DEBUG//
    shadowroot.id='shadowroot';
    DEBUGtwin&&document.lastChild.appendChild(shadowroot); //useful to visualize what's happening
    DEBUG&&console.log('SERVER',root.innerHTML);
    DEBUG&&console.log('CLIENT',shadowroot.innerHTML);
    DEBUG&&console.log('DIFF', root.innerHTML===shadowroot.innerHTML?'OK':'ERROR DIFF!');
    /////////////
    if(DEGUGnohydra) return;
    //START HYDRATION
    await hydrateTree(root,shadowroot);

  }
//////////////////////////////////////////////////


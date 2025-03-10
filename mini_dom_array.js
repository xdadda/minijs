////////// DOM ARRAYS ////////////////////////////
  //BASED ON https://github.com/WebReflection/udomdiff
  export {diffArrays};
  import {renderClient} from './mini_dom.js';
  import {html} from './mini_html.js';
  import {updateFragment,clearFragment} from './mini_dom_fragments.js';


  function insertHTML(item,parent,node,owner){
    //console.log('insertHTML')
    const t = document.createComment('');
    parent.parent.insertBefore(t,node);

    const newid=parseInt(Object.keys(owner).slice(-1)[0])+1
    let mystack={[newid]:{}};
    owner[newid]=mystack;
    const frag = renderClient(t,item,mystack);
    if(frag.prev) frag.prev.nextElementSibling.myid=newid;
    //console.log('insertHTML',frag,owner)
    return t;
  }

  function replaceHTML(item,node,owner,){

    const newid=parseInt(Object.keys(owner).slice(-1)[0])+1
    let mystack={[newid]:{}};
    owner[newid]=mystack;
    const frag = renderClient(node,item,mystack);
    if(frag.prev)  frag.prev.nextElementSibling.myid=newid;
    //console.log('replaceHTML',frag,owner)
    return frag[0];
  }

      function _flatten(o) { 
          return [].concat(...Object.keys(o)
            .map(k => typeof o[k] === 'object' ? _flatten(o[k]) : (o[k]))
          );
        };

  function unmountFrag(myid,mystack){
    //console.log('unmountFrag',myid,mystack,mystack[myid])
    let unmountlist;
    if(myid) {
      if(!mystack[myid]) return
      unmountlist = _flatten(mystack[myid]);
      if(unmountlist.length) {
        unmountlist.reverse().forEach(f=>(typeof f==='function'&&f()));
      } 
      delete mystack[myid];
    }
    else{
      let firstid=parseInt(Object.keys(mystack)[0])
      let firstobj = mystack[firstid]
      unmountlist = _flatten(mystack);
      if(unmountlist.length) {
        unmountlist.reverse().forEach(f=>(typeof f==='function'&&f()));
      } 
      Object.keys(mystack).forEach((e,i)=>{if(i>0) delete mystack[e] })
    }
    return mystack
  }

  const DEBUGarr = false;
  const DEBUGbmk = false;
  //modified version of https://github.com/WebReflection/udomdiff/blob/main/esm/index.js
  function diffArrays(frag,a=[],b=[],fn,owner) { //a = old, b=new
    //console.log('diffArrays',owner)
    let stime = DEBUGbmk&&Date.now();
    updateFragment(frag);
    DEBUGarr && console.log('diffArrays',frag,a,b);
    let before = frag.next;
    let parent = frag.parent;
    let aStart=0, aEnd=a?.length;
    let bStart=0, bEnd=b?.length, bLength=bEnd;
    let map=null, temp= new Array(bLength), tempidx=false;
    let mapped=frag;

    //console.log('diffArrays',owner)
    /*
    const newid=parseInt(Object.keys(owner).slice(-1)[0])+1
    console.log('diffArrays',newid,Object.keys(owner).length)
    let mystack={[newid]:{}};
    owner[newid]=mystack;
    */
    //let mystack=owner;

    
    // fast path for empty array
    if(bLength=== 0) {
      DEBUGarr && console.log('fast empty',(Date.now()-stime)+'ms');
      clearFragment(frag);
      unmountFrag(null,owner);
      DEBUGbmk&&console.log('diffArrays',Date.now()-stime+'ms');
      return;
    }
    

    while (aStart < aEnd || bStart < bEnd) {
      // fast path: append head, tail, or nodes in between
      if(aEnd===aStart) {
        //console.log('append',aEnd,aStart,bStart,bEnd,temp)
        const node = bEnd < bLength ?
          (bStart ?
            temp[bStart-1].nextSibling :
            temp[bEnd] ) : //temp[bEnd-bStart] ) :
          before;

        while (bStart < bEnd) {
          if(temp && temp[bStart]) {
            DEBUGarr && console.log('move FAST');
            parent.insertBefore(temp[bStart], node);
          }
          else {
            DEBUGarr && console.log('insert FAST');
            temp[bStart]= insertHTML(()=>fn(b[bStart]), frag, node, owner);
          }
          bStart++;
        }
      }
      // fast path: remove head or tail
      else if (bEnd === bStart) {
        while (aStart < aEnd) {
          // remove the node only if it's unknown or not live
          if (!map || !map.has(a[aStart])) {
            DEBUGarr && console.log('remove FAST');
            unmountFrag(mapped[aStart].myid,owner);
            parent.removeChild(mapped[aStart]);
          }
          aStart++;
        }
      }
      //fast path: skip prefix
      else if (a[aStart] === b[bStart]) {
        temp[bStart]=mapped[aStart];
        aStart++;
        bStart++;
        DEBUGarr && console.log('skip prefix');
      }
      //fast path: skip suffix
      else if (a[aEnd - 1] === b[bEnd - 1]) {
        temp[bEnd-1]=mapped[aEnd-1];
        aEnd--;
        bEnd--;
        DEBUGarr && console.log('skip suffix');
      }
      //fast path: reverse swap
      else if (
        a[aStart] === b[bEnd - 1] &&
        b[bStart] === a[aEnd - 1]
      ) {
        DEBUGarr && console.log('swap FAST');
        const node = mapped[--aEnd].nextSibling;
        const prev = mapped[aStart++].nextSibling;
        parent.insertBefore(mapped[bStart++],node);
        parent.insertBefore(mapped[aEnd],prev);
        bEnd--;
        a[aEnd] = b[bEnd];
      }
      // map based fallback, "slow" path
      else {

        //create a map of new items indexes
        if (!map) {
          map = new Map;
          let i = bStart;
          while (i < bEnd)
            map.set(b[i], i++);
        }
        //create map of existing items in new locations
        let reusingNodes = bStart + bLength - bEnd;
        if(!tempidx) {
          let i = aStart;
          while (i < aEnd) {
            const index = map.get(a[i]);
            if(index!==undefined) {
              temp[index]=mapped[i];
              reusingNodes++;
            }
            i++;
          }
          tempidx=true;

          //fast path: full replace
          if(!reusingNodes) {
            //parent.textContent='' //clear parent
            clearFragment(frag);
            unmountFrag(null,owner);
            return diffArrays(frag,[],b,fn,owner);
          }
        }


        // if it's a future node, hence it needs some handling
        if (map.has(a[aStart])) {
          const index = map.get(a[aStart]);
          // if node is not already processed, look on demand for the next LCS
          if (bStart < index && index < bEnd) {
            // counts the amount of nodes that are the same in the future
            let i = aStart;
            let sequence = 1;
            while (++i < aEnd && i < bEnd && map.get(a[i]) === (index + sequence))
              sequence++;
            if (sequence > (index - bStart)) {
              const node = mapped[aStart];
              while (bStart < index) {              
                if(temp && temp[bStart]) {
                  DEBUGarr && console.log('move LCS');
                  parent.insertBefore(temp[bStart], node);
                }
                else {
                  DEBUGarr && console.log('insert LCS');
                  temp[bStart]= insertHTML(()=>fn(b[bStart]), frag, node, owner);
                }
                bStart++;
              }
            }
            else {
              if(temp && temp[bStart]) {
                DEBUGarr && console.log('swap');
                parent.replaceChild(temp[bStart],mapped[aStart]);
              }
              else {
                DEBUGarr && console.log('insert');
                temp[bStart]= replaceHTML(()=>fn(b[bStart]), mapped[aStart],owner);
              }
              aStart++;
              bStart++;
            }
          } 
          else 
            aStart++;
        }
        else {
          DEBUGarr && console.log('remove');
          unmountFrag(mapped[aStart].myid,owner);
          parent.removeChild(mapped[aStart++]);
        }

      }
    }
    DEBUGbmk && console.log('diffArrays',Date.now()-stime+'ms');
  }

//////////////////////////////////////////////////


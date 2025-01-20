const DEGUGhyd=false

export {hydrateTree, hydrateAsyncTree}

import {createFragment, updateFragment, extractFragmentFromDom} from './mini_dom_fragments.js'
import {renderAttribute} from './mini_dom.js'



////////// HYDRATE ///////////////////////////////

  let asyncHydrates=[]

  async function hydrateTree(oldnode, newnode, _newfrag=false, idx=false){
    
      if(!newnode || !oldnode) return null // SERVER COMPONENT
      DEGUGhyd&&console.log('TREE',oldnode,newnode)

      //HYDRATE REACTIVE ATTRIBUTES
      if(newnode.reactattr?.length &&oldnode.data!=='cx'){
        DEGUGhyd&&console.log('hydrate ATTR',oldnode, newnode,newnode.reactattr)
        while(newnode.reactattr.length){
          const r=newnode.reactattr.pop()
          const {type,key,v} = r
          if(type===':') {
            renderAttribute(oldnode,key,v)
          }
          else if(type==='@') {
            oldnode.addEventListener(key.toLowerCase(), v, key==='onwheel'?{ passive: false }:{})
          }
          else console.error('MiNi: unknown special attr',type,i)
        }
      }

      //CLIENT ONLY COMPONENT
      if(oldnode.nodeType===8&&oldnode.data==='cx') { //SSR tells us it's a CLIENT ONLY COMPONENT //oldnode.tagName==='CX'
        //ASYNC CLIENT ONLY
        if(newnode.nodeType===8&&newnode.data.startsWith('rx')){ //newnode.tagName==='RX
          DEGUGhyd&&console.log('CX ASYNC',oldnode,newnode,'PUSH ASYNC')
          const oldfrag=createFragment(oldnode)
          const newfrag=createFragment(newnode)
          asyncHydrates.push({oldfrag,newfrag})
        }
        //SYNC CLIENT ONLY
        else if(newnode.nodeType!==8 || (newnode.nodeType===8&&!newnode.data.startsWith('cx'))){ //newnode.tagName!=='CX'
          if(newnode.nodeType===8&&newnode.data==='awaiting') return
          //CLIENT ELEMENT READY TO BE TRANSFERRED TO DOM
          DEGUGhyd&&console.log('CX SYNC',oldnode,newnode)
          const newfrag=extractFragmentFromDom(newnode)
          const t=document.createComment('awaiting')
          for(let i=0;i<newfrag.length;i++) {
            const y = t.cloneNode(true)
            newnode.after(y)
            if(_newfrag) _newfrag.splice(idx+1,0,y) //insert filler in array
          }
          oldnode.replaceWith(...newfrag)
        }
        else console.error('MiNi: unknown CX hydration case',oldnode,newnode)
      }
      
      //SYNC SERVER ONLY COMPONENT
      else if(newnode.nodeType===8&&newnode.data==='cx'){ //newnode.tagName==='CX'
        DEGUGhyd&&console.log('SERVER SYNC',oldnode,newnode)
        const oldfrag=extractFragmentFromDom(oldnode)

        const x = document.createComment('awaiting')
        for(let i=0;i<oldfrag.length-1;i++) {
          const t = x.cloneNode(true)
          newnode.after(t)
          if(_newfrag) _newfrag.splice(idx+1,0,t) //insert filler in array
        }
      }

      //ASYNC COMPONENT (SERVER ONLY OR SSR)
      else if(newnode.nodeType===8&&newnode.data.startsWith('rx')) {  //(newnode.tagName==='RX') {
        if(oldnode.nodeType===8&&oldnode.data.startsWith('rx')){ //(oldnode.tagName==='RX'){
          DEGUGhyd&&console.log('RX wait',oldnode,newnode,'PUSH ASYNC')
          const oldfrag=createFragment(oldnode)
          const newfrag=createFragment(newnode)
          asyncHydrates.push({oldfrag,newfrag})
        }
        else {
          //SERVER DATA ALREADY IN DOM, CLIENT IS STILL WAITING
          DEGUGhyd&&console.log('RX already in DOM',oldnode,newnode)
          const oldfrag=extractFragmentFromDom(oldnode)
          const newfrag=createFragment(newnode)

          const x = document.createComment('awaiting')
          for(let i=0;i<oldfrag.length-1;i++) {
            const t = x.cloneNode(true)
            newnode.after(t)
            if(_newfrag) _newfrag.splice(idx+1,0,t) //insert filler in array
          }
          asyncHydrates.push({oldfrag,newfrag})
        }
      }

      
      else if(oldnode.nodeType===8 && oldnode.data.startsWith('lx') 
        && newnode.nodeType===8 && newnode.data.startsWith('lx')){

        DEGUGhyd&&console.log('HYDRATE LOADER',oldnode,oldnode.nextSibling,newnode,newnode.nextSibling)

        if(oldnode.nextSibling.data?.startsWith('lx') && !newnode.nextSibling.data?.startsWith('lx') ){
            //SERVER HAS ALREADY HIDDEN THE LOADER (es. async func with 0 delay)
            const newfrag=extractFragmentFromDom(newnode.nextSibling)
            DEGUGhyd&&console.log('REMOVE CSR LOADER',oldnode,newnode,newnode.nextSibling.data,newfrag)
            let oxt=oldnode.nextSibling, nxt=newfrag.prev.nextSibling
            while(nxt!==newfrag.next){
              //console.log('remove',nxt)
              nxt.remove()
              nxt=newfrag.prev.nextSibling
              if(_newfrag) _newfrag.splice(idx+1,1)
            }
        }
        //CX LOADER
        else if(!oldnode.nextSibling.data?.startsWith('lx') && newnode.nextSibling.data?.startsWith('lx') ){
            DEGUGhyd&&console.log('CX LOADER ALREADY HIDDEN')
            const lx = oldnode
            while(lx.nextSibling.data!==lx.data){
              lx.nextSibling.remove()
              //if(_newfrag) _newfrag.splice(idx+1,1)
            }
        }

        //HYDRATE LX!
        newnode.after(document.createComment(oldnode.data))
        oldnode.replaceWith(newnode)

/*
        else if(!oldnode.nextSibling.data?.startsWith('lx') && !newnode.nextSibling.data?.startsWith('lx')) {
          //BOTH LOADERS ARE PRESENT ... SWAP
          const oldfrag=extractFragmentFromDom(oldnode.nextSibling)
          const newfrag=extractFragmentFromDom(newnode.nextSibling)
          console.log('SWAP LOADERS',oldfrag,newfrag)
          for(let o of oldfrag){
            newfrag.next.before(o)
          }
          for(let n of newfrag){
            oldfrag.next.before(n)
          }
            //HYDRATE FIRST LX!
            newnode.after(document.createComment(oldnode.data))
            oldnode.replaceWith(newnode)

          oldfrag.next.before(newfrag.next)
          oldfrag.next=newfrag.next
        }
        else {
          console.log('TODO LOADER HANDLING')
        }
*/

      }



      else if(newnode.reactive) {
        DEGUGhyd&&console.log('hydrate REACTIVE',oldnode,oldnode.data,newnode,newnode.data)

        if(oldnode.outerHTML!==newnode.outerHTML && oldnode.data!=='cx') console.error(`MiNi: hydration diff:\n\nSERVER:${oldnode.outerHTML}\n\nCLIENT:${newnode.outerHTML}`)          

        if(oldnode.nodeType===8 && newnode.nodeType===8) {
          //oldnode.data=newnode.data
          if(oldnode.data.startsWith('lx')) newnode.data=oldnode.data
          else oldnode.data=newnode.data //for CX hydration
          //if(oldnode.data) newnode.data=oldnode.data      //for ASYNC hydration
          //else if(newnode.data) oldnode.data=newnode.data //for CX hydration
        }
        newnode.after(document.createComment(newnode.data||oldnode.data||''))
        oldnode.replaceWith(newnode)
      }

      else if(newnode.childNodes.length) {
        DEGUGhyd&&console.log('DEEP',oldnode, newnode)
        for(let i=0; i<newnode.childNodes.length; i++){
          const nc = newnode.childNodes[i]
          let oc = oldnode.childNodes[i]
          await hydrateTree(oc,nc)
        }
      }
      else DEGUGhyd&&console.log('SKIP',oldnode, newnode)
      
  }

  function hydrateAsyncTree(placeholder){
      //DEGUGhyd&&console.log('hydrateAsyncTree',placeholder,asyncHydrates)
      if(!asyncHydrates.length) return

      const idx = asyncHydrates.findIndex(e=>e.newfrag[0]===placeholder)
      if(idx===-1) {
        //DEGUGhyd&&console.error('MiNi: error hydrating async',placeholder,asyncHydrates)
        return
      }
      else {
        DEGUGhyd&&console.log('hydrateAsyncTree',idx,placeholder,asyncHydrates[idx])

        const {oldfrag,newfrag} = asyncHydrates[idx]
        updateFragment(oldfrag)
        updateFragment(newfrag)

        for(let i=0;i<oldfrag.length;i++) {
          //DEGUGhyd&&console.log('>>>>ASYNC_TREE',oldfrag[i],newfrag[i])
          hydrateTree(oldfrag[i],newfrag[i],newfrag,i)
        }
        asyncHydrates.splice(idx,1)
      }
    
      return
  }

//////////////////////////////////////////////////

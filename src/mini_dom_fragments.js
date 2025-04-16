export { createFragment, replaceFragments, clearFragment, refreshFragment, extractFragmentFromDom }

/////////////// FRAGMENTS ////////////////////////

  function createFragment(nodes){
      if(nodes.nodeType) { //wrap single node in frag
        let frag=[nodes];
        frag.parent=nodes.parentNode;
        frag.next=nodes.nextSibling;
        frag.prev=nodes.previousSibling;
        frag.fragment=true;
        return frag;
      }
      else if(Array.isArray(nodes) && !nodes.fragment) { //wrap array in frag
        if(!nodes[0]) return false;
        nodes[0].before(document.createTextNode(''));
        nodes[nodes.length-1].after(document.createTextNode(''));
        nodes.parent=nodes[0].parentNode;
        nodes.prev=nodes[0].previousSibling;
        nodes.next=nodes[nodes.length-1].nextSibling;
        nodes.fragment=true;
        return nodes;
      }
      else {
        console.error('MiNi: unknown input for createFragment');
        return false;
      }
  }

  function replaceFragments(oldfrag,newfrag) {
      if(oldfrag.fragment && Array.isArray(oldfrag) && Array.isArray(newfrag)){
        newfrag.prev=oldfrag.prev;
        newfrag.next=oldfrag.next;
        newfrag.parent=oldfrag.parent;
        clearFragment(oldfrag);
        
        if(newfrag.next) newfrag.next.before(...newfrag);
        else newfrag.parent.append(...newfrag);
        
        newfrag.fragment=true;
      }
      else console.error('MiNi: replaceFragments unknown input',oldfrag,newfrag);
      return newfrag;
  }

  function clearFragment(frag){
      if(!frag.prev&&!frag.next&&frag.parent) { //FASTPATH CLEAR PARENT
        frag.parent.textContent=''; //clear parent
      }
      else if(frag.prev?.nextSibling===frag.next) return frag;
      else {
        let current = frag.prev?.nextSibling || (frag.next?.parentElement?.firstChild || frag.parent?.firstChild);
        if(!current) return;
        while(current!==frag.next){
          if(!current) return console.error('MiNi: clearFragment missing node',frag);
          const nxt=current.nextSibling;
          current.remove();
          current=nxt;
        } 
      }
      if(frag.length) frag.splice(0,frag.length); //clear array
      return frag;
  }

//////////////////////////////////////////////////

  function refreshFragment(frag){
      if(!frag.prev&&!frag.next) { //FASTPATH GET PARENT CHILDNODE
        frag.splice(0,frag.length);                 //clear array
        frag.splice(0,0,...frag.parent.childNodes); //update array
      }
      else {
        let current = frag.prev?.nextSibling || frag.parent.firstChild;
        let tmparr = [];
        while(current!==frag.next){
          if(!current) return console.error('MiNi: updateFragment missing node',frag);
          const nxt=current.nextSibling;
          tmparr.push(current);
          current=nxt;
        }
        if(frag.length) frag.splice(0,frag.length); //clear array
        frag.splice(0,0,...tmparr); //update array
      }
      return frag;
  }

  function extractFragmentFromDom(node){
      const id = node.previousSibling?.textContent;
      if(!id) return console.error('MiNi: node is not a fragment',node);
      let frag = [], tnode = node;
      do{
        //console.log('extract>>>',id,tnode, tnode.textContent,tnode.nextSibling)
        frag.push(tnode);
        tnode=tnode.nextSibling;
        if(!tnode) break;
      } while(!(tnode.nodeType===8&&tnode.textContent===id));
      frag=createFragment(frag);
      return frag;
  }

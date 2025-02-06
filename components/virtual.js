import { html, reactive, onMount, onUnmount } from 'mini'

  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }


//note parentElement need to have a specific height
export function virtual({
        renderItem,       //(idx)=>{..}
        itemCount,        //# of items
        rowHeight,        //in pixels
        nodePadding,      //number of "padding" items
        onUpdate=false,   //triggered when virtual list is updated
        parentHeight=0,   //in pixels (for SSR) TODO: fix a clearFragment error in mini_dom if this is set
      }){


        let _prev_startN
          function updateScroll(){
            const _startN =  Math.max(0,Math.floor(container.scrollTop / rowHeight) - nodePadding);
            const viewportHeight= container.offsetHeight
            startNode.value = _startN;
            actualNode.value = Math.floor(container.scrollTop / rowHeight)
            offsetY.value = _startN * rowHeight;
            visibleNodesCount = Math.ceil(viewportHeight / rowHeight) + 2 * nodePadding;
            visibleNodesCount = Math.min(itemCount - _startN, visibleNodesCount);
            //if(visibleChildren.value.length!==visibleNodesCount) visibleChildren.value= new Array(visibleNodesCount).fill(null)
            if(_prev_startN!==_startN) visibleChildren.value= new Array(visibleNodesCount).fill(null).map((_, index) => index+_startN)
            _prev_startN=_startN
          }

          function _eventListenerFn(){
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(updateScroll);            
          }

        const virtualid=uuidv4();
        let animationFrame, container;
        const totalContentHeight = itemCount * rowHeight + 'px';
        console.log('setup VirtualScroll',itemCount,totalContentHeight)
        const offsetY=reactive(0)
        let visibleNodesCount = Math.ceil(parentHeight / rowHeight); // + 2 * nodePadding not needed for SSR
        visibleNodesCount = Math.min(itemCount, visibleNodesCount);
        //console.log('visibleNodesCount',visibleNodesCount)
        let visibleChildren=reactive(new Array(visibleNodesCount).fill(null))
        let startNode = reactive(0)
        let actualNode = reactive(0)

        if(onUpdate) {
          reactive(()=>{
            //trigger when rows change
            const y=actualNode.value
            if(onUpdate) onUpdate(y)
          },{effect:true})          
        }

        onMount(()=>{
          const el = document.getElementById(virtualid)
          if(!el) return
          container=el.parentElement
          if(container.style.overflowY!=='auto') container.style.overflowY='auto'
          container.addEventListener("scroll", _eventListenerFn);
          updateScroll()
        })

        onUnmount(()=>{
          //console.log('unmount VirtualScroll')
          container?.removeEventListener("scroll", _eventListenerFn);
        })

        return html`
            <div id="${virtualid}" aria-role="listbox"
              style="height:${totalContentHeight};overflow: hidden;position: relative; will-change: transform;"
            >
              <div
                class="result-list" tabindex="0"
                :style="${()=>`transform: translateY(${offsetY.value}px);`}"
              >
                ${{
                  $array:visibleChildren,
                  $item:renderItem
                }}

              </div>
            </div>
          `
}


/*
                ${()=>visibleChildren?.value.map((_, index) => renderItem(index + startNode.value))}
*/



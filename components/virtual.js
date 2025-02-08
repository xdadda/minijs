import { html, reactive, onMount, onUnmount, untrack } from 'mini'

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
        onUpdateRow=false,   //triggered when virtual list is updated
        onUpdateScroll=false,   //triggered when virtual list is updated
        parentHeight=0,   //in pixels (for SSR) TODO: fix a clearFragment error in mini_dom if this is set
      }){

        const virtualid=uuidv4();
        let animationFrame, container;
        let _prev_startN, _itemCount;

        const offsetY=reactive(0)
        const scrollY=reactive(0)
        const actualRow = reactive(0)
        const visibleChildren = reactive([])

        if(itemCount.signal) _itemCount=itemCount;
        else if(typeof itemCount==='function') _itemCount=reactive(itemCount);
        else _itemCount={value:itemCount};

        //console.log('VIRTUAL',_itemCount.value)

          function updateScroll(){
            const _startN =  Math.max(0,Math.floor(container.scrollTop / rowHeight) - nodePadding);
            const viewportHeight= container.offsetHeight;
            visibleNodesCount = Math.ceil(viewportHeight / rowHeight) + 2 * nodePadding;
            visibleNodesCount = Math.min(_itemCount.value - _startN, visibleNodesCount);

            actualRow.value = Math.floor(container.scrollTop / rowHeight);
            offsetY.value = _startN * rowHeight;
            scrollY.value = container.scrollTop;

            if(_prev_startN!==_startN) visibleChildren.value= new Array(visibleNodesCount).fill(null).map((_, index) => index+_startN);
            _prev_startN=_startN;
          }

          function _eventListenerFn(){
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(updateScroll);            
          }

        const totalContentHeight = _itemCount.value * rowHeight + 'px';
        let visibleNodesCount = Math.ceil(parentHeight / rowHeight); // + 2 * nodePadding not needed for SSR
        visibleNodesCount = Math.min(_itemCount.value, visibleNodesCount);
        visibleChildren.value=new Array(visibleNodesCount).fill(null)

        if(onUpdateRow) {
          reactive(()=>{
            const y=actualRow.value
            if(onUpdateRow) onUpdateRow(y)
          },{effect:true})          
        }
        if(onUpdateScroll) {
          reactive(()=>{
            const y=scrollY.value

            if(onUpdateScroll) onUpdateScroll(y)
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



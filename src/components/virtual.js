import { html, reactive, onMount, onUnmount, map } from 'mini'


//note parentElement need to have a specific height
export function virtual({
        renderItem,       //(idx)=>{..}
        itemCount,        //# of items (can be a number, signal of function)
        rowHeight,        //in pixels
        nodePadding,      //number of "padding" items
        onUpdateRow,      //triggered when virtual list is updated
        onUpdateScroll,   //triggered when virtual list is updated
        onMounted,
      }){

        const virtualid=reactive(); //=reactive(uuidv4()); //needs to be a signal for hydration
        let animationFrame, container;
        let _prev_startN, _itemCount;

        const visibleChildren = reactive([])

        if(itemCount.signal) _itemCount=itemCount;
        else if(typeof itemCount==='function') _itemCount=reactive(itemCount);
        else _itemCount={value:itemCount};

          function updateScroll(){
            const _startN =  Math.max(0,Math.floor(container.scrollTop / rowHeight) - nodePadding);
            const viewportHeight= container.offsetHeight;
            let visibleNodesCount = Math.ceil(viewportHeight / rowHeight) + 2 * nodePadding;
            visibleNodesCount = Math.min(_itemCount.value - _startN, visibleNodesCount);

            const firstrow = Math.floor(container.scrollTop / rowHeight);
            const lastrow=(_prev_startN||0)+visibleNodesCount-1
            if(onUpdateRow) onUpdateRow(firstrow,lastrow)

            const offsetY = _startN * rowHeight;
            virtualid._value.firstElementChild.style.transform=`translateY(${offsetY}px)`
            if(onUpdateScroll) onUpdateScroll(container.scrollTop)

            if(_prev_startN===undefined || _prev_startN!==_startN) {
              _prev_startN=_startN;
              visibleChildren.value= new Array(visibleNodesCount||0).fill(null).map((_, index) => index+_startN);
            }
          }

          function _eventListenerFn(){
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(updateScroll);            
          }

        const totalContentHeight = _itemCount.value * rowHeight + 'px';

        onMount(()=>{
          const el = virtualid._value
          if(!el) return
          container=el.parentElement
          if(container.style.overflowY!=='auto') container.style.overflowY='auto'
          container.addEventListener("scroll", _eventListenerFn);
          updateScroll()
          if(onMounted) onMounted()

        })

        onUnmount(()=>{
          //console.log('unmount VirtualScroll')
          container?.removeEventListener("scroll", _eventListenerFn);
        })
  

        return html`
            <div :ref="${virtualid}" aria-role="listbox"
              style="height:${totalContentHeight};overflow: hidden;position: relative; will-change: transform;"
            >
              <div class="result-list" tabindex="0">
                  ${map(visibleChildren,renderItem)}
              </div>
            </div>
          `
}



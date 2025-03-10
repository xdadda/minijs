import { html, reactive, onMount, onUnmount, untrack } from 'mini'

  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }


//note parentElement need to have a specific height
export function virtual({
        renderItem,       //(idx)=>{..}
        itemCount,        //# of items (can be a number, signal of function)
        rowHeight,        //in pixels
        nodePadding,      //number of "padding" items
        onUpdateRow=false,   //triggered when virtual list is updated
        onUpdateScroll=false,   //triggered when virtual list is updated
        onMounted=false,
        parentHeight=0,   //in pixels (for SSR) TODO: fix a clearFragment error in mini_dom if this is set
        //refresh=false
      }){

        const virtualid=reactive(uuidv4()); //needs to be a signal for hydration
        let animationFrame, container;
        let _prev_startN, _itemCount;

        //let offsetY=0
        //const offsetY=reactive(0)
        //const scrollY=reactive(0)
        //const actualRow = reactive(0)
        const visibleChildren = reactive([])

        if(itemCount.signal) _itemCount=itemCount;
        else if(typeof itemCount==='function') _itemCount=reactive(itemCount);
        else _itemCount={value:itemCount};

        /*
        let _refresh;
        if(refresh.signal) _refresh=refresh;
        else if(typeof refresh==='function') _refresh=reactive(refresh);
        else _refresh={value:refresh};
        */
        //console.log('VIRTUAL')

          function updateScroll(){
            const _startN =  Math.max(0,Math.floor(container.scrollTop / rowHeight) - nodePadding);
            const viewportHeight= container.offsetHeight;
            visibleNodesCount = Math.ceil(viewportHeight / rowHeight) + 2 * nodePadding;
            visibleNodesCount = Math.min(_itemCount.value - _startN, visibleNodesCount);

            
            const firstrow = Math.floor(container.scrollTop / rowHeight);
            const lastrow=_prev_startN+visibleNodesCount-1
            if(onUpdateRow) onUpdateRow(firstrow,lastrow)

            //offsetY.value = _startN * rowHeight;
            const offsetY = _startN * rowHeight;
            document.getElementById(virtualid._value).firstElementChild.style.transform=`translateY(${offsetY}px)`
            //console.log('updateScroll',offsetY,container.scrollTop)
            if(onUpdateScroll) onUpdateScroll(container.scrollTop)
            //scrollY.value = container.scrollTop;


            if(_prev_startN!==_startN) {
              _prev_startN=_startN;
              visibleChildren.value= new Array(visibleNodesCount||0).fill(null).map((_, index) => index+_startN);
            }
          }

          function _eventListenerFn(){
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = requestAnimationFrame(updateScroll);            
          }

        const totalContentHeight = _itemCount.value * rowHeight + 'px';
        let visibleNodesCount = Math.ceil(parentHeight / rowHeight); // + 2 * nodePadding not needed for SSR
        visibleNodesCount = Math.min(_itemCount.value, visibleNodesCount);
        visibleChildren.value=new Array(visibleNodesCount||0).fill(null)


        onMount(()=>{
          const el = document.getElementById(virtualid._value)
          console.log('mount VirtualScroll',virtualid._value,el)
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
            <div :id="${()=>virtualid.value}" aria-role="listbox"
              style="height:${totalContentHeight};overflow: hidden;position: relative; will-change: transform;"
            >
              <div class="result-list" tabindex="0">
                  ${{
                    $array:visibleChildren,
                    $item:renderItem
                  }}


              </div>
            </div>
          `
}



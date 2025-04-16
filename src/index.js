'strict'
import { html } from './mini_html.js';
export { reactive, untrack } from './mini_dom_signal.js';
export { html }

export { render, onMount, onUnmount, map } from './mini_dom.js';


////////// SUSPENSE //////////////////////////////
/*
  Note: ideally use Suspense only for lazy chunk loading
      const Test = lazy(() => import('./test.js'));
      ...code here...
      return html`...${ Suspense( ()=>Test({...}), ()=>html`loading...` ) }... `

  Beta: Suspense for async components ... [it works, but it's not reliable with onMount/ onUnmount ]
*/

  export function Suspense(componentFn,loaderFn){
      const loader = ()=>loaderFn();
      loader._loader=true;
      //const wrap = () => componentFn()
      componentFn._suspense=true;
      return html`${loader}${componentFn}`;
  }



  export function lazy(factory, mod='default'){
    return async (...args)=>{
        const fn = (await factory())[mod]
        if(!fn) return console.error(`MiNi lazy: ${factory} missing "${mod}" export`)
        return fn(...args)
      }
  }

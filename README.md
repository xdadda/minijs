# [minijs]

A lightweight (3.3kB minified/gzipped) javascript declarative reactive framework based on 
* signals (thanks to milomg https://github.com/milomg/reactively)
* tagged template literals
* granular reactivity
* sync/async components


Here's a commented example with most of MiNi features:

```js

import { render, html, reactive, onMount, onUnmount } from 'mini'

///// component
function App(){

  const appname='mini'

  //// signals
  const myref = reactive()
  const counter = reactive(0)
  const double = reactive(() => counter.value*2)
  const array = reactive(() => new Array(Math.max(0,counter.value)).fill(null))
  //// effects
  reactive(() => {
    console.log('EFFECT',counter.value, double.value)
  }, {effect:true})
  /////////////////////////////////////////////

  //// component's lifecycle
  onMount(()=>{console.log('APP mounted',myref.value)})
  onUnmount(()=>{console.log('APP unmounted')})
  /////////////////////////////////////////////

  //// event functions
  function handleInc(e){
    //// use signal.value to read/get and write/set
    counter.value = counter.value + 1
  }
  const handleDec = () => counter.value--

  //// mini's tagged template literals function
  return html`

    /* Note: comments wrapped like this will be ignored */

    /* special :ref attribute to retrieve DOM elements  */
    <div :ref="${myref}">

      /* normal literal variable */
      <h3>${appname}</h3> 
      
      /* special @event handler to addEventListener to DOM elements */
      <button @click="${handleInc}"> + </button>
      <button @click="${handleDec}"> - </button>

      <div>

        /* to enable reactivity wrap a signal read in a function */
        <div>counter: ${()=>counter.value+'#'}</div>

        /* for reactive attributes add : and a signal read wrapped in a function */
        /* please remember to ALWAYS put quotation marks "" around the function  */
        <div :style="${()=>'background:'+(counter.value>3 ? 'yellow' : 'aqua')}"> 
          double: ${ ()=>double.value }
        </div>
      
        /* to show/hide a DOM tree or a component just use logical && or          */
        /* a conditional (ternary) operator ?: ... and wrap signal in a function  */
        <div> ${() => counter.value>3 && html`<span>counter is above 3</span>`} </div>

        /* arrays' maps are also supported */
        /* static arrays */
        <ul>
          ${[1,2,3].map(value => html`<li>${value}</li>`)}
        </ul>
        /* reactive arrays ... as usual remember to wrap in a function ()=>{} */
        <ul>
          ${()=>array.value.map((v,idx) => html`<li>${idx+1}</li>`)}
        </ul>
 
      </div>
    </div>
  `

}

render(document.getElementById('root'),App)

```

For further documentation and a playground link: TBD
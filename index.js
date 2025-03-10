//////
// IMPORTANT
//    - SSR: use module async in html: <script type="module" async src="/src/main.js"></script> to allow for instant partial hydration!
//    - onMount/onUnmount should be placed at the very beginning of the async component, well before any await function (e.g. fetching data)
//      (this can be solved if/when asyncontext in browser will be available)

// TODO: 
//      SSR: error handling
//      CACHING API request
//      seperate mini library from ssr framework (serverfetch)?!
//
"use strict";
export { html } from './mini_html.js';

import { reactive as rC, untrack as uC } from './mini_dom_signal.js';
import { reactive as rS, untrack as uS } from './mini_server_signal.js';

const isServer=typeof window == "undefined"; //import.meta.env.SSR;
const isSSR = isServer || !!window._ctx_;
const reactive=/* #__PURE__ */isServer?rS:rC;
const untrack=/* #__PURE__ */isServer?uS:uC;
export { reactive, untrack, isServer, isSSR };

import {onMount as omC, onUnmount as ouC} from './mini_dom.js';
const onMount=/* #__PURE__ */isServer?()=>{}:omC;
const onUnmount=/* #__PURE__ */isServer?()=>{}:ouC;
export { onMount, onUnmount };

export { serverFetch, Suspense } from './mini_utils.js';
export { render, hydrate, renderClient } from './mini_dom.js';

export {serverState} from './mini_server_ctx.js';

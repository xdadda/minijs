"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const s=require("mini");function w(){return"10000000-1000-4000-8000-100000000000".replace(/[018]/g,r=>(+r^crypto.getRandomValues(new Uint8Array(1))[0]&15>>+r/4).toString(16))}function C({content:r,buttons:l,onCancel:o,onClose:u,type:d,placeholder:c="",width:i}){const e=w();function a(t){t.preventDefault(),t.stopPropagation(),o(document.getElementById(e))}function n(t){if(t.preventDefault(),t.stopPropagation(),u)return u(document.getElementById(e),document.getElementById("_in"+e).value)}function m(t,v){t.preventDefault(),t.stopPropagation(),v(document.getElementById(e),document.getElementById("_in"+e)?.value)}function f(t){t.key==="Escape"?a(t):t.key==="Enter"&&n(t)}return onMount(()=>{d==="prompt"?setTimeout(()=>{document.getElementById("_in"+e)?.focus()},10):l&&setTimeout(()=>{document.getElementById("_btn"+e)?.focus()},10)}),s.html`<div id="${e}" aria-busy="true" class="alert" @click="${a}"><div class="alert-message" @click="${t=>t.stopPropagation()}" @keyup="${f}"><div class="msg" style="${i?"width:"+i+"px;":""}">${r} ${d==="prompt"&&`<br/><input type='text' id='_in${e}' @keyup="${f}" placeholder="${c||""}"/>`}</div><div>${l?.map((t,v)=>()=>s.html`<button id="${t.focus?"_btn"+e:""}" @click="${y=>m(y,t.onClick)}" tabindex="${v+1}">${t.label}</button>`)}</div></div></div>`}async function x(r,l,o){return await new Promise((u,d)=>{const c=document.body.querySelector("div"),i=document.createElement("div");c.appendChild(i);function e(n,m){n.parentElement.remove(),u(m)}function a(n){n.parentElement.remove(),u(!1)}s.render(i,()=>C({content:r,buttons:[{label:"Cancel",onClick:a},{label:"OK",onClick:e,focus:!0}],onClose:e,onCancel:a,type:"prompt",placeholder:o,width:l}))})}async function M(r,l){return await new Promise((o,u)=>{const d=document.body.querySelector("div"),c=document.createElement("div");d.appendChild(c);function i(a){a.parentElement.remove(),o(!0)}function e(a){a.parentElement.remove(),o(!1)}s.render(c,()=>C({content:r,buttons:[{label:"Cancel",onClick:e},{label:"OK",onClick:i,focus:!0}],onCancel:e,type:"confirm",width:l}))})}async function B(r,l){return await new Promise((o,u)=>{const d=document.body.querySelector("div"),c=document.createElement("div");d.appendChild(c);function i(e){e.parentElement.remove(),o(!1)}s.render(c,()=>C({content:r,buttons:[{label:"OK",onClick:i,focus:!0}],onCancel:i,type:"alert",width:l}))})}function I({renderItem:r,itemCount:l,rowHeight:o,nodePadding:u,onUpdateRow:d,onUpdateScroll:c,onMounted:i}){const e=s.reactive();let a,n,m,f;const t=s.reactive([]);l.signal?f=l:typeof l=="function"?f=s.reactive(l):f={value:l};function v(){const p=Math.max(0,Math.floor(n.scrollTop/o)-u),E=n.offsetHeight;let h=Math.ceil(E/o)+2*u;h=Math.min(f.value-p,h);const g=Math.floor(n.scrollTop/o),$=(m||0)+h-1;d&&d(g,$);const _=p*o;e._value.firstElementChild.style.transform=`translateY(${_}px)`,c&&c(n.scrollTop),(m===void 0||m!==p)&&(m=p,t.value=new Array(h||0).fill(null).map((P,k)=>k+p))}function y(){a&&cancelAnimationFrame(a),a=requestAnimationFrame(v)}const b=f.value*o+"px";return s.onMount(()=>{const p=e._value;p&&(n=p.parentElement,n.style.overflowY!=="auto"&&(n.style.overflowY="auto"),n.addEventListener("scroll",y),v(),i&&i())}),s.onUnmount(()=>{n?.removeEventListener("scroll",y)}),s.html`<div :ref="${e}" aria-role="listbox" style="height:${b};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${s.map(t,r)}</div></div>`}exports.alert=B;exports.confirm=M;exports.prompt=x;exports.virtual=I;

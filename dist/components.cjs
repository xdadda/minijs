"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const s=require("mini");function M(){return"10000000-1000-4000-8000-100000000000".replace(/[018]/g,r=>(+r^crypto.getRandomValues(new Uint8Array(1))[0]&15>>+r/4).toString(16))}function C({content:r,buttons:l,onCancel:n,onClose:u,type:d,placeholder:c="",width:o}){const t=M();function a(e){e.preventDefault(),e.stopPropagation(),n(document.getElementById(t))}function f(e){if(e.preventDefault(),e.stopPropagation(),u)return u(document.getElementById(t),document.getElementById("_in"+t).value)}function i(e,v){e.preventDefault(),e.stopPropagation(),v(document.getElementById(t),document.getElementById("_in"+t)?.value)}function y(e){e.key==="Escape"?a(e):e.key==="Enter"&&f(e)}return d==="prompt"?setTimeout(()=>{document.getElementById("_in"+t)?.focus()},10):l&&setTimeout(()=>{document.getElementById("_btn"+t)?.focus()},10),s.html`<div id="${t}" aria-busy="true" class="alert" @click="${a}"><div class="alert-message" @click="${e=>e.stopPropagation()}" @keyup="${y}"><br><div class="msg" style="${o?"width:"+o+"px;":""}">${r} ${d==="prompt"&&`<br/><input type='text' id='_in${t}' @keyup="${y}" placeholder="${c||""}"/>`}</div><br><div>${l?.map((e,v)=>()=>s.html`<button id="${e.focus?"_btn"+t:""}" class="${e.focus?"_btnfocus":""}" @click="${h=>i(h,e.onClick)}" tabindex="${v+1}">${e.label}</button>`)}</div></div></div>`}async function x(r,l,n){return await new Promise((u,d)=>{const c=document.body.querySelector("div"),o=document.createElement("div");c.appendChild(o);function t(f,i){f.parentElement.remove(),u(i)}function a(f){f.parentElement.remove(),u(!1)}s.render(o,()=>C({content:r,buttons:[{label:"Cancel",onClick:a},{label:"OK",onClick:t,focus:!0}],onClose:t,onCancel:a,type:"prompt",placeholder:n,width:l}))})}async function B(r,l){return await new Promise((n,u)=>{const d=document.body.querySelector("div"),c=document.createElement("div");d.appendChild(c);function o(a){a.parentElement.remove(),n(!0)}function t(a){a.parentElement.remove(),n(!1)}s.render(c,()=>C({content:r,buttons:[{label:"Cancel",onClick:t},{label:"OK",onClick:o,focus:!0}],onCancel:t,type:"confirm",width:l}))})}async function I(r,l){return await new Promise((n,u)=>{const d=document.body.querySelector("div"),c=document.createElement("div");d.appendChild(c);function o(t){t.parentElement.remove(),n(!1)}s.render(c,()=>C({content:r,buttons:[{label:"OK",onClick:o,focus:!0}],onCancel:o,type:"alert",width:l}))})}function P({renderItem:r,itemCount:l,rowHeight:n,nodePadding:u,onUpdateRow:d=!1,onUpdateScroll:c=!1,onMounted:o=!1,parentHeight:t=0}){const a=s.reactive();let f,i,y=0,e;const v=s.reactive([]);l.signal?e=l:typeof l=="function"?e=s.reactive(l):e={value:l};function h(){const m=Math.max(0,Math.floor(i.scrollTop/n)-u),b=i.offsetHeight;p=Math.ceil(b/n)+2*u,p=Math.min(e.value-m,p);const g=Math.floor(i.scrollTop/n),_=y+p-1;d&&d(g,_);const k=m*n;a._value.firstElementChild.style.transform=`translateY(${k}px)`,c&&c(i.scrollTop),y!==m&&(y=m,v.value=new Array(p||0).fill(null).map((S,w)=>w+m))}function E(){f&&cancelAnimationFrame(f),f=requestAnimationFrame(h)}const $=e.value*n+"px";let p=Math.ceil(t/n)+2*u;return p=Math.min(e.value,p),v.value=new Array(p||0).fill(null).map((m,b)=>b),s.onMount(()=>{const m=a._value;m&&(i=m.parentElement,i.style.overflowY!=="auto"&&(i.style.overflowY="auto"),i.addEventListener("scroll",E),h(),o&&o())}),s.onUnmount(()=>{i?.removeEventListener("scroll",E)}),s.html`<div :ref="${a}" aria-role="listbox" style="height:${$};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${s.map(v,r)}</div></div>`}exports.alert=I;exports.confirm=B;exports.prompt=x;exports.virtual=P;

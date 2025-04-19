//////////////////////////////////////////////////////////////////////////////////
//
// an async and customizable implementation of window.alert()/.prompt()/.confirm()
// without using signals

import { html, render } from 'mini';
import './alerts.css';

  //using this instead of crypto.randomUUID() to be able to work not-localhost in dev mode
  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }


//@param buttons    [{id,onClick,label}] //note first button will have autofocus
//@param onCancel   (id) => callback function
//@param onClose    (id,value) => callback function
//@param type       prompt || undefined  //prompt will show an input element
function _Modal({content, buttons, onCancel, onClose, type, placeholder='',width}){
  const alertid=uuidv4();

  function handleCancel(e){
    e.preventDefault();
    e.stopPropagation();
    onCancel(document.getElementById(alertid));
  }
  function handleClose(e){
    e.preventDefault();
    e.stopPropagation();
    if(onClose) return onClose(document.getElementById(alertid),document.getElementById('_in'+alertid).value);
  }
  function handleClick(e,fn){
    e.preventDefault();
    e.stopPropagation();    
    fn(document.getElementById(alertid),document.getElementById('_in'+alertid)?.value);
  }

  function handleKey(e){
    if(e.key==="Escape") handleCancel(e);
    else if(e.key==="Enter") handleClose(e);
  }

  onMount(()=>{
    if(type==='prompt') setTimeout(()=>{document.getElementById('_in'+alertid)?.focus()},10);
    else if(buttons) setTimeout(()=>{document.getElementById('_btn'+alertid)?.focus()},10);    
  })

  return html`
    <div id="${alertid}" aria-busy="true" class='alert' @click="${handleCancel}">
      <div class='alert-message' @click="${e=>e.stopPropagation()}" @keyup="${handleKey}">
        <div class="msg" style="${width?'width:'+width+'px;':''}">
          ${content}
          ${type==='prompt' && `<br/><input type='text' id='_in${alertid}' @keyup="${handleKey}" placeholder="${placeholder||''}"/>`}
        </div>
        <div>
          ${ buttons?.map((b,i)=> ()=> html`
                <button id="${b.focus?('_btn'+alertid):''}"
                        @click="${(e)=>handleClick(e,b.onClick)}" 
                        tabindex="${i+1}"
                  >
                  ${b.label}
                </button>
          `)}
        </div>
      </div>
    </div>
  `;
}

export async function prompt(msg,width,plc){

  return await new Promise((resolve,reject) => {
    const app = document.body.querySelector('div'); //document.querySelector('.app');
    const div = document.createElement('div');
    app.appendChild(div);
    function handleClose(el,value){ el.parentElement.remove(); resolve(value) };
    function handleCancel(el){ el.parentElement.remove(); resolve(false) };
    render(div,()=>_Modal({
      content: msg,
      buttons: [
        {label:'Cancel', onClick:handleCancel },
        {label:'OK', onClick:handleClose, focus:true }
      ],
      onClose: handleClose,
      onCancel: handleCancel,
      type:'prompt',
      placeholder:plc,
      width
    }));
  });
}


export async function confirm(msg,width){

  return await new Promise((resolve,reject) => {
    const app = document.body.querySelector('div'); //document.querySelector('.app');
    const div = document.createElement('div');
    app.appendChild(div);
    function handleClose(el){ el.parentElement.remove(); resolve(true) };
    function handleCancel(el){ el.parentElement.remove(); resolve(false) };
    render(div,()=>_Modal({
      content: msg,
      buttons: [
        {label:'Cancel', onClick:handleCancel },
        {label:'OK', onClick:handleClose, focus:true }
      ],
      onCancel: handleCancel,
      type:'confirm',
      width
    }));
  });
}


export async function alert(msg,width){

  return await new Promise((resolve,reject) => {
    const app = document.body.querySelector('div'); //document.querySelector('.app');
    const div = document.createElement('div');
    app.appendChild(div);
    function handleClose(el){ el.parentElement.remove(); resolve(false) };
    render(div,()=>_Modal({
      content: msg,
      buttons: [{label:'OK', onClick:handleClose, focus:true }],
      onCancel: handleClose,
      type:'alert',
      width
    }));
  });
}
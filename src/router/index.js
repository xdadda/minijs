//// ROUTER ////////////////////////////

  /*
    Examples in page.js

     const routes = [
      { path:'/$admin', element: Admin, auth:['admin'] }, //only authenticated admins allowed
      { path:'/$login', element: Login },
      { path:'/$item/:id', element: Item },
      { path:'/$private/*', element: Misc, auth:true }, //all authenticated users
      { path:'/*', element: Public, auth:false }, //all users
    ]

    return  html`${ ()=>Router({ routes, loader:()=>html`<div>loading...</div>` }) }`

  */

  export { Router, getRoute, setRoute };
  import { reactive, Suspense, html } from '../index.js'
  import store from '../store/index.js';

  //opt {nohistory:false, replacehistory:false}
  function setRoute(url,args,opt={nohistory:false, replacehistory:true}){
    if(url!==store('$url').value) {
      if(args) store('$args',args)
      store('$url').value=url||'/';
      //default update browser history
      if(!opt.nohistory) {
        if(opt.replacehistory) window.history.pushState({}, null, url); 
        else window.history.replaceState({}, null, url); 
      }     
    }
  }

  function getRoute(){
    return store('$route');
  }


  async function Router({routes, loader=false, handleAuth}){
    if(!store('$route')) {
      //console.log('>>INIT Router<<')
      store('$url',reactive(window.location.href.replace(window.location.origin,'')))

      // INTERCEPT BROWSER BACK BUTTON in the browser
      function updateRoute(e) {
        e.preventDefault(); // stop request to server for new html
        e.stopPropagation();
        const url = window.location.href.replace(window.location.origin,'');
        setRoute(url);
      }
      window.addEventListener('popstate',  updateRoute);
    }
    
    let url = store('$url').value
    let route = getElementFromURL(decodeURIComponent(url), routes);

    let auth=true;
    if(handleAuth) {  //handleAuth should return true if ok, error url if failed (eg: /login)
      auth = await handleAuth(route);
      if(!auth) return
    }
    route.args = store('$args') || route.args || null
    store('$route',route);

    if(loader) return Suspense(()=>store('$route').element(route.args), loader);
    else return ()=>html`${()=>store('$route').element(route.args)}`;
    
  }


/////////////// ROUTER UTILS /////////////////////////////////////////////////

    function removeTrailingSlash(url) {
      if(url && url!=='/' && url.slice(-1)==='/') url=url.slice(0,-1); //no trailing /
      return url;
    }

    //parseUrlParam('/test/:id/:od','/test/22/11') --> '{"id":"12","od":"23"}'
    function parseUrlParams(str1, str2) {
      const tmp = str1.split("/")
        .map((key, idx) => [key.replace(":", ""), idx, key.charAt(0) === ":"]);
        //.filter(([,,keep]) => keep);
      const keys = tmp.filter(([,,keep]) => keep);
      const path = tmp.filter(([,,keep]) => !keep);//.map(([key]) => [key])
      const pathParts = str2.split("/");
      const entries = keys.map(([key, idx]) => [key, pathParts[idx]]);
      let ok = true;
      path.forEach(([key,idx])=> ok=ok&(key===pathParts[idx]));
      if(ok)return Object.fromEntries(entries);
      else return null;
    }

    //parseUrlWildcard('/test/*','/test/22/11') --> "/22/11"
    function parseUrlWildcard(rule, str) {
      const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
      const regex = new RegExp("^" + rule.split("*").map(escapeRegex).join("(.*)") + "$");
      const arr = str.match(regex);
      if(arr && arr[1]!==null) return '/'+arr[1];
      return null;
    }

    //this is for routes
    function getElementFromURL(_url, array) {
      return getElementFromURLandMethod(_url, null, array);
    }

    //this is for apis
    function getElementFromURLandMethod(_url, method, array) {
      let url = _url||'/';
      if(url && url!=='/' && url.slice(-1)==='/') url=url.slice(0,-1); //no trailing /  

      //extract queries
      let query = url.split('?')[1];
      if(query) {
        query = new URLSearchParams(query); 
        query = Object.fromEntries([...query]);
        url = url.split('?')[0];
      }

      const el = array?.find(e=>{
        if(method && e.method!==method) return false;
        if(e.path!=='/' && e.path.slice(-1)==='/') e.path=e.path.slice(0,-1); //no trailing /  
        if(e.path === url) return true; // simple path matching
        if(e.path.includes('*')) {
          //check if simple /xxx/ without * is present
          if(url===e.path.slice(0,-2)) e.subpath='/';
          else e.subpath = parseUrlWildcard(e.path,url);
          if(e.subpath) return true;
        }
        if(e.path.includes(':')) {
          const params = parseUrlParams(e.path,url);
          if(!params) return false;
          e.params = params; 
          return true;
        }
        return false; //throw new Error("no route for: "+url) 
      })
      if(!el) return false;
      el.url=url;
      el.query=query;
      return el;
    }
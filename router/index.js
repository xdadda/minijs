//// ROUTER ////////////////////////////

  export { Router, getRoute, setRoute, getElementFromURL};
  import { reactive, Suspense, html } from 'mini'
  import store from 'mini/store';

  function setRoute(url,nohistory=false){
    //console.log('setRoute',url,store('url'))
    const ssr=store('ssr');
    //Multi Page Application
    if(ssr && window.location.pathname!==url) window.location=url;
    //Single Page Application
    else if(!ssr && url!==store('url')) {
      store('url',url);
      console.log('history push')
      store('route').value=null; //dirty hack to trigger Router refresh
      if(!nohistory) window.history.pushState({}, null, url);
    }
  }
  function getRoute(){
    if(!store('route')) store('route',reactive());
    return store('route').value;
  }
  //ssr: true if Multi Page Application (default), false if Single Page Application
  function Router({routes,ssr=true,loader=false}){
    if(!store('route')) store('route',reactive());
    if(store('ssr')===undefined) {
      console.log('>>INIT Router<<')
      store('ssr',ssr);
      if(!ssr && !import.meta.env.SSR){
        // INTERCEPT BROWSER BACK BUTTON in the browser
        function updateRoute(e) {
          e.preventDefault(); // stop request to server for new html
          e.stopPropagation();
          const turl = window.location.href.replace(window.location.origin,'')
          console.log('back',turl)
          setRoute(turl,true)
        }
        window.addEventListener('popstate',  updateRoute);        
      }
    }
    const route = getElementFromURL(decodeURIComponent(store('url')), routes)
    store('route').value=route;
    //console.log('Router',route,loader)
    if(loader) return Suspense(store('route').value.element,loader)
    else return async()=>html`${store('route').value.element}`
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
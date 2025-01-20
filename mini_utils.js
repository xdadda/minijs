  import { html } from './mini_html.js';
  import { isServer } from './index.js'
  import { serverState } from './mini_server_ctx.js';
  export { Suspense, serverFetch };

////////// SUSPENSE //////////////////////////////
  function Suspense(componentFn,loaderFn){
      const loader = ()=>loaderFn();
      loader.loader=true;
      const wrap = async()=>componentFn();
      wrap.suspense=true;
      return ()=>html`${loader}${wrap}`;
  }
//////////////////////////////////////////////////

////////// FETCH /////////////////////////////////
  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  
  //WORKS in SSR or Server/ Client only components!! 
  //ATTENTION: put the func right at the beginning of the async component otherwise the uid may get polluted!!
  //NOTE: I know that internal server fetches is SUPER INEFFICIENT and should be avoided, 
  //      but for this PoC it allows for a clean interface and reduces chances of server code leaking
  //      It's important however to secure the api endpoint and not allow unauthenticated external client requests!

  async function serverFetch(uid,...args) {
      if(!uid) return console.error('MiNi: provide uid to serverFetch');

      if(isServer){
        //SERVER side
        const state = serverState();
        if(args[0][0]==='/') args[0]=('http://localhost:5173')+args[0];
        args[1].headers = {...args[1].headers, 'ServerUID':state?.server?.suid}; //needed to secure internal server fetches! 
        const resp = await fetcher(...args);

        if(state?.server?.write) state.server.write(`<script>__${uid}__=${JSON.stringify(resp||{})}</script>`);
        else console.error('MiNi: stream write() not accessible');
        return resp;
      } 

      else {
        //CLIENT side
        if(args[0][0]==='/') {
          // Keep trying until data is available. 
          // As the main.js is loaded async it will execute immediately, in this case client slide servefetch 
          // will often be run BEFORE the data is streamed to the browser ... so just sit tight until the data arrives!
          const ssrfetchtimeout = 1000; //ms
          let value, timeout=0, stime=Date.now();
          while(!value && timeout<ssrfetchtimeout) { 
            value = await new Promise(r => setTimeout(()=>r(window[`__${uid}__`]),10));
            timeout+=10; //ms
            if(timeout>ssrfetchtimeout) console.error('MiNi: serverFetch timeout',uid);
          }
          if(timeout>=ssrfetchtimeout) {
            value=await fetcher(...args);
          }
          return value;
        }
        else return await fetcher(...args);
      }    
  }
//////////////////////////////////////////////////


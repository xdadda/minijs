export {serverCtx, serverState, setCtx, getCtx};

////////// SERVER CTX & STATE ////////////////////

  let serverCtx=import.meta.env.SSR?new Map():null;
  let serverUID;           //will point to an AsyncLocalStorage, which will hold a session uid to retrieve serverctx from serverCtx map

  function setCtx(ctx){
    serverUID=ctx;
  }
  function getCtx(ctx){
    return serverUID;
  }

  //serverState()           get all server ctx
  //serverState(key)        get key value from ctx state
  //serverState(key,value)  set key value in ctx state
  function serverState(key,value){
    if(import.meta.env.SSR ) {
      let uid = serverUID.getStore();
      if(!uid) return console.error('MiNi: server ctx missing');
      let ctx = serverCtx.get(uid);
      if(!ctx) return console.error('MiNi: server ctx missing',uid);
      if(!ctx.state) {
        ctx.state={};
        serverCtx.set(uid,ctx);
      }
      if(key===value && value===undefined) return ctx;
      if(key && value===undefined && ctx.state) {
        const value = ctx.state[key];
        return value;
      }
      if(key && value!==undefined && ctx.state) {
        ctx.state[key]=value;
        serverCtx.set(uid,ctx);
        return value;
      }
      return null;
    }
    else return null;
  }

//////////////////////////////////////////////////


const initstate = {};
let zstore;

///////////////////////////////////////////
// to use: import store from 'mini/store'
// store()                get all store values
// store(key)             get key value from store
// store(key,value)       set key value in store
// store(key,(prev)=>{})  set key value in store (fn with old value as arg)
// store({key:value, key:value}) set keys' values in store
export default function store(...args) {

  let tstore;
    if(!zstore) {
      const session=(window._ctx_||{url:window.location.pathname});
      zstore = createStore((set) => ({...initstate,...session}));
    }
    tstore = zstore;

  if(!args || !args.length) return tstore.getState(); //get all states
  else if(args.length===1) {
    if(typeof args[0]==='string') return tstore.getState()[args[0]]; //get specific state
    else if(typeof args[0]==='object') return tstore.setState(args[0])
    else console.error('MiNi: unknown store argument')
  }
  else if(args.length===2) { //set 
    if(typeof args[0]!=='string') return console.error('MiNi: unknown store argument')
    if(typeof args[1] === 'function') {
      const t = tstore.getState()[args[0]];
      args[1]=args[1](t);
    }
    return tstore.setState({[args[0]]:args[1]});
  }
  else console.error('MiNi: store has too many arguments');
}


///////////////////////////////////////////////////////////////
/* THIS IS A MODIFIED VERSION OF VANILLA ZUSTAND (without subscribers)
   https://github.com/pmndrs/zustand/blob/main/src/vanilla.ts

GET DATA:       zstore.getState().appname
RUN METHOD:     zstore.getState().incCounter()
PARTIAL UPDATE: zstore.setState((state)=>({appname:state+'x'}))
                zstore.setState({appname:'x'})
*/

const createStoreImpl = (createState) => {
  let state;

  const setState = (partial, replace) => {
    const nextState =
      typeof partial === 'function'
        ? partial(state)
        : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state =
        (replace ?? (typeof nextState !== 'object' || nextState === null))
          ? (nextState)
          : Object.assign({}, state, nextState);
    }
  }

  const getState = () => state;
  const getInitialState = () => initialState;

  const api = { setState, getState, getInitialState };
  const initialState = (state = createState(setState, getState, api));
  return api;
}

const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl);
///////////////////////////////////////////////////////////////

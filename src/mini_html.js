export { html };
const DEBUG=false;

////////// LITERALS TEMPLATE PARSER //////////////
  function parseAttribute(string, v, reactarray, newvalues){
      //console.log('parseAttribute',string)
      let id = reactarray.length;
      let ev = /[:,@]\S*=/.exec(string); //works w/ <div style="back:sjdeu !important;" :class="${}"> not getting confused by style's : and !
      if(!ev) {console.error('MiNi: attribute is missing :@ prefix',string); return false;}
      if(ev?.length>1) {console.error('MiNi: attribute is missing "${}"',string); return false;}
      if(!string.endsWith(ev[0]+'"')) {console.error('MiNi: attribute '+ev[0]+' is missing "${}"'); return false;}
      const tag = ev[0][0];
      const key = ev[0].slice(1,-1); //remove prefix(@:) & suffix(=)
      reactarray.push({type:tag,key,v});
      const pos = string.lastIndexOf(key);
      string = (string.substring(0,pos-1)+string.substring(pos-1).replace(tag+key,key+id)); //from @key to keyid
      if(string.slice(-1)==='"') newvalues.push('');
      else newvalues.push('""');
      return string;
  }


  //parse template literal and put placehoders if functions/ signals are present
  function html(litstrings, ...values) {
      let strings = [...litstrings];
      DEBUG && console.log('html',strings,values);
      function _html(r) {
        let newvalues = [], reactarray=[];
        let id=0;
        let isAttribute=false;
        for (let i=0; i<values.length; i++) {
          const v = values[i];

          //track < and > to understand if we're handling an attribute or a tag
          const s = strings[i], open = s.lastIndexOf('<'), close=s.lastIndexOf('>');
          isAttribute = ( open!==-1 && (open > close) ) ? true : isAttribute;
          isAttribute = ( close!==-1 && (close> open) ) ? false : isAttribute;

          const id=reactarray.length;
          if(typeof v === 'function' || v instanceof Promise || v?.signal ) {
            if(!isAttribute) {              
              reactarray.push({type:'node',key:id,v});
              newvalues[i]=`<!--rx${id}-->`;
            } 
            else {
              const str=parseAttribute(strings[i], v, reactarray, newvalues);
              if(str) strings[i]=str;
              else console.error('MiNi: unknown attribute type',strings[i],v);
            }
          } 
          else if(Array.isArray(v)) {
            newvalues[i]='';
            v.forEach((item,ix)=>{
              if(typeof item === 'function') {
                reactarray.push({type:'node',key:id+':'+ix,v:item});
                newvalues[i]+=`<!--rx${id}:${ix}-->`;                
              }
              else newvalues[i]+=item
            })
          }
          else if(v===false || v===undefined){
            if(isAttribute && strings[i].slice(-1)==='"') {
              strings[i]=strings[i].replace(/\s(\S+)$/,'"'); //remove attribute if false
            }
            newvalues.push('');
          }
          else {
            newvalues.push(v);
          }
        }


          function concatLit(strings,args){
            let html=strings[0];
            for (let i=0; i<args.length;i++) {
              html+=args[i]+strings[i+1];
            }
            return html.replace(/\s+/g, ' ');
          }

        let finalhtml=concatLit(strings,newvalues);
        finalhtml=finalhtml.replace(/(?=\/\*).*?(?:\*\/)/g,''); //remove /*comments*/
        const resp = {html:finalhtml.trim(), reactarray};
        return resp;
      }
      _html.html=true;
      return _html;
  }
  
//////////////////////////////////////////////////

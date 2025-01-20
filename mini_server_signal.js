export { reactive, untrack }


////////// SIMPLE SIGNALS for 1st render on SERVER /////////
  class Reactive {
    #_value
    #fn
    #label
    #effect
    constructor(fnOrValue, effect, label) {
        if (typeof fnOrValue === "function") {
          this.fn = fnOrValue;
          this._value = undefined; //fnOrValue()
          this.effect = effect || false;
          if (effect) {
            fnOrValue();
          } //else {this._value = fnOrValue()}
        } else {
          this.fn = undefined;
          this._value = fnOrValue;
          this.effect = false;
        }
        if (label) {
          this.label = label;
        }
    }

    get value(){
      return this.get();
    }

    set value(v) {
      this.set(v);
    }

    get() { 
      if(this.fn) return this.fn();
      else return this._value;
    }
    set(fnOrValue) {
      if (typeof fnOrValue === "function") {
        const fn = fnOrValue;
        this.fn = fn;
      } else {
        if (this.fn) {
          this.fn = undefined;
        }
        const value = fnOrValue;
        if ((this._value !== value)) {
          this._value = value;
        }
      }
    }
  }


  function reactive(fnOrValue, params) {
    const node = new Reactive(fnOrValue, params?.effect, params?.label);
    node.signal=true;
    return node;
  }
  function untrack(fn){
    return fn();
  }
////////////////////////////////////////////////////////////
//REACTIVELY      SOURCE: https://github.com/milomg/reactively

  /** current capture context for identifying @reactive sources (other reactive elements) and cleanups
   * - active while evaluating a reactive function body  */
  let CurrentReaction = undefined
  let CurrentGets = null
  let CurrentGetsIndex = 0

  /** A list of non-clean 'effect' nodes that will be updated when stabilize() is called */
  let EffectQueue = []

  let stabilizeFn = undefined // fn to call if there are dirty effect nodes
  let stabilizationQueued = false // stabilizeFn() is queued to run after this event loop

  /** reactive nodes are marked dirty when their source values change TBD*/
  export const CacheClean = 0 // reactive value is valid, no need to recompute
  export const CacheCheck = 1 // reactive value might be stale, check parent nodes to decide whether to recompute
  export const CacheDirty = 2 // reactive value is invalid, parents have changed, valueneeds to be recomputed

  export function logDirty(_enable) {
    // TBD for a debug build
  }

  export function reactive(fnOrValue, params) {
    const node = new Reactive(fnOrValue, params?.effect, params?.label)
    if (params?.equals) {
      node.equals = params.equals
    }
    node.signal = true
    return node
  }

  function defaultEquality(a, b) {
    return a === b
  }

  /** A reactive element contains a mutable value that can be observed by other reactive elements.
   *
   * The property can be modified externally by calling set().
   *
   * Reactive elements may also contain a 0-ary function body that produces a new value using
   * values from other reactive elements.
   *
   * Dependencies on other elements are captured dynamically as the 'reactive' function body executes.
   *
   * The reactive function is re-evaluated when any of its dependencies change, and the result is
   * cached.
   */
  export class Reactive {
    _value;
    fn;
    observers = null // nodes that have us as sources (down links)
    sources = null // sources in reference order, not deduplicated (up links)

    state;
    effect;
    label;
    cleanups = []
    equals = defaultEquality

    constructor(fnOrValue, effect, label) {
      if (typeof fnOrValue === "function") {
        this.fn = fnOrValue
        this._value = undefined
        this.effect = effect || false
        this.state = CacheDirty
        // debugDirty && console.log("initial dirty (fn)", label);
        if (effect) {
          EffectQueue.push(this)
          stabilizeFn?.(this)
        }
      } else {
        this.fn = undefined
        this._value = fnOrValue
        this.state = CacheClean
        this.effect = false
      }
      if (label) {
        this.label = label
      }
    }

    get value() {
      return this.get()
    }

    set value(v) {
      this.set(v)
    }

    get() {
      if (CurrentReaction) {
        if (
          !CurrentGets &&
          CurrentReaction.sources &&
          CurrentReaction.sources[CurrentGetsIndex] == this
        ) {
          CurrentGetsIndex++
        } else {
          if (!CurrentGets) CurrentGets = [this]
          else CurrentGets.push(this)
        }
      }
      if (this.fn) this.updateIfNecessary()
      return this._value
    }

    set(fnOrValue) {
      if (typeof fnOrValue === "function") {
        const fn = fnOrValue
        if (fn !== this.fn) {
          this.stale(CacheDirty)
        }
        this.fn = fn
      } else {
        if (this.fn) {
          this.removeParentObservers(0)
          this.sources = null
          this.fn = undefined
        }
        const value = fnOrValue
        if (!this.equals(this._value, value)) {
          if (this.observers) {
            for (let i = 0; i < this.observers.length; i++) {
              const observer = this.observers[i]
              observer.stale(CacheDirty)
            }
          }
          this._value = value
        }
      }
    }

    stale(state) {
      if (this.state < state) {
        // If we were previously clean, then we know that we may need to update to get the new value
        if (this.state === CacheClean && this.effect) {
          EffectQueue.push(this)
          stabilizeFn?.(this)
        }

        this.state = state
        if (this.observers) {
          for (let i = 0; i < this.observers.length; i++) {
            this.observers[i].stale(CacheCheck)
          }
        }
      }
    }

    /** run the computation fn, updating the cached value */
    update() {
      const oldValue = this._value

      /* Evalute the reactive function body, dynamically capturing any other reactives used */
      const prevReaction = CurrentReaction
      const prevGets = CurrentGets
      const prevIndex = CurrentGetsIndex

      CurrentReaction = this
      CurrentGets = null // prevent TS from thinking CurrentGets is null below
      CurrentGetsIndex = 0

      try {
        if (this.cleanups.length) {
          this.cleanups.forEach(c => c(this._value))
          this.cleanups = []
        }
        this._value = this.fn()

        // if the sources have changed, update source & observer links
        if (CurrentGets) {
          // remove all old sources' .observers links to us
          this.removeParentObservers(CurrentGetsIndex)
          // update source up links
          if (this.sources && CurrentGetsIndex > 0) {
            this.sources.length = CurrentGetsIndex + CurrentGets.length
            for (let i = 0; i < CurrentGets.length; i++) {
              this.sources[CurrentGetsIndex + i] = CurrentGets[i]
            }
          } else {
            this.sources = CurrentGets
          }

          for (let i = CurrentGetsIndex; i < this.sources.length; i++) {
            // Add ourselves to the end of the parent .observers array
            const source = this.sources[i]
            if (!source.observers) {
              source.observers = [this]
            } else {
              source.observers.push(this)
            }
          }
        } else if (this.sources && CurrentGetsIndex < this.sources.length) {
          // remove all old sources' .observers links to us
          this.removeParentObservers(CurrentGetsIndex)
          this.sources.length = CurrentGetsIndex
        }
      } finally {
        CurrentGets = prevGets
        CurrentReaction = prevReaction
        CurrentGetsIndex = prevIndex
      }

      // handles diamond depenendencies if we're the parent of a diamond.
      if (!this.equals(oldValue, this._value) && this.observers) {
        // We've changed value, so mark our children as dirty so they'll reevaluate
        for (let i = 0; i < this.observers.length; i++) {
          const observer = this.observers[i]
          observer.state = CacheDirty
        }
      }

      // We've rerun with the latest values from all of our sources.
      // This means that we no longer need to update until a signal changes
      this.state = CacheClean
    }

    /** update() if dirty, or a parent turns out to be dirty. */
    updateIfNecessary() {
      // If we are potentially dirty, see if we have a parent who has actually changed value
      if (this.state === CacheCheck) {
        for (const source of this.sources) {
          source.updateIfNecessary() // updateIfNecessary() can change this.state
          if (this.state === CacheDirty) {
            // Stop the loop here so we won't trigger updates on other parents unnecessarily
            // If our computation changes to no longer use some sources, we don't
            // want to update() a source we used last time, but now don't use.
            break
          }
        }
      }

      // If we were already dirty or marked dirty by the step above, update.
      if (this.state === CacheDirty) {
        this.update()
      }

      // By now, we're clean
      this.state = CacheClean
    }

    removeParentObservers(index) {
      if (!this.sources) return
      for (let i = index; i < this.sources.length; i++) {
        const source = this.sources[i] // We don't actually delete sources here because we're replacing the entire array soon
        const swap = source.observers.findIndex(v => v === this)
        source.observers[swap] = source.observers[source.observers.length - 1]
        source.observers.pop()
      }
    }
  }

  export function untrack(fn) {
    const prevReaction = CurrentReaction
    const prevGets = CurrentGets
    const prevIndex = CurrentGetsIndex

    CurrentReaction = undefined
    CurrentGets = null
    CurrentGetsIndex = 0

    const out = fn()

    CurrentGets = prevGets
    CurrentReaction = prevReaction
    CurrentGetsIndex = prevIndex

    return out
  }

  export function onCleanup(fn) {
    if (CurrentReaction) {
      CurrentReaction.cleanups.push(fn)
    } else {
      console.error("onCleanup must be called from within a @reactive function")
    }
  }

  /** run all non-clean effect nodes */
  export function stabilize() {
    for (let i = 0; i < EffectQueue.length; i++) {
      EffectQueue[i].get()
    }
    EffectQueue.length = 0
  }

  /** run a function for each dirty effect node.  */
  export function autoStabilize(fn = deferredStabilize) {
    //console.log('autoStabilize')
    stabilizeFn = fn
  }

  autoStabilize() //DEFAULTS

  /** queue stabilize() to run at the next idle time */
  function deferredStabilize() {
    if (!stabilizationQueued) {
      stabilizationQueued = true

      queueMicrotask(() => {
        stabilizationQueued = false
        stabilize()
      })
    }
  }

//////////////////////////////////////////////////
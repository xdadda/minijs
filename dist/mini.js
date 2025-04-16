function U(e, t, n, i) {
  let l = n.length, r = /[:,@]\S*=/.exec(e);
  if (!r)
    return console.error("MiNi: attribute is missing :@ prefix", e), !1;
  if (r?.length > 1)
    return console.error('MiNi: attribute is missing "${}"', e), !1;
  if (!e.endsWith(r[0] + '"'))
    return console.error("MiNi: attribute " + r[0] + ' is missing "${}"'), !1;
  const c = r[0][0], s = r[0].slice(1, -1);
  n.push({ type: c, key: s, v: t });
  const o = e.lastIndexOf(s);
  return e = e.substring(0, o - 1) + e.substring(o - 1).replace(c + s, s + l), e.slice(-1) === '"' ? i.push("") : i.push('""'), e;
}
function R(e, ...t) {
  let n = [...e];
  function i(l) {
    let r = [], c = [], s = !1;
    for (let f = 0; f < t.length; f++) {
      const h = t[f], p = n[f], x = p.lastIndexOf("<"), m = p.lastIndexOf(">");
      s = x !== -1 && x > m ? !0 : s, s = m !== -1 && m > x ? !1 : s;
      const y = c.length;
      if (typeof h == "function" || h instanceof Promise || h?.signal)
        if (!s)
          c.push({ type: "node", key: y, v: h }), r[f] = `<!--rx${y}-->`;
        else {
          const d = U(n[f], h, c, r);
          d ? n[f] = d : console.error("MiNi: unknown attribute type", n[f], h);
        }
      else Array.isArray(h) ? (r[f] = "", h.forEach((d, g) => {
        c.push({ type: "node", key: y + ":" + g, v: d }), r[f] += `<!--rx${y}:${g}-->`;
      })) : h === !1 || h === void 0 ? (s && n[f].slice(-1) === '"' && (n[f] = n[f].replace(/\s(\S+)$/, '"')), r.push("")) : r.push(h);
    }
    function o(f, h) {
      let p = f[0];
      for (let x = 0; x < h.length; x++)
        p += h[x] + f[x + 1];
      return p.replace(/\s+/g, " ");
    }
    let u = o(n, r);
    return u = u.replace(/(?=\/\*).*?(?:\*\/)/g, ""), { html: u.trim(), reactarray: c };
  }
  return i.html = !0, i;
}
let N, v = null, b = 0, _ = [], q, T = !1;
const $ = 0, k = 1, C = 2;
function O(e, t) {
  const n = new K(e, t?.effect, t?.label);
  return t?.equals && (n.equals = t.equals), n.signal = !0, n;
}
function J(e, t) {
  return e === t;
}
class K {
  _value;
  fn;
  observers = null;
  // nodes that have us as sources (down links)
  sources = null;
  // sources in reference order, not deduplicated (up links)
  state;
  effect;
  label;
  cleanups = [];
  equals = J;
  constructor(t, n, i) {
    typeof t == "function" ? (this.fn = t, this._value = void 0, this.effect = n || !1, this.state = C, n && (_.push(this), q?.(this))) : (this.fn = void 0, this._value = t, this.state = $, this.effect = !1), i && (this.label = i);
  }
  get value() {
    return this.get();
  }
  set value(t) {
    this.set(t);
  }
  get() {
    return N && (!v && N.sources && N.sources[b] == this ? b++ : v ? v.push(this) : v = [this]), this.fn && this.updateIfNecessary(), this._value;
  }
  set(t) {
    if (typeof t == "function") {
      const n = t;
      n !== this.fn && this.stale(C), this.fn = n;
    } else {
      this.fn && (this.removeParentObservers(0), this.sources = null, this.fn = void 0);
      const n = t;
      if (!this.equals(this._value, n)) {
        if (this.observers)
          for (let i = 0; i < this.observers.length; i++)
            this.observers[i].stale(C);
        this._value = n;
      }
    }
  }
  stale(t) {
    if (this.state < t && (this.state === $ && this.effect && (_.push(this), q?.(this)), this.state = t, this.observers))
      for (let n = 0; n < this.observers.length; n++)
        this.observers[n].stale(k);
  }
  /** run the computation fn, updating the cached value */
  update() {
    const t = this._value, n = N, i = v, l = b;
    N = this, v = null, b = 0;
    try {
      if (this.cleanups.length && (this.cleanups.forEach((r) => r(this._value)), this.cleanups = []), this._value = this.fn(), v) {
        if (this.removeParentObservers(b), this.sources && b > 0) {
          this.sources.length = b + v.length;
          for (let r = 0; r < v.length; r++)
            this.sources[b + r] = v[r];
        } else
          this.sources = v;
        for (let r = b; r < this.sources.length; r++) {
          const c = this.sources[r];
          c.observers ? c.observers.push(this) : c.observers = [this];
        }
      } else this.sources && b < this.sources.length && (this.removeParentObservers(b), this.sources.length = b);
    } finally {
      v = i, N = n, b = l;
    }
    if (!this.equals(t, this._value) && this.observers)
      for (let r = 0; r < this.observers.length; r++) {
        const c = this.observers[r];
        c.state = C;
      }
    this.state = $;
  }
  /** update() if dirty, or a parent turns out to be dirty. */
  updateIfNecessary() {
    if (this.state === k) {
      for (const t of this.sources)
        if (t.updateIfNecessary(), this.state === C)
          break;
    }
    this.state === C && this.update(), this.state = $;
  }
  removeParentObservers(t) {
    if (this.sources)
      for (let n = t; n < this.sources.length; n++) {
        const i = this.sources[n], l = i.observers.findIndex((r) => r === this);
        i.observers[l] = i.observers[i.observers.length - 1], i.observers.pop();
      }
  }
}
function H(e) {
  const t = N, n = v, i = b;
  N = void 0, v = null, b = 0;
  const l = e();
  return v = n, N = t, b = i, l;
}
function X() {
  for (let e = 0; e < _.length; e++)
    _[e].get();
  _.length = 0;
}
function Y(e = Z) {
  q = e;
}
Y();
function Z() {
  T || (T = !0, queueMicrotask(() => {
    T = !1, X();
  }));
}
function F(e) {
  if (e.nodeType) {
    let t = [e];
    return t.parent = e.parentNode, t.next = e.nextSibling, t.prev = e.previousSibling, t.fragment = !0, t;
  } else return Array.isArray(e) && !e.fragment ? e[0] ? (e[0].before(document.createTextNode("")), e[e.length - 1].after(document.createTextNode("")), e.parent = e[0].parentNode, e.prev = e[0].previousSibling, e.next = e[e.length - 1].nextSibling, e.fragment = !0, e) : !1 : (console.error("MiNi: unknown input for createFragment"), !1);
}
function V(e, t) {
  return e.fragment && Array.isArray(e) && Array.isArray(t) ? (t.prev = e.prev, t.next = e.next, t.parent = e.parent, S(e), t.next ? t.next.before(...t) : t.parent.append(...t), t.fragment = !0) : console.error("MiNi: replaceFragments unknown input", e, t), t;
}
function S(e) {
  if (!e.prev && !e.next && e.parent)
    e.parent.textContent = "";
  else {
    if (e.prev?.nextSibling === e.next) return e;
    {
      let t = e.prev?.nextSibling || e.next?.parentElement?.firstChild || e.parent?.firstChild;
      if (!t) return;
      for (; t !== e.next; ) {
        if (!t) return console.error("MiNi: clearFragment missing node", e);
        const n = t.nextSibling;
        t.remove(), t = n;
      }
    }
  }
  return e.length && e.splice(0, e.length), e;
}
function w(e) {
  if (!e.prev && !e.next)
    e.splice(0, e.length), e.splice(0, 0, ...e.parent.childNodes);
  else {
    let t = e.prev?.nextSibling || e.parent.firstChild, n = [];
    for (; t !== e.next; ) {
      if (!t) return console.error("MiNi: updateFragment missing node", e);
      const i = t.nextSibling;
      n.push(t), t = i;
    }
    e.length && e.splice(0, e.length), e.splice(0, 0, ...n);
  }
  return e;
}
function B(e, t, n, i) {
  const l = document.createComment("");
  t.parent.insertBefore(l, n);
  const r = Symbol("$item");
  i[r] = { frag: !0 };
  const c = E(l, e, i[r]);
  return c.prev && (c.prev.nextElementSibling.myid = r), l;
}
function ee(e, t, n) {
  I(t.myid, n);
  const i = Symbol("$item");
  n[i] = { frag: !0 };
  const l = E(t, e, n[i]);
  return l.prev && (l.prev.nextElementSibling.myid = i), l[0];
}
function L(e, t = []) {
  return e.unmount && (t.push(e.unmount), delete e.unmount), Object.getOwnPropertySymbols(e).forEach((n) => {
    e[n]?.frag && L(e[n], t);
  }), t.flat().reverse();
}
function z(e) {
  Object.getOwnPropertySymbols(e).forEach((t) => {
    e[t]?.frag && (e[t].stale = !0, z(e[t]));
  });
}
function I(e, t) {
  if (!t || !t[e]) return;
  const n = L(t[e]);
  n.length && n.forEach((i) => typeof i == "function" && i()), z(t[e]), delete t[e];
}
function G(e) {
  if (!e) return;
  const t = L(e);
  t.length && t.forEach((n) => typeof n == "function" && n()), z(e), Object.getOwnPropertySymbols(e).forEach((n) => delete e[n]);
}
function W(e, t = [], n = [], i, l) {
  w(e);
  let r = e.next, c = e.parent, s = 0, o = t?.length, u = 0, a = n?.length, f = a, h = null, p = new Array(f), x = !1, m = e;
  if (f === 0) {
    G(l), S(e);
    return;
  }
  for (; s < o || u < a; )
    if (o === s) {
      const y = a < f ? u && p[u - 1] ? p[u - 1].nextSibling : p[a] : (
        //temp[bEnd-bStart] ) :
        r
      );
      for (; u < a; )
        p && p[u] ? c.insertBefore(p[u], y) : p[u] = B(() => i(n[u]), e, y, l), u++;
    } else if (a === u)
      for (; s < o; )
        (!h || !h.has(t[s])) && (I(m[s].myid, l), c.removeChild(m[s])), s++;
    else if (t[s] === n[u])
      p[u] = m[s], s++, u++;
    else if (t[o - 1] === n[a - 1])
      p[a - 1] = m[o - 1], o--, a--;
    else if (t[s] === n[a - 1] && n[u] === t[o - 1]) {
      const y = m[--o].nextSibling, d = m[s++].nextSibling;
      c.insertBefore(m[u++], y), c.insertBefore(m[o], d), a--, t[o] = n[a];
    } else {
      if (!h) {
        h = /* @__PURE__ */ new Map();
        let d = u;
        for (; d < a; )
          h.set(n[d], d++);
      }
      let y = u + f - a;
      if (!x) {
        let d = s;
        for (; d < o; ) {
          const g = h.get(t[d]);
          g !== void 0 && (p[g] = m[d], y++), d++;
        }
        if (x = !0, !y)
          return G(l), S(e), W(e, [], n, i, l);
      }
      if (h.has(t[s])) {
        const d = h.get(t[s]);
        if (u < d && d < a) {
          let g = s, P = 1;
          for (; ++g < o && g < a && h.get(t[g]) === d + P; )
            P++;
          if (P > d - u) {
            const j = m[s];
            for (; u < d; )
              p && p[u] ? c.insertBefore(p[u], j) : p[u] = B(() => i(n[u]), e, j, l), u++;
          } else
            p && p[u] ? c.replaceChild(p[u], m[s]) : p[u] = ee(() => i(n[u]), m[s], l), s++, u++;
        } else
          s++;
      } else
        I(m[s].myid, l), c.removeChild(m[s++]);
    }
}
let A = [];
function le(e) {
  A.push(e);
}
let M = [];
function ue(e) {
  M.push(e);
}
function Q(e, t = []) {
  return e.unmount && (t.push(e.unmount), delete e.unmount), Object.getOwnPropertySymbols(e).forEach((n) => {
    e[n]?.frag && Q(e[n], t);
  }), t.flat().reverse();
}
function te(e, t) {
  const n = document.createComment("rx");
  let i = new Array(e.length);
  i = i.fill(0).map(() => n.cloneNode()), t.frag = V(t.frag, i);
  for (let l = 0; l < e.length; l++)
    D(i[l], () => e[l], t);
}
function ne(e, t) {
  if (t.hidden && (t.hidden = !1), e?.html)
    E(t.frag, e, t), t.mount && setTimeout(() => {
      t.mount?.forEach((n) => n()), t.mount = void 0;
    }, 0);
  else if (Array.isArray(e))
    te(e, t), t.mount && setTimeout(() => {
      t.mount?.forEach((n) => n()), t.mount = void 0;
    }, 0);
  else if (e === !1 || e === "") {
    let n = function(i) {
      Object.getOwnPropertySymbols(i).forEach((l) => {
        i[l]?.frag && (i[l].stale = !0, n(i[l]));
      });
    };
    S(t.frag), t.hidden = !0, n(t);
  } else {
    let n = t.frag.prev.nextSibling;
    if (n.nodeType !== 3) {
      const i = document.createTextNode("");
      n.replaceWith(i), n = i;
    }
    e !== void 0 && n.data !== e && (n.data = e);
  }
}
function ie(e) {
  const t = Object.getOwnPropertySymbols(e).filter((i) => e[i]?.loader)?.[0];
  if (!t) return;
  const n = e[t].frag;
  S(n), delete e[t];
}
function D(e, t, n) {
  const i = Symbol("$comp");
  if (n[i] = {}, e.before(document.createTextNode("")), e.after(document.createTextNode("")), n[i].frag = F(e), t._map) return t(n, i);
  O(async () => {
    if (n[i].stale || n.stale) return delete n[i];
    const l = A.length, r = M.length, c = Q(n[i]);
    c.length && c.forEach((o) => typeof o == "function" && o());
    let s = t();
    if (s instanceof Promise && (s = await s), A.length > l) {
      const o = A.length - l;
      n[i].mount = A.splice(-o, o);
    }
    if (M.length > r) {
      const o = M.length - r;
      n[i].unmount = M.splice(-o, o);
    }
    if (typeof s == "function" && s?._map) return s(n, i);
    t._loader && (n[i].loader = !0), t._suspense && (n[i].suspense = !0, ie(n), delete t._suspense), s = typeof s == "function" ? H(s) : s, ne(s, n[i]);
  }, { effect: !0 });
}
function oe({ array: e, renderItem: t }) {
  const n = function(...i) {
    const [l, r] = i;
    S(l[r].frag);
    let c;
    O(() => {
      if (l[r].stale) return delete l[r];
      const s = e.signal ? e.value : e;
      H(() => W(l[r].frag, c, s, t, l[r])), c = s;
    }, { effect: !0 });
  };
  return n._map = !0, n;
}
function se(e, t, n, i) {
  function l(s, o, u) {
    u === !0 ? s.setAttribute(o, o) : u === !1 ? s.removeAttribute(o) : u !== !1 && u != null && s.setAttribute(o, u);
  }
  const r = Symbol("$attr");
  i[r] = {}, i[r].frag = F(e);
  const c = O(n);
  O(() => {
    if (i[r].stale || i.stale) return delete i[r];
    let s = c.value;
    t === "value" ? s.signal ? e.value = s.value : e.value = s : t === "ref" ? (e.removeAttribute(t), n.signal && (n.value = e)) : l(e, t, s);
  }, { effect: !0 });
}
function re(e, t) {
  return document.createTreeWalker(
    e,
    128,
    /* NodeFilter.SHOW_COMMENT */
    { acceptNode: (n) => n.textContent === t ? 1 : 2 }
  ).nextNode();
}
function E(e, t, n = { 0: {} }) {
  if (!e) return console.error("MiNi: renderClient missing node element");
  if (e.nodeType && (e = F(e)), typeof t == "function" && !t.html && (t = t()), typeof t == "function" && t.html && (t = t()), t.html === void 0) return console.error("MiNi: unknown input to renderClient", t);
  const { html: i, reactarray: l } = t, r = document.createElement("template");
  r.innerHTML = i;
  const c = e.prev?.parentNode || e.parent;
  for (let s = 0; s < l.length; s++) {
    let o, { type: u, key: a, v: f } = l[s];
    switch (u) {
      case "node":
        o = re(r.content, "rx" + a), o ? typeof f == "function" ? D(o, f, n) : f instanceof Promise ? console.error("MiNi: wrap async component in ()=>{}") : f.html === !0 ? o = E(o, f, n) : console.error("MiNi: unknown node value", f) : console.error("MiNi: cannot find placeholder", "rx" + a, c);
        break;
      /*
      case 'for':
          placeholder=findPlaceholder(tmplt.content,'rx'+key);
          if(!placeholder) console.error('MiNi: cannot find placeholder','rx'+key,root);
          else renderDiffArray(placeholder, v, _owner);
        break;
      */
      case "@":
      //create event listener
      case ":":
        o = r.content.querySelector(`[${a + s}]`), o ? (o.removeAttribute(a + s), u === ":" ? se(o, a, f, n) : u === "@" ? o.addEventListener(a.toLowerCase(), f, a === "onwheel" ? { passive: !1 } : {}) : console.error("MiNi: unknown special attr", u, s)) : console.error("MiNi: cannot find attribute", a + s);
        break;
    }
  }
  return S(e), e.next ? e.next.before(r.content) : c?.appendChild(r.content), e;
}
async function ce(e, t, n) {
  if (e.appendChild(document.createElement("div")), typeof t != "function") return console.error("MiNi: render 2nd arg must be a function");
  let i = { 0: {} };
  try {
    await E(e.children[0], R`${() => t()}`, i), n && console.log("rootowner", i);
  } catch (l) {
    console.error("MiNi: render", l);
  }
}
function fe(e, t) {
  const n = () => t();
  return n._loader = !0, e._suspense = !0, R`${n}${e}`;
}
function ae(e, t = "default") {
  return async (...n) => {
    const i = (await e())[t];
    return i ? i(...n) : console.error(`MiNi lazy: ${e} missing "${t}" export`);
  };
}
export {
  fe as Suspense,
  R as html,
  ae as lazy,
  oe as map,
  le as onMount,
  ue as onUnmount,
  O as reactive,
  ce as render,
  H as untrack
};

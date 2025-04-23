function U(e, t, n, i) {
  let u = n.length, r = /[:,@]\S*=/.exec(e);
  if (!r)
    return console.error("MiNi: attribute is missing :@ prefix", e), !1;
  if (r?.length > 1)
    return console.error('MiNi: attribute is missing "${}"', e), !1;
  if (!e.endsWith(r[0] + '"'))
    return console.error("MiNi: attribute " + r[0] + ' is missing "${}"'), !1;
  const c = r[0][0], l = r[0].slice(1, -1);
  n.push({ type: c, key: l, v: t });
  const o = e.lastIndexOf(l);
  return e = e.substring(0, o - 1) + e.substring(o - 1).replace(c + l, l + u), e.slice(-1) === '"' ? i.push("") : i.push('""'), e;
}
function R(e, ...t) {
  let n = [...e];
  function i(u) {
    let r = [], c = [], l = !1;
    for (let a = 0; a < t.length; a++) {
      const h = t[a], p = n[a], x = p.lastIndexOf("<"), m = p.lastIndexOf(">");
      l = x !== -1 && x > m ? !0 : l, l = m !== -1 && m > x ? !1 : l;
      const y = c.length;
      if (typeof h == "function" || h instanceof Promise || h?.signal)
        if (!l)
          c.push({ type: "node", key: y, v: h }), r[a] = `<!--rx${y}-->`;
        else {
          const d = U(n[a], h, c, r);
          d ? n[a] = d : console.error("MiNi: unknown attribute type", n[a], h);
        }
      else Array.isArray(h) ? (r[a] = "", h.forEach((d, g) => {
        typeof d == "function" ? (c.push({ type: "node", key: y + ":" + g, v: d }), r[a] += `<!--rx${y}:${g}-->`) : r[a] += d;
      })) : h === !1 || h === void 0 ? (l && n[a].slice(-1) === '"' && (n[a] = n[a].replace(/\s(\S+)$/, '"')), r.push("")) : r.push(h);
    }
    function o(a, h) {
      let p = a[0];
      for (let x = 0; x < h.length; x++)
        p += h[x] + a[x + 1];
      return p.replace(/\s+/g, " ");
    }
    let s = o(n, r);
    return s = s.replace(/(?=\/\*).*?(?:\*\/)/g, ""), { html: s.trim(), reactarray: c };
  }
  return i.html = !0, i;
}
let N, v = null, b = 0, _ = [], q, T = !1;
const $ = 0, B = 1, C = 2;
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
        this.observers[n].stale(B);
  }
  /** run the computation fn, updating the cached value */
  update() {
    const t = this._value, n = N, i = v, u = b;
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
      v = i, N = n, b = u;
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
    if (this.state === B) {
      for (const t of this.sources)
        if (t.updateIfNecessary(), this.state === C)
          break;
    }
    this.state === C && this.update(), this.state = $;
  }
  removeParentObservers(t) {
    if (this.sources)
      for (let n = t; n < this.sources.length; n++) {
        const i = this.sources[n], u = i.observers.findIndex((r) => r === this);
        i.observers[u] = i.observers[i.observers.length - 1], i.observers.pop();
      }
  }
}
function H(e) {
  const t = N, n = v, i = b;
  N = void 0, v = null, b = 0;
  const u = e();
  return v = n, N = t, b = i, u;
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
function k(e, t, n, i) {
  const u = document.createComment("");
  t.parent.insertBefore(u, n);
  const r = Symbol("$item");
  i[r] = { frag: !0 };
  const c = E(u, e, i[r]);
  return c.prev && (c.prev.nextElementSibling.myid = r), u;
}
function ee(e, t, n) {
  I(t.myid, n);
  const i = Symbol("$item");
  n[i] = { frag: !0 };
  const u = E(t, e, n[i]);
  return u.prev && (u.prev.nextElementSibling.myid = i), u[0];
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
function W(e, t = [], n = [], i, u) {
  w(e);
  let r = e.next, c = e.parent, l = 0, o = t?.length, s = 0, f = n?.length, a = f, h = null, p = new Array(a), x = !1, m = e;
  if (a === 0) {
    G(u), S(e);
    return;
  }
  for (; l < o || s < f; )
    if (o === l) {
      const y = f < a ? s && p[s - 1] ? p[s - 1].nextSibling : p[f] : (
        //temp[bEnd-bStart] ) :
        r
      );
      for (; s < f; )
        p && p[s] ? c.insertBefore(p[s], y) : p[s] = k(() => i(n[s]), e, y, u), s++;
    } else if (f === s)
      for (; l < o; )
        (!h || !h.has(t[l])) && (I(m[l].myid, u), c.removeChild(m[l])), l++;
    else if (t[l] === n[s])
      p[s] = m[l], l++, s++;
    else if (t[o - 1] === n[f - 1])
      p[f - 1] = m[o - 1], o--, f--;
    else if (t[l] === n[f - 1] && n[s] === t[o - 1]) {
      const y = m[--o].nextSibling, d = m[l++].nextSibling;
      c.insertBefore(m[s++], y), c.insertBefore(m[o], d), f--, t[o] = n[f];
    } else {
      if (!h) {
        h = /* @__PURE__ */ new Map();
        let d = s;
        for (; d < f; )
          h.set(n[d], d++);
      }
      let y = s + a - f;
      if (!x) {
        let d = l;
        for (; d < o; ) {
          const g = h.get(t[d]);
          g !== void 0 && (p[g] = m[d], y++), d++;
        }
        if (x = !0, !y)
          return G(u), S(e), W(e, [], n, i, u);
      }
      if (h.has(t[l])) {
        const d = h.get(t[l]);
        if (s < d && d < f) {
          let g = l, P = 1;
          for (; ++g < o && g < f && h.get(t[g]) === d + P; )
            P++;
          if (P > d - s) {
            const j = m[l];
            for (; s < d; )
              p && p[s] ? c.insertBefore(p[s], j) : p[s] = k(() => i(n[s]), e, j, u), s++;
          } else
            p && p[s] ? c.replaceChild(p[s], m[l]) : p[s] = ee(() => i(n[s]), m[l], u), l++, s++;
        } else
          l++;
      } else
        I(m[l].myid, u), c.removeChild(m[l++]);
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
  for (let u = 0; u < e.length; u++)
    D(i[u], () => e[u], t);
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
  else if (e === !1 || e === "")
    S(t.frag), t.hidden = !0;
  else {
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
    if (!n[i]) return;
    if (n.stale || n[i].stale) return delete n[i];
    function u(s) {
      Object.getOwnPropertySymbols(s).forEach((f) => {
        s[f]?.frag && (s[f].stale = !0, u(s[f]), delete s[f]);
      });
    }
    u(n[i]);
    const r = A.length, c = M.length, l = Q(n[i]);
    l.length && l.forEach((s) => typeof s == "function" && s());
    let o = t();
    if (o instanceof Promise && (o = await o), A.length > r) {
      const s = A.length - r;
      n[i].mount = A.splice(-s, s);
    }
    if (M.length > c) {
      const s = M.length - c;
      n[i].unmount = M.splice(-s, s);
    }
    if (typeof o == "function" && o?._map) return o(n, i);
    t._loader && (n[i].loader = !0), t._suspense && (n[i].suspense = !0, ie(n), delete t._suspense), o = typeof o == "function" ? H(o) : o, ne(o, n[i]);
  }, { effect: !0 });
}
function oe(e, t) {
  const n = function(...i) {
    const [u, r] = i;
    S(u[r].frag);
    let c;
    O(() => {
      if (!u[r]) return;
      if (u.stale || u[r].stale) return delete u[r];
      const l = e.signal ? e.value : e;
      H(() => W(u[r].frag, c, l, t, u[r])), c = l;
    }, { effect: !0 });
  };
  return n._map = !0, n;
}
function se(e, t, n, i) {
  function u(l, o, s) {
    s === !0 ? l.setAttribute(o, o) : s === !1 ? l.removeAttribute(o) : s !== !1 && s != null && l.setAttribute(o, s);
  }
  const r = Symbol("$attr");
  i[r] = {}, i[r].frag = F(e);
  const c = O(n);
  O(() => {
    if (!i[r]) return;
    if (i.stale || i[r].stale) return delete i[r];
    let l = c.value;
    t === "value" ? l.signal ? e.value = l.value : e.value = l : t === "ref" ? (e.removeAttribute(t), n.signal && (n.value = e)) : u(e, t, l);
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
  const { html: i, reactarray: u } = t, r = document.createElement("template");
  r.innerHTML = i;
  const c = e.prev?.parentNode || e.parent;
  for (let l = 0; l < u.length; l++) {
    let o, { type: s, key: f, v: a } = u[l];
    switch (s) {
      case "node":
        o = re(r.content, "rx" + f), o ? typeof a == "function" ? D(o, a, n) : a instanceof Promise ? console.error("MiNi: wrap async component in ()=>{}") : a.html === !0 ? o = E(o, a, n) : console.error("MiNi: unknown node value", a) : console.error("MiNi: cannot find placeholder", "rx" + f, c);
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
        o = r.content.querySelector(`[${f + l}]`), o ? (o.removeAttribute(f + l), s === ":" ? se(o, f, a, n) : s === "@" ? o.addEventListener(f.toLowerCase(), a, f === "onwheel" ? { passive: !1 } : {}) : console.error("MiNi: unknown special attr", s, l)) : console.error("MiNi: cannot find attribute", f + l);
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
  } catch (u) {
    console.error("MiNi: render", u);
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

import { Suspense as c } from "./mini.js";
import s from "./store.js";
import { r as f, h } from "./mini_dom-DTXbPRJT.js";
function m(n, o = { nohistory: !1, replacehistory: !0 }) {
  n !== s("$url").value && (s("$url").value = n || "/", o.nohistory || (o.replacehistory ? window.history.pushState({}, null, n) : window.history.replaceState({}, null, n)));
}
function v() {
  return s("$route");
}
async function U({ routes: n, loader: o = !1, handleAuth: l }) {
  if (!s("$route")) {
    let i = function(e) {
      e.preventDefault(), e.stopPropagation();
      const u = window.location.href.replace(window.location.origin, "");
      m(u, !0);
    };
    s("$url", f(window.location.href.replace(window.location.origin, ""))), window.addEventListener("popstate", i);
  }
  let t = $(decodeURIComponent(s("$url").value), n), r = !0;
  if (!(l && (r = await l(t), !r)))
    return s("$route", t), o ? c(() => s("$route").element(...t.args || []), o) : () => h`${() => s("$route").element(...t.args || [])}`;
}
function d(n, o) {
  const l = n.split("/").map((a, p) => [a.replace(":", ""), p, a.charAt(0) === ":"]), t = l.filter(([, , a]) => a), r = l.filter(([, , a]) => !a), i = o.split("/"), e = t.map(([a, p]) => [a, i[p]]);
  let u = !0;
  return r.forEach(([a, p]) => u = u & a === i[p]), u ? Object.fromEntries(e) : null;
}
function w(n, o) {
  const l = (i) => i.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"), t = new RegExp("^" + n.split("*").map(l).join("(.*)") + "$"), r = o.match(t);
  return r && r[1] !== null ? "/" + r[1] : null;
}
function $(n, o) {
  return g(n, null, o);
}
function g(n, o, l) {
  let t = n || "/";
  t && t !== "/" && t.slice(-1) === "/" && (t = t.slice(0, -1));
  let r = t.split("?")[1];
  r && (r = new URLSearchParams(r), r = Object.fromEntries([...r]), t = t.split("?")[0]);
  const i = l?.find((e) => {
    if (e.path !== "/" && e.path.slice(-1) === "/" && (e.path = e.path.slice(0, -1)), e.path === t || e.path.includes("*") && (t === e.path.slice(0, -2) ? e.subpath = "/" : e.subpath = w(e.path, t), e.subpath))
      return !0;
    if (e.path.includes(":")) {
      const u = d(e.path, t);
      return u ? (e.params = u, !0) : !1;
    }
    return !1;
  });
  return i ? (i.url = t, i.query = r, i) : !1;
}
export {
  U as Router,
  v as getRoute,
  m as setRoute
};

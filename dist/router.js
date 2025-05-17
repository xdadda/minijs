import { Suspense as c } from "./mini.js";
import s from "./store.js";
import { r as f, h } from "./mini_dom-7AavQnx9.js";
function m(n, i, o = { nohistory: !1, replacehistory: !0 }) {
  n !== s("$url").value && (i && s("$args", i), s("$url").value = n || "/", o.nohistory || (o.replacehistory ? window.history.pushState({}, null, n) : window.history.replaceState({}, null, n)));
}
function v() {
  return s("$route");
}
async function U({ routes: n, loader: i = !1, handleAuth: o }) {
  if (!s("$route")) {
    let r = function(u) {
      u.preventDefault(), u.stopPropagation();
      const l = window.location.href.replace(window.location.origin, "");
      m(l);
    };
    s("$url", f(window.location.href.replace(window.location.origin, ""))), window.addEventListener("popstate", r);
  }
  let t = s("$url").value, e = g(decodeURIComponent(t), n), a = !0;
  if (!(o && (a = await o(e), !a)))
    return e.args = s("$args") || e.args || null, s("$route", e), i ? c(() => s("$route").element(e.args), i) : () => h`${() => s("$route").element(e.args)}`;
}
function d(n, i) {
  const o = n.split("/").map((l, p) => [l.replace(":", ""), p, l.charAt(0) === ":"]), t = o.filter(([, , l]) => l), e = o.filter(([, , l]) => !l), a = i.split("/"), r = t.map(([l, p]) => [l, a[p]]);
  let u = !0;
  return e.forEach(([l, p]) => u = u & l === a[p]), u ? Object.fromEntries(r) : null;
}
function w(n, i) {
  const o = (a) => a.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"), t = new RegExp("^" + n.split("*").map(o).join("(.*)") + "$"), e = i.match(t);
  return e && e[1] !== null ? "/" + e[1] : null;
}
function g(n, i) {
  return $(n, null, i);
}
function $(n, i, o) {
  let t = n || "/";
  t && t !== "/" && t.slice(-1) === "/" && (t = t.slice(0, -1));
  let e = t.split("?")[1];
  e && (e = new URLSearchParams(e), e = Object.fromEntries([...e]), t = t.split("?")[0]);
  const a = o?.find((r) => {
    if (r.path !== "/" && r.path.slice(-1) === "/" && (r.path = r.path.slice(0, -1)), r.path === t || r.path.includes("*") && (t === r.path.slice(0, -2) ? r.subpath = "/" : r.subpath = w(r.path, t), r.subpath))
      return !0;
    if (r.path.includes(":")) {
      const u = d(r.path, t);
      return u ? (r.params = u, !0) : !1;
    }
    return !1;
  });
  return a ? (a.url = t, a.query = e, a) : !1;
}
export {
  U as Router,
  v as getRoute,
  m as setRoute
};

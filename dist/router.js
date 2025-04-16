import { reactive as p, Suspense as f, html as h } from "mini";
import u from "mini/store";
function m(n, o = { nohistory: !1, replacehistory: !1 }) {
  n !== u("$url").value && (u("$url").value = n, o.nohistory || (o.replacehistory ? window.history.pushState({}, null, n) : window.history.replaceState({}, null, n)));
}
function E() {
  return u("$route");
}
async function v({ routes: n, loader: o = !1, handleAuth: a }) {
  if (!u("$route")) {
    let i = function(e) {
      e.preventDefault(), e.stopPropagation();
      const s = window.location.href.replace(window.location.origin, "");
      m(s, !0);
    };
    console.log(">>INIT Router<<"), u("$url", p(window.location.href.replace(window.location.origin, ""))), window.addEventListener("popstate", i);
  }
  let t = $(decodeURIComponent(u("$url").value), n), r = !0;
  if (!(a && (r = await a(t), !r)))
    return u("$route", t), o ? f(u("$route").element, o) : () => h`${u("$route").element}`;
}
function d(n, o) {
  const a = n.split("/").map((l, c) => [l.replace(":", ""), c, l.charAt(0) === ":"]), t = a.filter(([, , l]) => l), r = a.filter(([, , l]) => !l), i = o.split("/"), e = t.map(([l, c]) => [l, i[c]]);
  let s = !0;
  return r.forEach(([l, c]) => s = s & l === i[c]), s ? Object.fromEntries(e) : null;
}
function w(n, o) {
  const a = (i) => i.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"), t = new RegExp("^" + n.split("*").map(a).join("(.*)") + "$"), r = o.match(t);
  return r && r[1] !== null ? "/" + r[1] : null;
}
function $(n, o) {
  return g(n, null, o);
}
function g(n, o, a) {
  let t = n || "/";
  t && t !== "/" && t.slice(-1) === "/" && (t = t.slice(0, -1));
  let r = t.split("?")[1];
  r && (r = new URLSearchParams(r), r = Object.fromEntries([...r]), t = t.split("?")[0]);
  const i = a?.find((e) => {
    if (e.path !== "/" && e.path.slice(-1) === "/" && (e.path = e.path.slice(0, -1)), e.path === t || e.path.includes("*") && (t === e.path.slice(0, -2) ? e.subpath = "/" : e.subpath = w(e.path, t), e.subpath))
      return !0;
    if (e.path.includes(":")) {
      const s = d(e.path, t);
      return s ? (e.params = s, !0) : !1;
    }
    return !1;
  });
  return i ? (i.url = t, i.query = r, i) : !1;
}
export {
  v as Router,
  E as getRoute,
  m as setRoute
};

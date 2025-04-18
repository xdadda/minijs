import { reactive as p, Suspense as f, html as h } from "mini";
import u from "mini/store";
function m(n, i = { nohistory: !1, replacehistory: !1 }) {
  n !== u("$url").value && (u("$url").value = n, i.nohistory || (i.replacehistory ? window.history.pushState({}, null, n) : window.history.replaceState({}, null, n)));
}
function E() {
  return u("$route");
}
async function v({ routes: n, loader: i = !1, handleAuth: l }) {
  if (!u("$route")) {
    let o = function(e) {
      e.preventDefault(), e.stopPropagation();
      const s = window.location.href.replace(window.location.origin, "");
      m(s, !0);
    };
    u("$url", p(window.location.href.replace(window.location.origin, ""))), window.addEventListener("popstate", o);
  }
  let t = $(decodeURIComponent(u("$url").value), n), r = !0;
  if (!(l && (r = await l(t), !r)))
    return u("$route", t), i ? f(u("$route").element, i) : () => h`${u("$route").element}`;
}
function d(n, i) {
  const l = n.split("/").map((a, c) => [a.replace(":", ""), c, a.charAt(0) === ":"]), t = l.filter(([, , a]) => a), r = l.filter(([, , a]) => !a), o = i.split("/"), e = t.map(([a, c]) => [a, o[c]]);
  let s = !0;
  return r.forEach(([a, c]) => s = s & a === o[c]), s ? Object.fromEntries(e) : null;
}
function w(n, i) {
  const l = (o) => o.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1"), t = new RegExp("^" + n.split("*").map(l).join("(.*)") + "$"), r = i.match(t);
  return r && r[1] !== null ? "/" + r[1] : null;
}
function $(n, i) {
  return g(n, null, i);
}
function g(n, i, l) {
  let t = n || "/";
  t && t !== "/" && t.slice(-1) === "/" && (t = t.slice(0, -1));
  let r = t.split("?")[1];
  r && (r = new URLSearchParams(r), r = Object.fromEntries([...r]), t = t.split("?")[0]);
  const o = l?.find((e) => {
    if (e.path !== "/" && e.path.slice(-1) === "/" && (e.path = e.path.slice(0, -1)), e.path === t || e.path.includes("*") && (t === e.path.slice(0, -2) ? e.subpath = "/" : e.subpath = w(e.path, t), e.subpath))
      return !0;
    if (e.path.includes(":")) {
      const s = d(e.path, t);
      return s ? (e.params = s, !0) : !1;
    }
    return !1;
  });
  return o ? (o.url = t, o.query = r, o) : !1;
}
export {
  v as Router,
  E as getRoute,
  m as setRoute
};

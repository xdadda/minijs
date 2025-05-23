const S = {};
let c;
function y(...t) {
  let e;
  if (!c) {
    const n = window._ctx_ || { url: window.location.pathname };
    c = a((i) => ({ ...S, ...n }));
  }
  if (e = c, !t || !t.length) return e.getState();
  if (t.length === 1) {
    if (typeof t[0] == "string") return e.getState()[t[0]];
    if (typeof t[0] == "object") return e.setState(t[0]);
    console.error("MiNi: unknown store argument");
  } else if (t.length === 2) {
    if (typeof t[0] != "string") return console.error("MiNi: unknown store argument");
    if (typeof t[1] == "function") {
      const n = e.getState()[t[0]];
      t[1] = t[1](n);
    }
    return e.setState({ [t[0]]: t[1] });
  } else console.error("MiNi: store has too many arguments");
}
const r = (t) => {
  let e;
  const n = (s, u) => {
    const o = typeof s == "function" ? s(e) : s;
    Object.is(o, e) || (e = u ?? (typeof o != "object" || o === null) ? o : Object.assign({}, e, o));
  }, i = () => e, l = { setState: n, getState: i, getInitialState: () => f }, f = e = t(n, i, l);
  return l;
}, a = (t) => t ? r(t) : r;
export {
  y as default
};

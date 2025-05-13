import { h as a } from "./mini_dom-DTXbPRJT.js";
import { m as c, o as f, b as m, r as p, a as $, u as d } from "./mini_dom-DTXbPRJT.js";
function o(r, e) {
  const n = () => e();
  return n._loader = !0, r._suspense = !0, a`${n}${r}`;
}
function u(r, e = "default") {
  return async (...n) => {
    const t = (await r())[e];
    return t ? t(...n) : console.error(`MiNi lazy: ${r} missing "${e}" export`);
  };
}
export {
  o as Suspense,
  a as html,
  u as lazy,
  c as map,
  f as onMount,
  m as onUnmount,
  p as reactive,
  $ as render,
  d as untrack
};

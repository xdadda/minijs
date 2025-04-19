import { render as E, html as C, reactive as h, onMount as M, onUnmount as B, map as I } from "mini";
function P() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (r) => (+r ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +r / 4).toString(16)
  );
}
function b({ content: r, buttons: o, onCancel: l, onClose: s, type: u, placeholder: c = "", width: a }) {
  const e = P();
  function i(t) {
    t.preventDefault(), t.stopPropagation(), l(document.getElementById(e));
  }
  function n(t) {
    if (t.preventDefault(), t.stopPropagation(), s) return s(document.getElementById(e), document.getElementById("_in" + e).value);
  }
  function d(t, p) {
    t.preventDefault(), t.stopPropagation(), p(document.getElementById(e), document.getElementById("_in" + e)?.value);
  }
  function f(t) {
    t.key === "Escape" ? i(t) : t.key === "Enter" && n(t);
  }
  return onMount(() => {
    u === "prompt" ? setTimeout(() => {
      document.getElementById("_in" + e)?.focus();
    }, 10) : o && setTimeout(() => {
      document.getElementById("_btn" + e)?.focus();
    }, 10);
  }), C`<div id="${e}" aria-busy="true" class="alert" @click="${i}"><div class="alert-message" @click="${(t) => t.stopPropagation()}" @keyup="${f}"><div class="msg" style="${a ? "width:" + a + "px;" : ""}">${r} ${u === "prompt" && `<br/><input type='text' id='_in${e}' @keyup="${f}" placeholder="${c || ""}"/>`}</div><div>${o?.map((t, p) => () => C`<button id="${t.focus ? "_btn" + e : ""}" @click="${(v) => d(v, t.onClick)}" tabindex="${p + 1}">${t.label}</button>`)}</div></div></div>`;
}
async function A(r, o, l) {
  return await new Promise((s, u) => {
    const c = document.body.querySelector("div"), a = document.createElement("div");
    c.appendChild(a);
    function e(n, d) {
      n.parentElement.remove(), s(d);
    }
    function i(n) {
      n.parentElement.remove(), s(!1);
    }
    E(a, () => b({
      content: r,
      buttons: [
        { label: "Cancel", onClick: i },
        { label: "OK", onClick: e, focus: !0 }
      ],
      onClose: e,
      onCancel: i,
      type: "prompt",
      placeholder: l,
      width: o
    }));
  });
}
async function F(r, o) {
  return await new Promise((l, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function a(i) {
      i.parentElement.remove(), l(!0);
    }
    function e(i) {
      i.parentElement.remove(), l(!1);
    }
    E(c, () => b({
      content: r,
      buttons: [
        { label: "Cancel", onClick: e },
        { label: "OK", onClick: a, focus: !0 }
      ],
      onCancel: e,
      type: "confirm",
      width: o
    }));
  });
}
async function K(r, o) {
  return await new Promise((l, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function a(e) {
      e.parentElement.remove(), l(!1);
    }
    E(c, () => b({
      content: r,
      buttons: [{ label: "OK", onClick: a, focus: !0 }],
      onCancel: a,
      type: "alert",
      width: o
    }));
  });
}
function S({
  renderItem: r,
  //(idx)=>{..}
  itemCount: o,
  //# of items (can be a number, signal of function)
  rowHeight: l,
  //in pixels
  nodePadding: s,
  //number of "padding" items
  onUpdateRow: u,
  //triggered when virtual list is updated
  onUpdateScroll: c,
  //triggered when virtual list is updated
  onMounted: a
}) {
  const e = h();
  let i, n, d, f;
  const t = h([]);
  o.signal ? f = o : typeof o == "function" ? f = h(o) : f = { value: o };
  function p() {
    const m = Math.max(0, Math.floor(n.scrollTop / l) - s), g = n.offsetHeight;
    let y = Math.ceil(g / l) + 2 * s;
    y = Math.min(f.value - m, y);
    const _ = Math.floor(n.scrollTop / l), k = (d || 0) + y - 1;
    u && u(_, k);
    const w = m * l;
    e._value.firstElementChild.style.transform = `translateY(${w}px)`, c && c(n.scrollTop), (d === void 0 || d !== m) && (d = m, t.value = new Array(y || 0).fill(null).map((T, x) => x + m));
  }
  function v() {
    i && cancelAnimationFrame(i), i = requestAnimationFrame(p);
  }
  const $ = f.value * l + "px";
  return M(() => {
    const m = e._value;
    m && (n = m.parentElement, n.style.overflowY !== "auto" && (n.style.overflowY = "auto"), n.addEventListener("scroll", v), p(), a && a());
  }), B(() => {
    n?.removeEventListener("scroll", v);
  }), C`<div :ref="${e}" aria-role="listbox" style="height:${$};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${I(t, r)}</div></div>`;
}
export {
  K as alert,
  F as confirm,
  A as prompt,
  S as virtual
};

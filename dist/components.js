import { a as b, h as C, o as $, r as h, m as I, b as M } from "./mini_dom-DTXbPRJT.js";
function P() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (r) => (+r ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +r / 4).toString(16)
  );
}
function E({ content: r, buttons: o, onCancel: l, onClose: s, type: u, placeholder: c = "", width: a }) {
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
  function m(t) {
    t.key === "Escape" ? i(t) : t.key === "Enter" && n(t);
  }
  return $(() => {
    u === "prompt" ? setTimeout(() => {
      document.getElementById("_in" + e)?.focus();
    }, 10) : o && setTimeout(() => {
      document.getElementById("_btn" + e)?.focus();
    }, 10);
  }), C`<div id="${e}" aria-busy="true" class="alert" @click="${i}"><div class="alert-message" @click="${(t) => t.stopPropagation()}" @keyup="${m}"><div class="msg" style="${a ? "width:" + a + "px;" : ""}">${r} ${u === "prompt" && `<br/><input type='text' id='_in${e}' @keyup="${m}" placeholder="${c || ""}"/>`}</div><div>${o?.map((t, p) => () => C`<button id="${t.focus ? "_btn" + e : ""}" @click="${(v) => d(v, t.onClick)}" tabindex="${p + 1}">${t.label}</button>`)}</div></div></div>`;
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
    b(a, () => E({
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
    b(c, () => E({
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
    b(c, () => E({
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
  let i, n, d, m;
  const t = h([]);
  o.signal ? m = o : typeof o == "function" ? m = h(o) : m = { value: o };
  function p() {
    const f = Math.max(0, Math.floor(n.scrollTop / l) - s), _ = n.offsetHeight;
    let y = Math.ceil(_ / l) + 2 * s;
    y = Math.min(m.value - f, y);
    const k = Math.floor(n.scrollTop / l), w = (d || 0) + y - 1;
    u && u(k, w);
    const x = f * l;
    e._value.firstElementChild.style.transform = `translateY(${x}px)`, c && c(n.scrollTop), (d === void 0 || d !== f) && (d = f, t.value = new Array(y || 0).fill(null).map((T, B) => B + f));
  }
  function v() {
    i && cancelAnimationFrame(i), i = requestAnimationFrame(p);
  }
  const g = m.value * l + "px";
  return $(() => {
    const f = e._value;
    f && (n = f.parentElement, n.style.overflowY !== "auto" && (n.style.overflowY = "auto"), n.addEventListener("scroll", v), p(), a && a());
  }), M(() => {
    n?.removeEventListener("scroll", v);
  }), C`<div :ref="${e}" aria-role="listbox" style="height:${g};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${I(t, r)}</div></div>`;
}
export {
  K as alert,
  F as confirm,
  A as prompt,
  S as virtual
};

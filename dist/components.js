import { render as E, onMount as $, html as C, reactive as h, onUnmount as I, map as M } from "mini";
function P() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (r) => (+r ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +r / 4).toString(16)
  );
}
function b({ content: r, buttons: l, onCancel: o, onClose: s, type: u, placeholder: c = "", width: i }) {
  const e = P();
  function a(t) {
    t.preventDefault(), t.stopPropagation(), o(document.getElementById(e));
  }
  function n(t) {
    if (t.preventDefault(), t.stopPropagation(), s) return s(document.getElementById(e), document.getElementById("_in" + e).value);
  }
  function d(t, p) {
    t.preventDefault(), t.stopPropagation(), p(document.getElementById(e), document.getElementById("_in" + e)?.value);
  }
  function f(t) {
    t.key === "Escape" ? a(t) : t.key === "Enter" && n(t);
  }
  return $(() => {
    u === "prompt" ? setTimeout(() => {
      document.getElementById("_in" + e)?.focus();
    }, 10) : l && setTimeout(() => {
      document.getElementById("_btn" + e)?.focus();
    }, 10);
  }), C`<div id="${e}" aria-busy="true" class="alert" @click="${a}"><div class="alert-message" @click="${(t) => t.stopPropagation()}" @keyup="${f}"><div class="msg" style="${i ? "width:" + i + "px;" : ""}">${r} ${u === "prompt" && `<br/><input type='text' id='_in${e}' @keyup="${f}" placeholder="${c || ""}"/>`}</div><div>${l?.map((t, p) => () => C`<button id="${t.focus ? "_btn" + e : ""}" @click="${(v) => d(v, t.onClick)}" tabindex="${p + 1}">${t.label}</button>`)}</div></div></div>`;
}
async function A(r, l, o) {
  return await new Promise((s, u) => {
    const c = document.body.querySelector("div"), i = document.createElement("div");
    c.appendChild(i);
    function e(n, d) {
      n.parentElement.remove(), s(d);
    }
    function a(n) {
      n.parentElement.remove(), s(!1);
    }
    E(i, () => b({
      content: r,
      buttons: [
        { label: "Cancel", onClick: a },
        { label: "OK", onClick: e, focus: !0 }
      ],
      onClose: e,
      onCancel: a,
      type: "prompt",
      placeholder: o,
      width: l
    }));
  });
}
async function F(r, l) {
  return await new Promise((o, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function i(a) {
      a.parentElement.remove(), o(!0);
    }
    function e(a) {
      a.parentElement.remove(), o(!1);
    }
    E(c, () => b({
      content: r,
      buttons: [
        { label: "Cancel", onClick: e },
        { label: "OK", onClick: i, focus: !0 }
      ],
      onCancel: e,
      type: "confirm",
      width: l
    }));
  });
}
async function K(r, l) {
  return await new Promise((o, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function i(e) {
      e.parentElement.remove(), o(!1);
    }
    E(c, () => b({
      content: r,
      buttons: [{ label: "OK", onClick: i, focus: !0 }],
      onCancel: i,
      type: "alert",
      width: l
    }));
  });
}
function S({
  renderItem: r,
  //(idx)=>{..}
  itemCount: l,
  //# of items (can be a number, signal of function)
  rowHeight: o,
  //in pixels
  nodePadding: s,
  //number of "padding" items
  onUpdateRow: u,
  //triggered when virtual list is updated
  onUpdateScroll: c,
  //triggered when virtual list is updated
  onMounted: i
}) {
  const e = h();
  let a, n, d, f;
  const t = h([]);
  l.signal ? f = l : typeof l == "function" ? f = h(l) : f = { value: l };
  function p() {
    const m = Math.max(0, Math.floor(n.scrollTop / o) - s), _ = n.offsetHeight;
    let y = Math.ceil(_ / o) + 2 * s;
    y = Math.min(f.value - m, y);
    const k = Math.floor(n.scrollTop / o), w = (d || 0) + y - 1;
    u && u(k, w);
    const x = m * o;
    e._value.firstElementChild.style.transform = `translateY(${x}px)`, c && c(n.scrollTop), (d === void 0 || d !== m) && (d = m, t.value = new Array(y || 0).fill(null).map((T, B) => B + m));
  }
  function v() {
    a && cancelAnimationFrame(a), a = requestAnimationFrame(p);
  }
  const g = f.value * o + "px";
  return $(() => {
    const m = e._value;
    m && (n = m.parentElement, n.style.overflowY !== "auto" && (n.style.overflowY = "auto"), n.addEventListener("scroll", v), p(), i && i());
  }), I(() => {
    n?.removeEventListener("scroll", v);
  }), C`<div :ref="${e}" aria-role="listbox" style="height:${g};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${M(t, r)}</div></div>`;
}
export {
  K as alert,
  F as confirm,
  A as prompt,
  S as virtual
};

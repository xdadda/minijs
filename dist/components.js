import { render as E, html as C, reactive as h, onMount as B, onUnmount as I, map as M } from "mini";
function P() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (r) => (+r ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +r / 4).toString(16)
  );
}
function $({ content: r, buttons: l, onCancel: o, onClose: s, type: u, placeholder: c = "", width: i }) {
  const t = P();
  function a(e) {
    e.preventDefault(), e.stopPropagation(), o(document.getElementById(t));
  }
  function n(e) {
    if (e.preventDefault(), e.stopPropagation(), s) return s(document.getElementById(t), document.getElementById("_in" + t).value);
  }
  function d(e, p) {
    e.preventDefault(), e.stopPropagation(), p(document.getElementById(t), document.getElementById("_in" + t)?.value);
  }
  function f(e) {
    e.key === "Escape" ? a(e) : e.key === "Enter" && n(e);
  }
  return u === "prompt" ? setTimeout(() => {
    document.getElementById("_in" + t)?.focus();
  }, 10) : l && setTimeout(() => {
    document.getElementById("_btn" + t)?.focus();
  }, 10), C`<div id="${t}" aria-busy="true" class="alert" @click="${a}"><div class="alert-message" @click="${(e) => e.stopPropagation()}" @keyup="${f}"><div class="msg" style="${i ? "width:" + i + "px;" : ""}">${r} ${u === "prompt" && `<br/><input type='text' id='_in${t}' @keyup="${f}" placeholder="${c || ""}"/>`}</div><div>${l?.map((e, p) => () => C`<button id="${e.focus ? "_btn" + t : ""}" selected="${e.focus ? "true" : ""}" @click="${(v) => d(v, e.onClick)}" tabindex="${p + 1}">${e.label}</button>`)}</div></div></div>`;
}
async function A(r, l, o) {
  return await new Promise((s, u) => {
    const c = document.body.querySelector("div"), i = document.createElement("div");
    c.appendChild(i);
    function t(n, d) {
      n.parentElement.remove(), s(d);
    }
    function a(n) {
      n.parentElement.remove(), s(!1);
    }
    E(i, () => $({
      content: r,
      buttons: [
        { label: "Cancel", onClick: a },
        { label: "OK", onClick: t, focus: !0 }
      ],
      onClose: t,
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
    function t(a) {
      a.parentElement.remove(), o(!1);
    }
    E(c, () => $({
      content: r,
      buttons: [
        { label: "Cancel", onClick: t },
        { label: "OK", onClick: i, focus: !0 }
      ],
      onCancel: t,
      type: "confirm",
      width: l
    }));
  });
}
async function K(r, l) {
  return await new Promise((o, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function i(t) {
      t.parentElement.remove(), o(!1);
    }
    E(c, () => $({
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
  const t = h();
  let a, n, d, f;
  const e = h([]);
  l.signal ? f = l : typeof l == "function" ? f = h(l) : f = { value: l };
  function p() {
    const m = Math.max(0, Math.floor(n.scrollTop / o) - s), g = n.offsetHeight;
    let y = Math.ceil(g / o) + 2 * s;
    y = Math.min(f.value - m, y);
    const _ = Math.floor(n.scrollTop / o), k = (d || 0) + y - 1;
    u && u(_, k);
    const w = m * o;
    t._value.firstElementChild.style.transform = `translateY(${w}px)`, c && c(n.scrollTop), (d === void 0 || d !== m) && (d = m, e.value = new Array(y || 0).fill(null).map((T, x) => x + m));
  }
  function v() {
    a && cancelAnimationFrame(a), a = requestAnimationFrame(p);
  }
  const b = f.value * o + "px";
  return B(() => {
    const m = t._value;
    m && (n = m.parentElement, n.style.overflowY !== "auto" && (n.style.overflowY = "auto"), n.addEventListener("scroll", v), p(), i && i());
  }), I(() => {
    n?.removeEventListener("scroll", v);
  }), C`<div :ref="${t}" aria-role="listbox" style="height:${b};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${M(e, r)}</div></div>`;
}
export {
  K as alert,
  F as confirm,
  A as prompt,
  S as virtual
};

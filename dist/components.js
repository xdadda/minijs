import { render as b, html as C, reactive as h, onMount as B, onUnmount as I, map as M } from "mini";
function P() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (r) => (+r ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +r / 4).toString(16)
  );
}
function E({ content: r, buttons: o, onCancel: l, onClose: s, type: u, placeholder: c = "", width: a }) {
  const t = P();
  function i(e) {
    e.preventDefault(), e.stopPropagation(), l(document.getElementById(t));
  }
  function n(e) {
    if (e.preventDefault(), e.stopPropagation(), s) return s(document.getElementById(t), document.getElementById("_in" + t).value);
  }
  function d(e, p) {
    e.preventDefault(), e.stopPropagation(), p(document.getElementById(t), document.getElementById("_in" + t)?.value);
  }
  function f(e) {
    e.key === "Escape" ? i(e) : e.key === "Enter" && n(e);
  }
  return u === "prompt" ? setTimeout(() => {
    document.getElementById("_in" + t)?.focus();
  }, 10) : o && setTimeout(() => {
    document.getElementById("_btn" + t)?.focus();
  }, 10), C`<div id="${t}" aria-busy="true" class="alert" @click="${i}"><div class="alert-message" @click="${(e) => e.stopPropagation()}" @keyup="${f}"><br><div class="msg" style="${a ? "width:" + a + "px;" : ""}">${r} ${u === "prompt" && `<br/><input type='text' id='_in${t}' @keyup="${f}" placeholder="${c || ""}"/>`}</div><br><div>${o?.map((e, p) => () => C`<button id="${e.focus ? "_btn" + t : ""}" class="${e.focus ? "_btnfocus" : ""}" @click="${(v) => d(v, e.onClick)}" tabindex="${p + 1}">${e.label}</button>`)}</div></div></div>`;
}
async function A(r, o, l) {
  return await new Promise((s, u) => {
    const c = document.body.querySelector("div"), a = document.createElement("div");
    c.appendChild(a);
    function t(n, d) {
      n.parentElement.remove(), s(d);
    }
    function i(n) {
      n.parentElement.remove(), s(!1);
    }
    b(a, () => E({
      content: r,
      buttons: [
        { label: "Cancel", onClick: i },
        { label: "OK", onClick: t, focus: !0 }
      ],
      onClose: t,
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
    function t(i) {
      i.parentElement.remove(), l(!1);
    }
    b(c, () => E({
      content: r,
      buttons: [
        { label: "Cancel", onClick: t },
        { label: "OK", onClick: a, focus: !0 }
      ],
      onCancel: t,
      type: "confirm",
      width: o
    }));
  });
}
async function K(r, o) {
  return await new Promise((l, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function a(t) {
      t.parentElement.remove(), l(!1);
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
  //refresh=false
}) {
  const t = h();
  let i, n, d, f;
  const e = h([]);
  o.signal ? f = o : typeof o == "function" ? f = h(o) : f = { value: o };
  function p() {
    const m = Math.max(0, Math.floor(n.scrollTop / l) - s), g = n.offsetHeight;
    let y = Math.ceil(g / l) + 2 * s;
    y = Math.min(f.value - m, y);
    const _ = Math.floor(n.scrollTop / l), k = (d || 0) + y - 1;
    u && u(_, k);
    const w = m * l;
    t._value.firstElementChild.style.transform = `translateY(${w}px)`, c && c(n.scrollTop), (d === void 0 || d !== m) && (d = m, e.value = new Array(y || 0).fill(null).map((T, x) => x + m));
  }
  function v() {
    i && cancelAnimationFrame(i), i = requestAnimationFrame(p);
  }
  const $ = f.value * l + "px";
  return B(() => {
    const m = t._value;
    m && (n = m.parentElement, n.style.overflowY !== "auto" && (n.style.overflowY = "auto"), n.addEventListener("scroll", v), p(), a && a());
  }), I(() => {
    n?.removeEventListener("scroll", v);
  }), C`<div :ref="${t}" aria-role="listbox" style="height:${$};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${M(e, r)}</div></div>`;
}
export {
  K as alert,
  F as confirm,
  A as prompt,
  S as virtual
};

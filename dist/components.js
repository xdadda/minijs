import { render as E, html as b, reactive as C, onMount as B, onUnmount as I, map as A } from "mini";
function P() {
  return "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (r) => (+r ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +r / 4).toString(16)
  );
}
function $({ content: r, buttons: l, onCancel: n, onClose: s, type: u, placeholder: c = "", width: o }) {
  const t = P();
  function a(e) {
    e.preventDefault(), e.stopPropagation(), n(document.getElementById(t));
  }
  function d(e) {
    if (e.preventDefault(), e.stopPropagation(), s) return s(document.getElementById(t), document.getElementById("_in" + t).value);
  }
  function i(e, p) {
    e.preventDefault(), e.stopPropagation(), p(document.getElementById(t), document.getElementById("_in" + t)?.value);
  }
  function v(e) {
    e.key === "Escape" ? a(e) : e.key === "Enter" && d(e);
  }
  return u === "prompt" ? setTimeout(() => {
    document.getElementById("_in" + t)?.focus();
  }, 10) : l && setTimeout(() => {
    document.getElementById("_btn" + t)?.focus();
  }, 10), b`<div id="${t}" aria-busy="true" class="alert" @click="${a}"><div class="alert-message" @click="${(e) => e.stopPropagation()}" @keyup="${v}"><br><div class="msg" style="${o ? "width:" + o + "px;" : ""}">${r} ${u === "prompt" && `<br/><input type='text' id='_in${t}' @keyup="${v}" placeholder="${c || ""}"/>`}</div><br><div>${l?.map((e, p) => () => b`<button id="${e.focus ? "_btn" + t : ""}" class="${e.focus ? "_btnfocus" : ""}" @click="${(y) => i(y, e.onClick)}" tabindex="${p + 1}">${e.label}</button>`)}</div></div></div>`;
}
async function F(r, l, n) {
  return await new Promise((s, u) => {
    const c = document.body.querySelector("div"), o = document.createElement("div");
    c.appendChild(o);
    function t(d, i) {
      d.parentElement.remove(), s(i);
    }
    function a(d) {
      d.parentElement.remove(), s(!1);
    }
    E(o, () => $({
      content: r,
      buttons: [
        { label: "Cancel", onClick: a },
        { label: "OK", onClick: t, focus: !0 }
      ],
      onClose: t,
      onCancel: a,
      type: "prompt",
      placeholder: n,
      width: l
    }));
  });
}
async function K(r, l) {
  return await new Promise((n, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function o(a) {
      a.parentElement.remove(), n(!0);
    }
    function t(a) {
      a.parentElement.remove(), n(!1);
    }
    E(c, () => $({
      content: r,
      buttons: [
        { label: "Cancel", onClick: t },
        { label: "OK", onClick: o, focus: !0 }
      ],
      onCancel: t,
      type: "confirm",
      width: l
    }));
  });
}
async function S(r, l) {
  return await new Promise((n, s) => {
    const u = document.body.querySelector("div"), c = document.createElement("div");
    u.appendChild(c);
    function o(t) {
      t.parentElement.remove(), n(!1);
    }
    E(c, () => $({
      content: r,
      buttons: [{ label: "OK", onClick: o, focus: !0 }],
      onCancel: o,
      type: "alert",
      width: l
    }));
  });
}
function Y({
  renderItem: r,
  //(idx)=>{..}
  itemCount: l,
  //# of items (can be a number, signal of function)
  rowHeight: n,
  //in pixels
  nodePadding: s,
  //number of "padding" items
  onUpdateRow: u = !1,
  //triggered when virtual list is updated
  onUpdateScroll: c = !1,
  //triggered when virtual list is updated
  onMounted: o = !1,
  parentHeight: t = 0
  //in pixels (for SSR) TODO: fix a clearFragment error in mini_dom if this is set
  //refresh=false
}) {
  const a = C();
  let d, i, v = 0, e;
  const p = C([]);
  l.signal ? e = l : typeof l == "function" ? e = C(l) : e = { value: l };
  function y() {
    const f = Math.max(0, Math.floor(i.scrollTop / n) - s), h = i.offsetHeight;
    m = Math.ceil(h / n) + 2 * s, m = Math.min(e.value - f, m);
    const k = Math.floor(i.scrollTop / n), w = v + m - 1;
    u && u(k, w);
    const x = f * n;
    a._value.firstElementChild.style.transform = `translateY(${x}px)`, c && c(i.scrollTop), v !== f && (v = f, p.value = new Array(m || 0).fill(null).map((T, M) => M + f));
  }
  function _() {
    d && cancelAnimationFrame(d), d = requestAnimationFrame(y);
  }
  const g = e.value * n + "px";
  let m = Math.ceil(t / n) + 2 * s;
  return m = Math.min(e.value, m), p.value = new Array(m || 0).fill(null).map((f, h) => h), B(() => {
    const f = a._value;
    f && (i = f.parentElement, i.style.overflowY !== "auto" && (i.style.overflowY = "auto"), i.addEventListener("scroll", _), y(), o && o());
  }), I(() => {
    i?.removeEventListener("scroll", _);
  }), b`<div :ref="${a}" aria-role="listbox" style="height:${g};overflow:hidden;position:relative;will-change:transform"><div class="result-list" tabindex="0">${A(p, r)}</div></div>`;
}
export {
  S as alert,
  K as confirm,
  F as prompt,
  Y as virtual
};

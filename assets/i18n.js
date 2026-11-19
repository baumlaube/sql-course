/* Sprachhilfe (DaZ) für den SQL-Kurs.
   Die Seiten sind deutsch geschrieben. Wählt jemand eine andere Sprache, ersetzt dieses Skript
   die Texte aus einem Wörterbuch: Schlüssel = deutscher Text (ohne HTML), Wert = Übersetzung (mit HTML).
   SQL-Befehle, Tabellen- und Spaltennamen werden nie übersetzt.
   Fehlt eine Übersetzung, bleibt der deutsche Text stehen.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const LANGS = {
    de: { name: "Deutsch", flag: "🇩🇪" },
    en: { name: "English", flag: "🇬🇧" },
    uk: { name: "Українська", flag: "🇺🇦" },
    ar: { name: "العربية", flag: "🇸🇾", dir: "rtl" },
    ru: { name: "Русский", flag: "🌐" },
    fr: { name: "Français", flag: "🇫🇷" },
    es: { name: "Español", flag: "🇪🇸" },
    tr: { name: "Türkçe", flag: "🇹🇷" },
    fa: { name: "فارسی / دری", flag: "🌐", dir: "rtl" },
    ro: { name: "Română", flag: "🇷🇴" },
    sq: { name: "Shqip", flag: "🇦🇱" },
    pl: { name: "Polski", flag: "🇵🇱" },
    bs: { name: "Bosanski", flag: "🇧🇦" },
  };
  const AVAILABLE = (document.currentScript && document.currentScript.dataset.langs || "de").split(/[\s,]+/).filter(Boolean);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* egal */ } },
  };
  const param = new URLSearchParams(location.search).get("lang");
  let lang = param || store.get("sql-lang") || "de";
  if (!AVAILABLE.includes(lang)) lang = "de";
  if (param && AVAILABLE.includes(param)) store.set("sql-lang", param);

  const base = (document.currentScript && document.currentScript.src || "").replace(/i18n\.js.*$/, "");
  const pageId = (document.currentScript && document.currentScript.dataset.page) || "index";

  const norm = (s) => String(s).replace(/<[a-zA-Z\/!][^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  let dict = null, patterns = [];

  /** Übersetzt einen Text oder HTML-Schnipsel. Unbekanntes bleibt deutsch. */
  function T(html) {
    if (!dict || html === null || html === undefined) return html;
    const key = norm(html);
    if (!key) return html;
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    for (const p of patterns) {
      const m = p.re.exec(key);
      if (!m) continue;
      // Eingesetzte Teile (Spaltennamen, Zahlen, Fehlermeldungen) sind reiner Text: wieder maskieren
      const vals = m.slice(1).map((v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
      let i = 0;
      return p.value.replace(/\{(\d*)\}/g, (_, n) => (n !== "" ? vals[+n] : vals[i++]) ?? "");
    }
    return html;
  }
  window.T = T;
  window.I18N = { lang, T, ready: false };

  /* ---------- Texte im Dokument ersetzen ---------- */
  const UNIT = new Set(["H1", "H2", "H3", "P", "LI", "TH", "TD", "BUTTON", "LABEL", "SMALL", "FIGCAPTION", "A", "OPTION", "SUMMARY"]);
  const SKIP = ".labor-code, .labor-tabelle, .labor-bausteine, pre.sql, code, script, style, svg, .lang-menu, .wort";
  const CONTROLS = "input, select, textarea, [id]";
  // Der Logo-Link (.brand) ist keine Einheit: „SQL-Kurs“ bleibt, nur der Untertitel (<span>) wird übersetzt.
  const isUnit = (el) => (UNIT.has(el.tagName) || el.classList.contains("t") || el.matches(".chip, .badge, .rule, .brand span, .pager > span"))
    && !el.classList.contains("brand") && !el.querySelector(CONTROLS) && /\p{L}{2}/u.test(el.textContent);
  /* Tooltips und Vorlesetexte (title, aria-label, data-tipp, …) – auch in Elementen, deren Text bleibt */
  const ATTRS = ["title", "aria-label", "data-tipp", "placeholder", "alt"];
  function attrs(root) {
    root.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
      if (el.closest(".lang-menu")) return;
      ATTRS.forEach((a) => { const v = el.getAttribute(a); if (v && /\p{L}{2}/u.test(v)) el.setAttribute(a, T(v)); });
    });
  }

  function walk(el) {
    if (el.nodeType !== 1 || el.matches(SKIP)) return;
    if (isUnit(el)) {
      const t = T(el.innerHTML);
      if (t !== el.innerHTML) { el.innerHTML = t; el.setAttribute("data-tr", ""); return; }
    }
    for (const c of Array.from(el.children)) walk(c);
  }

  /* ---------- Sprachwahl im Kopf ---------- */
  function menu() {
    const bar = document.querySelector(".top .wrap");
    if (!bar || AVAILABLE.length < 2) return;
    const wrap = document.createElement("div");
    wrap.className = "lang-menu";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-btn";
    btn.setAttribute("aria-haspopup", "true");
    btn.setAttribute("aria-label", "Sprache / Language");
    btn.textContent = `🌐 ${LANGS[lang].name}`;
    const list = document.createElement("ul");
    list.hidden = true;
    AVAILABLE.forEach((l) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      const u = new URL(location.href);
      u.searchParams.set("lang", l);
      a.href = u.pathname + u.search + u.hash;
      a.textContent = `${LANGS[l].flag} ${LANGS[l].name}`;
      a.lang = l;
      if (l === lang) a.setAttribute("aria-current", "true");
      a.addEventListener("click", () => store.set("sql-lang", l));
      li.appendChild(a);
      list.appendChild(li);
    });
    btn.addEventListener("click", () => { list.hidden = !list.hidden; });
    document.addEventListener("click", (ev) => { if (!wrap.contains(ev.target)) list.hidden = true; });
    wrap.append(btn, list);
    bar.insertBefore(wrap, bar.querySelector(".theme-btn"));
    if (lang !== "de") {
      const note = document.createElement("div");
      note.className = "lang-note";
      note.innerHTML = T("Sprachhilfe: SQL-Befehle und die Namen der Tabellen und Spalten bleiben, wie sie sind.");
      document.querySelector("main")?.prepend(note);
    }
  }

  const domReady = new Promise((r) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", r) : r()));
  // Seitenskripte (DOMContentLoaded) erst starten, wenn das Wörterbuch da ist –
  // sonst bleiben Rückmeldungen, die gleich beim Laden erscheinen, deutsch.
  const waiting = [];
  if (lang !== "de") {
    const orig = document.addEventListener.bind(document);
    document.addEventListener = function (type, fn, opts) {
      if (type === "DOMContentLoaded" && !window.I18N.ready) { waiting.push(fn); return; }
      return orig(type, fn, opts);
    };
  }
  async function load(name) {
    try {
      const res = await fetch(`${base}i18n/${lang}/${name}.json`, { cache: "no-cache" });
      return res.ok ? await res.json() : {};
    } catch (e) { return {}; }
  }

  if (lang !== "de") {
    document.documentElement.lang = lang;
    if (LANGS[lang].dir) document.documentElement.dir = LANGS[lang].dir;
    Promise.all([load("common"), load(pageId), domReady]).then(([common, page]) => {
      dict = Object.assign({}, common, page);
      patterns = Object.keys(dict).filter((k) => k.includes("{")).map((k) => ({
        re: new RegExp("^" + k.split(/\{\d*\}/).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)") + "$"),
        value: dict[k],
      }));
      waiting.splice(0).forEach((fn) => { try { fn(new Event("DOMContentLoaded")); } catch (e) { console.error(e); } });
      setTimeout(() => {           // nach den Seitenskripten, damit auch Quiz & Co. schon da sind
        document.title = T(document.title);
        walk(document.body);
        attrs(document.body);
        menu();
        window.I18N.ready = true;
        document.dispatchEvent(new Event("i18n-ready"));
      }, 0);
    });
  } else {
    domReady.then(() => setTimeout(menu, 0));
  }
})();

/* SQL-Kurs · gemeinsame Bausteine: Hell/Dunkel, Quiz, Vorhersage, Hilfe-Leiter, Ich-kann-Liste.
   Grundlage: Calc-Kurs. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privater Modus: egal */ } },
  };

  const T = (x) => (window.T ? window.T(x) : x);   // Sprachhilfe (i18n.js), falls geladen

  /* Hell / Dunkel */
  const saved = store.get("sql-theme");
  if (saved) document.documentElement.dataset.theme = saved;
  document.addEventListener("click", (ev) => {
    const b = ev.target.closest(".theme-btn");
    if (!b) return;
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("sql-theme", next);
  });

  /** Rückmeldung in einem .fb-Element anzeigen. kind: ok | hint | info */
  function feedback(el, html, kind) {
    el.className = "fb show " + kind;
    el.innerHTML = T(html);
  }

  /**
   * Eine Auswahlfrage (z. B. Vorhersage „Überleg:“). Antworten in el.querySelectorAll(".choice").
   * opts: { right: index, why, miss: [Satz je falscher Antwort], fb: Element, onDone(ok) }
   */
  function pick(box, opts) {
    const buttons = [...box.querySelectorAll(".choice")];
    buttons.forEach((b, i) => b.addEventListener("click", () => {
      buttons.forEach((x, xi) => { x.disabled = true; if (xi === opts.right) x.classList.add("right"); });
      const ok = i === opts.right;
      if (!ok) b.classList.add("wrong");
      const miss = !ok && opts.miss && opts.miss[i] ? T(opts.miss[i]) + " " : "";
      if (opts.fb) feedback(opts.fb, (ok ? T("✔ Richtig!") : T("✘ Nicht ganz.")) + " " + miss + T(opts.why || ""), ok ? "ok" : "hint");
      if (opts.onDone) opts.onDone(ok);
    }));
  }

  /**
   * Quiz: questions = [{ q, options:[...], right: index, why, miss:[...] }]
   * miss (optional): pro Antwort ein Satz zum typischen Denkfehler dahinter (null bei der richtigen).
   */
  function quiz(el, questions) {
    let answered = 0, correct = 0;
    const score = document.createElement("p");
    score.className = "quiz-score";
    score.setAttribute("aria-live", "polite");
    questions.forEach((item, qi) => {
      const q = document.createElement("p");
      q.className = "quiz-q";
      q.innerHTML = `${qi + 1}. <span class="t">${item.q}</span>`;
      el.appendChild(q);
      if (item.html) {                     // z. B. ein Skript als Bild der Blöcke
        const extra = document.createElement("div");
        extra.className = "quiz-extra";
        extra.innerHTML = item.html;
        el.appendChild(extra);
      }
      const box = document.createElement("div");
      box.className = "choices";
      const why = document.createElement("p");
      why.className = "fb quiz-why";
      item.options.forEach((opt) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.innerHTML = opt;
        box.appendChild(b);
      });
      pick(box, {
        right: item.right, why: item.why, miss: item.miss, fb: why,
        onDone(ok) {
          answered++; if (ok) correct++;
          if (answered === questions.length) {
            score.innerHTML = correct === questions.length
              ? T(`🏆 ${correct} von ${questions.length} – stark!`)
              : T(`${correct} von ${questions.length} richtig. Lies dir die Erklärungen noch einmal durch.`);
          }
        },
      });
      el.appendChild(box);
      el.appendChild(why);
    });
    el.appendChild(score);
  }

  /**
   * Hilfe-Leiter: Tipp 1 → Tipp 2 → … → Lösung. Jede Stufe erst nach Klick.
   * steps = ["Tipp 1", "Tipp 2", "Lösung: …"] (die letzte Stufe heißt „Lösung zeigen“)
   */
  function hints(el, steps) {
    el.classList.add("hints");
    const list = document.createElement("ol");
    list.className = "hints-list";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn secondary";
    let n = 0;
    const label = () => {
      btn.textContent = n === steps.length - 1 ? T("🔑 Lösung zeigen") : T(`💡 Tipp ${n + 1}`);
    };
    btn.addEventListener("click", () => {
      const li = document.createElement("li");
      li.innerHTML = T(steps[n]);
      if (n === steps.length - 1) li.className = "hints-sol";
      list.appendChild(li);
      n++;
      if (n >= steps.length) btn.remove(); else label();
    });
    label();
    el.appendChild(list);
    el.appendChild(btn);
  }

  /** Ich-kann-Liste, die sich das Gerät merkt (nur lokal, nichts wird gesendet). */
  function checklist(el, key) {
    const boxes = [...el.querySelectorAll("input[type=checkbox]")];
    // Für die Startseite: „sql-fertig-<key>“ = 1, wenn alles abgehakt ist (Häkchen und „3/8“ am Reiter).
    const summary = () => store.set(`sql-fertig-${key}`, boxes.every((b) => b.checked) ? "1" : "0");
    boxes.forEach((cb, i) => {
      const k = `sql-${key}-${i}`;
      cb.checked = store.get(k) === "1";
      cb.addEventListener("change", () => { store.set(k, cb.checked ? "1" : "0"); summary(); });
    });
    summary();
  }


  /**
   * Start-Check (Diagnose): eine Aufgabe nach der anderen, ein Versuch, keine Note.
   * Am Ende ein Bericht: welche Themen sitzen und wo man nachschlagen soll (mit Link).
   * items = [{ thema, q, html?, options, right, miss, why }                       – Antwort anklicken
   *          { thema, q, labor: {…Labor.create-Optionen…} }]                       – im SQL-Labor lösen (beliebig oft probieren)
   * opts  = { key: "k6-01", themen: { Name: { href, titel, station? } }, onReport(ergebnis) }
   * Das Ergebnis bleibt nur auf diesem Gerät (localStorage), nichts wird gesendet.
   */
  function diagnose(el, items, opts) {
    const skey = `sql-check-${opts.key}`;
    const themen = opts.themen || {};
    el.classList.add("diag");
    let res = [];
    let saved = null;
    try { saved = JSON.parse(store.get(skey) || "null"); } catch (e) { saved = null; }

    function report(r) {
      el.innerHTML = "";
      const ok = r.filter(Boolean).length;
      const per = {};
      items.forEach((it, i) => { (per[it.thema] = per[it.thema] || []).push(r[i]); });
      const head = document.createElement("p");
      head.className = "diag-score";
      head.innerHTML = T(`Dein Ergebnis: <strong>${ok} von ${items.length}</strong> Aufgaben richtig.`);
      const list = document.createElement("ul");
      list.className = "diag-report";
      const luecken = [];
      Object.keys(per).forEach((t) => {
        const n = per[t].length, k = per[t].filter(Boolean).length;
        const li = document.createElement("li");
        const th = themen[t] || {};
        if (k === n) { li.className = "sitzt"; li.innerHTML = `<span class="diag-ico">✔</span><span><strong>${T(t)}</strong> – ${T("sitzt.")}</span>`; }
        else {
          luecken.push(t);
          li.className = "luecke";
          li.innerHTML = `<span class="diag-ico">↺</span><span><strong>${T(t)}</strong> – ${T(`${k} von ${n} richtig.`)} `
            + (th.href ? `${T("Schlag nach:")} <a href="${th.href}">${T(th.titel || th.href)}</a>` : "")
            + (th.station ? ` · ${T("Üb hier:")} <a href="#${th.station}">${T(th.stationTitel || "Station")}</a>` : "")
            + "</span>";
        }
        list.appendChild(li);
      });
      const end = document.createElement("p");
      end.className = "diag-end";
      end.innerHTML = luecken.length
        ? T("Üb zuerst die Themen mit ↺. Die Links führen zur Lektion aus Klasse 5 und zu einer Übung hier auf der Seite.")
        : T("🏆 Alles sitzt! Mach unten mit den Plus-Aufgaben weiter.");
      const again = document.createElement("button");
      again.type = "button"; again.className = "btn secondary";
      again.textContent = T("↺ Start-Check noch einmal machen");
      again.addEventListener("click", () => { store.set(skey, ""); res = []; show(0); el.scrollIntoView({ block: "start" }); if (opts.onReport) opts.onReport(null); });
      el.append(head, list, end, again);
      if (opts.onReport) opts.onReport({ richtig: ok, von: items.length, luecken });
    }

    function show(i) {
      if (i >= items.length) { store.set(skey, JSON.stringify(res)); report(res); return; }
      const it = items[i];
      el.innerHTML = "";
      const step = document.createElement("p");
      step.className = "diag-step";
      step.innerHTML = `${T(`Aufgabe ${i + 1} von ${items.length}`)} <span class="chip">${T(it.thema)}</span>`;
      const bar = document.createElement("div");
      bar.className = "diag-bar";
      bar.innerHTML = `<span style="width:${Math.round(100 * i / items.length)}%"></span>`;
      const q = document.createElement("p");
      q.className = "quiz-q";
      q.innerHTML = T(it.q);
      el.append(bar, step, q);
      if (it.html) { const x = document.createElement("div"); x.className = "quiz-extra"; x.innerHTML = it.html; el.appendChild(x); }
      const fb = document.createElement("p");
      fb.className = "fb";
      fb.setAttribute("aria-live", "polite");
      const next = document.createElement("button");
      next.type = "button"; next.className = "btn diag-next";
      const go = (ok) => { res[i] = ok; show(i + 1); el.scrollIntoView({ block: "start" }); };
      if (it.labor) {
        let geloest = false;
        const host = document.createElement("div");
        el.appendChild(host);
        next.className = "btn secondary diag-next";
        next.textContent = T("Weiß ich nicht – weiter →");
        const cfg = Object.assign({}, it.labor, {
          onRun(tr, ok, api) {
            if (it.labor.onRun) it.labor.onRun(tr, ok, api);
            if (ok && !geloest) { geloest = true; next.className = "btn diag-next"; next.textContent = T("Weiter →"); }
          },
        });
        window.Labor.create(host, cfg);
        next.addEventListener("click", () => go(geloest));
        el.append(next);
        return;
      }
      const box = document.createElement("div");
      box.className = "choices";
      let answered = null;
      it.options.forEach((opt, oi) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "choice"; b.innerHTML = opt;
        b.addEventListener("click", () => {
          if (answered !== null) return;
          answered = oi === it.right;
          box.querySelectorAll("button").forEach((x, xi) => { x.disabled = true; if (xi === it.right) x.classList.add("right"); });
          if (!answered) b.classList.add("wrong");
          const miss = !answered && it.miss && it.miss[oi] ? T(it.miss[oi]) + " " : "";
          feedback(fb, (answered ? T("✔ Richtig!") : T("✘ Nicht ganz.")) + " " + miss + T(it.why || ""), answered ? "ok" : "hint");
          next.hidden = false;
        });
        box.appendChild(b);
      });
      next.textContent = i === items.length - 1 ? T("Zum Bericht →") : T("Weiter →");
      next.hidden = true;
      next.addEventListener("click", () => go(answered));
      el.append(box, fb, next);
    }

    if (Array.isArray(saved) && saved.length === items.length) { res = saved; report(saved); }
    else {
      const start = document.createElement("button");
      start.type = "button"; start.className = "btn";
      start.textContent = T("Start-Check beginnen");
      start.addEventListener("click", () => show(0));
      el.appendChild(start);
    }
  }

  /* Die Startseite öffnet beim nächsten Mal gleich die Klasse der zuletzt besuchten Lektion. */
  const jg = location.pathname.match(/\/(k\d)\/[^/]+\.html$/);
  if (jg) store.set("sql-klasse", jg[1]);

  /* Fachwörter: Wer die Sprachhilfe benutzt, sieht die Wortliste gleich aufgeklappt. */
  document.addEventListener("DOMContentLoaded", () => {
    if (document.documentElement.lang && document.documentElement.lang !== "de") {
      document.querySelectorAll("details.woerter").forEach((d) => { d.open = true; });
    }
  });

  /* Erklärungen direkt an Knöpfen: data-tipp="…" – mit der Maus als Tooltip (CSS),
     am Touch-Gerät kurz eingeblendet. data-tipp-einmal="schlüssel": am Touch-Gerät nur beim ersten Mal. */
  const gezeigt = new Set();
  let blase = null, blaseTimer = null;
  document.addEventListener("pointerdown", (ev) => {
    if (ev.pointerType !== "touch") return;
    const el = ev.target.closest("[data-tipp]");
    if (!el) return;
    const einmal = el.dataset.tippEinmal;
    if (einmal) { if (gezeigt.has(einmal)) return; gezeigt.add(einmal); }
    if (!blase) { blase = document.createElement("div"); blase.className = "tipp-blase"; blase.setAttribute("role", "status"); document.body.appendChild(blase); }
    blase.textContent = T(el.dataset.tipp);
    const r = el.getBoundingClientRect();
    blase.style.left = Math.max(8, Math.min(window.innerWidth - 268, r.left + r.width / 2 - 130)) + "px";
    blase.style.top = (window.scrollY + r.bottom + 8) + "px";
    blase.classList.add("zeigen");
    clearTimeout(blaseTimer);
    blaseTimer = setTimeout(() => blase.classList.remove("zeigen"), 2600);
  }, { passive: true });

  window.Kurs = { feedback, pick, quiz, hints, checklist, diagnose, store };
})();

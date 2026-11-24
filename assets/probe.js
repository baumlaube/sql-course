/* „Fit für die Probe“: gemischte Aufgaben aus allen Themen eines Teils, ohne Tipps, mit Bericht am Ende.
   Labor.probe(el, {
     titel: "Teil 2",
     themen: [{ key, satz: "Ich kann …", lektion: "Lektion 4", href: "04-where.html" }, …],
     vorrat: [{ thema, db, text, loesung, reihenfolge?, pruefe? }, …],   // je Thema mehrere Aufgaben
     jeThema: 2,                                                         // so viele Aufgaben je Thema pro Durchgang
     extra: ["AND", …],                                                  // zusätzliche Bausteine in der Leiste
   })
   Nichts wird gespeichert (Kioskmodus): Ein Durchgang lebt nur, solange die Seite offen ist.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const { esc, T, sqlHTML } = Labor._intern;

  function mischen(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }

  function probe(el, o) {
    el.classList.add("probe");
    const je = o.jeThema || 2;
    let runde = [], akt = 0;

    function neueRunde() {
      runde = [];
      o.themen.forEach((th) => mischen(o.vorrat.filter((a) => a.thema === th.key)).slice(0, je).forEach((a) => runde.push({ a, status: null, versuche: 0 })));
      runde = mischen(runde);
      akt = 0;
    }

    function start() {
      el.innerHTML = `<div class="probe-start">
          <p>${T(`${o.themen.length * je} Aufgaben aus allen Themen, bunt gemischt. Jeder Durchgang ist anders.`)}</p>
          <p>${T("Wie in der Probe gibt es <strong>keine Tipps</strong>. Du siehst nur, ob dein Ergebnis stimmt. Du darfst so oft ausführen, wie du willst.")}</p>
          <p>${T("Kommst du nicht weiter? Dann gib die Aufgabe ab – du siehst die Lösung, und sie zählt als „noch üben“.")}</p>
          <div class="btn-row"><button type="button" class="btn probe-los">▶ ${T("Durchgang starten")}</button></div>
        </div>`;
      el.querySelector(".probe-los").addEventListener("click", () => { neueRunde(); aufgabe(); });
    }

    function punkte() {
      return `<ol class="tr-punkte" aria-label="${T("Aufgaben")}">${runde.map((r, i) =>
        `<li><span class="tr-p${r.status === "ok" ? " ok" : r.status === "ab" ? " ab" : ""}${i === akt ? " akt" : ""}">${r.status === "ok" ? "✔" : r.status === "ab" ? "✘" : i + 1}</span></li>`).join("")}</ol>`;
    }

    function aufgabe() {
      const r = runde[akt], a = r.a;
      el.innerHTML = `<div class="tr-kopf">${punkte()}</div>
        <p class="tr-nr">${T(`Aufgabe ${akt + 1} von ${runde.length}`)}</p>
        <p class="tr-text">${T(a.text)}</p>
        <div class="probe-tab"></div>
        <div class="probe-labor"></div>
        <div class="btn-row">
          <button type="button" class="btn secondary probe-ab" data-tipp="${T("Die Aufgabe zählt dann als „noch üben“. Du siehst die Lösung.")}">${T("Abgeben – Lösung zeigen")}</button>
          <button type="button" class="btn probe-weiter" hidden>${akt + 1 < runde.length ? T("Nächste Aufgabe →") : T("Zum Bericht →")}</button>
        </div>
        <div class="probe-loesung"></div>`;
      const $ = (s) => el.querySelector(s);
      Labor.tabelle($(".probe-tab"), { db: a.db });
      Labor.create($(".probe-labor"), Object.assign({ modus: "frei", tabellen: false, extra: o.extra || [] }, a, {
        probe: true, ok: "✔ Richtig!",
        onRun(info, ok) {
          if (r.status) return;
          r.versuche++;
          if (ok) { r.status = "ok"; fertig(); }
        },
      }));
      $(".probe-ab").addEventListener("click", () => {
        if (r.status) return;
        r.status = "ab";
        $(".probe-loesung").innerHTML = `<p class="fb show info">${T("So wäre es richtig gewesen:")}</p><pre class="sql">${sqlHTML(a.loesung)}</pre>`;
        fertig();
      });
      $(".probe-weiter").addEventListener("click", () => {
        akt++;
        if (akt < runde.length) aufgabe(); else bericht();
        el.scrollIntoView({ block: "start" });
      });
      function fertig() {
        $(".probe-ab").hidden = true;
        $(".probe-weiter").hidden = false;
        $(".tr-kopf").innerHTML = punkte();
        $(".probe-weiter").focus();
      }
    }

    function bericht() {
      const ok = runde.filter((r) => r.status === "ok").length;
      const zeilen = o.themen.map((th) => {
        const rs = runde.filter((r) => r.a.thema === th.key);
        const n = rs.filter((r) => r.status === "ok").length;
        const stufe = n === rs.length ? "sitzt" : n > 0 ? "fast" : "ueben";
        const zeichen = { sitzt: "✔", fast: "◐", ueben: "✘" }[stufe];
        const wort = { sitzt: T("sitzt"), fast: T("fast – noch einmal üben"), ueben: T("noch üben") }[stufe];
        const links = stufe === "sitzt" ? "" : ` <span class="probe-links">→ <a href="${th.href}">${T(th.lektion)}</a> · <a href="${th.href}#training">${T("Training")}</a></span>`;
        return `<tr class="${stufe}"><td class="probe-z" aria-label="${wort}">${zeichen}</td><td>${T(th.satz)}${links}</td><td class="probe-w">${n}/${rs.length} · ${wort}</td></tr>`;
      }).join("");
      const quote = ok / runde.length;
      const fazit = quote === 1 ? T("Alles richtig – du bist fit für die Probe!")
        : quote >= 0.75 ? T("Gut! Üb noch die Themen mit ◐ oder ✘.")
          : quote >= 0.5 ? T("Die Hälfte sitzt. Üb die Themen mit ✘ gezielt – dann noch ein Durchgang.")
            : T("Da ist noch Arbeit. Nimm dir die Themen mit ✘ einzeln vor – Lektion und Training helfen.");
      const datum = new Date().toLocaleDateString(window.I18N && I18N.lang === "en" ? "en-GB" : "de-DE");
      el.innerHTML = `<div class="probe-bericht">
          <p class="probe-druckkopf">${T(`Fit für die Probe – ${o.titel}`)} · ${esc(datum)} · ${T("Name:")} ____________________</p>
          <p class="probe-summe"><strong>${T(`${ok} von ${runde.length} Aufgaben richtig.`)}</strong> ${fazit}</p>
          <table class="probe-tabelle"><tbody>${zeilen}</tbody></table>
        </div>
        <div class="btn-row probe-knoepfe">
          <button type="button" class="btn probe-neu">↺ ${T("Neuer Durchgang")}</button>
          <button type="button" class="btn secondary probe-druck" data-tipp="${T("Druckt nur diesen Bericht – oder speichert ihn als PDF.")}">🖨 ${T("Bericht drucken")}</button>
        </div>`;
      el.querySelector(".probe-neu").addEventListener("click", () => { neueRunde(); aufgabe(); el.scrollIntoView({ block: "start" }); });
      el.querySelector(".probe-druck").addEventListener("click", () => {
        document.body.classList.add("probe-druck-modus");
        window.addEventListener("afterprint", () => document.body.classList.remove("probe-druck-modus"), { once: true });
        window.print();
      });
    }

    start();
  }

  Labor.probe = probe;
})();

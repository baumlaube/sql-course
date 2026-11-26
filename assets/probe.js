/* „Fit für die Probe“: eine Rampe statt eines Würfelbechers.
   1. Aufwärmen (mit Hilfe: Puzzle/Lücke, Tipps, Satzbau-Spicker) – damit jeder mit einem Erfolg startet.
   2. Probe-Niveau: je Thema ein paar Aufgaben, von leicht nach schwer (Reihenfolge der Lektionen), ohne Tipps.
   3. Profi-Aufgabe: alles zusammen, wie die letzte Aufgabe einer Probe.
   Am Ende ein Bericht je Thema („Ich kann …“), druckbar. Nichts wird gespeichert (Kioskmodus).

   Labor.probe(el, {
     titel: "Teil 2",
     themen: [{ key, satz: "Ich kann …", lektion: "Lektion 4", href: "04-where.html" }, …],
     aufwaermen: [{ schritt: 1, db, text, modus, sql?, bausteine?, loesung, hints }, …],   // je Schritt wird eine gezogen
     vorrat: [{ thema, db, text, loesung, reihenfolge? }, …],
     profi: [{ db, text, loesung }, …],                                                  // eine wird gezogen
     jeThema: 2, extra: ["AND", …],
   })
   Aufgaben, die als Frage gestellt sind, werden locker geprüft: Zusätzliche Spalten (z. B. SELECT *) sind erlaubt,
   solange die gesuchten Werte in den richtigen Zeilen stehen – wie bei der Korrektur einer Probe.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const { esc, T, sqlHTML } = Labor._intern;

  function mischen(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }

  /* Lockere Prüfung: Jede Spalte der Musterlösung muss im Ergebnis vorkommen (über den Namen oder über die Werte). */
  const schluessel = (v) => (typeof v === "number" ? String(Math.round(v * 1e6) / 1e6) : String(v));
  function locker({ res, ref }, reihenfolge) {
    if (!res.ok || !ref || !ref.ok || res.zeilen.length !== ref.zeilen.length || res.spalten.length <= ref.spalten.length) return undefined;
    const spalteVon = (z, j) => z.map((r) => schluessel(r[j]));
    const genutzt = new Set(), abbild = [];
    for (let j = 0; j < ref.spalten.length; j++) {
      const name = ref.spalten[j].toLowerCase();
      let k = res.spalten.findIndex((c, i) => !genutzt.has(i) && c.toLowerCase() === name);
      if (k < 0) {
        const soll = spalteVon(ref.zeilen, j).sort().join("|");
        k = res.spalten.findIndex((_, i) => !genutzt.has(i) && spalteVon(res.zeilen, i).sort().join("|") === soll);
      }
      if (k < 0) return undefined;
      genutzt.add(k); abbild.push(k);
    }
    const zeile = (r, idx) => idx.map((i) => schluessel(r[i])).join("‖");
    const a = res.zeilen.map((r) => zeile(r, abbild)), b = ref.zeilen.map((r) => zeile(r, ref.spalten.map((_, i) => i)));
    const gleich = reihenfolge ? a.join("\n") === b.join("\n") : a.slice().sort().join("\n") === b.slice().sort().join("\n");
    return gleich ? true : undefined;
  }

  function probe(el, o) {
    el.classList.add("probe");
    const je = o.jeThema || 2;
    const reihe = o.themen.map((t) => t.key);
    let runde = [], akt = 0;

    function neueRunde() {
      runde = [];
      // 1. Aufwärmen: je Schritt eine Aufgabe
      const schritte = [...new Set((o.aufwaermen || []).map((a) => a.schritt))].sort();
      schritte.forEach((s) => { const a = mischen(o.aufwaermen.filter((x) => x.schritt === s))[0]; runde.push({ a, art: "warm", status: null }); });
      // 2. Probe-Niveau: je Thema zufällig, Themen in der Reihenfolge der Lektionen (leicht → schwer)
      reihe.forEach((k) => mischen(o.vorrat.filter((a) => a.thema === k)).slice(0, je).forEach((a) => runde.push({ a, art: "probe", status: null })));
      // 3. Profi
      if (o.profi && o.profi.length) runde.push({ a: mischen(o.profi)[0], art: "profi", status: null });
      akt = 0;
    }

    function start() {
      const nW = [...new Set((o.aufwaermen || []).map((a) => a.schritt))].length, nP = o.themen.length * je;
      el.innerHTML = `<div class="probe-start">
          <ol class="probe-stufen">
            <li><strong>${T("Aufwärmen")}</strong> – ${T(`${nW} leichte Aufgaben. Hier darfst du Hilfe nehmen: Tipps und den Satzbau.`)}</li>
            <li><strong>${T("Probe-Niveau")}</strong> – ${T(`${nP} Aufgaben aus allen Lektionen, von leicht nach schwer. <strong>Ohne Tipps</strong>, wie in der Probe.`)}</li>
            <li><strong>${T("Profi")}</strong> – ${T("eine Aufgabe, in der alles zusammenkommt.")}</li>
          </ol>
          <p>${T("Du darfst so oft ausführen, wie du willst. Kommst du nicht weiter? Gib die Aufgabe ab – dann siehst du die Lösung.")}</p>
          <div class="btn-row"><button type="button" class="btn probe-los">▶ ${T("Los geht's")}</button></div>
        </div>`;
      el.querySelector(".probe-los").addEventListener("click", () => { neueRunde(); aufgabe(); });
    }

    function punkte() {
      return `<ol class="tr-punkte" aria-label="${T("Aufgaben")}">${runde.map((r, i) =>
        `<li><span class="tr-p ${r.art}${r.status === "ok" ? " ok" : r.status === "ab" ? " ab" : ""}${i === akt ? " akt" : ""}">${r.status === "ok" ? "✔" : r.status === "ab" ? "✘" : r.art === "profi" ? "★" : i + 1}</span></li>`).join("")}</ol>`;
    }

    const STUFE = () => ({ warm: T("Aufwärmen – mit Hilfe"), probe: T("Probe-Niveau – ohne Tipps"), profi: T("★ Profi-Aufgabe") });

    function aufgabe() {
      const r = runde[akt], a = r.a;
      const neueStufe = akt === 0 || runde[akt - 1].art !== r.art;
      el.innerHTML = `<div class="tr-kopf">${punkte()}</div>
        ${neueStufe && r.art === "probe" ? `<p class="fb show info">${T("Gut aufgewärmt! Jetzt wird es ernst: ab hier keine Tipps mehr – wie in der Probe.")}</p>` : ""}
        <p class="tr-nr"><span class="probe-stufe ${r.art}">${STUFE()[r.art]}</span> · ${T(`Aufgabe ${akt + 1} von ${runde.length}`)}</p>
        <p class="tr-text">${T(a.text)}</p>
        <div class="probe-tab"></div>
        <div class="probe-labor"></div>
        <div class="probe-hints"></div>
        <div class="btn-row">
          <button type="button" class="btn secondary probe-ab" data-tipp="${T("Die Aufgabe zählt dann als „noch üben“. Du siehst die Lösung.")}">${T("Abgeben – Lösung zeigen")}</button>
          <button type="button" class="btn probe-weiter" hidden>${akt + 1 < runde.length ? T("Nächste Aufgabe →") : T("Zum Bericht →")}</button>
        </div>
        <div class="probe-loesung"></div>`;
      const $ = (s) => el.querySelector(s);
      Labor.tabelle($(".probe-tab"), { db: a.db, offen: r.art === "warm" });
      const warm = r.art === "warm";
      const opts = Object.assign({ modus: "frei", tabellen: false, extra: warm ? [] : (o.extra || []) }, a, {
        probe: !warm, spicker: warm || undefined, ok: "✔ Richtig!",
        onRun(info, ok) { if (!r.status && ok) { r.status = "ok"; fertig(); } },
      });
      if (!warm && !a.streng) {
        const eigen = a.pruefe;
        opts.pruefe = (x) => (eigen && eigen(x)) || locker(x, !!a.reihenfolge);
      }
      Labor.create($(".probe-labor"), opts);
      if (warm && a.hints && window.Kurs) window.Kurs.hints($(".probe-hints"), a.hints);
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
      const probeR = runde.filter((r) => r.art === "probe");
      const ok = probeR.filter((r) => r.status === "ok").length;
      const warmR = runde.filter((r) => r.art === "warm"), warmOk = warmR.filter((r) => r.status === "ok").length;
      const profiR = runde.find((r) => r.art === "profi");
      const zeilen = o.themen.map((th) => {
        const rs = probeR.filter((r) => r.a.thema === th.key);
        const n = rs.filter((r) => r.status === "ok").length;
        const stufe = n === rs.length ? "sitzt" : n > 0 ? "fast" : "ueben";
        const zeichen = { sitzt: "✔", fast: "◐", ueben: "✘" }[stufe];
        const wort = { sitzt: T("sitzt"), fast: T("fast – noch einmal üben"), ueben: T("noch üben") }[stufe];
        const links = stufe === "sitzt" ? "" : ` <span class="probe-links">→ <a href="${th.href}">${T(th.lektion)}</a> · <a href="${th.href}#training">${T("Training")}</a></span>`;
        return `<tr class="${stufe}"><td class="probe-z" aria-label="${wort}">${zeichen}</td><td>${T(th.satz)}${links}</td><td class="probe-w">${n}/${rs.length} · ${wort}</td></tr>`;
      }).join("");
      const quote = ok / probeR.length;
      const fazit = quote === 1 ? T("Alles richtig – du bist fit für die Probe!")
        : quote >= 0.75 ? T("Gut! Üb noch die Themen mit ◐ oder ✘.")
          : quote >= 0.5 ? T("Die Hälfte sitzt. Üb die Themen mit ✘ gezielt – dann noch ein Durchgang.")
            : T("Da ist noch Arbeit. Nimm dir die Themen mit ✘ einzeln vor – Lektion und Training helfen.");
      const datum = new Date().toLocaleDateString(window.I18N && I18N.lang === "en" ? "en-GB" : "de-DE");
      el.innerHTML = `<div class="probe-bericht">
          <p class="probe-druckkopf">${T(`Fit für die Probe – ${o.titel}`)} · ${esc(datum)} · ${T("Name:")} ____________________</p>
          <p class="probe-summe"><strong>${T(`Probe-Niveau: ${ok} von ${probeR.length} Aufgaben richtig.`)}</strong> ${fazit}</p>
          <table class="probe-tabelle"><tbody>${zeilen}</tbody></table>
          <p class="probe-neben">${T(`Aufwärmen: ${warmOk} von ${warmR.length} geschafft.`)}
            ${profiR ? (profiR.status === "ok" ? T("★ Profi-Aufgabe geschafft – stark!") : T("★ Profi-Aufgabe noch nicht geschafft.")) : ""}</p>
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
  Labor._probeLocker = locker;   // für Tests
})();

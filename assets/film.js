/* Erklärfilm im echten Labor – statt eines Videos: übersetzbar, winzig, ohne Neu-Aufnehmen.
   Labor.film(el, {
     titel: "So funktioniert SELECT",
     db: "tonspur", vorschau: "songs",        // Tabelle, von der oben die ersten Zeilen gezeigt werden
     schritte: [
       { text: "① Was willst du sehen?", spalte: "titel", bausteine: ["SELECT", "titel"] },
       { text: "…", tippe: "…" },             // Text Buchstabe für Buchstabe tippen
       { text: "…", nach: "titel", bausteine: [",", "jahr"] },   // Bausteine hinter „titel“ einsetzen
       { text: "…", ausfuehren: true },
       { text: "…", ergebnis: true },        // Ergebnis hervorheben
       { text: "Jetzt du!", leeren: true },
     ],
   })
   Steuerung: ▶/⏸, ◀ Schritt zurück, ▶▶ Schritt vor, ↺ von vorn. Zurück = alles bis dahin sofort nachspielen.
   Einblendungen laufen über T() und damit über die Sprachhilfe.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const { esc, T, oeffnen, ergebnisHTML } = Labor._intern;
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  const ruhig = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function film(el, o) {
    el.classList.add("film");
    el.innerHTML = `
      <div class="film-start">
        <button type="button" class="btn film-los">▶ ${T("Film ansehen")}</button>
        <span class="muted">${T(o.titel || "")} · ${T(`${o.schritte.length} Schritte, ca. 1 Minute`)}</span>
      </div>
      <div class="film-buehne" hidden>
        <div class="film-text" aria-live="polite"></div>
        <div class="film-vorschau"></div>
        <div class="film-labor"></div>
        <div class="film-ctrl">
          <button type="button" class="btn secondary film-zurueck" aria-label="${T("Schritt zurück")}" data-tipp="${T("Schritt zurück")}">◀</button>
          <button type="button" class="btn film-pause">⏸ ${T("Pause")}</button>
          <button type="button" class="btn secondary film-vor" aria-label="${T("Schritt vor")}" data-tipp="${T("Schritt vor")}">▶▶</button>
          <button type="button" class="btn secondary film-neu" data-tipp="${T("Den Film von vorn abspielen")}">↺ ${T("Von vorn")}</button>
          <ol class="film-punkte" aria-hidden="true">${o.schritte.map(() => "<li></li>").join("")}</ol>
        </div>
      </div>`;
    const $ = (s) => el.querySelector(s);
    const text = $(".film-text");
    let lab = null, akt = -1, fertigBis = -1, laeuft = false, lauf = 0;   // fertigBis: letzter Schritt, dessen Aktionen ganz ausgeführt sind   // lauf: Zähler, damit ein abgebrochener Schritt nicht weiterläuft

    // Vorschau: die ersten Zeilen der Tabelle, Spalten zum Hervorheben
    Labor.bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db);
      const r = db.exec(`SELECT * FROM "${o.vorschau}" LIMIT ${o.zeilen || 4}`)[0];
      const n = db.exec(`SELECT COUNT(*) FROM "${o.vorschau}"`)[0].values[0][0];
      db.close();
      $(".film-vorschau").innerHTML = `<p class="film-tab"><span class="tabname">📋 ${esc(o.vorschau)}</span> <span class="muted">${T(`die ersten ${r.values.length} von ${n} Zeilen`)}</span></p>`
        + ergebnisHTML({ spalten: r.columns, zeilen: r.values });
    });

    function spalteZeigen(name) {
      el.querySelectorAll(".film-vorschau .film-an").forEach((c) => c.classList.remove("film-an"));
      if (!name) return;
      const tab = $(".film-vorschau table");
      if (!tab) return;
      const i = [...tab.querySelectorAll("th")].findIndex((th) => th.textContent.trim() === name);
      if (i < 0) return;
      tab.querySelectorAll("tr").forEach((tr) => { const c = tr.children[i]; if (c) c.classList.add("film-an"); });
    }

    function knopf(t) {
      return [...el.querySelectorAll(".film-labor .baustein")].find((b) => b.textContent === t);
    }

    /* Einen Schritt ausführen. sofort = ohne Pausen (zum Nachspielen beim Zurückspringen). */
    async function schritt(i, sofort) {
      const s = o.schritte[i], meinLauf = lauf;
      const ab = () => meinLauf !== lauf;          // abgebrochen?
      const p = (ms) => (sofort || ruhig ? Promise.resolve() : warte(ms));
      if (!sofort) {
        text.innerHTML = `<span>${T(s.text)}</span>`;
        text.classList.remove("neu"); void text.offsetWidth; text.classList.add("neu");
        el.querySelectorAll(".film-punkte li").forEach((li, k) => li.className = k < i ? "fertig" : k === i ? "jetzt" : "");
        el.querySelectorAll(".film-an, .film-puls").forEach((x) => x.classList.remove("film-an", "film-puls"));
        spalteZeigen(s.spalte);
      }
      if (s.leeren) lab.zuruecksetzen();
      let pos = null;
      if (s.nach) { const v = lab.feld.value, k = v.indexOf(s.nach); pos = k < 0 ? null : k + s.nach.length; }
      for (const b of s.bausteine || []) {
        await p(900); if (ab()) return;
        const k = knopf(b);
        if (k && !sofort) { k.classList.add("film-puls"); k.scrollIntoView({ block: "nearest" }); await p(700); if (ab()) return; k.classList.remove("film-puls"); }
        lab.einsetzen(b, pos);
        if (pos != null) pos = lab.feld.selectionStart;
      }
      if (s.tippe) {
        for (const ch of s.tippe) {
          if (!sofort) { await p(70); if (ab()) return; }
          lab.feld.value += ch;
        }
      }
      if (s.ausfuehren) {
        await p(700); if (ab()) return;
        const run = el.querySelector(".film-labor .labor-run");
        if (!sofort) { run.classList.add("film-puls"); await p(600); if (ab()) return; run.classList.remove("film-puls"); }
        lab.los();
      }
      if (s.ergebnis && !sofort) {
        await p(300);
        const erg = el.querySelector(".film-labor .labor-erg");
        if (erg) { erg.classList.add("film-an"); erg.scrollIntoView({ block: "nearest" }); }
      }
      fertigBis = i;
      if (sofort) return;
      // Lesezeit: etwa 2,5 s plus 55 ms je Zeichen
      const lese = 2500 + T(s.text).replace(/<[^>]+>/g, "").length * 55;
      await warte(ruhig ? lese + 1500 : lese);
      if (ab()) return;
      if (laeuft) gehe(i + 1);
    }

    function gehe(i) {
      lauf++;
      if (i >= o.schritte.length) { laeuft = false; knoepfe(); return; }
      if (i < 0) i = 0;
      akt = i;
      knoepfe();
      if (i === 0) { lab.zuruecksetzen(); fertigBis = -1; schritt(0, false); return; }
      if (fertigBis === i - 1) { schritt(i, false); return; }
      // Sonst: Zustand bis vor Schritt i sofort herstellen, dann Schritt i abspielen
      const meinLauf = lauf;
      lab.zuruecksetzen(); fertigBis = -1;
      (async () => {
        for (let k = 0; k < i; k++) { await schritt(k, true); if (meinLauf !== lauf) return; }
        schritt(i, false);
      })();
    }

    function knoepfe() {
      $(".film-pause").innerHTML = laeuft ? `⏸ ${T("Pause")}` : `▶ ${T("Weiter")}`;
      $(".film-zurueck").disabled = akt <= 0;
      $(".film-vor").disabled = akt >= o.schritte.length - 1;
    }

    $(".film-los").addEventListener("click", () => {
      $(".film-start").hidden = true;
      $(".film-buehne").hidden = false;
      if (!lab) lab = Labor.create($(".film-labor"), { db: o.db, modus: "frei", tabellen: false, spicker: false, zeilen: 2 });
      laeuft = true;
      const anfangen = () => (lab.feld ? gehe(0) : setTimeout(anfangen, 50));   // warten, bis das Labor gebaut ist
      anfangen();
      el.scrollIntoView({ block: "start", behavior: ruhig ? "auto" : "smooth" });
    });
    $(".film-pause").addEventListener("click", () => {
      if (laeuft) { laeuft = false; knoepfe(); }      // Pause: der Schritt spielt zu Ende, dann bleibt der Film stehen
      else { laeuft = true; gehe(akt >= o.schritte.length - 1 ? 0 : akt + 1); }
    });
    $(".film-vor").addEventListener("click", () => { laeuft = false; gehe(akt + 1); });
    $(".film-zurueck").addEventListener("click", () => { laeuft = false; gehe(akt - 1); });
    $(".film-neu").addEventListener("click", () => { laeuft = true; akt = -1; gehe(0); });
  }

  Labor.film = film;
})();

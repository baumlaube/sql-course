/* Erklärfilm im echten Labor – statt eines Videos: übersetzbar, winzig, ohne Neu-Aufnehmen.
   Zwei Phasen (Wunsch der Lehrkraft, 26.11.2026):
   1. Verstehen – nur die Tabelle, ein deutscher Satz und das SQL darunter. Keine Knöpfe, nichts lenkt ab.
      Gleiche Teile tragen gleiche Farben: Spalte blau, Tabelle gelb. Ein Pfeil zeigt, worum es gerade geht.
   2. Wiederholung im Labor – jetzt erst erscheint die Oberfläche: Bausteine pulsieren, Ausführen, Ergebnis.

   Labor.film(el, {
     titel: "So funktioniert SELECT",
     db: "tonspur", vorschau: "songs",
     paare: [["Zeig mir", "SELECT"], ["die Titel", "titel", "spalte"], ["aus der Tabelle", "FROM"], ["songs", "songs", "tabelle"]],
                                              // deutscher Satz und SQL, Teil für Teil übereinander
     schritte: [
       { text: "…" },                                   // nur Einblendung
       { text: "…", zeige: "satz" },                    // Satz erscheint (zeige: "sql" | "labor" ebenso)
       { text: "…", markiere: "spalte", spalte: "titel" },   // Spalte blau + Pfeil (Satzteil, SQL-Teil, Tabellenspalte)
       { text: "…", markiere: "tabelle" },              // Tabelle gelb + Pfeil
       { text: "…", zeige: "labor", spalte: "titel", bausteine: ["SELECT", "titel"] },
       { text: "…", nach: "titel", bausteine: [",", "jahr"] },   // hinter „titel“ einsetzen
       { text: "…", tippe: "…" }, { text: "…", ausfuehren: true }, { text: "…", ergebnis: true },
       { text: "Jetzt du!", leeren: true },
     ],
   })
   Markierungen bleiben bis zum Ende stehen (der Pfeil wandert zum Neuen). Steuerung: ◀ ⏸/▶ ▶▶ ↺.
   Zurück = alles bis dahin sofort nachspielen. Einblendungen laufen über T() und damit über die Sprachhilfe.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
(function () {
  "use strict";
  const { esc, T, oeffnen, ergebnisHTML } = Labor._intern;
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  const ruhig = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LESEN_GRUND = 3500, LESEN_JE_ZEICHEN = 70, BAUSTEIN_PAUSE = 1300, PULS = 1000, TIPPEN = 90;

  /* Satz und SQL als Übersetzungstabelle: Jeder deutsche Teil steht genau über seinem SQL-Teil. */
  const uebersetzung = (paare) => `<table class="film-ueb">
      <tr class="film-de"><th>${T("Deutsch")}</th>${paare.map(([de, , art]) => `<td class="film-teil${art ? " art-" + art : ""}">${T(de)}</td>`).join("")}</tr>
      <tr class="film-sql" hidden><th>SQL</th>${paare.map(([, sq, art]) => `<td class="film-teil${art ? " art-" + art : ""}"><code>${esc(sq)}</code></td>`).join("")}</tr>
    </table>`;

  function film(el, o) {
    el.classList.add("film");
    const dauer = o.schritte.reduce((s, x) => s + LESEN_GRUND + T(x.text).replace(/<[^>]+>/g, "").length * LESEN_JE_ZEICHEN
      + (x.bausteine || []).length * (BAUSTEIN_PAUSE + PULS), 0);
    const min = Math.max(1, Math.round(dauer / 60000));
    el.innerHTML = `
      <button type="button" class="film-start film-los" aria-label="${T("Film ansehen")}: ${T(o.titel || "")}">
        <span class="film-poster" aria-hidden="true"></span>
        <span class="film-play" aria-hidden="true"></span>
        <span class="film-titel">${T(o.titel || "")}</span>
        <span class="film-dauer">▶ ${T("Film ansehen")} · ${min === 1 ? T("ca. 1 Minute") : T(`ca. ${min} Minuten`)}</span>
      </button>
      <div class="film-buehne" hidden>
        <div class="film-text" aria-live="polite"></div>
        <div class="film-vorschau"></div>
        <div class="film-satz" hidden>${uebersetzung(o.paare || [])}</div>
        <div class="film-labor" hidden></div>
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
    let lab = null, akt = -1, fertigBis = -1, laeuft = false, lauf = 0;

    // Vorschau: die ersten Zeilen der Tabelle
    Labor.bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db);
      const r = db.exec(`SELECT * FROM "${o.vorschau}" LIMIT ${o.zeilen || 4}`)[0];
      const n = db.exec(`SELECT COUNT(*) FROM "${o.vorschau}"`)[0].values[0][0];
      db.close();
      $(".film-poster").innerHTML = ergebnisHTML({ spalten: r.columns, zeilen: r.values });
      $(".film-vorschau").innerHTML = `<p class="film-tab"><span class="tabname">📋 ${esc(o.vorschau)}</span> <span class="muted">${T(`die ersten ${r.values.length} von ${n} Zeilen`)}</span></p>`
        + ergebnisHTML({ spalten: r.columns, zeilen: r.values });
    });

    /* ---- Markierungen ---- */
    function spalteMarkieren(name, pfeil) {
      const tab = $(".film-vorschau table");
      if (!tab || !name) return;
      const i = [...tab.querySelectorAll("th")].findIndex((th) => th.textContent.trim() === name);
      if (i < 0) return;
      tab.querySelectorAll("tr").forEach((tr) => { const c = tr.children[i]; if (c) c.classList.add("film-sp"); });
      if (pfeil) tab.querySelectorAll("th")[i].classList.add("film-pfeil");
    }
    function markiere(art, spalte) {
      el.querySelectorAll(".film-pfeil").forEach((x) => x.classList.remove("film-pfeil"));
      el.querySelectorAll(`.film-satz .art-${art}`).forEach((x) => x.classList.add("an"));
      if (art === "spalte") spalteMarkieren(spalte, true);
      if (art === "tabelle") { const t = $(".film-tab .tabname"); if (t) t.classList.add("film-pfeil", "an"); }
    }
    function buehneLeeren() {
      lab && lab.zuruecksetzen();
      $(".film-satz").hidden = true; $(".film-sql").hidden = true; $(".film-labor").hidden = true;
      el.querySelectorAll(".an, .film-sp, .film-pfeil, .film-puls, .film-erg").forEach((x) => x.classList.remove("an", "film-sp", "film-pfeil", "film-puls", "film-erg"));
      fertigBis = -1;
    }
    const knopf = (t) => [...el.querySelectorAll(".film-labor .baustein")].find((b) => b.textContent === t);

    /* Einen Schritt ausführen. sofort = ohne Pausen (zum Nachspielen beim Zurückspringen). */
    async function schritt(i, sofort) {
      const s = o.schritte[i], meinLauf = lauf;
      const ab = () => meinLauf !== lauf;
      const p = (ms) => (sofort || ruhig ? Promise.resolve() : warte(ms));
      if (!sofort) {
        text.innerHTML = `<span>${T(s.text)}</span>`;
        text.classList.remove("neu"); void text.offsetWidth; text.classList.add("neu");
        el.querySelectorAll(".film-punkte li").forEach((li, k) => li.className = k < i ? "fertig" : k === i ? "jetzt" : "");
        // Kinomodus: Alles außerhalb des Films tritt zurück – bis zum letzten Schritt („Jetzt du!“)
        document.body.classList.toggle("film-kino", i < o.schritte.length - 1);
        el.querySelectorAll(".film-puls").forEach((x) => x.classList.remove("film-puls"));
      }
      if (s.zeige === "satz") $(".film-satz").hidden = false;
      if (s.zeige === "sql") { $(".film-satz").hidden = false; $(".film-sql").hidden = false; }
      if (s.zeige === "labor") { $(".film-labor").hidden = false; }
      if (s.markiere) { await p(500); if (ab()) return; markiere(s.markiere, s.spalte); }
      else if (s.spalte) spalteMarkieren(s.spalte, !sofort);
      if (s.leeren) { lab.zuruecksetzen(); el.querySelectorAll(".film-erg").forEach((x) => x.classList.remove("film-erg")); }
      let pos = null;
      if (s.nach) { const v = lab.feld.value, k = v.indexOf(s.nach); pos = k < 0 ? null : k + s.nach.length; }
      for (const b of s.bausteine || []) {
        await p(BAUSTEIN_PAUSE); if (ab()) return;
        const k = knopf(b);
        if (k && !sofort) {
          k.classList.add("film-puls", k.classList.contains("name") && !k.classList.contains("tab") ? "puls-sp" : "puls-tab");
          k.scrollIntoView({ block: "nearest" });
          await p(PULS); if (ab()) return;
          k.classList.remove("film-puls", "puls-sp", "puls-tab");
        }
        lab.einsetzen(b, pos);
        if (pos != null) pos = lab.feld.selectionStart;
      }
      if (s.tippe) for (const ch of s.tippe) { if (!sofort) { await p(TIPPEN); if (ab()) return; } lab.feld.value += ch; }
      if (s.ausfuehren) {
        await p(900); if (ab()) return;
        const run = el.querySelector(".film-labor .labor-run");
        if (!sofort) { run.classList.add("film-puls"); await p(PULS); if (ab()) return; run.classList.remove("film-puls"); }
        lab.los();
      }
      if (s.ergebnis) {
        await p(400);
        const erg = el.querySelector(".film-labor .labor-erg");
        if (erg) { erg.classList.add("film-erg"); if (!sofort) erg.scrollIntoView({ block: "nearest" }); }
      }
      fertigBis = i;
      if (sofort) return;
      const lese = LESEN_GRUND + T(s.text).replace(/<[^>]+>/g, "").length * LESEN_JE_ZEICHEN;
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
      if (i === 0) { buehneLeeren(); schritt(0, false); return; }
      if (fertigBis === i - 1) { schritt(i, false); return; }
      // Sonst: Zustand bis vor Schritt i sofort herstellen, dann Schritt i abspielen
      const meinLauf = lauf;
      buehneLeeren();
      (async () => {
        for (let k = 0; k < i; k++) { await schritt(k, true); if (meinLauf !== lauf) return; }
        el.querySelectorAll(".film-pfeil").forEach((x) => x.classList.remove("film-pfeil"));
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
    $(".film-neu").addEventListener("click", () => { laeuft = true; gehe(0); });
  }

  Labor.film = film;
})();

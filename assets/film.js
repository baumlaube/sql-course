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
       { text: "…", markiere: "tabelle" },              // Tabelle gelb + Pfeil (auch als Liste: ["spalte", "tabelle"])
       { text: "…", zeige: "satz", bis: 4 },            // nur die ersten 4 Teile des Satzes – später { bis: 6 } hängt an
       { text: "…", markiere: "bedingung", spalte: "genre" },  // Bedingung grün (Satzteil, SQL-Teil, Spalte)
       { text: "…", zeilen: "genre = 'Pop'" },          // Zeilen der Vorschau grün, die passen (SQL-Bedingung)
       { text: "…", blass: true },                      // die übrigen Zeilen werden blass
       { text: "…", markiere: "bedingung", teil: 7, spalte: "jahr" },   // nur Satzteil Nr. 7 (ab 0 gezählt) markieren
       { text: "…", pruefe: "jahr = 2024", spalte: "jahr" },            // Zellen der Spalte mit ✓, wo die Bedingung stimmt
       { text: "…", tausche: [6, "oder", "OR"], ersetze: ["AND", "OR"] },  // Satzteil austauschen, im Labor ersetzen
       { text: "…", muster: "B%", spalte: "titel" },
       { text: "…", markiere: "ordnen", spalte: "dauer_sek", ordnen: "dauer_sek DESC" },  // Spalte türkis, Zeilen gleiten an ihren Platz
       { text: "…", markiere: "limit", abschneiden: 3 },
       { text: "…", markiere: "gruppe", gruppen: "genre" },  // gleiche Werte rücken zusammen, jede Gruppe eine Farbe
       { text: "…", zaehle: "genre" },
       // JOIN: vorschau: [{ tabelle: "songs", spalten: "titel, kuenstler_id", zeilen: 6 }, { tabelle: "kuenstler", … }]
       //       spalte: "kuenstler.name" (Tabelle davor), markiere: "tabelle", tabelle: "kuenstler", teil: -1 = nur in der Tabelle
       { text: "…", verbinde: "songs.kuenstler_id = kuenstler.id" },   // gleiche Nummer = gleiche Farbe in beiden Tabellen
       { text: "…", verbund: "SELECT s.titel, k.name, k.id FROM … LIMIT 6" },   // verbundenes Ergebnis; letzte Spalte färbt
       // CREATE: Option neu: "besitzer" (leere Tabelle ohne Vorschau) – Schritt spalteNeu: ["vorname", "TEXT"]
       // INSERT: Option ende: true (die letzten Zeilen) – Schritt neueZeile: { vorname: "Tom" } (id kommt von selbst)
       // Begriffe ohne SQL (L1): Option kopf: ["Im Alltag", "Fachwort"] statt Deutsch/SQL; zelle: { spalte, wo } = ein Feld orange
       // UPDATE: aendere: { spalte: "alter_jahre", wert: 3, wo: "id = 3" } – DELETE: loesche: "id = 4"
       // bausteine: ["CREATE TABLE", "✎besitzer ", "("] – mit ✎ wird getippt statt angetippt; labor: { … } = weitere Labor-Optionen                  // unter der Vorschau: je Gruppe eine Zeile mit der Anzahl  // ab Zeile 4: Schnittlinie, Rest blass (spalte darf auch eine Liste sein)    // LIKE-Muster in der Spalte zeigen: feste Buchstaben grün, das % gestrichelt
       { text: "…", zeige: "labor", spalte: "titel", bausteine: ["SELECT", "titel"] },
       { text: "…", nach: "titel", bausteine: [",", "jahr"] },   // hinter „titel“ einsetzen
       { text: "…", tippe: "…" }, { text: "…", ausfuehren: true }, { text: "…", ergebnis: true },
       { text: "Jetzt du!", leeren: true },
     ],
     zeilen: 8,                                         // so viele Zeilen zeigt die Vorschau (sonst 4)
     spalten: "id, titel, genre",            // nur diese Spalten in der Vorschau (sonst alle) – passt aufs Handy
     extra: ["AND", "OR"],                              // zusätzliche Bausteine im Labor (spätere Lektionen)
     nurTabellen: ["songs", "kuenstler"],               // nur diese Tabellen in der Bausteinleiste (Reduktion)
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

  /* Satz und SQL als Übersetzung: Jeder deutsche Teil steht genau über seinem SQL-Teil.
     Jedes Paar ist ein eigenes Kästchen (Deutsch oben, SQL unten) – so bricht ein langer Satz am Handy um. */
  const uebersetzung = (paare, kopf) => `<div class="film-ueb">
      <span class="film-paar film-kopf"><span>${T(kopf ? kopf[0] : "Deutsch")}</span><span class="film-sql">${kopf ? T(kopf[1]) : "SQL"}</span></span>
      ${paare.map(([de, sq, art], i) => { const k = `film-teil${art ? " art-" + art : ""}`;
        return `<span class="film-paar" data-i="${i}"><span class="${k}">${T(de)}</span><span class="${k} film-sql"><code>${kopf ? T(sq) : esc(sq)}</code></span></span>`; }).join("")}
    </div>`;

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
        <div class="film-satz" hidden>${uebersetzung(o.paare || [], o.kopf)}</div>
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
    let vorschauHTML = "";
    let lab = null, akt = -1, fertigBis = -1, laeuft = false, lauf = 0;
    const treffer = {};          // SQL-Bedingung → [true/false je Vorschauzeile]

    // Vorschau: die ersten Zeilen der Tabelle – oder mehrerer Tabellen nebeneinander (JOIN)
    const vors = o.neu ? [] : Array.isArray(o.vorschau) ? o.vorschau : [{ tabelle: o.vorschau, spalten: o.spalten, zeilen: o.zeilen, ende: o.ende }];
    const naechsteId = {};       // Tabelle → nächste id (für neueZeile)
    const verbund = {};          // Schritt-SQL → Ergebnis (für „so sieht das zusammen aus“)
    Labor.bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db), v0 = vors[0] || {};
      if (v0.tabelle) o.schritte.flatMap((x) => [x.zeilen, x.pruefe, x.loesche, x.aendere && x.aendere.wo, x.zelle && x.zelle.wo]).filter(Boolean).forEach((b) => {
        treffer[b] = db.exec(`SELECT (${b}) FROM "${v0.tabelle}" LIMIT ${v0.zeilen || 4}`)[0].values.map((v) => !!v[0]);
      });
      o.schritte.filter((x) => x.verbund).forEach((x) => { verbund[x.verbund] = db.exec(x.verbund)[0]; });
      vorschauHTML = vors.map((v, k) => {
        // ende: die letzten Zeilen statt der ersten (z. B. bei INSERT: Dort kommt die neue Zeile dazu)
        const r = db.exec(v.ende
          ? `SELECT ${v.spalten || "*"} FROM "${v.tabelle}" WHERE rowid IN (SELECT rowid FROM "${v.tabelle}" ORDER BY rowid DESC LIMIT ${v.zeilen || 4}) ORDER BY rowid`
          : `SELECT ${v.spalten || "*"} FROM "${v.tabelle}" LIMIT ${v.zeilen || 4}`)[0];
        const n = db.exec(`SELECT COUNT(*) FROM "${v.tabelle}"`)[0].values[0][0];
        naechsteId[v.tabelle] = db.exec(`SELECT COALESCE(MAX(rowid), 0) + 1 FROM "${v.tabelle}"`)[0].values[0][0];
        const wie = v.ende ? T(`die letzten ${r.values.length} von ${n} Zeilen`) : T(`die ersten ${r.values.length} von ${n} Zeilen`);
        if (k === 0) $(".film-poster").innerHTML = ergebnisHTML({ spalten: r.columns, zeilen: r.values });
        return `<div class="film-vt" data-t="${esc(v.tabelle)}"><p class="film-tab"><span class="tabname">📋 ${esc(v.tabelle)}</span> <span class="muted">${wie}</span></p>`
          + ergebnisHTML({ spalten: r.columns, zeilen: r.values }) + "</div>";
      }).join("") + (o.neu ? `<div class="film-vt" data-t="${esc(o.neu)}"><p class="film-tab"><span class="tabname">📋 ${esc(o.neu)}</span> <span class="muted">${T("neu – noch leer")}</span></p>
        <div class="labor-scroll"><table class="labor-tab film-neutab"><thead><tr class="film-namen"></tr><tr class="film-typen"></tr></thead>
        <tbody><tr><td class="film-leer">${T("noch keine Spalten")}</td></tr></tbody></table></div></div>` : "");
      db.close();
      $(".film-vorschau").innerHTML = vorschauHTML;
      $(".film-vorschau").classList.toggle("film-mehrere", vors.length > 1);
    });
    /* „tabelle.spalte“ → [Tabelle im Film, Spaltennummer]; ohne Punkt: die erste Tabelle */
    function finde(name) {
      const [t, c] = name.includes(".") ? name.split(".") : [null, name];
      const tab = t ? $(`.film-vt[data-t="${t}"] table`) : $(".film-vorschau table");
      if (!tab) return [null, -1];
      return [tab, [...tab.querySelectorAll("th")].findIndex((th) => th.textContent.trim() === c)];
    }

    /* ---- Markierungen ---- */
    function spalteMarkieren(name, pfeil, klasse = "film-sp") {
      if (Array.isArray(name)) { name.forEach((n) => spalteMarkieren(n, pfeil, klasse)); return; }
      if (!name) return;
      const [tab, i] = finde(name);
      if (i < 0) return;
      tab.querySelectorAll("tr").forEach((tr) => { const c = tr.children[i]; if (c) c.classList.add(klasse); });
      if (pfeil) tab.querySelectorAll("th")[i].classList.add("film-pfeil");
    }
    function markiere(art, spalte, pfeil = true, teil = null) {
      el.querySelectorAll(".film-pfeil").forEach((x) => x.classList.remove("film-pfeil"));
      // teil: eine Nummer oder eine Liste (z. B. [6, 7]); ohne teil: alle Satzteile dieser Art
      const wo = teil == null ? [".film-satz"] : [].concat(teil).map((t) => `.film-satz .film-paar[data-i="${t}"]`);
      el.querySelectorAll(wo.map((w) => `${w} .art-${art}`).join(",")).forEach((x) => x.classList.add("an"));
      if (art === "spalte") spalteMarkieren(spalte, pfeil);
      if (art === "bedingung") spalteMarkieren(spalte, pfeil, "film-bd");
      if (art === "ordnen") spalteMarkieren(spalte, pfeil, "film-so");
      if (art === "gruppe") spalteMarkieren(spalte, pfeil, "film-gr");
      if (art === "wert") spalteMarkieren(spalte, pfeil, "film-wt");
      if (art === "tabelle") {
        const t = spalte ? [...el.querySelectorAll(".film-tab .tabname")].find((x) => x.textContent.includes(spalte)) : $(".film-tab .tabname");
        if (t) t.classList.add("an"); if (t && pfeil) t.classList.add("film-pfeil"); }
    }
    function zeilenMarkieren(bed) {
      const tr = [...el.querySelectorAll(".film-vorschau tbody tr")], ja = treffer[bed] || [];
      tr.forEach((z, k) => { z.classList.toggle("film-treffer", !!ja[k]); z.classList.remove("film-raus"); });
    }
    /* Zellen einer Spalte prüfen: ✓ dort, wo die Bedingung stimmt */
    function zellenPruefen(bed, name) {
      const tab = $(".film-vorschau table");
      if (!tab) return;
      const i = [...tab.querySelectorAll("th")].findIndex((th) => th.textContent.trim() === name), ja = treffer[bed] || [];
      if (i < 0) return;
      tab.querySelectorAll("tbody tr").forEach((z, k) => { if (ja[k] && z.children[i]) z.children[i].classList.add("film-ok"); });
    }
    function teileZeigen(bis) {
      el.querySelectorAll(".film-ueb .film-paar[data-i]").forEach((x) => { x.hidden = bis != null && +x.dataset.i >= bis; });
    }
    /* LIKE-Muster sichtbar machen: In jeder passenden Zelle werden die festen Buchstaben grün,
       was das % (beliebig viel Text) abdeckt, steht gestrichelt. _ = genau ein Zeichen. */
    function musterZeigen(muster, name) {
      const tab = $(".film-vorschau table");
      if (!tab) return;
      const i = [...tab.querySelectorAll("th")].findIndex((th) => th.textContent.trim() === name);
      if (i < 0) return;
      const teile = muster.split("%");
      const re = new RegExp("^" + teile.map((t) => "(" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/_/g, ".") + ")").join("(.*?)") + "$", "is");
      tab.querySelectorAll("tbody tr").forEach((z) => {
        const c = z.children[i], m = c && c.textContent.match(re);
        if (!m) return;
        c.innerHTML = m.slice(1).map((g, k) => !g ? "" : k % 2 ? `<span class="film-rest">${esc(g)}</span>` : `<mark class="film-fix">${esc(g)}</mark>`).join("");
      });
    }
    /* Sortieren sichtbar machen: Zeilen gleiten an ihren neuen Platz (FLIP). ordnen = "spalte DESC" oder "spalte" */
    function zeilenOrdnen(ordnen, sofort) {
      const tab = $(".film-vorschau table");
      if (!tab) return;
      const [name, richtung] = ordnen.trim().split(/\s+/), ab = /^desc$/i.test(richtung || "");
      const i = [...tab.querySelectorAll("th")].findIndex((th) => th.textContent.trim() === name);
      if (i < 0) return;
      const body = tab.querySelector("tbody"), zeilen = [...body.children];
      const vorher = new Map(zeilen.map((z) => [z, z.getBoundingClientRect().top]));
      const wert = (z) => { const t = z.children[i].textContent.trim(); return t !== "" && !isNaN(t) ? +t : t.toLowerCase(); };
      zeilen.sort((a, b) => { const x = wert(a), y = wert(b); return (x < y ? -1 : x > y ? 1 : 0) * (ab ? -1 : 1); });
      zeilen.forEach((z) => body.appendChild(z));
      if (sofort || ruhig) return;
      zeilen.forEach((z) => {
        const d = vorher.get(z) - z.getBoundingClientRect().top;
        if (!d) return;
        z.style.transition = "none"; z.style.transform = `translateY(${d}px)`;
      });
      void body.offsetWidth;
      zeilen.forEach((z) => { z.style.transition = "transform 1.6s ease-in-out, opacity .6s"; z.style.transform = ""; });
    }
    /* GROUP BY sichtbar machen: gleiche Werte rücken zusammen (Gleiten wie beim Sortieren), jede Gruppe bekommt eine Farbe */
    const spaltenNr = (name) => [...el.querySelectorAll(".film-vorschau th")].findIndex((th) => th.textContent.trim() === name);
    function gruppieren(name, sofort) {
      zeilenOrdnen(name, sofort);
      const i = spaltenNr(name), werte = [];
      el.querySelectorAll(".film-vorschau tbody tr").forEach((z) => {
        const w = z.children[i].textContent.trim();
        if (!werte.includes(w)) werte.push(w);
        z.classList.add("film-g" + (werte.indexOf(w) % 6));
      });
    }
    function zaehlen(name) {
      const i = spaltenNr(name), zahl = new Map();
      el.querySelectorAll(".film-vorschau tbody tr").forEach((z) => { const w = z.children[i].textContent.trim(); zahl.set(w, (zahl.get(w) || 0) + 1); });
      const box = document.createElement("div");
      box.className = "film-gruppen";
      box.innerHTML = `<p class="film-tab"><span class="muted">${T("Ergebnis für diese Zeilen")}</span></p>
        <table class="labor-tab"><thead><tr><th>${esc(name)}</th><th>COUNT(*)</th></tr></thead><tbody>
        ${[...zahl].map(([w, n], k) => `<tr class="film-g${k % 6}"><td>${esc(w)}</td><td class="zahl">${n}</td></tr>`).join("")}</tbody></table>`;
      $(".film-vorschau").appendChild(box);
    }
    /* JOIN sichtbar machen: gleiche Nummer = gleiche Farbe, in beiden Tabellen. verbinde = "songs.kuenstler_id = kuenstler.id" */
    let farbe = new Map();
    function verbinden(bed) {
      const [links, rechts] = bed.split("=").map((x) => finde(x.trim()));
      const wert = ([tab, i]) => [...tab.querySelectorAll("tbody tr")].map((z) => z.children[i]);
      const l = wert(links), r = wert(rechts), rWerte = new Set(r.map((c) => c.textContent.trim()));
      farbe = new Map();
      // Eine neue Verbindung ersetzt die Farben der vorigen (bei drei Tabellen: erst Song → Künstler, dann Künstler → Label)
      el.querySelectorAll(".film-vt td.film-gz").forEach((c) => c.className = c.className.replace(/\bfilm-gz\b|\bfilm-g\d\b/g, "").trim());
      l.forEach((c) => { const w = c.textContent.trim(); if (rWerte.has(w) && !farbe.has(w)) farbe.set(w, farbe.size % 6); });
      [...l, ...r].forEach((c) => { const w = c.textContent.trim(); if (farbe.has(w)) c.classList.add("film-gz", "film-g" + farbe.get(w)); });
    }
    /* Das verbundene Ergebnis zeigen: letzte Spalte der Abfrage = Nummer (nur für die Farbe, wird nicht gezeigt) */
    function verbundZeigen(sql) {
      const r = verbund[sql];
      if (!r) return;
      const box = document.createElement("div");
      box.className = "film-gruppen film-verbund";
      box.innerHTML = `<p class="film-tab"><span class="muted">${T("Ergebnis für diese Zeilen")}</span></p>
        <table class="labor-tab"><thead><tr>${r.columns.slice(0, -1).map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>
        ${r.values.map((z) => { const f = farbe.get(String(z[z.length - 1]));
          return `<tr${f != null ? ` class="film-g${f}"` : ""}>${z.slice(0, -1).map((v) => `<td>${esc(String(v))}</td>`).join("")}</tr>`; }).join("")}</tbody></table>`;
      $(".film-vorschau").appendChild(box);
    }
    /* CREATE TABLE sichtbar machen: Spalte für Spalte kommt dazu – Name (blau) und darunter der Datentyp */
    function spalteNeu([name, typ]) {
      const tab = $(".film-neutab");
      if (!tab) return;
      tab.querySelector(".film-namen").insertAdjacentHTML("beforeend", `<th class="film-sp film-neu-teil">${esc(name)}</th>`);
      tab.querySelector(".film-typen").insertAdjacentHTML("beforeend", `<th class="film-typ film-neu-teil">${esc(typ)}</th>`);
      const n = tab.querySelectorAll(".film-namen th").length, leer = tab.querySelector(".film-leer");
      leer.colSpan = n; leer.textContent = T("noch keine Zeile");
    }
    /* INSERT sichtbar machen: unten kommt eine neue Zeile dazu. Nicht angegebene id = die nächste Nummer (vergibt die Datenbank) */
    function neueZeile(werte) {
      const tab = $(".film-vorschau table");
      if (!tab) return;
      const namen = [...tab.querySelectorAll("th")].map((th) => th.textContent.trim()), t = $(".film-vt") && $(".film-vt").dataset.t;
      tab.querySelector("tbody").insertAdjacentHTML("beforeend", `<tr class="film-neuzeile">${namen.map((c) =>
        c in werte ? `<td>${esc(String(werte[c]))}</td>` : c === "id" ? `<td class="film-auto zahl">${naechsteId[t] ?? ""}</td>` : "<td></td>").join("")}</tr>`);
    }
    /* UPDATE sichtbar machen: In den passenden Zeilen wird der alte Wert durchgestrichen, der neue steht daneben */
    function aendern({ spalte, wert, wo }) {
      const [tab, i] = finde(spalte), ja = treffer[wo] || [];
      if (i < 0) return;
      tab.querySelectorAll("tbody tr").forEach((z, k) => {
        if (!ja[k]) return;
        const c = z.children[i];
        c.innerHTML = `<del>${esc(c.textContent)}</del> → <b>${esc(String(wert))}</b>`;
        c.classList.add("film-geaendert");
      });
    }
    /* DELETE sichtbar machen: passende Zeilen werden rot durchgestrichen und verschwinden dann */
    async function loeschen(bed, p, ab) {
      const ja = treffer[bed] || [], weg = [...el.querySelectorAll(".film-vorschau tbody tr")].filter((z, k) => ja[k]);
      weg.forEach((z) => z.classList.add("film-loesch"));
      await p(1500); if (ab()) return;
      weg.forEach((z) => z.classList.add("film-weg"));
    }
    /* Ein einzelnes Feld markieren (Wert): orange, mit Pfeil. zelle = { spalte: "kuenstler", wo: "id = 3" } */
    function zelleMarkieren({ spalte, wo }) {
      const [tab, i] = finde(spalte), ja = treffer[wo] || [];
      if (i < 0) return;
      el.querySelectorAll(".film-pfeil").forEach((x) => x.classList.remove("film-pfeil"));
      tab.querySelectorAll("tbody tr").forEach((z, k) => { if (ja[k]) z.children[i].classList.add("film-zelle", "film-pfeil"); });
    }
    function abschneiden(n) {
      el.querySelectorAll(".film-vorschau tbody tr").forEach((z, k) => {
        z.classList.toggle("film-raus", k >= n); z.classList.toggle("film-schnitt", k === n);
      });
    }
    function buehneLeeren() {
      if (vorschauHTML) $(".film-vorschau").innerHTML = vorschauHTML;   // Vorschau frisch (auch Muster-Markierungen weg)
      lab && lab.zuruecksetzen();
      $(".film-labor").hidden = true;
      $(".film-satz").hidden = true; $(".film-satz").innerHTML = uebersetzung(o.paare || [], o.kopf);   // auch Getauschtes zurück
      el.querySelectorAll(".an, .film-sp, .film-bd, .film-ok, .film-pfeil, .film-puls, .film-erg, .film-treffer, .film-raus").forEach((x) =>
        x.classList.remove("an", "film-sp", "film-bd", "film-ok", "film-pfeil", "film-puls", "film-erg", "film-treffer", "film-raus"));
      teileZeigen(null);
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
      if (s.zeige === "sql") { $(".film-satz").hidden = false; $(".film-ueb").classList.add("mit-sql"); }
      if (s.zeige === "labor") { $(".film-labor").hidden = false; }
      if (s.bis != null) teileZeigen(s.bis);
      if (s.markiere) {
        await p(500); if (ab()) return;
        const arten = [].concat(s.markiere);
        arten.forEach((a, k) => markiere(a, a === "tabelle" ? s.tabelle : s.spalte, k === arten.length - 1, s.teil));
      }
      if (s.tausche) {
        const [i, de, sq] = s.tausche, paar = $(`.film-paar[data-i="${i}"]`);
        if (paar) {
          paar.children[0].innerHTML = T(de); paar.children[1].innerHTML = `<code>${esc(sq)}</code>`;
          paar.querySelectorAll(".film-teil").forEach((x) => x.classList.add("an", "film-neu-teil"));
        }
      }
      if (s.ersetze && lab) lab.feld.value = lab.feld.value.replace(s.ersetze[0], s.ersetze[1]);
      if (s.ordnen) { await p(700); if (ab()) return; zeilenOrdnen(s.ordnen, sofort); await p(1800); if (ab()) return; }
      if (s.gruppen) { await p(700); if (ab()) return; gruppieren(s.gruppen, sofort); await p(1800); if (ab()) return; }
      if (s.zelle) { await p(600); if (ab()) return; zelleMarkieren(s.zelle); }
      if (s.aendere) { await p(700); if (ab()) return; aendern(s.aendere); }
      if (s.loesche) { await p(700); if (ab()) return; await loeschen(s.loesche, p, ab); if (ab()) return; }
      if (s.spalteNeu) { await p(600); if (ab()) return; spalteNeu(s.spalteNeu); }
      if (s.neueZeile) { await p(600); if (ab()) return; neueZeile(s.neueZeile); }
      if (s.verbinde) { await p(600); if (ab()) return; verbinden(s.verbinde); }
      if (s.verbund) { await p(600); if (ab()) return; verbundZeigen(s.verbund); }
      if (s.zaehle) { await p(600); if (ab()) return; zaehlen(s.zaehle); }
      if (s.abschneiden) { await p(600); if (ab()) return; abschneiden(s.abschneiden); }
      if (s.muster) { await p(600); if (ab()) return; musterZeigen(s.muster, s.spalte); }
      if (s.pruefe) { await p(600); if (ab()) return; zellenPruefen(s.pruefe, s.spalte); }
      // spalte ohne markiere: nur die Spalte blau (z. B. „noch eine Spalte dazu“)
      if (s.spalte && !s.markiere && !s.pruefe && !s.muster) spalteMarkieren(s.spalte, !sofort);
      if (s.zeilen) { await p(600); if (ab()) return; zeilenMarkieren(s.zeilen); }
      if (s.blass) el.querySelectorAll(".film-vorschau tbody tr:not(.film-treffer)").forEach((z) => z.classList.add("film-raus"));
      if (s.leeren) { lab.zuruecksetzen(); el.querySelectorAll(".film-erg").forEach((x) => x.classList.remove("film-erg")); }
      let pos = null;
      if (s.nach) { const v = lab.feld.value, k = v.indexOf(s.nach); pos = k < 0 ? null : k + s.nach.length; }
      const tippen = async (txt) => {
        for (const ch of txt) {
          if (!sofort) { await p(TIPPEN); if (ab()) return false; }
          const f = lab.feld, a = f.selectionStart ?? f.value.length;
          f.value = f.value.slice(0, a) + ch + f.value.slice(a); f.setSelectionRange(a + 1, a + 1);
        }
        return true;
      };
      for (const b of s.bausteine || []) {
        if (b.startsWith("✎")) { if (!(await tippen(b.slice(1)))) return; continue; }   // „✎besitzer “ = tippen statt Baustein
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
      // Tippen an der Schreibmarke (z. B. zwischen die Hochkommas von '…')
      if (s.tippe && !(await tippen(s.tippe))) return;
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
      if (!lab) lab = Labor.create($(".film-labor"), { db: o.db, modus: "frei", tabellen: false, spicker: false, zeilen: 2, extra: o.extra, nurTabellen: o.nurTabellen, ...(o.labor || {}) });
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

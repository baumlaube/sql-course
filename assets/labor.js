/* SQL-Kurs · Das SQL-Labor: echtes SQLite im Browser (sql.js), Prüfen über das Ergebnis,
   eigene Rückmeldungen zu typischen Fehlern. Nichts wird an einen Server geschickt.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic.

   Benutzung (Kurzfassung, ausführlich in README.md):
     Labor.daten("tonspur", { titel, sql })            – Übungsdatenbank anmelden (assets/daten/*.js)
     Labor.create(el, { db, modus, sql, loesung, … })  – Aufgabe: frei | puzzle | luecke | lesen
     Labor.tabelle(el, { db, tabelle, offen })         – Tabelle zum Anschauen
     Labor.zeitlupe(el, { db, sql })                    – WHERE Zeile für Zeile vorführen
     Labor.training(el, { db, key, aufgaben })          – viele Aufgaben nacheinander (Bonus/Training)
*/
(function () {
  "use strict";

  const T = (x) => (window.T ? window.T(x) : x);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BASE = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
  const MAX_ZEILEN = 200;

  /* ---------- SQLite laden ---------- */
  let sqlPromise = null;
  function bereit() {
    if (!sqlPromise) {
      if (typeof window.initSqlJs !== "function") return Promise.reject(new Error("sql-wasm.js fehlt"));
      sqlPromise = window.initSqlJs({ locateFile: (f) => BASE + "sqljs/" + f });
    }
    return sqlPromise;
  }

  /* ---------- Übungsdatenbanken ---------- */
  const DATEN = {};          // name → { titel, sql, bytes?, meta? }
  function daten(name, def) { DATEN[name] = Object.assign({}, def); }

  /** Neue, frische Datenbank (jede Ausführung beginnt mit dem Originalstand). */
  function oeffnen(SQL, name) {
    const d = DATEN[name];
    if (!d) throw new Error(`Datenbank „${name}“ ist nicht geladen (assets/daten/${name}.js einbinden).`);
    if (!d.bytes) {
      const db = new SQL.Database();
      db.exec(d.sql);
      d.bytes = db.export();
      d.meta = metaLesen(db);
      db.close();
    }
    return new SQL.Database(d.bytes);
  }

  /** Tabellen, Spalten und alle Textwerte – für Bausteinleiste und Fehlermeldungen. */
  function metaLesen(db) {
    const tabellen = {};
    const texte = new Set();
    const namen = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid");
    (namen[0] ? namen[0].values : []).forEach(([t]) => {
      const info = db.exec(`PRAGMA table_info("${t}")`)[0];
      tabellen[t] = info.values.map((r) => ({ name: r[1], typ: r[2] }));
      const werte = db.exec(`SELECT * FROM "${t}"`)[0];
      if (werte) werte.values.forEach((row) => row.forEach((v) => { if (typeof v === "string") texte.add(v); }));
    });
    return { tabellen, texte };
  }

  function meta(SQL, name) { oeffnen(SQL, name).close(); return DATEN[name].meta; }

  /* ---------- Ausführen und vergleichen ---------- */
  /** Typografische Anführungszeichen (Handy, Textverarbeitung) in gerade umwandeln. */
  function glaetten(sql) {
    return String(sql).replace(/[‘’‚‛´`]/g, "'").replace(/[“”„‟«»]/g, '"').replace(/ /g, " ");
  }

  function ausfuehren(SQL, name, sql) {
    const db = oeffnen(SQL, name);
    try {
      // Anweisung für Anweisung, damit auch bei 0 Zeilen die Spaltennamen bekannt sind
      let last = null;
      for (const stmt of db.iterateStatements(sql)) {
        const spalten = stmt.getColumnNames(), zeilen = [];
        while (stmt.step()) zeilen.push(stmt.get());
        if (spalten.length) last = { spalten, zeilen };
        stmt.free();
      }
      return { ok: true, spalten: last ? last.spalten : [], zeilen: last ? last.zeilen : [], leer: !last };
    } catch (e) {
      return { ok: false, fehler: String(e.message || e) };
    } finally {
      db.close();
    }
  }

  const wert = (v) => (v === null ? "∅" : typeof v === "number" ? String(+v.toFixed(6)) : String(v));
  const zeileKey = (r) => r.map(wert).join("␟");

  /** Spalten des Schülerergebnisses auf die der Lösung abbilden (nach Namen, sonst nach Position). */
  function spaltenAbbilden(stud, ref) {
    const s = stud.spalten.map((c) => c.toLowerCase()), r = ref.spalten.map((c) => c.toLowerCase());
    if (s.length === r.length && r.every((c) => s.includes(c)) && new Set(s).size === s.length) return r.map((c) => s.indexOf(c));
    if (s.length === r.length) return r.map((_, i) => i);
    return null;
  }

  function vergleichen(stud, ref, reihenfolge) {
    const map = spaltenAbbilden(stud, ref);
    if (!map) return { gleich: false, spalten: false };
    const sz = stud.zeilen.map((row) => zeileKey(map.map((i) => row[i])));
    const rz = ref.zeilen.map(zeileKey);
    const zaehle = (arr) => arr.reduce((m, k) => m.set(k, (m.get(k) || 0) + 1), new Map());
    const sm = zaehle(sz), rm = zaehle(rz);
    let fehlen = 0, zuviel = 0;
    rm.forEach((n, k) => { fehlen += Math.max(0, n - (sm.get(k) || 0)); });
    sm.forEach((n, k) => { zuviel += Math.max(0, n - (rm.get(k) || 0)); });
    const mengeGleich = fehlen === 0 && zuviel === 0;
    const folgeGleich = mengeGleich && sz.every((k, i) => k === rz[i]);
    return { gleich: reihenfolge ? folgeGleich : mengeGleich, mengeGleich, folgeGleich, fehlen, zuviel, spalten: true };
  }

  /* ---------- Fehlermeldungen von SQLite verständlich machen ---------- */
  function abstand(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  function aehnlich(wort, liste) {
    let best = null, bd = 99;
    liste.forEach((x) => { const d = abstand(wort, x); if (d < bd) { bd = d; best = x; } });
    return bd <= Math.max(1, Math.floor(wort.length / 3)) ? best : null;
  }

  function ohneTexte(sql) { return sql.replace(/'[^']*'/g, "''"); }

  /** Text aus der Tabelle, der ohne Anführungszeichen in der Abfrage steht? */
  function textOhneAnfuehrung(sql, m) {
    const roh = ohneTexte(sql).toLowerCase();
    let treffer = null;
    m.texte.forEach((t) => {
      if (treffer || t.length < 2) return;
      const tl = t.toLowerCase();
      const re = new RegExp(`(^|[\\s=<>(,])${tl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[\\s;)])`);
      if (re.test(roh) && !Object.keys(m.tabellen).some((tab) => tab.toLowerCase() === tl || m.tabellen[tab].some((c) => c.name.toLowerCase() === tl))) treffer = t;
    });
    return treffer;
  }

  function fehlerText(msg, sql, m) {
    const alleSpalten = [...new Set(Object.values(m.tabellen).flat().map((c) => c.name))];
    const tabellen = Object.keys(m.tabellen);
    const code = (x) => `<code>${esc(x)}</code>`;
    let r;

    const roh = textOhneAnfuehrung(sql, m);
    if (roh && /no such column|syntax error/.test(msg))
      return T(`${code(roh)} ist ein Text aus der Tabelle. Text gehört in Anführungszeichen: ${code("'" + roh + "'")}`);

    if ((r = msg.match(/no such column: (.+)/))) {
      const x = r[1].replace(/^.*\./, "");
      const v = [...m.texte].find((t) => t.toLowerCase() === x.toLowerCase());
      if (v) return T(`SQL hält ${code(x)} für eine Spalte. Gemeint ist aber ein Text aus der Tabelle – der gehört in Anführungszeichen: ${code("'" + v + "'")}`);
      const s = aehnlich(x, alleSpalten);
      if (s) return T(`Die Spalte ${code(x)} gibt es nicht. Meinst du ${code(s)}?`);
      const xr = x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`(=|<>|<|>|\\bLIKE|\\bIN\\s*\\(|\\bIN\\s*\\([^)]*,)\\s*${xr}\\b`, "i").test(ohneTexte(sql)))
        return T(`SQL hält ${code(x)} für eine Spalte – die gibt es aber nicht. Ist ${code(x)} ein Text? Dann gehört er in Anführungszeichen: ${code("'" + x + "'")}`);
      return T(`Die Spalte ${code(x)} gibt es nicht. Die Spalten heißen: ${alleSpalten.map(code).join(", ")}.`);
    }
    if ((r = msg.match(/no such table: (.+)/))) {
      const s = aehnlich(r[1], tabellen);
      return s ? T(`Die Tabelle ${code(r[1])} gibt es nicht. Meinst du ${code(s)}?`)
        : T(`Die Tabelle ${code(r[1])} gibt es nicht. Es gibt: ${tabellen.map(code).join(", ")}.`);
    }
    if (/incomplete input/.test(msg)) {
      if ((ohneTexte(sql).match(/'/g) || []).length % 2) return T("Ein Anführungszeichen <code>'</code> ist nicht geschlossen. Text braucht vorne <strong>und</strong> hinten eines.");
      return T("Die Abfrage hört mitten drin auf. Fehlt am Ende noch etwas, z. B. der Wert nach dem Vergleich?");
    }
    if ((r = msg.match(/unrecognized token: "(.*)"/))) {
      if (r[1].startsWith("'")) return T("Ein Anführungszeichen <code>'</code> ist nicht geschlossen. Text braucht vorne <strong>und</strong> hinten eines.");
      return T(`Das Zeichen ${code(r[1])} kennt SQL nicht. Zahlen schreibt man ohne Einheit (kein €, kein %).`);
    }
    if ((r = msg.match(/near "(.*)": syntax error/))) {
      const t = r[1], tu = t.toUpperCase(), s = ohneTexte(sql);
      if (tu === "FROM" && /,\s*FROM/i.test(s)) return T("Vor <code>FROM</code> steht ein Komma zu viel. Das Komma steht nur <strong>zwischen</strong> zwei Spalten.");
      if (/^\s*SELECT\s+FROM/i.test(s)) return T("Nach <code>SELECT</code> fehlt, <strong>was</strong> du sehen willst: Spaltennamen oder <code>*</code>.");
      if (/\bWHERE\b[\s\S]*\bFROM\b/i.test(s)) return T("Die Reihenfolge stimmt nicht. Es heißt immer: <code>SELECT …</code> <code>FROM …</code> <code>WHERE …</code>");
      if (/^\d+$/.test(t) && /\d[ ,]\d/.test(s)) return T("Zahlen schreibt man in SQL ohne Leerzeichen und mit Punkt statt Komma: <code>29.90</code>, <code>50000</code>.");
      if (/\bGROUP\b(?!\s+BY)/i.test(s)) return T("Es heißt <code>GROUP BY</code> – zwei Wörter.");
      if (/\bGROUP\s+BY\b[\s\S]*\bWHERE\b/i.test(s)) return T("Erst filtern, dann gruppieren: <code>WHERE</code> steht vor <code>GROUP BY</code>.");
      if (/\bORDER\s+BY\b[\s\S]*\bGROUP\s+BY\b/i.test(s)) return T("Erst gruppieren, dann sortieren: <code>GROUP BY</code> steht vor <code>ORDER BY</code>.");
      if (/\bHAVING\b[\s\S]*\bGROUP\s+BY\b/i.test(s)) return T("<code>HAVING</code> steht nach <code>GROUP BY</code>.");
      if (/\bLIMIT\b[\s\S]*\bORDER\s+BY\b/i.test(s)) return T("<code>LIMIT</code> steht ganz am Ende – erst sortieren (<code>ORDER BY</code>), dann abschneiden (<code>LIMIT</code>).");
      if (/\bORDER\s+BY\b[\s\S]*\bWHERE\b/i.test(s)) return T("Erst filtern, dann sortieren: <code>WHERE</code> steht vor <code>ORDER BY</code>.");
      if (/\bORDER\b(?!\s+BY)/i.test(s)) return T("Es heißt <code>ORDER BY</code> – zwei Wörter.");
      if (tu === "WHERE" && /\bWHERE\b[\s\S]*\bWHERE\b/i.test(s)) return T("<code>WHERE</code> steht nur einmal in einer Abfrage.");
      if (alleSpalten.some((c) => c.toLowerCase() === t.toLowerCase()) && /^\s*SELECT\b/i.test(s) && !/\bFROM\b[\s\S]*$/i.test(s.split(new RegExp(`\\b${t}\\b`, "i"))[0]))
        return T("Zwischen zwei Spalten muss ein Komma stehen, z. B. <code>titel, kuenstler</code>.");
      if (/\bLIKE\s+[^'\s(]/i.test(s)) return T("Das Muster nach <code>LIKE</code> ist ein Text – es gehört in Anführungszeichen, z. B. <code>LIKE 'N%'</code>.");
      if (/^(SELCT|SLECT|SELEKT|FORM|FRMO|WHRE|WERE|WHER)$/.test(tu)) return T(`Tippfehler: ${code(t)}. Die Befehle heißen <code>SELECT</code>, <code>FROM</code>, <code>WHERE</code>.`);
      if (t === "" ) return T("Die Abfrage hört zu früh auf. Fehlt am Ende etwas?");
      return T(`SQL versteht die Stelle bei ${code(t)} nicht. Prüfe Schreibweise, Kommas und Reihenfolge: <code>SELECT …</code> <code>FROM …</code> <code>WHERE …</code>`);
    }
    if (/misuse of aggregate/.test(msg))
      return T("<code>WHERE</code> prüft einzelne Zeilen und kann nicht mit <code>COUNT</code>, <code>SUM</code> & Co. rechnen. Bedingungen für Gruppen stehen in <code>HAVING</code> – nach <code>GROUP BY</code>.");
    if (/aggregate functions are not allowed in the GROUP BY clause/.test(msg))
      return T("Nach <code>GROUP BY</code> steht die Spalte, nach der gruppiert wird – keine Rechnung.");
    if (/ambiguous column name: (.+)/.test(msg)) {
      r = msg.match(/ambiguous column name: (.+)/);
      return T(`Die Spalte ${code(r[1])} gibt es in mehreren Tabellen. Schreib den Tabellennamen davor, z. B. ${code("tabelle." + r[1])}.`);
    }
    if (/readonly|no such function/.test(msg)) return T(`SQLite meldet: ${code(msg)}`);
    return T(`SQLite meldet: ${code(msg)}`);
  }

  /** Wörtliche Übersetzung einer SQLite-Meldung – ohne Hinweis auf die Lösung (für den Fehlerdetektiv). */
  function woertlich(msg) {
    let r;
    if ((r = msg.match(/no such column: (.+)/))) return " " + T(`– auf Deutsch: „Eine Spalte <code>${esc(r[1])}</code> gibt es nicht.“`);
    if ((r = msg.match(/no such table: (.+)/))) return " " + T(`– auf Deutsch: „Eine Tabelle <code>${esc(r[1])}</code> gibt es nicht.“`);
    if ((r = msg.match(/near "(.*)": syntax error/))) return " " + T(`– auf Deutsch: „Bei <code>${esc(r[1])}</code> stimmt etwas mit der Schreibweise nicht.“`);
    if (/incomplete input/.test(msg)) return " " + T("– auf Deutsch: „Die Abfrage ist nicht vollständig.“");
    if ((r = msg.match(/unrecognized token: "(.*)"/))) return " " + T(`– auf Deutsch: „Das Zeichen <code>${esc(r[1])}</code> ist unbekannt.“`);
    return T("");
  }

  /** Bei 0 Zeilen: Steht der Text so in der Tabelle? */
  function textPruefen(sql, m) {
    const lits = [...sql.matchAll(/'([^']*)'/g)].map((x) => x[1]);
    for (const l of lits) {
      if (!l || m.texte.has(l) || /^[\d.\-: ]+$/.test(l) || /[%_]/.test(l)) continue;
      const g = [...m.texte].find((t) => t.toLowerCase() === l.toLowerCase());
      if (g) return T(`Bei Text zählt Groß- und Kleinschreibung: In der Tabelle steht <code>'${esc(g)}'</code>, du hast <code>'${esc(l)}'</code> geschrieben.`);
      const t = [...m.texte].find((x) => x === l.trim());
      if (t) return T(`In <code>'${esc(l)}'</code> ist ein Leerzeichen zu viel. Zwischen den Anführungszeichen muss der Text ganz genau stimmen.`);
      return T(`Den Text <code>'${esc(l)}'</code> gibt es in der Tabelle nicht genau so. Schau nach, wie er dort geschrieben ist.`);
    }
    return null;
  }

  /* ---------- Darstellung ---------- */
  function ergebnisHTML(res, opts = {}) {
    if (!res.spalten.length) return `<p class="labor-leer">${res.leer ? T("Die Abfrage liefert keine Tabelle.") : T("Keine Zeilen.")}</p>`;
    const n = res.zeilen.length;
    const zeilen = res.zeilen.slice(0, MAX_ZEILEN);
    const zahl = (v) => typeof v === "number";
    let h = `<div class="labor-scroll"><table class="labor-tab"><thead><tr>${res.spalten.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>`;
    zeilen.forEach((r, i) => {
      const cls = opts.klasse ? opts.klasse(i) : "";
      h += `<tr${cls ? ` class="${cls}"` : ""}>${r.map((v) => `<td${zahl(v) ? ' class="num"' : ""}>${v === null ? '<span class="null">NULL</span>' : esc(v)}</td>`).join("")}</tr>`;
    });
    h += "</tbody></table></div>";
    const info = n === 0 ? T("0 Zeilen – keine Zeile passt.") : n === 1 ? T("1 Zeile") : T(`${n} Zeilen`);
    h += `<p class="labor-anzahl">${info}${n > MAX_ZEILEN ? " · " + T(`angezeigt: die ersten ${MAX_ZEILEN}`) : ""}</p>`;
    return h;
  }

  function sqlHTML(sql) {
    const KW = /\b(SELECT|FROM|WHERE|AND|OR|NOT|LIKE|ORDER BY|ORDER|BY|ASC|DESC|LIMIT|JOIN|ON|AS|COUNT|AVG|SUM|MIN|MAX|GROUP|DISTINCT|IN|BETWEEN|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|INTEGER|TEXT|REAL|NULL|IS)\b/gi;
    return esc(sql).replace(/('[^']*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]+)/g, (m, s, n, w) => {
      if (s) return `<span class="s">${s}</span>`;
      if (n) return `<span class="n">${n}</span>`;
      KW.lastIndex = 0;
      return KW.test(w) ? `<span class="k">${w}</span>` : w;
    });
  }

  function tabelle(el, opts) {
    el.classList.add("labor-tabellenbox");
    bereit().then((SQL) => {
      const db = oeffnen(SQL, opts.db);
      const m = DATEN[opts.db].meta;
      (opts.tabelle ? [opts.tabelle] : Object.keys(m.tabellen)).forEach((t) => {
        const res = db.exec(`SELECT * FROM "${t}"`)[0] || { columns: m.tabellen[t].map((c) => c.name), values: [] };
        const d = document.createElement("details");
        d.className = "labor-tabelle";
        d.open = !!opts.offen;
        d.innerHTML = `<summary data-tipp="${T("Antippen klappt die Tabelle auf oder zu.")}" data-tipp-einmal="tabelle"><span class="tabname">📋 ${esc(t)}</span> <span class="muted">${T(`${res.values.length} Zeilen · ${res.columns.length} Spalten`)}</span></summary>`
          + ergebnisHTML({ spalten: res.columns, zeilen: res.values }, opts);
        el.appendChild(d);
      });
      db.close();
    }).catch((e) => { el.textContent = T("Das SQL-Labor konnte nicht starten:") + " " + e.message; });
  }

  /* ---------- Die Aufgabe ---------- */
  const STANDARD_LEISTE = ["SELECT", "DISTINCT", "*", ",", "FROM", "WHERE", "=", "<>", "<", ">", "<=", ">=", "'…'"];

  function create(el, o) {
    el.classList.add("labor");
    const modus = o.modus || "frei";
    const api = { el, sql: () => holeSQL(), setzeSQL: (s) => setzeSQL(s), loesen: false };
    let SQL = null, m = null, geloest = false;

    el.innerHTML = `
      <div class="labor-tabs"></div>
      <div class="labor-code"></div>
      <div class="labor-ctrl">
        <button type="button" class="btn labor-run" data-tipp="${modus === "lesen" ? T("Schickt die Abfrage an die Datenbank. Das Ergebnis erscheint darunter.") : T("Schickt deine Abfrage an die Datenbank und prüft sie. Kaputt machen kannst du nichts.")}${modus === "frei" ? " " + T("(Strg + Enter)") : ""}">▶ ${T("Ausführen")}</button>
        ${modus === "puzzle" ? `<button type="button" class="btn secondary labor-reset" data-tipp="${T("Alle Bausteine zurücklegen und neu anfangen.")}">↺ ${T("Neu")}</button>` : ""}
      </div>
      <div class="fb labor-fb" aria-live="polite"></div>
      <div class="labor-erg" hidden></div>`;
    const $ = (s) => el.querySelector(s);
    const codeBox = $(".labor-code"), fb = $(".labor-fb"), erg = $(".labor-erg");
    if (o.tabellen !== false) tabelle($(".labor-tabs"), { db: o.db, tabelle: o.tabellen && o.tabellen[0], offen: o.tabelleOffen });
    else $(".labor-tabs").remove();

    let holeSQL = () => "", setzeSQL = () => {};

    function zeige(html, art) { fb.className = "fb labor-fb show " + art; fb.innerHTML = T(html); }

    /* --- Eingabe je nach Modus --- */
    function baueFrei() {
      codeBox.innerHTML = `<textarea class="labor-eingabe" rows="${o.zeilen || 3}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"
        aria-label="${T("SQL-Abfrage")}" placeholder="SELECT …"></textarea><div class="labor-bausteine" aria-label="${T("Bausteine zum Antippen")}"></div>`;
      const ta = codeBox.querySelector("textarea");
      ta.value = o.sql || "";
      holeSQL = () => ta.value;
      setzeSQL = (s) => { ta.value = s; };
      ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); los(); } });
      if (o.leiste === false) { codeBox.querySelector(".labor-bausteine").remove(); return; }
      const leiste = codeBox.querySelector(".labor-bausteine");
      const teile = [...(o.leiste || STANDARD_LEISTE), ...(o.extra || [])];   // extra: Befehle späterer Lektionen (AND, OR, …)
      if (o.leiste === undefined) {
        Object.keys(m.tabellen).forEach((t) => { teile.push(t); m.tabellen[t].forEach((c) => teile.push(c.name)); });
      }
      [...new Set(teile)].forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "baustein" + (/^[A-Z][A-Z (*)]*$/.test(t) && t.length > 1 ? " kw" : /^[a-z_]+$/.test(t) ? " name" : " op");
        b.textContent = t;
        b.dataset.tipp = T("Antippen fügt den Baustein dort ein, wo der Cursor steht.");
        b.dataset.tippEinmal = "leiste";
        b.addEventListener("mousedown", (e) => e.preventDefault());   // Cursor im Textfeld behalten
        b.addEventListener("click", () => einfuegen(ta, t));
        leiste.appendChild(b);
      });
    }

    function einfuegen(ta, t) {
      const a = ta.selectionStart ?? ta.value.length, z = ta.selectionEnd ?? a;
      const vor = ta.value.slice(0, a), nach = ta.value.slice(z);
      let txt = t === "'…'" ? "''" : t;
      const klebt = t === "%" || t === "_";          // Platzhalter stehen im Text, ohne Leerzeichen
      const davor = !klebt && vor && !/\s$/.test(vor) && t !== "," ? " " : "";
      const danach = t === "'…'" || klebt ? "" : " ";
      ta.value = vor + davor + txt + danach + (klebt ? nach : nach.replace(/^ /, ""));
      const pos = (vor + davor).length + (t === "'…'" ? 1 : txt.length + danach.length);
      ta.focus();
      ta.setSelectionRange(pos, pos);
    }

    function bauePuzzle() {
      codeBox.innerHTML = `<div class="labor-zeile" aria-label="${T("Deine Abfrage")}"><span class="muted platzhalter">${T("Tippe die Bausteine unten in der richtigen Reihenfolge an.")}</span></div>
        <div class="labor-bausteine labor-vorrat"></div>`;
      const zeile = codeBox.querySelector(".labor-zeile"), vorrat = codeBox.querySelector(".labor-vorrat");
      const leg = (b, wohin) => { wohin.appendChild(b); zeile.querySelector(".platzhalter").hidden = zeile.querySelectorAll(".baustein").length > 0; };
      const neu = () => {
        vorrat.innerHTML = ""; zeile.querySelectorAll(".baustein").forEach((b) => b.remove());
        zeile.querySelector(".platzhalter").hidden = false;
        mischen(o.bausteine).forEach((t) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "baustein" + (/^[A-Z][A-Z (*)]*$/.test(t) && t.length > 1 ? " kw" : /^[a-z_]+$/.test(t) ? " name" : " op");
          b.textContent = t;
          b.dataset.tipp = T("Antippen legt den Baustein in die Abfrage. Nochmal antippen legt ihn zurück.");
          b.dataset.tippEinmal = "puzzle";
          b.addEventListener("click", () => leg(b, b.parentElement === vorrat ? zeile : vorrat));
          vorrat.appendChild(b);
        });
      };
      holeSQL = () => [...zeile.querySelectorAll(".baustein")].map((b) => b.textContent).join(" ").replace(/ ,/g, ",");
      setzeSQL = () => {};
      neu();
      const r = el.querySelector(".labor-reset");
      if (r) r.addEventListener("click", () => { neu(); fb.className = "fb labor-fb"; erg.hidden = true; });
    }

    function baueLuecke() {
      // Vorlage: "SELECT titel FROM songs WHERE jahr [[<|>|=]] [[4]]"  –  [[a|b]] = Auswahl, [[n]] = Eingabe (Breite n)
      // Text und Lücken getrennt behandeln, damit Zeichen wie < > nur einmal maskiert werden
      let i = 0;
      const teile = o.sql.split(/(\[\[.*?\]\])/);
      const html = teile.map((t) => {
        const g = t.match(/^\[\[(.*?)\]\]$/);
        if (!g) return sqlHTML(t);
        const inh = g[1];
        i++;
        if (inh.includes("|")) {
          const opts = inh.split("|").map((x) => `<option>${esc(x.trim())}</option>`).join("");
          return `<select class="luecke" data-i="${i}" data-tipp="${T("Wähle aus, was hier hingehört.")}" data-tipp-einmal="auswahl" aria-label="${T(`Lücke ${i}`)}"><option value="">…</option>${opts}</select>`;
        }
        const w = parseInt(inh, 10) || 6;
        return `<input class="luecke" data-i="${i}" size="${w}" data-tipp="${T("Schreib hier hinein, was fehlt.")}" data-tipp-einmal="eingabe" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="${T(`Lücke ${i}`)}">`;
      }).join("");
      codeBox.innerHTML = `<pre class="sql labor-vorlage">${html}</pre>`;
      const felder = [...codeBox.querySelectorAll(".luecke")];
      felder.forEach((f) => f.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); los(); } }));
      holeSQL = () => {
        let k = 0;
        return o.sql.replace(/\[\[(.*?)\]\]/g, () => felder[k++].value);
      };
    }

    function baueLesen() {
      codeBox.innerHTML = `<pre class="sql labor-vorlage">${sqlHTML(o.sql)}</pre>`;
      holeSQL = () => o.sql;
    }

    /* --- Ausführen und prüfen --- */
    function los() {
      if (!SQL) return;
      const sql = glaetten(holeSQL()).trim();
      if (!sql) { zeige(T("Da steht noch nichts. Schreib zuerst eine Abfrage."), "hint"); return; }
      const leerFeld = modus === "luecke" && [...codeBox.querySelectorAll(".luecke")].some((f) => !f.value.trim());
      if (leerFeld) { zeige(T("Füll zuerst alle gelben Lücken aus."), "hint"); return; }
      const res = ausfuehren(SQL, o.db, sql);
      erg.hidden = !res.ok;
      if (res.ok) erg.innerHTML = `<p class="labor-erg-t">${T("Ergebnis")}</p>` + ergebnisHTML(res);
      if (!o.loesung && !o.pruefe) {           // nur ausprobieren
        if (!res.ok) zeige("✘ " + T(fehlerText(res.fehler, sql, m)), "hint");
        else fb.className = "fb labor-fb";
        melden(res, null);
        return;
      }
      // Fehlerdetektiv: Die unveränderte Startabfrage wird nur ausgeführt, nicht bewertet –
      // die Schüler sollen selbst nachdenken, bevor ein Hinweis kommt.
      if (o.erkunden && sql.replace(/\s+/g, " ") === glaetten(o.sql || "").trim().replace(/\s+/g, " ")) {
        if (res.ok) zeige(T("🔍 Schau dir das Ergebnis genau an. Was stimmt nicht? Dann ändere die Abfrage und führ sie noch einmal aus."), "info");
        else zeige(`${T("🔍 Die Datenbank meldet:")} <code>${esc(res.fehler)}</code>${woertlich(res.fehler)}<br>${T("Was bedeutet das? Ändere die Abfrage und führ sie noch einmal aus.")}`, "info");
        melden(res, null);
        return;
      }
      const urteil = beurteilen(sql, res);
      if (urteil === true) {
        geloest = true;
        zeige(T(o.ok || "✔ Richtig!"), "ok");
        el.classList.add("geloest");
      } else zeige("✘ " + T(urteil), "hint");
      melden(res, urteil === true);
    }

    function beurteilen(sql, res) {
      const ref = o.loesung ? ausfuehren(SQL, o.db, o.loesung) : null;
      if (ref && !ref.ok) return "Interner Fehler in der Musterlösung: " + esc(ref.fehler);   // nur für die Lehrkraft
      const cmp = res.ok && ref ? vergleichen(res, ref, !!o.reihenfolge) : null;
      if (o.pruefe) {
        const p = o.pruefe({ sql, res, ref, cmp, ohneTexte: ohneTexte(sql) });
        if (p === true || typeof p === "string") return p;
      }
      // SQLite-Sonderweg: MAX/MIN neben einer normalen Spalte ohne GROUP BY (andere Datenbanken melden einen Fehler)
      const roh = ohneTexte(sql);
      if (!/\bGROUP\s+BY\b/i.test(roh) && /\b(MAX|MIN|SUM|AVG|COUNT)\s*\(/i.test(roh)) {
        const sel = (roh.match(/^\s*SELECT\s+(?:DISTINCT\s+)?([\s\S]*?)\s+FROM\b/i) || [])[1] || "";
        const teile = sel.split(",").map((t) => t.trim());
        if (teile.length > 1 && teile.some((t) => /^[a-z_]+$/i.test(t)) && teile.some((t) => /\(/.test(t))) {
          if (o.loesung && /\bGROUP\s+BY\b/i.test(o.loesung)) {
            const sp = teile.find((t) => /^[a-z_]+$/i.test(t));
            return T(`Es fehlt <code>GROUP BY ${esc(sp)}</code>. Ohne Gruppen rechnet die Datenbank über <strong>alle</strong> Zeilen zusammen – und neben der einen Zahl steht irgendein zufälliger Wert.`);
          }
          return T("Eine normale Spalte neben <code>MAX</code>, <code>MIN</code> oder einer anderen Rechnung klappt nur in SQLite – andere Datenbanken melden einen Fehler. "
            + "Für den ganzen Datensatz zum Größten: <code>ORDER BY … DESC LIMIT 1</code>.");
        }
      }
      const doppelt = sql.match(/"([^"]*)"/);
      if (doppelt && m.texte.has(doppelt[1]) && !Object.values(m.tabellen).flat().some((c) => c.name === doppelt[1]))
        return T(`Fast! Für Text nimmt man in SQL das <strong>einfache</strong> Anführungszeichen: <code>'${esc(doppelt[1])}'</code> (auf der Tastatur: Shift + #).`);
      if (cmp && cmp.gleich) return true;
      for (const f of o.fallen || []) {        // geplante Stolpersteine
        if (f.muster && f.muster.test(sql)) return f.text;
        if (f.sql && res.ok) {
          const alt = ausfuehren(SQL, o.db, f.sql);
          if (alt.ok && vergleichen(res, alt, !!o.reihenfolge).gleich) return f.text;
        }
        if (f.wenn && f.wenn({ sql, res, ref, cmp })) return f.text;
      }
      if (!res.ok) return fehlerText(res.fehler, sql, m);
      // Mit GROUP BY: Jede normale Spalte im SELECT muss auch in GROUP BY stehen
      if (/\bGROUP\s+BY\b/i.test(ohneTexte(sql))) {
        const sel = (ohneTexte(sql).match(/^\s*SELECT\s+(?:DISTINCT\s+)?([\s\S]*?)\s+FROM\b/i) || [])[1] || "";
        const gb = ((ohneTexte(sql).match(/\bGROUP\s+BY\s+([\s\S]*?)(?:\bHAVING\b|\bORDER\b|\bLIMIT\b|;|$)/i) || [])[1] || "").split(",").map((t) => t.trim().toLowerCase());
        const fremd = sel.split(",").map((t) => t.trim()).find((t) => /^[a-z_]+$/i.test(t) && !gb.includes(t.toLowerCase()));
        if (fremd) return T(`<code>${esc(fremd)}</code> steht weder in <code>GROUP BY</code> noch in einer Rechnung. Welcher Wert soll für eine ganze Gruppe dastehen? Nimm die Spalte heraus – oder gruppiere auch nach ihr.`);
      }
      if (!ref) return T("Noch nicht.");
      return diagnose(sql, res, ref, cmp);
    }

    function diagnose(sql, res, ref, cmp) {
      const gefragt = ref.spalten.map((c) => `<code>${esc(c)}</code>`).join(", ");
      if (!cmp.spalten) {
        if (res.spalten.length > ref.spalten.length) {
          if (/SELECT\s+\*/i.test(sql)) return T(`<code>*</code> zeigt alle Spalten. Gefragt sind nur: ${gefragt}.`);
          return T(`Du zeigst mehr Spalten als gefragt. Gefragt sind: ${gefragt}.`);
        }
        return T(`Es fehlt noch etwas bei den Spalten. Gefragt sind: ${gefragt}.`);
      }
      const sn = res.spalten.map((c) => c.toLowerCase()).sort().join(), rn = ref.spalten.map((c) => c.toLowerCase()).sort().join();
      const nurNamen = res.spalten.every((c) => /^[a-z_]+$/i.test(c)) && ref.spalten.every((c) => /^[a-z_]+$/i.test(c));
      if (nurNamen && sn !== rn) return T(`Die Spalten stimmen noch nicht. Gefragt sind: ${gefragt}.`);
      if (cmp.mengeGleich && o.reihenfolge) return T("Die Zeilen stimmen – aber die Reihenfolge noch nicht.");
      const n = res.zeilen.length, r = ref.zeilen.length;
      if (n === 0) return textPruefen(sql, m) || T("Keine Zeile passt zu deiner Bedingung. Prüfe den Vergleich und den Wert.");
      const t = textPruefen(sql, m);
      if (t && cmp.zuviel) return t;
      if (!/\bWHERE\b/i.test(ohneTexte(sql)) && o.where !== false && /\bWHERE\b/i.test(o.loesung)) return T(`Du bekommst alle ${n} Zeilen. Es fehlt noch die Bedingung mit <code>WHERE</code>.`);
      if (n === 1 && r === 1 && res.spalten.length === 1 && ref.spalten.length === 1)
        return T("Das Ergebnis ist ein einzelner Wert – aber noch nicht der richtige. Prüf die Rechenfunktion, die Spalte und die Bedingung.");
      if (n === r) return T(`Gleich viele Zeilen (${n}), aber nicht die richtigen. Vergleich deine Bedingung genau mit der Aufgabe.`);
      if (cmp.zuviel === 0) return T(`Es fehlen noch Zeilen: Du hast ${n}, richtig wären ${r}. Ist dein Vergleich zu streng – zum Beispiel <code>&gt;</code> statt <code>&gt;=</code>?`);
      if (cmp.fehlen === 0) return T(`Zu viele Zeilen: Du hast ${n}, richtig wären ${r}. Ist dein Vergleich zu großzügig?`);
      return T(`Die Zeilen stimmen noch nicht (du hast ${n}, richtig wären ${r}). Vergleich deine Bedingung genau mit der Aufgabe.`);
    }

    function melden(res, ok) { if (o.onRun) o.onRun({ res, ok, geloest }, ok, api); }

    el.querySelector(".labor-run").addEventListener("click", los);

    bereit().then((S) => {
      SQL = S;
      m = meta(SQL, o.db);
      ({ frei: baueFrei, puzzle: bauePuzzle, luecke: baueLuecke, lesen: baueLesen }[modus] || baueFrei)();
      if (o.autostart) los();
    }).catch((e) => zeige(T("Das SQL-Labor konnte nicht starten:") + " " + esc(e.message), "hint"));

    api.los = () => los();
    return api;
  }

  function mischen(a) {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    if (b.length > 2 && b.every((x, i) => x === a[i])) return mischen(a);
    return b;
  }

  /* ---------- Zeitlupe: WHERE Zeile für Zeile ---------- */
  function zeitlupe(el, o) {
    el.classList.add("labor", "labor-zeitlupe");
    const mt = o.sql.match(/^\s*SELECT\s+(.+?)\s+FROM\s+(\w+)\s+WHERE\s+(.+?)\s*;?\s*$/is);
    if (!mt) { el.textContent = "Zeitlupe: Abfrage muss SELECT … FROM … WHERE … sein."; return; }
    const [, spaltenTxt, tab, bed] = mt;
    el.innerHTML = `<pre class="sql labor-vorlage">${sqlHTML(o.sql)}</pre>
      <div class="labor-ctrl">
        <button type="button" class="btn zl-schritt" data-tipp="${T("SQL prüft die nächste Zeile. So siehst du jeden Schritt.")}">👣 ${T("Nächste Zeile")}</button>
        <button type="button" class="btn secondary zl-alle" data-tipp="${T("Alle übrigen Zeilen im Schnelldurchlauf.")}">⏩ ${T("Alle Zeilen")}</button>
        <button type="button" class="btn secondary zl-neu" data-tipp="${T("Noch einmal von vorne.")}" aria-label="${T("Von vorne")}">↺</button>
      </div>
      <p class="zl-status" aria-live="polite"></p>
      <div class="zl-tab"></div>`;
    const $ = (s) => el.querySelector(s);
    bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db);
      const alle = db.exec(`SELECT * FROM ${tab}`)[0];
      const pruef = db.exec(`SELECT (${bed}) FROM ${tab}`)[0].values.map((r) => !!r[0]);
      db.close();
      const cols = alle.columns;
      const gewaehlt = spaltenTxt.trim() === "*" ? cols : spaltenTxt.split(",").map((s) => s.trim().toLowerCase());
      const spIdx = cols.map((c, i) => (gewaehlt.includes(c.toLowerCase()) ? i : -1)).filter((i) => i >= 0);
      const bedSp = cols.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(bed.replace(/'[^']*'/g, "")));
      let pos = 0, timer = null;
      const tbody = () => $(".zl-tab tbody");

      function zeichnen() {
        $(".zl-tab").innerHTML = ergebnisHTML({ spalten: cols, zeilen: alle.values });
        $(".zl-tab .labor-anzahl").remove();
        $(".zl-tab").querySelectorAll("th").forEach((th, i) => { if (bedSp.includes(cols[i])) th.classList.add("zl-bed"); });
        tbody().querySelectorAll("tr").forEach((tr) => tr.querySelectorAll("td").forEach((td, i) => { if (bedSp.includes(cols[i])) td.classList.add("zl-bed"); }));
        $(".zl-status").innerHTML = T(`Die Tabelle <code>${esc(tab)}</code> hat ${alle.values.length} Zeilen. SQL prüft jetzt <strong>jede Zeile</strong>: Passt die Bedingung?`);
      }

      function erklaeren(i) {
        let b = esc(bed);
        bedSp.forEach((c) => {
          const v = alle.values[i][cols.indexOf(c)];
          b = b.replace(new RegExp(`\\b${c}\\b`, "gi"), `<mark>${typeof v === "string" ? "'" + esc(v) + "'" : esc(v)}</mark>`);
        });
        return `${T(`Zeile ${i + 1}:`)} <code>${b}</code> → ${pruef[i] ? `<strong class="ja">${T("ja – bleibt")}</strong>` : `<strong class="nein">${T("nein – fliegt raus")}</strong>`}`;
      }

      function schritt() {
        const rows = tbody().querySelectorAll("tr");
        if (pos < rows.length) {
          rows.forEach((r) => r.classList.remove("zl-jetzt"));
          rows[pos].classList.add("zl-jetzt", pruef[pos] ? "zl-ja" : "zl-nein");
          rows[pos].scrollIntoView({ block: "nearest" });
          $(".zl-status").innerHTML = erklaeren(pos);
          pos++;
          return true;
        }
        if (pos === rows.length) {
          rows.forEach((r) => r.classList.remove("zl-jetzt"));
          const n = pruef.filter(Boolean).length;
          $(".zl-tab").innerHTML = ergebnisHTML({ spalten: spIdx.map((i) => cols[i]), zeilen: alle.values.filter((_, i) => pruef[i]).map((r) => spIdx.map((i) => r[i])) });
          $(".zl-status").innerHTML = T(`Fertig: ${n} von ${alle.values.length} Zeilen haben gepasst. Zum Schluss zeigt SQL davon nur die Spalten nach <code>SELECT</code>.`);
          pos++;
          $(".zl-schritt").disabled = true; $(".zl-alle").disabled = true;
        }
        return false;
      }

      function neu() { clearInterval(timer); pos = 0; zeichnen(); $(".zl-schritt").disabled = false; $(".zl-alle").disabled = false; }
      $(".zl-schritt").addEventListener("click", () => { clearInterval(timer); schritt(); });
      $(".zl-alle").addEventListener("click", () => {
        clearInterval(timer);
        $(".zl-alle").disabled = true;
        timer = setInterval(() => { if (!schritt()) { clearInterval(timer); schritt(); } }, o.tempo || 220);
      });
      $(".zl-neu").addEventListener("click", neu);
      neu();
    }).catch((e) => { el.textContent = T("Das SQL-Labor konnte nicht starten:") + " " + e.message; });
  }

  /* ---------- Gruppen-Ansicht: GROUP BY in zwei Schritten zeigen ---------- */
  function gruppen(el, o) {
    el.classList.add("labor", "labor-gruppen");
    const mt = o.sql.match(/^\s*SELECT\s+[\s\S]+?\s+FROM\s+(\w+)(\s+WHERE\s+[\s\S]+?)?\s+GROUP\s+BY\s+(\w+)/i);
    if (!mt) { el.textContent = "Gruppen-Ansicht: Abfrage muss SELECT … FROM … GROUP BY spalte sein."; return; }
    const [, tab, wo, gsp] = mt;
    const zeigeSp = o.spalten || null;
    el.innerHTML = `<pre class="sql labor-vorlage">${sqlHTML(o.sql)}</pre>
      <div class="labor-ctrl">
        <button type="button" class="btn gr-1" data-tipp="${T("Zeilen mit gleichem Wert kommen zusammen in eine Gruppe.")}">① ${T("Gruppen bilden")}</button>
        <button type="button" class="btn gr-2" disabled data-tipp="${T("Für jede Gruppe wird gerechnet – aus jeder Gruppe wird eine Zeile.")}">② ${T("Je Gruppe rechnen")}</button>
        <button type="button" class="btn secondary gr-neu" data-tipp="${T("Noch einmal von vorne.")}" aria-label="${T("Von vorne")}">↺</button>
      </div>
      <p class="zl-status" aria-live="polite"></p>
      <div class="gr-tab"></div>`;
    const $ = (s) => el.querySelector(s);
    bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db);
      const sp = zeigeSp ? zeigeSp.join(", ") : "*";
      const roh = db.exec(`SELECT ${sp} FROM ${tab}${wo || ""}`)[0];
      const sortiert = db.exec(`SELECT ${sp} FROM ${tab}${wo || ""} ORDER BY ${gsp}`)[0];
      db.close();
      const erg = ausfuehren(SQL, o.db, o.sql);
      const gi = sortiert.columns.findIndex((c) => c.toLowerCase() === gsp.toLowerCase());
      function start() {
        $(".gr-tab").innerHTML = ergebnisHTML({ spalten: roh.columns, zeilen: roh.values });
        $(".zl-status").innerHTML = wo
          ? T(`Die Tabelle <code>${esc(tab)}</code> hat ${roh.values.length} Zeilen (nach WHERE). Die Spalte <code>${esc(gsp)}</code> bestimmt die Gruppen.`)
          : T(`Die Tabelle <code>${esc(tab)}</code> hat ${roh.values.length} Zeilen. Die Spalte <code>${esc(gsp)}</code> bestimmt die Gruppen.`);
        $(".gr-1").disabled = false; $(".gr-2").disabled = true;
      }
      $(".gr-1").addEventListener("click", () => {
        let g = -1, last = null;
        const farbe = sortiert.values.map((r) => { if (r[gi] !== last) { g++; last = r[gi]; } return g % 2 ? "gr-b" : "gr-a"; });
        $(".gr-tab").innerHTML = ergebnisHTML({ spalten: sortiert.columns, zeilen: sortiert.values }, { klasse: (i) => farbe[i] + (i > 0 && sortiert.values[i][gi] !== sortiert.values[i - 1][gi] ? " gr-neu-gr" : "") });
        $(".gr-tab").querySelectorAll("th")[gi].classList.add("zl-bed");
        $(".gr-tab").querySelectorAll("tbody tr").forEach((tr) => tr.children[gi].classList.add("zl-bed"));
        const n = new Set(sortiert.values.map((r) => r[gi])).size;
        $(".zl-status").innerHTML = T(`Zeilen mit gleichem Wert in <code>${esc(gsp)}</code> liegen jetzt zusammen: <strong>${n} Gruppen</strong>.`);
        $(".gr-1").disabled = true; $(".gr-2").disabled = false;
      });
      $(".gr-2").addEventListener("click", () => {
        $(".gr-tab").innerHTML = ergebnisHTML(erg);
        $(".zl-status").innerHTML = T(`Für jede Gruppe wird gerechnet. Aus jeder Gruppe wird <strong>eine</strong> Zeile – ${erg.zeilen.length} Zeilen im Ergebnis.`);
        $(".gr-2").disabled = true;
      });
      $(".gr-neu").addEventListener("click", start);
      start();
    }).catch((e) => { el.textContent = T("Das SQL-Labor konnte nicht starten:") + " " + e.message; });
  }

  /* ---------- Training: viele Aufgaben nacheinander ---------- */
  function training(el, o) {
    el.classList.add("training");
    const store = window.Kurs ? window.Kurs.store : { get: () => null, set: () => {} };
    const key = `sql-training-${o.key}`;
    let fertig = [];
    try { fertig = JSON.parse(store.get(key) || "[]"); } catch (e) { fertig = []; }
    let akt = Math.max(0, o.aufgaben.findIndex((_, i) => !fertig.includes(i)));
    el.innerHTML = `<div class="tr-kopf">
        <ol class="tr-punkte" aria-label="${T("Aufgaben")}"></ol>
        <span class="tr-stand muted"></span>
      </div>
      <div class="tr-aufgabe"></div>
      <div class="tr-labor"></div>
      <div class="tr-hints"></div>
      <div class="btn-row"><button type="button" class="btn tr-weiter" hidden>${T("Nächste Aufgabe →")}</button></div>`;
    const $ = (s) => el.querySelector(s);
    if (o.tabelle !== false) {
      const t = document.createElement("div");
      el.insertBefore(t, $(".tr-aufgabe"));
      tabelle(t, { db: o.db });
    }

    function punkte() {
      $(".tr-punkte").innerHTML = o.aufgaben.map((_, i) =>
        `<li><button type="button" class="tr-p${fertig.includes(i) ? " ok" : ""}${i === akt ? " akt" : ""}" data-i="${i}" data-tipp="${fertig.includes(i) ? T(`Aufgabe ${i + 1} – gelöst`) : T(`Aufgabe ${i + 1}`)}" data-tipp-einmal="punkte" aria-label="${T(`Aufgabe ${i + 1}`)}">${fertig.includes(i) ? "✔" : i + 1}</button></li>`).join("");
      $(".tr-punkte").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => zeige(+b.dataset.i)));
      $(".tr-stand").textContent = T(`${fertig.length} von ${o.aufgaben.length} gelöst`);
    }

    function zeige(i) {
      akt = i;
      const a = o.aufgaben[i];
      $(".tr-aufgabe").innerHTML = `<p class="tr-nr">${T(`Aufgabe ${i + 1} von ${o.aufgaben.length}`)}</p><p class="tr-text">${T(a.text)}</p>`;
      $(".tr-weiter").hidden = true;
      $(".tr-hints").innerHTML = "";
      if (a.hints && window.Kurs) window.Kurs.hints($(".tr-hints"), a.hints);
      $(".tr-labor").innerHTML = "";
      create($(".tr-labor"), Object.assign({ db: o.db, modus: "frei", tabellen: false }, a, {
        ok: a.ok || "✔ Richtig!",
        onRun(info, ok) {
          if (!ok) return;
          if (!fertig.includes(i)) { fertig.push(i); store.set(key, JSON.stringify(fertig)); }
          punkte();
          const naechste = o.aufgaben.findIndex((_, k) => k > i && !fertig.includes(k));
          const irgendeine = o.aufgaben.findIndex((_, k) => !fertig.includes(k));
          const ziel = naechste >= 0 ? naechste : irgendeine;
          if (ziel >= 0) { $(".tr-weiter").hidden = false; $(".tr-weiter").onclick = () => { zeige(ziel); el.scrollIntoView({ block: "start" }); }; }
          else $(".tr-aufgabe").insertAdjacentHTML("beforeend", `<p class="fb show ok">🏆 ${T("Alle Aufgaben in diesem Training gelöst!")}</p>`);
        },
      }));
      punkte();
    }
    zeige(akt);
  }

  /** Für Tests: Ergebnis einer Abfrage holen. */
  function abfrage(name, sql) { return bereit().then((SQL) => ausfuehren(SQL, name, sql)); }
  /** Für Tests: eine Aufgabe ohne Oberfläche beurteilen. */
  function beurteile(o, sql) {
    return bereit().then(() => {
      const host = document.createElement("div");
      host.style.display = "none";
      document.body.appendChild(host);
      return new Promise((resolve) => {
        const api = create(host, Object.assign({}, o, {
          modus: "frei", tabellen: false,
          onRun(info, ok) { resolve({ ok, text: host.querySelector(".labor-fb").textContent, info }); host.remove(); },
        }));
        const warte = () => { const ta = host.querySelector("textarea"); if (!ta) return setTimeout(warte, 10); ta.value = sql; api.los(); };
        warte();
      });
    });
  }

  window.Labor = { daten, bereit, create, tabelle, zeitlupe, gruppen, training, abfrage, beurteile, sqlHTML, glaetten };

  /* Statische SQL-Beispiele einfärben: <pre class="sql" data-sql>…</pre> */
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("pre.sql[data-farbe], code.sql").forEach((p) => { p.innerHTML = sqlHTML(p.textContent); });
  });
})();

/* SQL-Kurs · Das eigene Projekt: Projekt-Datenbank (bleibt im Browser, als .db speichern/öffnen),
   Projekt-Labor mit Prüfliste, Planer (Tabellen entwerfen → ER-Diagramm → CREATE TABLE) und Formular-Baukasten.
   Braucht labor.js und labor-extra.js. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic.

     Labor.projektlabor(el, { aufgaben: [{ text, pruef(db) → true | "Hinweis" }], sql: "Startinhalt" })
     Labor.planer(el, {})
     Labor.formular(el, { art: "suche" | "eingabe" })
*/
(function () {
  "use strict";
  const L = window.Labor;
  const { ergebnisHTML, esc, T, fehlerText, metaLesen, glaetten, sqlHTML, oeffnen } = L._intern;
  const store = window.Kurs ? window.Kurs.store : { get: () => null, set: () => {} };
  const KEY = "sql-projekt-db";
  const qid = (s) => `"${String(s).replace(/"/g, '""')}"`;

  /* ---------- Die Projekt-Datenbank ---------- */
  let SQLlib = null, DB = null;
  const hoerer = new Set();
  const b64 = {
    aus(u8) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); },
    ein(t) { const s = atob(t); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; },
  };
  const Projekt = {
    async db() {
      if (DB) return DB;
      SQLlib = await L.bereit();
      const gespeichert = store.get(KEY);
      try { DB = gespeichert ? new SQLlib.Database(b64.ein(gespeichert)) : new SQLlib.Database(); } catch (e) { DB = new SQLlib.Database(); }
      DB.run("PRAGMA foreign_keys = ON");
      return DB;
    },
    sichern() { if (DB) store.set(KEY, b64.aus(DB.export())); hoerer.forEach((f) => f()); },
    neu(bytes) {
      if (DB) DB.close();
      DB = bytes ? new SQLlib.Database(bytes) : new SQLlib.Database();
      DB.run("PRAGMA foreign_keys = ON");
      this.sichern();
    },
    tabellen() {
      const r = DB.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0];
      return r ? r.values.map((v) => v[0]) : [];
    },
    spalten(t) {
      const info = DB.exec(`PRAGMA table_info(${qid(t)})`)[0];
      const fks = DB.exec(`PRAGMA foreign_key_list(${qid(t)})`)[0];
      const fk = {};
      if (fks) fks.values.forEach((r) => { fk[r[3]] = r[2]; });            // from → table
      return info ? info.values.map((r) => ({ name: r[1], typ: (r[2] || "").toUpperCase(), pk: r[5] > 0, fk: fk[r[1]] || null })) : [];
    },
    herunterladen(name) {
      const blob = new Blob([DB.export()], { type: "application/vnd.sqlite3" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name || "pfotenglueck.db";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    async oeffnen(datei) {
      await this.db();
      const buf = new Uint8Array(await datei.arrayBuffer());
      const kopf = new TextDecoder().decode(buf.slice(0, 15));
      if (kopf.startsWith("SQLite format 3")) { this.neu(buf); return "db"; }
      const text = new TextDecoder().decode(buf);
      this.neu(null);
      DB.exec(text);
      this.sichern();
      return "sql";
    },
    beimAendern(f) { hoerer.add(f); },
  };
  L.Projekt = Projekt;

  /** Leiste mit Speichern / Öffnen / Neu – für alle Projekt-Bausteine gleich */
  function dateiLeiste(el, nachher) {
    const box = document.createElement("div");
    box.className = "projekt-leiste";
    box.innerHTML = `
      <button type="button" class="btn secondary pj-speichern" data-tipp="${esc(T("Lädt deine Datenbank als Datei herunter. Speichere sie am Ende jeder Stunde – die Schul-PCs vergessen beim Neustart alles."))}">💾 ${T("Als Datei speichern (.db)")}</button>
      <label class="btn secondary pj-oeffnen" data-tipp="${esc(T("Öffnet eine gespeicherte .db-Datei (oder eine .sql-Datei aus dem Planer)."))}">📂 ${T("Datei öffnen")}<input type="file" accept=".db,.sqlite,.sql" hidden></label>
      <button type="button" class="btn secondary pj-muster" data-tipp="${esc(T("Ersetzt deine Datenbank durch die fertige Muster-Börse Pfotenglück."))}">🐾 ${T("Muster-Börse laden")}</button>
      <button type="button" class="btn secondary pj-neu" data-tipp="${esc(T("Löscht alles und beginnt mit einer leeren Datenbank."))}">🗑 ${T("Leer anfangen")}</button>
      <span class="pj-meldung" aria-live="polite"></span>`;
    el.prepend(box);
    const meld = (t) => { box.querySelector(".pj-meldung").textContent = t; };
    box.querySelector(".pj-speichern").addEventListener("click", async () => { await Projekt.db(); Projekt.herunterladen(); meld(T("Gespeichert – die Datei liegt bei deinen Downloads.")); });
    box.querySelector(".pj-oeffnen input").addEventListener("change", async (ev) => {
      const f = ev.target.files[0]; if (!f) return;
      try { const art = await Projekt.oeffnen(f); meld(art === "db" ? T(`„${f.name}“ geöffnet.`) : T(`Plan „${f.name}“ ausgeführt – die Tabellen sind angelegt.`)); }
      catch (e) { meld(T("Die Datei konnte nicht geöffnet werden:") + " " + e.message); }
      ev.target.value = ""; if (nachher) nachher();
    });
    box.querySelector(".pj-muster").addEventListener("click", async () => {
      if (Projekt.tabellen && DB && Projekt.tabellen().length && !confirm(T("Deine Datenbank wird durch die Muster-Börse ersetzt. Vorher speichern? Abbrechen = nichts tun."))) return;
      await Projekt.db();
      const muster = oeffnen(SQLlib, "pfoten");
      Projekt.neu(muster.export()); muster.close();
      meld(T("Muster-Börse geladen.")); if (nachher) nachher();
    });
    box.querySelector(".pj-neu").addEventListener("click", async () => {
      if (!confirm(T("Wirklich alles löschen? Das lässt sich nicht rückgängig machen."))) return;
      await Projekt.db(); Projekt.neu(null); meld(T("Leere Datenbank.")); if (nachher) nachher();
    });
  }

  function tabellenHTML() {
    const tabs = Projekt.tabellen();
    if (!tabs.length) return `<p class="muted">${T("Noch keine Tabellen.")}</p>`;
    return tabs.map((t) => {
      const r = DB.exec(`SELECT * FROM ${qid(t)}`)[0];
      const sp = Projekt.spalten(t);
      const kopf = sp.map((c) => `${c.pk ? "🔑 " : c.fk ? "→ " : ""}${c.name}`);
      return `<details class="labor-tabelle" open><summary><span class="tabname">📋 ${esc(t)}</span> <span class="muted">${T(`${r ? r.values.length : 0} Zeilen · ${sp.length} Spalten`)}</span></summary>`
        + ergebnisHTML({ spalten: kopf, zeilen: r ? r.values : [] }) + "</details>";
    }).join("");
  }

  /* ---------- Projekt-Labor ---------- */
  const PROJEKT_LEISTE = ["CREATE TABLE", "(", ")", ",", "INTEGER PRIMARY KEY", "TEXT", "INTEGER", "REAL", "REFERENCES",
    "INSERT INTO", "VALUES", "'…'", "UPDATE", "SET", "DELETE FROM", "WHERE", "=", "SELECT", "*", "FROM", "JOIN", "ON", ";"];

  function projektlabor(el, o) {
    el.classList.add("labor", "projekt-labor");
    el.innerHTML = `
      <div class="pj-tabs"></div>
      <div class="labor-code"><textarea class="labor-eingabe" rows="${o.zeilen || 5}" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="${esc(T("SQL für dein Projekt"))}"></textarea>
        <div class="labor-bausteine"></div></div>
      <div class="labor-ctrl"><button type="button" class="btn labor-run" data-tipp="${esc(T("Führt die Befehle in deiner Projekt-Datenbank aus. Änderungen bleiben gespeichert."))}">▶ ${T("Ausführen")}</button>
        <span class="pj-tipp">💡 ${T("Mehrere Befehle mit ; trennen")}</span></div>
      <div class="fb labor-fb" aria-live="polite"></div>
      <div class="labor-erg" hidden></div>
      ${o.aufgaben ? `<div class="pj-pruefliste"><p class="labor-erg-t">${T("Prüfliste")}</p><ul class="pj-liste"></ul></div>` : ""}`;
    const $ = (s) => el.querySelector(s);
    const ta = $("textarea"), fb = $(".labor-fb"), erg = $(".labor-erg");
    // Startinhalt: Kommentarzeilen (-- …) werden übersetzt, SQL-Befehle nie
    ta.value = (o.sql || "").split("\n").map((z) => (/^--/.test(z) ? T(z) : z)).join("\n");
    const zeige = (h, art) => { fb.className = "fb labor-fb show " + art; fb.innerHTML = h; };

    function aktualisieren() {
      $(".pj-tabs").innerHTML = tabellenHTML();
      if (o.aufgaben) {
        $(".pj-liste").innerHTML = o.aufgaben.map((a) => {
          let r; try { r = a.pruef(DB, Projekt); } catch (e) { r = false; }
          const ok = r === true;
          return `<li class="${ok ? "ok" : ""}"><span class="pj-haken">${ok ? "✔" : "○"}</span> <span>${T(a.text)}${!ok && typeof r === "string" ? `<br><small>${T(r)}</small>` : ""}</span></li>`;
        }).join("");
      }
    }
    PROJEKT_LEISTE.concat(o.extra || []).forEach((t) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "baustein" + (/^[A-Z][A-Z (*)]*$/.test(t) && t.length > 1 ? " kw" : " op"); b.textContent = t;
      b.dataset.tipp = T("Antippen fügt den Baustein dort ein, wo der Cursor steht."); b.dataset.tippEinmal = "leiste";
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("click", () => {
        const a = ta.selectionStart ?? ta.value.length, z = ta.selectionEnd ?? a;
        const txt = t === "'…'" ? "''" : t, vor = ta.value.slice(0, a);
        const davor = vor && !/\s$/.test(vor) && !["," , ")", ";"].includes(t) ? " " : "";
        ta.value = vor + davor + txt + (t === "'…'" ? "" : " ") + ta.value.slice(z);
        const pos = (vor + davor).length + (t === "'…'" ? 1 : txt.length + 1);
        ta.focus(); ta.setSelectionRange(pos, pos);
      });
      $(".labor-bausteine").appendChild(b);
    });

    function los() {
      const sql = glaetten(ta.value).trim();
      if (!sql) { zeige(T("Da steht noch nichts."), "hint"); return; }
      let last = null, geaendert = 0;
      try {
        DB.run("SAVEPOINT schritt");
        for (const stmt of DB.iterateStatements(sql)) {
          const sp = stmt.getColumnNames(), z = [];
          while (stmt.step()) z.push(stmt.get());
          if (sp.length) last = { spalten: sp, zeilen: z };
          stmt.free();
          geaendert += DB.getRowsModified();
        }
        DB.run("RELEASE schritt");
      } catch (e) {
        try { DB.run("ROLLBACK TO schritt"); DB.run("RELEASE schritt"); } catch (e2) { /* nichts offen */ }
        const msg = String(e.message || e);
        const m = metaLesen(DB);
        zeige("✘ " + projektFehler(msg, sql, m) + `<br><small>${T("Es wurde nichts geändert.")}</small>`, "hint");
        erg.hidden = true;
        aktualisieren();
        return;
      }
      Projekt.sichern();
      erg.hidden = !last;
      if (last) erg.innerHTML = `<p class="labor-erg-t">${T("Ergebnis")}</p>` + ergebnisHTML(last);
      zeige(last ? T("✔ Ausgeführt.") : geaendert === 1 ? T("✔ Ausgeführt. 1 Zeile geändert.") : T(`✔ Ausgeführt. ${geaendert} Zeilen geändert.`), "ok");
      aktualisieren();
      if (o.onRun) o.onRun(DB);
    }
    $(".labor-run").addEventListener("click", los);
    ta.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); los(); } });
    dateiLeiste(el, aktualisieren);
    Projekt.beimAendern(aktualisieren);
    Projekt.db().then(aktualisieren);
  }

  /** Fehlermeldungen beim Anlegen und Ändern */
  function projektFehler(msg, sql, m) {
    let r;
    if ((r = msg.match(/table (\S+) already exists/))) return T(`Die Tabelle <code>${esc(r[1])}</code> gibt es schon. Willst du neu anfangen, lösche sie mit <code>DROP TABLE ${esc(r[1])}</code>.`);
    if ((r = msg.match(/UNIQUE constraint failed: (\S+)/)) || /PRIMARY KEY/.test(msg)) return T(`Diese ID gibt es schon (<code>${esc(r ? r[1] : "id")}</code>). Jede ID darf nur einmal vorkommen – lass die <code>id</code> weg, dann vergibt die Datenbank selbst die nächste Nummer.`);
    if (/FOREIGN KEY constraint failed/.test(msg)) return T("Ein Fremdschlüssel zeigt auf eine ID, die es nicht gibt (oder du willst eine Zeile löschen, auf die noch etwas zeigt). Prüf die Nummern.");
    if ((r = msg.match(/table (\S+) has (\d+) columns but (\d+) values were supplied/))) return T(`Die Tabelle <code>${esc(r[1])}</code> hat ${r[2]} Spalten, du gibst ${r[3]} Werte an. Nenn die Spalten in Klammern: <code>INSERT INTO ${esc(r[1])} (spalte1, spalte2) VALUES (…)</code>.`);
    if ((r = msg.match(/(\d+) values for (\d+) columns/))) return T(`${r[1]} Werte für ${r[2]} Spalten – die Anzahl muss gleich sein.`);
    if (/NOT NULL constraint failed: (\S+)/.test(msg)) return T(`Die Spalte <code>${esc(msg.split(": ")[1])}</code> darf nicht leer bleiben.`);
    if (/near "\)": syntax error/.test(msg) && /,\s*\)/.test(sql)) return T("Vor der schließenden Klammer steht ein Komma zu viel.");
    return fehlerText(msg, sql, m);
  }

  /* ---------- Planer: Tabellen entwerfen ---------- */
  const PLAN_KEY = "sql-projekt-plan";
  const VORSCHLAG = { tabellen: [
    { name: "besitzer", spalten: [{ name: "id", typ: "INTEGER", pk: true }, { name: "vorname", typ: "TEXT" }, { name: "wohnort", typ: "TEXT" }] },
    { name: "arten", spalten: [{ name: "id", typ: "INTEGER", pk: true }, { name: "name", typ: "TEXT" }, { name: "fell", typ: "TEXT" }] },
    { name: "tiere", spalten: [{ name: "id", typ: "INTEGER", pk: true }, { name: "name", typ: "TEXT" }, { name: "besitzer_id", typ: "INTEGER", fk: "besitzer" },
      { name: "art_id", typ: "INTEGER", fk: "arten" }, { name: "alter_jahre", typ: "INTEGER" }, { name: "hobby", typ: "TEXT" }, { name: "sucht", typ: "TEXT" }] },
  ] };

  function planer(el) {
    el.classList.add("planer");
    let plan;
    try { plan = JSON.parse(store.get(PLAN_KEY) || "null"); } catch (e) { plan = null; }
    if (!plan) plan = { tabellen: [{ name: "", spalten: [{ name: "id", typ: "INTEGER", pk: true }] }] };
    el.innerHTML = `<div class="planer-knoepfe btn-row">
        <button type="button" class="btn secondary pl-tab" data-tipp="${esc(T("Eine weitere Tabelle hinzufügen."))}">＋ ${T("Tabelle")}</button>
        <button type="button" class="btn secondary pl-vorschlag" data-tipp="${esc(T("Lädt einen Vorschlag mit drei Tabellen. Du kannst ihn danach ändern und erweitern."))}">💡 ${T("Vorschlag laden")}</button>
        <button type="button" class="btn secondary pl-leer" data-tipp="${esc(T("Plan löschen und neu beginnen."))}">🗑 ${T("Neu")}</button>
      </div>
      <div class="planer-tabellen"></div>
      <h3 class="sub">${T("Dein ER-Diagramm")}</h3><div class="planer-er"></div>
      <div class="planer-check"></div>
      <h3 class="sub">${T("Daraus wird SQL")}</h3><pre class="sql planer-sql"></pre>
      <div class="btn-row"><button type="button" class="btn pl-sql" data-tipp="${esc(T("Speichert den Plan als .sql-Datei. In Lektion 13 öffnest du sie im Projekt-Labor."))}">💾 ${T("Plan als Datei speichern (.sql)")}</button>
        <button type="button" class="btn secondary pl-anlegen" data-tipp="${esc(T("Legt die Tabellen gleich in deiner Projekt-Datenbank an."))}">▶ ${T("Tabellen gleich anlegen")}</button></div>
      <p class="fb planer-fb" aria-live="polite"></p>`;
    const $ = (s) => el.querySelector(s);
    const sichern = () => store.set(PLAN_KEY, JSON.stringify(plan));
    const namenOk = (n) => /^[a-z][a-z0-9_]*$/.test(n);

    function sqlAus() {
      return plan.tabellen.filter((t) => t.name).map((t) => {
        const z = t.spalten.filter((c) => c.name).map((c) => `  ${c.name} ${c.pk ? "INTEGER PRIMARY KEY" : c.typ}${c.fk && !c.pk ? ` REFERENCES ${c.fk}(id)` : ""}`);
        return `CREATE TABLE ${t.name} (\n${z.join(",\n")}\n);`;
      }).join("\n\n");
    }

    function pruefen() {
      const h = [];
      const namen = plan.tabellen.map((t) => t.name).filter(Boolean);
      plan.tabellen.forEach((t, i) => {
        const tn = t.name || T(`Tabelle ${i + 1}`);
        if (!t.name) h.push(T(`${tn}: Gib der Tabelle einen Namen.`));
        else if (!namenOk(t.name)) h.push(T(`<code>${esc(t.name)}</code>: Tabellennamen klein, ohne Leerzeichen und Umlaute (z. B. <code>tiere</code>).`));
        if (!t.spalten.some((c) => c.pk)) h.push(T(`${esc(tn)}: Es fehlt ein Primärschlüssel (🔑). Meist ist das <code>id</code>.`));
        t.spalten.forEach((c) => {
          if (c.name && !namenOk(c.name)) h.push(T(`<code>${esc(c.name)}</code>: Spaltennamen klein, ohne Leerzeichen und Umlaute (ü → ue).`));
          if (c.fk && !namen.includes(c.fk)) h.push(T(`<code>${esc(c.name)}</code> verweist auf <code>${esc(c.fk)}</code> – diese Tabelle gibt es nicht.`));
          if (c.fk && c.typ !== "INTEGER") h.push(T(`<code>${esc(c.name)}</code> ist ein Fremdschlüssel und zeigt auf eine ID – Datentyp <code>INTEGER</code>.`));
          if (c.fk && c.name && !/_id$/.test(c.name)) h.push(T(`Tipp: Nenn den Fremdschlüssel <code>${esc(c.fk)}_id</code> o. ä. – dann sieht man sofort, wohin er zeigt.`));
        });
        const dopp = t.spalten.map((c) => c.name).filter((n, k, a) => n && a.indexOf(n) !== k);
        if (dopp.length) h.push(T(`${esc(tn)}: Die Spalte <code>${esc(dopp[0])}</code> gibt es doppelt.`));
      });
      if (namen.length < 2) h.push(T("Für die Partnerbörse brauchst du mindestens zwei Tabellen."));
      else if (!plan.tabellen.some((t) => t.spalten.some((c) => c.fk))) h.push(T("Noch hängt nichts zusammen. Gib einer Tabelle einen Fremdschlüssel (→), der auf eine andere zeigt."));
      return h;
    }

    function zeichnen() {
      const box = $(".planer-tabellen");
      const namen = plan.tabellen.map((t) => t.name).filter(Boolean);
      box.innerHTML = plan.tabellen.map((t, ti) => `
        <div class="planer-tab" data-t="${ti}">
          <div class="planer-kopf"><input class="pl-name" value="${esc(t.name)}" placeholder="${esc(T("tabellenname"))}" aria-label="${esc(T("Name der Tabelle"))}" spellcheck="false" autocapitalize="off">
            <button type="button" class="pl-weg" aria-label="${esc(T("Tabelle entfernen"))}" data-tipp="${esc(T("Tabelle entfernen"))}">✕</button></div>
          <table class="planer-spalten"><thead><tr><th>${T("Spalte")}</th><th>${T("Datentyp")}</th><th title="${esc(T("Primärschlüssel"))}">🔑</th><th title="${esc(T("Fremdschlüssel: zeigt auf …"))}">→</th><th></th></tr></thead><tbody>
          ${t.spalten.map((c, ci) => `<tr data-c="${ci}">
            <td><input class="pl-sp" value="${esc(c.name)}" placeholder="${esc(T("spalte"))}" spellcheck="false" autocapitalize="off" aria-label="${esc(T("Spaltenname"))}"></td>
            <td><select class="pl-typ" aria-label="${esc(T("Datentyp"))}">${["TEXT", "INTEGER", "REAL"].map((x) => `<option${x === c.typ ? " selected" : ""}>${x}</option>`).join("")}</select></td>
            <td><input type="checkbox" class="pl-pk"${c.pk ? " checked" : ""} aria-label="${esc(T("Primärschlüssel"))}"></td>
            <td><select class="pl-fk" aria-label="${esc(T("Fremdschlüssel"))}"><option value="">–</option>${namen.filter((n) => n !== t.name).map((n) => `<option${n === c.fk ? " selected" : ""}>${esc(n)}</option>`).join("")}</select></td>
            <td><button type="button" class="pl-spweg" aria-label="${esc(T("Spalte entfernen"))}">✕</button></td></tr>`).join("")}
          </tbody></table>
          <button type="button" class="btn secondary pl-spalte">＋ ${T("Spalte")}</button>
        </div>`).join("");
      neuBerechnen();
    }

    function neuBerechnen() {
      sichern();
      const tabs = plan.tabellen.filter((t) => t.name);
      const bez = [];
      tabs.forEach((t) => t.spalten.forEach((c) => { if (c.fk && tabs.some((x) => x.name === c.fk)) bez.push({ von: c.fk, nach: t.name, kard: ["1", "n"] }); }));
      // Tabellen mit Fremdschlüsseln (n-Seite) in die Mitte, damit sich die Linien nicht kreuzen
      const kinder = tabs.filter((t) => t.spalten.some((c) => c.fk)), eltern = tabs.filter((t) => !kinder.includes(t));
      const ordnung = eltern.length ? [eltern[0], ...kinder, ...eltern.slice(1)] : kinder;
      const pos = ordnung.map((t, i) => Object.assign({}, t, { x: 10 + (i % 3) * 330, y: 10 + Math.floor(i / 3) * 260, spalten: t.spalten.filter((c) => c.name).map((c) => ({ name: c.name, pk: c.pk, fk: c.fk })) }));
      if (pos.length) L.er($(".planer-er"), { tabellen: pos, beziehungen: bez }); else $(".planer-er").innerHTML = `<p class="muted">${T("Noch keine Tabelle mit Namen.")}</p>`;
      const h = pruefen();
      $(".planer-check").innerHTML = h.length
        ? `<div class="fb show hint"><strong>${T("Noch zu tun:")}</strong><ul>${h.map((x) => `<li>${x}</li>`).join("")}</ul></div>`
        : `<p class="fb show ok">${T("✔ Der Plan sieht gut aus! Jede Tabelle hat einen Primärschlüssel, und die Tabellen hängen über Fremdschlüssel zusammen.")}</p>`;
      $(".planer-sql").innerHTML = sqlHTML(sqlAus());
    }

    el.addEventListener("input", (ev) => {
      const tEl = ev.target.closest(".planer-tab"); if (!tEl) return;
      const t = plan.tabellen[+tEl.dataset.t];
      if (ev.target.classList.contains("pl-name")) { const alt = t.name; t.name = ev.target.value.trim(); plan.tabellen.forEach((x) => x.spalten.forEach((c) => { if (c.fk === alt) c.fk = t.name; })); neuBerechnen(); return; }
      const cEl = ev.target.closest("tr[data-c]"); if (!cEl) return;
      const c = t.spalten[+cEl.dataset.c];
      if (ev.target.classList.contains("pl-sp")) c.name = ev.target.value.trim();
      neuBerechnen();
    });
    el.addEventListener("change", (ev) => {
      const tEl = ev.target.closest(".planer-tab"); if (!tEl) return;
      const t = plan.tabellen[+tEl.dataset.t];
      if (ev.target.classList.contains("pl-name")) { zeichnen(); return; }
      const cEl = ev.target.closest("tr[data-c]"); if (!cEl) return;
      const c = t.spalten[+cEl.dataset.c];
      if (ev.target.classList.contains("pl-typ")) c.typ = ev.target.value;
      if (ev.target.classList.contains("pl-pk")) { t.spalten.forEach((x) => { x.pk = false; }); c.pk = ev.target.checked; if (c.pk) { c.typ = "INTEGER"; c.fk = null; } zeichnen(); return; }
      if (ev.target.classList.contains("pl-fk")) { c.fk = ev.target.value || null; if (c.fk) c.typ = "INTEGER"; zeichnen(); return; }
      neuBerechnen();
    });
    el.addEventListener("click", (ev) => {
      const tEl = ev.target.closest(".planer-tab");
      if (ev.target.closest(".pl-tab")) { plan.tabellen.push({ name: "", spalten: [{ name: "id", typ: "INTEGER", pk: true }] }); zeichnen(); }
      else if (ev.target.closest(".pl-vorschlag")) { if (plan.tabellen.some((t) => t.name) && !confirm(T("Deinen Plan durch den Vorschlag ersetzen?"))) return; plan = JSON.parse(JSON.stringify(VORSCHLAG)); zeichnen(); }
      else if (ev.target.closest(".pl-leer")) { if (!confirm(T("Plan wirklich löschen?"))) return; plan = { tabellen: [{ name: "", spalten: [{ name: "id", typ: "INTEGER", pk: true }] }] }; zeichnen(); }
      else if (tEl && ev.target.closest(".pl-spalte")) { plan.tabellen[+tEl.dataset.t].spalten.push({ name: "", typ: "TEXT" }); zeichnen(); }
      else if (tEl && ev.target.closest(".pl-weg")) { plan.tabellen.splice(+tEl.dataset.t, 1); zeichnen(); }
      else if (tEl && ev.target.closest(".pl-spweg")) { plan.tabellen[+tEl.dataset.t].spalten.splice(+ev.target.closest("tr").dataset.c, 1); zeichnen(); }
      else if (ev.target.closest(".pl-sql")) {
        const blob = new Blob([`-- Plan für mein Projekt (SQL-Kurs)\n${sqlAus()}\n`], { type: "text/plain" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mein-plan.sql"; document.body.appendChild(a); a.click(); a.remove();
      } else if (ev.target.closest(".pl-anlegen")) {
        const h = pruefen(); const fb = $(".planer-fb");
        if (h.length) { fb.className = "fb planer-fb show hint"; fb.innerHTML = T("Erst die Punkte unter „Noch zu tun“ erledigen."); return; }
        Projekt.db().then((db) => {
          try { db.exec(sqlAus()); Projekt.sichern(); fb.className = "fb planer-fb show ok"; fb.innerHTML = T("✔ Die Tabellen sind in deiner Projekt-Datenbank angelegt. Weiter geht es in Lektion 13 – vorher als Datei speichern!"); }
          catch (e) { fb.className = "fb planer-fb show hint"; fb.innerHTML = "✘ " + projektFehler(String(e.message || e), sqlAus(), metaLesen(db)); }
        });
      }
    });
    zeichnen();
  }

  /* ---------- Formular-Baukasten ---------- */
  const FORM_TAB = "formulare";

  function formular(el, o) {
    el.classList.add("formular-baukasten");
    const art = o.art || "suche";
    el.innerHTML = `<div class="fb-bau"></div><h3 class="sub">${T("Dein Formular")}</h3><div class="fb-vorschau"></div>
      <h3 class="sub">${T("Das SQL dahinter")}</h3><pre class="sql fb-sql"></pre><div class="fb-erg"></div>`;
    const $ = (s) => el.querySelector(s);
    let def = { tabelle: "", felder: [], anzeigen: [] };

    function optionenFuer(tab, sp) {
      // Fremdschlüssel: Auswahl mit den Namen aus der anderen Tabelle
      const c = Projekt.spalten(tab).find((x) => x.name === sp);
      if (c && c.fk) {
        const zsp = Projekt.spalten(c.fk);
        const anzeige = (zsp.find((x) => x.typ === "TEXT") || zsp[1] || zsp[0]).name;
        const r = DB.exec(`SELECT id, ${qid(anzeige)} FROM ${qid(c.fk)} ORDER BY ${qid(anzeige)}`)[0];
        return r ? r.values.map((v) => ({ wert: v[0], text: `${v[1]} (${v[0]})` })) : [];
      }
      const r = DB.exec(`SELECT DISTINCT ${qid(sp)} FROM ${qid(tab)} WHERE ${qid(sp)} IS NOT NULL ORDER BY 1`)[0];
      return r ? r.values.map((v) => ({ wert: v[0], text: String(v[0]) })) : [];
    }

    function bau() {
      const tabs = Projekt.tabellen().filter((t) => t !== FORM_TAB);
      if (!tabs.length) { $(".fb-bau").innerHTML = `<p class="fb show hint">${T("Deine Projekt-Datenbank ist leer. Öffne deine gespeicherte .db-Datei oder lade die Muster-Börse (Knöpfe oben).")}</p>`; $(".fb-vorschau").innerHTML = ""; $(".fb-sql").textContent = ""; return; }
      if (!tabs.includes(def.tabelle)) def = { tabelle: tabs.includes("tiere") ? "tiere" : tabs[0], felder: [], anzeigen: [] };
      const sp = Projekt.spalten(def.tabelle);
      if (art === "eingabe" && !def.felder.length) def.felder = sp.filter((c) => !c.pk).map((c) => ({ spalte: c.name, label: beschriftung(c.name), auswahl: !!c.fk }));
      if (art === "suche" && !def.anzeigen.length) def.anzeigen = sp.filter((c) => !c.pk).slice(0, 4).map((c) => c.name);
      if (art === "suche" && !def.felder.length && !def.start) {
        def.start = true;
        const c = sp.find((x) => !x.pk && x.typ === "TEXT") || sp.find((x) => !x.pk) || sp[0];
        def.felder = [{ spalte: c.name, label: beschriftung(c.name), vgl: c.fk ? "=" : "LIKE", auswahl: !!c.fk }];
      }
      $(".fb-bau").innerHTML = `
        <label class="fb-zeile">${T("Tabelle:")} <select class="fb-tab">${tabs.map((t) => `<option${t === def.tabelle ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
        ${art === "suche" ? `
          <p class="fb-zeile"><strong>${T("Suchfelder")}</strong> – ${T("jedes Feld wird zu einer Bedingung nach WHERE. Leere Felder werden übersprungen.")}</p>
          <table class="plain fb-felder"><tr><th>${T("Beschriftung")}</th><th>${T("Spalte")}</th><th>${T("Vergleich")}</th><th>${T("Eingabe")}</th><th></th></tr>
          ${def.felder.map((f, i) => `<tr data-i="${i}"><td><input class="ff-label" value="${esc(f.label)}"></td>
            <td><select class="ff-sp">${sp.map((c) => `<option${c.name === f.spalte ? " selected" : ""}>${esc(c.name)}</option>`).join("")}</select></td>
            <td><select class="ff-vgl">${[["=", T("ist gleich")], ["LIKE", T("enthält")], [">=", T("mindestens")], ["<=", T("höchstens")]].map(([v, t]) => `<option value="${v}"${v === f.vgl ? " selected" : ""}>${t}</option>`).join("")}</select></td>
            <td><select class="ff-art"><option value="text"${!f.auswahl ? " selected" : ""}>${T("Textfeld")}</option><option value="auswahl"${f.auswahl ? " selected" : ""}>${T("Auswahlliste")}</option></select></td>
            <td><button type="button" class="ff-weg" aria-label="${esc(T("Feld entfernen"))}">✕</button></td></tr>`).join("")}
          </table>
          <button type="button" class="btn secondary ff-neu">＋ ${T("Suchfeld")}</button>
          <p class="fb-zeile"><strong>${T("Im Ergebnis zeigen:")}</strong> ${sp.map((c) => `<label class="fb-cb"><input type="checkbox" class="ff-zeig" value="${esc(c.name)}"${def.anzeigen.includes(c.name) ? " checked" : ""}> ${esc(c.name)}</label>`).join(" ")}</p>`
        : `<p class="fb-zeile"><strong>${T("Eingabefelder")}</strong> – ${T("eines je Spalte. Die id vergibt die Datenbank selbst.")}</p>
          <table class="plain fb-felder"><tr><th>${T("Spalte")}</th><th>${T("Beschriftung")}</th><th>${T("Eingabe")}</th><th>${T("im Formular")}</th></tr>
          ${def.felder.map((f, i) => `<tr data-i="${i}"><td><code>${esc(f.spalte)}</code></td><td><input class="ff-label" value="${esc(f.label)}"></td>
            <td><select class="ff-art"><option value="text"${!f.auswahl ? " selected" : ""}>${T("Textfeld")}</option><option value="auswahl"${f.auswahl ? " selected" : ""}>${T("Auswahlliste")}</option></select></td>
            <td><input type="checkbox" class="ff-an"${f.aus ? "" : " checked"}></td></tr>`).join("")}</table>`}`;
      vorschau();
    }

    const beschriftung = (n) => n.replace(/_id$/, "").replace(/_/g, " ").replace(/^./, (x) => x.toUpperCase());

    function sqlText(werte) {
      const p = (i, f) => (werte ? sqlWert(werte[i], f) : `:${f.spalte}`);
      if (art === "suche") {
        const aktiv = def.felder.map((f, i) => [f, i]).filter(([f, i]) => !werte || String(werte[i] ?? "").trim() !== "");
        // Auswahllisten liefern genaue Werte: „enthält“ wäre dort falsch (art_id 2 enthielte auch 12)
        const vgl = (f) => (f.auswahl && (!f.vgl || f.vgl === "LIKE") ? "=" : f.vgl || "=");
        const bed = aktiv.map(([f, i]) => vgl(f) === "LIKE"
          ? `${f.spalte} LIKE ${werte ? sqlWert("%" + werte[i] + "%") : `'%' || :${f.spalte} || '%'`}` : `${f.spalte} ${vgl(f)} ${p(i, f)}`);
        return `SELECT ${def.anzeigen.length ? def.anzeigen.join(", ") : "*"}\nFROM ${def.tabelle}` + (bed.length ? `\nWHERE ${bed.join("\n  AND ")}` : "");
      }
      const an = def.felder.map((f, i) => [f, i]).filter(([f]) => !f.aus);
      return `INSERT INTO ${def.tabelle} (${an.map(([f]) => f.spalte).join(", ")})\nVALUES (${an.map(([f, i]) => p(i, f)).join(", ")})`;
    }
    function sqlWert(v, f) {
      if (v === undefined || v === null || v === "") return "NULL";
      const sp = f ? Projekt.spalten(def.tabelle).find((c) => c.name === f.spalte) : null;
      if (sp && /INT|REAL/.test(sp.typ) && /^-?\d+([.,]\d+)?$/.test(String(v))) return String(v).replace(",", ".");
      if (typeof v === "number") return String(v);
      return `'${String(v).replace(/'/g, "''")}'`;
    }

    function vorschau(ergLeeren = true) {
      const box = $(".fb-vorschau");
      box.innerHTML = `<form class="fb-form" novalidate>${def.felder.map((f, i) => {
        if (f.aus) return "";
        const sp = Projekt.spalten(def.tabelle).find((c) => c.name === f.spalte);
        const zahl = sp && /INT|REAL/.test(sp.typ) && !(sp && sp.fk);
        const feld = f.auswahl
          ? `<select data-i="${i}"><option value="">${art === "suche" ? T("(egal)") : "…"}</option>${optionenFuer(def.tabelle, f.spalte).map((x) => `<option value="${esc(x.wert)}">${esc(x.text)}</option>`).join("")}</select>`
          : `<input data-i="${i}" ${zahl ? 'inputmode="decimal"' : ""} autocomplete="off">`;
        return `<label class="fb-feld"><span>${esc(f.label || f.spalte)}</span>${feld}</label>`;
      }).join("")}<button type="submit" class="btn">${art === "suche" ? "🔍 " + T("Suchen") : "➕ " + T("Speichern")}</button></form>`;
      $(".fb-sql").innerHTML = sqlHTML(sqlText(null));
      if (ergLeeren) $(".fb-erg").innerHTML = "";
      box.querySelector("form").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const werte = [];
        box.querySelectorAll("[data-i]").forEach((x) => { werte[+x.dataset.i] = x.value; });
        abschicken(werte);
      });
    }

    function abschicken(werte) {
      const sql = sqlText(werte);
      $(".fb-sql").innerHTML = `<span class="muted">-- ${esc(T("mit deinen Eingaben:"))}</span>\n` + sqlHTML(sql);
      if (art === "eingabe") {
        const fehlt = def.felder.find((f, i) => !f.aus && String(werte[i] ?? "").trim() === "");
        if (fehlt) { $(".fb-erg").innerHTML = `<p class="fb show hint">${T(`Bitte „${esc(fehlt.label || fehlt.spalte)}“ ausfüllen.`)}</p>`; return; }
        const keineZahl = def.felder.find((f, i) => {
          const c = Projekt.spalten(def.tabelle).find((x) => x.name === f.spalte);
          return !f.aus && c && /INT|REAL/.test(c.typ) && !/^-?\d+([.,]\d+)?$/.test(String(werte[i]).trim());
        });
        if (keineZahl) { $(".fb-erg").innerHTML = `<p class="fb show hint">${T(`„${esc(keineZahl.label || keineZahl.spalte)}“ muss eine Zahl sein.`)}</p>`; return; }
      }
      try {
        const stmtSql = art === "suche" ? sqlText(werte) : sqlText(werte);
        const res = DB.exec(stmtSql);
        if (art === "eingabe") {
          selbst = true; Projekt.sichern(); selbst = false;
          const r = DB.exec(`SELECT * FROM ${qid(def.tabelle)} ORDER BY rowid DESC LIMIT 5`)[0];
          $(".fb-erg").innerHTML = `<p class="fb show ok">${T("✔ Gespeichert! Die neuesten Zeilen der Tabelle:")}</p>` + ergebnisHTML({ spalten: r.columns, zeilen: r.values });
          vorschau(false);
          $(".fb-sql").innerHTML = `<span class="muted">-- ${esc(T("zuletzt ausgeführt:"))}</span>\n` + sqlHTML(sql);
        } else {
          const r = res[0] || { columns: def.anzeigen, values: [] };
          $(".fb-erg").innerHTML = `<p class="labor-erg-t">${T("Treffer")}</p>` + ergebnisHTML({ spalten: r.columns, zeilen: r.values });
        }
        if (o.onAbschicken) o.onAbschicken({ art, def, werte, sql });
      } catch (e) {
        $(".fb-erg").innerHTML = `<p class="fb show hint">✘ ${projektFehler(String(e.message || e), sql, metaLesen(DB))}</p>`;
      }
    }

    el.addEventListener("change", (ev) => {
      const t = ev.target;
      if (t.closest(".fb-vorschau")) return;
      if (t.classList.contains("fb-tab")) { def = { tabelle: t.value, felder: [], anzeigen: [] }; bau(); return; }
      const tr = t.closest("tr[data-i]"); const f = tr ? def.felder[+tr.dataset.i] : null;
      if (f && t.classList.contains("ff-sp")) { f.spalte = t.value; f.label = beschriftung(t.value); const c = Projekt.spalten(def.tabelle).find((x) => x.name === t.value); f.auswahl = !!(c && c.fk); if (f.auswahl) f.vgl = "="; bau(); return; }
      if (f && t.classList.contains("ff-vgl")) f.vgl = t.value;
      if (f && t.classList.contains("ff-art")) { f.auswahl = t.value === "auswahl"; if (f.auswahl && f.vgl === "LIKE") { f.vgl = "="; bau(); return; } }
      if (f && t.classList.contains("ff-an")) f.aus = !t.checked;
      if (t.classList.contains("ff-zeig")) def.anzeigen = [...el.querySelectorAll(".ff-zeig:checked")].map((x) => x.value);
      vorschau();
    });
    el.addEventListener("input", (ev) => {
      const tr = ev.target.closest(".fb-bau tr[data-i]");
      if (tr && ev.target.classList.contains("ff-label")) { def.felder[+tr.dataset.i].label = ev.target.value; vorschau(); }
    });
    el.addEventListener("click", (ev) => {
      if (ev.target.closest(".ff-neu")) {
        const sp = Projekt.spalten(def.tabelle).find((c) => !c.pk) || Projekt.spalten(def.tabelle)[0];
        def.felder.push({ spalte: sp.name, label: beschriftung(sp.name), vgl: sp.fk ? "=" : "LIKE", auswahl: !!sp.fk }); bau();
      }
      const weg = ev.target.closest(".ff-weg"); if (weg) { def.felder.splice(+weg.closest("tr").dataset.i, 1); bau(); }
    });
    let selbst = false;
    if (o.leiste !== false) dateiLeiste(el, bau);
    Projekt.beimAendern(() => { if (!selbst) bau(); });   // andere Formulare/Labore haben etwas geändert
    Projekt.db().then(bau);
    return { def: () => def, bau };
  }

  Object.assign(L, { projektlabor, planer, formular });
})();

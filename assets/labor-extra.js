/* SQL-Kurs · Erweiterungen des SQL-Labors: ID-Faden, ER-Diagramm, JOIN-Zeitlupe.
   Braucht labor.js. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic.

     Labor.faden(el, { db, tabellen: ["ausleihen","leser"], verweise: { "ausleihen.leser_id": "leser" }, onFaden(info) })
     Labor.er(el, { tabellen: [{ name, spalten: [{ name, pk, fk }] , x, y }], beziehungen: [{ von, nach, text, kard: ["1","n"] }] })
     Labor.joinlupe(el, { db, sql: "SELECT a.x, b.y FROM a JOIN b ON a.b_id = b.id" })
*/
(function () {
  "use strict";
  const L = window.Labor;
  const { oeffnen, ergebnisHTML, esc, T } = L._intern;
  const qid = (s) => `"${String(s).replace(/"/g, '""')}"`;

  /* ---------- ID-Faden: einer ID von Tabelle zu Tabelle folgen ---------- */
  function faden(el, o) {
    el.classList.add("labor", "labor-faden");
    el.innerHTML = `<p class="zl-status faden-status" aria-live="polite">${T("Tipp eine blaue ID an – dann siehst du, wohin sie zeigt.")}</p><div class="faden-tabs"></div>`;
    L.bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db);
      const daten = {};
      o.tabellen.forEach((t) => {
        const sp = o.spalten && o.spalten[t] ? o.spalten[t].map(qid).join(", ") : "*";
        daten[t] = db.exec(`SELECT ${sp} FROM ${qid(t)}`)[0];
      });
      db.close();
      const box = el.querySelector(".faden-tabs");
      o.tabellen.forEach((t) => {
        const d = daten[t];
        const fkIdx = d.columns.map((c) => o.verweise[`${t}.${c}`] || null);
        const wrap = document.createElement("div");
        wrap.className = "faden-tab";
        wrap.dataset.tab = t;
        let h = `<p class="faden-name">📋 <code>${esc(t)}</code></p><div class="labor-scroll"><table class="labor-tab"><thead><tr>`
          + d.columns.map((c, i) => `<th>${esc(c)}${fkIdx[i] ? ` <span class="fk-pfeil" title="${esc(T("verweist auf"))} ${esc(fkIdx[i])}">→ ${esc(fkIdx[i])}</span>` : ""}</th>`).join("")
          + "</tr></thead><tbody>";
        d.values.forEach((r) => {
          h += `<tr data-id="${esc(r[0])}">` + r.map((v, i) => {
            const leer = v === null;
            if (fkIdx[i] && !leer) return `<td class="num"><button type="button" class="fk" data-ziel="${esc(fkIdx[i])}" data-wert="${esc(v)}" data-spalte="${esc(d.columns[i])}" data-tipp="${esc(T("Antippen: Wohin zeigt diese ID?"))}" data-tipp-einmal="faden">${esc(v)}</button></td>`;
            return `<td${typeof v === "number" ? ' class="num"' : ""}>${leer ? '<span class="null">NULL</span>' : esc(v)}</td>`;
          }).join("") + "</tr>";
        });
        h += "</tbody></table></div>";
        wrap.innerHTML = h;
        box.appendChild(wrap);
      });
      el.addEventListener("click", (ev) => {
        const b = ev.target.closest("button.fk");
        if (!b) return;
        el.querySelectorAll(".faden-quelle, .faden-ziel").forEach((x) => x.classList.remove("faden-quelle", "faden-ziel"));
        b.closest("tr").classList.add("faden-quelle");
        const zielTab = el.querySelector(`.faden-tab[data-tab="${CSS.escape(b.dataset.ziel)}"]`);
        const zeile = zielTab && zielTab.querySelector(`tr[data-id="${CSS.escape(b.dataset.wert)}"]`);
        const status = el.querySelector(".faden-status");
        if (!zeile) { status.innerHTML = T(`In <code>${esc(b.dataset.ziel)}</code> gibt es keine Zeile mit id ${esc(b.dataset.wert)}!`); return; }
        zeile.classList.add("faden-ziel");
        const scroll = zeile.closest(".labor-scroll");
        scroll.scrollTop = zeile.offsetTop - scroll.clientHeight / 2;
        zielTab.scrollIntoView({ block: "nearest", behavior: "smooth" });
        const zellen = [...zeile.children].map((td) => td.textContent);
        const kopf = [...zielTab.querySelectorAll("th")].map((th) => th.childNodes[0].textContent.trim());
        const text = kopf.slice(1).map((k, i) => `${k}: <strong>${esc(zellen[i + 1])}</strong>`).join(" · ");
        status.innerHTML = `<code>${esc(b.dataset.spalte)} = ${esc(b.dataset.wert)}</code> → ${T("in")} <code>${esc(b.dataset.ziel)}</code> ${T("die Zeile mit")} <code>id = ${esc(b.dataset.wert)}</code>: ${text}`;
        if (o.onFaden) o.onFaden({ spalte: b.dataset.spalte, wert: b.dataset.wert, ziel: b.dataset.ziel, zeile: zellen });
      });
    }).catch((e) => { el.textContent = "SQL-Labor konnte nicht starten: " + e.message; });
  }

  /* ---------- ER-Diagramm (Tabellen als Kästen, Beziehung mit Raute und 1/n) ---------- */
  function er(el, o) {
    el.classList.add("er-diagramm");
    const B = 190, ZH = 22, KH = 30;
    const tabs = o.tabellen.map((t, i) => Object.assign({ x: 10 + i * 330, y: 10 }, t));
    const hoehe = (t) => KH + t.spalten.length * ZH + 6;
    const W = Math.max(...tabs.map((t) => t.x + B)) + 10;
    const H = Math.max(...tabs.map((t) => t.y + hoehe(t))) + 10;
    const pos = Object.fromEntries(tabs.map((t) => [t.name, t]));
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(T("ER-Diagramm"))}" xmlns="http://www.w3.org/2000/svg">`;
    (o.beziehungen || []).forEach((r) => {
      const a = pos[r.von], b = pos[r.nach];
      const ax = a.x + B / 2, ay = a.y + hoehe(a) / 2, bx = b.x + B / 2, by = b.y + hoehe(b) / 2;
      // Anschlusspunkte: Kastenrand in Richtung des anderen Kastens
      const rand = (t, cx, cy, zx, zy) => {
        const dx = zx - cx, dy = zy - cy, hw = B / 2, hh = hoehe(t) / 2;
        const s = Math.min(hw / Math.abs(dx || 1e-9), hh / Math.abs(dy || 1e-9));
        return [cx + dx * s, cy + dy * s];
      };
      const [x1, y1] = rand(a, ax, ay, bx, by), [x2, y2] = rand(b, bx, by, ax, ay);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="er-linie"/>`;
      if (r.text) {
        const w = Math.max(60, r.text.length * 7.5 + 24);
        svg += `<polygon points="${mx - w / 2},${my} ${mx},${my - 16} ${mx + w / 2},${my} ${mx},${my + 16}" class="er-raute"/>`
          + `<text x="${mx}" y="${my + 4}" text-anchor="middle" class="er-rtext">${esc(T(r.text))}</text>`;
      }
      const k = r.kard || [];
      const lab = (x, y, zx, zy, txt) => {
        const d = Math.hypot(zx - x, zy - y) || 1;
        const px = x + (zx - x) / d * 18 + (zy - y) / d * 10, py = y + (zy - y) / d * 18 - (zx - x) / d * 10;
        return `<text x="${px}" y="${py + 4}" text-anchor="middle" class="er-kard">${esc(txt)}</text>`;
      };
      if (k[0]) svg += lab(x1, y1, x2, y2, k[0]);
      if (k[1]) svg += lab(x2, y2, x1, y1, k[1]);
    });
    tabs.forEach((t) => {
      svg += `<g class="er-tab"><rect x="${t.x}" y="${t.y}" width="${B}" height="${hoehe(t)}" rx="8" class="er-box"/>`
        + `<rect x="${t.x}" y="${t.y}" width="${B}" height="${KH}" rx="8" class="er-kopf"/><rect x="${t.x}" y="${t.y + KH - 8}" width="${B}" height="8" class="er-kopf"/>`
        + `<text x="${t.x + B / 2}" y="${t.y + 20}" text-anchor="middle" class="er-name">${esc(t.name)}</text>`;
      t.spalten.forEach((c, i) => {
        const y = t.y + KH + 16 + i * ZH;
        const zeichen = c.pk ? "🔑 " : c.fk ? "→ " : "";
        svg += `<text x="${t.x + 10}" y="${y}" class="er-spalte${c.pk ? " pk" : ""}${c.fk ? " fk" : ""}">${esc(zeichen + c.name)}${c.fk ? `<tspan class="er-fkziel"> (${esc(c.fk)})</tspan>` : ""}</text>`;
      });
      svg += "</g>";
    });
    svg += "</svg>";
    el.innerHTML = svg + (o.legende === false ? "" : `<p class="er-legende">🔑 ${T("Primärschlüssel (eindeutige ID)")} · → ${T("Fremdschlüssel (verweist auf eine andere Tabelle)")} · <strong>1</strong> / <strong>n</strong> = ${T("eins / viele")}</p>`);
  }

  /* ---------- JOIN-Zeitlupe ---------- */
  function joinlupe(el, o) {
    el.classList.add("labor", "labor-zeitlupe", "labor-joinlupe");
    const mt = o.sql.match(/^\s*SELECT\s+([\s\S]+?)\s+FROM\s+(\w+)\s+JOIN\s+(\w+)\s+ON\s+(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)\s*;?\s*$/i);
    if (!mt) { el.textContent = "JOIN-Zeitlupe: SELECT … FROM a JOIN b ON a.x = b.y"; return; }
    let [, spTxt, ta, tb, t1, c1, t2, c2] = mt;
    if (t1.toLowerCase() !== ta.toLowerCase()) { [t1, c1, t2, c2] = [t2, c2, t1, c1]; }
    el.innerHTML = `<pre class="sql labor-vorlage">${L.sqlHTML(o.sql)}</pre>
      <div class="labor-ctrl">
        <button type="button" class="btn jl-schritt" data-tipp="${esc(T("Die nächste Zeile links sucht ihren Partner rechts."))}">👣 ${T("Nächste Zeile")}</button>
        <button type="button" class="btn secondary jl-alle" data-tipp="${esc(T("Alle übrigen Zeilen im Schnelldurchlauf."))}">⏩ ${T("Alle Zeilen")}</button>
        <button type="button" class="btn secondary jl-neu" data-tipp="${esc(T("Noch einmal von vorne."))}" aria-label="${esc(T("Von vorne"))}">↺</button>
      </div>
      <p class="zl-status" aria-live="polite"></p>
      <div class="jl-paar"><div class="jl-a"></div><div class="jl-b"></div></div>
      <p class="labor-erg-t">${T("Ergebnis")}</p><div class="jl-erg"></div>`;
    const $ = (s) => el.querySelector(s);
    L.bereit().then((SQL) => {
      const db = oeffnen(SQL, o.db);
      const A = db.exec(`SELECT * FROM ${qid(ta)}`)[0], Bt = db.exec(`SELECT * FROM ${qid(tb)}`)[0];
      db.close();
      const ia = A.columns.findIndex((c) => c.toLowerCase() === c1.toLowerCase());
      const ib = Bt.columns.findIndex((c) => c.toLowerCase() === c2.toLowerCase());
      const sel = spTxt.split(",").map((s) => s.trim()).map((s) => {
        const m = s.match(/^(?:(\w+)\.)?(\w+)$/);
        const tab = m[1] ? m[1].toLowerCase() : (A.columns.some((c) => c.toLowerCase() === m[2].toLowerCase()) ? ta.toLowerCase() : tb.toLowerCase());
        const quelle = tab === ta.toLowerCase() ? A : Bt;
        return { name: m[2], seite: tab === ta.toLowerCase() ? "a" : "b", i: quelle.columns.findIndex((c) => c.toLowerCase() === m[2].toLowerCase()) };
      });
      let pos = 0, timer = null, erg = [];
      const tabHTML = (T0, name, markSp) => `<p class="faden-name">📋 <code>${esc(name)}</code></p>` + ergebnisHTML({ spalten: T0.columns, zeilen: T0.values });
      function start() {
        clearInterval(timer); pos = 0; erg = [];
        $(".jl-a").innerHTML = tabHTML(A, ta); $(".jl-b").innerHTML = tabHTML(Bt, tb);
        $(".jl-a th:nth-child(" + (ia + 1) + ")").classList.add("zl-bed");
        $(".jl-b th:nth-child(" + (ib + 1) + ")").classList.add("zl-bed");
        $(".jl-a .labor-anzahl").remove(); $(".jl-b .labor-anzahl").remove();
        $(".jl-erg").innerHTML = ergebnisHTML({ spalten: sel.map((s) => s.name), zeilen: [] });
        $(".zl-status").innerHTML = T(`Für jede Zeile in <code>${esc(ta)}</code> sucht SQL in <code>${esc(tb)}</code> die Zeile, bei der <code>${esc(tb)}.${esc(c2)}</code> gleich <code>${esc(ta)}.${esc(c1)}</code> ist.`);
        $(".jl-schritt").disabled = false; $(".jl-alle").disabled = false;
      }
      function schritt() {
        const rowsA = el.querySelectorAll(".jl-a tbody tr"), rowsB = el.querySelectorAll(".jl-b tbody tr");
        rowsA.forEach((r) => r.classList.remove("zl-jetzt")); rowsB.forEach((r) => r.classList.remove("zl-jetzt", "zl-ja"));
        if (pos >= A.values.length) {
          $(".zl-status").innerHTML = T(`Fertig: ${erg.length} Zeilen im Ergebnis. Jede Zeile besteht aus einer Zeile von <code>${esc(ta)}</code> und ihrem Partner aus <code>${esc(tb)}</code>.`);
          $(".jl-schritt").disabled = true; $(".jl-alle").disabled = true;
          return false;
        }
        const ra = A.values[pos];
        rowsA[pos].classList.add("zl-jetzt", "zl-ja");
        rowsA[pos].scrollIntoView({ block: "nearest" });
        const treffer = Bt.values.map((rb, j) => (rb[ib] === ra[ia] ? j : -1)).filter((j) => j >= 0);
        treffer.forEach((j) => { rowsB[j].classList.add("zl-jetzt", "zl-ja"); rowsB[j].scrollIntoView({ block: "nearest" }); });
        treffer.forEach((j) => erg.push(sel.map((s) => (s.seite === "a" ? ra[s.i] : Bt.values[j][s.i]))));
        $(".jl-erg").innerHTML = ergebnisHTML({ spalten: sel.map((s) => s.name), zeilen: erg });
        $(".zl-status").innerHTML = `${esc(ta)}, ${T("Zeile")} ${pos + 1}: <code>${esc(c1)} = <mark>${esc(ra[ia])}</mark></code> → `
          + (treffer.length ? `${T("Partner in")} <code>${esc(tb)}</code>: <code>${esc(c2)} = <mark>${esc(ra[ia])}</mark></code>` : T("kein Partner – die Zeile fällt weg"));
        pos++;
        return true;
      }
      $(".jl-schritt").addEventListener("click", () => { clearInterval(timer); schritt(); });
      $(".jl-alle").addEventListener("click", () => { clearInterval(timer); $(".jl-alle").disabled = true; timer = setInterval(() => { if (!schritt()) clearInterval(timer); }, o.tempo || 160); });
      $(".jl-neu").addEventListener("click", start);
      start();
    }).catch((e) => { el.textContent = "SQL-Labor konnte nicht starten: " + e.message; });
  }

  Object.assign(L, { faden, er, joinlupe });
})();

/* Übungsdatenbank „Tonspur – Abrufe“: 50 000 erfundene Abrufe, beim Laden im Browser erzeugt.
   Sie zeigt, wie schnell eine Datenbank mit vielen Zeilen umgeht. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("streaming", {
  titel: "Tonspur – Abrufe",
  sql: `
CREATE TABLE abrufe (
  id        INTEGER PRIMARY KEY,
  song_id   INTEGER,
  nutzer_id INTEGER,
  datum     TEXT,
  stadt     TEXT
);
WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 50000)
INSERT INTO abrufe
SELECT x,
       (x * 7919) % 36 + 1,
       (x * 104729) % 2400 + 1,
       date('2025-01-01', '+' || ((x * 31) % 365) || ' days'),
       CASE (x * 13) % 8 WHEN 0 THEN 'Augsburg' WHEN 1 THEN 'München' WHEN 2 THEN 'Nürnberg' WHEN 3 THEN 'Regensburg'
                         WHEN 4 THEN 'Ingolstadt' WHEN 5 THEN 'Würzburg' WHEN 6 THEN 'Landshut' ELSE 'Kempten' END
FROM n;
`,
});

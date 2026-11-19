/* Übungsdatenbank „Konzertkalender“ – erfundene Konzerte der Künstler aus „Tonspur“.
   Datum immer als 'JJJJ-MM-TT'. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("konzerte", {
  titel: "Konzertkalender",
  sql: `
CREATE TABLE konzerte (
  id          INTEGER PRIMARY KEY,
  kuenstler   TEXT,
  stadt       TEXT,
  datum       TEXT,
  preis       REAL,
  ausverkauft TEXT,
  plaetze_frei INTEGER
);
INSERT INTO konzerte VALUES
 (1,'Juna','München','2026-01-24',39.90,'ja',0),
 (2,'Die Kaltfront','Nürnberg','2026-02-07',29.90,'ja',0),
 (3,'MC Brezel','Augsburg','2026-02-21',24.50,'nein',140),
 (4,'Nova Lindqvist','München','2026-03-06',45.00,'nein',310),
 (5,'Elbkind','Regensburg','2026-03-14',19.90,'nein',85),
 (6,'Sunny Öztürk','Nürnberg','2026-03-15',54.90,'ja',0),
 (7,'Lost Signal','Würzburg','2026-03-28',22.00,'nein',60),
 (8,'Juna','Nürnberg','2026-04-11',39.90,'nein',420),
 (9,'Yasmin K.','München','2026-04-18',34.90,'ja',0),
 (10,'Kavi & Mo','Augsburg','2026-04-25',27.50,'nein',230),
 (11,'Frida Falk','Regensburg','2026-05-09',31.00,'nein',175),
 (12,'Die Kaltfront','München','2026-05-16',32.90,'nein',540),
 (13,'Neon Ruins','Nürnberg','2026-05-30',29.90,'nein',95),
 (14,'Bass Bude','Würzburg','2026-06-13',18.00,'nein',300),
 (15,'Juna','Augsburg','2026-06-20',39.90,'nein',610),
 (16,'MC Brezel','München','2026-07-04',26.00,'ja',0),
 (17,'Sunny Öztürk','München','2026-07-18',59.90,'nein',1200),
 (18,'Nova Lindqvist','Regensburg','2026-08-01',42.00,'nein',260),
 (19,'Elbkind','Nürnberg','2026-09-12',21.50,'nein',150),
 (20,'Yasmin K.','Augsburg','2026-10-03',36.90,'nein',380);
`,
});

/* Übungsdatenbank „Tonspur – Künstler und Labels“ (für JOIN): dieselben 36 Songs wie in „Tonspur“, aber auf drei Tabellen verteilt.
   songs.kuenstler_id → kuenstler.id, kuenstler.label_id → labels.id. Alles erfunden.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("musik", {
  titel: "Tonspur – Künstler und Labels",
  sql: `
CREATE TABLE labels (
  id    INTEGER PRIMARY KEY,
  name  TEXT,
  stadt TEXT
);
CREATE TABLE kuenstler (
  id       INTEGER PRIMARY KEY,
  name     TEXT,
  herkunft TEXT,
  label_id INTEGER REFERENCES labels(id)
);
CREATE TABLE songs (
  id           INTEGER PRIMARY KEY,
  titel        TEXT,
  kuenstler_id INTEGER REFERENCES kuenstler(id),
  genre        TEXT,
  jahr         INTEGER,
  dauer_sek    INTEGER,
  likes        INTEGER
);
INSERT INTO labels VALUES
 (1,'Sonnendeck Records','Hamburg'),
 (2,'Garage Noise','Berlin'),
 (3,'Beton Beats','München'),
 (4,'Pixelwelle','Köln');
INSERT INTO kuenstler VALUES
 (1,'Juna','Deutschland',1),
 (2,'Die Kaltfront','Deutschland',2),
 (3,'MC Brezel','Deutschland',3),
 (4,'Nova Lindqvist','Schweden',4),
 (5,'Lost Signal','Österreich',2),
 (6,'Elbkind','Deutschland',2),
 (7,'Sunny Öztürk','Deutschland',1),
 (8,'Neon Ruins','Großbritannien',4),
 (9,'Frida Falk','Deutschland',1),
 (10,'Kavi & Mo','Deutschland',3),
 (11,'Yasmin K.','Schweiz',3),
 (12,'Bass Bude','Deutschland',4);
INSERT INTO songs VALUES
 (1,'Mitternachtsbus',1,'Pop',2023,187,48210),
 (2,'Beton und Blumen',2,'Rock',2019,241,12880),
 (3,'Brezn mit Senf',3,'Hip-Hop',2021,175,33415),
 (4,'Polarlicht',4,'Elektro',2024,298,27060),
 (5,'Kein Netz',5,'Indie',2020,212,8935),
 (6,'Zimmer 104',1,'Pop',2021,199,61540),
 (7,'Sturmwarnung',2,'Rock',2024,264,19770),
 (8,'Hinterhof',6,'Indie',2018,233,4120),
 (9,'Goldkette aus Alufolie',3,'Hip-Hop',2024,168,52330),
 (10,'Sommer in Gelb',7,'Pop',2022,181,75890),
 (11,'Systemfehler',8,'Elektro',2019,315,15400),
 (12,'Leise laut',9,'Pop',2025,203,22760),
 (13,'Kopf hoch',10,'Hip-Hop',2022,190,41005),
 (14,'Garagentor',2,'Rock',2016,228,6510),
 (15,'Funkstille',5,'Indie',2023,246,11230),
 (16,'Blaue Stunde',4,'Elektro',2021,276,30880),
 (17,'Nachtschicht',11,'Hip-Hop',2025,182,67120),
 (18,'Papierflieger',9,'Pop',2020,194,18340),
 (19,'Bass im Bauch',12,'Elektro',2023,305,25500),
 (20,'Regen auf Glas',6,'Indie',2024,221,9870),
 (21,'Vollgas',2,'Rock',2022,207,14320),
 (22,'Wolke 8',7,'Pop',2025,176,98040),
 (23,'Plan B',10,'Hip-Hop',2019,201,28760),
 (24,'Neonlicht',8,'Elektro',2025,289,20110),
 (25,'Alte Freunde',1,'Pop',2018,214,37450),
 (26,'Zugvögel',6,'Indie',2021,238,7605),
 (27,'Lautsprecher',12,'Elektro',2020,262,12090),
 (28,'Erste Reihe',2,'Rock',2025,219,23440),
 (29,'Kurz vor zwölf',11,'Hip-Hop',2023,171,44890),
 (30,'Herzschlag',9,'Pop',2023,188,31270),
 (31,'Fernweh',5,'Indie',2025,252,13760),
 (32,'Glitzer',7,'Pop',2019,169,54320),
 (33,'Endlosschleife',4,'Elektro',2022,320,19980),
 (34,'Kreidestaub',10,'Hip-Hop',2024,185,36540),
 (35,'Feuerwerk',1,'Pop',2025,192,70210),
 (36,'Stromausfall',8,'Elektro',2017,301,8320);
`,
});

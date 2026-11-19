/* Übungsdatenbank „Tonspur“ – eine erfundene Musik-App.
   Alle Songs und Künstler sind ausgedacht. Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("tonspur", {
  titel: "Tonspur – Musik-App",
  sql: `
CREATE TABLE songs (
  id        INTEGER PRIMARY KEY,
  titel     TEXT,
  kuenstler TEXT,
  genre     TEXT,
  jahr      INTEGER,
  dauer_sek INTEGER,
  likes     INTEGER
);
INSERT INTO songs VALUES
 (1,'Mitternachtsbus','Juna','Pop',2023,187,48210),
 (2,'Beton und Blumen','Die Kaltfront','Rock',2019,241,12880),
 (3,'Brezn mit Senf','MC Brezel','Hip-Hop',2021,175,33415),
 (4,'Polarlicht','Nova Lindqvist','Elektro',2024,298,27060),
 (5,'Kein Netz','Lost Signal','Indie',2020,212,8935),
 (6,'Zimmer 104','Juna','Pop',2021,199,61540),
 (7,'Sturmwarnung','Die Kaltfront','Rock',2024,264,19770),
 (8,'Hinterhof','Elbkind','Indie',2018,233,4120),
 (9,'Goldkette aus Alufolie','MC Brezel','Hip-Hop',2024,168,52330),
 (10,'Sommer in Gelb','Sunny Öztürk','Pop',2022,181,75890),
 (11,'Systemfehler','Neon Ruins','Elektro',2019,315,15400),
 (12,'Leise laut','Frida Falk','Pop',2025,203,22760),
 (13,'Kopf hoch','Kavi & Mo','Hip-Hop',2022,190,41005),
 (14,'Garagentor','Die Kaltfront','Rock',2016,228,6510),
 (15,'Funkstille','Lost Signal','Indie',2023,246,11230),
 (16,'Blaue Stunde','Nova Lindqvist','Elektro',2021,276,30880),
 (17,'Nachtschicht','Yasmin K.','Hip-Hop',2025,182,67120),
 (18,'Papierflieger','Frida Falk','Pop',2020,194,18340),
 (19,'Bass im Bauch','Bass Bude','Elektro',2023,305,25500),
 (20,'Regen auf Glas','Elbkind','Indie',2024,221,9870),
 (21,'Vollgas','Die Kaltfront','Rock',2022,207,14320),
 (22,'Wolke 8','Sunny Öztürk','Pop',2025,176,98040),
 (23,'Plan B','Kavi & Mo','Hip-Hop',2019,201,28760),
 (24,'Neonlicht','Neon Ruins','Elektro',2025,289,20110),
 (25,'Alte Freunde','Juna','Pop',2018,214,37450),
 (26,'Zugvögel','Elbkind','Indie',2021,238,7605),
 (27,'Lautsprecher','Bass Bude','Elektro',2020,262,12090),
 (28,'Erste Reihe','Die Kaltfront','Rock',2025,219,23440),
 (29,'Kurz vor zwölf','Yasmin K.','Hip-Hop',2023,171,44890),
 (30,'Herzschlag','Frida Falk','Pop',2023,188,31270),
 (31,'Fernweh','Lost Signal','Indie',2025,252,13760),
 (32,'Glitzer','Sunny Öztürk','Pop',2019,169,54320),
 (33,'Endlosschleife','Nova Lindqvist','Elektro',2022,320,19980),
 (34,'Kreidestaub','Kavi & Mo','Hip-Hop',2024,185,36540),
 (35,'Feuerwerk','Juna','Pop',2025,192,70210),
 (36,'Stromausfall','Neon Ruins','Elektro',2017,301,8320);
`,
});

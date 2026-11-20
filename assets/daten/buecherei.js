/* Übungsdatenbank „Schülerbücherei“ – erfundene Leser, Bücher und Ausleihen.
   Alle Titel, Autoren und Personen sind ausgedacht. Jede leser_id und buch_id verweist auf eine vorhandene Zeile.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("buecherei", {
  titel: "Schülerbücherei",
  sql: `
CREATE TABLE leser (
  id       INTEGER PRIMARY KEY,
  vorname  TEXT,
  nachname TEXT,
  klasse   TEXT
);
CREATE TABLE buecher (
  id     INTEGER PRIMARY KEY,
  titel  TEXT,
  autor  TEXT,
  genre  TEXT,
  jahr   INTEGER
);
CREATE TABLE ausleihen (
  id        INTEGER PRIMARY KEY,
  leser_id  INTEGER REFERENCES leser(id),
  buch_id   INTEGER REFERENCES buecher(id),
  ausgeliehen TEXT,
  zurueck     TEXT
);
INSERT INTO leser VALUES
 (1,'Mia','Schuster','8a'),
 (2,'Leon','Müller','9b'),
 (3,'Elif','Kaya','10a'),
 (4,'Jonas','Brandl','7c'),
 (5,'Leon','Müller','7a'),
 (6,'Sara','Nowak','9b'),
 (7,'Kai','Weber','10a'),
 (8,'Amira','Haddad','8a'),
 (9,'Tim','Gruber','5b'),
 (10,'Lena','Fischer','6a'),
 (11,'Noah','Bauer','10b'),
 (12,'Zoe','Lindner','7c'),
 (13,'Emre','Yilmaz','9a'),
 (14,'Hanna','Seidl','6a'),
 (15,'Luca','Rossi','8b'),
 (16,'Marie','Huber','10b');
INSERT INTO buecher VALUES
 (1,'Das Haus am Nebelsee','Clara Winter','Krimi',2019),
 (2,'Mission Mars','Ben Sander','Science-Fiction',2021),
 (3,'Die Kunst, nein zu sagen','Pia Lorenz','Sachbuch',2022),
 (4,'Funkstille','Jakob Ehrlich','Jugendroman',2020),
 (5,'Der letzte Zug nach Lindau','Clara Winter','Krimi',2023),
 (6,'Coden für Anfänger','Tom Berger','Sachbuch',2018),
 (7,'Sternenstaub','Lea Morgen','Fantasy',2017),
 (8,'Schattenwald','Lea Morgen','Fantasy',2020),
 (9,'Abseits','Deniz Arslan','Jugendroman',2021),
 (10,'Wie das Internet funktioniert','Tom Berger','Sachbuch',2024),
 (11,'Die Insel der Roboter','Ben Sander','Science-Fiction',2016),
 (12,'Tatort Schulhof','Clara Winter','Krimi',2015),
 (13,'Das Flüstern der Steine','Lea Morgen','Fantasy',2023),
 (14,'Mein Jahr in Tokio','Yuki Hartmann','Sachbuch',2022),
 (15,'Ausbildung? Na klar!','Pia Lorenz','Sachbuch',2025),
 (16,'Kaltes Herz, heiße Spur','Max Oberle','Krimi',2024),
 (17,'Funkenflug','Jakob Ehrlich','Jugendroman',2024),
 (18,'Planet ohne Namen','Ben Sander','Science-Fiction',2025),
 (19,'Das Rätsel der Uhr','Max Oberle','Krimi',2020),
 (20,'Freunde für immer?','Deniz Arslan','Jugendroman',2023);
INSERT INTO ausleihen VALUES
 (1,3,2,'2025-09-15','2025-09-29'),
 (2,1,7,'2025-09-16','2025-10-07'),
 (3,7,1,'2025-09-18','2025-10-02'),
 (4,2,9,'2025-09-22','2025-10-01'),
 (5,5,11,'2025-09-22','2025-10-13'),
 (6,8,4,'2025-09-25','2025-10-09'),
 (7,3,5,'2025-10-01','2025-10-20'),
 (8,11,6,'2025-10-02','2025-10-16'),
 (9,6,13,'2025-10-06','2025-10-27'),
 (10,1,8,'2025-10-08','2025-10-22'),
 (11,13,10,'2025-10-09','2025-10-30'),
 (12,4,12,'2025-10-13','2025-10-27'),
 (13,9,7,'2025-10-14','2025-11-04'),
 (14,16,15,'2025-10-15','2025-10-29'),
 (15,7,16,'2025-10-20','2025-11-03'),
 (16,10,17,'2025-10-21','2025-11-11'),
 (17,12,18,'2025-10-23','2025-11-06'),
 (18,3,19,'2025-11-03','2025-11-17'),
 (19,15,2,'2025-11-04','2025-11-18'),
 (20,2,20,'2025-11-05',NULL),
 (21,14,7,'2025-11-06',NULL),
 (22,8,9,'2025-11-10',NULL),
 (23,1,13,'2025-11-10',NULL),
 (24,11,14,'2025-11-11',NULL),
 (25,5,1,'2025-11-12',NULL),
 (26,6,3,'2025-11-12',NULL),
 (27,7,5,'2025-11-13',NULL),
 (28,13,6,'2025-11-14',NULL),
 (29,16,10,'2025-11-14',NULL),
 (30,3,18,'2025-11-17',NULL);
`,
});

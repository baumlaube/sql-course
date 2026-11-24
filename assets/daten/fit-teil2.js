/* Übungsdatenbanken für „Fit für die Probe – Teil 2“: zwei neue, unbekannte Welten.
   „Kino“: erfundene Filme eines Kleinstadtkinos. „Sportladen“: erfundene Artikel, Marken ausgedacht.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("kino", {
  titel: "Kino Lichtspiel",
  sql: `
CREATE TABLE filme (
  id        INTEGER PRIMARY KEY,
  titel     TEXT,
  genre     TEXT,
  jahr      INTEGER,
  dauer_min INTEGER,
  fsk       INTEGER,
  land      TEXT,
  bewertung REAL,
  besucher  INTEGER
);
INSERT INTO filme VALUES
 (1,'Nachtzug nach Oslo','Thriller',2023,118,16,'Norwegen',4.1,2310),
 (2,'Die Bande vom Hafen','Komödie',2024,95,6,'Deutschland',3.6,4120),
 (3,'Sternenstaub','Science-Fiction',2025,142,12,'USA',4.5,6890),
 (4,'Das letzte Rennen','Drama',2022,124,12,'Frankreich',3.9,1540),
 (5,'Kalte Spur','Krimi',2024,101,16,'Deutschland',3.4,2870),
 (6,'Pinguine auf Reisen','Animation',2025,88,0,'Kanada',4.2,7350),
 (7,'Funkstille','Drama',2025,109,12,'Deutschland',4.0,1980),
 (8,'Roboter Rudi','Animation',2023,84,0,'Deutschland',3.7,5210),
 (9,'Die Mauer aus Glas','Thriller',2025,131,16,'USA',4.3,5560),
 (10,'Sommer am See','Komödie',2023,92,0,'Österreich',3.2,2440),
 (11,'Mission Tiefsee','Science-Fiction',2024,137,12,'USA',3.8,4730),
 (12,'Der Fall Berger','Krimi',2025,112,12,'Deutschland',4.4,3320),
 (13,'Laute Nachbarn','Komödie',2025,99,6,'Deutschland',2.9,3010),
 (14,'Wolkenläufer','Animation',2024,91,6,'Japan',4.6,4980),
 (15,'Grenzland','Drama',2023,128,16,'Polen',3.5,890),
 (16,'Dunkle Wasser','Horror',2024,97,18,'USA',3.1,1760),
 (17,'Der Meisterkoch','Komödie',2022,104,0,'Frankreich',3.8,2650),
 (18,'Signal aus dem All','Science-Fiction',2023,126,12,'Großbritannien',3.3,2190),
 (19,'Die stille Zeugin','Krimi',2023,115,16,'Dänemark',4.2,1870),
 (20,'Das Haus am Ende der Straße','Horror',2025,103,16,'Spanien',3.0,1430),
 (21,'Herbstblätter','Drama',2024,119,0,'Italien',3.7,1120),
 (22,'Turbo-Oma','Komödie',2024,90,6,'Deutschland',3.9,5870),
 (23,'Schatten über Prag','Thriller',2022,122,16,'Tschechien',3.6,1350),
 (24,'Drachenherz','Animation',2022,96,6,'USA',4.0,6120),
 (25,'Kurs Nord','Drama',2025,135,12,'Island',4.7,2050),
 (26,'Die Nacht der Puppen','Horror',2023,94,18,'USA',2.6,980),
 (27,'Code Rot','Thriller',2024,108,12,'Deutschland',3.5,2760),
 (28,'Weltraum-WG','Science-Fiction',2025,102,6,'Deutschland',3.4,3640);
`});

Labor.daten("sportladen", {
  titel: "Sportladen Zielgerade",
  sql: `
CREATE TABLE artikel (
  id        INTEGER PRIMARY KEY,
  name      TEXT,
  kategorie TEXT,
  marke     TEXT,
  preis     REAL,
  bestand   INTEGER,
  farbe     TEXT
);
INSERT INTO artikel VALUES
 (1,'Laufschuh Sprint','Schuhe','Velox',89.99,12,'blau'),
 (2,'Laufschuh Trail','Schuhe','Bergfuchs',119.00,5,'grün'),
 (3,'Hallenschuh Court','Schuhe','Velox',74.50,8,'weiß'),
 (4,'Fußballschuh Kick','Schuhe','Torjäger',59.99,15,'schwarz'),
 (5,'Fußballschuh Kick Pro','Schuhe','Torjäger',139.00,3,'rot'),
 (6,'Trikot Heim','Bekleidung','Torjäger',49.95,20,'rot'),
 (7,'Trikot Auswärts','Bekleidung','Torjäger',49.95,0,'weiß'),
 (8,'Laufshirt Air','Bekleidung','Velox',24.99,30,'blau'),
 (9,'Regenjacke Storm','Bekleidung','Bergfuchs',129.00,4,'gelb'),
 (10,'Trainingshose Basic','Bekleidung','Fitlinie',29.99,25,'schwarz'),
 (11,'Kapuzenpulli Team','Bekleidung','Fitlinie',39.99,0,'grau'),
 (12,'Sportsocken 3er-Pack','Bekleidung','Velox',9.99,60,'weiß'),
 (13,'Fußball Match','Bälle','Torjäger',34.90,18,'weiß'),
 (14,'Basketball Street','Bälle','Korbmeister',27.50,9,'orange'),
 (15,'Volleyball Beach','Bälle','Sandstrand',22.00,7,'gelb'),
 (16,'Handball Grip','Bälle','Torjäger',31.00,0,'blau'),
 (17,'Tennisbälle 4er-Dose','Bälle','Netzroller',6.49,40,'gelb'),
 (18,'Tennisschläger Ace','Schläger','Netzroller',99.00,6,'schwarz'),
 (19,'Badmintonset Duo','Schläger','Netzroller',39.00,11,'grün'),
 (20,'Tischtennisschläger Spin','Schläger','Netzroller',19.90,14,'rot'),
 (21,'Hantelset 10 kg','Fitness','Fitlinie',54.00,5,'schwarz'),
 (22,'Yogamatte Relax','Fitness','Fitlinie',25.00,16,'lila'),
 (23,'Springseil Speed','Fitness','Velox',12.99,22,'schwarz'),
 (24,'Fitnessband-Set','Fitness','Fitlinie',17.50,0,'grün'),
 (25,'Trinkflasche Alu','Zubehör','Bergfuchs',14.95,35,'silber'),
 (26,'Sporttasche Weekend','Zubehör','Velox',44.00,10,'schwarz'),
 (27,'Stirnband','Zubehör','Velox',7.99,28,'weiß'),
 (28,'Rucksack Gipfel','Zubehör','Bergfuchs',79.00,6,'grün'),
 (29,'Pulsuhr Pace','Zubehör','Velox',149.00,2,'schwarz'),
 (30,'Schienbeinschoner','Zubehör','Torjäger',15.99,19,'schwarz');
`});

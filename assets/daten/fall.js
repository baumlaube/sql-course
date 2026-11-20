/* Übungsdatenbank „Der Fall: das Leak“ – erfundener Kriminalfall bei der Musik-App Tonspur.
   Alle Personen, Dateien und Ereignisse sind ausgedacht. Fremdschlüssel: zugriffe.mitarbeiter_id → mitarbeiter.id,
   zugriffe.datei_id → dateien.id, zugriffe.rechner_id → rechner.id, zutritte.mitarbeiter_id → mitarbeiter.id.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("fall", {
  titel: "Der Fall: das Leak",
  sql: `
CREATE TABLE mitarbeiter (
  id        INTEGER PRIMARY KEY,
  vorname   TEXT,
  nachname  TEXT,
  abteilung TEXT
);
CREATE TABLE dateien (
  id          INTEGER PRIMARY KEY,
  dateiname   TEXT,
  ordner      TEXT,
  vertraulich TEXT
);
CREATE TABLE rechner (
  id   INTEGER PRIMARY KEY,
  name TEXT,
  raum TEXT
);
CREATE TABLE zugriffe (
  id             INTEGER PRIMARY KEY,
  mitarbeiter_id INTEGER REFERENCES mitarbeiter(id),
  datei_id       INTEGER REFERENCES dateien(id),
  rechner_id     INTEGER REFERENCES rechner(id),
  zeitpunkt      TEXT,
  aktion         TEXT
);
CREATE TABLE zutritte (
  id             INTEGER PRIMARY KEY,
  mitarbeiter_id INTEGER REFERENCES mitarbeiter(id),
  tuer           TEXT,
  richtung       TEXT,
  zeitpunkt      TEXT
);
INSERT INTO mitarbeiter VALUES
 (1,'Anna','Berger','Marketing'),
 (2,'Deniz','Aydin','Technik'),
 (3,'Paul','Krämer','Redaktion'),
 (4,'Sophie','Lang','Künstlerbetreuung'),
 (5,'Max','Hoffmann','Buchhaltung'),
 (6,'Ralf','Kessler','Technik'),
 (7,'Ines','Wolf','Marketing'),
 (8,'Tobias','Engel','Redaktion'),
 (9,'Lara','Vogt','Künstlerbetreuung'),
 (10,'Felix','Braun','Technik'),
 (11,'Nora','Simon','Geschäftsführung'),
 (12,'Jan','Petersen','Tonstudio'),
 (13,'Julia','Roth','Tonstudio'),
 (14,'Omar','Saleh','Support');
INSERT INTO dateien VALUES
 (1,'Jahresbericht_2025.pdf','Verwaltung','nein'),
 (2,'Logo_neu.png','Marketing','nein'),
 (3,'Polarlicht_MASTER.wav','Studio','ja'),
 (4,'Wolke8_MASTER.wav','Studio','ja'),
 (5,'Vertrag_Juna.pdf','Recht','ja'),
 (6,'Playlist_Herbst.xlsx','Redaktion','nein'),
 (7,'Mondscheinmaschine_MASTER.wav','Studio','ja'),
 (8,'Mondscheinmaschine_DEMO.mp3','Studio','ja'),
 (9,'Pressefotos_Nova.zip','Marketing','nein'),
 (10,'Server_Backup.log','Technik','nein'),
 (11,'Gehaltsliste.xlsx','Verwaltung','ja'),
 (12,'Tourplan_2026.pdf','Redaktion','nein');
INSERT INTO rechner VALUES
 (1,'PC-EMPFANG','Empfang'),
 (2,'PC-MARKETING','Marketing'),
 (3,'PC-STUDIO-A','Studio A'),
 (4,'PC-STUDIO-B','Studio B'),
 (5,'PC-TECHNIK','Technikraum'),
 (6,'LAPTOP-KB','unterwegs');
INSERT INTO zugriffe VALUES
 (1,1,2,2,'2025-11-10 09:12','lesen'),
 (2,12,7,4,'2025-11-10 14:05','lesen'),
 (3,8,6,1,'2025-11-10 15:30','bearbeiten'),
 (4,5,11,1,'2025-11-10 16:44','lesen'),
 (5,4,7,6,'2025-11-11 10:20','kopieren'),
 (6,7,9,2,'2025-11-11 11:02','kopieren'),
 (7,13,3,3,'2025-11-11 13:15','bearbeiten'),
 (8,2,10,5,'2025-11-11 17:50','lesen'),
 (9,11,1,1,'2025-11-12 08:30','lesen'),
 (10,13,7,3,'2025-11-12 16:40','lesen'),
 (11,3,12,1,'2025-11-12 17:05','bearbeiten'),
 (12,12,4,4,'2025-11-12 18:20','bearbeiten'),
 (13,9,7,6,'2025-11-13 11:15','kopieren'),
 (14,1,9,2,'2025-11-13 12:30','lesen'),
 (15,13,8,3,'2025-11-13 15:00','kopieren'),
 (16,10,10,5,'2025-11-13 16:10','lesen'),
 (17,12,3,4,'2025-11-13 17:40','bearbeiten'),
 (18,6,10,5,'2025-11-13 21:55','lesen'),
 (19,12,7,4,'2025-11-13 22:41','kopieren'),
 (20,14,6,1,'2025-11-14 08:05','lesen'),
 (21,11,1,1,'2025-11-14 09:00','bearbeiten'),
 (22,2,10,5,'2025-11-14 09:20','lesen'),
 (23,4,5,6,'2025-11-14 10:45','lesen'),
 (24,8,12,1,'2025-11-14 11:30','kopieren');
INSERT INTO zutritte VALUES
 (1,12,'Haupteingang','rein','2025-11-13 08:55'),
 (2,9,'Haupteingang','rein','2025-11-13 09:10'),
 (3,6,'Haupteingang','rein','2025-11-13 09:30'),
 (4,13,'Haupteingang','rein','2025-11-13 09:42'),
 (5,12,'Studio B','rein','2025-11-13 09:50'),
 (6,13,'Studio A','rein','2025-11-13 10:00'),
 (7,9,'Haupteingang','raus','2025-11-13 12:00'),
 (8,12,'Studio B','raus','2025-11-13 17:55'),
 (9,12,'Haupteingang','raus','2025-11-13 18:02'),
 (10,13,'Studio A','raus','2025-11-13 18:10'),
 (11,13,'Haupteingang','raus','2025-11-13 18:15'),
 (12,6,'Technikraum','rein','2025-11-13 21:50'),
 (13,6,'Technikraum','raus','2025-11-13 22:30'),
 (14,6,'Studio B','rein','2025-11-13 22:33'),
 (15,6,'Studio B','raus','2025-11-13 22:58'),
 (16,6,'Haupteingang','raus','2025-11-13 23:04'),
 (17,10,'Haupteingang','rein','2025-11-13 14:00'),
 (18,10,'Haupteingang','raus','2025-11-13 19:30'),
 (19,1,'Haupteingang','rein','2025-11-13 08:40'),
 (20,1,'Haupteingang','raus','2025-11-13 16:45');
`,
});

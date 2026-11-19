/* Übungsdatenbank „Azubi-Börse“ – erfundene Ausbildungsstellen.
   Betriebe sind ausgedacht; Vergütungen grob an üblichen Werten orientiert (1. Ausbildungsjahr, Euro im Monat).
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("azubi", {
  titel: "Azubi-Börse",
  sql: `
CREATE TABLE stellen (
  id           INTEGER PRIMARY KEY,
  beruf        TEXT,
  betrieb      TEXT,
  ort          TEXT,
  verguetung   INTEGER,
  dauer_monate INTEGER,
  abschluss    TEXT,
  plaetze      INTEGER
);
INSERT INTO stellen VALUES
 (1,'Kfz-Mechatroniker/in','Autohaus Kerner','Augsburg',1050,42,'Quali',2),
 (2,'Bäcker/in','Bäckerei Sonnenkorn','Landshut',900,36,'Mittelschulabschluss',1),
 (3,'Elektroniker/in','Elektro Brandl','Regensburg',1080,42,'Mittlere Reife',3),
 (4,'Verkäufer/in','Modehaus Stolz','Nürnberg',980,24,'Mittelschulabschluss',4),
 (5,'Kaufmann/-frau im Einzelhandel','Supermarkt Frischeck','Augsburg',1000,36,'Quali',2),
 (6,'Friseur/in','Salon Schnittpunkt','Ingolstadt',720,36,'Mittelschulabschluss',1),
 (7,'Medizinische/r Fachangestellte/r','Praxis am Markt','Kempten',1010,36,'Mittlere Reife',0),
 (8,'Fachkraft für Lagerlogistik','Logistik Huber','Ingolstadt',1100,36,'Quali',3),
 (9,'Anlagenmechaniker/in SHK','Heizung Gruber','Landshut',1020,42,'Quali',2),
 (10,'Koch/Köchin','Gasthof Zur Linde','Kempten',1000,36,'Mittelschulabschluss',1),
 (11,'Industriemechaniker/in','Metallbau Steiner','Augsburg',1170,42,'Mittlere Reife',4),
 (12,'Tischler/in','Schreinerei Holzwurm','Regensburg',850,36,'Quali',0),
 (13,'Fachlagerist/in','Logistik Huber','Ingolstadt',1100,24,'Mittelschulabschluss',2),
 (14,'Zahnmedizinische/r Fachangestellte/r','Zahnarzt Dr. Weiß','Nürnberg',950,36,'Quali',1),
 (15,'Maler/in und Lackierer/in','Malerbetrieb Farbenfroh','Augsburg',940,36,'Mittelschulabschluss',2),
 (16,'Kaufmann/-frau für Büromanagement','Stadtwerke Landshut','Landshut',1150,36,'Mittlere Reife',2),
 (17,'Verkäufer/in','Baumarkt Werkbank','Regensburg',980,24,'Quali',3),
 (18,'Fachinformatiker/in','IT-Service Byteweise','Nürnberg',1120,36,'Mittlere Reife',0),
 (19,'Kfz-Mechatroniker/in','Autohaus Seidl','Kempten',1050,42,'Mittlere Reife',1),
 (20,'Pflegefachmann/-frau','Klinikum Nordpark','Augsburg',1340,36,'Mittlere Reife',6),
 (21,'Bäcker/in','Backhaus Kruste','Nürnberg',900,36,'Quali',2),
 (22,'Elektroniker/in','Solartechnik Sonnig','Ingolstadt',1080,42,'Quali',2),
 (23,'Fachverkäufer/in Lebensmittelhandwerk','Metzgerei Lang','Augsburg',870,36,'Mittelschulabschluss',1),
 (24,'Hotelfachmann/-frau','Hotel Alpenblick','Kempten',1000,36,'Quali',0),
 (25,'Mechatroniker/in','Robotik Werner','Regensburg',1200,42,'Mittlere Reife',2),
 (26,'Gärtner/in','Gärtnerei Grünzeug','Landshut',950,36,'Mittelschulabschluss',2),
 (27,'Fachkraft für Lagerlogistik','Paketzentrum Süd','Nürnberg',1100,36,'Quali',5),
 (28,'Zimmerer/Zimmerin','Holzbau Firstwerk','Kempten',1010,36,'Quali',1),
 (29,'Kaufmann/-frau im Einzelhandel','Elektromarkt Volt','Ingolstadt',1000,36,'Mittlere Reife',3),
 (30,'Friseur/in','Haarwerk Glanz','Augsburg',720,36,'Quali',2);
`,
});

/* Übungsdatenbank „Pfotenglück – die Partnerbörse für Tiere“ (Muster für das Projekt).
   Alle Tiere und Besitzer sind erfunden. tiere.besitzer_id → besitzer.id, tiere.art_id → arten.id.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("pfoten", {
  titel: "Pfotenglück – Partnerbörse für Tiere",
  sql: `
CREATE TABLE besitzer (
  id       INTEGER PRIMARY KEY,
  vorname  TEXT,
  wohnort  TEXT
);
CREATE TABLE arten (
  id             INTEGER PRIMARY KEY,
  name           TEXT,
  fell           TEXT,
  kann_fliegen   TEXT,
  lebt_im_wasser TEXT
);
CREATE TABLE tiere (
  id              INTEGER PRIMARY KEY,
  name            TEXT,
  besitzer_id     INTEGER REFERENCES besitzer(id),
  art_id          INTEGER REFERENCES arten(id),
  alter_jahre     INTEGER,
  hobby           TEXT,
  lieblingsfutter TEXT,
  macke           TEXT,
  sucht           TEXT
);
INSERT INTO besitzer VALUES
 (1,'Mia','Augsburg'),
 (2,'Jonas','München'),
 (3,'Elif','Nürnberg'),
 (4,'Kai','Augsburg'),
 (5,'Sara','Regensburg'),
 (6,'Omar','München'),
 (7,'Lena','Ingolstadt'),
 (8,'Noah','Nürnberg'),
 (9,'Hanna','Kempten'),
 (10,'Emre','Augsburg');
INSERT INTO arten VALUES
 (1,'Hund','ja','nein','nein'),
 (2,'Katze','ja','nein','nein'),
 (3,'Kaninchen','ja','nein','nein'),
 (4,'Wellensittich','nein','ja','nein'),
 (5,'Goldfisch','nein','nein','ja'),
 (6,'Schildkröte','nein','nein','nein'),
 (7,'Meerschweinchen','ja','nein','nein'),
 (8,'Axolotl','nein','nein','ja'),
 (9,'Hamster','ja','nein','nein'),
 (10,'Papagei','nein','ja','nein');
INSERT INTO tiere VALUES
 (1,'Bello',2,1,5,'Stöckchen holen','Leberwurst','bellt beim Staubsauger','Spaziergang-Partner'),
 (2,'Minka',1,2,3,'Fensterbank','Thunfisch','schläft nur im Wäschekorb','Kuschelpartner'),
 (3,'Hoppel',3,3,2,'Möhren verstecken','Löwenzahn','klopft nachts','Kuschelpartner'),
 (4,'Pieps',4,4,1,'Spiegel anschauen','Hirse','pfeift Werbemelodien','Gesangspartner'),
 (5,'Goldi',5,5,4,'Kreise schwimmen','Flocken','starrt Leute an','Freundschaft'),
 (6,'Turbo',6,6,23,'Sonnenbaden','Erdbeeren','ist schneller als man denkt','Freundschaft'),
 (7,'Rocky',7,1,7,'Bälle zerlegen','Käse','hat Angst vor Tauben','Spaziergang-Partner'),
 (8,'Luna',8,2,6,'Jagd auf Laserpunkte','Hühnchen','miaut um 4 Uhr früh','Kuschelpartner'),
 (9,'Krümel',9,7,2,'Quieken','Gurke','frisst Papier','Kuschelpartner'),
 (10,'Ally',10,8,3,'Lächeln','Würmer','sieht immer gut gelaunt aus','Freundschaft'),
 (11,'Speedy',1,9,1,'Laufrad','Sonnenblumenkerne','stopft die Backen voll','Sportpartner'),
 (12,'Coco',2,10,15,'Wörter lernen','Nüsse','sagt „Hallo“ zum Kühlschrank','Gesangspartner'),
 (13,'Rex',3,1,9,'Wache halten','Knochen','schnarcht laut','Spaziergang-Partner'),
 (14,'Mimi',4,2,12,'Kartons','Lachs','wirft Dinge vom Tisch','Freundschaft'),
 (15,'Flocke',5,3,4,'Graben','Heu','hasst Montage','Kuschelpartner'),
 (16,'Blub',6,5,2,'Blasen machen','Flocken','vergisst alles nach 3 Sekunden','Freundschaft'),
 (17,'Shelly',7,6,41,'Salat zählen','Löwenzahn','will überall hin, aber langsam','Freundschaft'),
 (18,'Paula',8,7,3,'Popcornsprünge','Paprika','quietscht bei Tüten','Kuschelpartner'),
 (19,'Bruno',9,1,3,'Pfützen','Würstchen','klaut Socken','Sportpartner'),
 (20,'Kiwi',10,4,2,'Klettern','Kolbenhirse','beißt in Schnürsenkel','Gesangspartner'),
 (21,'Nemo',1,8,5,'Verstecken','Garnelen','lächelt auch bei schlechtem Wetter','Freundschaft'),
 (22,'Wusel',3,9,1,'Tunnel bauen','Mais','ist nachts sehr beschäftigt','Sportpartner'),
 (23,'Kasimir',5,2,8,'Vögel beobachten','Leberwurst','öffnet Türen selbst','Freundschaft'),
 (24,'Polly',6,10,30,'Pfeifen','Apfel','kann das Handy-Klingeln nachmachen','Gesangspartner');
`,
});

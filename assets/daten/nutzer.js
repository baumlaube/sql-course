/* Übungsdatenbank „Tonspur – Nutzerkonten“ – erfundene Konten der Musik-App Tonspur.
   E-Mail-Adressen nutzen die reservierte Endung .example und gehören niemandem.
   Lizenz: CC BY-SA 4.0 · herrseibert.de · Erstellt von der KI Claude von Anthropic. */
Labor.daten("nutzer", {
  titel: "Tonspur – Nutzerkonten",
  sql: `
CREATE TABLE nutzer (
  id           INTEGER PRIMARY KEY,
  benutzername TEXT,
  email        TEXT,
  geburtsjahr  INTEGER,
  ort          TEXT,
  abo          TEXT,
  lieblingsgenre TEXT
);
INSERT INTO nutzer VALUES
 (1,'nachteule_17','nachteule17@post.example',2009,'Augsburg','Free','Hip-Hop'),
 (2,'basslinie','basslinie@post.example',1998,'München','Premium','Elektro'),
 (3,'lina.liest','lina.k@post.example',2008,'Regensburg','Free','Pop'),
 (4,'gitarrenheld','g.held@post.example',1987,'Nürnberg','Family','Rock'),
 (5,'mo_beats','mo.beats@post.example',2010,'Augsburg','Free','Hip-Hop'),
 (6,'sternschnuppe','sternschnuppe@post.example',2001,'Ingolstadt','Premium','Pop'),
 (7,'kopfhoerer99','kh99@post.example',1999,'München','Premium','Indie'),
 (8,'elif.music','elif.m@post.example',2009,'Nürnberg','Free','Pop'),
 (9,'dj_dachboden','dachboden@post.example',1993,'Landshut','Premium','Elektro'),
 (10,'leise_laut','leiselaut@post.example',2007,'Regensburg','Family','Indie'),
 (11,'jonas_rockt','jonas.r@post.example',2008,'Kempten','Free','Rock'),
 (12,'mia.mag.pop','mia.pop@post.example',2010,'Augsburg','Family','Pop'),
 (13,'nordlicht','nordlicht@post.example',1985,'Würzburg','Premium','Indie'),
 (14,'kai_k','kai.k@post.example',2006,'Ingolstadt','Free','Hip-Hop'),
 (15,'tanzflaeche','tanz@post.example',1996,'München','Premium','Elektro'),
 (16,'ruhepol','ruhepol@post.example',1979,'Landshut','Family','Pop'),
 (17,'sofa_surfer','sofasurfer@post.example',2004,'Nürnberg','Free','Hip-Hop'),
 (18,'vinylfan','vinyl@post.example',1990,'Regensburg','Premium','Rock'),
 (19,'amelie_ohrwurm','ohrwurm@post.example',2009,'Kempten','Free','Pop'),
 (20,'beatbauer','beatbauer@post.example',2002,'Augsburg','Premium','Elektro'),
 (21,'stadtkind','stadtkind@post.example',2005,'München','Free','Indie'),
 (22,'ole_ohne_plan','ole@post.example',2011,'Würzburg','Family','Hip-Hop'),
 (23,'nina_nachtzug','nachtzug@post.example',1994,'Nürnberg','Premium','Pop'),
 (24,'fernweh_fan','fernweh@post.example',2003,'Ingolstadt','Free','Indie');
`,
});

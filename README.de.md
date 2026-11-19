# SQL-Kurs – Datenbanken verstehen mit SQL

🇬🇧 [English version](README.md)

Ein freier Lernpfad für **Datenbanken und SQL**, gemacht für die Mittelschule in Bayern, Klasse 10
(LehrplanPLUS Informatik M10). 16 Lektionen à 35 Minuten, dazu viel Training.

**Online:** https://sql.herrseibert.de

> Mit **Sprachhilfe Englisch** (`?lang=en` an die Adresse hängen, z. B. `teil2/04-where.html?lang=en`).
> SQL-Befehle bleiben englisch – wie in jeder Datenbank.

## Was ist besonders?

- **SQL-Labor im Browser** (`assets/labor.js`): echtes SQLite über sql.js – nichts installieren, kein Konto, nichts wird
  an einen Server geschickt. Geht mit Maus, Tastatur **und Finger** (Bausteine zum Antippen am Handy und Tablet).
- **Geprüft wird das Ergebnis, nicht der Text:** Jede richtige Abfrage zählt. Typische Fehler bekommen eine eigene
  Rückmeldung: fehlende Anführungszeichen, Tippfehler in Spalten, `>` statt `>=`, Tausenderpunkt, Groß-/Kleinschreibung,
  SQLite-Fehlermeldungen in verständlichem Deutsch.
- **Kleine Schritte:** erst überlegen, dann `WHERE` in Zeitlupe Zeile für Zeile zuschauen, Puzzle, Lückenabfragen,
  Fehlerdetektiv, Hilfe-Leitern, Kurz-Checks, bei denen jede falsche Antwort den Denkfehler dahinter erklärt.
- **Viel Training** in drei Stufen je Lektion, jeweils in einer eigenen kleinen, erfundenen Welt.
- **Kein Tracking, keine Cookies, keine fremden Server.**

## Stand

Online: Startseite und Teil 2 (Lektionen 3–8: SELECT, WHERE, AND/OR/NOT, LIKE/IN/BETWEEN, Sortieren und rechnen, GROUP BY).
Teil 1, 3, 4 und 5 (Einstieg, JOIN, Projekt, Formulare) sind in Arbeit.

## Benutzung

Den Ordner mit einem beliebigen Webserver ausliefern (das Labor braucht http, nicht `file://`), z. B.

```
python3 -m http.server 8000
```

## Lizenz und Urheber

- Kursinhalte und Code: **CC BY-SA 4.0** (siehe `LICENSE`). Erstellt von der KI **Claude von Anthropic**,
  veröffentlicht von [herrseibert.de](https://herrseibert.de). Alle Daten sind erfunden.
- `assets/sqljs/`: [sql.js](https://github.com/sql-js/sql.js) 1.17.0, MIT-Lizenz (siehe `assets/sqljs/LICENSE`);
  SQLite ist gemeinfrei.

Fehler gefunden oder eine Idee? Bitte ein Issue eröffnen.

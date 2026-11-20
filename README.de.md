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

Alle 16 Lektionen sind online: Datenbanken und IDs (1–2), Abfragen in einer Tabelle bis GROUP BY (3–8), JOIN und ein Kriminalfall (9–11),
ein eigenes Datenbank-Projekt – eine Partnerbörse für Tiere – mit CREATE TABLE, INSERT, UPDATE, DELETE (12–14) und ein Formular-Baukasten für Such- und Eingabeformulare (15–16).
Sprachhilfe Englisch: bisher Startseite und Lektionen 3–8.

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

# SQL-Kurs – Understanding databases with SQL

🇩🇪 [Deutsche Version](README.de.md)

A free learning path for **databases and SQL**, made for lower secondary school (Mittelschule) in Bavaria, Germany,
grade 10 (curriculum LehrplanPLUS Informatik M10). 16 lessons of 35 minutes, plus lots of extra practice.

**Live:** https://sql.herrseibert.de

> The course is in **German**, with an **English language help** (add `?lang=en` to any page, e.g. `teil2/04-where.html?lang=en`).
> SQL keywords stay English, as in every database.

## What's special?

- **SQL lab in the browser** (`assets/labor.js`): real SQLite via sql.js – no installation, no account, nothing is sent
  to a server. Works with mouse, keyboard **and finger** (tap-to-insert building blocks on phones and tablets).
- **Checked by result, not by text:** any correct query is accepted. Typical mistakes get specific feedback:
  missing quotes, typos in column names, `>` vs. `>=`, thousands separators, case-sensitive text, SQLite error
  messages explained in plain German.
- **Small steps:** predict first, watch `WHERE` work row by row in slow motion, Parsons puzzles, fill-in-the-gap queries,
  bug hunts, hint ladders, short quizzes where every wrong answer explains the misconception behind it.
- **Lots of practice** in three levels per lesson, each in its own small fictional world.
- **No tracking, no cookies, no external resources.**

## Status

Online: start page and part 2 (lessons 3–8: SELECT, WHERE, AND/OR/NOT, LIKE/IN/BETWEEN, sorting and calculating, GROUP BY).
Parts 1, 3, 4 and 5 (introduction, JOIN, project, forms) are in progress.

## Usage

Serve the folder with any static web server (the SQL lab needs http, not `file://`), e.g.

```
python3 -m http.server 8000
```

## License and authorship

- Course content and code: **CC BY-SA 4.0** (see `LICENSE`). Created by the AI **Claude by Anthropic**,
  published by [herrseibert.de](https://herrseibert.de). All data sets are fictional.
- `assets/sqljs/`: [sql.js](https://github.com/sql-js/sql.js) 1.17.0, MIT license (see `assets/sqljs/LICENSE`);
  SQLite is in the public domain.

Found a mistake or have an idea? Please open an issue.

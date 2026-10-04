"""Persist records, join relations and inspect an indexed query."""
import sqlite3, tempfile
from pathlib import Path
with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / "catalogue.sqlite"
    db = sqlite3.connect(path)
    try:
        db.execute("PRAGMA foreign_keys = ON")
        db.executescript("""
            CREATE TABLE authors(id INTEGER PRIMARY KEY, name TEXT NOT NULL);
            CREATE TABLE books(id INTEGER PRIMARY KEY, title TEXT NOT NULL, author_id INTEGER NOT NULL REFERENCES authors(id));
            CREATE INDEX book_title ON books(title);
        """)
        with db:
            db.execute("INSERT INTO authors VALUES (?, ?)", (1, "Frank Herbert"))
            db.execute("INSERT INTO books VALUES (?, ?, ?)", (1, "Dune", 1))
        query = "SELECT books.title, authors.name FROM books JOIN authors ON authors.id=books.author_id WHERE books.title=?"
        print("joined:", db.execute(query, ("Dune",)).fetchall())
        plan = db.execute("EXPLAIN QUERY PLAN SELECT id FROM books WHERE title=?", ("Dune",)).fetchall()
        indexed = any("INDEX" in row[3] for row in plan)
        print("index used:", indexed); assert indexed
        attack = "' OR 1=1 --"
        assert db.execute("SELECT id FROM books WHERE title=?", (attack,)).fetchall() == []
    finally:
        db.close()
    reopened = sqlite3.connect(path)
    try:
        print("reopened rows:", reopened.execute("SELECT COUNT(*) FROM books").fetchone()[0])
        assert reopened.execute("SELECT COUNT(*) FROM books").fetchone()[0] == 1
    finally:
        reopened.close()

"""A stock decrement and loan creation commit together or roll back together."""
import sqlite3
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
db.executescript("""
 CREATE TABLE books(id INTEGER PRIMARY KEY, copies INTEGER NOT NULL CHECK(copies>=0));
 CREATE TABLE loans(request_id TEXT PRIMARY KEY, book_id INTEGER REFERENCES books(id));
 INSERT INTO books VALUES(1, 2);
""")
def borrow(request_id, book_id):
    with db:
        changed = db.execute("UPDATE books SET copies=copies-1 WHERE id=? AND copies>0", (book_id,)).rowcount
        if changed != 1: raise ValueError("unavailable")
        db.execute("INSERT INTO loans VALUES (?, ?)", (request_id, book_id))
try:
    borrow("request-a", 1)
    try:
        borrow("request-a", 1)
    except sqlite3.IntegrityError:
        print("duplicate request rolled back")
    assert db.execute("SELECT copies FROM books").fetchone()[0] == 1
    borrow("request-b", 1)
    try:
        borrow("request-c", 1)
    except ValueError:
        print("out of stock rejected")
    print("copies:", db.execute("SELECT copies FROM books").fetchone()[0], "loans:", db.execute("SELECT COUNT(*) FROM loans").fetchone()[0])
    assert db.execute("SELECT COUNT(*) FROM loans").fetchone()[0] == 2
finally:
    db.close()

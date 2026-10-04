"""Local catalogue capstone: SQLite, HTTP, scoped bearer tokens and idempotent loans.

Default: finite integration checks in a temporary directory.
To keep a local server running, set CS_CATALOGUE_TOKEN (32+ characters), then:
python m14_capstone.py --serve --db catalogue.sqlite --port 8000
This single-threaded http.server application is for local study, not public hosting.
"""
import argparse, json, os, re, secrets, sqlite3, tempfile
from contextlib import closing
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread
from urllib.error import HTTPError
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen

class Conflict(Exception):
    pass

class Catalogue:
    def __init__(self, path):
        self.path = path
        with closing(self.connect()) as db, db:
            db.executescript("""
              CREATE TABLE IF NOT EXISTS books(id INTEGER PRIMARY KEY, title TEXT NOT NULL,
                copies INTEGER NOT NULL CHECK(copies>=0), total INTEGER NOT NULL CHECK(copies<=total));
              CREATE TABLE IF NOT EXISTS loans(request_id TEXT PRIMARY KEY,
                book_id INTEGER NOT NULL REFERENCES books(id), member TEXT NOT NULL);
              CREATE INDEX IF NOT EXISTS title_index ON books(title);
            """)
            db.execute("INSERT OR IGNORE INTO books VALUES(1,'Dune',2,2)")
            db.execute("INSERT OR IGNORE INTO books VALUES(2,'Foundation',1,1)")
    def connect(self):
        db = sqlite3.connect(self.path, timeout=3)
        db.execute("PRAGMA foreign_keys=ON")
        return db
    def search(self, query):
        with closing(self.connect()) as db:
            # SQLite lower() has ASCII semantics here; literal substring, not LIKE wildcards.
            rows = db.execute("SELECT id,title,copies FROM books WHERE instr(lower(title),lower(?))>0 ORDER BY title,id LIMIT 100", (query,)).fetchall()
            return [dict(zip(("id", "title", "copies"), row)) for row in rows]
    def borrow(self, request_id, book_id, member):
        with closing(self.connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            previous = db.execute("SELECT book_id,member FROM loans WHERE request_id=?", (request_id,)).fetchone()
            if previous:
                if previous != (book_id, member): raise Conflict("request ID reused with different inputs")
                return 200, {"request_id": request_id, "book_id": book_id, "member": member}
            if db.execute("UPDATE books SET copies=copies-1 WHERE id=? AND copies>0", (book_id,)).rowcount != 1:
                raise Conflict("book unavailable")
            db.execute("INSERT INTO loans VALUES(?,?,?)", (request_id, book_id, member))
            return 201, {"request_id": request_id, "book_id": book_id, "member": member}

class Handler(BaseHTTPRequestHandler):
    def setup(self):
        super().setup(); self.connection.settimeout(5)
    def log_message(self, *args):
        pass  # do not log credentials or request bodies
    def reply(self, status, value):
        body = json.dumps(value).encode("utf-8")
        self.send_response(status)
        if status == 401: self.send_header("WWW-Authenticate", 'Bearer realm="catalogue"')
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def identity(self, scope):
        header = self.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            self.reply(401, {"error": "authentication required"}); return None
        supplied = header[7:].encode("utf-8")
        for token, (member, scopes) in self.server.tokens.items():
            if secrets.compare_digest(token.encode("utf-8"), supplied):
                if scope not in scopes:
                    self.reply(403, {"error": "permission denied"}); return None
                return member
        self.reply(401, {"error": "invalid credential"}); return None
    def do_GET(self):
        if self.identity("read") is None: return
        url = urlsplit(self.path)
        if url.path != "/books": self.reply(404, {"error": "unknown route"}); return
        params = parse_qs(url.query, keep_blank_values=True)
        if set(params) - {"q"} or len(params.get("q", [])) > 1:
            self.reply(400, {"error": "only one q parameter allowed"}); return
        query = params.get("q", [""])[0].strip()
        if len(query) > 100 or ("q" in params and not query):
            self.reply(400, {"error": "invalid query"}); return
        self.reply(200, self.server.catalogue.search(query))
    def do_POST(self):
        member = self.identity("borrow")
        if member is None: return
        if self.path != "/loans": self.reply(404, {"error": "unknown route"}); return
        if self.headers.get("Content-Type", "").split(";")[0].strip() != "application/json":
            self.reply(415, {"error": "JSON required"}); return
        if self.headers.get("Transfer-Encoding"):
            self.reply(400, {"error": "chunked bodies not supported"}); return
        lengths = self.headers.get_all("Content-Length", [])
        try:
            if len(lengths) != 1: raise ValueError("one body length required")
            length = int(lengths[0])
            if not 1 <= length <= 1024: raise ValueError("body length out of range")
            raw = self.rfile.read(length)
            if len(raw) != length: raise ValueError("truncated body")
            record = json.loads(raw.decode("utf-8"))
            if not isinstance(record, dict) or set(record) != {"request_id", "book_id"}: raise ValueError("invalid fields")
            if type(record["book_id"]) is not int or record["book_id"] <= 0: raise ValueError("positive integer ID required")
            if not isinstance(record["request_id"], str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", record["request_id"]): raise ValueError("invalid request ID")
        except (ValueError, UnicodeError, TimeoutError):
            self.reply(400, {"error": "invalid body"}); return
        try:
            status, value = self.server.catalogue.borrow(record["request_id"], record["book_id"], member)
            self.reply(status, value)
        except Conflict as error:
            self.reply(409, {"error": str(error)})
        except sqlite3.OperationalError:
            self.reply(503, {"error": "database unavailable"})

def make_server(path, tokens, port=0):
    catalogue = Catalogue(path)
    server = HTTPServer(("127.0.0.1", port), Handler)
    server.catalogue, server.tokens = catalogue, tokens
    return server

def self_test():
    token, guest = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
    with tempfile.TemporaryDirectory() as folder:
        path = str(Path(folder) / "catalogue.sqlite")
        server = make_server(path, {token: ("reader", {"read", "borrow"}), guest: ("guest", {"read"})})
        thread = Thread(target=server.serve_forever); thread.start()
        base = f"http://127.0.0.1:{server.server_port}"
        def request(route, body=None, credential=token):
            headers = {"Content-Type": "application/json"}
            if credential: headers["Authorization"] = "Bearer " + credential
            req = Request(base + route, data=json.dumps(body).encode() if body is not None else None, headers=headers)
            try:
                with urlopen(req, timeout=5) as response: return response.status, json.load(response)
            except HTTPError as error:
                with error: return error.code, json.load(error)
        try:
            assert request("/books", credential=None)[0] == 401
            assert request("/loans", {"request_id":"a", "book_id":1}, guest)[0] == 403
            assert request("/books?q=Dune")[1][0]["copies"] == 2
            assert request("/books?q=%27%20OR%201%3D1%20--")[1] == []
            assert request("/loans", {"request_id":"bad", "book_id":True})[0] == 400
            first = request("/loans", {"request_id":"a", "book_id":1})
            replay = request("/loans", {"request_id":"a", "book_id":1})
            assert first[0] == 201 and replay[0] == 200 and first[1] == replay[1]
            assert request("/loans", {"request_id":"a", "book_id":2})[0] == 409
            assert request("/books?q=Dune")[1][0]["copies"] == 1
            assert request("/loans", {"request_id":"b", "book_id":1})[0] == 201
            assert request("/loans", {"request_id":"c", "book_id":1})[0] == 409
            print("PASS: authentication, scopes, validation, bound SQL, idempotent replay and stock limits")
        finally:
            server.shutdown(); server.server_close(); thread.join(timeout=5); assert not thread.is_alive()
        reopened = Catalogue(path)
        assert reopened.search("Dune")[0]["copies"] == 0
        with closing(reopened.connect()) as db:
            total, copies = db.execute("SELECT total,copies FROM books WHERE id=1").fetchone()
            loans = db.execute("SELECT COUNT(*) FROM loans WHERE book_id=1").fetchone()[0]
            assert total == copies + loans == 2
        print("PASS: restart persistence and inventory invariant")

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--serve", action="store_true")
    parser.add_argument("--db", default="catalogue.sqlite")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    if not args.serve: self_test(); return
    token = os.environ.get("CS_CATALOGUE_TOKEN", "")
    if len(token) < 32: parser.error("set CS_CATALOGUE_TOKEN to a random 32+ character credential")
    server = make_server(args.db, {token: ("reader", {"read", "borrow"})}, args.port)
    print(f"Local catalogue: http://127.0.0.1:{server.server_port}/books (Bearer credential required)")
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()

if __name__ == "__main__": main()

"""A finite localhost HTTP experiment with JSON, statuses and cleanup."""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from urllib.error import HTTPError
from urllib.request import urlopen
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/books":
            self.send_error(404); return
        body = json.dumps([{"id": 1, "title": "Dune"}]).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers(); self.wfile.write(body)
    def log_message(self, *args):
        pass

server = HTTPServer(("127.0.0.1", 0), Handler)
thread = Thread(target=server.serve_forever); thread.start()
try:
    base = f"http://127.0.0.1:{server.server_port}"
    with urlopen(base + "/books", timeout=5) as response:
        books = json.load(response)
        print("GET /books:", response.status, books)
        assert response.status == 200 and books[0]["title"] == "Dune"
    try:
        urlopen(base + "/missing", timeout=5)
    except HTTPError as error:
        print("GET /missing:", error.code); assert error.code == 404; error.close()
    else:
        raise AssertionError("missing resource must be 404")
finally:
    server.shutdown(); server.server_close(); thread.join(timeout=5)
    assert not thread.is_alive()

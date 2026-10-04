"""Receive a length-prefixed message even when reads return partial chunks."""
import socket
from threading import Thread
def read_exact(stream, count):
    result = bytearray()
    while len(result) < count:
        chunk = stream.recv(min(2, count - len(result)))
        if not chunk:
            raise EOFError("connection closed before complete frame")
        result.extend(chunk)
    return bytes(result)

with socket.socket() as listener:
    listener.bind(("127.0.0.1", 0)); listener.listen(1); listener.settimeout(5)
    payload = b"Dune,Foundation"
    errors = []
    def serve():
        try:
            connection, _ = listener.accept()
            with connection:
                connection.sendall(len(payload).to_bytes(4, "big") + payload)
        except Exception as error:
            errors.append(error)
    worker = Thread(target=serve); worker.start()
    with socket.create_connection(listener.getsockname(), timeout=5) as client:
        length = int.from_bytes(read_exact(client, 4), "big")
        if length > 1024: raise ValueError("frame too large")
        result = read_exact(client, length)
    worker.join(timeout=5)
    assert not worker.is_alive() and not errors and result == payload
    print("frame bytes:", length, "decoded:", result.decode("utf-8"))

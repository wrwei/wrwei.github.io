"""Force a lost update deterministically, then protect a critical section."""
from threading import Barrier, Lock, Thread
counter, barrier = [0], Barrier(2)
def unsafe():
    old = counter[0]
    barrier.wait(timeout=5)  # both have read zero before either writes
    counter[0] = old + 1
threads = [Thread(target=unsafe) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join(timeout=10); assert not t.is_alive()
print("forced lost update:", counter[0])
assert counter[0] == 1

counter[0] = 0
lock = Lock()
def safe():
    for _ in range(1000):
        with lock:
            counter[0] = counter[0] + 1
threads = [Thread(target=safe) for _ in range(2)]
for t in threads: t.start()
for t in threads: t.join(timeout=10); assert not t.is_alive()
print("protected updates:", counter[0])
assert counter[0] == 2000

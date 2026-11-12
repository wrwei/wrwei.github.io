"""Exhaustively explore a deliberately bounded, two-control-state retry model."""
from collections import deque

START = ("idle", 0, False)  # control, number of sends, acknowledgement seen

def successors(state, faulty):
    mode, count, ack = state
    if mode == "idle" and count == 0 and not ack:
        yield "send", ("waiting", 1, False)
    if mode == "waiting":
        if count < 2:
            yield "retry", ("waiting", count + 1, ack)
        yield "ack", ("idle", count, True)
        if count == 2:
            yield "timeout", ("idle", count, ack) if faulty else state

def safe(state):
    mode, count, ack = state
    return mode != "idle" or count == 0 or ack

def explore(faulty):
    queue, paths = deque([START]), {START: []}
    while queue:
        state = queue.popleft()
        for event, target in successors(state, faulty):
            if target not in paths:
                paths[target] = paths[state] + [event]
                queue.append(target)
    return paths

for faulty in (True, False):
    paths = explore(faulty)
    bad = [(state, path) for state, path in paths.items() if not safe(state)]
    print("faulty =", faulty, "; reachable =", len(paths), "; unsafe =", len(bad))
    for state, path in bad:
        print("Witness:", " -> ".join(path), "; state =", state)
    assert bool(bad) == faulty
    if not faulty:
        assert len(paths) == 5 and ("idle", 2, False) not in paths
print("Repair: timeout stays waiting; safety does not guarantee acknowledgement or termination.")
print("Scope: two sends maximum, no cancellation, one request, no delayed messages or concurrency.")

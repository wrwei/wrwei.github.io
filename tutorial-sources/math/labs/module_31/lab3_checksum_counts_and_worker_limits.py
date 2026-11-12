"""Educational byte checksum, operation counts and scheduling scope faults."""
from collections import deque
from copy import deepcopy
import json

def checksum(tasks):
    canonical = sorted((dict(t, requires=sorted(t['requires'])) for t in tasks),key=lambda t:t['id'])
    payload = json.dumps(canonical,sort_keys=True,separators=(',',':'),ensure_ascii=True).encode('ascii')
    return sum(payload)%257

tasks = [{'id':'A','duration':1,'requires':[]},{'id':'B','duration':2,'requires':[]}]
corrupt = deepcopy(tasks)
corrupt[0]['duration'] = 2
collision = deepcopy(corrupt)
collision[1]['duration'] = 1
print('original/single-change/compensating-change checksums:', checksum(tasks),checksum(corrupt),checksum(collision))
assert checksum(tasks) != checksum(corrupt)
assert checksum(tasks) == checksum(collision) and tasks != collision
print('checksum detects this single change, but accepts this deliberate collision; no integrity guarantee')
for n in (10,100,1000):
    children = {i:[i+1] if i+1<n else [] for i in range(n)}
    indegree = [0]+[1]*(n-1)
    ready = deque([0])
    removed = inspected = 0
    while ready:
        v = ready.popleft()
        removed += 1
        for child in children[v]:
            inspected += 1
            indegree[child] -= 1
            if indegree[child] == 0:
                ready.append(child)
    assert removed == n and inspected == n-1
    print(f'chain V={n},E={n-1}: popped={removed},edge inspections={inspected}')
print('canonical checksum sorting is additional work; it is not included in the linear graph-pass count')
print('three independent tasks of duration two: unlimited workers=2; one worker=6; two workers=4')
print('topological order is a precedence certificate, not a unique order or a fixed-worker optimal schedule')

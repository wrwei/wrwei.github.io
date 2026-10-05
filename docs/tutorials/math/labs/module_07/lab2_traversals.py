"""Deterministic traversal certificates and dependency orders, not weighted paths."""
from collections import deque
from heapq import heapify, heappop, heappush

GRAPH = {"A": ["B", "C"], "B": ["A", "D"], "C": ["A", "D"],
         "D": ["B", "C", "E"], "E": ["D"], "F": []}

def bfs(graph, source):
    distance, parent, order = {source: 0}, {source: None}, []
    queue = deque([source])
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            if v not in distance:  # Mark at discovery, before queueing.
                distance[v], parent[v] = distance[u] + 1, u
                queue.append(v)
    return order, distance, parent

def dfs(graph, source):
    seen, preorder, postorder = set(), [], []
    def visit(u):
        seen.add(u)
        preorder.append(u)
        for v in graph[u]:
            if v not in seen:
                visit(v)
        postorder.append(u)
    visit(source)
    return preorder, postorder

def topological(graph):
    indegree = dict.fromkeys(graph, 0)
    for neighbours in graph.values():
        for v in neighbours:
            indegree[v] += 1
    ready = [v for v in graph if indegree[v] == 0]
    heapify(ready)  # Alphabetic tie-breaking, with heap overhead.
    order = []
    while ready:
        u = heappop(ready)
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                heappush(ready, v)
    return order, sorted(v for v in graph if indegree[v] > 0)

order, distance, parent = bfs(GRAPH, "A")
assert distance == {"A": 0, "B": 1, "C": 1, "D": 2, "E": 3}
for u, neighbours in GRAPH.items():
    if u in distance:
        for v in neighbours:
            assert v in distance and distance[v] <= distance[u] + 1
for v, p in parent.items():
    if p is not None:
        assert v in GRAPH[p] and distance[v] == distance[p] + 1
print("BFS order:", order)
print("Distances:", distance, "; F is unreachable")
print("Parents:", parent)
print("DFS preorder/postorder:", dfs(GRAPH, "A"))
dag = {"A": ["C"], "B": ["C"], "C": ["D", "E"], "D": [], "E": []}
order, blocked = topological(dag)
position = {v: i for i, v in enumerate(order)}
assert not blocked and all(position[u] < position[v] for u in dag for v in dag[u])
print("DAG topological order:", order)
cyclic = {v: neighbours[:] for v, neighbours in dag.items()}
cyclic["D"].append("A")
print("After adding D->A, processed/blocked:", topological(cyclic))
cycle = ["A", "C", "D", "A"]
assert all(v in cyclic[u] for u, v in zip(cycle, cycle[1:]))
print("Cycle witness:", " -> ".join(cycle))
print("Weighted trap: direct A->E costs 10; A->B->E costs 2. Fewest edges is not cheapest.")

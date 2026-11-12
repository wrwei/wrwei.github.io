"""Represent one finite simple undirected graph, including an isolated vertex."""
VERTICES = tuple("ABCDEF")
EDGES = ("AB", "AC", "BD", "CD", "DE")

def build_graph(vertices, edges):
    graph = {v: [] for v in vertices}
    seen = set()
    for u, v in edges:
        if u not in graph or v not in graph or u == v:
            raise ValueError("Edges need two distinct declared vertices")
        key = frozenset((u, v))
        if key in seen:
            raise ValueError("Repeated undirected edge")
        seen.add(key)
        graph[u].append(v)
        graph[v].append(u)
    return {v: sorted(neighbours) for v, neighbours in graph.items()}

graph = build_graph(VERTICES, EDGES)
matrix = [[int(v in graph[u]) for v in VERTICES] for u in VERTICES]
print("Adjacency lists:", graph)
print("Matrix order:", " ".join(VERTICES))
for v, row in zip(VERTICES, matrix):
    print(v, " ".join(map(str, row)))
degrees = [len(graph[v]) for v in VERTICES]
assert sum(degrees) == 2 * len(EDGES)
assert all(matrix[i][j] == matrix[j][i] for i in range(6) for j in range(6))
print("Degrees:", degrees, "; sum =", sum(degrees), "; 2|E| =", 2 * len(EDGES))
print("Isolated vertices:", [v for v in VERTICES if not graph[v]])
for label, edges in [("loop", ("AA",)), ("duplicate", ("AB", "BA")), ("unknown", ("AZ",))]:
    try:
        build_graph(VERTICES, edges)
    except ValueError as error:
        print("Rejected", label + ":", error)

"""BFS finds a shortest path measured in edges in an unweighted graph."""
from collections import deque
def route(graph, start, goal):
    if start not in graph or goal not in graph:
        raise KeyError("unknown vertex")
    queue, parent = deque([start]), {start: None}
    while queue:
        vertex = queue.popleft()
        if vertex == goal:
            path = []
            while vertex is not None:
                path.append(vertex); vertex = parent[vertex]
            return path[::-1]
        for neighbour in graph[vertex]:
            if neighbour not in parent:
                parent[neighbour] = vertex; queue.append(neighbour)
    return None

graph = {"A": ["B", "C"], "B": ["A", "D"], "C": ["A", "D"], "D": ["B", "C"], "E": []}
print("A to D:", route(graph, "A", "D"))
print("A to E:", route(graph, "A", "E"))
assert route(graph, "A", "D") == ["A", "B", "D"]
assert route(graph, "A", "A") == ["A"]
assert route(graph, "A", "E") is None

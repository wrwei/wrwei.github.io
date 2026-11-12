"""Reference planner: simple prerequisite edges, unlimited parallel workers.

An input list preserves deterministic tie order. Validation rejects rather than
silently repairing duplicates. Critical-path proofs use exact real durations;
the reference fixture uses integers so its calculations are exact in Python.
"""
from collections import deque
import math
import re

class CycleError(ValueError):
    def __init__(self, witness):
        self.witness = witness
        super().__init__('cycle: '+' -> '.join(witness))

def cycle_witness(children):
    colour = {v: 0 for v in children}
    for start in children:
        if colour[start]:
            continue
        path, positions = [start], {start: 0}
        colour[start] = 1
        stack = [(start, iter(children[start]))]
        while stack:
            v, iterator = stack[-1]
            try:
                child = next(iterator)
            except StopIteration:
                colour[v] = 2
                stack.pop()
                positions.pop(v)
                path.pop()
                continue
            if colour[child] == 1:
                return path[positions[child]:]+[child]
            if colour[child] == 0:
                colour[child] = 1
                positions[child] = len(path)
                path.append(child)
                stack.append((child, iter(children[child])))
    return []

def plan(tasks):
    if not isinstance(tasks, list):
        raise ValueError('tasks must be a list')
    durations, predecessors = {}, {}
    for task in tasks:
        if not isinstance(task, dict) or set(task) != {'id','duration','requires'}:
            raise ValueError('each task needs exactly id,duration,requires')
        v, duration, requires = task['id'], task['duration'], task['requires']
        if not isinstance(v, str) or not re.fullmatch(r'[A-Za-z][A-Za-z0-9_]{0,31}', v) or v in durations:
            raise ValueError('invalid or duplicate task id')
        if isinstance(duration, bool) or not isinstance(duration, (int,float)):
            raise ValueError('duration must be a positive finite number')
        try:
            finite = math.isfinite(duration)
        except OverflowError:
            finite = False
        if not finite or duration <= 0:
            raise ValueError('duration must be a positive finite number')
        if not isinstance(requires,list) or any(not isinstance(u,str) for u in requires) or len(set(requires)) != len(requires):
            raise ValueError('requires must be a list of distinct ids')
        durations[v], predecessors[v] = duration, requires[:]
    children = {v: [] for v in durations}
    for v, before in predecessors.items():
        for u in before:
            if u not in durations:
                raise ValueError('missing prerequisite: '+u)
            children[u].append(v)
    indegree = {v: len(predecessors[v]) for v in durations}
    ready = deque(v for v in durations if indegree[v] == 0)
    order = []
    while ready:
        v = ready.popleft()
        order.append(v)
        for child in children[v]:
            indegree[child] -= 1
            if indegree[child] == 0:
                ready.append(child)
    if len(order) != len(durations):
        witness = cycle_witness(children)
        assert witness and witness[0] == witness[-1]
        assert all(b in children[a] for a,b in zip(witness,witness[1:]))
        raise CycleError(witness)
    finish, parent = {}, {}
    for v in order:
        before = predecessors[v]
        parent[v] = max(before, key=finish.__getitem__) if before else None
        start = finish[parent[v]] if before else 0
        try:
            finish[v] = start+durations[v]
        except OverflowError as error:
            raise ValueError('completion-time arithmetic overflow') from error
        if isinstance(finish[v], float) and not math.isfinite(finish[v]):
            raise ValueError('completion-time arithmetic overflow')
    endpoint = max(order, key=finish.__getitem__) if order else None
    path = []
    while endpoint is not None:
        path.append(endpoint)
        endpoint = parent[endpoint]
    return {'order':order, 'finish':finish, 'critical_path':path[::-1], 'makespan':max(finish.values(),default=0)}

TASKS = [
    {'id':'A','duration':2,'requires':[]},
    {'id':'B','duration':3,'requires':['A']},
    {'id':'C','duration':4,'requires':['A']},
    {'id':'D','duration':2,'requires':['B','C']},
    {'id':'E','duration':1,'requires':['D']},
    {'id':'F','duration':2,'requires':['E']},
    {'id':'G','duration':5,'requires':[]},
    {'id':'H','duration':3,'requires':['F']},
]
result = plan(TASKS)
positions = {v:i for i,v in enumerate(result['order'])}
assert all(positions[u]<positions[t['id']] for t in TASKS for u in t['requires'])
assert result['makespan'] == 14 and result['critical_path'] == ['A','C','D','E','F','H']
print('order:', result['order'])
print('finish:', result['finish'])
print('critical path:', result['critical_path'], '; makespan:', result['makespan'])
assert plan([]) == {'order':[], 'finish':{}, 'critical_path':[], 'makespan':0}
print('empty input: valid empty plan, makespan zero')
cycle = [{'id':'X','duration':1,'requires':['Z']},{'id':'Y','duration':1,'requires':['X']},{'id':'Z','duration':1,'requires':['Y']}]
try:
    plan(cycle)
    raise AssertionError('cycle accepted')
except CycleError as error:
    print('cycle witness:', error.witness)
invalid = [
    TASKS+[TASKS[0].copy()],
    [{'id':'A','duration':1,'requires':['missing']}],
    [{'id':'A','duration':0,'requires':[]}],
    [{'id':'A','duration':float('nan'),'requires':[]}],
    [{'id':'A','duration':True,'requires':[]}],
    [{'id':'A','duration':1,'requires':[]},{'id':'B','duration':1,'requires':['A','A']}],
]
for case in invalid:
    try:
        plan(case)
        raise AssertionError('invalid input accepted')
    except ValueError:
        pass
print('six contract fault cases rejected; edge/order and closed-cycle witnesses checked')

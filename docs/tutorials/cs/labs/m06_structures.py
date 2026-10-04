"""A linked stack and a FIFO queue with explicit empty behaviour."""
from collections import deque
class Node:
    def __init__(self, value, next_node=None):
        self.value, self.next = value, next_node
class Stack:
    def __init__(self):
        self.head = None
    def push(self, value):
        self.head = Node(value, self.head)
    def pop(self):
        if self.head is None:
            raise IndexError("empty stack")
        node = self.head
        self.head = node.next
        return node.value

stack, queue = Stack(), deque()
for book in ["Dune", "Foundation", "Solaris"]:
    stack.push(book); queue.append(book)
print("stack:", [stack.pop() for _ in range(3)])
print("queue:", [queue.popleft() for _ in range(3)])
try:
    stack.pop()
except IndexError:
    print("empty pop rejected")

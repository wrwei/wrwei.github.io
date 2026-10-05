"""A tiny scalar reverse engine: unique-node order, reset, seed, and += adjoints."""
import math

class Value:
    def __init__(self, data, parents=(), label=""):
        self.data, self.grad = float(data), 0.0
        self.parents, self.label = parents, label
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data+other.data, (self, other), "+")
        def backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = backward
        return out
    __radd__ = __add__

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data*other.data, (self, other), "*")
        def backward():
            self.grad += other.data*out.grad
            other.grad += self.data*out.grad
        out._backward = backward
        return out
    __rmul__ = __mul__

    def tanh(self):
        out = Value(math.tanh(self.data), (self,), "tanh")
        def backward():
            self.grad += (1-out.data*out.data)*out.grad
        out._backward = backward
        return out

    def backward(self, seed=1.0):
        visited, order = set(), []
        def visit(node):
            if node in visited:
                return
            visited.add(node)
            for parent in node.parents:
                visit(parent)
            order.append(node)
        visit(self)
        for node in order:
            node.grad = 0.0
        self.grad = float(seed)
        for node in reversed(order):
            node._backward()
        return order

x = Value(2, label="x")
u = x*x
u.label = "u=x*x"
square = u*u
square.label = "u*u"
z = square+u+x
z.label = "z"
order = z.backward()
print("Shared graph z=(x*x)^2+x*x+x at x=2")
for node in order:
    print(node.label, "value", node.data, "adjoint", node.grad)
assert z.data == 22 and x.grad == 37 and u.grad == 9
z.backward(seed=2)
print("Seed two input adjoint:", x.grad)
assert x.grad == 74
z.backward()
print("Fresh seeded pass resets rather than doubles:", x.grad)
assert x.grad == 37

a, b = Value(2), Value(-1)
mixed = a*b+a*a
mixed.backward()
print("Two-input value / gradient:", mixed.data, a.grad, b.grad)
assert mixed.data == 2 and (a.grad, b.grad) == (3, 2)

v = Value(0.4)
nonlinear = (v*v+0.5*v).tanh()
nonlinear.backward()
def reference(t):
    return math.tanh(t*t+0.5*t)
h = 1e-6
finite = (reference(0.4+h)-reference(0.4-h))/(2*h)
print("Nonlinear AD / finite difference:", v.grad, finite)
assert abs(v.grad-finite) < 1e-8
print("Overwriting a shared adjoint would discard a path; addition is part of the chain rule.")

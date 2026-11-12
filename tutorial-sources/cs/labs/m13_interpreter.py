"""A bounded recursive-descent interpreter: integers, +, *, parentheses."""
import re
def tokens(source):
    if len(source) > 200: raise ValueError("expression too long")
    result, position = [], 0
    while position < len(source):
        if source[position].isspace(): position += 1; continue
        match = re.match(r"[0-9]+|[+*()]", source[position:])
        if not match: raise ValueError("invalid character")
        result.append(match.group()); position += len(match.group())
    return result

class Parser:
    def __init__(self, source):
        self.items, self.position = tokens(source), 0
    def peek(self):
        return self.items[self.position] if self.position < len(self.items) else None
    def take(self):
        value = self.peek()
        if value is None: raise ValueError("unexpected end")
        self.position += 1; return value
    def expression(self, depth=0):
        node = self.term(depth)
        while self.peek() == "+":
            self.take(); node = ("+", node, self.term(depth))
        return node
    def term(self, depth):
        node = self.factor(depth)
        while self.peek() == "*":
            self.take(); node = ("*", node, self.factor(depth))
        return node
    def factor(self, depth):
        if depth > 20: raise ValueError("nesting too deep")
        token = self.take()
        if token == "(":
            node = self.expression(depth+1)
            if self.take() != ")": raise ValueError("missing closing parenthesis")
            return node
        if not token.isdecimal(): raise ValueError("integer expected")
        return int(token)
    def parse(self):
        node = self.expression()
        if self.peek() is not None: raise ValueError("trailing input")
        return node

def evaluate(node):
    if isinstance(node, int): return node
    op, left, right = node
    a, b = evaluate(left), evaluate(right)
    return a+b if op == "+" else a*b

for source in ["2+3*4", "(2+3)*4", "7"]:
    tree = Parser(source).parse()
    print(source, "tree:", tree, "value:", evaluate(tree))
assert evaluate(Parser("2+3*4").parse()) == 14
for source in ["", "2+", "(2+3", "2 3", "__import__('os')"]:
    try: Parser(source).parse()
    except ValueError: print(repr(source), "rejected")
    else: raise AssertionError("invalid expression accepted")

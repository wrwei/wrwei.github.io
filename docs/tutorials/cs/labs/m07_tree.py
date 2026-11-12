"""Recursive traversal with an explicit empty-tree base case."""
def inorder(node):
    if node is None:
        return []
    value, left, right = node
    return inorder(left) + [value] + inorder(right)

def height(node):
    if node is None:
        return 0
    return 1 + max(height(node[1]), height(node[2]))

tree = (4, (2, (1, None, None), (3, None, None)), (6, None, None))
print("inorder:", inorder(tree))
print("height:", height(tree))
assert inorder(tree) == [1, 2, 3, 4, 6]
assert inorder(None) == [] and height(None) == 0

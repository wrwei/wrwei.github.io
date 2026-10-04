"""Observe aliasing, copies, function return values and validation."""
def add_book(books, title):
    clean = title.strip()
    if not clean:
        raise ValueError("blank title")
    return books + [clean]

original = ["Dune"]
alias = original
alias.append("Foundation")
print("after alias append:", original)
updated = add_book(original, "  Solaris  ")
print("original:", original, "updated:", updated)
assert original == ["Dune", "Foundation"]
assert updated == ["Dune", "Foundation", "Solaris"]
try:
    add_book(original, "   ")
except ValueError:
    print("blank title rejected")
else:
    raise AssertionError("must reject blank input")

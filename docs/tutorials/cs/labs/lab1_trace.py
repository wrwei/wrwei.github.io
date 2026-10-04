"""Module 01, Lab 1: trace a search, one comparison at a time."""

books = ["Dune", "Foundation", "The Hobbit", "Dune"]
target = "The Hobbit"
found = -1

for index, title in enumerate(books):
    print(f"inspect {index}: {title}")
    if title == target:
        found = index
        break

print(f"result: {found}")

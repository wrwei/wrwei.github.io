"""Separate reusable catalogue logic from a command-line interface."""
import argparse

def find_titles(books, query):
    query = query.strip().casefold()
    if not query:
        raise ValueError("query must not be blank")
    return [book for book in books if query in book["title"].casefold()]

def main():
    parser = argparse.ArgumentParser(description="Search a small catalogue")
    parser.add_argument("query", nargs="?", default="dune")
    args = parser.parse_args()
    books = [{"id": 1, "title": "Dune"}, {"id": 2, "title": "Foundation"}]
    for book in find_titles(books, args.query):
        print(f'{book["id"]}: {book["title"]}')
    assert find_titles(books, "FOUND") == [books[1]]
    assert find_titles(books, "missing") == []

if __name__ == "__main__":
    main()

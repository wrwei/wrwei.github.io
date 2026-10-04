"""Boundary validation, normalisation and mutation-free failure cases."""
def validate_book(record):
    if not isinstance(record, dict) or set(record) != {"title", "copies"}:
        raise ValueError("exactly title and copies required")
    if not isinstance(record["title"], str): raise ValueError("text title required")
    title = record["title"].strip()
    if not 1 <= len(title) <= 100: raise ValueError("title length 1..100 required")
    if type(record["copies"]) is not int or not 0 <= record["copies"] <= 100:
        raise ValueError("copies must be an integer in 0..100")
    return {"title": title, "copies": record["copies"]}

good = {"title": "  Dune  ", "copies": 2}
print("normalised:", validate_book(good))
assert good["title"] == "  Dune  "
bad = [{"title": " ", "copies": 1}, {"title": "Dune", "copies": True},
       {"title": "Dune", "copies": -1}, {"title": "Dune", "copies": 1, "admin": True}]
for record in bad:
    try: validate_book(record)
    except ValueError: print("rejected:", repr(record))
    else: raise AssertionError("invalid record accepted")

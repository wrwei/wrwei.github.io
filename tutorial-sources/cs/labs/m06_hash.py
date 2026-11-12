"""A deliberately small chained table makes collisions visible."""
class Table:
    def __init__(self, buckets=4):
        if buckets < 1:
            raise ValueError("positive bucket count required")
        self.buckets = [[] for _ in range(buckets)]
    def slot(self, key):
        return sum(key.encode("utf-8")) % len(self.buckets)
    def put(self, key, value):
        chain = self.buckets[self.slot(key)]
        for i, (stored, _) in enumerate(chain):
            if stored == key:
                chain[i] = (key, value); return
        chain.append((key, value))
    def get(self, key):
        for stored, value in self.buckets[self.slot(key)]:
            if stored == key:
                return value
        raise KeyError(key)

table = Table()
for key, value in [("ab", 1), ("ba", 2), ("c", 3), ("ab", 4)]:
    table.put(key, value)
print("chains:", table.buckets)
assert table.get("ab") == 4 and table.get("ba") == 2
try:
    table.get("missing")
except KeyError:
    print("missing key rejected")

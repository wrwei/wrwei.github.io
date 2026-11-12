"""A direct-mapped, one-word-per-line read cache with no timing simulation."""
def access_trace(addresses, lines=4):
    tags, hits = [None] * lines, 0
    for address in addresses:
        index, tag = address % lines, address // lines
        hit = tags[index] == tag
        hits += int(hit)
        tags[index] = tag
        print(f"address={address} line={index} tag={tag} {'hit' if hit else 'miss'}")
    return hits

print("local reuse")
assert access_trace([0, 1, 0, 1]) == 2
print("conflicting reuse")
assert access_trace([0, 4, 0, 4]) == 0

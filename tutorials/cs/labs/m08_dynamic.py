"""Minimum coin count with reconstruction; impossible values return None."""
def min_coins(coins, amount):
    if amount < 0 or any(c <= 0 for c in coins):
        raise ValueError("nonnegative amount and positive coins required")
    best, previous = [0] + [float("inf")] * amount, [None] * (amount + 1)
    for value in range(1, amount + 1):
        for coin in coins:
            if coin <= value and best[value - coin] + 1 < best[value]:
                best[value] = best[value - coin] + 1; previous[value] = coin
    if best[amount] == float("inf"):
        return None
    selected = []
    while amount:
        coin = previous[amount]
        selected.append(coin); amount -= coin
    return selected

for coins, amount in [([1, 3, 4], 6), ([2, 4], 3), ([1, 3, 4], 0)]:
    result = min_coins(coins, amount)
    print(coins, amount, "->", result)
    if result is not None: assert sum(result) == amount
assert min_coins([1, 3, 4], 6) == [3, 3]
assert min_coins([2, 4], 3) is None

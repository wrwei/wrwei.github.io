"""First script for the mathematical foundations labs; no packages required."""


def square(x):
    return x * x


values = [0, 1, 2]
for index, value in enumerate(values):
    print(f"index={index}, value={value}, square={square(value)}")
print(f"sum(range(4))={sum(range(4))}")
print(f"3**2={3**2}; 3^2={3^2}")
assert square(-3) == 9
assert list(range(1, 5)) == [1, 2, 3, 4]
try:
    result = 1 / 0
except ZeroDivisionError as error:
    print(f"Caught {type(error).__name__}: {error}")

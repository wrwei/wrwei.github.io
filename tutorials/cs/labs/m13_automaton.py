"""DFA recognising binary strings containing an even number of ones."""
def accepts(text):
    state = 0
    for symbol in text:
        if symbol not in "01": raise ValueError("binary alphabet required")
        if symbol == "1": state = 1 - state
    return state == 0

for text in ["", "0", "1", "11", "101", "111"]:
    result = accepts(text)
    print(repr(text), "accepted:", result)
    assert result == (text.count("1") % 2 == 0)
try:
    accepts("102")
except ValueError:
    print("invalid symbol rejected")

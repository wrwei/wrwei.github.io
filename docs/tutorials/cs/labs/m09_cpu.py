"""A tiny 8-bit accumulator machine, not an emulator of a real CPU."""
def run(program):
    pc, acc, memory, steps = 0, 0, [0] * 8, 0
    while steps < 100:
        if not 0 <= pc < len(program):
            raise ValueError("program counter out of bounds")
        op, operand = program[pc]
        print(f"pc={pc} acc={acc:3} execute={op} {operand}")
        pc += 1; steps += 1
        if op == "SET": acc = operand % 256
        elif op == "ADD": acc = (acc + operand) % 256
        elif op == "STORE":
            if not 0 <= operand < len(memory): raise ValueError("invalid address")
            memory[operand] = acc
        elif op == "HALT": return memory
        else: raise ValueError("unknown instruction")
    raise RuntimeError("step limit exceeded")

result = run([("SET", 250), ("ADD", 10), ("STORE", 0), ("HALT", 0)])
print("memory[0]:", result[0])
assert result[0] == 4

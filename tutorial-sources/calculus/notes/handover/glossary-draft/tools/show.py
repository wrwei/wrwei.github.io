import sys, re
lo, hi = int(sys.argv[2]), int(sys.argv[3])
lines = open(sys.argv[1], encoding='utf-8').read().split('\n')
for i in range(lo - 1, min(hi, len(lines))):
    L = lines[i]
    if ' bold: ' in L[:40]:
        L = L[:240]
    else:
        L = L[:900]
    print(L)

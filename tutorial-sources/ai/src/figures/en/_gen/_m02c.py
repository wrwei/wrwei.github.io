# Re-runs Lab 4 (digits MLP, early stopping) and the Section 13 circle loop so the figures show the text's numbers.
import copy, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

def lab4_history():
    np.random.seed(0); torch.manual_seed(0)
    d = load_digits(); Xa, ya = d.data, d.target
    Xt, Xr, yt, yr = train_test_split(Xa, ya, test_size=0.4, stratify=ya, random_state=0)
    Xv, Xe, yv, ye = train_test_split(Xr, yr, test_size=0.5, stratify=yr, random_state=0)
    mean, std = Xt.mean(0), Xt.std(0); sd = np.where(std == 0, 1.0, std)
    P = lambda X: torch.tensor((X - mean) / sd, dtype=torch.float32)
    Xtr, Xva = P(Xt), P(Xv); ytr, yva = torch.tensor(yt), torch.tensor(yv)
    class MLP(nn.Module):
        def __init__(s, d_in=64, h=128, k=10, p=0.0):
            super().__init__()
            s.fc1 = nn.Linear(d_in, h); s.act1 = nn.ReLU(); s.drop1 = nn.Dropout(p)
            s.fc2 = nn.Linear(h, h); s.act2 = nn.ReLU(); s.drop2 = nn.Dropout(p); s.fc3 = nn.Linear(h, k)
        def forward(s, x):
            x = s.drop1(s.act1(s.fc1(x))); x = s.drop2(s.act2(s.fc2(x))); return s.fc3(x)
    seed, epochs, patience, batch = 0, 100, 15, 64
    torch.manual_seed(seed); model = MLP()
    opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    hist = []; best = (float("inf"), 0)
    for ep in range(1, epochs + 1):
        model.train(); order = torch.randperm(len(Xtr)); tot = 0.0
        for s in range(0, len(Xtr), batch):
            idx = order[s:s + batch]
            loss = F.cross_entropy(model(Xtr[idx]), ytr[idx])
            opt.zero_grad(); loss.backward(); opt.step(); tot += loss.item() * len(idx)
        sched.step(); model.eval()
        with torch.no_grad(): vl = F.cross_entropy(model(Xva), yva).item()
        hist.append((tot / len(Xtr), vl))
        if vl < best[0]: best = (vl, ep)
        if ep - best[1] >= patience: break
    return np.array(hist), best

def circle():
    torch.manual_seed(0)
    X = torch.rand(2048, 2) * 2 - 1; T = ((X ** 2).sum(1) < 0.5).long()
    Xtr, Ttr, Xva, Tva = X[:1536], T[:1536], X[1536:], T[1536:]
    mu, sd = Xtr.mean(0), Xtr.std(0); norm = lambda x: (x - mu) / sd
    model = nn.Sequential(nn.Linear(2, 32), nn.GELU(), nn.Linear(32, 32), nn.GELU(), nn.Linear(32, 2))
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-2)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=400)
    for epoch in range(400):
        model.train(); perm = torch.randperm(len(Xtr))
        for i in range(0, len(Xtr), 64):
            idx = perm[i:i + 64]
            loss = F.cross_entropy(model(norm(Xtr[idx])), Ttr[idx])
            opt.zero_grad(); loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0); opt.step()
        sched.step()
    model.eval()
    with torch.no_grad(): acc = (model(norm(Xva)).argmax(1) == Tva).float().mean().item()
    return model, norm, Xva, Tva, Xtr, Ttr, acc

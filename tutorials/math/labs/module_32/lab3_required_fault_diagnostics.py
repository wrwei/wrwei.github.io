"""Four required faults, each demonstrated and repaired on controlled inputs."""
import numpy as np

def sigmoid(z):
    z = np.asarray(z,dtype=float)
    out = np.empty_like(z)
    positive = z>=0
    out[positive] = 1/(1+np.exp(-z[positive]))
    e = np.exp(z[~positive])
    out[~positive] = e/(1+e)
    return out

rng = np.random.default_rng(7)
latent = rng.normal(size=(1000,5))
z1,z2,z3,e1,e2 = latent.T
X = np.column_stack([z1,100*z2,z1+.02*e1,z3,e2])
y = (rng.random(1000)<sigmoid(1.5*z1-2*z2+.5*z3)).astype(int)
split_rng = np.random.default_rng(11)
sizes = np.array([600,200,200])
quotas = sizes*y.sum()/1000
counts = np.floor(quotas).astype(int)
priority = sorted(range(3),key=lambda j:(-(quotas[j]-counts[j]),j))
for j in priority[:int(y.sum()-counts.sum())]:
    counts[j] += 1
blocks = [[] for _ in sizes]
for label,allocations in [(0,sizes-counts),(1,counts)]:
    ids = np.flatnonzero(y==label)
    split_rng.shuffle(ids)
    begin = 0
    for j,count in enumerate(allocations):
        blocks[j].extend(ids[begin:begin+count].tolist())
        begin += count
train,val,test = [np.array(block,dtype=int) for block in blocks]
for ids in (train,val,test):
    split_rng.shuffle(ids)
assert len(set(np.concatenate([train,val,test]).tolist())) == 1000

# 1. Preprocessing leakage: change a held-out value, never a training value.
mean = X[train].mean(0)
changed = X.copy()
changed[val[0],0] += 1e6
assert np.array_equal(changed[train].mean(0),mean)
leaked_change = np.linalg.norm(changed.mean(0)-X.mean(0))
assert leaked_change>999
print('leakage fault: held-out sentinel changes all-data mean by',leaked_change,'; train-only mean unchanged')
# 2. Overflow: preserving the exact finite-logit loss rather than clipping.
z = np.array([-1000.,1000.])
labels = np.array([1.,0.])
with np.errstate(over='ignore',divide='ignore',invalid='ignore'):
    naive_probability = 1/(1+np.exp(-z))
    naive_loss = -labels*np.log(naive_probability)-(1-labels)*np.log(1-naive_probability)
stable_loss = np.maximum(z,0)-labels*z+np.log1p(np.exp(-np.abs(z)))
assert np.isfinite(stable_loss).all()
print('overflow fault: naive losses',naive_loss,'; repaired logit losses',stable_loss)
# 3. Missing mean factor: a smooth numerical check independent of the gradient.
scale = X[train].std(0,ddof=0)
A = np.column_stack([np.ones(12),(X[train[:12]]-mean)/scale])
labels = y[train[:12]]
w = np.linspace(-.2,.3,6)
def objective(v):
    logits = A@v
    return np.mean(np.logaddexp(0,logits)-labels*logits)
g = A.T@(sigmoid(A@w)-labels)/len(labels)
h = 1e-5
numerical = np.array([(objective(w+h*np.eye(6)[j])-objective(w-h*np.eye(6)[j]))/(2*h) for j in range(6)])
correct_error = np.linalg.norm(numerical-g)
wrong_error = np.linalg.norm(numerical-len(labels)*g)
assert correct_error<1e-8 and wrong_error>.1
print(f'mean-factor fault: corrected gradient error={correct_error:.6e}; omitted-factor error={wrong_error:.6e}')
# 4. Prevalence: the same zero rule has an opposite accuracy summary.
for positive in (5,95):
    labels = np.r_[np.ones(positive,dtype=int),np.zeros(100-positive,dtype=int)]
    predicted = np.zeros(100,dtype=int)
    accuracy = np.mean(predicted==labels)
    recall = np.mean(predicted[labels==1]==1)
    print(f'prevalence fault: positives={positive}/100; always-zero accuracy={accuracy:.2f}; positive recall={recall:.2f}')
print('All four faults diagnosed. Seeds define data/generator/draw order; zero-initialised full-batch training itself has no optimiser-seed variation.')

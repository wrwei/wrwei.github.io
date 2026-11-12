"""Exact capstone draw order and stratified split; training-only diagnostics."""
import hashlib
import sys
import numpy as np

def sigmoid(z):
    z = np.asarray(z,dtype=float)
    out = np.empty_like(z)
    positive = z >= 0
    out[positive] = 1/(1+np.exp(-z[positive]))
    e = np.exp(z[~positive])
    out[~positive] = e/(1+e)
    return out

def dataset():
    rng = np.random.default_rng(7)
    latent = rng.normal(size=(1000,5)) # Row-major z1,z2,z3,e1,e2, then uniform labels.
    z1,z2,z3,e1,e2 = latent.T
    X = np.column_stack([z1,100*z2,z1+.02*e1,z3,e2])
    probability = sigmoid(1.5*z1-2*z2+.5*z3)
    y = (rng.random(1000)<probability).astype(int)
    return X,y

def split(y):
    rng = np.random.default_rng(11)
    sizes = np.array([600,200,200])
    quotas = sizes*y.sum()/len(y)
    positive = np.floor(quotas).astype(int)
    remainder = int(y.sum()-positive.sum())
    priority = sorted(range(3),key=lambda j:(-(quotas[j]-positive[j]),j))
    for j in priority[:remainder]:
        positive[j] += 1
    negative = sizes-positive
    blocks = [[] for _ in sizes]
    for label,counts in [(0,negative),(1,positive)]:
        indices = np.flatnonzero(y==label)
        rng.shuffle(indices)
        start = 0
        for j,count in enumerate(counts):
            blocks[j].extend(indices[start:start+count].tolist())
            start += count
    result = []
    for block in blocks:
        indices = np.array(block,dtype=int)
        rng.shuffle(indices)
        result.append(indices)
    assert len(set(np.concatenate(result).tolist())) == len(y)
    assert [len(i) for i in result] == sizes.tolist()
    return result

X,y = dataset()
train,val,test = split(y)
mean,scale = X[train].mean(axis=0),X[train].std(axis=0,ddof=0)
assert np.all(scale>0)
standardised = (X[train]-mean)/scale
raw_s = np.linalg.svd(X[train]-mean,compute_uv=False)
scaled_s = np.linalg.svd(standardised,compute_uv=False)
print('Python',sys.version.split()[0],'; NumPy',np.__version__,'; default_rng PCG64; data seed 7; split seed 11')
print('data SHA256:',hashlib.sha256(X.astype('<f8').tobytes()+y.astype('u1').tobytes()).hexdigest())
print('shape:',X.shape,'; positive labels:',int(y.sum()))
print('split sizes / positives:',[(len(i),int(y[i].sum())) for i in (train,val,test)])
print('training mean:',mean)
print('training scale ddof=0:',scale)
print('centred raw singular values:',raw_s)
print('standardised singular values:',scaled_s,'; numerical rank:',np.linalg.matrix_rank(standardised))
for name,data in [('raw',X[train]),('scaled',standardised)]:
    design = np.column_stack([np.ones(len(data)),data])
    bound = np.linalg.norm(design,2)**2/(4*len(data))
    print(f'{name} unpenalised logistic Hessian upper bound={bound:.6f}; reciprocal={1/bound:.6f}')
print('near dependence is not exact rank deficiency; e1 contributes a small nonzero mode')

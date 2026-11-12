"""Complete NumPy CPU capstone: fixed draw/split, selection, PCA, frozen test.

Mean Bernoulli NLL + lambda/2 * squared slopes; intercept unpenalised.
800 full-batch zero-initialised updates for each predeclared candidate.
Bootstrap intervals are approximate and conditional on observed class counts;
they freeze the fitted predictors rather than refitting the learning procedure.
"""
import argparse
import hashlib
import math
from pathlib import Path
import sys
import numpy as np

def sigmoid(z):
    z = np.asarray(z,dtype=float)
    out = np.empty_like(z)
    positive = z>=0
    out[positive] = 1/(1+np.exp(-z[positive]))
    e = np.exp(z[~positive])
    out[~positive] = e/(1+e)
    return out

def dataset():
    rng = np.random.default_rng(7)
    latent = rng.normal(size=(1000,5))
    z1,z2,z3,e1,e2 = latent.T
    X = np.column_stack([z1,100*z2,z1+.02*e1,z3,e2])
    y = (rng.random(1000)<sigmoid(1.5*z1-2*z2+.5*z3)).astype(int)
    return X,y

def split(y):
    rng = np.random.default_rng(11)
    sizes = np.array([600,200,200])
    quotas = sizes*y.sum()/len(y)
    positive = np.floor(quotas).astype(int)
    priority = sorted(range(3),key=lambda j:(-(quotas[j]-positive[j]),j))
    for j in priority[:int(y.sum()-positive.sum())]:
        positive[j] += 1
    blocks = [[] for _ in sizes]
    for label,counts in [(0,sizes-positive),(1,positive)]:
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
    assert [len(i) for i in result] == [600,200,200]
    return result

def design(X):
    return np.column_stack([np.ones(len(X)),X])

def losses(A,y,w):
    assert A.ndim == 2 and y.shape == (len(A),) and w.shape == (A.shape[1],), 'design, labels and parameters must have the declared shapes'
    z = A@w
    return np.maximum(z,0)-y*z+np.log1p(np.exp(-np.abs(z)))

def objective(A,y,w,penalty):
    return losses(A,y,w).mean()+penalty*np.dot(w[1:],w[1:])/2

def gradient(A,y,w,penalty):
    assert A.ndim == 2 and y.shape == (len(A),) and w.shape == (A.shape[1],), 'avoid unintended label-column broadcasting'
    result = A.T@(sigmoid(A@w)-y)/len(y)
    result[1:] += penalty*w[1:]
    return result

def fit(A,y,validation,val_y,rate,penalty,steps=800):
    w = np.zeros(A.shape[1])
    trace = []
    for t in range(steps+1):
        if t%40 == 0:
            trace.append((t,losses(A,y,w).mean(),losses(validation,val_y,w).mean()))
        if t<steps:
            w -= rate*gradient(A,y,w,penalty)
            assert np.isfinite(w).all()
    return w,trace

X,y = dataset()
train,val,test = split(y)
mean,scale = X[train].mean(0),X[train].std(0,ddof=0)
assert np.all(scale>0)
Z = (X-mean)/scale
_,singular,Vt = np.linalg.svd(Z[train],full_matrices=False)
print('Python',sys.version.split()[0],'; NumPy',np.__version__,'; PCG64 data/split seeds 7/11')
print('data SHA256:',hashlib.sha256(X.astype('<f8').tobytes()+y.astype('u1').tobytes()).hexdigest())
print('split sizes/positives:',[(len(i),int(y[i].sum())) for i in (train,val,test)])
print('training-only standardised singular values:',singular)
print('training-only PCA explained variance ratios:',singular**2/np.sum(singular**2))
# Independent smooth derivative check of the full objective on a controlled subset.
small = design(Z[train[:8]])
small_y = y[train[:8]]
probe = np.linspace(-.2,.3,6)
penalty,step = .03,1e-5
analytic = gradient(small,small_y,probe,penalty)
numeric = np.array([(objective(small,small_y,probe+step*np.eye(6)[j],penalty)-objective(small,small_y,probe-step*np.eye(6)[j],penalty))/(2*step) for j in range(6)])
error = np.linalg.norm(numeric-analytic)
assert error<1e-8
print(f'mean NLL + unpenalised-intercept ridge gradient-check error={error:.6e}; h={step:g}')
# Deliberately unsafe raw-coordinate rate, diagnosed using training only.
raw = design(X[train])
bad = np.zeros(6)
raw_trace = []
for t in range(11):
    raw_trace.append(losses(raw,y[train],bad).mean())
    if t<10:
        bad -= .2*gradient(raw,y[train],bad,0)
print('raw eta=.2 train NLL at 0/1/10:',[raw_trace[j] for j in (0,1,10)])
assert raw_trace[10]>raw_trace[0]

records = []
for rate in (.05,.2,1.):
    for penalty in (0.,.01,.1):
        A,B = design(Z[train]),design(Z[val])
        w,trace = fit(A,y[train],B,y[val],rate,penalty)
        score = losses(B,y[val],w).mean()
        record = {'kind':'full','k':5,'rate':rate,'penalty':penalty,'score':score,'w':w,'trace':trace,'basis':None}
        records.append(record)
        print(f'full rate={rate:g}; lambda={penalty:g}; validation NLL={score:.6f}')
for k in (2,3,4,5):
    basis = Vt[:k].T # ONLY training SVD, no whitening.
    A,B = design(Z[train]@basis),design(Z[val]@basis)
    w,trace = fit(A,y[train],B,y[val],.2,.01)
    score = losses(B,y[val],w).mean()
    records.append({'kind':'PCA','k':k,'rate':.2,'penalty':.01,'score':score,'w':w,'trace':trace,'basis':basis})
    print(f'PCA k={k}; rate=.2; lambda=.01; validation NLL={score:.6f}')
chosen = min(records,key=lambda r:r['score']) # Stable first-grid-entry tie order.
pca_chosen = min((r for r in records if r['kind']=='PCA'),key=lambda r:r['score'])
def config(r):
    return {key:r[key] for key in ('kind','k','rate','penalty')}
print('FROZEN primary choice:',config(chosen))
print('FROZEN PCA comparison:',config(pca_chosen))
baseline_probability = y[train].mean()
print(f'FROZEN baseline probability={baseline_probability:.6f}; threshold=.5; five fixed calibration bins')

def model_design(r,indices):
    features = Z[indices] if r['basis'] is None else Z[indices]@r['basis']
    return design(features)

test_A = model_design(chosen,test)
test_loss = losses(test_A,y[test],chosen['w'])
test_probability = sigmoid(test_A@chosen['w'])
test_correct = (test_probability>=.5)==y[test]
base_loss = -(y[test]*np.log(baseline_probability)+(1-y[test])*np.log1p(-baseline_probability))
base_correct = (baseline_probability>=.5)==y[test]
pca_A = model_design(pca_chosen,test)
print(f'primary test NLL={test_loss.mean():.6f}; accuracy@.5={test_correct.mean():.6f}; Brier={np.mean((test_probability-y[test])**2):.6f}')
print(f'baseline test NLL={base_loss.mean():.6f}; accuracy@.5={base_correct.mean():.6f}')
print(f'frozen PCA test NLL={losses(pca_A,y[test],pca_chosen["w"]).mean():.6f}; no test-based reselection')
predicted = test_probability>=.5
TP = int(np.sum(predicted&(y[test]==1)))
FP = int(np.sum(predicted&(y[test]==0)))
FN = int(np.sum(~predicted&(y[test]==1)))
TN = int(np.sum(~predicted&(y[test]==0)))
print('test TP/FP/FN/TN:',TP,FP,FN,TN)
calibration = []
for j in range(5):
    selected = (test_probability>=j/5)&((test_probability<(j+1)/5) if j<4 else (test_probability<=1))
    count = int(selected.sum())
    if count:
        item = (j,count,float(test_probability[selected].mean()),float(y[test][selected].mean()))
        calibration.append(item)
        print(f'calibration bin {j}: n={count}; mean predicted={item[2]:.6f}; observed fraction={item[3]:.6f}')
    else:
        print(f'calibration bin {j}: empty; no fraction estimate')

rng = np.random.default_rng(32032)
strata = [np.flatnonzero(y[test]==label) for label in (0,1)]
bootstrap = []
for _ in range(1000):
    indices = np.concatenate([rng.choice(group,len(group),replace=True) for group in strata])
    bootstrap.append((test_loss[indices].mean(),test_correct[indices].mean(),(test_loss[indices]-base_loss[indices]).mean()))
intervals = np.quantile(np.array(bootstrap),[.025,.975],axis=0)
print('approximate conditional stratified percentile 95% intervals; 1000 repeats, PCG64 seed32032:')
for j,name in enumerate(('NLL','accuracy','paired NLL difference primary-minus-baseline')):
    print(name,intervals[:,j])
print('Frozen predictions; fixed observed class counts. Intervals omit refitting and prevalence uncertainty; no universal population guarantee.')

# One complete mean update and final prediction trace on the first training row.
first_A = model_design(chosen,train)
g0 = gradient(first_A,y[train],np.zeros(first_A.shape[1]),chosen['penalty'])
w1 = -chosen['rate']*g0
row = first_A[0]
print('trace first training ID:',int(train[0]),'; raw row:',X[train[0]],'; standardised row:',Z[train[0]],'; label:',int(y[train[0]]))
print('trace model row:',row,'; initial z=0,p=.5,loss=log2; row gradient:',(.5-y[train[0]])*row)
print('trace full mean g0:',g0,'; first updated w:',w1,'; first updated probability:',float(sigmoid(np.array([row@w1]))[0]))
print('trace final w:',chosen['w'],'; final row logit:',float(row@chosen['w']),'; probability:',float(sigmoid(np.array([row@chosen['w']]))[0]))

parser = argparse.ArgumentParser()
parser.add_argument('--output')
args = parser.parse_args()
if args.output:
    pieces = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1010" role="img" aria-label="Executed training validation loss curves, fixed-bin test calibration and training singular values"><rect width="1000" height="1010" fill="white"/><g font-family="system-ui" fill="#1a2e4a">']
    def label(x,y,s,size=20,anchor='start'):
        pieces.append(f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}">{s}</text>')
    def line(points,colour):
        path = ' '.join(('M' if j==0 else 'L')+f'{a:.3f},{b:.3f}' for j,(a,b) in enumerate(points))
        pieces.append(f'<path d="{path}" fill="none" stroke="{colour}" stroke-width="3"/>')
    label(500,30,'Actual outputs / 实际输出',24,'middle')
    label(500,70,'Frozen selected model: training / validation NLL',22,'middle')
    pieces.append('<path d="M90,95V285H940" fill="none" stroke="#64748b"/>')
    trace = chosen['trace']
    lower = min(min(row[1:]) for row in trace)-.02
    upper = max(max(row[1:]) for row in trace)+.02
    for index,colour in [(1,'#0284c7'),(2,'#7e22ce')]:
        line([(90+850*t/800,285-190*(row[index]-lower)/(upper-lower)) for row in trace for t in [row[0]]],colour)
    for value in (lower,(lower+upper)/2,upper):
        label(80,290-190*(value-lower)/(upper-lower),f'{value:.3f}',17,'end')
    for t in (0,400,800):
        label(90+850*t/800,310,str(t),18,'middle')
    label(500,343,'Blue train / 蓝训练; purple validation / 紫验证; update index',18,'middle')
    label(500,392,'Frozen test calibration / 冻结测试校准; count per fixed bin',22,'middle')
    pieces.append('<path d="M90,420V650H940" fill="none" stroke="#64748b"/>')
    for j,count,pred,observed in calibration:
        x = 145+160*j
        for off,value,colour in [(0,pred,'#0284c7'),(45,observed,'#7e22ce')]:
            pieces.append(f'<rect x="{x+off}" y="{650-210*value}" width="35" height="{210*value}" fill="{colour}"/>')
        label(x+40,680,f'{j/5:.1f}–{(j+1)/5:.1f}: n={count}',17,'middle')
    for value in (0,.5,1):
        label(80,655-210*value,str(value),18,'end')
    label(500,714,'Blue mean probability; purple observed fraction / 蓝预测均值，紫实际比例',18,'middle')
    label(500,761,'Training-only standardised singular values / 训练标准化奇异值',22,'middle')
    pieces.append('<path d="M90,790V950H940" fill="none" stroke="#64748b"/>')
    logs = np.log10(singular)
    low,high = float(logs.min()-.2),float(logs.max()+.2)
    line([(150+170*j,950-160*(v-low)/(high-low)) for j,v in enumerate(logs)],'#15803d')
    for j,value in enumerate(singular):
        label(150+170*j,978,f'{j+1}: {value:.3f}',18,'middle')
    for value in (low,(low+high)/2,high):
        label(80,955-160*(value-low)/(high-low),f'{value:.2f}',17,'end')
    label(500,1005,'Vertical axis log10(singular value); all five modes retained as numerical evidence',17,'middle')
    pieces.append('</g></svg>')
    Path(args.output).write_text(''.join(pieces),encoding='utf-8')

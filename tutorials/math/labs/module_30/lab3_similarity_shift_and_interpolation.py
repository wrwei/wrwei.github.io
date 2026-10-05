"""Indefinite similarity, changed labels, and zero-training-error diagnosis."""
import numpy as np

bad = np.array([[1.,2.],[2.,1.]])
c = np.array([1.,-1.])
print('symmetric positive-diagonal similarity eigenvalues:', np.linalg.eigvalsh(bad))
print('witness c.T K c:', c@bad@c)
assert c@bad@c < 0
phi = np.array([[1.,0.],[1.,1.],[1.,-1.]])
good = phi@phi.T
print('feature-map Gram eigenvalues:', np.linalg.eigvalsh(good))
assert np.linalg.eigvalsh(good).min() > -1e-12
x = np.array([-1.,1.])
prediction = x>0
source_y = x>0
target_y = x<0
print('same feature masses, changed label mechanism: source accuracy=',np.mean(prediction==source_y),'; target accuracy=',np.mean(prediction==target_y))
print('always-zero accuracy under class-1 prevalence .05/.95:', .95, .05)
t = np.linspace(-1,1,9)
y = 1/(1+25*t*t)
grid = np.linspace(-1,1,1001)
truth = 1/(1+25*grid*grid)
for degree in (2,8):
    design = np.vander(t, degree+1, increasing=True)
    beta = np.linalg.lstsq(design,y,rcond=None)[0]
    fitted = design@beta
    dense = np.vander(grid,degree+1,increasing=True)@beta
    print(f'degree={degree}; training MSE={np.mean((fitted-y)**2):.6e}; dense-grid MSE={np.mean((dense-truth)**2):.6e}')
print('Dense-grid error is a deterministic interpolation diagnostic, not a confidence estimate from an IID test sample.')

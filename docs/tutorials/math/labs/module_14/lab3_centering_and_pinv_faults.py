"""Uncentred directions, evaluation leakage, feature units and weak inverse modes."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)
training = np.array([[10.,0.], [12.,1.], [14.,0.], [16.,1.]])
test = np.array([[100.,10.], [200.,20.]])
mean = training.mean(axis=0)
centered = training-mean
_, _, Vh = np.linalg.svd(centered, full_matrices=False)
_, _, uncentered_Vh = np.linalg.svd(training, full_matrices=False)
leaked_mean = np.vstack((training, test)).mean(axis=0)
print("Correct training mean / leaked combined mean:", mean, leaked_mean)
print("Centred / uncentred leading line projectors:", np.outer(Vh[0], Vh[0]).tolist(), np.outer(uncentered_Vh[0], uncentered_Vh[0]).tolist())
assert not np.allclose(mean, leaked_mean)
assert not np.allclose(np.outer(Vh[0], Vh[0]), np.outer(uncentered_Vh[0], uncentered_Vh[0]))
rescaled = centered*np.array([1.,100.])
_, scaled_s, scaled_Vh = np.linalg.svd(rescaled, full_matrices=False)
print("After feature two multiplied by 100, leading projector:", np.outer(scaled_Vh[0], scaled_Vh[0]).tolist())
print("Scaled leading explained ratio:", scaled_s[0]**2/(scaled_s@scaled_s))

A = np.diag([1., 1e-10])
target = np.array([1., 1e-10])
perturbed = target+np.array([0.,1e-8])
for cutoff in [1e-12,1e-8]:
    inverse = np.linalg.pinv(A, rcond=cutoff)
    base = inverse@target
    changed = inverse@perturbed
    print("Relative cutoff / base / changed weights / new residual:", cutoff, base, changed, format(np.linalg.norm(perturbed-A@changed), ".6e"))
assert np.allclose(np.linalg.pinv(A, rcond=1e-12)@perturbed, [1,101])
assert np.allclose(np.linalg.pinv(A, rcond=1e-8)@perturbed, [1,0])
print("Dropping a weak singular direction trades resolution and residual for reduced amplification; it changes the effective inverse.")

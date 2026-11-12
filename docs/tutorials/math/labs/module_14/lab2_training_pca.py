"""Fit mean and principal directions on training records; reuse on held-out rows."""
import numpy as np
np.set_printoptions(precision=6, suppress=True)
training = np.array([[10.,0.], [12.,1.], [14.,0.], [16.,1.]])
test = np.array([[20.,2.], [8.,-1.]])
mean = training.mean(axis=0)
centered = training-mean
U, s, Vh = np.linalg.svd(centered, full_matrices=False)
directions = Vh.T
scores = centered@directions[:, :1]
reconstruction = scores@directions[:, :1].T+mean
test_scores = (test-mean)@directions[:, :1]
scatter = centered.T@centered
variances = s**2/(len(training)-1)
ratio = s**2/np.sum(s**2)
assert np.allclose(centered.mean(axis=0), 0)
assert np.allclose(scatter@directions, directions*s**2)
print("Training mean:", mean)
print("Principal directions in columns:", directions.tolist())
print("Sample covariance eigenvalues:", variances)
print("Explained variance ratios:", ratio)
print("Training rank-one reconstruction:", reconstruction.tolist())
print("Held-out scores using training transform:", test_scores.ravel())
error_squared = np.linalg.norm(training-reconstruction, "fro")**2
print("Rank-one reconstruction squared error:", error_squared)
assert np.allclose(error_squared, s[1]**2)
changed_test = np.array([[2000.,200.], [-800.,-100.]])
changed_scores = (changed_test-mean)@directions[:, :1]
print("Changed held-out scores using the same training transform:", changed_scores.ravel())
print("Mean reused for both held-out batches:", mean)
print("All-zero centred data variance ratio: undefined; guard division by zero.")

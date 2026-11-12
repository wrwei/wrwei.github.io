"""Generated low-rank matrix with known spectrum and measured truncation error."""
import numpy as np
left = np.column_stack((np.ones(8), [1,-1,1,-1,1,-1,1,-1], [1,1,-1,-1,1,1,-1,-1]))/np.sqrt(8)
right = np.column_stack((np.ones(6)/np.sqrt(6), np.array([1,-1,1,-1,1,-1])/np.sqrt(6), np.array([1,1,-2,1,1,-2])/np.sqrt(12)))
assert np.allclose(left.T@left, np.eye(3)) and np.allclose(right.T@right, np.eye(3))
A = (left*np.array([6., 3., 1.]))@right.T
U, s, Vh = np.linalg.svd(A, full_matrices=False)
print("A / reduced U / s / Vh shapes:", A.shape, U.shape, s.shape, Vh.shape)
print("Singular values:", [round(float(v), 9) for v in s])
print("Original scalar entries:", A.size)
assert np.allclose(s[:3], [6,3,1]) and np.allclose(s[3:], 0)
for k in range(4):
    approximation = (U[:, :k]*s[:k])@Vh[:k, :]
    error_squared = np.linalg.norm(A-approximation, "fro")**2
    tail_squared = s[k:]@s[k:]
    scalar_storage = k*(A.shape[0]+A.shape[1]+1)
    print("Rank / squared Frobenius error / discarded sum / factor scalars:", k, round(float(error_squared), 9), round(float(tail_squared), 9), scalar_storage)
    assert np.allclose(error_squared, tail_squared)
assert np.allclose((U*s)@Vh, A)
print("Scalar-count savings are distinct from file-format overhead or predictive usefulness.")

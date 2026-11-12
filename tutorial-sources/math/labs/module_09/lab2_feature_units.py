"""Neighbour rankings under an explicitly changed coordinate scale."""
import numpy as np

labels = np.array(["P", "Q", "R"])
# Feature 1 measured in hours; feature 2 measured in centimetres.
query = np.array([0.0, 0.0])
candidates = np.array([[1.0, 100.0], [3.0, 0.0], [0.0, 200.0]])

for name, scale in [("hours + centimetres, unweighted", np.array([1.0, 1.0])),
                    ("hours + metres, unweighted", np.array([1.0, 0.01]))]:
    differences = (candidates - query) * scale
    distances = np.linalg.norm(differences, axis=1)
    order = np.argsort(distances, kind="stable")
    print(name)
    print("Euclidean distances:", [round(float(d), 6) for d in distances])
    print("Rank order:", labels[order].tolist())
    l1 = np.abs(differences).sum(axis=1)
    print("Manhattan distances:", l1.tolist(), "; stable tie order:", labels[np.argsort(l1, kind="stable")].tolist())
assert labels[np.argmin(np.linalg.norm(candidates - query, axis=1))] == "Q"
assert labels[np.argmin(np.linalg.norm((candidates - query) * [1, 0.01], axis=1))] == "P"
print("Changing units while leaving numeric weights fixed changes the metric and can change neighbours.")
print("To preserve a chosen metric after conversion, transform its weights consistently.")

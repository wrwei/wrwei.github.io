# Lab 5's synthetic hyperelastic data and fits (copied from the lab so the figures show the lab's numbers).
import numpy as np
from scipy.optimize import least_squares
def g(lam): return lam - lam ** -2.0
def i1m3(lam): return lam ** 2 + 2.0 / lam - 3.0
def p_neo(lam, c1): return 2.0 * c1 * g(lam)
def p_gent(lam, c1, beta): return 2.0 * c1 * g(lam) / (1.0 - beta * i1m3(lam))
np.random.seed(0)
k = np.arange(1, 17)
lam = 1.0 - 0.025 * k
p_true = p_gent(lam, 10.0, 0.2)
sigma = 0.05 + 0.02 * np.abs(p_true)
p_meas = p_true + sigma * np.random.default_rng(1).normal(size=16)
def fit_neo(l, p, s):
    w, gg = 1 / s ** 2, g(l); sgg = np.sum(w * gg ** 2)
    c1 = np.sum(w * p * gg) / (2 * sgg)
    return dict(c1=c1, se=1 / (2 * np.sqrt(sgg)), resid=(p - p_neo(l, c1)) / s)
def fit_gent(l, p, s):
    bmax = (1 - 1e-6) / np.max(i1m3(l))
    sol = least_squares(lambda th: (p - p_gent(l, th[0], th[1])) / s, x0=[5.0, 0.0],
                        bounds=([0, 0], [np.inf, bmax]), x_scale="jac")
    cov = np.linalg.inv(sol.jac.T @ sol.jac)
    return dict(theta=sol.x, cov=cov)
fit20 = fit_neo(lam[:8], p_meas[:8], sigma[:8])
fit_all = fit_neo(lam, p_meas, sigma)
gent_all = fit_gent(lam, p_meas, sigma)
gent_20 = fit_gent(lam[:8], p_meas[:8], sigma[:8])

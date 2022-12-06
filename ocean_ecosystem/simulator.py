import numpy as np

class Simulator(object):
    def __init__(self, noise_impactors, marine_fauna_files):
        self.noise_impactors = noise_impactors
        self.marina_fauna_files = marine_fauna_files
        self.decibels = self.compute_and_add_heatmaps()
    def compute_and_add_heatmaps(self):
        return 10*np.log10(sum([10**(noise_impactor.compute_noise_matrix()/10) for noise_impactor in self.noise_impactors]))
    
    def compute_marina_heatmap(self):
        pass
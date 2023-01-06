import numpy as np
import pandas as pd
import geopandas
from utils import load_config, get_ranges_lon_lat


class Simulator(object):
    config = load_config()
    range_lat, range_lon = get_ranges_lon_lat(config) 
    
    def __init__(self, map, list_noise_impactor, list_marine_fauna):
        assert type(list_marine_fauna) == type(list_noise_impactor) == list, "list_noise_impactor and list_marine_fauna should be lists."
        self.list_noise_impactor = list_noise_impactor
        self.list_marine_fauna = list_marine_fauna
        self.check_list_marine_fauna_is_correct()
        self.map = map
        self.map.compute_and_add_heatmaps(self.list_noise_impactor)
    
    def check_list_marine_fauna_is_correct(self):
        set_marine_fauna = set()
        for marine_fauna in self.list_marine_fauna:
            if marine_fauna.type in set_marine_fauna:
                raise Exception("The list_marine_fauna must contain only different species of marine fauna.")
            set_marine_fauna.add(marine_fauna.type)
        return True
    
    def add_noise_impactor(self, noise_impactor):
        self.list_noise_impactor.append(noise_impactor)
        self.decibels = self.compute_and_add_heatmaps()
        
    def add_marine_fauna(self, marine_fauna):
        self.list_marine_fauna.append(marine_fauna)
        try:
            self.check_list_marine_fauna_is_correct()
        except:
            print("This marine fauna is already in the simulator so it can't be added.")
            self.list_marine_fauna = self.list_marine_fauna[:-1]
        
    def remove_noise_impactor(self, idx):
        noise_impactor = self.list_noise_impactor.pop(idx)
        self.decibels = self.compute_and_add_heatmaps()
        return noise_impactor
        
    def remove_marine_fauna(self, idx):
        return self.list_marine_fauna.pop(idx)
    


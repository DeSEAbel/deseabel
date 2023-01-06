import numpy as np
import geopandas

class MarineFauna(object):
    
    def __init__(self, path_spot_geojson, type, min_freq, max_freq, array_sonor_impact_level):
        self.type = type
        self.spot_gpd = geopandas.read_file(path_spot_geojson).dissolve()  # TODO check if is a True Union of the different polygons
        self.min_freq = min_freq
        self.max_freq = max_freq
        # array_sonor_impact_level is an array of 5 integers corresponding to sonor level in decibels.
        # Each integer indicates the threshold of a certain sonor impact level of the species.
        # 5 levels exist (physiological reaction, acoustic masking, behavioral response, temporal physilogical damages,
        # permanent physiological damages) and the thresholds in the array is a delimiter between them :
        # First element : lower = no impact, higher = at least physiological reaction (level 1)
        # Second element : higher = at least acoustic masking (level 2)
        # Third element : higher = at least behavioral response (level 3)
        # Fourth element : higher = at least temporal physilogical damages (level 4)
        # Fifth element : higher = permanent physilogical damages (level 5)
        assert array_sonor_impact_level.shape[0] == 5, "The number of threshold in the array should be equal to 5."
        self.array_sonor_impact_level = array_sonor_impact_level
        # first index is level 0 (no impact), second index is level 2, etc.
        # Sum of the array must be equal to 1.
        self.array_impact = np.zeros(self.array_sonor_impact_level.shape[0] + 1)
        self.array_impact[0] = 1.
        
    # def quantified_decibel_matrix_by_level(self, matrix_decibel):
    #     matrix_decibel_quantified = np.zeros(matrix_decibel.shape)
    #     for i, level in enumerate(self.array_sonor_impact_level):
    #         matrix_decibel_quantified = np.where(matrix_decibel >= level, i + 1, matrix_decibel_quantified)
    #     return matrix_decibel_quantified
    
    def set_array_impact(self, array_impact):
        assert array_impact.shape[0] == self.array_impact.shape[0], f"The array must have a size of {self.array_impact.shape[0]} not {array_impact.shape[0]}."
        assert np.sum(array_impact) == 1., "The sum of all the elements in array_impact must be equal to 1."
        self.array_impact = array_impact


class Mysticetes(MarineFauna):
    def __init__(self, path_spot_geojson):
        super().__init__(path_spot_geojson, "mysticetes", 10, 10*1e3, np.arange(60, 110, 10))
        
class Odontocetes(MarineFauna):
    def __init__(self, path_spot_geojson):
        super().__init__(path_spot_geojson, "odontocetes", 100, 180*1e3, np.arange(60, 110, 10))
        
class Phocides(MarineFauna):
    def __init__(self, path_spot_geojson):
        super().__init__(path_spot_geojson, "phocides", 100, 100*1e3, np.arange(60, 110, 10))

class Fish(MarineFauna):
    def __init__(self, path_spot_geojson):
        super().__init__(path_spot_geojson, "fish", 50, 300, np.arange(60, 110, 10))
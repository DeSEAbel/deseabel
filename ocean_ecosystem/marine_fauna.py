import numpy as np
import geopandas

class MarineFauna:
    """Object representing marine fauna.
    """
    def __init__(self, path_spot_geojson: str, type: str, min_freq: float, 
                 max_freq: float, array_sonor_impact_level: 'np.ndarray[float,(5)]'):
        """Init function.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
            type (str): The type of the marine fauna.
            min_freq (float): The minimum frequency that can be heard by the species.
            max_freq (float): The maximum frequency that can be heard by the species.
            array_sonor_impact_level (np.ndarray[float,(5)]): An array of 5 integers corresponding to sonor level in decibels.
                Each integer indicates the threshold of a certain sonor impact level of the species.
                5 levels exist (physiological reaction, acoustic masking, behavioral response, temporal physilogical damages,
                permanent physiological damages) and the thresholds in the array is a delimiter between them :
                First element : lower = no impact, higher = at least physiological reaction (level 1)
                Second element : higher = at least acoustic masking (level 2)
                Third element : higher = at least behavioral response (level 3)
                Fourth element : higher = at least temporal physilogical damages (level 4)
                Fifth element : higher = permanent physilogical damages (level 5)
        """
        self.type = type
        self.spot_gpd = geopandas.read_file(path_spot_geojson).explode(index_parts=True).reset_index()
        self.min_freq = min_freq
        self.max_freq = max_freq
        assert array_sonor_impact_level.shape[0] == 5, "The number of threshold in the array should be equal to 5."
        self.array_sonor_impact_level = array_sonor_impact_level
        # first index is level 0 (no impact), second index is level 2, etc.
        # Sum of the array must be equal to 1.
        self.array_impact = np.zeros(self.array_sonor_impact_level.shape[0] + 1)
        self.array_impact[0] = 1.
    
    def set_array_impact(self, array_impact: 'np.ndarray[float, (5)]'):
        """Set the array impact parameter.

        Args:
            array_impact (np.ndarray[float, (5)]): Array with 5 possible impacts.
                Contains the percentage of the total fauna impacted at different levels by the noise.
        """
        assert array_impact.shape[0] == self.array_impact.shape[0], f"The array must have a size of {self.array_impact.shape[0]} not {array_impact.shape[0]}."
        assert np.sum(array_impact) == 1., "The sum of all the elements in array_impact must be equal to 1."
        self.array_impact = array_impact


class Mysticetes(MarineFauna):
    def __init__(self, path_spot_geojson: str):
        """Mysticetes species.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(path_spot_geojson, "mysticetes", 10, 10*1e3, np.arange(60, 110, 10))
        
class Odontocetes(MarineFauna):
    def __init__(self, path_spot_geojson: str):
        """Odontocetes species.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(path_spot_geojson, "odontocetes", 100, 180*1e3, np.arange(60, 110, 10))
        
class Phocides(MarineFauna):
    def __init__(self, path_spot_geojson: str):
        """Phocides species.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(path_spot_geojson, "phocides", 100, 100*1e3, np.arange(60, 110, 10))

class Fish(MarineFauna):
    def __init__(self, path_spot_geojson: str):
        """Fish species.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(path_spot_geojson, "fish", 50, 300, np.arange(60, 110, 10))
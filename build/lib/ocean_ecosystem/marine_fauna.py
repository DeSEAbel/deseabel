import numpy as np
import geopandas
from enum import Enum
from ocean_ecosystem.utils import load_marine_fauna_config

conf = load_marine_fauna_config()


class MarineFauna:
    """Object representing marine fauna."""

    def __init__(
        self,
        path_spot_geojson: str,
        species: str,
        freq_min: float,
        freq_max: float,
        array_sonor_impact_level: "np.ndarray[float,(5)]",
    ):
        """Init function.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
            species (str): The species of the marine fauna.
            freq_min (float): The minimum frequency that can be heard by the species.
            freq_max (float): The maximum frequency that can be heard by the species.
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
        self._species = species
        self.spot_gpd = (
            geopandas.read_file(path_spot_geojson)
            .explode(index_parts=True)
            .reset_index()
        )
        self.freq_min = freq_min
        self.freq_max = freq_max
        assert (
            len(array_sonor_impact_level) == 5
        ), "The number of threshold in the array should be equal to 5."
        self.array_sonor_impact_level = np.array(array_sonor_impact_level)
        # first index is level 0 (no impact), second index is level 2, etc.
        # Sum of the array must be equal to 1.
        self.array_impact = np.zeros(self.array_sonor_impact_level.shape[0] + 1)
        self.array_impact[0] = 1.0

    def set_array_impact(self, array_impact: "np.ndarray[float, (5)]"):
        """Set the array impact parameter.

        Args:
            array_impact (np.ndarray[float, (5)]): Array with 5 possible impacts.
                Contains the percentage of the total fauna impacted at different levels by the noise.
        """
        assert (
            array_impact.shape[0] == self.array_impact.shape[0]
        ), f"The array must have a size of {self.array_impact.shape[0]} not {array_impact.shape[0]}."
        assert (
            np.sum(array_impact) == 1.0
        ), "The sum of all the elements in array_impact must be equal to 1."
        self.array_impact = array_impact

    def __init_subclass__(cls, species: str = None, **kwargs) -> None:
        if species is not None:
            cls.dict_characteristics = conf[species]
            cls._species = species.replace("_", " ")
        return super().__init_subclass__(**kwargs)


class Species(Enum):
    mysticetes = "mysticetes"
    odontocetes = "odontocetes"
    phocides = "phocides"
    fish = "fish"


class Mysticetes(MarineFauna, species=Species.mysticetes.name):
    """Object representing the mysticetes species.
    Its mother class is MarineFauna.
    """

    def __init__(self, path_spot_geojson: str):
        """Init function.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(
            path_spot_geojson,
            self._species,
            self.dict_characteristics["freq_min"],
            self.dict_characteristics["freq_max"],
            self.dict_characteristics["array_sonor_impact_level"],
        )


class Odontocetes(MarineFauna, species=Species.odontocetes.name):
    """Object representing the odontocetes species.
    Its mother class is MarineFauna.
    """

    def __init__(self, path_spot_geojson: str):
        """Init function.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(
            path_spot_geojson,
            self._species,
            self.dict_characteristics["freq_min"],
            self.dict_characteristics["freq_max"],
            self.dict_characteristics["array_sonor_impact_level"],
        )


class Phocides(MarineFauna, species=Species.phocides.name):
    """Object representing the phocides species.
    Its mother class is MarineFauna.
    """

    def __init__(self, path_spot_geojson: str):
        """Init function.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(
            path_spot_geojson,
            self._species,
            self.dict_characteristics["freq_min"],
            self.dict_characteristics["freq_max"],
            self.dict_characteristics["array_sonor_impact_level"],
        )


class Fish(MarineFauna, species=Species.fish.name):
    """Object representing the fish species.
    Its mother class is MarineFauna.
    """

    def __init__(self, path_spot_geojson: str):
        """Init function.

        Args:
            path_spot_geojson (str): Path to geojson coordinates of marine fauna.
        """
        super().__init__(
            path_spot_geojson,
            self._species,
            self.dict_characteristics["freq_min"],
            self.dict_characteristics["freq_max"],
            self.dict_characteristics["array_sonor_impact_level"],
        )

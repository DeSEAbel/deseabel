import numpy as np
from utils import load_noise_impactor_config
from enum import Enum

conf = load_noise_impactor_config()


class NoiseImpactor:
    """Object representing noise impactor."""

    def __init__(
        self,
        id: int,
        lat: float,
        lon: float,
        type: str,
        sound_level: float,
        freq_min: float,
        freq_max: float,
    ):
        """Init function

        Args:
            id (int): The id of the noise impactor.
            lat (float): The latitude.
            lon (float): The longitude.
            type (str): The type of the noise impactor.
            sound_level (float): The sound level of the noise impactor (in decibel).
            freq_min (float): The minimum frequency of the sound produced.
            freq_max (float): The maximum frequency of the sound produced.
        """
        self._id = id
        self.type = type
        self.lat = lat
        self.lon = lon
        self.sound_level = sound_level
        self.freq_min = freq_min
        self.freq_max = freq_max

    def set_sound_level(self, sound_level: float):
        """Set the sound level parameter.

        Args:
            sound_level (float): The sound level to be set (in decibel).
        """
        self.sound_level = sound_level

    def __init_subclass__(cls, type: str = None, **kwargs) -> None:
        if type is not None:
            cls.dict_characteristics = conf[type]
            cls.type = type.replace("_", " ")
        return super().__init_subclass__(**kwargs)


class Boat(NoiseImpactor):
    """Object representing a boat.
    Its mother class is NoiseImpactor.
    """

    def __init__(
        self,
        id: int,
        lat: float,
        lon: float,
        type: str,
        freq_min: float,
        freq_max: float,
        speed_max: float,
        speed: float,
        length: float,
        length_min: float,
        length_max: float,
    ):
        """Init function.

        Args:
            id (int): The id of the boat.
            lat (float): The latitude.
            lon (float): The longitude.
            type (str): The type of the noise impactor.
            freq_min (float): The minimum frequency of the sound produced (in hertz).
            freq_max (float): The maximum frequency of the sound produced (in hertz).
            speed_max (float): The speed max of the boat (in knot).
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
            length_min (float): The mminimum length of the boat (in meters).
            length_max (float): The maximum length of the boat (in meters).
        """
        super().__init__(id, lat, lon, type, 0, freq_min, freq_max)
        # Define all possible values of the speed.
        self.speed_array = np.arange(1, speed_max + 1)
        self.speed_max = speed_max
        self.speed = speed
        self.length = length
        self.length_min = length_min
        self.length_max = length_max
        self.set_speed(speed)  # use a specific function in case this is out of bounds
        self.set_length(length)  # Use a specific function in case this is out of bounds

    def set_length(self, length: float):
        """Set the length of the boat.

        Args:
            length (float): The length to be set (in meters).
        """
        self.length = (
            length
            if self.length_min < length
            else self.length_max
            if self.length_max < length
            else self.length_min
        )
        self.set_sound_level()

    def set_speed(self, speed: float):
        """Set the speed of the boat.

        Args:
            speed (float): The speed to be set (in knot)
        """
        self.speed = (
            speed if 0 < speed else self.speed_max if self.speed_max < speed else 0
        )
        self.set_sound_level()

    def set_sound_level(self):
        """Set the sound level of the boat. The formula to compute its sound level is based on its length and speed."""
        SLi = []
        dl = self.length**1.15 / 3643
        D13 = 2 ** (1 / 3)
        Fc = [12.4]
        f = Fc[0]
        df = 8.1
        SLs0 = -10 * np.log10(
            10.0 ** (-1.06 * np.log10(f) - 14.34)
            + 10.0 ** (3.32 * np.log10(f) - 24.425)
        )
        for ii in range(16):
            Fc.append(Fc[ii] * D13)
            f = Fc[ii + 1]
            SLs0 = -10 * np.log10(
                10.0 ** (-1.06 * np.log10(f) - 14.34)
                + 10.0 ** (3.32 * np.log10(f) - 24.425)
            )
            if f <= 28.4:
                df = 8.1
            else:
                df = 22.3 - 9.77 * np.log10(f)
            SLi.append(
                (SLs0)
                + 60 * np.log10(self.speed / 12)
                + 20 * np.log10(self.length / 300)
                + df * dl
                + 3
            )
        self.sound_level = np.mean(SLi)


class Types(Enum):
    fishing_boat = "fishing_boat"
    commercial_ship = "commercial_ship"
    outboard_pleasure_boat = "outboard_pleasure_boat"
    high_speed_ship = "high_speed_ship"
    jetski = "jetski"
    pile_driving = "pile_driving"
    seismic_probing = "seismic_probing"
    drilling = "drilling"
    wind_turbine = "wind_turbine"


class FishingBoat(Boat, type=Types.fishing_boat.name):
    """Object representing a fishing boat.
    Its mother class is Boat.
    """

    def __init__(self, id: str, lat: float, lon: float, speed: float, length: float):
        """Init function.

        Args:
            id (int): The id of the boat.
            lat (float): The latitude.
            lon (float): The longitude.
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
            speed_max=self.dict_characteristics["speed_max"],
            speed=speed,
            length=length,
            length_min=self.dict_characteristics["length_min"],
            length_max=self.dict_characteristics["length_max"],
        )


class CommercialShip(Boat, type=Types.commercial_ship.name):
    """Object representing a commercial ship.
    Its mother class is Boat.
    """

    def __init__(self, id: str, lat: float, lon: float, speed: float, length: float):
        """Init function.

        Args:
            id (int): The id of the boat.
            lat (float): The latitude.
            lon (float): The longitude.
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type.replace("_", " "),
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
            speed_max=self.dict_characteristics["speed_max"],
            speed=speed,
            length=length,
            length_min=self.dict_characteristics["length_min"],
            length_max=self.dict_characteristics["length_max"],
        )


class OutboardPleasureBoat(Boat, type=Types.outboard_pleasure_boat.name):
    """Object representing a outboard pleasure boat.
    Its mother class is Boat.
    """

    def __init__(self, id: str, lat: float, lon: float, speed: float, length: float):
        """Init function.

        Args:
            id (int): The id of the boat.
            lat (float): The latitude.
            lon (float): The longitude.
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
            speed_max=self.dict_characteristics["speed_max"],
            speed=speed,
            length=length,
            length_min=self.dict_characteristics["length_min"],
            length_max=self.dict_characteristics["length_max"],
        )


class JetSki(Boat, type=Types.jetski.name):
    """Object representing a jetski.
    Its mother class is Boat.
    """

    def __init__(self, id: str, lat: float, lon: float, speed: float, length: float):
        """Init function.

        Args:
            id (int): The id of the boat.
            lat (float): The latitude.
            lon (float): The longitude.
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
            speed_max=self.dict_characteristics["speed_max"],
            speed=speed,
            length=length,
            length_min=self.dict_characteristics["length_min"],
            length_max=self.dict_characteristics["length_max"],
        )


class HighSpeedShip(Boat, type=Types.high_speed_ship.name):
    """Object representing a high speed boat.
    Its mother class is Boat.
    """

    def __init__(self, id: str, lat: float, lon: float, speed: float, length: float):
        """Init function.

        Args:
            id (int): The id of the boat.
            lat (float): The latitude.
            lon (float): The longitude.
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
            speed_max=self.dict_characteristics["speed_max"],
            speed=speed,
            length=length,
            length_min=self.dict_characteristics["length_min"],
            length_max=self.dict_characteristics["length_max"],
        )


class PileDriving(NoiseImpactor, type=Types.pile_driving.name):
    """Object representing a pile driving.
    Its mother class is NoiseImpactor.
    """

    def __init__(self, id: int, lat: float, lon: float):
        """Init function.

        Args:
            id (int): The id of the noise impactor.
            lat (float): The latitude.
            lon (float): The longitude.
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            sound_level=self.dict_characteristics["sound_level_mean"],
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
        )


class WindTurbine(NoiseImpactor, type=Types.wind_turbine.name):
    """Object representing a wind turbine.
    Its mother class is NoiseImpactor.
    """

    def __init__(self, id: int, lat: float, lon: float):
        """Init function.

        Args:
            id (int): The id of the noise impactor.
            lat (float): The latitude.
            lon (float): The longitude.
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            sound_level=self.dict_characteristics["sound_level_mean"],
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
        )


class Drilling(NoiseImpactor, type=Types.drilling.name):
    """Object representing a drilling.
    Its mother class is NoiseImpactor.
    """

    def __init__(self, id: int, lat: float, lon: float):
        """Init function.

        Args:
            id (int): The id of the noise impactor.
            lat (float): The latitude.
            lon (float): The longitude.
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            sound_level=self.dict_characteristics["sound_level_mean"],
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
        )


class SeismicProbing(NoiseImpactor, type=Types.seismic_probing.name):
    """Object representing a seismic probing.
    Its mother class is NoiseImpactor.
    """

    def __init__(self, id: int, lat: float, lon: float):
        """Init function.

        Args:
            id (int): The id of the noise impactor.
            lat (float): The latitude.
            lon (float): The longitude.
        """
        super().__init__(
            id,
            lat,
            lon,
            self.type,
            sound_level=self.dict_characteristics["sound_level_mean"],
            freq_min=self.dict_characteristics["freq_min"],
            freq_max=self.dict_characteristics["freq_max"],
        )

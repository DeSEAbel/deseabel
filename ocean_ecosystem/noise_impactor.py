import numpy as np


class NoiseImpactor:
    """Object representing noise impactor.
    """
    def __init__(self, lat: float, lon: float, type: str, 
                 sound_level: float, min_freq: float, max_freq: float):
        """Init function

        Args:
            lat (float): The latitude.
            lon (float): The longitude.
            type (str): The type of the noise impactor.
            sound_level (float): The sound level of the noise impactor (in decibel).
            min_freq (float): The minimum frequency of the sound produced.
            max_freq (float): The maximum frequency of the sound produced.
        """
        self.type = type
        self.lat = lat
        self.lon = lon
        self.sound_level = sound_level
        self.min_freq = min_freq
        self.max_freq = max_freq
    
    def set_sound_level(self, sound_level: float):
        """Set the sound level parameter.

        Args:
            sound_level (float): The sound level to be set (in decibel).
        """
        self.sound_level = sound_level


class Boat(NoiseImpactor):
    """Object representing a boat.
    Its mother class is NoiseImpactor.
    """
    def __init__(self, lat: float, lon: float, type: str, min_freq: float, max_freq: float, 
                 speed_max: float, speed: float, length: float, length_min: float, length_max: float):
        """Init function.

        Args:
            lat (float): The latitude.
            lon (float): The longitude.
            type (str): The type of the noise impactor.
            min_freq (float): The minimum frequency of the sound produced (in hertz).
            max_freq (float): The maximum frequency of the sound produced (in hertz).
            speed_max (float): The speed max of the boat (in knot).
            speed (float): The actual speed of the boat (in knot).
            length (float): The actual length of the boat (in meters).
            length_min (float): The mminimum length of the boat (in meters).
            length_max (float): The maximum length of the boat (in meters).
        """
        super().__init__(lat, lon, type, 0, min_freq, max_freq)
        # Define all possible values of the speed.
        self.speed_array = np.arange(1, speed_max+1)
        self.speed_max = speed_max
        self.speed = speed
        self.length = length
        self.length_min = length_min
        self.length_max = length_max
        self.set_speed(speed)  # use a specific function in case this is out of bounds
        self.set_length(length) # Use a specific function in case this is out of bounds
 
    def set_length(self, length: float):
        """Set the length of the boat.

        Args:
            length (float): The length to be set (in meters).
        """
        self.length = length if self.length_min < length else self.length_max if self.length_max < length else self.length_min
        self.set_sound_level()
        
    def set_speed(self, speed: float):
        """Set the speed of the boat.

        Args:
            speed (float): The speed to be set (in knot)
        """
        self.speed = speed if 0 < speed else self.speed_max if self.speed_max < speed else 0
        self.set_sound_level()
    
    # def set_sound_level(self):
    #     reference_sound_power = 10**-12 # Watts
    #     reference_length = 1 # square meter

    #     boat_sound_power = 0.11 * self.speed + 0.0053 * self.length # Watts
    #     self.sound_level = 10 * np.log10(boat_sound_power / reference_sound_power) + 2 * np.log10(self.length / reference_length)
        
    def set_sound_level(self):
        """Set the sound level of the boat. The formula to compute its sound level is based on its length and speed.
        """
        SLi = []
        dl = self.length ** 1.15 / 3643
        D13 = 2 ** (1/3)
        Fc = [12.4]
        f = Fc[0]
        df = 8.1
        SLs0 = -10 * np.log10(10. ** (-1.06 * np.log10(f) - 14.34) + 10.**(3.32 * np.log10(f)-24.425))
        for ii in range(16):
            Fc.append(Fc[ii] * D13)
            f=Fc[ii+1]
            SLs0= -10 * np.log10 (10. ** (-1.06 * np.log10(f) - 14.34) + 10.**(3.32 * np.log10(f) - 24.425))
            if f <= 28.4:
                df = 8.1
            else:
                df = 22.3 - 9.77 * np.log10(f)
            SLi.append((SLs0) + 60 * np.log10(self.speed / 12) + 20 * np.log10(self.length / 300) + df * dl + 3)
        self.sound_level = np.mean(SLi)


# TODO Create a config file for all the parameters of noise impactors and marine fauna
class Cargo(Boat):
    def __init__(self, lat: float, lon: float, speed: float, length: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
            speed (float): _description_
            length (float): _description_
        """
        super().__init__(lat, lon, "cargo", min_freq=1, max_freq=10*1e3, speed_max=30, speed=speed,
                         length=length, length_min=20*4, length_max=80*10)

class FishingBoat(Boat):
    def __init__(self, lat: float, lon: float, speed: float, length: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
            speed (float): _description_
            length (float): _description_
        """
        super().__init__(lat, lon, "fishing_boat", min_freq=1, max_freq=10*1e3, speed_max=20, speed=speed,
                         length=length, length_min=10*4, length_max=50*10)

class PleasureBoat(Boat):
    def __init__(self, lat: float, lon: float, speed: float, length: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
            speed (float): _description_
            length (float): _description_
        """
        super().__init__(lat, lon, "pleasure_boat", min_freq=10, max_freq=30*1e3, speed_max=30, speed=speed,
                         length=length, length_min=4*2, length_max=20*5)

class OutboardBoat(Boat):
    def __init__(self, lat: float, lon: float, speed: float, length: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
            speed (float): _description_
            length (float): _description_
        """
        super().__init__(lat, lon, "outboard_boat", min_freq=10, max_freq=30*1e3, speed_max=20, speed=speed,
                         length=length, length_min=4*2, length_max=15*5)
         

class PileDriving(NoiseImpactor):
    def __init__(self, lat: float, lon: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
        """
        super().__init__(lat, lon, "pile_driving", initial_sound_level=230, min_freq=10, max_freq=100*1e3)


class MilitarSonar(NoiseImpactor):
    def __init__(self, lat: float, lon: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
        """
        super().__init__(lat, lon, "militar_sonar", initial_sound_level=240, min_freq=100, max_freq=10*1e3)

    
class SeismicTesting(NoiseImpactor):
    def __init__(self, lat: float, lon: float):
        """_summary_

        Args:
            lat (float): _description_
            lon (float): _description_
        """
        super().__init__(lat, lon, "seismic_testing", initial_sound_level=250, min_freq=8, max_freq=16)

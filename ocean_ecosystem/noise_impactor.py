import numpy as np


class NoiseImpactor(object):

    def __init__(self, lat, lon, type, sound_level, min_freq, max_freq):
        self.type = type
        self.lat = lat
        self.lon = lon
        self.sound_level = sound_level
        self.min_freq = min_freq
        self.max_freq = max_freq
    
    def set_sound_level(self, sound_level):
        self.sound_level = sound_level


class Boat(NoiseImpactor):
    def __init__(self, lat, lon, type, min_freq, max_freq, speed_max, speed, flotation_surface, flotation_surface_min, flotation_surface_max):
        super().__init__(lat, lon, type, 0, min_freq, max_freq)
        self.speed_array = np.arange(1, speed_max+1)
        self.speed_max = speed_max
        self.speed = speed
        self.flotation_surface = flotation_surface
        self.flotation_surface_min = flotation_surface_min
        self.flotation_surface_max = flotation_surface_max
        self.set_speed(speed)  # in case this is out of bound
        self.set_flotation_surface(flotation_surface) # in case this is out of bound
 
    def set_flotation_surface(self, flotation_surface):
        self.flotation_surface = flotation_surface if self.flotation_surface_min < flotation_surface else self.flotation_surface_max if self.flotation_surface_max < flotation_surface else self.flotation_surface_min
        self.set_sound_level()
        
    def set_speed(self, speed):
        self.speed = speed if 0 < speed else self.speed_max if self.speed_max < speed else 0
        self.set_sound_level()
    
    def set_sound_level(self):
        reference_sound_power = 10**-12 # Watts
        reference_flotation_surface = 1 # square meter

        boat_sound_power = 0.11 * self.speed + 0.0053 * self.flotation_surface # Watts
        self.sound_level = 10 * np.log10(boat_sound_power / reference_sound_power) + 2 * np.log10(self.flotation_surface / reference_flotation_surface)
        
    
# TODO faire un fichier de configuration pour les différents paramètres
class Cargo(Boat):
    def __init__(self, lat, lon, speed, flotation_surface):
        super().__init__(lat, lon, "cargo", min_freq=1, max_freq=10*1e3, speed_max=30, speed=speed,
                         flotation_surface=flotation_surface, flotation_surface_min=20*4, flotation_surface_max=80*10)

class FishingBoat(Boat):
    def __init__(self, lat, lon, speed, flotation_surface):
        super().__init__(lat, lon, "fishing_boat", min_freq=1, max_freq=10*1e3, speed_max=20, speed=speed,
                         flotation_surface=flotation_surface, flotation_surface_min=10*4, flotation_surface_max=50*10)

class PleasureBoat(Boat):
    def __init__(self, lat, lon, speed, flotation_surface):
        super().__init__(lat, lon, "pleasure_boat", min_freq=10, max_freq=30*1e3, speed_max=30, speed=speed,
                         flotation_surface=flotation_surface, flotation_surface_min=4*2, flotation_surface_max=20*5)

class OutboardBoat(Boat):
    def __init__(self, lat, lon, speed, flotation_surface):
        super().__init__(lat, lon, "outboard_boat", min_freq=10, max_freq=30*1e3, speed_max=20, speed=speed,
                         flotation_surface=flotation_surface, flotation_surface_min=4*2, flotation_surface_max=15*5)
         

class PileDriving(NoiseImpactor):
    def __init__(self, lat, lon):
        super().__init__(lat, lon, "pile_driving", initial_sound_level=230, min_freq=10, max_freq=100*1e3)


class MilitarSonar(NoiseImpactor):
    def __init__(self, lat, lon):
        super().__init__(lat, lon, "militar_sonar", initial_sound_level=240, min_freq=100, max_freq=10*1e3)

    
class SeismicTesting(NoiseImpactor):
    def __init__(self, lat, lon):
        super().__init__(lat, lon, "seismic_testing", initial_sound_level=250, min_freq=8, max_freq=16)

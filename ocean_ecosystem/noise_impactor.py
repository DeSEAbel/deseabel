import numpy as np
from math import pi
from utils import load_config


class NoiseImpactor(object):
    
    config = load_config()
    range_lat = np.arange(config["min_latitude"], config["max_latitude"], 0.02)
    range_long = np.arange(config["min_longitude"], config["max_longitude"], 0.003)
        
    def __init__(self, lat, long, type, speed_max, speed, length):
        self.type = type
        self.lat = lat
        self.long = long
        self.speed_array = np.arange(1,speed_max+1)
        self.speed = speed
        self.length = length
        self.maille_TL = self.compute_decibels_matrix()

    def compute_decibels_matrix(self):
        latrad1 = self.lat * pi / 180
        lonrad1 = self.long * pi / 180
        maille_dist = np.zeros((len(self.range_lat), len(self.range_long)))
        for i, lat_cur in enumerate(self.range_lat):
            for j, long_cur in enumerate(self.range_long):
                latrad2 = lat_cur * pi / 180
                lonrad2 = long_cur * pi / 180
                londif = np.abs(lonrad2-lonrad1)
                raddis = np.arccos(np.sin(latrad2)*np.sin(latrad1) + np.cos(latrad2)*np.cos(latrad1) * np.cos(londif));
                nautdis = raddis * 3437.74677
                stdiskm = nautdis * 1.852
                maille_dist[i,j] = 1000*stdiskm
        
        maille_dist = np.where(maille_dist == 0, 1, maille_dist)
        maille_TL = 20 * np.log10(maille_dist)

        return maille_TL

    def compute_SLi(self):
        Fc = []
        SLi = np.zeros((16, len(self.speed_array)))
        dl = self.length ** 1.15 / 3643
        D13 = 2 ** (1/3)
        Fc.append(12.4)
        f = Fc[0]
        df = 8.1
        SLs0 = -10 * np.log10(10.**(-1.06 * np.log10(f) - 14.34) + 10.**(3.32 * np.log10(f) - 24.425))
        SLi[1,:]= SLs0 +60*np.log10(self.speed_array/12) + 20 * np.log10(self.length/300) + df*dl+3 
        for ii in range(0, 16):
            Fc.append(Fc[ii] * D13)
            f = Fc[ii+1]
            SLs0 = -10 * np.log10(10.**(-1.06 * np.log10(f) - 14.34) + 10.**(3.32 * np.log10(f) - 24.425))
            if f <= 28.4:
                df = 8.1
            else:
                df = 22.3 - 9.77 * np.log10(f)
            SLi[ii] = SLs0 + 60 * np.log10(self.speed_array/12) + 20 * np.log10(self.length/300) + df * dl + 3
        return SLi

    def compute_noise_matrix(self):
        if self.speed > 0:
            SL = np.mean(self.compute_SLi(), 0)
            RL = SL[self.speed] - self.maille_TL
        else:
            SL = 210
            RL = SL - self.maille_TL
        return RL[::-1,:]


    
    
class Boat(NoiseImpactor):
    def __init__(self, lat, long, type, speed_max, speed, length):
        super().__init__(lat, long, type, speed_max, speed, length)
        
    def set_speed(self, speed):
        self.speed = speed
    
    
class Cargo(Boat):
    def __init__(self, lat, long, speed):
        super().__init__(lat, long, "boat", speed_max=30, speed=speed, length=200)


class FishingBoat(Boat):
    def __init__(self, lat, long, speed):
        super().__init__(lat, long, "fishing_boat", speed_max=20, speed=speed, length=25)
        
        
class PileDriving(NoiseImpactor):
    def __init__(self, lat, long):
        super().__init__(lat, long, "pile_driving", speed_max=0, speed=0, length=0)

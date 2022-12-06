class MarineFauna(object):
    def __init__(self, lat, long, type):
        self.type = type
        self.lat = lat
        self.long = long
        
    def compute_impact_noise(self):
        return
        
        
class Cetacean(MarineFauna):
    def __init__(self, lat, long):
        super().__init__(lat, long, type="cetacean")
        

class Fish(MarineFauna):
    def __init__(self, lat, long):
        super().__init__(lat, long, type="fish")
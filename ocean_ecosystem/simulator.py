from marine_map import MarineMap
from noise_impactor import NoiseImpactor
from marine_fauna import MarineFauna
from typing import List


class Simulator:
    """Object representing the simulation of a marine ecosystems with noise impactors and marine fauna on a map.
    """
    def __init__(self, map: MarineMap, list_noise_impactor: List[NoiseImpactor], list_marine_fauna: List[MarineFauna]):
        """Init function.

        Args:
            map (MarineMap): A marine map object.
            list_noise_impactor (List[NoiseImpactor]): The list of all the noise impactors to be on the map.
            list_marine_fauna (List[MarineFauna]): The list of all the marine species to be on the map.
        """
        assert type(list_marine_fauna) == type(list_noise_impactor) == list, "list_noise_impactor and list_marine_fauna should be lists."
        self.list_noise_impactor = list_noise_impactor
        self.list_marine_fauna = list_marine_fauna
        self.check_list_marine_fauna_is_correct()
        self.map = map
        self.update_and_add_heatmaps()
    
    def check_list_marine_fauna_is_correct(self) -> bool:
        """Checks if there is not two times a same marine fauna added in the simulator environment.
        Indeed, both examples must be merge and not splitted if they come from the same species.

        Raises:
            Exception: 2 MarineFauna object have the same type.
        """
        set_marine_fauna = set()
        for marine_fauna in self.list_marine_fauna:
            if marine_fauna.type in set_marine_fauna:
                raise Exception("The list_marine_fauna must contain only different species of marine fauna.")
            set_marine_fauna.add(marine_fauna.type)
    
    def add_noise_impactor(self, noise_impactor: NoiseImpactor):
        """Adds a noise impactor into the internal list of noise impactors.

        Args:
            noise_impactor (NoiseImpactor): The noise impactor to be added.
        """
        self.list_noise_impactor.append(noise_impactor)
        self.decibels = self.update_and_add_heatmaps()
        
    def add_marine_fauna(self, marine_fauna: MarineFauna):
        """Adds a marine fauna into the internal list of marine fauna.

        Args:
            marine_fauna (MarineFauna): The marine fauna to be added.
        """
        self.list_marine_fauna.append(marine_fauna)
        try:
            self.check_list_marine_fauna_is_correct()
        except:
            print("This marine fauna is already in the simulator so it can't be added.")
            self.list_marine_fauna = self.list_marine_fauna[:-1]
        
    def remove_noise_impactor(self, idx: int) -> NoiseImpactor:
        """Removes a noise impactor from the internal list of noise impactors.

        Args:
            idx (int): The index of the noise impactor to be removed.

        Returns:
            NoiseImpactor: The removed noise impactor.
        """
        noise_impactor = self.list_noise_impactor.pop(idx)
        self.decibels = self.update_and_add_heatmaps()
        return noise_impactor
        
    def remove_marine_fauna(self, idx: int) -> MarineFauna:
        """Removes a marine fauna from the internal list of marine fauna.

        Args:
            idx (int): The index of the marine fauna to be removed.

        Returns:
            NoiseImpactor: The removed marine fauna.
        """
        return self.list_marine_fauna.pop(idx)
    
    def get_marine_fauna_by_type(self, type: str) -> MarineFauna:
        """Given a type, it returns the corresponding marine fauna from the internal list.

        Args:
            type (str): The type of the marine fauna to be returned.

        Raises:
            Exception: The marine fauna type is not in the list.

        Returns:
            MarineFauna: The marine fauna object.
        """
        for marine_fauna in self.list_marine_fauna:
            if marine_fauna.type == type:
                return marine_fauna
        raise Exception(f"The marine fauna {type} is not in the simulator.")
    
    def update_and_add_heatmaps(self):
        """Updates the heatmaps of the internal map considering the list of noise impactors.
        """
        self.map.update_and_add_heatmaps(self.list_noise_impactor)
        
    def update_marine_fauna_impact(self, type: str):
        """Given a marine fauna type, it updates the impact of this species considering the decibal matrix produced by the noise impactors.

        Args:
            type (str): The type of the marine fauna to be updated.
        """
        marine_fauna = self.get_marine_fauna_by_type(type)
        self.map.update_marine_fauna_impact(marine_fauna)


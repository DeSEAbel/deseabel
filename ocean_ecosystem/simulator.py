from ocean_ecosystem.marine_map import MarineMap
from ocean_ecosystem.noise_impactor import NoiseImpactor
from ocean_ecosystem.marine_fauna import MarineFauna
from typing import List


class Simulator:
    """Object representing the simulation of a marine ecosystems with noise impactors and marine fauna on a map."""

    def __init__(
        self,
        map: MarineMap,
        list_noise_impactor: List[NoiseImpactor],
        list_marine_fauna: List[MarineFauna],
    ):
        """Init function.

        Args:
            map (MarineMap): A marine map object.
            list_noise_impactor (List[NoiseImpactor]): The list of all the noise impactors to be on the map.
            list_marine_fauna (List[MarineFauna]): The list of all the marine species to be on the map.
        """
        assert (
            type(list_marine_fauna) == type(list_noise_impactor) == list
        ), "list_noise_impactor and list_marine_fauna should be lists."
        self.list_noise_impactor = list_noise_impactor
        self.list_marine_fauna = list_marine_fauna
        # Checks if there is not two times a same marine fauna added in the simulator environment.
        # Indeed, both examples must be merge and not splitted if they come from the same species.
        set_marine_fauna = set()
        for marine_fauna in self.list_marine_fauna:
            if marine_fauna._species in set_marine_fauna:
                raise Exception(
                    "The list_marine_fauna must contain only different species of marine fauna."
                )
            set_marine_fauna.add(marine_fauna._species)
        self.map = map
        self.update_and_add_heatmaps()
            
    def check_marine_fauna_exists(self, species: str) -> bool:
        """
        Checks if a marine fauna species exists in the environment.
    
        Args:
            species (str): The noise impactor we want to check if it exists.

        Returns:
            bool: True if the marine fauna exists, otherwise False.
        """
        for marine_fauna in self.list_marine_fauna:
            if marine_fauna._species == species:
                return True
        return False        
    
    def check_noise_impactor_exists(self, id: int) -> bool:
        """
        Checks if a noise impactor exists in the environment.
    
        Args:
            id (int): The id of the noise impactor we want to check if it exists.

        Returns:
            bool: True if the noise impactor already exists, otherwise False.
        """
        for noise_impactor_tmp in self.list_noise_impactor:
            if noise_impactor_tmp._id == id:
                return True
        return False

    def add_noise_impactor(self, noise_impactor: NoiseImpactor):
        """Adds a noise impactor into the internal list of noise impactors.

        Args:
            noise_impactor (NoiseImpactor): The noise impactor to be added.
        """
        if self.check_noise_impactor_exists(noise_impactor):
            print(f"The noise impactor with id={noise_impactor._id} already exists.")
        else:
            self.list_noise_impactor.append(noise_impactor)
            self.decibels = self.update_and_add_heatmaps()

    def add_marine_fauna(self, marine_fauna: MarineFauna):
        """Adds a marine fauna into the internal list of marine fauna.

        Args:
            marine_fauna (MarineFauna): The marine fauna to be added.
        """
        if self.check_marine_fauna_exists(marine_fauna._species):
            print("This marine fauna is already in the simulator so it can't be added.")
        else:
            self.list_marine_fauna.append(marine_fauna)

    def remove_noise_impactor(self, id: int) -> NoiseImpactor:
        """Removes a noise impactor given its id from the internal list of noise impactors.

        Args:
            id (int): The id of the noise impactor to remove.

        Returns:
            NoiseImpactor: The removed noise impactor. If the noise impactor doesn't exist it returns None.
        """
        exists = False
        for idx, noise_impactor in enumerate(self.list_noise_impactor):
            if noise_impactor._id == id:
                exists = True
                break
        if not exists:
            print(f"The noise impactor with id={id} doesn't exist.")
            return None
        noise_impactor = self.list_noise_impactor.pop(idx)
        self.decibels = self.update_and_add_heatmaps()
        return noise_impactor

    def remove_marine_fauna(self, species: str) -> MarineFauna:
        """Removes a marine fauna from the internal list of marine fauna.

        Args:
            species (str): The index of the marine fauna to be removed.

        Returns:
            NoiseImpactor: The removed marine fauna.
        """
        exists = False
        for idx, marine_fauna in enumerate(self.list_marine_fauna):
            if marine_fauna._species == species:
                exists = True
                break
        if not exists:
            print(f"The {species} marine fauna doesn't exist.")
            return None
        return self.list_marine_fauna.pop(idx)

    def get_marine_fauna_by_species(self, species: str) -> MarineFauna:
        """Given a species, it returns the corresponding marine fauna from the internal list.

        Args:
            species (str): The species of the marine fauna to be returned.

        Raises:
            Exception: The marine fauna species is not in the list.

        Returns:
            MarineFauna: The marine fauna object.
        """
        for marine_fauna in self.list_marine_fauna:
            if marine_fauna._species == species:
                return marine_fauna
        raise Exception(f"The marine fauna {species} is not in the simulator.")

    def update_and_add_heatmaps(self):
        """Updates the heatmaps of the internal map considering the list of noise impactors."""
        self.map.update_and_add_heatmaps(self.list_noise_impactor)

    def update_marine_fauna_impact(self, species: str):
        """Given a marine fauna species, it updates the impact of this species considering the decibal matrix produced by the noise impactors.

        Args:
            species (str): The species of the marine fauna to be updated.
        """
        marine_fauna = self.get_marine_fauna_by_species(species)
        self.map.update_marine_fauna_impact(marine_fauna)

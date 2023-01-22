import numpy as np
import pandas as pd
import geopandas
from ocean_ecosystem.noise_impactor import NoiseImpactor
from ocean_ecosystem.marine_fauna import MarineFauna
from typing import List, Tuple

from ocean_ecosystem.matrix_conversion import (
    get_hash_coordinates_lonlat_to_xy,
    get_or_save_conversion_metadata_in_json_with_metadata_in_filename,
    get_hash_coordinates_lonlat_to_xy,
    get_xy_from_hash_coordinates_lonlat,
    get_hash_coordinates_lonlat_to_decibel_from_matrix,
)


class MarineMap:
    """Object representing a marine map."""

    def __init__(
        self,
        width: int,
        height: int,
        step: int,
        longitude_west: float,
        latitude_north: float,
    ) -> None:
        """Init function.

        Args:
            width (int): The width of the map.
            height (int): The height of the map.
            step (int): The step between each position in the map (in meters).
            longitude_west (float): The maximum longitude on the west.
            latitude_north (float): The maximum latitude on the North.
        """
        self.width = width
        self.height = height
        self.step = step
        self.longitude_west = longitude_west
        self.latitude_north = latitude_north
        self.update_map()
        self.matrix_decibel_impact_quantified = np.zeros(self.matrix_decibel.shape)
        self.matrix_decibel_impact_quantified_gpd = None

    def update_map(self):
        """Update the matrix of decibels, the has dictionary of longitude / latitude to x and y coordinates,
        the metadata of the map and the hash dictionary from longitude / latitude to the corresponding decibel.
        """
        # Update the matrix of decibels considering the width, height and step
        self.matrix_decibel = np.zeros(
            (self.width // self.step, self.height // self.step)
        )
        # Update the hash dictionary from longitude / latitude to x and y coordinates
        self.hash_coordinates_lonlat_to_xy = get_hash_coordinates_lonlat_to_xy(
            width=self.width,
            height=self.height,
            step=self.step,
            longitude_west=self.longitude_west,
            latitude_north=self.latitude_north,
        )
        # Update the metadata of the map : "width": width, height, step, longitude_west,
        # latitude_north, longitude_est, latitude_south, longitude_west_to_est,  latitude_north_to_south
        self.metadata = (
            get_or_save_conversion_metadata_in_json_with_metadata_in_filename(
                width=self.width,
                height=self.height,
                step=self.step,
                longitude_west=self.longitude_west,
                latitude_north=self.latitude_north,
            )
        )
        # Update the hash dictionary from longitude / latitude to the corresponding decibel
        self.hash_coordinates_lonlat_to_decibel = (
            get_hash_coordinates_lonlat_to_decibel_from_matrix(
                self.matrix_decibel, self.hash_coordinates_lonlat_to_xy
            )
        )

    def compute_distance_matrix(
        self, x0: float, y0: float
    ) -> "np.ndarray[Tuple[float, float]]":
        """Compute all the distances in a matrix to a specific point (x0, y0).

        Args:
            x0 (float): The x axis of the point.
            y0 (float): The y axis of the point.

        Returns:
            np.ndarray[Tuple[float, float]]: The matrix containing all the distances from the point (x0, y0).
        """
        x, y = np.meshgrid(
            range(self.matrix_decibel.shape[0]), range(self.matrix_decibel.shape[1])
        )
        return np.sqrt((x - x0) ** 2 + (y - y0) ** 2) * self.step

    def compute_decibel_matrix_with_propagation(
        self, x0: float, y0: float, sound_level: float
    ) -> "np.ndarray[Tuple[float, float]]":
        """Return the matrix of decibels considering the sound propagation from a source point (x0, y0) and a specific sound level.

        Args:
            x0 (float): The x axis of the point.
            y0 (float): The y axis of the point.
            sound_level (float): The sound level.

        Returns:
            np.ndarray[Tuple[float, float]]: The decibel matrix with the starting point (x0, y0) and a specific sound level.
        """
        # Get the distance matrix from (x0, y0)
        matrix_distance = self.compute_distance_matrix(x0, y0)
        # Set the null distance to 1 to avoid infinite value from log operation.
        matrix_distance = np.where(matrix_distance == 0, 1, matrix_distance)
        # Apply the diminition of the sound considering the distance from the source.
        matrix_decibel = sound_level - 20 * np.log10(matrix_distance)
        return matrix_decibel

    def update_and_add_heatmaps(self, list_noise_impactor: List[NoiseImpactor]):
        """Update the matrix_decibel and matrix_decibel_gdp parameters by computing the total decibels emited by several noise impactors.
        The formula is 10 * log10( 10^(x / 10) + 10^(x2 / 10) + ... + 10^(xn / 10) ) with x1, x2, ..., xn all the sounds in decibels to be added.

        Args:
            list_noise_impactor (List[NoiseImpactor]): A list of noise impactors used to compute the total decibels matrix.
        """
        self.matrix_decibel.fill(0)
        for noise_impactor in list_noise_impactor:
            # Get the x0 and y0 of the noise impactor
            x0, y0 = get_xy_from_hash_coordinates_lonlat(
                noise_impactor.lon,
                noise_impactor.lat,
                self.metadata,
                self.hash_coordinates_lonlat_to_xy,
            )
            # Compute and add the sound propagation from the source x0 and y0
            self.matrix_decibel += 10 ** (
                self.compute_decibel_matrix_with_propagation(
                    x0, y0, noise_impactor.sound_level
                )
                / 10
            )
        self.matrix_decibel = 10 * np.log10(self.matrix_decibel)
        self.matrix_decibel_gpd = self.matrix_decibel_to_geopandas(self.matrix_decibel)

    def matrix_decibel_to_geopandas(
        self, matrix_decibel: "np.ndarray[Tuple[float, float]]"
    ) -> geopandas.GeoDataFrame:
        """Transform a Pandas decibels matrix to a GeoPandas matrix.

        Args:
            matrix_decibel (np.ndarray[Tuple[float, float]]): The decibel matrix of the map.

        Returns:
            geopandas.GeoDataFrame: The decibel matrix in the geopandas format.
        """
        df_res = pd.DataFrame(matrix_decibel)
        # Change column and row names
        df_res.columns = self.metadata["longitude_west_to_est"]
        df_res["lat"] = self.metadata["latitude_north_to_south"]
        # Transform the matrix in 3 columns
        df_res = df_res.melt(id_vars=["lat"], var_name="lon", value_name="value")
        # Convert to geopandas
        df_res = geopandas.GeoDataFrame(
            df_res, geometry=geopandas.points_from_xy(df_res.lon, df_res.lat)
        )
        return df_res

    def quantify_decibel_matrix_by_level(
        self, marine_fauna: MarineFauna
    ) -> "np.ndarray[Tuple[int, int]]":
        """Return the quantification of the decibels matrix of a specific species.

        Args:
            marine_fauna (MarineFauna): A marine fauna species.

        Returns:
            np.ndarray[Tuple[int, int]]: The quandtified matrix of decibels.
        """
        matrix_decibel_quantified = np.zeros(self.matrix_decibel.shape)
        for i, level in enumerate(marine_fauna.array_sonor_impact_level):
            # Quandtify at each level
            matrix_decibel_quantified = np.where(
                self.matrix_decibel >= level, i + 1, matrix_decibel_quantified
            )
        return matrix_decibel_quantified

    def update_matrix_decibel_impact_quantified(self, marine_fauna: MarineFauna):
        """Update the array of noise impatch for a specific species.

        Args:
            marine_fauna (MarineFauna): A marine fauna species.
        """
        self.matrix_decibel_impact_quantified = self.quantify_decibel_matrix_by_level(
            marine_fauna
        )
        self.matrix_decibel_impact_quantified_gpd = self.matrix_decibel_to_geopandas(
            self.matrix_decibel_impact_quantified
        )

    def get_coords_xy_from_geopandas(
        self, gdf: geopandas.GeoDataFrame
    ) -> 'np.ndarray[Tuple[float, float], ("N", 2)]':
        """Take a GeoPandas dataframe to return the coordinates of all point in the map into a matrix.

        Args:
            gdf (geopandas.GeoDataFrame): _description_

        Returns:
            np.ndarray[Tuple[float, float], ("N", 2)]: The matrix containing the different coordinates from the GeoPandas Dataframe.
        """
        # Function used o
        def get_coords_xy(polygon):
            return [
                get_xy_from_hash_coordinates_lonlat(
                    lon, lat, self.metadata, self.hash_coordinates_lonlat_to_xy
                )
                for lon, lat, _ in list(polygon.exterior.coords)
            ]

        # Apply the function to the 'geometry' column of the GeoDataFrame
        coords = gdf["geometry"].apply(get_coords_xy).explode()
        # Remove the point out-of-scope from the matrix
        return np.array(coords[coords != (-1, -1)].tolist())

    def update_marine_fauna_impact(self, marine_fauna: MarineFauna):
        """Update the the array of impacts on a specific species.

        Args:
            marine_fauna (MarineFauna): A marine fauna species.
        """
        self.update_matrix_decibel_impact_quantified(marine_fauna)
        # Define a function that returns the coordinates of a Polygon
        coords = self.get_coords_xy_from_geopandas(marine_fauna.spot_gpd)
        if len(coords) == 0:
            return

        # Create the dictionary containing the counts
        unique, counts = np.unique(
            self.matrix_decibel_impact_quantified[coords[:, 0], coords[:, 1]],
            return_counts=True,
        )
        dict_impact = dict(zip(unique, counts))
        # Create the array of impacts
        array_impact = np.zeros(marine_fauna.array_impact.shape[0])
        # # Compute the marine impact for each level
        for level in range(len(array_impact)):
            array_impact[level] = 0 if level not in dict_impact else dict_impact[level]
        # Compute the percentage of impact
        array_impact = array_impact / array_impact.sum()
        # Set the parameter in the object
        marine_fauna.set_array_impact(array_impact)

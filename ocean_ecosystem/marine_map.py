import numpy as np
import pandas as pd
import geopandas
from matrix_conversion import get_hash_coordinates_lonlat_to_xy, get_or_save_conversion_metadata_in_json_with_metadata_in_filename, \
    get_hash_coordinates_lonlat_to_xy, get_xy_from_hash_coordinates_lonlat, get_hash_coordinates_lonlat_to_decibel_from_matrix


class MaritimeMap(object):
    
    def __init__(self, width, height, step, longitude_west, latitude_north) -> None:
        self.width = width
        self.height = height
        self.step = step
        self.longitude_west = longitude_west
        self.latitude_north = latitude_north
        self.update_map()
        self.matrix_decibel_impact_quantified = np.zeros(self.matrix_decibel.shape)
        self.matrix_decibel_impact_quantified_gpd = None

    def update_map(self):
        self.matrix_decibel = np.zeros((self.width // self.step, self.height // self.step))
        self.hash_coordinates_lonlat_to_xy = get_hash_coordinates_lonlat_to_xy(
            width=self.width,
            height=self.height,
            step=self.step,
            longitude_west=self.longitude_west,
            latitude_north=self.latitude_north,
        )
        self.metadata = get_or_save_conversion_metadata_in_json_with_metadata_in_filename(
            width=self.width,
            height=self.height,
            step=self.step,
            longitude_west=self.longitude_west,
            latitude_north=self.latitude_north,
        )
        self.hash_coordinates_lonlat_to_decibel = (
            get_hash_coordinates_lonlat_to_decibel_from_matrix(
                self.matrix_decibel, self.hash_coordinates_lonlat_to_xy
            )
        )
        
    def compute_distance_matrix(self, x0, y0):
        x, y = np.meshgrid(range(self.matrix_decibel.shape[0]), range(self.matrix_decibel.shape[1]))
        return np.sqrt((x - x0) ** 2 + (y - y0) ** 2) * self.step
    
    def compute_decibel_matrix(self, x0, y0, sound_level):
        matrix_distance = self.compute_distance_matrix(x0, y0)
        matrix_distance[matrix_distance == 0] = 1
        matrix_decibel = sound_level - 20 * np.log10(matrix_distance)
        return matrix_decibel
        
    def update_and_add_heatmaps(self, list_noise_impactor):
        for noise_impactor in list_noise_impactor:
            x0, y0 = get_xy_from_hash_coordinates_lonlat(noise_impactor.lon, noise_impactor.lat,
                                                        self.metadata, self.hash_coordinates_lonlat_to_xy)
            matrix_decibel = self.compute_decibel_matrix(x0, y0, noise_impactor.sound_level)
            self.matrix_decibel = self.matrix_decibel + 10 * np.log10(10 ** (matrix_decibel / 10))
        self.matrix_decibel_gpd = self.matrix_decibel_to_geopandas(self.matrix_decibel)
        
    def matrix_decibel_to_geopandas(self, matrix_decibel):
        df_res = pd.DataFrame(matrix_decibel)
        df_res.columns = self.metadata["longitude_west_to_est"]
        df_res["lat"] = self.metadata["latitude_north_to_south"]
        df_res = df_res.melt(id_vars=["lat"],
                             var_name="lon",
                             value_name="value")
        df_res = geopandas.GeoDataFrame(
            df_res, geometry=geopandas.points_from_xy(df_res.lon, df_res.lat)
        )
        return df_res
    
    def quantify_decibel_matrix_by_level(self, marine_fauna):
        matrix_decibel_quantified = np.zeros(self.matrix_decibel.shape)
        for i, level in enumerate(marine_fauna.array_sonor_impact_level):
            matrix_decibel_quantified = np.where(self.matrix_decibel >= level, i + 1, matrix_decibel_quantified)
        return matrix_decibel_quantified
    
    def update_matrix_decibel_impact_quantified(self, marine_fauna):
        self.matrix_decibel_impact_quantified = self.quantify_decibel_matrix_by_level(marine_fauna)
        self.matrix_decibel_impact_quantified_gpd = self.matrix_decibel_to_geopandas(self.matrix_decibel_impact_quantified)
        
    def update_marine_fauna_impact_old(self, marine_fauna):
        self.update_matrix_decibel_impact_quantified(marine_fauna)
        mask = self.matrix_decibel_impact_quantified_gpd.within(marine_fauna.spot_gpd.geometry[0])
        matrix_decibel_impact_quantified_gpd = self.matrix_decibel_impact_quantified_gpd[mask]
        dict_impact = matrix_decibel_impact_quantified_gpd["value"].value_counts().to_dict()
        array_impact = np.zeros(marine_fauna.array_impact.shape[0])
        for level in range(len(array_impact)):
            array_impact[level] = 0 if level not in dict_impact else dict_impact[level]
        array_impact = array_impact / array_impact.sum()
        marine_fauna.set_array_impact(array_impact)
                   
    def update_marine_fauna_impact(self, marine_fauna):
        # Define a function that returns the coordinates of a Polygon
        def get_coords(polygon):
            return [get_xy_from_hash_coordinates_lonlat(lon, lat, self.metadata, \
                                                        self.hash_coordinates_lonlat_to_xy) \
                    for lon, lat, _ in list(polygon.exterior.coords)]

        # Apply the function to the 'geometry' column of the GeoDataFrame
        coords = marine_fauna.spot_gpd['geometry'].apply(get_coords).explode()
        coords = np.array(coords[coords != (-1, -1)].tolist())

        unique, counts = np.unique(self.matrix_decibel_impact_quantified[coords[:, 0], coords[:, 1]], return_counts=True)
        dict_impact = dict(zip(unique, counts))
        array_impact = np.zeros(marine_fauna.array_impact.shape[0])
        for level in range(len(array_impact)):
            array_impact[level] = 0 if level not in dict_impact else dict_impact[level]
        array_impact = array_impact / array_impact.sum()
        marine_fauna.set_array_impact(array_impact)
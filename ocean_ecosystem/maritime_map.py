import numpy as np
import pandas as pd
import geopandas


class MaritimeMap(object):
    
    def __init__(self, x_min, x_max, y_min, y_max, step) -> None:
        self.x_min = x_min
        self.x_max = x_max
        self.y_min = y_min
        self.y_max = y_max
        self.step = step
        self.update_matrix()
        self.matrix_decibel_impact_quantified = np.zeros(self.matrix_decibel.shape)
        self.matrix_decibel_impact_quantified_gpd = None

    def update_matrix(self):
        self.matrix_decibel = np.zeros(((self.y_max - self.y_min) // self.step,
                                (self.x_max - self.x_min) // self.step))
        
    def compute_distance_matrix(self, x0, y0):
        x, y = np.meshgrid(range(self.matrix.shape[0]), range(self.matrix.shape[1]))
        return np.sqrt((x - x0) ** 2 + (y - y0) ** 2) * self.step
    
    def compute_decibel_matrix(self, x0, y0, sound_level):
        matrix_distance = self.compute_distance_matrix(x0, y0)
        matrix_decibel = sound_level - 20 * np.log10(matrix_distance)
        matrix_decibel[x0, y0] = sound_level
        return matrix_decibel
    
    def compute_and_add_heatmaps(self, list_noise_impactor):
        for noise_impactor in list_noise_impactor:
            # TODO geo_...
            x0, y0 = self.geo_coord_to_plan_coord(noise_impactor.lat, noise_impactor.lon)
            matrix_decibel = self.compute_decibel_matrix(x0, y0, noise_impactor.sound_level)
            self.matrix_decibel = self.matrix_decibel + 10 * np.log10(10 ** (matrix_decibel / 10))
        self.matrix_decibel[::-1]  # TODO check if ::-1 is mandatory
        self.matrix_decibel_gpd = self.matrix_decibel_to_geopandas(self.matrix_decibel)
        
    def matrix_decibel_to_geopandas(self, matrix_decibel):
        df_res = pd.DataFrame(matrix_decibel)
        df_res.columns = self.range_lon
        df_res["lat"] = self.range_lat
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
        
    def compute_marine_fauna_impact(self, marine_fauna):
        self.update_matrix_decibel_impact_quantified(marine_fauna)
        mask = self.matrix_decibel_impact_quantified_gpd.within(marine_fauna.spot_gpd.geometry[0])
        matrix_decibel_impact_quantified_gpd = self.matrix_decibel_impact_quantified_gpd[mask]
        dict_impact = matrix_decibel_impact_quantified_gpd["value"].value_counts().to_dict()
        array_impact = np.zeros(marine_fauna.array_impact.shape[0])
        for level in range(len(array_impact)):
            array_impact[level] = 0 if level not in dict_impact else dict_impact[level]
        array_impact = array_impact / array_impact.sum()
        marine_fauna.set_array_impact(array_impact)
                
import pandas as pd
import geopandas
import seaborn
import utils
from noise_impactor import FishingBoat
from simulator import Simulator
import matplotlib.pyplot as plt


if __name__ == "__main__":

    config = utils.load_config()
    boat1 = FishingBoat(lat=45.70, long=-2.1, speed=5)
    boat2 = FishingBoat(lat=45.85, long=-1.75, speed=10)
    boat3 = FishingBoat(lat=46, long=-1.9, speed=7)

    simu = Simulator(noise_impactors=[boat1, boat2, boat3], marine_fauna_files=None)

    hm_total = simu.compute_and_add_heatmaps()

    hm_total_quantified = hm_total.copy()

    val_dead = 62
    val_mean = 55
    val_zen = 51

    hm_total_quantified[hm_total_quantified < val_zen] = 0
    hm_total_quantified[(hm_total_quantified <= val_mean) & (hm_total_quantified >= val_zen)] = 1
    hm_total_quantified[(hm_total_quantified <= val_dead) & (hm_total_quantified >= val_mean)] = 2
    hm_total_quantified[hm_total_quantified > val_dead] = 3

    df_res = pd.DataFrame(hm_total_quantified[::-1])
    df_res.columns = boat1.range_long
    df_res["lat"] = boat1.range_lat
    df_res = df_res.melt(id_vars=["lat"], 
            var_name="lon", 
            value_name="value")

    gdf = geopandas.GeoDataFrame(
        df_res, geometry=geopandas.points_from_xy(df_res.lon, df_res.lat))

    gdf[gdf["value"].isin([1,2,3])].to_file("./data/safe_zone_noeuds.geojson", driver="GeoJSON")
    gdf[gdf["value"].isin([2,3])].to_file("./data/hurt_zone_noeuds.geojson", driver="GeoJSON")
    gdf[gdf["value"] == 3].to_file("./data/dead_zone_noeuds.geojson", driver="GeoJSON")
    
    seaborn.heatmap(hm_total)
    plt.show()
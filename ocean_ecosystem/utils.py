import yaml
import os
import numpy as np


def load_config():
    # Open the file and load the file
    path_conf = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.yaml")
    with open(path_conf) as f:
        return yaml.safe_load(f)


def get_ranges_lon_lat(config):
    range_lat = np.arange(config["min_latitude"], config["max_latitude"], 0.02)
    range_lon = np.arange(config["min_longitude"], config["max_longitude"], 0.003)
    return range_lat, range_lon


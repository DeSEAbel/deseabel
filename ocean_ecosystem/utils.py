import yaml
import os


def load_environment_config():
    # Open the file and load the file
    path_conf = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config/environment_characteristics.yaml")
    with open(path_conf) as f:
        return yaml.safe_load(f)


import os
import yaml

relative_path = os.path.dirname(os.path.realpath(__file__))

def load_marine_fauna_config():
    path_conf = os.path.join(
        relative_path, "config/marine_fauna.yaml"
    )
    with open(path_conf) as f:
        return yaml.safe_load(f)


def load_marine_map_config():
    path_conf = os.path.join(
        relative_path, "config/marine_map.yaml"
    )
    with open(path_conf) as f:
        return yaml.safe_load(f)


def load_noise_impactor_config():
    path_conf = os.path.join(
        relative_path, "config/noise_impactor.yaml"
    )
    with open(path_conf) as f:
        return yaml.safe_load(f)


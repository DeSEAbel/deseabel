import yaml
from yaml.loader import SafeLoader

def load_config():
    # Open the file and load the file
    with open("config.yaml") as f:
        return yaml.load(f, Loader=SafeLoader)
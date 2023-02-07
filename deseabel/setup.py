from setuptools import setup

setup(
    description='The deseabel package',
    url='https://github.com/DeSEAbel/deseabel',
    name="deseabel",
    version="0.0.1",
    packages=["ocean_ecosystem"],
    include_package_data = True,
    package_data={'ocean_ecosystem': ["config/*.yaml"]},
    # package_data = {
    #     '': ['*.yaml'],
    # },
    # data_files=[("deseabel", glob("config/*.yaml"))],
    # data_files=[("/etc/deseabel", [os.path.join(path_conf, 'marine_fauna.yaml'), 
    #                          os.path.join(path_conf, "marine_map.yaml"),
    #                          os.path.join(path_conf, "noise_impactor.yaml")])],
)
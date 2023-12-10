# DeSEAbel: Reducing Ocean Noise Pollution

DeSEAbel is a free and open source application designed to help individuals and organizations monitor and reduce the volume of human-generated noise in the oceans. With its user-friendly interface and powerful features, DeSEAbel empowers you to take action towards protecting our oceans and marine life.

## Key Features

1. **World Map**: Choose from a range of regions on the world map to focus your efforts on specific areas.
2. **Human Activity Marker**s: Plot markers representing human-generated sonor activities such as boats, shipping lanes, and wind turbines, to better understand the sources of noise pollution in your area of interest.
3. **Marine Fauna Plots**: Visualize the presence of marine fauna using geojson data and plot it on the map. This feature allows you to understand the impact of noise pollution on local wildlife populations.

![DeSEAbel Screenshot](img/screen_shot_readme.png)

## How to Use DeSEAbel

To get started with DeSEAbel, simply go to [Deseabel website](https://deseabel.github.io/deseabel/visualization/), select your region of interest on the world map, and start plotting markers and geojson data. With each marker and data plot, you will gain a deeper understanding of the sources of noise pollution and the impact on marine life.

## Contributing to DeSEAbel

DeSEAbel is an open-source application, and we welcome contributions from the community. If you're interested in helping us make DeSEAbel better, please get in touch with us through our GitHub repository.

## Conclusion

The ocean is a critical component of our planet's ecosystem, and human-generated noise pollution is a growing threat to its health. DeSEAbel provides a powerful tool for individuals and organizations to take action towards reducing this threat and protecting our oceans and marine life.

Requirements:

- Python 3.8 or newer.
- Poetry that can be installed following the instructions at this link: https://python-poetry.org/docs/#installation

Go to the deseabel folder and enter this command line to install all the dependencies:

```bash
poetry install
```

# Installation (for developers)

In order to access to the same Python environment as the developers, you should follow the following steps (install pyenv, python, poetry). It's useful as well to install pre-commit hooks to format your code before committing it.

## Install python and poetry

**Install pyenv**

Mac

- Install homebrew
- Install pyenv : `brew install pyenv`

Linux

...

### Mac and Linux

**Install python 3.11.1 in pyenv**

```
git clone https://github.com/pyenv/pyenv-update.git $(pyenv root)/plugins/pyenv-update # Install pyenv-update to have access to the last python versions
pyenv update
pyenv install --list
pyenv install 3.11.1
echo 3.11.1 > ~/.pyenv/version
python3 --version # Make sure that python3 version is 3.11.1
```

**Install poetry**

Follow [instructions](https://python-poetry.org/docs/#installing-with-the-official-installer)

## Install pre-commit hooks

Thanks to pre-commit, you can automatically format your code before committing it.
At the root of the project, run the following command:

```
poetry install
poetry run pre-commit install
```

To commit without formatting your code, use the following command:

```
git commit --no-verify
```

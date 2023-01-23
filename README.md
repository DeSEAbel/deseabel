# SoundInOcean

## Installation

Requierements:
- Python 3.8 or newer.
- Poetry that can be installed following the instructions at this link: https://python-poetry.org/docs/#installation

Go to the deseabel folder and enter this command line to install all the dependencies:
```bash
poetry install
```


# Installation
In order to access to the same Python environment as the developers, you should follow the following steps (install pyenv, python, poetry)

## Install pyenv
Mac
 - Install homebrew
 - Install pyenv : `brew install homebrew`
 
Linux

...

## Install python and poetry
### Mac and Linux

Install python 3.11.1 in pyenv
 ```
git clone https://github.com/pyenv/pyenv-update.git $(pyenv root)/plugins/pyenv-update # Install pyenv-update to have access to the last python versions
pyenv update
pyenv install --list
pyenv install 3.11.1 
echo 3.11.1 > ~/.pyenv/version
python3 --version # Make sure that python3 version is 3.11.1
 ```

Install poetry

Follow [instructions](https://python-poetry.org/docs/#:~:text=Poetry%20requires%20Python%203.7%2B.)



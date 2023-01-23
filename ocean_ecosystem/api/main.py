from fastapi import FastAPI, Request, Depends, \
    HTTPException, Header
from ocean_ecosystem.noise_impactor import FishingBoat, PileDriving, \
    Types as noise_impactor_types
from ocean_ecosystem.simulator import Simulator
from ocean_ecosystem.marine_fauna import Fish, Species as marine_fauna_species
from ocean_ecosystem.marine_map import MarineMap
from ocean_ecosystem.matrix_conversion import *
from ocean_ecosystem.utils import load_marine_map_config
from pydantic import BaseModel
import jwt
from datetime import datetime


app = FastAPI()

set_token = set()

@app.on_event("startup")
async def startup():
    app.state.simulator = {}
    app.state.dict_marine_map = {}
    config_map = load_marine_map_config()
    for zone in config_map.keys():
        marine_map = MarineMap(
            config_map[zone]["width"],
            config_map[zone]["height"],
            config_map[zone]["step"],
            config_map[zone]["longitude_west"],
            config_map[zone]["latitude_north"],
        )
        app.state.dict_marine_map[zone] = marine_map
    app.state.simulator = {}
    # app.state.simulator = Simulator(
    #     marine_map, list_noise_impactor=[], list_marine_fauna=[]
    # )

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the DeSEAbel API !!!"}


def get_simulator(request: Request):
    return request.app.state.simulator


def get_map(request: Request):
    return request.app.state.dict_marine_map


@app.get("/initialize_user")
async def initialize_user(simulator: dict = Depends(get_simulator),
                          map: dict = Depends(get_map)):
    token = jwt.encode({}, str(datetime.now()), algorithm='HS256')
    set_token.add(token)
    simulator[token] = {zone: Simulator(
        map[zone], list_noise_impactor=[], list_marine_fauna=[]
    ) for zone in map.keys()}
    return {"token": token}


def auth_required(token: str = Header(None)):
    if token not in set_token:
        raise HTTPException(status_code=400, detail="Not authenticated")
    return token


@app.get("/show/{zone}")
async def show_simulator(zone: str,
                         token: str = Depends(auth_required),
                         simulator: dict = Depends(get_simulator)):
    return {"noise_impactors": str(simulator[token][zone].list_noise_impactor),
            "marine_faunas": str(simulator[token][zone].list_marine_fauna)}


class BoatParams(BaseModel):
    id: int
    lat: float
    lon: float
    speed: float
    length: float


@app.post("/add_boat/{boat_type}")
async def add_boat(zone: str,
                   boat_type: str,
                   boat_params: BoatParams,
                   token: str = Depends(auth_required),
                   simulator: dict = Depends(get_simulator)):
    if simulator[token][zone].check_noise_impactor_exists(boat_params.id):
        return {"error": f"The boat id={boat_params.id} has not been added in the environment because it already exists."}
    if boat_type == noise_impactor_types.fishing_boat.name:
        boat = FishingBoat(boat_params.id,
                                   boat_params.lat,
                                   boat_params.lon,
                                   boat_params.speed,
                                   boat_params.length)
    else:
        raise HTTPException(status_code=404, detail=f"{boat_type} is unknown.")
    simulator[token][zone].add_noise_impactor(boat)
    return {"message": f"The boat with id={boat_params.id} has been added in the environment."}


@app.delete("/remove_noise_impactor")
async def remove_noise_impactor(zone:str,
                                id: int, 
                                token: str = Depends(auth_required),
                                simulator: dict = Depends(get_simulator)):
    noise_impactor = simulator[token][zone].remove_noise_impactor(id)
    if noise_impactor is None:
        return {"error": f"The noise impactor with id={id} is not in the environment so it can not be removed."}
    return {"message": f"The noise impactor with id={id} has been removed from the environment."}


@app.post("/add_marine_fauna/{species}")
async def add_marine_fauna(zone: str,
                           species: str,
                           geojson_path: str,
                           token: str = Depends(auth_required),
                           simulator: dict = Depends(get_simulator)):
    if species == marine_fauna_species.fish.name:
        # TODO 3S bucket
        if simulator[token][zone].check_marine_fauna_exists(species):
            return {"error": f"The {species} marine fauna has not been added in the environment because the species already exists."}
        marine_fauna = Fish(geojson_path)
        simulator[token][zone].add_marine_fauna(marine_fauna)            
        return {"message": f"The {species} marine fauna has been added in the environment."}
    else:
        raise HTTPException(status_code=404, detail=f"{species} marine fauna is unknown.")
   

@app.delete("/remove_marine_fauna")
async def remove_marine_fauna(zone: str,
                              species: str,
                              token: str = Depends(auth_required),
                              simulator: dict = Depends(get_simulator)):
    marine_fauna = simulator[token][zone].remove_marine_fauna(species)
    if marine_fauna is None:
        return {"error": f"The {species} marine fauna is not in the environment so it can not be removed."}
    return {"message": f"The {species} marine fauna has been removed from the environment."}


@app.post("/update_marine_fauna_impact")
async def marine_fauna_impact(zone: str,
                              species: str,
                              token: str = Depends(auth_required),
                              simulator: dict = Depends(get_simulator)):
    if not simulator[token][zone].check_marine_fauna_exists(species):
        return {"error": f"The {species} marine fauna is not in the environment."}
    simulator[token][zone].update_marine_fauna_impact(species)
    return {"message": "The {species} marine fauna impact has been updated."}


@app.get("/decibel_matrix")
async def marine_fauna_impact(zone: str,
                              token: str = Depends(auth_required),
                              simulator: dict = Depends(get_simulator)):
    return {"result": simulator[token][zone].map.matrix_decibel_gpd.to_json()}


@app.get("/decibel_matrix_impact_quantified")
async def marine_fauna_impact(zone: str,
                              token: str = Depends(auth_required),
                              simulator: dict = Depends(get_simulator)):
    return {"result": simulator[token][zone].map.matrix_decibel_impact_quantified_gpd.to_json()}


@app.get("/percentage_marine_fauna_impact_by_level")
async def marine_fauna_impact(zone: str,
                              species: str,
                              token: str = Depends(auth_required),
                              simulator: dict = Depends(get_simulator)):
    if not simulator[token][zone].check_marine_fauna_exists(species):
        return {"error": f"The {species} marine fauna is not in the environment."}
    marine_fauna = simulator[token][zone].get_marine_fauna_by_species(species)
    return {"result": {level: impact for level, impact in enumerate(marine_fauna.array_impact)}}


import numpy as np
import json
import os


def get_hash_coordinates_xy_to_decibel_from_matrix(decibels_matrix: np.ndarray) -> dict:
    """Get hash coordinates xy to decibel from decibels matrix

    Parameters
    ----------
    decibels_matrix : np.ndarray

    Returns
    -------
    dict
    """
    hash_coordinates_xy_to_decibel = dict()
    for x in range(decibels_matrix.shape[0]):
        for y in range(decibels_matrix.shape[1]):
            hash_coordinates_xy_to_decibel[(x, y)] = decibels_matrix[x, y]
    return hash_coordinates_xy_to_decibel


def get_hash_coordinates_lonlat_to_xy(
    width: int,
    height: int,
    step: int,
    longitude_west: float,
    latitude_north: float,
    precision: int = 4,
) -> dict:
    """Get hash coordinates lonlat to coordinates xy

    Parameters
    ----------
    width : int
        width of the matrix
    height : int
        height of the matrix
    step : int
        step of the matrix (in meters)
    longitude_west : float
        longitude of the west border
    latitude_north : float
        latitude of the north border
    precision : int, optional
        precision of the coordinates, by default 4 decimal

    Returns
    -------
    dict
    """
    earth_radius = 6371000
    longitude_est = longitude_west + (width / earth_radius) * (180 / np.pi) / np.cos(
        latitude_north * np.pi / 180
    )
    latitude_south = latitude_north - (height / earth_radius) * (180 / np.pi)

    longitude_west_to_est = np.round(
        np.linspace(longitude_west, longitude_est, int(width / step)), precision
    )
    latitude_north_to_south = np.round(
        np.linspace(latitude_north, latitude_south, int(height / step)), precision
    )
    hash_coordinates_lonlat_to_coordinates_xy = dict()

    for ix in range(len(longitude_west_to_est) - 1):
        for iy in range(len(latitude_north_to_south) - 1):
            hash_coordinates_lonlat_to_coordinates_xy[
                (
                    longitude_west_to_est[ix],
                    latitude_north_to_south[iy],
                    longitude_west_to_est[ix + 1],
                    latitude_north_to_south[iy + 1],
                )
            ] = (ix, iy)
    return hash_coordinates_lonlat_to_coordinates_xy


def get_hash_coordinates_xy_to_lonlat(
    hash_coordinates_lonlat_to_coordinates_xy: dict,
) -> dict:
    """Get hash coordinates xy to lonlat

    Parameters
    ----------
    hash_coordinates_lonlat_to_coordinates_xy : dict

    Returns
    -------
    dict
    """
    hash_coordinates_xy_to_lonlat = {
        value: key for key, value in hash_coordinates_lonlat_to_coordinates_xy.items()
    }
    return hash_coordinates_xy_to_lonlat


def get_hash_coordinates_lonlat_to_decibel_from_hash(
    hash_coordinates_xy_to_decibel: dict,
    hash_coordinates_lonlat_to_coordinates_xy: dict,
) -> dict:
    """Get hash coordinates lonlat to decibel from hash

    Parameters
    ----------
    hash_coordinates_xy_to_decibel : dict
    hash_coordinates_lonlat_to_coordinates_xy : dict

    Returns
    -------
    dict
    """
    hash_coordinates_lonlat_to_decibel = dict()
    for key, value in hash_coordinates_lonlat_to_coordinates_xy.items():
        hash_coordinates_lonlat_to_decibel[key] = hash_coordinates_xy_to_decibel[value]
    return hash_coordinates_lonlat_to_decibel


def get_hash_coordinates_lonlat_to_decibel_from_matrix(
    decibels_matrix: np.ndarray, hash_coordinates_lonlat_to_coordinates_xy: dict
) -> dict:
    """Get hash coordinates lonlat to decibel from matrix

    Parameters
    ----------
    decibels_matrix : np.ndarray
    hash_coordinates_lonlat_to_coordinates_xy : dict

    Returns
    -------
    dict

    """
    hash_coordinates_lonlat_to_decibel = dict()
    for key, value in hash_coordinates_lonlat_to_coordinates_xy.items():
        hash_coordinates_lonlat_to_decibel[key] = int(decibels_matrix[value])
    return hash_coordinates_lonlat_to_decibel


def get_or_save_conversion_metadata_in_json_with_metadata_in_filename(
    width: int,
    height: int,
    step: int,
    longitude_west: float,
    latitude_north: float,
    precision: int = 4,
    directory: str = None,
) -> None:
    """Get of save conversion metadata in json with metadata in filename
    The function save the metadata in directory if it's not None.
    Parameters
    ----------
    width : int
        width of the matrix
    height : int
        height of the matrix
    step : int
        step of the matrix (in meters)
    longitude_west : float
        longitude of the west border
    latitude_north : float
        latitude of the north border
    precision : int, optional
        precision of the coordinates, by default 4 decimal
    directory : str, optional
        directory to save the json file, by default "data"
    """
    earth_radius = 6371000
    longitude_est = longitude_west + (width / earth_radius) * (180 / np.pi) / np.cos(
        latitude_north * np.pi / 180
    )
    latitude_south = latitude_north - (height / earth_radius) * (180 / np.pi)

    longitude_west_to_est = np.linspace(
        longitude_west, longitude_est, int(width / step)
    )
    latitude_north_to_south = np.linspace(
        latitude_north, latitude_south, int(height / step)
    )

    metadata = {
        "width": width,
        "height": height,
        "step": step,
        "longitude_west": longitude_west,
        "latitude_north": latitude_north,
        "longitude_est": longitude_est,
        "latitude_south": latitude_south,
        "longitude_west_to_est": np.sort(np.round(longitude_west_to_est, precision)).tolist(),
        "latitude_north_to_south": np.sort(np.round(latitude_north_to_south, precision)).tolist(),
    }

    if directory is not None:
        if not os.path.exists(directory):
            os.makedirs(directory)

        with open(
            (
                f"{directory}/conversion_metadata_{width}x{height}_{step}m_"
                f"{longitude_west:.4f}_{latitude_north:.4f}.json"
            ),
            "w",
        ) as outfile:
            json.dump(metadata, outfile)
    else:
        return metadata


def get_decibels_geojson_from_matrix(
    decibels_matrix: np.ndarray, hash_coordinates_lonlat_to_coordinates_xy: dict
) -> dict:
    """Get decibels geojson from matrix

    Parameters
    ----------
    decibels_matrix : np.ndarray
    hash_coordinates_lonlat_to_coordinates_xy : dict

    Returns
    -------
    dict
    """
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [key[0], key[1]],
                            [key[0], key[3]],
                            [key[2], key[3]],
                            [key[2], key[1]],
                            [key[0], key[1]],
                        ]
                    ],
                },
                "properties": {"decibel": int(decibels_matrix[value])},
            }
            for key, value in hash_coordinates_lonlat_to_coordinates_xy.items()
        ],
    }


def get_decibels_geojson(
    hash_coordinates_lonlat_to_decibel: dict,
    sparse: bool = False,
    min_decibel_sparse: int = 0,
) -> None:
    """Get decibels geojson

    Parameters
    ----------
    hash_coordinates_lonlat_to_decibel : dict
    sparse : bool, optional
        if True, only save the decibels that are different from 0, by default False
    min_decibel_sparse : int, optional
    Returns
    -------

    """

    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [key[0], key[1]],
                            [key[0], key[3]],
                            [key[2], key[3]],
                            [key[2], key[1]],
                            [key[0], key[1]],
                        ]
                    ],
                },
                "properties": {"decibel": value},
            }
            for key, value in hash_coordinates_lonlat_to_decibel.items()
            if not sparse or value > min_decibel_sparse
        ],
    }

    return geojson


def save_geojson_with_metadata_in_filename(
    geojson: dict,
    width: int,
    height: int,
    step: int,
    longitude_west: float,
    latitude_north: float,
    directory: str = "data",
):
    """Save geojson with metadata in filename

    Parameters
    ----------
    geojson : dict
    width : int
        width of the matrix
    height : int
        height of the matrix
    step : int
        step of the matrix (in meters)
    longitude_west : float
        longitude of the west border
    latitude_north : float
        latitude of the north border
    directory : str, optional
        directory to save the geojson file, by default "data"

    Returns
    -------

    """
    filename = (
        f"decibels_{width}x{height}_{step}m_{longitude_west:.4f}_"
        f"{latitude_north:.4f}.geojson"
    )
    with open(os.path.join(directory, filename), "w") as f:
        json.dump(geojson, f)


def get_random_decibels_matrix(
    *,
    width=100000,
    height=100000,
    step=1000,
    min_decibels=0,
    max_decibels=250,
):
    """Get random decibels matrix of size width x height with step
    By default, the decibels are between 0 and 250 and the matrix is 100km x 100km with
    a step of 1km

    Parameters
    ----------
    width : int
        width of the matrix
    height : int
        height of the matrix
    step: int
        step of the matrix (in meters)
    min_decibels : int, optional
        min value of the matrix, by default 0
    max_decibels : int, optional
        max value of the matrix, by default 250

    Returns
    -------
    np.ndarray
    """
    return np.random.randint(
        min_decibels,
        max_decibels,
        (int(width / step), int(height / step)),
    )

def get_xy_from_hash_coordinates_lonlat(lon, lat, metadata,  hash_coordinates_lonlat_to_xy):
    longitude_west_to_est = np.array(metadata['longitude_west_to_est'])
    latitude_north_to_south = np.array(metadata['latitude_north_to_south'])
    
    idx_lon_closest = np.searchsorted(longitude_west_to_est, lon)
    idx_lat_closest = np.searchsorted(latitude_north_to_south, lat)
    
    if idx_lon_closest == 0 or idx_lon_closest == len(longitude_west_to_est) or \
        idx_lat_closest == 0 or idx_lat_closest == len(latitude_north_to_south) :
        return -1, -1
    
    lon_closest = longitude_west_to_est[idx_lon_closest]
    lat_closest = latitude_north_to_south[idx_lat_closest]

    if lon > lon_closest:
        lon_closest_min = lon_closest
        lon_closest_max = longitude_west_to_est[idx_lon_closest+1]
    else:
        lon_closest_max = lon_closest
        lon_closest_min = longitude_west_to_est[idx_lon_closest-1]

    if lat > lat_closest:
        lat_closest_min = lat_closest
        lat_closest_max = latitude_north_to_south[idx_lat_closest+1]
    else:
        lat_closest_max = lat_closest
        lat_closest_min = latitude_north_to_south[idx_lat_closest-1]

    return hash_coordinates_lonlat_to_xy[(lon_closest_min, lat_closest_max, lon_closest_max, lat_closest_min)]


if __name__ == "__main__":
    # Example
    width = 100000
    height = 100000
    step = 1000
    longitude_west = -2.40953
    latitude_north = 46.41813

    # Get random decibels matrix
    # ex: [[decibel, decibel, decibel], [decibel, decibel, decibel]]
    decibels_matrix = get_random_decibels_matrix(
        width=width,
        height=height,
        step=step,
        min_decibels=0,
        max_decibels=250,
    )
    # Get hash coordinates lonlat to xy
    # ex: {(lon_west, lat_north, lon_east, lat_south): (x, y)}
    hash_coordinates_lonlat_to_xy = get_hash_coordinates_lonlat_to_xy(
        width=width,
        height=height,
        step=step,
        longitude_west=longitude_west,
        latitude_north=latitude_north,
    )

    # Get hash coordinates lonlat to decibel
    # ex: {(lon_west, lat_north, lon_east, lat_south): decibel}
    hash_coordinates_lonlat_to_decibel = (
        get_hash_coordinates_lonlat_to_decibel_from_matrix(
            decibels_matrix, hash_coordinates_lonlat_to_xy
        )
    )

    # Save conversion metadata in json with metadata in case we want to convert it back
    get_or_save_conversion_metadata_in_json_with_metadata_in_filename(
        width=width,
        height=height,
        step=step,
        longitude_west=longitude_west,
        latitude_north=latitude_north,
        directory="data",
    )

    # Get geojson
    geojson = get_decibels_geojson(hash_coordinates_lonlat_to_decibel, sparse=True)

    # Save geojson with metadata in filename because it's easier to find the file later on
    # and to know what it contains without opening it
    save_geojson_with_metadata_in_filename(
        geojson, width, height, step, longitude_west, latitude_north, directory="data"
    )

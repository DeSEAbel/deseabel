/**
 *
 * @param {number} width - width of the zone of interest in meters
 * @param {number} height - height of the zone of interest in meters
 * @param {number} step - step of the zone of interest in meters
 * @param {number} longitude_west - longitude of the west border of the zone of interest
 * @param {number} latitude_north - latitude of the north border of the zone of interest
 * @param {number} precision - precision of the coordinates after the decimal point
 * @returns - hash_coordinates, longitude_west_to_east, latitude_north_to_south
 */
function getHashCoordinatesLonlatToXy(
    width,
    height,
    step,
    longitude_west,
    latitude_north,
    precision
) {
    console.time("getHashCoordinatesLonlatToXy");
    var earth_radius = 6371000;
    var longitude_est =
        longitude_west +
        ((width / earth_radius) * (180 / Math.PI)) /
            Math.cos((latitude_north * Math.PI) / 180);

    var latitude_south = latitude_north - (height / earth_radius) * (180 / Math.PI);

    var longitude_west_to_east = [];
    for (var i = 0; i <= width; i += step) {
        var longitude_value =
            longitude_west + (i * (longitude_est - longitude_west)) / width;
        longitude_west_to_east.push(longitude_value.toFixed(precision));
    }

    var latitude_north_to_south = [];
    for (var i = 0; i <= height; i += step) {
        var latitude_value =
            latitude_north - (i * (latitude_north - latitude_south)) / height;
        latitude_north_to_south.push(latitude_value.toFixed(precision));
    }

    var hash_coordinates = {};
    for (var i = 0; i < longitude_west_to_east.length - 1; i++) {
        for (var j = 0; j < latitude_north_to_south.length - 1; j++) {
            hash_coordinates[
                String([
                    longitude_west_to_east[i],
                    latitude_north_to_south[j],
                    longitude_west_to_east[i + 1],
                    latitude_north_to_south[j + 1],
                ])
            ] = [i, j];
        }
    }
    console.timeEnd("getHashCoordinatesLonlatToXy");
    return [hash_coordinates, longitude_west_to_east, latitude_north_to_south];
}

/**
 *
 * @param {hash} hash_coordinates
 * @returns
 */
function getHashCoordinatesXyToLonlat(hash_coordinates) {
    console.time("getHashCoordinatesXyToLonlat");
    var hash_coordinates_xy_to_lonlat = {};
    for (var key in hash_coordinates) {
        hash_coordinates_xy_to_lonlat[String(hash_coordinates[key])] = key;
    }
    console.timeEnd("getHashCoordinatesXyToLonlat");
    return hash_coordinates_xy_to_lonlat;
}

function initMatrix(width, height, step) {
    console.time("initMatrix");

    var matrix = [];
    for (var i = 0; i < height / step; i++) {
        matrix[i] = [];
        for (var j = 0; j < width / step; j++) {
            matrix[i][j] = 0;
        }
    }

    console.timeEnd("initMatrix");
    return matrix;
}

function getCoordinatesLonlatList(hash_coordinates_lonlat_to_xy) {
    console.time("getCoordinatesLonlatList");
    var coordinates_lonlat_list = Object.keys(hash_coordinates_lonlat_to_xy).map((x) =>
        x.split(",")
    );
    console.timeEnd("getCoordinatesLonlatList");
    return coordinates_lonlat_list;
}

function getHashCoordinatesLonlatToIndex(hash_coordinates_lonlat_to_xy) {
    console.time("getHashCoordinatesLonlatToIndex");

    var hash_coordinates_lonlat_to_index = {};
    var index = 0;
    for (var key in hash_coordinates_lonlat_to_xy) {
        hash_coordinates_lonlat_to_index[key] = index;
        index++;
    }

    console.timeEnd("getHashCoordinatesLonlatToIndex");
    return hash_coordinates_lonlat_to_index;
}

function getHashCoordinatesXyToIndex(
    hash_coordinates_xy_to_lonlat,
    hash_coordinates_lonlat_to_index
) {
    console.time("getHashCoordinatesXyToIndex");

    var hash_coordinates_xy_to_index = {};
    for (var key in hash_coordinates_xy_to_lonlat) {
        hash_coordinates_xy_to_index[key] =
            hash_coordinates_lonlat_to_index[hash_coordinates_xy_to_lonlat[key]];
    }

    console.timeEnd("getHashCoordinatesXyToIndex");
    return hash_coordinates_xy_to_index;
}

/**
 *
 * @param {number} lat
 * @param {number} lon
 * @param {hash} hash_coordinates_lonlat_to_xy
 * @param {number} precision - precision of the coordinates after the decimal point
 * @returns null or [lon_west, lat_north, lon_east, lat_south]
 */
function findTileFromLonlat(
    longitude,
    latitude,
    hash_coordinates_lonlat_to_xy,
    precision = 5
) {
    var coordinates_lonlat = Object.keys(hash_coordinates_lonlat_to_xy).map((x) =>
        x.split(",").map((y) => parseFloat(y).toFixed(precision))
    );

    for (let i = 0; i < coordinates_lonlat.length; i++) {
        var longitude_west = coordinates_lonlat[i][0];
        var latitude_north = coordinates_lonlat[i][1];
        var longitude_east = coordinates_lonlat[i][2];
        var latitude_south = coordinates_lonlat[i][3];
        if (
            longitude >= longitude_west &&
            longitude <= longitude_east &&
            latitude >= latitude_south &&
            latitude <= latitude_north
        ) {
            return coordinates_lonlat[i];
        }
    }
    return null;
}

function lonLatToScreen(map, lon, lat) {
    var point = map.project(new mapboxgl.LngLat(lon, lat));
    return [point.x, point.y];
}
function lonLatInWater(map, lon, lat) {
    var point = lonLatToScreen(map, lon, lat);
    return pointInScreenInWater(map, point);
}
function pointInScreenInWater(map, point) {
    var features = map.queryRenderedFeatures(point, { layers: ["water"] });
    return features.length > 0;
}

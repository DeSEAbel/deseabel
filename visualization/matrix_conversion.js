function get_hash_coordinates_lonlat_to_xy(
    width,
    height,
    step,
    longitude_west,
    latitude_north,
    precision
) {
    var earth_radius = 6371000;
    var longitude_est =
        longitude_west +
        ((width / earth_radius) * (180 / Math.PI)) /
            Math.cos((latitude_north * Math.PI) / 180);

    var latitude_south = latitude_north - (height / earth_radius) * (180 / Math.PI);

    var longitude_west_to_est = [];
    for (var i = 0; i < int(width / step); i += step) {
        var longitude_value =
            longitude_west + (i * (longitude_est - longitude_west)) / width;
        longitude_west_to_est.push(longitude_value);
    }

    var latitude_north_to_south = [];
    for (var i = 0; i < int(height / step); i += step) {
        var latitude_value =
            latitude_north - (i * (latitude_north - latitude_south)) / height;
        latitude_north_to_south.push(latitude_value);
    }

    var hash_coordinates = {};
    for (var i = 0; i < longitude_west_to_est.length - 1; i++) {
        for (var j = 0; j < latitude_north_to_south.length - 1; j++) {
            hash_coordinates[
                String([
                    longitude_west_to_est[i].toFixed(precision),
                    latitude_north_to_south[j].toFixed(precision),
                    longitude_west_to_est[i + 1].toFixed(precision),
                    latitude_north_to_south[j + 1].toFixed(precision),
                ])
            ] = [i, j];
        }
    }
    return hash_coordinates;
}

function get_hash_coordinates_xy_to_lonlat(hash_coordinates){
    var hash_coordinates_xy_to_lonlat = {};
    for (var key in hash_coordinates) {
        hash_coordinates_xy_to_lonlat[
            String(hash_coordinates[key])
        ] = key;
    }
    return hash_coordinates_xy_to_lonlat;
}


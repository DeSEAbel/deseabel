/**
 *
 * @param {number} lat
 * @param {number} lon
 * @param {hash} hash_coordinates_lonlat
 * @returns null or [lon_west, lat_north, lon_east, lat_south]
 */
function findTileFromLonlat(longitude, latitude, hash_coordinates_lonlat) {
    var coordinates_lonlat = Object.keys(hash_coordinates_lonlat).map((x) =>
        x.split(",").map((y) => parseFloat(y))
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

function computeDecibelMatrixFromXy(x0, y0, decibel, width, height, step) {
    var decibel_matrix = initMatrix(width, height, step);

    for (let y = 0; y < height / step; y++) {
        for (let x = 0; x < width / step; x++) {
            if (x == x0 && y == y0) {
                decibel_matrix[y][x] = decibel;
                continue;
            }

            distance = Math.sqrt((x - x0) ** 2 + (y - y0) ** 2) * step;
            decibel_matrix[y][x] = Math.max(decibel - 20 * Math.log10(distance), 0);
        }
    }

    return decibel_matrix;
}

/**
 * This function sums two decibel matrices and returns the result as a new matrix.
 * The formula is: 10 * log10(10 ^ (m1 / 10) + 10^ (m2 / 10))
 * @param {*} m1
 * @param {*} m2
 * @returns
 */
function sumDecibelMatrices(m1, m2) {
    var decibel_matrix = [];
    for (let x = 0; x < m1.length; x++) {
        decibel_matrix.push([]);
        for (let y = 0; y < m1[0].length; y++) {
            new_decibel =
                10 * Math.log10((10 ^ (m1[x][y] / 10)) + (10 ^ (m2[x][y] / 10)));
            decibel_matrix[x].push(new_decibel);
        }
    }
    return decibel_matrix;
}

function updateDecibelMatrix(
    decibel_matrix,
    decibel,
    coordinates_lonlat,
    hash_coordinates_lonlat,
    width,
    height,
    step
) {
    if (coordinates_lonlat == null) {
        return decibel_matrix;
    }
    console.log(hash_coordinates_lonlat[coordinates_lonlat.join(",")]);
    [x0, y0] = hash_coordinates_lonlat[coordinates_lonlat.join(",")];

    var new_decibel_matrix = computeDecibelMatrixFromXy(
        (x0 = x0),
        (y0 = y0),
        (decibel = decibel),
        (width = width),
        (height = height),
        (step = step)
    );

    return sumDecibelMatrices(decibel_matrix, new_decibel_matrix);
}

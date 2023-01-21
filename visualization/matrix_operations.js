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

/**
 * This funciton compute the decibel matrix from a point (x0, y0) with a given decibel
 *  value.
 * @param {number} x0   - coordinates of the point
 * @param {number} y0    - coordinates of the point
 * @param {number} decibel  - decibel value of the point (x0, y0)
 * @param {number} width    - width of the matrix
 * @param {number} height   - height of the matrix
 * @param {number} step - step of the matrix
 * @returns [decibel_matrix, xy_sorted_by_distance]
 * decibel_matrix: the decibel matrix
 * xy_sorted_by_distance: the coordinates of the points sorted by distance from the
 * point (x0, y0)
 */
function computeDecibelMatrixFromXy(x0, y0, decibel, width, height, step) {
    var decibel_matrix = initMatrix(width, height, step);

    var distances_xy = [];
    for (let y = 0; y < height / step; y++) {
        for (let x = 0; x < width / step; x++) {
            let distance = Math.sqrt((x - x0) ** 2 + (y - y0) ** 2) * step;
            distances_xy.push([distance, x, y]);
            let decibel_xy = decibel - 20 * Math.log10(Math.max(1, distance));
            decibel_matrix[y][x] = Math.max(0, decibel_xy);
        }
    }
    xy_sorted_by_distance = distances_xy
        .sort((a, b) => a[0] - b[0])
        .map((x) => x.slice(1));
    decibel_matrix[y0][x0] = decibel;

    return [decibel_matrix, xy_sorted_by_distance];
}

function add(x, y) {
    return x + y;
}

function substract(x, y) {
    return x - y;
}

/**
 * This function sums two decibel matrices and returns the result as a new matrix.
 * The formula is: 10 * log10(10 ^ (m1 / 10) + 10^ (m2 / 10))
 * @param {*} m1
 * @param {*} m2
 * @returns
 */
function calculateDecibelMatrices(m1, m2, operation = add) {
    // Check if the matrices have the same dimensions
    if (m1.length != m2.length || m1[0].length != m2[0].length) {
        return null;
    }

    var decibel_matrix = [];
    for (let y = 0; y < m1.length; y++) {
        decibel_matrix.push([]);
        for (let x = 0; x < m1[0].length; x++) {
            new_decibel =
                10 *
                Math.log10(operation(10 ** (m1[y][x] / 10), 10 ** (m2[y][x] / 10)));
            decibel_matrix[y].push(new_decibel);
        }
    }
    return decibel_matrix;
}

/**
 *
 * @param {list} decibel_matrix
 * @param {number} decibel
 * @param {list} coordinates_lonlat  [lon_west, lat_north, lon_east, lat_south]
 * @param {hash} hash_coordinates_lonlat_to_xy
 * @param {number} width in meters
 * @param {number} height in meters
 * @param {number} step in meters
 * @returns
 */
function updateDecibelMatrix(
    decibel_matrix,
    decibel,
    coordinates_lonlat,
    hash_coordinates_lonlat_to_xy,
    width,
    height,
    step,
    operation = add
) {
    if (coordinates_lonlat == null) {
        return decibel_matrix;
    }
    [x0, y0] = hash_coordinates_lonlat_to_xy[coordinates_lonlat.join(",")];

    var [new_decibel_matrix, xy_sorted_by_distance] = computeDecibelMatrixFromXy(
        (x0 = x0),
        (y0 = y0),
        (decibel = decibel),
        (width = width),
        (height = height),
        (step = step)
    );

    updated_decibel_matrix = calculateDecibelMatrices(
        decibel_matrix,
        new_decibel_matrix,
        operation
    );

    return [updated_decibel_matrix, xy_sorted_by_distance];
}

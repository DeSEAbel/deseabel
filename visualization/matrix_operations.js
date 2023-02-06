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

// define global variables that define the last xy and decibel updated
var last_xy_updated = null;
var last_new_decibel_matrix = null;
var last_operation = null;
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
    operation = "add"
) { 
    last_decibel_used = decibel;
    
    if (operation == "add"){
        operation = add;
    }else{
        operation = substract;
    }
    if (coordinates_lonlat == null) {
        return decibel_matrix;
    }
    [x0, y0] = hash_coordinates_lonlat_to_xy[coordinates_lonlat.join(",")];
    
    // check if x0 and y0 are the same as the last updated
    if (last_xy_updated != null && last_xy_updated[0] == x0 && last_xy_updated[1] == y0 && operation == add){
        decibel_matrix = calculateDecibelMatrices(
            decibel_matrix,
            last_new_decibel_matrix,
            substract
        );
    }
    
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
    
    // set the last variables
    last_new_decibel_matrix = new_decibel_matrix;
    last_operation = operation;
    last_xy_updated = [x0, y0];
        
    return [updated_decibel_matrix, xy_sorted_by_distance];
}


function computeSoundLevel(length, speed) {
    let SLi = [];
    let dl = Math.pow(length, 1.15) / 3643;
    let D13 = Math.pow(2, 1/3);
    let Fc = [12.4];
    let f = Fc[0];
    let df = 8.1;
    let SLs0 = -10 * Math.log10(
      Math.pow(10, -1.06 * Math.log10(f) - 14.34) +
      Math.pow(10, 3.32 * Math.log10(f) - 24.425)
    );
  
    for (let ii = 0; ii < 16; ii++) {
      Fc.push(Fc[ii] * D13);
      f = Fc[ii + 1];
      SLs0 = -10 * Math.log10(
        Math.pow(10, -1.06 * Math.log10(f) - 14.34) +
        Math.pow(10, 3.32 * Math.log10(f) - 24.425)
      );
      if (f <= 28.4) {
        df = 8.1;
      } else {
        df = 22.3 - 9.77 * Math.log10(f);
      }
      SLi.push(
        SLs0 + 60 * Math.log10(speed / 12) +
        20 * Math.log10(length / 300) + df * dl + 3
      );
    }
  
    return SLi.reduce((sum, item) => sum + item) / SLi.length;
  }
  
  
  
  
  
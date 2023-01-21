class ZoneOfInterest {
    constructor(width, height, step, longitude_west, latitude_north, precision = 5) {
        this.width = width;
        this.height = height;
        this.step = step;
        this.longitude_west = longitude_west;
        this.latitude_north = latitude_north;
        this.precision = precision;

        this.initZoneOfInterest();
    }

    initZoneOfInterest() {
        console.time("initZoneOfInterest");

        [
            this.hash_coordinates_lonlat_to_xy,
            this.longitude_west_to_east,
            this.latitude_north_to_south,
        ] = getHashCoordinatesLonlatToXy(
            this.width,
            this.height,
            this.step,
            this.longitude_west,
            this.latitude_north,
            this.precision
        );
        this.hash_coordinates_xy_to_lonlat = getHashCoordinatesXyToLonlat(
            this.hash_coordinates_lonlat_to_xy
        );

        this.longitude_east =
            this.longitude_west_to_east[this.longitude_west_to_east.length - 1];
        this.latitude_south =
            this.latitude_north_to_south[this.latitude_north_to_south.length - 1];
        this.coordinates_lonlat_list = getCoordinatesLonlatList(
            this.hash_coordinates_lonlat_to_xy
        );

        this.hash_coordinates_lonlat_to_index = getHashCoordinatesLonlatToIndex(
            this.hash_coordinates_lonlat_to_xy
        );
        this.hash_coordinates_xy_to_index = getHashCoordinatesXyToIndex(
            this.hash_coordinates_xy_to_lonlat,
            this.hash_coordinates_lonlat_to_index
        );

        this.decibel_matrix = initMatrix(this.width, this.height, this.step);

        console.timeEnd("initZoneOfInterest");
    }

    display(map) {
        console.time("zone_of_interest.display");

        console.time("displayZoneOfInterest");
        displayZoneOfInterest(
            map,
            this.longitude_west,
            this.latitude_north,
            this.longitude_east,
            this.latitude_south
        );
        console.timeEnd("displayZoneOfInterest");

        console.time("displayPolygonsFromCoordinates");
        displayPolygonsFromCoordinates(map, this.coordinates_lonlat_list);
        console.timeEnd("displayPolygonsFromCoordinates");

        console.timeEnd("zone_of_interest.display");
    }

    autoUpdateDecibelLayer(map, coordinates_lonlat, decibel) {
        console.time("zone_of_interest.autoUpdateDecibelLayer");

        console.time("updateDecibelMatrix");
        var [decibel_matrix, xy_sorted_by_distance] = updateDecibelMatrix(
            this.decibel_matrix,
            decibel,
            coordinates_lonlat,
            this.hash_coordinates_lonlat_to_xy,
            this.width,
            this.height,
            this.step
        );
        console.timeEnd("updateDecibelMatrix");
        this.decibel_matrix = decibel_matrix;

        console.time("updateDecibelLayer");
        // Don't understand why logs in the function updateDecibelLayer are not displayed
        updateDecibelLayer(
            map,
            this.decibel_matrix,
            xy_sorted_by_distance,
            this.hash_coordinates_xy_to_index
        );
        console.timeEnd("updateDecibelLayer");

        console.timeEnd("zone_of_interest.autoUpdateDecibelLayer");
    }
}

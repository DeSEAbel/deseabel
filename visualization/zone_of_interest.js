class ZoneOfInterest {
    constructor(
        map,
        width,
        height,
        step,
        longitude_west,
        latitude_north,
        precision = 5
    ) {
        this.map = map;
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

        // filter this.hash_coordinates_lonlat_to_xy to only include tiles in water
        // As other variables are based on this.hash_coordinates_lonlat_to_xy, we need
        // to do it before
        this.keepOnlyTilesInWater();

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

    keepOnlyTilesInWater() {
        console.time("keepOnlyTilesInWater");
        var tiles_in_water = {};
        // filter this.hash_coordinates_lonlat_to_xy to only include tiles in water
        // Todo reduce time complexity by doing it with dichotomy
        for (var key in this.hash_coordinates_lonlat_to_xy) {
            var [x, y] = this.hash_coordinates_lonlat_to_xy[key];
            var lonlat = key.split(",");
            var longitude_center = lonlat[2] - (lonlat[2] - lonlat[0]) / 2;
            var latitude_center = lonlat[3] - (lonlat[3] - lonlat[1]) / 2;
            if (lonLatInWater(this.map, longitude_center, latitude_center)) {
                tiles_in_water[key] = [x, y];
            }
        }

        this.hash_coordinates_lonlat_to_xy = tiles_in_water;
        console.timeEnd("keepOnlyTilesInWater");
    }

    display(map) {
        console.time("zone_of_interest.display");

        fitBounds(
            map,
            this.longitude_west,
            this.latitude_north,
            this.longitude_east,
            this.latitude_south
        );

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

        // Don't understand why logs in the function updateDecibelLayer are not displayed
        updateDecibelLayer(
            map,
            this.decibel_matrix,
            xy_sorted_by_distance,
            this.hash_coordinates_xy_to_index
        );

        console.timeEnd("zone_of_interest.autoUpdateDecibelLayer");
    }
}

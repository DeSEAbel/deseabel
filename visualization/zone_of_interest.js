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
    }

    display(map) {
        console.log("display map");
        displayZoneOfInterest(
            map,
            this.longitude_west,
            this.latitude_north,
            this.longitude_east,
            this.latitude_south
        );
        displayPolygonsFromCoordinates(map, this.coordinates_lonlat_list);
    }

    autoUpdateDecibelLayer(map, coordinates_lonlat, decibel) {
        var [decibel_matrix, xy_sorted_by_distance] = updateDecibelMatrix(
            this.decibel_matrix,
            decibel,
            coordinates_lonlat,
            this.hash_coordinates_lonlat_to_xy,
            this.width,
            this.height,
            this.step
        );
        this.decibel_matrix = decibel_matrix;
        // console.log("updateDecibelLayer");
        // console.log("features", features);
        // for (let i = 0; i < xy_sorted_by_distance.length; i++) {
        //     let x = xy_sorted_by_distance[i][0];
        //     let y = xy_sorted_by_distance[i][1];
        //     let decibel = decibel_matrix[y][x];
        //     let index =
        //         this.hash_coordinates_xy_to_index[xy_sorted_by_distance[i].join(",")];

        //     features[index].properties.decibel = decibel;
        // }

        // map.getSource("decibel_polygons_source").setData({
        //     type: "FeatureCollection",
        //     features: features,
        // });

        updateDecibelLayer(
            map,
            this.decibel_matrix,
            xy_sorted_by_distance,
            this.hash_coordinates_xy_to_index
        );
    }
}

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
            this.hash_coordinates_lonlat,
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
            this.hash_coordinates_lonlat
        );
        this.matrix = initMatrix(this.width, this.height, this.step);
    }

    display(map) {
        displayZoneOfInterest(
            map,
            this.longitude_west,
            this.latitude_north,
            this.longitude_west_to_east[this.longitude_west_to_east.length - 1],
            this.latitude_north_to_south[this.latitude_north_to_south.length - 1]
        );
        displayPolygonsFromCoordinates(map, this.hash_coordinates_lonlat);
    }
}

function displayZoneOfInterest(
    map,
    longitude_west,
    latitude_north,
    longitude_east,
    latitude_south
) {
    map.addSource("zone_of_interest", {
        type: "geojson",
        data: {
            type: "Feature",
            geometry: {
                type: "Polygon",
                // These coordinates outline the zone of interest.
                coordinates: [
                    [
                        [longitude_west, latitude_north],
                        [longitude_east, latitude_north],
                        [longitude_east, latitude_south],
                        [longitude_west, latitude_south],
                        [longitude_west, latitude_north],
                    ],
                ],
            },
        },
    });

    // Add a new layer to visualize the polygon.
    // map.addLayer({
    //     id: "zone_of_interest",
    //     type: "fill",
    //     source: "zone_of_interest", // reference the data source
    //     layout: {},
    //     paint: {
    //         "fill-color": "#0080ff", // blue color fill
    //         "fill-opacity": 0.5,
    //     },
    // });

    // Add a black outline around the polygon.
    map.addLayer({
        id: "outline_of_zone_of_interest",
        type: "line",
        source: "zone_of_interest",
        layout: {},
        paint: {
            "line-color": "#000",
            "line-width": 4,
        },
    });

    // Center the map on the zone of interest
    let epsilon = 0.05;
    map.fitBounds([
        [longitude_west, latitude_north + epsilon],
        [longitude_east, latitude_south - epsilon],
    ]);
}

function createPolygonFeature(
    longitude_west,
    latitude_north,
    longitude_east,
    latitude_south
) {
    coordinates = [];
    coordinates.push([longitude_west, latitude_north]);
    coordinates.push([longitude_east, latitude_north]);
    coordinates.push([longitude_east, latitude_south]);
    coordinates.push([longitude_west, latitude_south]);
    coordinates.push([longitude_west, latitude_north]);

    feature = {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [coordinates],
        },
        properties: { decibel: 0 },
    };
    return feature;
}

function displayPolygonsFromCoordinates(map, coordinates_lonlat_list) {
    features = [];
    for (let i = 0; i < coordinates_lonlat_list.length; i++) {
        features.push(
            createPolygonFeature(
                coordinates_lonlat_list[i][0],
                coordinates_lonlat_list[i][1],
                coordinates_lonlat_list[i][2],
                coordinates_lonlat_list[i][3]
            )
        );
    }

    map.addSource("decibel_polygons_source", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: features,
        },
    });

    map.addLayer({
        id: "decibel_polygons_layer",
        type: "fill",
        source: "decibel_polygons_source",
        paint: {
            "fill-color": {
                property: "decibel",
                type: "interval",
                stops: [
                    [20, "#00ff00"], // Green
                    [50, "#ffff00"], // Jaune
                    [100, "#ffa500"], // Orange
                    [200, "#ff0000"], // Rouge
                ],
            }, // Utilisation de la propriété 'fill' pour la couleur de remplissage
            //"fill-outline-color": "black", // Couleur de bordure des polygones
            "fill-opacity": {
                property: "decibel",
                type: "interval",
                stops: [
                    [20, 0], // Si la valeur est inférieure à 50, opacité à 0 (polygone invisible)
                    [50, 0.5], // Si la valeur est comprise entre 50 et 100, opacité à 0.5
                    [100, 0.8], // Si la valeur est comprise entre 100 et 160, opacité à 0.8
                    [200, 1],
                ],
            },
        },
    });
}

function updateDecibelLayer(
    map,
    decibel_matrix,
    xy_sorted_by_distance,
    hash_coordinates_xy_to_index
) {
    // Not possible to log from this function. Don't know why.
    for (let i = 0; i < xy_sorted_by_distance.length; i++) {
        let x = xy_sorted_by_distance[i][0];
        let y = xy_sorted_by_distance[i][1];
        let decibel = decibel_matrix[y][x];
        let index = hash_coordinates_xy_to_index[xy_sorted_by_distance[i].join(",")];

        features[index].properties.decibel = decibel;
    }

    map.getSource("decibel_polygons_source").setData({
        type: "FeatureCollection",
        features: features,
    });
}

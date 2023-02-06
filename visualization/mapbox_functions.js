function fitBounds(
    map,
    longitude_west,
    latitude_north,
    longitude_east,
    latitude_south
) {
    map.setMaxBounds([
        [longitude_west, latitude_south],
        [longitude_east, latitude_north],
    ]);

    var center_longitude = longitude_east - (longitude_east - longitude_west) / 2;
    var center_latitude = latitude_south - (latitude_south - latitude_north) / 2;
    map.jumpTo({
        center: [center_longitude, center_latitude],
    });

    map.fitBounds(
        [
            [longitude_west, latitude_north],
            [longitude_east, latitude_south],
        ],
        {
            padding: 20,
            animate: false,
        }
    );
}

function displayZoneOfInterest(
    map,
    longitude_west,
    latitude_north,
    longitude_east,
    latitude_south,
    zone_id
) {
    var zone_of_interest_id = "zone_of_interest_" + zone_id;
    var outline_of_zone_of_interest_id = "outline_of_zone_of_interest_" + zone_id;
    if (!map.getSource(zone_of_interest_id)) {
        map.addSource(zone_of_interest_id, {
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
        // Add a black outline around the polygon.
        map.addLayer({
            id: outline_of_zone_of_interest_id,
            type: "line",
            source: zone_of_interest_id,
            layout: {},
            paint: {
                "line-color": "#000",
                "line-width": 4,
            },
        });
    }
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

function displayPolygonsFromCoordinates(map, zone_id, features) {
    var decibel_polygons_source_id = "decibel_polygons_source_" + zone_id;
    var decibel_polygons_layer_id = "decibel_polygons_layer_" + zone_id;

    if (!map.getSource(decibel_polygons_source_id)) {
        map.addSource(decibel_polygons_source_id, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: features,
            },
        });

        map.addLayer({
            id: decibel_polygons_layer_id,
            type: "fill",
            source: decibel_polygons_source_id,
            paint: {
                "fill-color": {
                    property: "decibel",
                    type: "exponential",
                    stops: [
                        [60, "#00ff00"],
                        [80, "#ffff00"],
                        [100, "#ffa500"],
                        [150, "#ff0000"],
                    ],
                    colorSpace: "lab",
                },
                "fill-opacity": {
                    property: "decibel",
                    type: "interval",
                    stops: [
                        [50, 0],
                        [60, 0.2],
                        [80, 0.5],
                        [100, 0.8],
                        [150, 1],
                    ],
                },
            },
        });
    }
}

function updateDecibelLayer(
    map,
    decibel_matrix,
    xy_sorted_by_distance,
    hash_coordinates_xy_to_index,
    zone_id,
    features
) {
    var decibel_polygons_source_id = "decibel_polygons_source_" + zone_id;
    // Not possible to log from this function. Don't know why.
    for (let i = 0; i < xy_sorted_by_distance.length; i++) {
        let x = xy_sorted_by_distance[i][0];
        let y = xy_sorted_by_distance[i][1];
        let decibel = decibel_matrix[y][x];
        let index = hash_coordinates_xy_to_index[xy_sorted_by_distance[i].join(",")];
        // index can be undefined if the coordinates are not in the zone of interest or
        // if the coordinates are not in the water
        if (index == undefined) {
            continue;
        }
        features[index].properties.decibel = decibel;
    }

    map.getSource(decibel_polygons_source_id).setData({
        type: "FeatureCollection",
        features: features,
    });
}

function createDivMarker(img_url = `../img/boat2.png`, width = 20, height = 20) {
    var div = document.createElement("div");
    div.className = "marker";
    div.style.backgroundImage = `url(${img_url})`;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.backgroundSize = "100%";
    return div;
}

function addSourceAndLayerFromGeojson(map, id, data, color = "#088") {
    // If the source not exist, add it
    if (!map.getSource(id)) {
        map.addSource(id, {
            type: "geojson",
            data: data,
        });
    }

    if (!map.getLayer(id)) {
        map.addLayer({
            id: id,
            type: "fill",
            source: id,
            layout: {},
            paint: {
                "fill-color": color,
                "fill-opacity": 0.5,
            },
        });
    }
    map.setLayoutProperty(id, "visibility", "none");
    map.moveLayer(id, "decibel_polygons_layer_" + current_zone_id);
}
function addsourceAndLayerFromConfig(map, marine_fauna, color = "#088") {
    for (var animal in marine_fauna) {
        addSourceAndLayerFromGeojson(map, animal, marine_fauna[animal], color);
    }
}

function show_matrix_impact_geojson(map, matrix_decibel_impact) {
    // remove source named matrix_impact_geojson if it exists
    if (map.getSource("matrix_decibel_impact")) {
        // remove layers that use the source
        map.removeLayer("decibel_impact");
        map.removeSource("matrix_decibel_impact");
    }
    map.addSource("matrix_decibel_impact", {
        type: "geojson",
        data: matrix_decibel_impact,
    });
    map.addLayer({
        id: "decibel_impact",
        type: "fill",
        source: "matrix_decibel_impact",
        paint: {
            "fill-color": {
                property: "value",
                stops: [
                    // yellow to red for 1 to 5
                    [1, "#ffffcc"],
                    [2, "#ffeda0"],
                    [3, "#fed976"],
                    [4, "#feb24c"],
                    [5, "#fd8d3c"],
                ],
            },
            "fill-opacity": 0.5,
        },
    });
}

// create and get token user name from API
async function init_user() {
    const response = await fetch("http://0.0.0.0:8080/initialize_user", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    headers = await response.json();
    return headers;
}

// Add boat
async function add_boat(
    headers,
    id,
    boat_type,
    latitude,
    longitude,
    zone,
    speed,
    length
) {
    var json_boat = {
        id: id,
        lat: latitude,
        lon: longitude,
        speed: speed,
        length: length,
    };
    var url_add_boat = url_api.concat("add_boat/", boat_type, "?zone=", zone);
    fetch(url_add_boat, {
        method: "POST",
        body: JSON.stringify(json_boat),
        headers: Object.assign(headers, { "Content-Type": "application/json" }),
    })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
}

// Update marine fauna impact
async function update_impact_marine_fauna_impact(headers, zone, species) {
    var url_update_impact = url_api.concat(
        "update_marine_fauna_impact?zone=",
        zone,
        "&species=",
        species
    );
    fetch(url_update_impact, {
        method: "POST",
        headers: Object.assign(headers, { "Content-Type": "application/json" }),
    })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
}

async function get_matrix_decibel_impact(headers, zone) {
    const url_decibel_impact = url_api.concat(
        "decibel_matrix_impact_quantified/?zone=",
        zone
    );
    const response = await fetch(url_decibel_impact, {
        method: "GET",
        headers: Object.assign(headers, { "Content-Type": "application/json" }),
    });
    matrix_decibel_impact = await response.json();
    return matrix_decibel_impact;
}

async function get_array_impact(headers, zone, species) {
    const url_percentage_marine_fauna_impact_by_level = url_api.concat(
        "percentage_marine_fauna_impact_by_level?zone=",
        zone,
        "&species=",
        species
    );
    const response = await fetch(url_percentage_marine_fauna_impact_by_level, {
        method: "GET",
        headers: Object.assign(headers, { "Content-Type": "application/json" }),
    });
    array_impact = await response.json();
    return array_impact;
}

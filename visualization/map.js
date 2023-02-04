/**
 *
 * @param {string} mapbox_api_key - Mapbox API Key
 */
function loadMap(mapbox_api_key) {
    mapboxgl.accessToken = mapbox_api_key;

    // Constants
    list_markers = [];

    map = new mapboxgl.Map({
        container: "map-div", // container ID
        style: "mapbox://styles/mapbox/streets-v12", // style URL
        zoom: 7, // starting zoom
    });

    // Important for the app. I don't figured out why. Don't remove.
    // map.jumpTo({
    //     center: [-1.57, 46.02],
    //     zoom: 7,
    //     essential: true,
    // });
    // map.jumpTo({
    //     center: [-10.57, 46.02],
    //     zoom: 7,
    //     essential: true,
    // });
    // console.log("map0", map.getBounds());

    // Change the cursor to a pointer
    map.getCanvas().style.cursor = "pointer";

    // Disable zoom and rotation
    map.addControl(
        new mapboxgl.NavigationControl({
            showCompass: false,
            showZoom: false,
        })
    );
    map.scrollZoom.disable();
    map.dragRotate.disable();
    map.doubleClickZoom.disable();

    // Add sidebar

    var toggleZones = document.querySelector(".toggle-sidebar-zones");
    var sidebarZones = document.querySelector(".sidebar-zones");
    var toggleAnimals = document.querySelector(".toggle-sidebar-animals");
    var sidebarAnimals = document.querySelector(".sidebar-animals");

    toggleZones.addEventListener("click", function () {
        sidebarZones.classList.toggle("show-sidebar-zones");
        toggleZones.classList.toggle("toggle-zones");
    });

    toggleAnimals.addEventListener("click", function () {
        sidebarAnimals.classList.toggle("show-sidebar-animals");
        toggleAnimals.classList.toggle("toggle-animals");
    });

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
    }
    function addsourceAndLayerFromConfig(map, marine_fauna, color = "#088") {
        for (var animal in marine_fauna) {
            addSourceAndLayerFromGeojson(map, animal, marine_fauna[animal], color);
        }
    }

    map.on("load", () => {
        zones_of_interest = {};
        function sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        }

        async function initZones() {
            var map_div = document.getElementById("map-div");
            var loading = document.createElement("div");
            loading.innerHTML = "Loading zones...";
            loading.classList.add("loading-bar");
            map_div.appendChild(loading);
            var idx = 0;
            for (zone_id in zones) {
                idx += 1;
                var zone = zones[zone_id];
                var zone_name = zone.name;
                loading.innerHTML =
                    "Loading zone " +
                    zone_name +
                    "... (" +
                    idx +
                    "/" +
                    Object.keys(zones).length +
                    ")";
                zones_of_interest[zone_id] = new ZoneOfInterest(
                    map,
                    (width = zone.width),
                    (height = zone.height),
                    (step = zone.step),
                    (longitude_west = zone.longitude_west),
                    (latitude_north = zone.latitude_north),
                    (precision = 5),
                    (zone_id = zone_id)
                );
                await sleep(2000);
            }
            map_div.removeChild(loading);
            document.getElementById(zone_id).click();
        }

        initZones();
        // Simulate a click on the first zone to be able to interact with the map

        // initZones().then(function () {
        //     var element = document.getElementById(zone_id);
        //     if (element) {
        //         element.click();
        //     } else {
        //         console.error("Element with ID " + zone_id + " not found");
        //     }
        // });
    });

    function formatString(str) {
        let words = str.split("_");
        let formattedWords = [];
        for (let word of words) {
            formattedWords.push(word.charAt(0).toUpperCase() + word.slice(1));
        }
        return formattedWords.join(" ");
    }

    function createLayerButton(id, ids) {
        var text_content = formatString(id);
        var link = document.createElement("a");
        link.id = id;
        link.href = "#";
        link.textContent = text_content;
        link.className = "";

        link.onclick = function (e) {
            var clickedLayer = this.id;
            e.preventDefault();
            e.stopPropagation();

            var visibility = map.getLayoutProperty(clickedLayer, "visibility");

            // Toggle layer visibility by changing the layout object's visibility property.
            if (visibility === "visible") {
                map.setLayoutProperty(clickedLayer, "visibility", "none");
                this.className = "";
            } else {
                this.className = "active";
                map.setLayoutProperty(clickedLayer, "visibility", "visible");
                // Set the other layers to invisible
                for (var layer of ids) {
                    if (layer != clickedLayer) {
                        map.setLayoutProperty(layer, "visibility", "none");
                        document.getElementById(layer).className = "";
                    }
                }
            }
        };

        return link;
    }

    function createLayersButton(ids) {
        var marine_fauna_layers = document.getElementById("menu-animals");
        // First remove all children
        while (marine_fauna_layers.firstChild) {
            marine_fauna_layers.removeChild(marine_fauna_layers.firstChild);
        }

        for (const id of ids) {
            console.log(ids);
            var link = createLayerButton(id, ids);
            marine_fauna_layers.appendChild(link);
        }
    }

    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {

        var toggleableZoneIds = Object.keys(zones);
        for (var id of toggleableZoneIds) {
            if (document.getElementById(id)) {
                continue;
            }

            var link = document.createElement("a");
            link.id = id;
            link.href = "#";
            link.textContent = zones[id].name;
            link.className = "";

            link.onclick = function (e) {
                var clicked_zone_id = this.id;
                e.preventDefault();
                e.stopPropagation();

                const visibility = this.className;

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === "active") {
                    console.log("already active");
                    return;
                } else {
                    this.className = "active";
                    // set the other zones to inactive
                    for (var id of toggleableZoneIds) {
                        if (id !== clicked_zone_id) {
                            document.getElementById(id).className = "";
                        }
                    }
                    var previous_marine_fauna = [];
                    if (typeof current_zone_id != "undefined") {
                        var previous_marine_fauna = zones[current_zone_id].marine_fauna;
                        // Set to invisible all previous_marine fauna
                        for (var animal in previous_marine_fauna) {
                            map.setLayoutProperty(animal, "visibility", "none");
                        }
                    }
                    current_zone_id = clicked_zone_id;
                    zone_of_interest = zones_of_interest[current_zone_id];
                    zone_of_interest.display(map);
                    // Create layers buttons for the zone of interest
                    var marine_fauna = zones[current_zone_id].marine_fauna;
                    if ((typeof marine_fauna != "undefined") & (marine_fauna != {})) {
                        marine_fauna_layer_ids = Object.keys(marine_fauna);
                        createLayersButton(marine_fauna_layer_ids);
                        addsourceAndLayerFromConfig(
                            map,
                            marine_fauna,
                            previous_marine_fauna
                        );
                    }
                }
            };

            var layers = document.getElementById("menu-zones");
            layers.appendChild(link);
        }
    });

    // Add sonor element to the map when the user click right on it
    map.on("contextmenu", function (e) {
        if (typeof zone_of_interest !== "undefined") {
            longitude = e.lngLat.lng;
            latitude = e.lngLat.lat;
            console.log("lat: " + latitude + "\nlon: " + longitude);
            console.log(lonLatInWater(map, longitude, latitude));
            if (pointInScreenInWater(map, e.point)) {
                if (
                    longitude > zone_of_interest.longitude_west &&
                    longitude < zone_of_interest.longitude_east &&
                    latitude > zone_of_interest.latitude_south &&
                    latitude < zone_of_interest.latitude_north
                ) {
                    coordinates_lonlat = findTileFromLonlat(
                        (longitude = longitude),
                        (latitude = latitude),
                        (hash_coordinates_lonlat_to_xy =
                            zone_of_interest.hash_coordinates_lonlat_to_xy)
                    );
                    console.log("coordinates_lonlat" + coordinates_lonlat);
                    if (coordinates_lonlat != null) {
                        // e.lngLat contains the geographical position of the point on the map
                        var div_boat = createDivMarker();
                        var marker_boat = new mapboxgl.Marker(div_boat)
                            .setLngLat(e.lngLat)
                            .addTo(map);

                        list_markers.push(marker_boat);
                        console.log("Tile coordinates: " + coordinates_lonlat);
                        console.log("autoUpdateDecibelLayer");

                        zone_of_interest.autoUpdateDecibelLayer(
                            map,
                            coordinates_lonlat,
                            150
                        );
                    }
                }
            }
        }
    });

    // Delete marker on the map when left click on it
    map.on("click", function (e) {
        console.log("lat: " + e.lngLat.lat + "\nlon: " + e.lngLat.lng);
        for (var i = 0; i < list_markers.length; i++) {
            difference_lat = Math.abs(list_markers[i].getLngLat().lat - e.lngLat.lat);
            difference_lon = Math.abs(list_markers[i].getLngLat().lng - e.lngLat.lng);
            if (difference_lat < 0.01 && difference_lon < 0.01) {
                list_markers[i].remove();
                list_markers.splice(i, 1);
            }
        }
    });

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

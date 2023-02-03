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

    map.on("load", () => {
        // map.addSource("bathymetry", {
        //     type: "vector",
        //     url: "mapbox://mapbox.mapbox-bathymetry-v2",
        // });

        map.addSource("fish", {
            type: "geojson",
            data: "../data/fish.geojson",
        });

        map.addLayer({
            id: "fish",
            type: "fill",
            source: "fish",
            layout: {},
            paint: {
                "fill-color": "#088",
                "fill-opacity": 0.5,
            },
        });

        map.addSource("marine_mammal", {
            type: "geojson",
            data: "../data/marine_mammal.geojson",
        });

        map.addLayer({
            id: "marine_mammal",
            type: "fill",
            source: "marine_mammal",
            layout: {},
            paint: {
                "fill-color": "#800080",
                "fill-opacity": 0.5,
            },
        });

        map.setLayoutProperty("fish", "visibility", "none");
        map.setLayoutProperty("marine_mammal", "visibility", "none");

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
                await sleep(1000);
            }
            map_div.removeChild(loading);
            // Simulate a click on the first zone to be able to interact with the map
            document.getElementById(zone_id).click();
        }

        initZones();
    });

    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {
        // If these two layers were not added to the map, abort
        if (!map.getLayer("fish") || !map.getLayer("marine_mammal")) {
            return;
        }

        // Enumerate ids of the layers.
        const toggleableLayerIds = ["fish", "marine_mammal"];

        var fauna_id_to_name = {
            fish: "Fish",
            marine_mammal: "Marine Mammal",
        };

        // Set up the corresponding toggle button for each layer.
        for (const id of toggleableLayerIds) {
            // Skip layers that already have a button set up.
            if (document.getElementById(id)) {
                continue;
            }

            // Create a link.
            const link = document.createElement("a");
            link.id = id;
            link.href = "#";
            link.textContent = fauna_id_to_name[id];
            link.className = "";

            // Show or hide layer when the toggle is clicked.
            link.onclick = function (e) {
                const clickedLayer = this.id;
                // e.preventDefault();
                // e.stopPropagation();

                const visibility = map.getLayoutProperty(clickedLayer, "visibility");

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === "visible") {
                    map.setLayoutProperty(clickedLayer, "visibility", "none");
                    this.className = "";
                } else {
                    this.className = "active";
                    map.setLayoutProperty(clickedLayer, "visibility", "visible");
                    // set the other layers to inactive
                    for (const id of toggleableLayerIds) {
                        if (id !== clickedLayer) {
                            document.getElementById(id).className = "";
                            map.setLayoutProperty(id, "visibility", "none");
                        }
                    }
                }
            };

            const layers = document.getElementById("menu-animals");
            layers.appendChild(link);
        }

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
                    current_zone_id = clicked_zone_id;
                    zone_of_interest = zones_of_interest[current_zone_id];
                    zone_of_interest.display(map);
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

    // map.on("load", function () {
    //     // TODO Put in a function to be called when the user select the zone of interest
    //     // Create zone of interest

    //     var longitude_west = -2.3595;
    //     var latitude_north = 46.4181;

    //     // Make the zone of interest available in the global scope to be able to use it
    //     //in the context menu. Don't use let, var or const to make it global
    //     zone_of_interest = new ZoneOfInterest(
    //         map,
    //         (width = 100000),
    //         (height = 100000),
    //         (step = 1000),
    //         (longitude_west = longitude_west),
    //         (latitude_north = latitude_north)
    //     );

    //     zone_of_interest.display(map);
    // });
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

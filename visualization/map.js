/**
 *
 * @param {string} mapbox_api_key - Mapbox API Key
 */
function loadMap(mapbox_api_key) {
    mapboxgl.accessToken = mapbox_api_key;

    // Constants
    list_markers = [];

    const map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/mapbox/streets-v12", // style URL
        zoom: 7, // starting zoom
    });

    // Important for the app. I don't figured out why. Don't remove.
    map.jumpTo({
        center: [-1.57, 46.02],
        zoom: 7,
        essential: true,
    });

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

    // Add sidebar for the animals
    var toggleAnimals = document.querySelector(".toggle-sidebar-animals");
    var sidebarAnimals = document.querySelector(".sidebar-animals");

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
            id: "Poissons",
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
            id: "Mammifères marins",
            type: "fill",
            source: "marine_mammal",
            layout: {},
            paint: {
                "fill-color": "#800080",
                "fill-opacity": 0.5,
            },
        });

        map.setLayoutProperty("Poissons", "visibility", "none");
        map.setLayoutProperty("Mammifères marins", "visibility", "none");
    });
        
    
    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {
        // If these two layers were not added to the map, abort
        if (!map.getLayer("Poissons") || !map.getLayer("Mammifères marins")) {
            return;
        }

        // Enumerate ids of the layers.
        const toggleableLayerIds = ["Poissons", "Mammifères marins"];

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
            link.textContent = id;
            link.className = "";

            // Show or hide layer when the toggle is clicked.
            link.onclick = function (e) {
                const clickedLayer = this.textContent;
                e.preventDefault();
                e.stopPropagation();

                const visibility = map.getLayoutProperty(clickedLayer, "visibility");

                // Toggle layer visibility by changing the layout object's visibility property.
                if (visibility === "visible") {
                    map.setLayoutProperty(clickedLayer, "visibility", "none");
                    this.className = "";
                } else {
                    this.className = "active";
                    map.setLayoutProperty(clickedLayer, "visibility", "visible");
                }
            };

            const layers = document.getElementById("menu");
            layers.appendChild(link);
        }
    });

    // Add sonor element to the map when the user click right on it
    map.on("dblclick", function (e) {
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
                    var coordinates_lonlat = findTileFromLonlat(
                        (longitude = longitude),
                        (latitude = latitude),
                        (hash_coordinates_lonlat_to_xy =
                            zone_of_interest.hash_coordinates_lonlat_to_xy)
                    );
                    console.log("coordinates_lonlat" + coordinates_lonlat);
                    // Create the marker
                    if (coordinates_lonlat != null) {
                        
                        // Create marker boat
                        // e.lngLat contains the geographical position of the point on the map
                        var div_boat = createDivMarker();
                        var marker_boat = new mapboxgl.Marker(div_boat)
                            .setLngLat(e.lngLat)
                            .addTo(map);
                        // marker_boat.setDraggable(true);
                        marker_boat.speed = 10;
                        marker_boat.length = 6;
                        
                        // Create popup for the marker boat
                        console.log('create_popup');
                        var popup = new mapboxgl.Popup({
                                        closeButton: false,
                                        closeOnClick: true,
                                        })
                            //.setHTML('<h3>Settings</h3>Speed<div id="slider"><input type="range" value="'+ marker_boat.speed + '" min="0" max="40" class="slider" id="slider_speed" oninput="this.nextElementSibling.value = this.value"><output id="slider_boat_speed">' + marker_boat.speed + '</output></div>')
                            .setHTML('<h3>Settings</h3>\
                            Speed\
                            <div id="slider"><input type="range" value="'+ marker_boat.speed + '" min="0" max="40" class="slider" id="slider_speed" oninput="this.nextElementSibling.value = this.value">\
                            <output id="slider_boat_speed">' + marker_boat.speed + '</output>\
                            </div>\
                            Length\
                            <div id="slider"><input type="range" value="'+ marker_boat.length + '" min="0" max="40" class="slider" id="slider_length" oninput="this.nextElementSibling.value = this.value">\
                            <output id="slider_boat_length">' + marker_boat.length + '</output>\
                            </div>\
                            <div id="delete_button"><button type="button">Delete</button>\
                            </div>')
                            .addTo(map);
                        }
        
                        popup.once('close', function () {
                            var popupContent = popup._content;
                            var slider_speed = popupContent.querySelector('#slider_speed');
                            var slider_length = popupContent.querySelector('#slider_length');
                            var delete_button = popupContent.querySelector('#delete_button');
                            // Add an event listener to the slider
                            slider_speed.addEventListener('input', function () {
                                marker_boat.speed = slider_speed.value;
                                var decibel = computeSoundLevel(marker_boat.length, marker_boat.speed);
                                zone_of_interest.autoUpdateDecibelLayer(
                                    map,
                                    coordinates_lonlat,
                                    decibel
                                );
                            });
                            slider_length.addEventListener('input', function () {
                                marker_boat.length = slider_length.value;
                                var decibel = computeSoundLevel(marker_boat.length, marker_boat.speed);
                                zone_of_interest.autoUpdateDecibelLayer(
                                    map,
                                    coordinates_lonlat,
                                    decibel
                                );
                            });
                            delete_button.addEventListener('click', function () {
                                var decibel = computeSoundLevel(marker_boat.length, marker_boat.speed);
                                marker_boat.remove();
                                zone_of_interest.autoUpdateDecibelLayer(
                                    map,
                                    coordinates_lonlat,
                                    decibel,
                                    "delete"
                                );
                            });
                                    
                        });
                        console.log('popup created');
          
                        // Add popup to the marker boat on click
                        marker_boat.getElement().addEventListener('click', function() {
                            marker_boat.setPopup(popup).togglePopup();
                        });

                        // Compute the decibel of the marker boat
                        var decibel = computeSoundLevel(marker_boat.length, marker_boat.speed);

                        // Add the marker and the decibel to the list
                        list_markers.push([marker_boat, decibel]);
                        console.log("Tile coordinates: " + coordinates_lonlat);
                        console.log("autoUpdateDecibelLayer");
                        zone_of_interest.autoUpdateDecibelLayer(
                            map,
                            coordinates_lonlat,
                            decibel
                        );
                    }
                }
            }
        }
    );
    

    map.on("load", function () {
        // TODO Put in a function to be called when the user select the zone of interest
        // Create zone of interest

        var longitude_west = -2.3595;
        var latitude_north = 46.4181;

        // Make the zone of interest available in the global scope to be able to use it
        //in the context menu. Don't use let, var or const to make it global
        zone_of_interest = new ZoneOfInterest(
            map,
            (width = 100000),
            (height = 100000),
            (step = 1000),
            (longitude_west = longitude_west),
            (latitude_north = latitude_north)
        );

        zone_of_interest.display(map);
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
        data: matrix_decibel_impact
    });
    map.addLayer({
        id: "decibel_impact",
        type: "fill",
        source: "matrix_decibel_impact",
        paint: {
            "fill-color": {
            "property": "value",
            "stops": [
                // yellow to red for 1 to 5
                [1, "#ffffcc"],
                [2, "#ffeda0"],
                [3, "#fed976"],
                [4, "#feb24c"],
                [5, "#fd8d3c"]
            ]
            },
            "fill-opacity": 0.5
        }
    });
}


// create and get token user name from API
async function init_user() {
    const response = await fetch('http://0.0.0.0:8080/initialize_user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    headers = await response.json();
    return headers;
}

// Add boat
async function add_boat(headers, id, boat_type, latitude, longitude, zone, speed, length) {
    var json_boat = {
        "id": id, "lat": latitude, 
        "lon": longitude, "speed": speed, "length": length
    };
    var url_add_boat = url_api.concat("add_boat/", boat_type, "?zone=", zone);
    fetch(url_add_boat, {
        method: 'POST',
        body: JSON.stringify(json_boat),
        headers: Object.assign(headers, { 'Content-Type': 'application/json' })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
    }

// Update marine fauna impact
async function update_impact_marine_fauna_impact(headers, zone, species) {
    var url_update_impact = url_api.concat("update_marine_fauna_impact?zone=", zone, "&species=", species);
    fetch(url_update_impact, {
        method: 'POST',
        headers: Object.assign(headers, { 'Content-Type': 'application/json' })
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
}

async function get_matrix_decibel_impact(headers, zone) {
    const url_decibel_impact = url_api.concat("decibel_matrix_impact_quantified/?zone=", zone);
    const response = await fetch(url_decibel_impact, {
        method: 'GET',
        headers: Object.assign(headers, { 'Content-Type': 'application/json' })
    });
    matrix_decibel_impact = await response.json();
    return matrix_decibel_impact;
}


async function get_array_impact(headers, zone, species) {
    const url_percentage_marine_fauna_impact_by_level = url_api.concat("percentage_marine_fauna_impact_by_level?zone=", zone, "&species=", species);
    const response = await fetch(url_percentage_marine_fauna_impact_by_level, {
        method: 'GET',
        headers: Object.assign(headers, { 'Content-Type': 'application/json' })
    });
    array_impact = await response.json();
    return array_impact;
}


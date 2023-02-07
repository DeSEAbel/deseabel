/**
 *
 * @param {string} mapbox_api_key - Mapbox API Key
 */
function loadMap(mapbox_api_key) {
    mapboxgl.accessToken = mapbox_api_key;

    map = new mapboxgl.Map({
        container: "map-div", // container ID
        style: "mapbox://styles/mapbox/streets-v12", // style URL
        zoom: 7, // starting zoom
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

    // Add sidebar
    var toggleNoiseImpactors = document.querySelector(".toggle-sidebar-noise-impactors");
    var sidebarNoiseImpactors = document.querySelector(".sidebar-noise-impactors");
    var toggleZones = document.querySelector(".toggle-sidebar-zones");
    var sidebarZones = document.querySelector(".sidebar-zones");
    var toggleAnimals = document.querySelector(".toggle-sidebar-animals");
    var sidebarAnimals = document.querySelector(".sidebar-animals");

    toggleNoiseImpactors.addEventListener("click", function () {
        sidebarNoiseImpactors.classList.toggle("show-sidebar-noise-impactors");
        toggleNoiseImpactors.classList.toggle("toggle-noise-impactors");
    });
    
    toggleZones.addEventListener("click", function () {
        sidebarZones.classList.toggle("show-sidebar-zones");
        toggleZones.classList.toggle("toggle-zones");
    });

    toggleAnimals.addEventListener("click", function () {
        sidebarAnimals.classList.toggle("show-sidebar-animals");
        toggleAnimals.classList.toggle("toggle-animals");
    });

    map.on("load", () => {
        initZones();
    });
        
    
    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {
        add_zones_menu(map).then(() => {
            zones_of_interest[current_zone_id].keepOnlyTilesInWater();
        });
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
                    // console.log("Keep only tiles in water");
                    // zone_of_interest.keepOnlyTilesInWater();
                    // console.log("Keep only tiles in water done");
                    console.log("Find tile from lonlat");
                    var coordinates_lonlat = findTileFromLonlat(
                        (longitude = longitude),
                        (latitude = latitude),
                        (hash_coordinates_lonlat_to_xy =
                            zone_of_interest.hash_coordinates_lonlat_to_xy)
                    );
                    console.log("Find tile from lonlat done");

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
                            </div>');
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
                                    "subtract"
                                );
                            });
                                    
                        });
                        console.log('popup created');
                        
                        marker_boat.setPopup(popup)
                        // Add popup to the marker boat on click
                        marker_boat.getElement().addEventListener('click', function() {
                            popup.addTo(map);
                        });
                        
                        // Compute the decibel of the marker boat
                        var decibel = computeSoundLevel(marker_boat.length, marker_boat.speed);

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
    });
}

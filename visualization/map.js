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
        initZones();
    });

    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {
        add_zones_menu(map).then(() => {
            zones_of_interest[current_zone_id].keepOnlyTilesInWater();
        });
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
                    // console.log("Keep only tiles in water");
                    // zone_of_interest.keepOnlyTilesInWater();
                    // console.log("Keep only tiles in water done");

                    console.log("Find tile from lonlat");
                    coordinates_lonlat = findTileFromLonlat(
                        (longitude = longitude),
                        (latitude = latitude),
                        (hash_coordinates_lonlat_to_xy =
                            zone_of_interest.hash_coordinates_lonlat_to_xy)
                    );
                    console.log("Find tile from lonlat done");

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

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
    var toggleNoiseImpactors = document.querySelector(
        ".toggle-sidebar-noise-impactors"
    );
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
        // addBathymetry(map);
        initZones();
        add_noise_impactors_menu_divs();
    });

    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {
        add_zones_menu(map)
        // .then(() => {
        //     zones_of_interest[current_zone_id].keepOnlyTilesInWater();
        // });
        add_noise_impactors_menu();
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
                    console.log("Keep only tiles in water");
                    zone_of_interest.keepOnlyTilesInWater();
                    console.log("Keep only tiles in water done");
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
                        marker_object = new MarkerObject(map, e.lngLat, coordinates_lonlat, current_noise_impactor_id);

                        console.log("Tile coordinates: " + coordinates_lonlat);
                        console.log("autoUpdateDecibelLayer");

                        zone_of_interest.autoUpdateDecibelLayer(
                            map,
                            coordinates_lonlat,
                            marker_object.decibel
                        );
                        console.log("autoUpdateDecibelLayer done");
                    }
                }
            }
        }
    });
}

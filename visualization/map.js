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

    var lastTap = null;

    map.on("load", () => {
        // addBathymetry(map);
        initZones();
        add_noise_impactors_menu_divs();
    });

    // After the last frame rendered before the map enters an "idle" state.
    map.on("idle", () => {
        add_zones_menu(map);
        // .then(() => {
        //     zones_of_interest[current_zone_id].keepOnlyTilesInWater();
        // });
        add_noise_impactors_menu();
    });

    // Add sonor element to the map when the user click right on it
    map.on("dblclick", function (e) {
        doubleTapAction(e);
    });

    map.on("touchstart", function (e) {
        if (lastTap) {
            var timeBetweenTaps = new Date().getTime() - lastTap;
            if (timeBetweenTaps < 400) {
                // Double tap detected
                console.log("Double tap detected");
            }

            doubleTapAction(e);

            lastTap = null;
        } else {
            lastTap = new Date().getTime();
        }
    });
}

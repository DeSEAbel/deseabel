/**
 *
 * @param {string} mapbox_api_key - Mapbox API Key
 */

function loadMap(mapbox_api_key) {
    mapboxgl.accessToken = mapbox_api_key;

    const map = new mapboxgl.Map({
        container: "map", // container ID
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: "mapbox://styles/mapbox/streets-v12", // style URL
        //center: [-1.57, 46.02], // starting position [lng, lat]
        zoom: 7, // starting zoom
    });

    map.setMaxBounds([
        [-2.5, 45],
        [-0.5, 47],
    ]);
    map.jumpTo({
        center: [-1.57, 46.02],
        zoom: 7,
        essential: true,
    });
    map.addControl(
        new mapboxgl.NavigationControl({
            showCompass: false,
            showZoom: false,
        })
    );
    map.scrollZoom.disable();
    map.dragRotate.disable();
    map.doubleClickZoom.disable();

    var toggleAnimals = document.querySelector(".toggle-sidebar-animals");
    var sidebarAnimals = document.querySelector(".sidebar-animals");

    toggleAnimals.addEventListener("click", function () {
        sidebarAnimals.classList.toggle("show-sidebar-animals");
        toggleAnimals.classList.toggle("toggle-animals");
    });

    /*/ create a marker for the whales's location
  const whaleMarker = new mapboxgl.Marker()
  .setLngLat([-1.32, 46.13]) // set the marker's position
  .addTo(map); // add the marker to the map
  
  // listen for clicks on the whale marker
  whaleMarker.on('click', function() {
    // when the marker is clicked, add some data to the div that has "sound-effect" as an id
    console.log("Whale clicked");
    //document.getElementById('markerInfo').innerHTML = "Whale sound";
    document.querySelector('#markerInfo').innerHTML = 'Hello, I am a whale!';
  })
  */

    // Create a marker and set its coordinates.
    // const whaleMarker = new mapboxgl.Marker()
    //   .setLngLat([-1.8, 45.73])
    //   .addTo(map);

    list_markers = [];

    const markerBoatSize = 20; // minimum size of the boat marker in pixels
    function create_div_marker(
        img_url = `../img/boat2.png`,
        width = markerBoatSize,
        height = markerBoatSize
    ) {
        var div = document.createElement("div");
        div.className = "marker";
        div.style.backgroundImage = `url(${img_url})`;
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
        div.style.backgroundSize = "100%";
        return div;
    }

    var div_boat = create_div_marker();

    // Add markers to the map.
    // var marker_boat = new mapboxgl.Marker(div_boat).setLngLat([-1.9, 45.9]).addTo(map);
    // list_markers.push(marker_boat);

    /* POPUP
  // Create a popup and set its content.
  const popup = new mapboxgl.Popup()
  .setHTML("<p>Hello World!</p>")
  .addTo(map);
  
  // Set the marker's popup.
  whaleMarker.setPopup(popup);
  */

    // map.on('load', function () {
    //   map.addSource('random_decibels_geojson', {
    //       type: 'geojson',
    //       data: '../ocean_ecosystem/data/decibels_100000x100000_1000m_-2.4095_46.4181.geojson' // URL du fichier GeoJSON
    //   });

    //   // Ajout du calque de polygones à la carte
    //   map.addLayer({
    //       id: 'random_decibels',
    //       type: 'fill',
    //       source: 'random_decibels_geojson',
    //       paint: {
    //         'fill-color': {
    //           property: 'decibel',
    //           type: 'interval',
    //           stops: [
    //             [40, '#99ddff'], // Bleu transparent
    //             [50, '#ffff00'], // Jaune
    //             [100, '#ffa500'], // Orange
    //             [200, '#ff0000'] // Rouge
    //           ]
    //         },// Utilisation de la propriété 'fill' pour la couleur de remplissage
    //         'fill-outline-color': 'black', // Couleur de bordure des polygones
    //         'fill-opacity': {
    //           property: 'decibel',
    //           type: 'interval',
    //           stops: [
    //               [50, 0], // Si la valeur est inférieure à 50, opacité à 0 (polygone invisible)
    //               [100, 0.5], // Si la valeur est comprise entre 50 et 100, opacité à 0.5
    //               [160, 0.8], // Si la valeur est comprise entre 100 et 160, opacité à 0.8
    //               [200, 1]
    //           ]
    //       }
    //       }
    //   });
    // });

    map.on("load", () => {
        map.addSource("bathymetry", {
            type: "vector",
            url: "mapbox://mapbox.mapbox-bathymetry-v2",
        });
        // Add a custom vector tileset source. This tileset contains
        // point features representing museums. Each feature contains
        // three properties. For example:
        // {
        //     alt_name: "Museo Arqueologico",
        //     name: "Museo Inka",
        //     tourism: "museum"
        // }
        // Add the Mapbox Terrain v2 vector tileset. Read more about
        // the structure of data in this tileset in the documentation:
        // https://docs.mapbox.com/vector-tiles/reference/mapbox-terrain-v2/

        map.addSource("fish", {
            type: "geojson",
            data: "../data/fish.geojson",
        });
        /* Add Layer for heatmap points */

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

        // define a variable to track the current state of the layers
        let layersVisible = false;

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

    // Add geolocate control to the map.
    // map.on("contextmenu", function (e) {
    //     if (typeof zone_of_interest !== "undefined") {
    //         longitude = e.lngLat.lng;
    //         latitude = e.lngLat.lat;
    //         console.log("lat: " + latitude + "\nlon: " + longitude);
    //         if (
    //             longitude > zone_of_interest.longitude_west &&
    //             longitude < zone_of_interest.longitude_east &&
    //             latitude > zone_of_interest.latitude_south &&
    //             latitude < zone_of_interest.latitude_north
    //         ) {
    //             coordinates_lonlat = findTileFromLonlat(
    //                 (longitude = longitude),
    //                 (latitude = latitude),
    //                 (hash_coordinates_lonlat_to_xy =
    //                     zone_of_interest.hash_coordinates_lonlat_to_xy)
    //             );
    //             if (coordinates_lonlat != null) {
    //                 // e.lngLat contains the geographical position of the point on the map
    //                 var div_boat = create_div_marker();
    //                 var marker_boat = new mapboxgl.Marker(div_boat)
    //                     .setLngLat(e.lngLat)
    //                     .addTo(map);

    //                 list_markers.push(marker_boat);
    //                 console.log("Tile coordinates: " + coordinates_lonlat);
    //                 console.log("autoUpdateDecibelLayer");
    //                 zone_of_interest.autoUpdateDecibelLayer(
    //                     map,
    //                     coordinates_lonlat,
    //                     120
    //                 );
    //             }
    //         }
    //     }
    // });
    
    url_api = "http://0.0.0.0:8080/";
    id = 0;
    
    // Add geolocate control to the map.
    map.on("contextmenu", function (e) {
        if (typeof zone_of_interest !== "undefined") {
            longitude = e.lngLat.lng;
            latitude = e.lngLat.lat;
            console.log("lat: " + latitude + "\nlon: " + longitude);
            if (
                longitude > zone_of_interest.longitude_west &&
                longitude < zone_of_interest.longitude_east &&
                latitude > zone_of_interest.latitude_south &&
                latitude < zone_of_interest.latitude_north
            ) {
                var boat_type = "fishing_boat";
                var species = "fish";
                var zone = "la_rochelle";
                var speed = 20;
                var length = 23;
                
                // Add boat in the system
                add_boat(headers, id++, boat_type, latitude, longitude, zone, speed, length);
                
                // Update impact
                update_impact_marine_fauna_impact(headers, zone, species);
                
                // Get matrix impact
                matrix_decibel_impact = get_matrix_decibel_impact(headers, zone);
                
                var div_boat = create_div_marker();
                var marker_boat = new mapboxgl.Marker(div_boat)
                    .setLngLat(e.lngLat)
                    .addTo(map);

                list_markers.push(marker_boat);
                
                // show matrix impact_geojson on the map
                Promise.all([matrix_decibel_impact]).then((results) => {
                    // all async functions has completed
                    // results is an array of results of the async functions
                    console.log("matrix_decibel_impact is computed");
                    show_matrix_impact_geojson(map, matrix_decibel_impact);
                    array_impact = get_array_impact(headers, zone, species);
                });
            }
        }
    });

    // Delete marker on the map when click on it
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

    map.on("load", function () {
        // TODO Put in a function to be called when the user select the zone of interest
        // Create zone of interest
        headers = init_user();

        var longitude_west = -2.3595;
        var latitude_north = 46.4181;

        // Make the zone of interest available in the global scope to be able to use it
        //in the context menu. Don't use let, var or const to make it global
        zone_of_interest = new ZoneOfInterest(
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
        map.removeLayer("matrix_decibel_impact");
        map.removeSource("matrix_decibel_impact");
    }
    map.addSource("matrix_decibel_impact", {
        type: "geojson",
        data: matrix_decibel_impact
    });
    map.addLayer({
        id: "matrix_decibel_impact",
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


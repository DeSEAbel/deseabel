function loadMap(mapboxApiKey) {
  mapboxgl.accessToken = mapboxApiKey;

  const map = new mapboxgl.Map({
    container: "map", // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    //center: [-1.57, 46.02], // starting position [lng, lat]
    zoom: 7, // starting zoom
  });



  map.setMaxBounds([[-2.50, 45], [-0.5, 47] ]);
  map.jumpTo({
    center: [-1.57, 46.02],
    zoom: 7,
    essential: true
});
  map.addControl(new mapboxgl.NavigationControl({
    showCompass: false,
    showZoom: false
  }));
  map.scrollZoom.disable();
  map.dragRotate.disable();
  map.doubleClickZoom.disable();  

  var toggleKnots = document.querySelector(".toggle-sidebar-knots");
  var sidebar = document.querySelector(".sidebar");

  var toggleAnimals = document.querySelector(".toggle-sidebar-animals");
  var sidebarAnimals = document.querySelector(".sidebar-animals");

  toggleKnots.addEventListener("click", function () {
    sidebar.classList.toggle("show-sidebar");
    toggleKnots.classList.toggle("click-toggle");
  });

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
  var marker_boat = new mapboxgl.Marker(div_boat).setLngLat([-1.9, 45.9]).addTo(map);
  list_markers.push(marker_boat);

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
    map.addSource('bathymetry', {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-bathymetry-v2'
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

    map.addSource("safe_zone_5_noeuds", {
      type: "geojson",
      data: "../data/safe_zone_5_noeuds.geojson",
    });

    map.addLayer({
      id: "Safe zone 5 noeuds",
      type: "heatmap",
      source: "safe_zone_5_noeuds",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0.8,
          "rgba(0,255,0,0)",
          1,
          "rgba(0,255,0,0.5)",
        ],
      },
    });

    map.addSource("hurt_zone_5_noeuds", {
      type: "geojson",
      data: "../data/hurt_zone_5_noeuds.geojson",
    });

    map.addLayer({
      id: "Hurt zone 5 noeuds",
      type: "heatmap",
      source: "hurt_zone_5_noeuds",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0.8,
          "rgba(255,100,0,0)",
          1,
          "rgba(255, 255, 0, 0.5)",
        ],
      },
    });

    map.addSource("dead_zone_5_noeuds", {
      type: "geojson",
      data: "../data/dead_zone_5_noeuds.geojson",
    });

    map.addLayer({
      id: "Dead zone 5 noeuds",
      type: "heatmap",
      source: "dead_zone_5_noeuds",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0.8,
          "rgba(255,0,0,0)",
          1,
          "rgba(255,0,0,0.5)",
        ],
      },
    });

    map.addSource("safe_zone_10_noeuds", {
      type: "geojson",
      data: "../data/safe_zone_10_noeuds.geojson",
    });

    map.addLayer({
      id: "Safe zone 10 noeuds",
      type: "heatmap",
      source: "safe_zone_10_noeuds",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0.8,
          "rgba(0,255,0,0)",
          1,
          "rgba(0,255,0,0.5)",
        ],
      },
    });

    map.addSource("hurt_zone_10_noeuds", {
      type: "geojson",
      data: "../data/hurt_zone_10_noeuds.geojson",
    });

    map.addLayer({
      id: "Hurt zone 10 noeuds",
      type: "heatmap",
      source: "hurt_zone_10_noeuds",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0.8,
          "rgba(255,100,0,0)",
          1,
          "rgba(255, 255, 0, 0.5)",
        ],
      },
    });

    map.addSource("dead_zone_10_noeuds", {
      type: "geojson",
      data: "../data/dead_zone_10_noeuds.geojson",
    });

    map.addLayer({
      id: "Dead zone 10 noeuds",
      type: "heatmap",
      source: "dead_zone_10_noeuds",
      paint: {
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0.8,
          "rgba(255,0,0,0)",
          1,
          "rgba(255,0,0,0.5)",
        ],
      },
    });

    map.setLayoutProperty("Dead zone 5 noeuds", "visibility", "none");
    map.setLayoutProperty("Hurt zone 5 noeuds", "visibility", "none");
    map.setLayoutProperty("Safe zone 5 noeuds", "visibility", "none");

    map.setLayoutProperty("Dead zone 10 noeuds", "visibility", "none");
    map.setLayoutProperty("Hurt zone 10 noeuds", "visibility", "none");
    map.setLayoutProperty("Safe zone 10 noeuds", "visibility", "none");

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


    // define the function to toggle the visibility of the layers
    function toggleLayer5knots() {
      // check the current state of the layers
      if (layersVisible) {
        // hide the layers
        map.setLayoutProperty("Dead zone 5 noeuds", "visibility", "none");
        map.setLayoutProperty("Hurt zone 5 noeuds", "visibility", "none");
        map.setLayoutProperty("Safe zone 5 noeuds", "visibility", "none");
        // update the variable to track the state of the layers
        layersVisible = false;
      } else {
        // show the layers
        map.setLayoutProperty("Dead zone 5 noeuds", "visibility", "visible");
        map.setLayoutProperty("Hurt zone 5 noeuds", "visibility", "visible");
        map.setLayoutProperty("Safe zone 5 noeuds", "visibility", "visible");
        // update the variable to track the state of the layers
        layersVisible = true;
      }
    }

    function toggleLayer10knots() {
      // check the current state of the layers
      if (layersVisible) {
        // hide the layers
        map.setLayoutProperty("Dead zone 10 noeuds", "visibility", "none");
        map.setLayoutProperty("Hurt zone 10 noeuds", "visibility", "none");
        map.setLayoutProperty("Safe zone 10 noeuds", "visibility", "none");
        // update the variable to track the state of the layers
        layersVisible = false;
      } else {
        // show the layers
        map.setLayoutProperty("Dead zone 10 noeuds", "visibility", "visible");
        map.setLayoutProperty("Hurt zone 10 noeuds", "visibility", "visible");
        map.setLayoutProperty("Safe zone 10 noeuds", "visibility", "visible");
        // update the variable to track the state of the layers
        layersVisible = true;
      }
    }

    const toggleButton5knots = document.querySelector("#toggleLayer5knots");
    const toggleButton10knots = document.querySelector("#toggleLayer10knots");

    // add an event listener to the button
    toggleButton5knots.addEventListener("click", toggleLayer5knots);
    toggleButton10knots.addEventListener("click", toggleLayer10knots);

    // Set up the corresponding toggle button for each layer.
    for (const id of toggleableLayerIds) {
      // Skip layers that already have a button set up.
      if (document.getElementById(id)) {
        continue;
      }
      console.log(id)

      // Create a link.
      const link = document.createElement("a");
      link.id = id;
      link.href = "#";
      link.textContent = id;
      link.className = "active";

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
  map.on('contextmenu', function (e) {
    // e.lngLat contains the geographical position of the point on the map
    var div_boat = create_div_marker()
    var marker_boat = new mapboxgl.Marker(div_boat)
      .setLngLat(e.lngLat)
      .addTo(map);

    list_markers.push(marker_boat);
  });

  // Delete marker on the map when click on it
  map.on('click', function (e) {
    console.log("cookie", document.cookie)
    console.log("lat: " + e.lngLat.lat + "\nlon: " + e.lngLat.lng)
    for (var i = 0; i < list_markers.length; i++) {
      difference_lat = Math.abs(list_markers[i].getLngLat().lat - e.lngLat.lat)
      difference_lon = Math.abs(list_markers[i].getLngLat().lng - e.lngLat.lng)
      if (difference_lat < 0.01 && difference_lon < 0.01) {
        list_markers[i].remove();
        list_markers.splice(i, 1);

      }
    }
  }
  );



  function calculateMarkerSize(markerSize = markerBoatSize) {
    var zoom = map.getZoom();
    var markerSize = Math.max(markerSize, zoom * 2);
    return markerSize;
  }

  map.on('zoom', function () {
    var markerBoatSize = calculateMarkerSize(markerBoatSize);
    for (var i = 0; i < list_markers.length; i++) {
      list_markers[i].getElement().style.width = markerBoatSize + 'px';
      list_markers[i].getElement().style.height = markerBoatSize + 'px';
    }
  });
}
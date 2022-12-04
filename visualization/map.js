mapboxgl.accessToken =
  "pk.eyJ1IjoiZmxvaGF0MzIiLCJhIjoiY2o1aWhnaXhjMXh6bzMzb2RlamR5N3lxZCJ9.wu2JL5mP4H5eFeDxpmrxNQ";

const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: [-1.57, 46.02], // starting position [lng, lat]
  zoom: 9, // starting zoom
  //interactive:false,
});


var toggle = document.querySelector(".toggle-sidebar");
var sidebar = document.querySelector(".sidebar");

var toggleFirstTheme = document.querySelector(".toggle-first-theme");
var firstTheme = document.querySelector(".first-theme");

toggle.addEventListener("click", function () {
  sidebar.classList.toggle("show-sidebar");
  toggle.classList.toggle("click-toggle");
});

toggleFirstTheme.addEventListener("click", function () {
  firstTheme.classList.toggle("show-first-theme");
  toggleFirstTheme.classList.toggle("click-toggle-theme");
});

const el = document.createElement('div');
const width = 50;
const height = 50;
el.className = 'marker';
el.style.backgroundImage = `url(../img/boat2.png)`;
el.style.width = `${width}px`;
el.style.height = `${height}px`;
el.style.backgroundSize = '100%';
  
  
// Add markers to the map.
new mapboxgl.Marker(el)
.setLngLat([-1.9, 45.9])
.addTo(map);

map.on("load", () => {
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

  map.addSource("fish.geojson", {
    type: "geojson",
    data: "../data/fish.geojson",
  });
  /* Add Layer for heatmap points */

  map.addLayer({
    id: "Poissons",
    type: "fill",
    source: "fish.geojson",
    layout: {},
    paint: {
      "fill-color": "#088",
      "fill-opacity": 0.5,
    },
  });

  map.addSource("marine_mammal.geojson", {
    type: "geojson",
    data: "../data/marine_mammal.geojson",
  });

  map.addLayer({
    id: "Mammifères marins",
    type: "fill",
    source: "marine_mammal.geojson",
    layout: {},
    paint: {
      "fill-color": "#f00",
      "fill-opacity": 0.5,
    },
  });



 

  map.addSource("safe_zone_5_noeuds.geojson", {
    type: "geojson",
    data: "../data/safe_zone_5_noeuds.geojson",
  });

  map.addLayer({
    id: "Safe zone 5 noeuds",
    type: "heatmap",
    source: "safe_zone_5_noeuds.geojson",
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

  map.addSource("hurt_zone_5_noeuds.geojson", {
    type: "geojson",
    data: "../data/hurt_zone_5_noeuds.geojson",
  });

  map.addLayer({
    id: "Hurt zone 5 noeuds",
    type: "heatmap",
    source: "hurt_zone_5_noeuds.geojson",
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

  map.addSource("dead_zone_5_noeuds.geojson", {
    type: "geojson",
    data: "../data/dead_zone_5_noeuds.geojson",
  });

  map.addLayer({
    id: "Dead zone 5 noeuds",
    type: "heatmap",
    source: "dead_zone_5_noeuds.geojson",
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

    map.addSource("safe_zone_10_noeuds.geojson", {
    type: "geojson",
    data: "../data/safe_zone_10_noeuds.geojson",
  });

  map.addLayer({
    id: "Safe zone 10 noeuds",
    type: "heatmap",
    source: "safe_zone_10_noeuds.geojson",
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

  map.addSource("hurt_zone_10_noeuds.geojson", {
    type: "geojson",
    data: "../data/hurt_zone_10_noeuds.geojson",
  });

  map.addLayer({
    id: "Hurt zone 10 noeuds",
    type: "heatmap",
    source: "hurt_zone_10_noeuds.geojson",
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

  map.addSource("dead_zone_10_noeuds.geojson", {
    type: "geojson",
    data: "../data/dead_zone_10_noeuds.geojson",
  });

  map.addLayer({
    id: "Dead zone 10 noeuds",
    type: "heatmap",
    source: "dead_zone_10_noeuds.geojson",
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
});

// After the last frame rendered before the map enters an "idle" state.
map.on("idle", () => {
  // If these two layers were not added to the map, abort
  if (
    !map.getLayer("Poissons") ||
    !map.getLayer("Mammifères marins") ||
    !map.getLayer("Hurt zone 5 noeuds") ||
    !map.getLayer("Dead zone 5 noeuds") ||
    !map.getLayer("Safe zone 5 noeuds") ||
    !map.getLayer("Hurt zone 10 noeuds") ||
    !map.getLayer("Dead zone 10 noeuds") ||
    !map.getLayer("Safe zone 10 noeuds")
  ) {
    return;
  }

  // Enumerate ids of the layers.
  const toggleableLayerIds = [
    "Poissons",
    "Mammifères marins",
    "Dead zone 5 noeuds",
    "Hurt zone 5 noeuds",
    "Safe zone 5 noeuds",
    "Dead zone 10 noeuds",
    "Hurt zone 10 noeuds",
    "Safe zone 10 noeuds",
  ];

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

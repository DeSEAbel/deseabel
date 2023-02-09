/**
 *
 * @param {string} mapbox_api_key - Mapbox API Key
 */

class MarkerObject {
    constructor(map, exact_lonlat, coordinates_lonlat, type) {
        this.map = map;
        this.exact_lonlat = exact_lonlat;
        this.coordinates_lonlat = coordinates_lonlat;
        this.type = type;
        this.is_boat = false;

        if (type == "outboard_pleasure_boat") {
            this.div = createDivMarker(`../img/boat2.png`);
            this.speed = 15;
            this.length = 6;
            this.is_boat = true;
            this.noise_impactor_metadata = noise_impactors.outboard_pleasure_boat
        } else if (type == "wind_turbine") {
            this.div = createDivMarker(`../img/eolienne.png`);
            this.noise_impactor_metadata = noise_impactors.wind_turbine
            this.decibel = this.noise_impactor_metadata.sound_level_mean;
        } else if (type == "fishing_boat") {
            this.div = createDivMarker(`../img/fishing_boat.png`);
            this.speed = 8;
            this.length = 20;
            this.is_boat = true;
            this.noise_impactor_metadata = noise_impactors.fishing_boat
        }


        this.marker = new mapboxgl.Marker(this.div)
            .setLngLat(exact_lonlat)
            .addTo(map);
        this.marker.speed = this.speed;
        this.marker.length = this.length;

        if (this.is_boat) {
            this.decibel = computeSoundLevel(
                this.marker.length,
                this.marker.speed
            );
        }
        this.marker.optim_factor = 1.0;
        this.marker.decibel = this.decibel;

        // Create popup for the marker
        console.log("create_popup");
        this.popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: true,
        })

        var html = this.createPopupHtml(this.marker, this.noise_impactor_metadata)
        this.popup.setHTML(html);

        this.addListenersPopupOnClose()
        console.log("popup created");
        this.marker.setPopup(this.popup);
        this.addPopupToMapOnClick();
    }

    createPopupHtml(marker, noise_impactor_metadata) {
        var is_boat = true;
        if (noise_impactor_metadata["name"] == "Wind turbine") {
            is_boat = false;
        }
        if (is_boat) {
            var html = '<h3>Settings</h3>\
                Speed\
                <div id="slider"><input type="range" value="' +
                marker.speed +
                '" min="0" max="' + noise_impactor_metadata.speed_max + '" class="slider" id="slider_speed" oninput="this.nextElementSibling.value = this.value">\
                <output id="slider_boat_speed_string">' +
                marker.speed.toString() + "/" + noise_impactor_metadata.speed_max + " knots" +
                '</output>\
                </div>\
                Length\
                <div id="slider"><input type="range" value="' +
                marker.length +
                '" min="' + noise_impactor_metadata.length_min + '" max="' + noise_impactor_metadata.length_max + '" class="slider" id="slider_length" oninput="this.nextElementSibling.value = this.value">\
                <output id="slider_boat_length_string">' +
                marker.length.toString() + "/" + noise_impactor_metadata.length_max + " meters" +
                '</output>\
                </div>\
                <br\>\
                <button id="optim_helice_button">Optimize helice</button>\
                <br\>\
                <br\>\
                <span style="color:red;">\
                    <strong>Sound level = \
                        <output id="output_decibel_string">' +
                marker.decibel.toFixed(2).toString() + " dB" +
                '</output>\
                    </strong>\
                </span>\
                <br\>\
                <div id="delete_button"><button type="button">Delete</button></div>'
        } else {
            var html = '<h3>Settings</h3>\
            <div id="delete_button"><button type="button">Delete</button></div>\
                <span style="color:red;">\
                    <strong>\
                        <div id="slider"><input type="range" value="' +
                marker.decibel +
                '" min="' + noise_impactor_metadata.sound_level_min + '" max="' + noise_impactor_metadata.sound_level_max + '" class="slider" id="slider_decibel" oninput="this.nextElementSibling.value = this.value">\
                            <output id="slider_decibel_string">' +
                marker.decibel.toString() + "/" + noise_impactor_metadata.sound_level_max + " dB"; +
                    '</output>\
                        </div>\
                    </strong>\
                </span>\
                <br\>'
                
        }
        return html;
    }

    addPopupToMapOnClick() {
        var map = this.map;
        var marker = this.marker;
        var popup = this.popup;
        marker.getElement().addEventListener("click", function () {
            popup.addTo(map);
        });
    }

    addEventListenerSliderOnInput(popup, marker, map, coordinates_lonlat, noise_impactor_metadata, query) {
        var slider = popup._content.querySelector(query);
        slider.addEventListener("input", function () {
            if (query.includes("speed")) {
                marker.speed = slider.value;
                slider_boat_speed_string.textContent = marker.speed.toString() + "/" + noise_impactor_metadata.speed_max + " knots";
            } else if (query.includes("length")) {
                marker.length = slider.value;
                slider_boat_length_string.textContent = marker.length.toString() + "/" + noise_impactor_metadata.length_max + " meters";
            } else if (query.includes("decibel")) {
                marker.decibel = slider.value;
                slider_decibel_string.textContent = marker.decibel.toString() + "/" + noise_impactor_metadata.sound_level_max + " dB";
            }
            if (query.includes("speed") || query.includes("length")) {
                var decibel = computeSoundLevel(
                    marker.length,
                    marker.speed,
                    marker.optim_factor
                );
                output_decibel_string.textContent = decibel.toFixed(2).toString() + " dB";
                zone_of_interest.autoUpdateDecibelLayer(
                    map,
                    coordinates_lonlat,
                    decibel
                );
            } else {
                zone_of_interest.autoUpdateDecibelLayer(
                    map,
                    coordinates_lonlat,
                    marker.decibel
                );
            }
        });
    }

    addEventListenerDeleteButtonOnClick(popup, marker, map, coordinates_lonlat) {
        var delete_button = popup._content.querySelector("#delete_button");
        console.log(popup._content);
        delete_button.addEventListener("click", function () {
            var decibel = computeSoundLevel(
                marker.length,
                marker.speed,
                marker.optim_factor
            );
            marker.remove();
            zone_of_interest.autoUpdateDecibelLayer(
                map,
                coordinates_lonlat,
                decibel,
                "subtract"
            );
        });
    }

    addEventListenerOptimHeliceButtonOnClick(popup, marker, map, coordinates_lonlat) {
        var optim_helice_button = popup._content.querySelector("#optim_helice_button");
        optim_helice_button.addEventListener("click", function () {
            if (this.classList.contains("selected")) {
                this.classList.remove("selected");
                marker.optim_factor = 1.0;
            } else {
                this.classList.add("selected");
                marker.optim_factor = 0.8;
            }
            var decibel = computeSoundLevel(
                marker.length,
                marker.speed,
                marker.optim_factor
            );
            zone_of_interest.autoUpdateDecibelLayer(
                map,
                coordinates_lonlat,
                decibel
            );
            marker.decibel = slider.value;
            output_decibel_string.textContent = decibel.toFixed(2).toString() + " dB";
        });
    }


    addListenersPopupOnClose() {
        var popup = this.popup;
        var is_boat = this.is_boat;
        var marker = this.marker;
        var map = this.map;
        var coordinates_lonlat = this.coordinates_lonlat;
        var addEventListenerSliderOnInput = this.addEventListenerSliderOnInput;
        var addEventListenerDeleteButtonOnClick = this.addEventListenerDeleteButtonOnClick;
        var addEventListenerOptimHeliceButtonOnClick = this.addEventListenerOptimHeliceButtonOnClick;
        var noise_impactor_metadata = this.noise_impactor_metadata;

        popup.once("close", function () {
            if (is_boat) {
                // Add an event listener to the slider speed
                addEventListenerSliderOnInput(this, marker, map, coordinates_lonlat, noise_impactor_metadata, "#slider_speed");
                // Add an event listener to the slider length
                addEventListenerSliderOnInput(this, marker, map, coordinates_lonlat, noise_impactor_metadata, "#slider_length");
                // Add an event listener to the optim helice button
                addEventListenerOptimHeliceButtonOnClick(this, marker, map, coordinates_lonlat);
            } else {
                // Add an event listener to the slider decibel
                addEventListenerSliderOnInput(this, marker, map, coordinates_lonlat, noise_impactor_metadata, "#slider_decibel");
            }
            // Add an event listener to the delete button
            addEventListenerDeleteButtonOnClick(this, marker, map, coordinates_lonlat)
        });
    }
}
function validateMapboxApiKey() {
    if (!document.cookie) {
        console.log("No API Key");
        return;
    }
    var mapbox_api_key = document.cookie
        .split(";")
        .filter((item) => item.trim().startsWith("mapbox_api_key="))
        .pop()
        .split("=")[1];

    var dialog_box = document.getElementById("dialog-box");

    if (!mapbox_api_key) {
        console.log("No API Key");
        return;
    } else {
        console.log("API Key is certainly valid");
        // get a reference to the parent element of the dialog box
        var parentElement = dialog_box.parentNode;

        // remove the dialog box element from the parent element
        parentElement.removeChild(dialog_box);
        loadMap(mapbox_api_key);
    }
}

var submitButton = document.getElementById("submit-button");

// add a click event listener to the button
submitButton.addEventListener("click", function () {
    // get a reference to the dialog box element

    var mapbox_api_key = document.getElementById("mapbox_api_key").value;
    document.cookie =
        "mapbox_api_key=" +
        mapbox_api_key +
        " ; expires=Thu, 31 Dec 2100 12:00:00 UTC; path=/";
    validateMapboxApiKey();
});

validateMapboxApiKey();

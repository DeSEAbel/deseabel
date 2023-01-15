var submitButton = document.getElementById('submit-button');

// add a click event listener to the button
submitButton.addEventListener('click', function() {
    // get a reference to the dialog box element

    var dialogBox = document.getElementById('dialog-box');
    var mapboxApiKey=document.getElementById('mapbox_api_key').value;
    document.cookie = "mapbox_api_key="+mapboxApiKey+" ; expires=Thu, 31 Dec 2100 12:00:00 UTC; path=/";
    const cookieMapboxApiKey = document.cookie.split(';').filter((item) => item.trim().startsWith('mapbox_api_key=')).pop().split('=')[1];

    loadMap(cookieMapboxApiKey);
    
    // get a reference to the parent element of the dialog box
    var parentElement = dialogBox.parentNode;

    // remove the dialog box element from the parent element
    parentElement.removeChild(dialogBox);
});

cookieMapboxApiKey = document.cookie.split(';').filter((item) => item.trim().startsWith('mapbox_api_key='))
if (cookieMapboxApiKey.length) {
    cookieMapboxApiKey = cookieMapboxApiKey[0].trim().split('=')[1];
} else {
    cookieMapboxApiKey = '';
}

console.log("cookieMapboxKey", cookieMapboxApiKey);
if (cookieMapboxApiKey != '') {
    document.getElementById("dialog-box").style.display = "none";
    loadMap(cookieMapboxApiKey);
}

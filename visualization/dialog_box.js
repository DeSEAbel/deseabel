var submitButton = document.getElementById('submit-button');

// add a click event listener to the button
submitButton.addEventListener('click', function() {
  // get a reference to the dialog box element
  var dialogBox = document.getElementById('dialog-box');
  var mapboxApiKey=document.getElementById('mapbox_api_key').value;
  loadMap(mapboxApiKey);
  
  // get a reference to the parent element of the dialog box
  var parentElement = dialogBox.parentNode;

  // remove the dialog box element from the parent element
  parentElement.removeChild(dialogBox);
});

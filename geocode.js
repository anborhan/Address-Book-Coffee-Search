// gets data from Geocode using the address, city, and distance provided by the user
function getDataFromGeocodeApi(searchTerm, callback, meters) {
  let attempt = 0;
  const settings = {
    url: PLACES_SEARCH_URL,
    data: {
      key: "AIzaSyClAGAlVzkT-vNFM8rXYuEe3Iu-SHFS9eE",
      address: `${searchTerm}`,
    },
    json: "callback",
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      renderGeocodeResult(data, meters);
    } ,
  };

  $.ajax(settings);
}

// collects the longitude and latitude returned by the Geocode API and sends them to initMap
function renderGeocodeResult(response, meters) {
  if (response && response.results && response.results.length) {
    const result = response.results[0];
    if (result && result.geometry && result.geometry.location) {
      const coordinates1 = `${result.geometry.location.lat}`
      const coordinates2 = `${result.geometry.location.lng}`
      return initMap(coordinates1, coordinates2, meters);
    } 
  }
  //If past this line, there was an error in the Geocode Result
  //ERROR MESSAGE
  console.log("The Geocode Failed!")
  $(".address-query").after(`<div class="failureMessage fontFjallaOne backgroundWhite center">The address you entered does not exist, or something went wrong. Please try again.</div>`)
}

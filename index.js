const PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json";

function getDataFromApi(searchTerm, callback) {
  const query = {
    key: "AIzaSyClAGAlVzkT-vNFM8rXYuEe3Iu-SHFS9eE",
    address: `${searchTerm}`,
  }

  $.getJSON(PLACES_SEARCH_URL, query, callback);
}

function renderResult(result) {

  const coordinates1 = `${result.geometry.location.lat}`
  const coordinates2 = `${result.geometry.location.lng}`
  initMap(coordinates1, coordinates2);
}

function displayBookstoreData(data) {
  const results = data.results.map((item, index) => renderResult(item));
  $(`.places-search-results`).html(results);
}

function watchSubmit() {
  $(`.places-search`).submit(event => {
    event.preventDefault();
    const query1 = $(".address-query").val();
    const query2 = $(".city-query").val();
    const queryCombined = `${query1} ${query2}`
    getDataFromApi(queryCombined, displayBookstoreData);
    $("#map").show('slow');
  });
}


///////////////////////////////////////////////////////////////////////

var map;
var infowindow;

function initMap(num1, num2) {
  var lat1 = parseFloat(num1);
  var lng1 = parseFloat(num2);
  var pyrmont = {lat: lat1, lng: lng1};

  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: 15
  });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pyrmont,
          radius: 1000,
          type: ['store'],
          keyword: ['coffee']
        }, callback);
        service.nearbySearch({
          location: pyrmont,
          radius: 1000,
          type: ['store'],
          keyword: ['used bookstore']
        }, callback);
      }

      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
          }
        }
      }

      function createMarker(place) {
        const places = [place]
        places.forEach(function(item){
          if (place.types.includes('book_store')) {
            $(".places-search-results").append(`${place.name}, ${place.vicinity}, ${place.rating}`
            + '<br>')
          } else {
            $(".places-search-results2").append(`${place.name}, ${place.vicinity}, ${place.rating}`
              + '<br>');
          }
        })
        console.log(place);
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(place.name);
          infowindow.open(map, this);
        });
      }

///////////////////////////////////////////////////////////////////////////////////

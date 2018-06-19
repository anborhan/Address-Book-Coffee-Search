const PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const BOOK_ENTRY_URL = "https://tastedive.com/api/similar?"

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
  let lat1 = parseFloat(num1);
  let lng1 = parseFloat(num2);
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

function getDataFromTasteDiveApi(searchTerm, callback) {
  const settings = {
    url: BOOK_ENTRY_URL,
    data: {
      q: `${searchTerm}`,
    type: "books",
    info: 1,
    limit: 20,
    k: "310938-Coffeean-LGCO6BCH",
    },
    jsonp: "callback",
    dataType: 'jsonp',
    type: 'GET',
    success: function(data) {
      console.log(data);
    } ,
  };

  $.ajax(settings);
}

function renderTasteResult(result) {
  console.log(results);
}

function displayBookRecommendation(data) {
  const results = data.results.map((item, index) => renderTasteResult(item));
}

function watchTasteSubmit() {
  $('.places-search').submit(event => {
    event.preventDefault();
    const queryTasteTarget = $(event.currentTarget).find('.favorite');
    const queryTaste = queryTasteTarget.val();
    console.log(queryTaste);
    queryTasteTarget.val("");
    getDataFromTasteDiveApi(queryTaste, displayBookRecommendation2);
  })
}

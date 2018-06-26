const PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const BOOK_ENTRY_URL = "https://tastedive.com/api/similar?"

function getDataFromGeocodeApi(searchTerm, callback, meters) {
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
function renderGeocodeResult(result, meters) {
  const coordinates1 = `${result.results[0].geometry.location.lat}`
  const coordinates2 = `${result.results[0].geometry.location.lng}`
  initMap(coordinates1, coordinates2, meters);
}

function watchAddressSubmit() {
  $(`.places-search`).submit(event => {
    event.preventDefault();
    $('.bookstores').html("");
    $('.coffeeShops').html("");    
    const meters = $("#meter").val();
    const query1 = $(".address-query").val();
    const query2 = $(".city-query").val();
    const queryCombined = `${query1} ${query2}`
    getDataFromGeocodeApi(queryCombined, renderGeocodeResult, meters);
    pageAppear();
  });
}

function passToMaps() {
  initMap(coordinates1, coordinates2, radius);

}

function pageAppear() {
    $("#map").removeClass("hidden");
    $(".tasteEntry").removeClass("hidden");
    $(".bookstoresTitle").removeClass("hidden");
    $(".coffeeShopsTitle").removeClass("hidden");
    $(".bookstoreResults").removeClass("hidden");
    $(".coffeeStoreResults").removeClass("hidden");
}

///////////////////////////////////////////////////////////////////////

var map;
var infowindow;

function initMap(num1, num2, meters) {
  let lat1 = parseFloat(num1);
  let lng1 = parseFloat(num2);
  var pyrmont = {lat: lat1, lng: lng1};
  
  const zoom = function(meters) {
      if (meters == 1000) {
      return 14;
    } else if (meters == 5000) {
      return 12;
    } else if (meters == 10000) {
      return 11;
    }
  }

  map = new google.maps.Map(document.getElementById('map'), {
    center: pyrmont,
    zoom: zoom(meters)
  });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pyrmont,
          radius: meters,
          type: ['store'],
          keyword: ['coffee']
        }, callbackMap);
        service.nearbySearch({
          location: pyrmont,
          radius: meters,
          type: ['store'],
          keyword: ['used bookstore']
        }, callbackMap);
      }

      function callbackMap(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
          }
        }
      }

      function createMarker(place) {

        const coffeeMug = {
          icon: 'https://i.imgur.com/0hAu6U0.png'
        }

        const bookstoreIcon = {
          icon: 'https://i.imgur.com/5UX7fVw.png'
        }

        const places = [place];
        places.forEach(function(item){
//          if (place.name.includes('Starbucks') || place.name.includes('Dunkin\' Donuts')){
//          } else 
          if (place.types.includes('book_store')) {
            $(".bookstores").append(`${place.name}, ${place.vicinity}, ${place.rating}`
            + '<br>')
          } else {
            $(".coffeeShops").append(`${place.name}, ${place.vicinity}, ${place.rating}`
              + '<br>');
          }
        })
        var placeLoc = place.geometry.location;
        if (place.types.includes('book_store')) {
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          icon: bookstoreIcon.icon
        });
        } else {
          var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          icon: coffeeMug.icon
        });  
        }

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
      renderTasteResult(data);
    } ,
  };

  $.ajax(settings);
}

function renderTasteResult(result) {
  if (result.Similar.Results[0] == null) {
    console.log("oops!");
  }
  $('.book-results').html("");
  $(".book-results").append(`<h3>${result.Similar.Results[0].Name}</h3>`);
  $(".book-results").append(`${result.Similar.Results[0].wTeaser}` + '<br>');
  $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[0].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
  tryAnotherBook(result);
}

function tryAnotherBook(result) {
  let counter = 0;
  let suggestionLength = result.Similar.Results.length - 2;
  $(".bookSuggest").on("click", function(){
    if (counter <= suggestionLength) {
    counter++;
    $('.book-results').html("");
    $(".book-results").append(`<h3>${result.Similar.Results[counter].Name}</h3>`);
    $(".book-results").append(`${result.Similar.Results[counter].wTeaser}` + '<br>');
    $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[counter].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
    } else {
      counter = -1;
      counter++;
      $('.book-results').html("");
    $(".book-results").append(`<h3>${result.Similar.Results[counter].Name}</h3>`);
      $(".book-results").append(`${result.Similar.Results[counter].wTeaser}` + '<br>');
      $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[counter].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
    }
  });
}

function displayBookRecommendation(data) {
  const results = data.results.map((item, index) => renderTasteResult(item));
  $(`.book-results`).html(results);
}

function watchTasteSubmit() {
  $('.tasteEntry').submit(event => {
    $(".suggestionBox").removeClass("hidden");
    event.preventDefault();
    const queryTasteTarget = $(event.currentTarget).find('.favorite');
    const queryTaste = queryTasteTarget.val();
    queryTasteTarget.val("");
    getDataFromTasteDiveApi(queryTaste, displayBookRecommendation);
  })
}

$(function(){
  watchAddressSubmit();
  watchTasteSubmit();
})
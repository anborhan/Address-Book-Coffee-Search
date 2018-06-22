const PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const BOOK_ENTRY_URL = "https://tastedive.com/api/similar?"
let DISTANCE = 1000;

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
    $('.bookstores').html("");
    $('.coffeeShops').html("");    
    DISTANCE = $("#myList").val();
    const query1 = $(".address-query").val();
    const query2 = $(".city-query").val();
    const queryCombined = `${query1} ${query2}`
    getDataFromApi(queryCombined, displayBookstoreData);
    $("#map").removeClass("hidden");
    $(".tasteEntry").removeClass("hidden");
    $(".bookstoresTitle").removeClass("hidden");
    $(".coffeeShopsTitle").removeClass("hidden");
    $(".bookstoreResults").removeClass("hidden");
    $(".coffeeStoreResults").removeClass("hidden");
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
          radius: DISTANCE,
          type: ['store'],
          keyword: ['coffee']
        }, callbackMap);
        service.nearbySearch({
          location: pyrmont,
          radius: DISTANCE,
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
  console.log(result)
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
  watchSubmit();
  watchTasteSubmit();
})
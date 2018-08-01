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
  $(".places-search").submit(event => {
    event.preventDefault();
    $(".suggestionBox").removeClass("hidden");
    const queryTasteTarget = $(event.currentTarget).find(".favorite");
    const queryTaste = queryTasteTarget.val();
    queryTasteTarget.val("");
    getDataFromTasteDiveApi(queryTaste, displayBookRecommendation);
    revealMap();
    $(".bookstores").html("");
    $(".coffeeShops").html("");    
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
  $(".tasteEntry").removeClass("hidden");
}
///////////////////////////////////////////////////////////////////////

const ICON_COFFEE_MUG = 'https://i.imgur.com/IDt1OoX.png';

const ICON_BOOKSTORE = 'https://i.imgur.com/fhQX3sf.png';

///////////////////////////////////////////////////////////////////////

var map;
var infowindow;

function initMap(num1, num2, meters) {
  let lat1 = parseFloat(num1);
  let lng1 = parseFloat(num2);
  var pyrmont = {lat: lat1, lng: lng1};
  
  const zoom = function(meters) {
  let metersNum = parseInt(meters);
      if (metersNum === 1000) {
      return 14;
    } else if (metersNum === 5000) {
      return 12;
    } else {
      return 11;
    }
  }

  map = new google.maps.Map(document.getElementById("map"), {
    center: pyrmont,
    zoom: zoom(meters)
  });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pyrmont,
          radius: meters || 1000,
          type: ['store'],
          keyword: ['coffee']
        }, renderCoffeeShops);
        service.nearbySearch({
          location: pyrmont,
          radius: meters || 1000,
          type: ['store'],
          keyword: ['used bookstore']
        }, renderBookstores);
      }

function createBookstoreMarker(place, icon) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: icon
  });
  
  google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
  });
}

function createCoffeeMarker(place, icon) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: icon
  }); 

  google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(place.name);
      infowindow.open(map, this);
  });
}


function renderBookstores(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (let i = 0; i < results.length; i++) {
      let place = results[i];
      if (place.rating >= 4 && place.types.includes('book_store')) {
        createBookstoreMarker(place, ICON_BOOKSTORE);
        listBookstore(place);
      }
    }
  }
}

function renderCoffeeShops(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      let place = results[i];
      if (place.rating >= 4 && place.types.includes('cafe')) {
        createCoffeeMarker(results[i], ICON_COFFEE_MUG);
        listCoffeeShop(place);
      }
    }
  }
}

function listBookstore(place) {
  $(".bookstores").append(`<a href="https://maps.google.com/?q=${place.name}" target="_blank">${place.name}</a>, ${place.vicinity}, ${place.rating}`
  + '<br>')
}

function listCoffeeShop(place) {
  $(".coffeeShops").append(`<a href="https://maps.google.com/?q=${place.name}" target="_blank">${place.name}</a>, ${place.vicinity}, ${place.rating}`
  + '<br>');
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
  $(".book-results").append(`<p class="suggestion">${result.Similar.Results[0].wTeaser}</p>` + '<br>');
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
    $(".book-results").append(`<p class="suggestion">${result.Similar.Results[counter].wTeaser}</p>` + '<br>');
    $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[counter].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
    } else {
      counter = -1;
      counter++;
      $('.book-results').html("");
    $(".book-results").append(`<h3>${result.Similar.Results[counter].Name}</h3>`);
      $(".book-results").append(`<p class="suggestion">${result.Similar.Results[counter].wTeaser}</p>` + '<br>');
    $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[counter].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
    }
  });
}

function displayBookRecommendation(data) {
  const results = data.results.map((item, index) => renderTasteResult(item));
  $(`.book-results`).html(results);
}

/*function watchTasteSubmit() {
  $('.tasteEntry').submit(event => {
    $(".suggestionBox").removeClass("hidden");
    event.preventDefault();
    const queryTasteTarget = $(event.currentTarget).find('.favorite');
    const queryTaste = queryTasteTarget.val();
    queryTasteTarget.val("");
    getDataFromTasteDiveApi(queryTaste, displayBookRecommendation);
    revealMap();
  })
}*/

function revealMap() {
  $('body').animate({
    'background-position-y': "-1920px"}, "slow"
  );
  $(".selectionMenu").slideUp();
  $("#map").removeClass("hidden");
  $(".sectionOne").removeClass("hidden");
  $(".centered").removeClass("hidden");
  $(".bookSuggest").removeClass("hidden");
  $(".coffeeStoreResults").removeClass("hidden");
  $(".resetPage").removeClass("hidden");
}

function resetSearch() {
  $(".resetButton").on("click", function(){
    $('body').animate({
      'background-position-y': "0"}, "slow"
    );
    $(".selectionMenu").slideDown();
    $("#map").addClass("hidden");
    $(".sectionOne").addClass("hidden");
    $(".centered").addClass("hidden");
    $(".bookSuggest").addClass("hidden");
    $(".coffeeStoreResults").addClass("hidden");
    $(".resetPage").addClass("hidden");
    $(".places-search")[0].reset();
  });
}

function resetForms() {
  $(".places-search")[0].reset();
}

$(function(){
  watchAddressSubmit();
  resetForms();
  resetSearch();
})

///////////////////////////
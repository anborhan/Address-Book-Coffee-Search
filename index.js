/* aria-label="search" */

const PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const BOOK_ENTRY_URL = "https://tastedive.com/api/similar?"

// accepts data from the user-submitted form and runs the appropriate functions
function watchAddressSubmit() {
  $(".places-search").submit(event => {
    event.preventDefault();

    // retrieves the address, city, and distance information and runs it through Geocode API
    const meters = $("#meter").val();
    const query1 = $(".address-query").val();
    const query2 = $(".city-query").val();
    const queryCombined = `${query1} ${query2}`
    const geocode = getDataFromGeocodeApi(queryCombined, renderGeocodeResult, meters);

    // sends the user's favorite book information to the TasteDive API
    const queryTasteTarget = $(event.currentTarget).find(".favorite");
    queryTaste = queryTasteTarget.val();
    getDataFromTasteDiveApi(queryTaste, displayBookRecommendation);

    // blanks out all relevant values
    queryTasteTarget.val("");
    $(".bookstores").html("");
    $(".coffeeShops").html("");
  });
}

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
function renderGeocodeResult(result, meters) {
  const coordinates1 = `${result.results[0].geometry.location.lat}`
  const coordinates2 = `${result.results[0].geometry.location.lng}`
  initMap(coordinates1, coordinates2, meters);
}

///////////////////////////////////////////////////////////////////////

const ICON_COFFEE_MUG = 'https://i.imgur.com/IDt1OoX.png';

const ICON_BOOKSTORE = 'https://i.imgur.com/fhQX3sf.png';

///////////////////////////////////////////////////////////////////////

let map;
let infowindow;

// creates the map
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
  findNearbyShops(service, pyrmont, meters) 
}

// locates shops using the processing functions, utilizing the user's information
function findNearbyShops(service, location, radius) {
  service.nearbySearch({
    location: location,
    radius: radius || 1000,
    type: ['store'],
    keyword: ['coffee']
  }, processCoffeeShops);
  service.nearbySearch({
    location: location,
    radius: radius || 1000,
    type: ['store'],
    keyword: ['used bookstore']
  }, processBookstores);
}

function displayTotalResultsNoBook() {
  $(".resultsSummary").append(`Check out your bookstore and coffee shop results! Unfortunately, I could not find a book recommendation based on your input.`)
}

function displayTotalResults(suggestion) {
  $(".resultsSummary").append(`Check out your <a class = "hiddenPhoneText" href="#bookstores">bookstore</a><a class = "hiddenWideScreen" href="#bookstores2">bookstore</a> and <a href="#coffeeshops">coffee shop</a> results! I think you'll like <a href="#suggestion">${suggestion}</a> based on your tastes.`)
}

// generates a bookstore marker for each store
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

//vvvvv MAP GENERATED HERE vvvvv//
// generates a coffee shop marker for each store (AND GENERATES MAP)
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

  // reveals the second page to the user
  revealMap();
}

// sorts out bookstores using the filter function, then sends them to be rendered
function processBookstores(results, status) {
  const filteredBookstores = results.filter(filterBookstore);
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    renderBookstores(filteredBookstores);
  }
}

// filters bookstores through specific requirements
function filterBookstore(place) {
  return (place.rating >= 4 && place.types.includes('book_store'));
}

// calls for markers to be placed and bookstores to be listed
function renderBookstores(results, status) {
  for (let i = 0; i < results.length; i++) {
    let place = results[i];
      createBookstoreMarker(place, ICON_BOOKSTORE);
      listBookstore(place);
  }  
}

// sorts out coffee shops using the filter function, then sends them to be rendered
function processCoffeeShops(results, status) {
  const filteredCoffeeShops = results.filter(filterCoffeeshop);
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    renderCoffeeShops(filteredCoffeeShops);
  }
}

// filters coffee shops through specific requirements
function filterCoffeeshop(place) {
  return (place.rating >= 4 && place.types.includes('cafe'));
}

// calls for markers to be placed and coffee shops to be listed
function renderCoffeeShops(results, status) {
  for (let i = 0; i < results.length; i++) {
    let place = results[i];
        createCoffeeMarker(place, ICON_COFFEE_MUG);
        listCoffeeShop(place);
  }
}

// lists each bookstore on the front end
function listBookstore(place) {
  $(".bookstores").append(`<a href="https://maps.google.com/?q=${place.name}" target="_blank">${place.name}</a>, ${place.vicinity}, ${place.rating}`
  + '<br>')
}

// lists each coffee shop on the front end
function listCoffeeShop(place) {
  $(".coffeeShops").append(`<a href="https://maps.google.com/?q=${place.name}" target="_blank">${place.name}</a>, ${place.vicinity}, ${place.rating}`
  + '<br>');
}


///////////////////////////////////////////////////////////////////////////////////

// retrieves data from Taste Dive with user's input
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

// renders the Taste Dive recommendation on the front end
function renderTasteResult(result) {

  // provides a result if the user enters something that isn't a book or author, or if the API doesn't have that particular book in the system
  if (result.Similar.Results[0] == null) {
    $(".bookSuggest").addClass("hidden");
    $('.book-results').html("");
    $(".book-results").append("Your entry wasn\'t found! Please make a new search and try again.");
    displayTotalResultsNoBook();
  } else {

  // provides a recommendation to the user for a book or series
    $('.book-results').html("");
    $(".book-results").append(`<h3>${result.Similar.Results[0].Name}</h3>`);
    $(".book-results").append(`<p class="suggestion">${result.Similar.Results[0].wTeaser}</p>` + '<br>');
    $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[0].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
    tryAnotherBook(result);
    displayTotalResults(result.Similar.Results[0].Name);
  }
}

//allows user to see another book result by scrolling through a set number (20) of results from the Taste Dive API
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
      counter = 0;
      $('.book-results').html("");
    $(".book-results").append(`<h3>${result.Similar.Results[counter].Name}</h3>`);
      $(".book-results").append(`<p class="suggestion">${result.Similar.Results[counter].wTeaser}</p>` + '<br>');
    $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.Similar.Results[counter].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
    }
  });
}

// a callback function for the Taste Dive API
function displayBookRecommendation(data) {
  const results = data.results.map((item, index) => renderTasteResult(item));
  $(`.book-results`).html(results);
}

// reveals the "back page" after the user submits the required information
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
  $(".tasteEntry").removeClass("hidden");
  $(".resultsSummary").removeClass("hidden");
}

// resets the page back to the original menu upon user request
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

// resets the form
function resetForms() {
  $(".places-search")[0].reset();
}

$(function(){
  watchAddressSubmit();
  resetForms();
  resetSearch();
})

///////////////////////////
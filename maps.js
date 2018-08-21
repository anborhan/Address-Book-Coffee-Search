///////////////////////////////////////////////////////////////////////

const ICON_COFFEE_MUG = 'https://i.imgur.com/IDt1OoX.png';

const ICON_BOOKSTORE = 'https://i.imgur.com/fhQX3sf.png';

///////////////////////////////////////////////////////////////////////

let map;
let infowindow;

// creates the map
function initMap(num1, num2, meters) {
  if (arguments.length === 3) {
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

    $map = $('#map')

    map = new google.maps.Map(document.getElementById("map"), {
      center: pyrmont,
      zoom: zoom(meters),
    });

    // Set tabindex on all <a> elements once map has loaded
    listener = map.addListener('tilesloaded', function(){
    $map.find('a').attr('tabindex', -1)
    google.maps.event.removeListener(listener)
  });

    infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    return findNearbyShops(service, pyrmont, meters) 
    .then(function(results){
      return getDataFromTasteDiveApi(QUERY_TASTE, displayBookRecommendation)
      .then(function(data){
        const book = ( data && data.Similar && data.Similar.Results && data.Similar.Results.length && data.Similar.Results[0].Name ) || "";
        console.log('book:', book);
        return {
          coffeeShops: results.coffeeShops,
          bookstores: results.bookstores,
          book: book
        }
      });
    }) 
    .then(displayTotalResults)
  } else {
      $(".buttonBegin").prop("disabled", false);
  }
}

function mapRemoveTabIndex() {
  $(document).keydown(function(event){
    if ("tab" === event.key.toLowerCase()) {
      $("#map *").attr("tabIndex", -1);
    }
  })
}

function findCoffeeShops(service, location, radius){
  return new Promise(function(resolve, reject){

    service.nearbySearch({
      location: location,
      radius: radius || 1000,
      type: ['store'],
      keyword: ['coffee']
    }, function(results, status){
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        return resolve(results);
      }
      else {
        return reject(new Error("Failed to find coffee shops (PlaceServiceStatus:" + google.maps.places.PlacesServiceStatus + ")"));
      }
    });
  });

}

function findBookStores(service, location, radius){
  return new Promise(function(resolve, reject){

    service.nearbySearch({
      location: location,
      radius: radius || 1000,
      type: ['store'],
      keyword: ['used bookstore']
    }, function(results, status){
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        return resolve(results);
      }
      else {
        return reject(new Error("Failed to find coffee shops (PlaceServiceStatus:" + google.maps.places.PlacesServiceStatus + ")"));
      }
    });
  });
}

// locates shops using the processing functions, utilizing the user's information
function findNearbyShops(service, location, radius) {
  let coffeeShops;
  return findCoffeeShops(service, location, radius)
  // find and filter coffee shops
  .then( function(_coffeeShops){

    coffeeShops = _coffeeShops.filter(filterCoffeeshop);
    renderCoffeeShops(coffeeShops);

    // find and filter bookstores
    return findBookStores(service, location, radius)
    .then( function (bookstores){
      return  bookstores.filter(filterBookstore);
    })
    .catch(function(err){
      // catch a book store error
      console.log("Something went wrong with findBookStores!", err)
    })
  
  })
  .catch(function(err){
    // catch a book store or coffee shop error
    console.log("Something went wrong with bookstores/coffee shops", err)
  })
  .then(function(bookstores){
    
    renderBookstores(bookstores);

    // reveals the second page to the user
    revealMap();
    return {
      bookstores: bookstores || [],
      coffeeShops: coffeeShops || []
    }
  });
}

function displayTotalResults(results) {
  if (results.book) {
    $(".resultsSummary").html(`I found <a class = "widescreenOnly" href="#bookstores">${results.bookstores.length} bookstores</a><a class = "mobileOnly" href="#bookstores2">${results.bookstores.length} bookstores</a> and <a href="#coffeeshops">${results.coffeeShops.length} coffee shops</a> in your area! I think you'll like <a href="#suggestion">${results.book}</a> based on your tastes.`)
  } else {
   $(".resultsSummary").html(`I found <a class = "widescreenOnly" href="#bookstores">${results.bookstores.length} bookstores</a><a class = "mobileOnly" href="#bookstores2">${results.bookstores.length} bookstores</a> and <a href="#coffeeshops">${results.coffeeShops.length} coffee shops</a> in your area! Unfortunately, I couldn't find a <a href="#suggestion">suggestion</a> for a book based on your information.`)
  }
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
      listBookstore(place, i);
  }  
}

// sorts out coffee shops using the filter function, then sends them to be rendered
function processCoffeeShops(results, status) {
  const filteredCoffeeShops = results.filter(filterCoffeeshop);
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    renderCoffeeShops(filteredCoffeeShops);
  }

  // reveals the second page to the user
  revealMap();
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
        listCoffeeShop(place, i);
  }
}

// lists each bookstore on the front end
function listBookstore(place, index) {
 // const bookstoreBaseIndex = 100;
 // let counter = bookstoreBaseIndex + index; 
  //var encoded = encodeURIComponent(place.vicinity);
  $(".bookstores").append(`<li class="listLocations"><label><a href="https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.id}" target="_blank">${place.name}</a> <address>${place.vicinity}</address></label> <span class="rating">- Rating: ${place.rating}</span></li>`);
}

// lists each coffee shop on the front end
function listCoffeeShop(place, index) {
  //const coffeeShopBaseIndex = 4;
  //let counter = coffeeShopBaseIndex + index;
  $(".coffeeShops").append(`<li class="listLocations"><label><a href="https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.id}" target="_blank">${place.name}</a> <address>${place.vicinity}</address></label> <span class="rating">- Rating: ${place.rating}</span></li>`);
}
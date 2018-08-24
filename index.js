/* aria-label="search" */

const PLACES_SEARCH_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const BOOK_ENTRY_URL = "https://tastedive.com/api/similar?";
let QUERY_TASTE;

// accepts data from the user-submitted form and runs the appropriate functions
function watchAddressSubmit() {
  $(".places-search").submit(event => {
    event.preventDefault();
    mapRemoveTabIndex();

    // retrieves the address, city, and distance information and runs it through Geocode API
    const meters = $("#meter").val();
    const query1 = $(".address-query").val();
    const query2 = $(".city-query").val();
    const queryCombined = `${query1} ${query2}`
    const geocode = getDataFromGeocodeApi(queryCombined, renderGeocodeResult, meters);

    // sends the user's favorite book information to the TasteDive API
    const queryTasteTarget = $(event.currentTarget).find(".favorite");
    QUERY_TASTE = queryTasteTarget.val();

    // blanks out all relevant values
    queryTasteTarget.val("");
    $(".bookstores").html("");
    $(".coffeeShops").html("");
  });
}

///////////////////////////////////////////////////////////////////////////////////

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
  $(".failureMessage").remove();
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

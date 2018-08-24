let COUNTER_TASTEDIVE = 0;

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
      if (data && data.Similar && data.Similar.Results && data.Similar.Results.length) {
        renderInitialResult(data.Similar.Results);
      } else {
        renderNewEntryForm();
      }
    } ,
  };

  return $.ajax(settings);
}

// renders the Taste Dive recommendation on the front end
function renderInitialResult(results) {
  const result = results[0]
  // provides a result if the user enters something that isn't a book or author, or if the API doesn't have that particular book in the system
  if (!results) {
    $(".bookSuggest").addClass("hidden");
    $('.book-results').html("");
    $(".book-results").append("Your entry wasn\'t found! Please make a new search and try again.");
  } else {

  // provides a recommendation to the user for a book or series
  $('.book-results').html("");
  $(".book-results").append(`<h3>${result.Name}</h3>`);
  $(".book-results").append(`<p class="suggestion">${result.wTeaser}</p>` + '<br>');
  $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result.wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");
  tryAnotherBook(results);
}
}

function renderNewEntryForm() {
  $(".bookSuggest").addClass("hidden");
  $('.book-results').html("");
  $(".book-results").append(`<form action="#" class="tastediveSecondAttempt center borderCurved fontAverage">
    <fieldset class="entryForm fontAverage">
    <label for="favoriteBookTwo">Your entry did not return any results! Please enter another favorite book or author</label>
    <input type="text" id="favoriteBookTwo" class="favoriteTwo center" placeholder="Moby Dick" required>
    </fieldset>
    <div class="relative">
    <button class="buttonResubmit buttonNew center textShadow" type="submit">Enter a new favorite book!</button>
    </div>
    </form>`)
  newTasteSearch();
}

function newTasteSearch() {
  $(".tastediveSecondAttempt").submit(event => {
    event.preventDefault();
    $(".buttonResubmit").addClass("hidden");
    const queryTasteTwo = $(event.currentTarget).find(".favoriteTwo");
    queryNew = queryTasteTwo.val();
    getDataFromTasteDiveApi(queryNew, displayBookRecommendation)
    $(".bookSuggest").removeClass("hidden");
  });
}

//allows user to see another book result by scrolling through a set number (20) of results from the Taste Dive API
function tryAnotherBook(result) {
  let counter = 0;
  let suggestionLength = result.length - 2;
  $(".bookSuggest").on("click", function(){
    if (counter <= suggestionLength) {
      counter++;
    } else {
      counter = 0;
    }
    $('.book-results').html("");
    $(".book-results").append(`<h3>${result[counter].Name}</h3>`);
    $(".book-results").append(`<p class="suggestion">${result[counter].wTeaser}</p>` + '<br>');
    $(".book-results").append("<a class=\"bookLink\" href=\"" + `${result[counter].wUrl}` + "\" target=\"_blank\">Click here to learn more!</a>");  
  });
}

// a callback function for the Taste Dive API
function displayBookRecommendation(data) {
  const results = data.results.map((item, index) => renderInitialResult(item));
  $(`.book-results`).html(results);
}

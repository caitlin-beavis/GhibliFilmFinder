// Data source: Studio Ghibli API, https://ghibliapi.vercel.app/films
// Fetch reference: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
const apiUrl = "https://ghibliapi.vercel.app/films";
let allFilms = [];

const searchForm = document.getElementById("search-form");
const results = document.getElementById("film-results");
const statusMessage = document.getElementById("results-status");
const details = document.getElementById("details-content");

async function loadFilms() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("API error");

    allFilms = await response.json();
    if (!Array.isArray(allFilms)) throw new Error("Unexpected data");

    const filmChoice = document.getElementById("film-choice");
    for (const film of allFilms) {
      const option = document.createElement("option");
      option.value = film.id;
      option.textContent = film.title;
      filmChoice.appendChild(option);
    }

    searchFilms();
  } catch (error) {
    statusMessage.textContent = "Sorry, the films could not be loaded. Please try refreshing the page.";
  }
}

function searchFilms() {
  const searchText = document.getElementById("search-title").value.toLowerCase();
  const sortOrder = document.getElementById("sort-films").value;
  const highRating = document.getElementById("high-rating").checked;

  let matchingFilms = allFilms.filter(function(film) {
    const titleMatches = film.title.toLowerCase().includes(searchText);
    const ratingMatches = !highRating || Number(film.rt_score) >= 90;
    return titleMatches && ratingMatches;
  });

  if (sortOrder === "newest") {
    matchingFilms.sort((a, b) => Number(b.release_date) - Number(a.release_date));
  } else {
    matchingFilms.sort((a, b) => a.title.localeCompare(b.title));
  }

  showFilms(matchingFilms);
}

function showFilms(films) {
  results.replaceChildren();
  statusMessage.textContent = films.length + " films found.";

  for (const film of films) {
    const card = document.createElement("li");
    card.className = "film-card";

    const poster = document.createElement("img");
    poster.src = film.image;
    poster.alt = "Poster for " + film.title;
    poster.loading = "lazy";

    const title = document.createElement("h3");
    title.textContent = film.title;

    const year = document.createElement("p");
    year.textContent = "Year: " + film.release_date;

    card.append(poster, title, year);
    results.appendChild(card);
  }
}

async function showDetails(id) {
  details.textContent = "Loading details...";

  try {
    const response = await fetch(apiUrl + "/" + encodeURIComponent(id));
    if (!response.ok) throw new Error("API error");
    const film = await response.json();

    const title = document.createElement("h3");
    title.textContent = film.title;

    const information = document.createElement("p");
    information.textContent = "Director: " + film.director + " | Year: " + film.release_date + " | Running time: " + film.running_time + " minutes";

    const description = document.createElement("p");
    description.textContent = film.description;

    details.replaceChildren(title, information, description);
    document.getElementById("film-details").scrollIntoView();
  } catch (error) {
    details.textContent = "Sorry, the film details could not be loaded.";
  }
}

searchForm.addEventListener("submit", function(event) {
  event.preventDefault();
  searchFilms();
});

document.getElementById("details-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const selectedId = document.getElementById("film-choice").value;
  if (selectedId) showDetails(selectedId);
});

document.getElementById("clear-search").addEventListener("click", function() {
  searchForm.reset();
  searchFilms();
});

loadFilms();

import { init, createHtml, displayNoResult } from "./movieApp";
import { movieSort } from "./functions";
import { IMovie } from "./models/Movie";

// Lägg till eventlyssnare för sortering när sidan laddas
document.addEventListener("DOMContentLoaded", () => {
  const sortButton = document.getElementById("sortButton");
  if (sortButton) {
    sortButton.addEventListener("click", handleSort);
  }
});

// Funktion för att sortera filmer
const handleSort = () => {
  const sortOrderSelect = document.getElementById(
    "sortOrder"
  ) as HTMLSelectElement;
  const sortOrder = sortOrderSelect.value === "asc";

  // Hämta filmerna från DOMen
  const movieElements = document.querySelectorAll(".movie");

  // Skapa en array med filmobjekt från DOM-elementen
  const movies: IMovie[] = [];
  movieElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      movies.push({
        Title: (element.querySelector("h3")?.textContent || "").trim(),
        imdbID: element.dataset.imdbid || "",
        Type: element.dataset.type || "",
        Poster: element.querySelector("img")?.src || "",
        Year: element.dataset.year || "",
      });
    }
  }); 

  // Sortera filmerna
  const sortedMovies = movieSort(movies, sortOrder);

  // Rensa befintliga filmer från DOMen
  const movieContainer = document.getElementById("movie-container");
  if (movieContainer instanceof HTMLDivElement) {
    movieContainer.innerHTML = "";

    // Skapa HTML för de sorterade filmerna och lägg till dem i DOMen
    if (sortedMovies.length > 0) {
      createHtml(sortedMovies, movieContainer);
    } else {
      displayNoResult(movieContainer);
    }
  }
};

// Initialisera applikationen
init();

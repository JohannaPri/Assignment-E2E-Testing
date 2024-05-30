import { movieSort } from "../../src/ts/functions";

beforeEach(() => {
  cy.visit("/");
});

describe("DOM elements tests", () => {
  it("should contain an input field", () => {
    cy.get("#searchText").should("exist");
  });

  it("should contain a submit button with text 'Sök'", () => {
    cy.get("#search").should("exist").and("contain", "Sök");
  });

  it("should be able to type in the search input field", () => {
    cy.get("#searchText").type("something").should("have.value", "something");
  });

  it("should display an error message when the search text is empty", () => {
    cy.get("#searchText").type(" ");
    cy.get("#search").click();
    cy.get("#movie-container").should("exist");
    cy.get("p").should("exist").and("contain", "Inga");
  });

  it("should display multiple results on valid search", () => { 
    cy.get("#searchText").type("Avatar");
    cy.get("#search").click();
    cy.get("#movie-container").children().should("have.length.at.least", 1);
  });

  it("should contain a sort order select element", () => {
    cy.get("#sortOrder").should("exist");
  });

  it("should contain a sort button with text 'Sort Movies'", () => {
    cy.get("#sortButton").should("exist").and("contain", "Sort Movies");
  });

  it("should display sort label and select element", () => {
    cy.get("label[for='sortOrder']").should("exist").and("contain", "Sort Order:");
    cy.get("#sortOrder").should("exist").and("have.attr", "id", "sortOrder");
  });

  it("should display Ascending and Descending options in select element", () => {
    cy.get("#sortOrder").should("exist").within(() => {
      cy.get("option[value='asc']").should("exist").and("contain", "Ascending");
      cy.get("option[value='desc']").should("exist").and("contain", "Descending");
    });
  });

  it("should sort movies in ascending order when 'Ascending' is selected", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "omdbResponse",
    }).as("omdbCall");

    cy.get("#searchText").type("Avatar");
    cy.get("#search").click();
    cy.wait("@omdbCall");

    cy.get("#sortOrder").select("asc");
    cy.get("#sortButton").click();

    cy.get("#movie-container .movie h3").then((titles) => {
      const texts = [...titles].map(title => title.textContent?.trim() || "");
      const sortedTexts = [...texts].sort();
      expect(texts).to.deep.equal(sortedTexts);
    });
  });

  it("should sort movies in descending order when 'Descending' is selected", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "omdbResponse",
    }).as("omdbCall");

    cy.get("#searchText").type("Avatar");
    cy.get("#search").click();
    cy.wait("@omdbCall");

    cy.get("#sortOrder").select("desc");
    cy.get("#sortButton").click();

    cy.get("#movie-container .movie h3").then((titles) => {
      const texts = [...titles].map(title => title.textContent?.trim() || "");
      const sortedTexts = [...texts].sort().reverse();
      expect(texts).to.deep.equal(sortedTexts);
    });
  });

  it("should not throw error when sorting without selecting sort order", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "omdbResponse",
    }).as("omdbCall");

    cy.get("#searchText").type("Avatar");
    cy.get("#search").click();
    cy.wait("@omdbCall");

    cy.get("#sortButton").click();

    cy.get("#movie-container .movie").should("have.length", 3);
  });

  it("should maintain search results after sorting", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "omdbResponse",
    }).as("omdbCall");

    cy.get("#searchText").type("Avatar");
    cy.get("#search").click();
    cy.wait("@omdbCall");

    cy.get("#sortOrder").select("asc");
    cy.get("#sortButton").click();
    
    cy.get("#movie-container").should("contain", "Avatar");
  });
});

describe("mock data tests", () => {
  it("should get mock data with correct url", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "omdbResponse",
    }).as("omdbCall");
    cy.get("#searchText").type("Avatar");

    cy.get("#search").click();

    cy.wait("@omdbCall").its("request.url").should("contain", "Avatar");
    cy.get("#movie-container").should("contain", "Avatar");
    cy.get(".movie").should("have.length", 3);
  });

  it("should not get mock data with incorrect url", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "noResponse",
    }).as("omdbCall");
    
    cy.get("#searchText").type(" ");
    cy.get("#search").click();
    
    cy.wait("@omdbCall");
    
    // Kontrollera att inga filmer visas
    cy.get(".movie").should("have.length", 0);
    
    // Kontrollera att felmeddelandet visas
    cy.get("p").should("exist").should("contain", "Inga sökresultat att visa");
  });

  it("should render mock data to html", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      fixture: "omdbResponse",
    }).as("omdbCall");
    cy.get("#searchText").type("Avatar");

    cy.get("#search").click();

    cy.wait("@omdbCall");

    cy.get("#movie-container").should("exist");
    cy.get(".movie").should("exist").should("have.length", 3);
    cy.get("h3").should("exist");
    cy.get("img").should("exist");
    cy.get(":nth-child(1) > h3").should("contain", "Avatar");
  });

  it("should display search results for a valid movie title", () => {
    const validMovieTitle = "Avatar";
    cy.get("#searchText").type(validMovieTitle);
    cy.get("#search").click();
    cy.get("#movie-container").should("contain", validMovieTitle);
  });
});

describe("Search and test all movies", () => {
  it("should search and test all movies from mock data", () => {
    cy.fixture("omdbResponse").then((response: { Search: { Title: string }[] }) => {
      response.Search.forEach((movie: { Title: string }) => {
        cy.get("#searchText").clear().type(`${movie.Title}{enter}`);
        
        // Tester för varje film
        cy.get("#movie-container").should("contain", movie.Title); 
        cy.get(".movie").should("have.length.greaterThan", 3);
      });
    });
  });
});

describe("Error handling", () => {
  it("should display 'Inga sökresultat att visa' message when there are no search results", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", { 
      fixture: "noResponse",
    }).as("omdbCall");

    cy.get("#searchText").type("Invalid Movie Title"); 
    cy.get("#search").click();

    cy.wait("@omdbCall");

    cy.get("#movie-container").should("exist");
    cy.get("p").should("exist").and("contain", "Inga sökresultat att visa");
  });

  it("should handle internal server error and display no result", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      statusCode: 500, 
      body: {}, 
      delayMs: 1000,
    }).as("omdbCall");

    cy.visit("/"); 

    cy.get("#searchText").type("test search");
    cy.get("#search").click();

    cy.wait("@omdbCall");

    cy.get("#movie-container").should("contain", "Inga sökresultat att visa");
  });
}); 

describe("api data tests", () => {
  it("should get api data with correct url", () => {
    cy.get("#searchText").type("Avatar");

    cy.get("#search").click();

    cy.get("#movie-container").should("contain", "Avatar");
  });

  it("should not get api data with incorrect url", () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      statusCode: 404,
      body: {},
      delayMs: 1000,
    }).as("omdbCall");
    
    cy.get("#searchText").type(" ");
    cy.get("#search").click();
    
    cy.wait("@omdbCall");
    
    // Kontrollera att inga filmer visas
    cy.get(".movie").should("not.exist");
  });
});  

describe("Sorting functionality tests", () => {
  it("should sort movies by title in ascending order", () => {
    cy.fixture("omdbResponse").then((response) => {
      const movies = response.Search;
      const sortedMovies = movieSort(movies);
      // Verifiera att filmerna är sorterade i stigande ordning
      for (let i = 1; i < sortedMovies.length; i++) {
        expect(sortedMovies[i].Title.localeCompare(sortedMovies[i - 1].Title) >= 0).to.be.true;
      }
    });
  });

  it("should sort movies by title in descending order", () => {
    cy.fixture("omdbResponse").then((response) => {
      const movies = response.Search;
      const sortedMovies = movieSort(movies, false);
      // Verifiera att filmerna är sorterade i fallande ordning
      for (let i = 1; i < sortedMovies.length; i++) {
        expect(sortedMovies[i].Title.localeCompare(sortedMovies[i - 1].Title) <= 0).to.be.true;
      }
    });
  });
  
  it("should handle sorting a list with only one movie", () => {
    const singleMovieList = [
      { Title: "Avatar", Year: "2009", imdbID: "tt0499549", Type: "movie", Poster: "https://m.media-amazon.com/images/M/MV5BZDA0OGQxNTItMDZkMC00N2UyLTg3MzMtYTJmNjg3Nzk5MzRiXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg" }
    ];
    const sortedMovies = movieSort(singleMovieList);
    // Verifiera att listan med en enda film returneras oförändrad
    expect(sortedMovies).to.deep.equal(singleMovieList);
  });
});
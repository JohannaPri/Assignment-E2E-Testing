import { movieSort } from '../../src/ts/functions';

beforeEach(() => {
  cy.visit('/');
});

describe('dom elements tests', () => {
  it('should contain input field', () => {
    cy.get('#searchText').should('exist');
  });

  it('should contain submit button', () => {
    cy.get('#search').should('exist').should('contain', 'Sök');
  });

  it('should be able to type in searchText ', () => {
    cy.get('#searchText').should('exist').type('something');
    cy.get('#searchText').should('have.value', 'something');
  });

  it('should display error message', () => {
    cy.get('#searchText').type(' ');

    cy.get('#search').click();

    cy.get('#movie-container').should('exist');
    cy.get('p').should('exist').should('contain', 'Inga');
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
});

describe('api data tests', () => {
  it('should get api data with correct url', () => {
    cy.get('#searchText').type('Avatar');

    cy.get('#search').click();

    cy.get('#movie-container').should('contain', 'Avatar');
  });

  it('should not get api data with incorrect url', () => {
    cy.intercept("GET", "http://omdbapi.com/?apikey=416ed51a&s=*", {
      statusCode: 404,
      body: {},
      delayMs: 1000,
    }).as("omdbCall");
    
    cy.get('#searchText').type(' ');
    cy.get('#search').click();
    
    cy.wait("@omdbCall");
    
    // Kontrollera att inga filmer visas
    cy.get('.movie').should('not.exist');
  });
});  

describe("Sorting functionality tests", () => {
  it("should sort movies by title in ascending order", () => {
    cy.fixture("omdbResponse").then((response) => {
      const sortedMovies = movieSort(response.Search);
      // Verifiera att filmerna är sorterade i stigande ordning
      for (let i = 1; i < sortedMovies.length; i++) {
        expect(sortedMovies[i].Title > sortedMovies[i - 1].Title).to.be.true;
      }
    });
  });

  it("should sort movies by title in descending order", () => {
    cy.fixture("omdbResponse").then((response) => {
      const sortedMovies = movieSort(response.Search, false);
      // Verifiera att filmerna är sorterade i fallande ordning
      for (let i = 1; i < sortedMovies.length; i++) {
        expect(sortedMovies[i].Title < sortedMovies[i - 1].Title).to.be.true;
      }
    });
  });

  it("should handle sorting an empty list of movies", () => {
    const emptyList = [];
    const sortedMovies = movieSort(emptyList);
    // Verifiera att en tom lista returneras oförändrad
    expect(sortedMovies).to.deep.equal(emptyList);
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
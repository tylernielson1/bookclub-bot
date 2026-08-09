const Book = require('./Book');

class BookDetails extends Book {
    constructor(
        title,
        authors,
        publisher,
        publishYear,
        description,
        thumbnail,
        isbn13,
        worksKey,
        editionKey,
        goodreadsId,
        storygraphId,
        pages
    ) {
        super(title, authors, publishYear, editionKey, worksKey);
        this.publisher = publisher;
        this.description = description;
        this.thumbnail = thumbnail;
        this.isbn13 = isbn13;
        this.goodreadsId = goodreadsId;
        this.storygraphId = storygraphId;
        this.pages = pages;
    }

    get storygraphLink() {
        return this.storygraphId ? `https://app.thestorygraph.com/books/${this.storygraphId}` : null;
    }

    get goodreadsLink() {
        return this.goodreadsId ? `https://www.goodreads.com/book/show/${this.goodreadsId}` : null;
    }
}

module.exports = BookDetails;
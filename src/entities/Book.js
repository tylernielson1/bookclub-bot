class Book {
	constructor(
		title,
		authors,
		publishYear,
		editionKey,
		worksKey,
	) {
		this.title = title;
		this.authors = authors;
		this.publishYear = publishYear;
		this.editionKey = editionKey;
		this.worksKey = worksKey;
	}
}

module.exports = Book;
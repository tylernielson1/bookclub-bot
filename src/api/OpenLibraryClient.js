const env = require('dotenv').config();
const BookDetails = require('../entities/BookDetails');
const Book = require('../entities/Book');
const Edition = require('../entities/Edition');
const EditionSelector = require('./EditionSelector');
const { parseYear, parseDescription } = require('../utils/utils');

const OPENLIBRARY_URL = 'https://openlibrary.org';
const CACHE_KEY_PREFIX = 'openlibrary';
const CACHE_TTL = {
	SEARCH: 60 * 60,
	DETAILS: 60 * 60,
	AUTHOR: 60 * 60 * 24
};

class OpenLibraryClient {
	constructor(cacheManager) {
		this.cache = cacheManager;
	}

	async searchTitleAuthor(title, author) {
		const titleEncoded = encodeURIComponent(title);
		const authorEncoded = author !== null ? encodeURIComponent(author) : '';

		const query = `/search.json?q=title:${titleEncoded}`;

		if (authorEncoded) query = query + `+author:${authorEncoded}`;

		const dataJson = await this.cache.getOrFetch(
			`${CACHE_KEY_PREFIX}:search:${query}`,
			() => this.executeApiCall(query),
			CACHE_TTL.SEARCH
		);

		const books = (dataJson.docs || []).map(book => {
			return new Book(
				book.title ?? '',
				book.author_name ?? 'Unknown',
				book.first_publish_year ?? null,
				book.cover_edition_key ?? null,
				book.key ?? null
			);
		});

		console.log(`Found ${books.length} books using ${query}`);

		return books;
	}

	async searchIsbn(isbn) {
		const detailsJson = await this.getIsbnDetails(isbn);
		const [authorJson, worksJson] = await Promise.all([this.getAuthors(detailsJson.authors?.[0]?.key), this.getWorks(detailsJson.works?.[0]?.key)]);

		const goodreadsId = detailsJson.identifiers?.goodreads[0];
		const storygraphId = detailsJson.identifiers?.storygraph[0];

		const bookDetails = new BookDetails(
			detailsJson.title,
			authorJson.name, // get from authors api.
			detailsJson.publishers[0],
			parseYear(detailsJson.publish_date) ?? '',
			parseDescription(worksJson.description), // get from works api call.
			detailsJson.covers[0] ?? '',
			detailsJson.isbn_13[0],
			detailsJson.works[0].key,
			null,
			`https://www.goodreads.com/book/show/${goodreadsId}`,
			`https://app.thestorygraph.com/books/${storygraphId}`,
			detailsJson.pagination
		)

		return bookDetails;
	}

	async searchTitleAuthorDetails(title, author) {
		const titleEncoded = encodeURIComponent(title);
		const authorEncoded = author !== null ? encodeURIComponent(author) : '';

		const query = `/search.json?q=title:${titleEncoded}`;

		if (authorEncoded) query = query + `+author:${authorEncoded}`;

		const dataJson = await this.cache.getOrFetch(
			`${CACHE_KEY_PREFIX}:search:${query}`,
			() => this.executeApiCall(query),
			CACHE_TTL.SEARCH
		);

		if (!dataJson.docs) return [];

		const bookKey = dataJson.docs[0].key;

		if (!bookKey) return [];

		const bookDetails = await this.getBookDetails(bookKey);

		return bookDetails;
	}

	async getBookDetails(worksKey) {
		const [worksJson, editionsJson] = await Promise.all([this.getWorks(worksKey), this.getEditions(worksKey)]);
		const authorJson = await this.getAuthors(worksJson.authors[0].author.key);

		const editions = (editionsJson.entries || []).map(edition => {
			return Edition.fromOpenLibrary(edition);
		});

		const bestEdition = EditionSelector.pickBest(editions);

		const bookDetails = new BookDetails(
			worksJson.title,
			authorJson.name,
			bestEdition.publisher,
			bestEdition.publishYear,
			parseDescription(worksJson.description),
			bestEdition.cover,
			bestEdition.isbn13,
			worksJson.key,
			bestEdition.key,
			bestEdition.goodreadsLink,
			bestEdition.storygraphLink,
			bestEdition.pages
		);

		return bookDetails;
	}

	async getAuthors(authorKey) {
		if (!authorKey) return [];
		const authorQuery = `${authorKey}.json`;
		return await this.cache.getOrFetch(
			`${CACHE_KEY_PREFIX}:authors:${authorQuery}`,
			() => this.executeApiCall(authorQuery),
			CACHE_TTL.AUTHOR
		);
	}

	async getWorks(worksKey) {
		if (!worksKey) return [];
		const worksQuery = `${worksKey}.json`;
		return await this.cache.getOrFetch(
			`${CACHE_KEY_PREFIX}:works:${worksQuery}`,
			() => this.executeApiCall(worksQuery),
			CACHE_TTL.DETAILS
		);
	}

	async getEditions(editionsKey) {
		const editionsQuery = `${editionsKey}/editions.json`;
		return await this.cache.getOrFetch(
			`${CACHE_KEY_PREFIX}:editions:${editionsQuery}`,
			() => this.executeApiCall(editionsQuery),
			CACHE_TTL.DETAILS
		);
	}

	async getIsbnDetails(isbn) {
		const isbnEncoded = encodeURIComponent(isbn);
		const isbnQuery = `/isbn/${isbnEncoded}.json`;
		return await this.cache.getOrFetch(
			`${CACHE_KEY_PREFIX}:isbn:${isbnQuery}`,
			() => this.executeApiCall(isbnQuery),
			CACHE_TTL.DETAILS
		);
	}

	async executeApiCall(query) {
		const url = OPENLIBRARY_URL + query;

		console.log(`Executing call to ${url}`);
		const options = {
			method: 'GET',
			headers: {
				'User-Agent': `${process.env.APP_NAME} (${process.env.OPENLIBRARY_EMAIL})`
			}
		};

		const response = await fetch(url, options);

		if (!response.ok) {
			console.error(await response.text());
			throw new Error(`HTTP error with status code: ${response.status}`);
		}

		return await response.json();
	}
}

module.exports = OpenLibraryClient;
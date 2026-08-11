const BookDetails = require('../entities/BookDetails');
const Book = require('../entities/Book');
const Edition = require('../entities/Edition');
const EditionSelector = require('./EditionSelector');
const { parseYear, parseDescription } = require('../utils/utils');

require('dotenv').config();

const OPENLIBRARY_URL = 'https://openlibrary.org';

async function searchTitleAuthor(title, author) {
	const titleEncoded = encodeURIComponent(title);
	const authorEncoded = author !== null ? encodeURIComponent(author) : '';

	let query = `/search.json?q=title:${titleEncoded}`;

	if (authorEncoded) query = query + `+author:${authorEncoded}`;

	const dataJson = await executeApiCall(query);

	const books = (dataJson.docs || []).map(book => {
		return new Book(
			book.title ?? '',
			book.author_name ?? 'Unknown',
			book.first_publish_year ?? null,
			book.cover_edition_key ?? null,
			book.key ?? null,
		);
	});

	console.log(`Found ${books.length} books using ${query}`);

	return books;
}

async function searchIsbn(isbn) {
	const detailsJson = await getIsbnDetails(isbn);
	const authorJson = await getAuthors(detailsJson?.authors?.[0]?.key);
	const worksJson = await getWorks(detailsJson?.works?.[0]?.key);

	const goodreadsId = detailsJson?.identifiers?.goodreads?.[0];
	const storygraphId = detailsJson?.identifiers?.storygraph?.[0];

	const bookDetails = new BookDetails(
		detailsJson.title,
		authorJson.name,
		detailsJson.publishers?.[0],
		parseYear(detailsJson.publish_date) ?? '',
		parseDescription(worksJson.description),
		detailsJson.covers?.[0] ?? '',
		detailsJson.isbn_13?.[0],
		detailsJson.works?.[0].key,
		null,
		goodreadsId,
		storygraphId,
		detailsJson.pagination,
	);

	return bookDetails;
}

async function searchTitleAuthorDetails(title, author) {
	const titleEncoded = encodeURIComponent(title);
	const authorEncoded = author !== null ? encodeURIComponent(author) : '';

	let query = `/search.json?q=title:${titleEncoded}`;

	if (authorEncoded) query = query + `+author:${authorEncoded}`;

	const dataJson = await executeApiCall(query);

	if (!dataJson.docs) return [];

	const bookKey = dataJson.docs[0].key;

	if (!bookKey) return [];

	const bookDetails = await getBookDetails(bookKey);

	return bookDetails;
}

async function getBookDetails(worksKey) {
	const worksJson = await getWorks(worksKey);
	const editionsJson = await getEditions(worksKey);
	const authorJson = await getAuthors(worksJson.authors[0].author.key);

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
		bestEdition.goodreadsId,
		bestEdition.storygraphId,
		bestEdition.pages,
	);

	return bookDetails;
}

async function getAuthors(authorKey) {
	if (!authorKey) return [];
	const authorQuery = `${authorKey}.json`;
	return await executeApiCall(authorQuery);
}

async function getWorks(worksKey) {
	if (!worksKey) return [];
	const worksQuery = `${worksKey}.json`;
	return await executeApiCall(worksQuery);
}

async function getEditions(editionsKey) {
	const editionsQuery = `${editionsKey}/editions.json`;
	return await executeApiCall(editionsQuery);
}

async function getIsbnDetails(isbn) {
	const isbnEncoded = encodeURIComponent(isbn);
	const isbnQuery = `/isbn/${isbnEncoded}.json`;
	return await executeApiCall(isbnQuery);
}

async function executeApiCall(query) {
	const url = OPENLIBRARY_URL + query;

	console.log(`Executing call to ${url}`);
	const options = {
		method: 'GET',
		headers: {
			'User-Agent': `${process.env.APP_NAME} (${process.env.OPENLIBRARY_EMAIL})`,
		},
	};

	const response = await fetch(url, options);

	if (!response.ok) {
		console.error(await response.text());
		throw new Error(`HTTP error with status code: ${response.status}`);
	}

	return await response.json();
}

module.exports = {
	searchTitleAuthor,
	searchIsbn,
	getBookDetails,
	searchTitleAuthorDetails,
};
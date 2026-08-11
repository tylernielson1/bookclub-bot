const express = require('express');
const env = require('dotenv').config();
const Book = require('./entities/Book.js');

const app = express();

let expressInstance;

function start(port, datafile, callback) {
	expressInstance = app.listen(port, function() {
		console.log(`Listening on port ${port}`);
		if (typeof callback === 'function') callback();
	});
}

function stop() {
	if (expressInstance) {
		expressInstance.close();
	}
}

app.get('/test', function(req, res) {
	console.log('hit test');
	res.end('done');
});

app.get('/google', async function(req, res) {
	const query = `inauthor:${req.query.author}+intitle:${req.query.title}&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
	const books = await googleBooks(query);

	res.json(books);
});

app.get('/openlibrary', async function(req, res) {
	const title = encodeURIComponent(req.query.title);
	const author = encodeURIComponent(req.query.author);
	const query = `title:${title}+author:${author}`;

	const books = await openLibraryBooks(query);
	res.json(books);
});

app.get('/dogdie', async function(req, res) {
	const title = req.query.title;
	const book = await doesDogDie(title);

	console.log(book);

	const triggers = await doesDogDieTriggers(book.id);

	res.json(triggers);
});

async function googleBooks(query) {
	const url = `https://www.googleapis.com/books/v1/volumes?q=${query}`;

	console.log(url);

	try {
		const response = await fetch(url);

		if (!response.ok) {
			console.log(await response.text());
			throw new Error(`HTTP Error with status code: ${response.status}`);
		}

		const data = await response.json();

		const books = (data.items || []).map(book => {
			const info = book.volumeInfo;

			console.log(info);

			return {
				id: book.id,
				title: info.title || 'Unknown Title',
				authors: info.authors || [],
				publisher: info.publisher || 'Unknown Publisher',
				publishedDate: info.publishedDate || '',
				description: info.description || '',
				pageCount: info.pageCount || 0,
				categories: info.categories || [],
				thumbnail: info.imageLinks?.thumbnail || '',
				previewLink: info.previewLink || '',
				infoLink: info.infoLink || '',
			};
		});

		console.log(books);
		return books;
	}
	catch (error) {
		console.error('Error fetching books:', error);
		return [];
	}
}

async function openLibraryBooks(query) {
	const url = `https://openlibrary.org/search.json?q=${query}`;

	console.log(`Executing call to ${url}`);

	try {
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

		const data = await response.json();

		const books = (data.docs || []).map(book => {
			return new Book(
				book.title ?? '',
				book.author_name ?? 'Unknown',
				book.first_publish_year ?? null,
				book.cover_edition_key ?? null,
				book.key ?? null,
			);
		});

		console.log(`Found ${books.length} books using ${url}`);

		return books;
	}
	catch (error) {
		console.error('Error fetching books:', error);
		return [];
	}

	// //const url = `https://openlibrary.org/works/OL24593432W.json`;

	// console.log(url);

	// const headers = new Headers({
	//     'User-Agent': `${process.env.APP_NAME} (${process.env.OPENLIBRARY_EMAIL})`
	// });

	// try {
	//     const response = await fetch(url);

	//     if (!response.ok) {
	//         console.log(await response.text());
	//         throw new Error(`HTTP Error with status code: ${response.status}`);
	//     }

	//     const data = await response.json();

	//     console.log(data.docs);

	//     const books = (data.docs || []).map(book => {
	//         return {
	//             title: book.title || "Unknown Title",
	//             authors: book.author_name || [],
	//             // publisher: info.publisher || "Unknown Publisher",
	//             // publishedDate: info.publishedDate || "",
	//             // description: info.description || "",
	//             // pageCount: info.pageCount || 0,
	//             // categories: info.categories || [],
	//             // thumbnail: info.imageLinks?.thumbnail || "",
	//             // previewLink: info.previewLink || "",
	//             // infoLink: info.infoLink || ""
	//         };
	//     });

	//     console.log(books);
	//     return books;
	// } catch (error) {
	//     console.error('Error fetching books:', error);
	//     return [];
	// }
}

async function doesDogDie(query) {
	const url = `https://www.doesthedogdie.com/api/v3/items?q=${query}`;

	const response = await fetch(
		url,
		{
			headers: {
				'X-API-KEY': process.env.DOESTHEDOGDIE_API_KEY,
			},
		},
	);

	const items = [{
		id: 1353846,
		name: 'Dungeon Crawler Carl',
		genres: [ 'comedy' ],
		releaseYear: 2020,
		itemTypeId: 14,
		itemTypeName: 'Book',
		imdbId: null,
		backgroundImage: null,
		posterImage: null,
		overview: null,
	}];

	const book = items.find(item => item.itemTypeId === 14);

	return book ?? [];
}

async function doesDogDieTriggers(bookId) {
	const url = `https://www.doesthedogdie.com/api/v3/items/${bookId}`;

	console.log(url);

	const response = await fetch(
		url,
		{
			headers: {
				'X-API-KEY': process.env.DOESTHEDOGDIE_API_KEY,
			},
		},
	);

	const items = await response.json();

	return normalizeTriggers(items.topicItemStats);
}

function normalizeTriggers(triggers) {
	return triggers
		.filter(trigger => trigger.yesSum > 0)
		.map(trigger => ({
			name: trigger.topicName,
			confidence: (trigger.yesSum / (trigger.yesSum + trigger.noSum)),
		}));
}

module.exports = {
	start,
	stop,
};
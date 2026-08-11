const { parseYear } = require('../utils/utils');

class Edition {
	constructor(
		key,
		format,
		language,
		pages,
		isbn13,
		cover,
		publishYear,
		internetArchiveId,
		publisher,
		editionName,
		storygraphId,
		goodreadsId,
	) {
		this.key = key;
		this.format = format;
		this.language = language;
		this.pages = pages;
		this.isbn13 = isbn13;
		this.cover = cover;
		this.publishYear = publishYear;
		this.internetArchiveId = internetArchiveId;
		this.publisher = publisher;
		this.editionName = editionName;
		this.storygraphId = storygraphId;
		this.goodreadsId = goodreadsId;
	}

	static fromOpenLibrary(data) {
		const first = value => Array.isArray(value) ? value[0] ?? '' : '';

		const identifiers = data.identifiers ?? [];

		const language = first(data.languages)?.key ?? '';

		return new Edition(
			data.key ?? '',
			data.physical_format ?? '',
			language,
			data.number_of_pages ?? '',
			first(data.isbn_13),
			first(data.covers),
			parseYear(data.publish_date) ?? '',
			first(data.oclc_numbers),
			first(data.publishers),
			data.edition_name ?? '',
			first(identifiers.storygraph),
			first(identifiers.goodreads),
		);
	}

	get hasCover() {
		return Boolean(this.cover);
	}

	get hasIsbn13() {
		return Boolean(this.isbn13);
	}

	get hasInternetArchiveId() {
		return Boolean(this.internetArchiveId);
	}

	get hasPages() {
		return Boolean(this.pages);
	}

	get hasGoodreads() {
		return Boolean(this.goodreadsId);
	}

	get hasStorygraph() {
		return Boolean(this.storygraphId);
	}
}

module.exports = Edition;
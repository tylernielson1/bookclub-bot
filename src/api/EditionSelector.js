const majorPublishers = new Set([
	'Penguin',
	'Random House',
	'Tor',
	'Orbit',
	'Ace',
	'Del Rey',
	'HarperCollins',
	'Simon & Schuster',
	'Hachette',
	'Macmillan',
	'St. Martin\'s Press',
	'DAW Books',
	'Bantam',
	'William Morrow',
]);

const ignoredFormats = [
	'large print',
	'audiobook',
	'cassette',
	'cd',
	'braille',
	'ebook',
];

class EditionSelector {
	static pickBest(editions) {
		return editions.map(e => ({
			edition: e,
			score: this.score(e),
		})).sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}

			const yearA = a.edition.publishYear ?? 0;
			const yearB = b.edition.publishYear ?? 0;

			return yearB - yearA;
		})[0]
			?.edition ?? null;
	}

	static score(edition) {
		let score = 0;

		const format = edition.format?.toLowerCase() ?? '';
		const publisher = edition.publisher?.toLowerCase() ?? '';
		const editionName = edition.editionName?.toLowerCase() ?? '';

		if (ignoredFormats.some(f => format.includes(f.toLowerCase()))) score -= 100;

		if (ignoredFormats.some(f => editionName.includes(f.toLowerCase()))) score -= 100;

		if (edition.hasInternetArchiveId) score += 100;

		if ([...majorPublishers].some(p => publisher.includes(p.toLowerCase()))) score += 100;

		if (edition.hasIsbn13) score += 80;

		if (edition.hasCover) score += 50;

		if (edition.hasGoodreads) score += 50;

		if (edition.hasStorygraph) score += 50;

		if (edition.language.toLowerCase().includes('eng')) score += 40;

		if (edition.hasPages) score += 20;


		return score;
	}
}

module.exports = EditionSelector;
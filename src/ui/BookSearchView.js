const { EmbedBuilder } = require('discord.js');
const {
	paginationButtons,
	bookSelect,
} = require('./components');

class BookSearchView {
	render(session) {
		const books = session.currentPage;

		const query = [session.query.title];

		if (session.query.author) query.push(`by ${session.query.author}`);

		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle('📚 Search Results')
			.setFooter({
				text: `Page ${session.page + 1} of ${session.totalPages}`,
			});

		embed.setDescription (
			[
				`**Query:** ${query.join(' ')}`,
				`Found **${session.books.length}** results.`,
				'',
				this.buildDescription(session, books),
			].join('\n'),
		);

		const components = [];

		if (books.length > 0) {
			components.push(bookSelect(books));
		}

		if (session.totalPages > 1) {
			components.push(
				paginationButtons(
					session.page,
					session.totalPages,
				),
			);
		}

		return {
			embeds: [embed],
			components,
		};
	}

	buildDescription(session, books) {
		if (!books.length) {
			return 'No books found.';
		}

		const start = session.page * session.pageSize;

		return books
			.map((book, index) => {
				const number = start + index + 1;
				return [
					`**${number}. ${book.title}**`,
					`👤 ${book.authors}`,
					`📅 ${book.publishYear}`,
				].join('\n');
			}).join('\n\n');
	}
}

module.exports = new BookSearchView();
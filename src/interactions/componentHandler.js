const { MessageFlags } = require('discord.js');
const SessionManager = require('../sessions/SessionManager');
const BookSearchView = require('../ui/BookSearchView');
const BookDetailView = require('../ui/BookDetailView');
const FamiliarMessages = require('../utils/FamiliarMessages');
const OpenLibraryClient = require('../api/OpenLibraryClient');

async function handleComponent(interaction) {
	const session = SessionManager.get(
		interaction.message.id,
	);

	if (!session) {
		return interaction.reply({
			content: FamiliarMessages.sessionExpiration(),
			flags: MessageFlags.Ephemeral,
		});
	}

	// Only allow the person who started the search
	if (interaction.user.id !== session.userId) {
		return interaction.reply({
			content: FamiliarMessages.sessionPermissions(),
			flags: MessageFlags.Ephemeral,
		});
	}

	try {
		switch (interaction.customId) {
		case 'books_next':
			session.nextPage();

			return interaction.update(
				BookSearchView.render(session),
			);

		case 'books_prev':
			session.previousPage();

			return interaction.update(
				BookSearchView.render(session),
			);

		case 'books_select': {
			const index = Number(
				interaction.values[0],
			);

			const book = session.select(index);

			console.log(book);

			if (!book) {
				return interaction.reply({
					content: FamiliarMessages.noResults(),
					flags: MessageFlags.Ephemeral,
				});
			}

			// Fetch full details
			const details = await OpenLibraryClient.getBookDetails(book.worksKey);

			return interaction.update(
				await BookDetailView.render(details),
			);
		}

		case 'books_back':
			session.selectedBook = null;

			return interaction.update(
				BookSearchView.render(session),
			);
		}

	}
	catch (error) {
		console.error('Component handler error:', error);

		if (!interaction.replied) {
			return interaction.reply({
				content: FamiliarMessages.apiUnavailable(),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

module.exports = {
	handleComponent,
};
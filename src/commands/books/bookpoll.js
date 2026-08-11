const { SlashCommandBuilder } = require('discord.js');
const OpenLibraryClient = require('../../api/OpenLibraryClient');
const FamiliarMessages = require('../../utils/FamiliarMessages');

async function resolveBook(input) {
	const parsed = await parseBookInput(input);

	if (!parsed) return null;

	let result;

	if (parsed.type === 'isbn') {
		result = await OpenLibraryClient.searchIsbn(parsed.value);
	}

	if (parsed.type === 'titleAuthor') {
		result = await OpenLibraryClient.searchTitleAuthorDetails(parsed.title, parsed.author);
	}

	return result;
}

function parseBookInput(input) {
	const data = input.trim();

	const isbn = data.replace(/[-\s]/g, '');

	if (/^\d{9}[\dX]$/.test(isbn) || /^\d{13}$/.test(isbn)) {
		return {
			type: 'isbn',
			value: isbn,
		};
	}

	const separatorIndex = data.indexOf('|');

	if (separatorIndex === -1) return null;

	const title = data.slice(0, separatorIndex).trim();
	const author = data.slice(separatorIndex + 1).trim();

	if (!title || !author) {
		return null;
	}

	return {
		type: 'titleAuthor',
		title: title,
		author: author,
	};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bookpoll')
		.setDescription('Creates a poll using the three provided books.')
		.addStringOption((option) => option.setName('pollname').setDescription('The name of the poll').setRequired(true))
		.addStringOption((option) => option.setName('book1').setDescription('ISBN or Title | Author').setRequired(true))
		.addStringOption((option) => option.setName('book2').setDescription('ISBN or Title | Author').setRequired(true))
		.addStringOption((option) => option.setName('book3').setDescription('ISBN or Title | Author').setRequired(true)),
	async execute(interaction) {
		const inputs = [
			interaction.options.getString('book1'),
			interaction.options.getString('book2'),
			interaction.options.getString('book3'),
		];

		await interaction.deferReply();

		const books = [];

		for (const input of inputs) {
			let book;
			try {
				book = await resolveBook(input);
			}
			catch (error) {
				console.error('Error fetching books:', error);
				return interaction.editReply({
					content: FamiliarMessages.apiUnavailable(),
				});
			}


			if (!book) {
				return interaction.editReply({
					content: FamiliarMessages.noResults(),
				});
			}

			books.push(book);
		}
		try {
			await interaction.client.bookPollService.createPoll(
				interaction.channel,
				books,
				interaction.options.getString('pollname'),
			);

			return interaction.deleteReply();
		}
		catch (error) {
			console.error('Error creating book poll:', error);

			return interaction.editReply({
				content: FamiliarMessages.apiUnavailable(),
			});
		}
	},
};
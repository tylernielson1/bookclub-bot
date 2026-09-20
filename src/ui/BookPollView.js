const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ModalBuilder,
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const FamiliarMessages = require('../utils/FamiliarMessages');
const { truncate } = require('../utils/utils');

class BookPollView {
	render(books, name, duration) {
		return {
			content: FamiliarMessages.pollCreation(),
			poll: {
				question: {
					text: name,
				},
				answers: books.map(book => ({
					text: truncate(`${book.title} by ${book.authors ?? 'Unknown'}`, 55),
				})),
				allowMultiselect: false,
				duration: duration,
			},
		};
	}

	buildBookMessage(book) {
		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle(book.title);

		const links = [];
		if (book.goodreadsLink) {
			links.push(`[Goodreads](${book.goodreadsLink})`);
		}

		if (book.storygraphLink) {
			links.push(`[Storygraph](${book.storygraphLink})`);
		}

		embed.addFields({
			name: 'Author',
			value: book.authors ?? 'Unknown',
			inline: true,
		});

		if (links.length > 0) {
			embed.addFields({
				name: 'Links',
				value: links.join('\n'),
			});
		}

		return {
			embeds: [embed],
		};
	}

	buildWinnerAnnouncement(book, wasTied, link) {
		let joinLink = '';
		if (link) {
			joinLink = `\nJoin the discussion here: ${link}.`;
		}
		return {
			content: `@everyone ${FamiliarMessages.pollWinner(book, wasTied)}${joinLink}`,
		};
	}

	buildNoWinnerAnnouncement() {
		return {
			content: FamiliarMessages.noPollWinner(),
		};
	}

	buildPollWizardStart(wizard) {
		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle(`📚 ${wizard.pollName}`)
			.setDescription([
				'Let\'s create your book poll.\n',
				'You can enter either:',
				'* Title | Author',
				'* ISBN',
			].join('\n'))
			.setFooter({
				text: `${wizard.inputs.length}/${wizard.bookCount} books added.`,
			});

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`bookpoll_next:${wizard.guildId}:${wizard.userId}`)
					.setLabel('Next')
					.setEmoji('➡️')
					.setStyle(ButtonStyle.Primary),

				new ButtonBuilder()
					.setCustomId(`bookpoll_cancel:${wizard.guildId}:${wizard.userId}`)
					.setLabel('Cancel')
					.setEmoji('✖️')
					.setStyle(ButtonStyle.Danger),
			);

		return {
			embeds: [embed],
			components: [row],
		};
	}

	buildPollWizardInput(wizard) {
		const bookNumber = wizard.currentBook;

		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle(`📚 ${wizard.pollName}`)
			.setDescription([
				`Enter book **${bookNumber} of ${wizard.bookCount}**\n`,
				'How would you like to add the book?',
			].join('\n'))
			.addFields({
				name: 'Title & Author',
				value: 'Search using the book\'s title and author.',
			})
			.addFields({
				name: 'OR',
				value: 'Use the book\'s ISBN instead.',
			})
			.setFooter({
				text: `${wizard.inputs.length}/${wizard.bookCount} books added.`,
			});

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`bookpoll_title-author:${wizard.guildId}:${wizard.userId}`)
					.setLabel('Title & Author')
					.setEmoji('📖')
					.setStyle(ButtonStyle.Primary),

				new ButtonBuilder()
					.setCustomId(`bookpoll_isbn:${wizard.guildId}:${wizard.userId}`)
					.setLabel('ISBN')
					.setEmoji('🔢')
					.setStyle(ButtonStyle.Secondary),

				new ButtonBuilder()
					.setCustomId(`bookpoll_cancel:${wizard.guildId}:${wizard.userId}`)
					.setLabel('Cancel')
					.setEmoji('✖️')
					.setStyle(ButtonStyle.Danger),
			);

		return {
			embeds: [embed],
			components: [row],
		};
	}

	buildTitleAuthorModal(wizard) {
		const modal = new ModalBuilder()
			.setCustomId(`bookpoll_modal_title-author:${wizard.guildId}:${wizard.userId}`)
			.setTitle(`Book ${wizard.currentBook} - Title & Author`);

		const title = new TextInputBuilder()
			.setCustomId('title')
			.setLabel('Title')
			.setPlaceholder('The Everlasting')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMaxLength(100);

		const author = new TextInputBuilder()
			.setCustomId('author')
			.setLabel('Author')
			.setPlaceholder('Alix E. Harrow')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMaxLength(100);

		modal.addComponents(
			new ActionRowBuilder().addComponents(title),
			new ActionRowBuilder().addComponents(author),
		);

		return modal;
	}

	buildIsbnModal(wizard) {
		const modal = new ModalBuilder()
			.setCustomId(`bookpoll_modal_isbn:${wizard.guildId}:${wizard.userId}`)
			.setTitle(`Book ${wizard.currentBook} - ISBN`);

		const isbn = new TextInputBuilder()
			.setCustomId('isbn')
			.setLabel('ISBN')
			.setPlaceholder('9781250799104')
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setMaxLength(20);

		modal.addComponents(
			new ActionRowBuilder().addComponents(isbn),
		);

		return modal;
	}

	buildPollWizardDurationInput(wizard) {
		const durationSelect = new StringSelectMenuBuilder()
			.setCustomId(`bookpoll_duration:${wizard.guildId}:${wizard.userId}`)
			.setPlaceholder('Select a poll duration for this poll...')
			.addOptions(
				{
					label: '1 hour',
					value: '1',
				},
				{
					label: '4 hours',
					value: '4',
				},
				{
					label: '8 hours',
					value: '8',
				},
				{
					label: '24 hours',
					value: '24',
				},
				{
					label: '3 days',
					value: '72',
				},
				{
					label: '1 week',
					value: '168',
				},
				{
					label: '2 weeks',
					value: '336',
				},
			);

		const closeButton = new ButtonBuilder()
			.setCustomId(`bookpoll_cancel:${wizard.guildId}:${wizard.userId}`)
			.setLabel('Cancel')
			.setEmoji('✖️')
			.setStyle(ButtonStyle.Danger);

		return {
			content: [
				`${wizard.pollName} - Duration Selection`,
				'How long would you like the poll to be active for?',
			].join('\n'),
			embeds: [],
			components: [
				new ActionRowBuilder().addComponents(durationSelect),
				new ActionRowBuilder().addComponents(closeButton),
			],
		};
	}

	buildPollWizardTiebreakerInput(wizard) {
		const tiebreakerSelection = new StringSelectMenuBuilder()
			.setCustomId(`bookpoll_tiebreaker:${wizard.guildId}:${wizard.userId}`)
			.setPlaceholder('Select a tiebreaker option...')
			.addOptions(
				{
					label: 'Yes',
					value: '1',
				},
				{
					label: 'No',
					value: '0',
				},
			);

		const closeButton = new ButtonBuilder()
			.setCustomId(`bookpoll_cancel:${wizard.guildId}:${wizard.userId}`)
			.setLabel('Cancel')
			.setEmoji('✖️')
			.setStyle(ButtonStyle.Danger);

		return {
			content: [
				`${wizard.pollName} - Tiebreaker Selection`,
				'Should I break any ties for you?',
			].join('\n'),
			embeds: [],
			components: [
				new ActionRowBuilder().addComponents(tiebreakerSelection),
				new ActionRowBuilder().addComponents(closeButton),
			],
		};
	}

	buildPollWizardConfirmation(wizard) {
		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle(`📚 ${wizard.pollName}`)
			.setDescription('All books have been added. Please review the selections before continuing.');

		wizard.inputs.forEach((book, index) => {
			embed.addFields({
				name: `${index + 1}. ${book.title}`,
				value: `${book.author}`,
			});
		});

		embed.addFields({
			name: 'Poll Duration',
			value: `${String(wizard.duration)} hours`,
			inline: true,
		});

		embed.addFields({
			name: 'Tie Handling',
			value: wizard.decideTies
				? 'Randomly select a winner'
				: 'No winner selected on a tie',
			inline: true,
		});

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('bookpoll_confirm')
					.setLabel('Create Poll')
					.setEmoji('✅')
					.setStyle(ButtonStyle.Success),

				new ButtonBuilder()
					.setCustomId('bookpoll_restart')
					.setLabel('Start Over')
					.setEmoji('🔙')
					.setStyle(ButtonStyle.Secondary),
			);

		return {
			embeds: [embed],
			components: [row],
		};
	}
}

module.exports = new BookPollView();
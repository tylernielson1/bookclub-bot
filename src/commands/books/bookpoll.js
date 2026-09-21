const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const FamiliarMessages = require('../../utils/FamiliarMessages');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bookpoll')
		.setDescription('Starts the book poll creation wizard using the provided poll name and number of books.')
		.addStringOption((option) => option.setName('pollname').setDescription('The name of the poll').setRequired(true))
		.addNumberOption((option) => option.setName('bookcount').setDescription('The number of books to add to the poll').setRequired(true)),
	requiresRegistration: true,
	async execute(interaction) {
		const pollName = interaction.options.getString('pollname');
		const bookCount = interaction.options.getNumber('bookcount');
		const pollService = interaction.client.bookPollService;

		if (!pollService) {
			return await interaction.reply({
				content: FamiliarMessages.apiUnavailable(),
				flags: MessageFlags.Ephemeral,
			});
		}

		if (bookCount < 2) {
			return await interaction.reply({
				content: 'A poll requires at least two choices.',
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			const wizard = await pollService.startPollWizard(
				interaction,
				pollName,
				bookCount,
			);

			return await interaction.reply({
				...wizard,
				flags: MessageFlags.Ephemeral,
			});
		}
		catch (error) {
			console.error('Error starting book poll wizard:', error);

			return interaction.reply({
				content: FamiliarMessages.apiUnavailable(),
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
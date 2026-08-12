const { MessageFlags, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Allows for server administrators to edit current guild configurations.')
		.setDefaultMemberPermissions(0),
	requiresRegistration: true,
	async execute(interaction) {
		const configureService = interaction.client.configureService;

		if (!configureService) {
			await interaction.reply({
				content: 'The ConfigureService did not start correctly.',
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		const config = configureService.getConfig(interaction.guildId);
		const response = configureService.buildCurrentConfigMenu(config);

		await interaction.reply({
			...response,
			flags: MessageFlags.Ephemeral,
		});
	},
};
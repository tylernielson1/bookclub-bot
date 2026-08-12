const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Configure the Book Club bot for this server.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	requiresRegistration: true,
	async execute(interaction) {
		const setupService = interaction.client.setupService;

		if (setupService.getSession(interaction.guildId)) {
			await interaction.reply({
				content: 'A setup session is already in progress.',
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		const response = setupService.start(interaction.guildId);

		await interaction.reply({
			...response,
			flags: MessageFlags.Ephemeral,
		});
	},
};
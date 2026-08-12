const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { guildConfigManager } = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Registers the server with the bot, enabling core functionality.')
		.setDefaultMemberPermissions(0),
	requiresRegistration: false,
	async execute(interaction) {
		const guildId = interaction.guildId;

		if (guildConfigManager.isRegistered(guildId)) {
			return await interaction.reply({
				content: 'This server is already registered.',
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			guildConfigManager.registerGuild(guildId);
		}
		catch (error) {
			console.error(`Error registering server with gulid id: ${guildId}\n`, error);
			return await interaction.reply({
				content: 'Failed to register server. Please try again.',
				flags: MessageFlags.Ephemeral,
			});
		}

		return await interaction.reply({
			content: 'Successfully registered server.',
			flags: MessageFlags.Ephemeral,
		});
	},
};
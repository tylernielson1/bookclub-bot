const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { guildConfigManager } = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('configure')
		.setDescription('Allows for server administrators to edit current guild configurations.')
		.setDefaultMemberPermissions(0),
	requiresRegistration: true,
	async execute(interaction) {
		interaction.reply('Pong!');
	},
};
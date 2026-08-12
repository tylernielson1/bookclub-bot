const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { guildConfigManager } = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Pong!')
		.setDefaultMemberPermissions(0),
    requiresRegistration: true,
	async execute(interaction) {
		interaction.reply('Pong!');
	},
};
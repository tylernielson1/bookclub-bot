const { SlashCommandBuilder } = require('discord.js');
const { guildConfigManager } = require('../../db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a helpful guide about what I can do!')
		.setDefaultMemberPermissions(0),
	requiresRegistration: false,
	async execute(interaction) {
		interaction.reply('Pong!');
	},
};
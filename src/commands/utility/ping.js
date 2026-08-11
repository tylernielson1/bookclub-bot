const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Pong!')
		.setDefaultMemberPermissions(0),
	async execute(interaction) {
		interaction.reply('Pong!');
	},
};
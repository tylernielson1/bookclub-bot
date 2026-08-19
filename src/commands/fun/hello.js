const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('Says hello in a Salem-coded fashion.')
		.addStringOption((option) => option.setName('name').setDescription('The name to say hello to')),
	requiresRegistration: false,
	async execute(interaction) {
		const name = interaction.options.getString('name');
		if (!name) await interaction.reply('Hello, darlings. The witching hour has begun.');
		else await interaction.reply(`Ahem… hello ${name}. I\’ve been summoned.`);
	},
};
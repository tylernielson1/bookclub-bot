const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const HelpView = require('../../ui/HelpView');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Prints out a helpful guide about what I can do!'),
	requiresRegistration: false,
	hidden: true,
	async execute(interaction) {
		const commands = [...interaction.client.commands.values()].filter(command => !command.hidden);
		const view = HelpView.render(commands[0].data, 0, commands.length);

		await interaction.reply({
			...view,
			flags: MessageFlags.Ephemeral
		});
	},
};
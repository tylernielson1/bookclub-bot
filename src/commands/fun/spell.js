const { SlashCommandBuilder } = require('discord.js');
const SpellView = require('../../ui/SpellView');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('spell')
		.setDescription('Command the familiar to cast a spell for you.')
		.addStringOption((option) => option.setName('target').setDescription('Mark another witch as the target of your spell.'))
		.addStringOption((option) =>
			option.setName('type')
				.setDescription('The type of spell to cast.')
				.addChoices(
					{ name: 'Summoning', value: 'summon' },
					{ name: 'Divination', value: 'divination' },
					{ name: 'Chaos', value: 'chaos' },
				),
		),
	requiresRegistration: true,
	async execute(interaction) {
		const target = interaction.options.getString('target');
		const type = interaction.options.getString('type');

		return await interaction.reply(SpellView.render(type, target));
	},
};
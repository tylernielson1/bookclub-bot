const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

function getRandomPhotoPath() {
	const min = Math.ceil(1);
	const max = Math.floor(22);

	const num = Math.floor(Math.random() * (max - min + 1)) + min;

	return path.join(__dirname, `../../../static/images/salem${num}.avif`);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('salem')
		.setDescription('Broadcasts a random Salem quote to the server.'),
	requiresRegistration: true,
	async execute(interaction) {
		const attachment = new AttachmentBuilder(getRandomPhotoPath());

		await interaction.reply({
			files: [attachment],
		});
	},
};
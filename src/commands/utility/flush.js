const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { cacheManager } = require('../../cache');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flush')
		.setDescription('Flushes the cache. Access is controlled by server admins.')
		.addStringOption((option) =>
			option.setName('cache')
				.setDescription('The cache to be flushed')
				.addChoices(
					{ name: 'API', value: 'api-cache' },
					{ name: 'Session', value: 'session-cache' },
					{ name: 'All', value: 'all' },
				).setRequired(true),
		)
		.setDefaultMemberPermissions(0),
	requiresRegistration: true,
	hidden: true,
	async execute(interaction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const cachePrefix = interaction.options.getString('cache');

		try {
			if (cachePrefix === 'all') {
				await cacheManager.flush();
			}
			else {
				await cacheManager.flushPrefix(cachePrefix);
			}

			return interaction.editReply({
				content: 'Cache has been flushed',
			});
		}
		catch (error) {
			console.error('Failed to flush cache:', error);

			return await interaction.editReply({
				content: 'Failed to flush cache.',
			});
		}
	},
};
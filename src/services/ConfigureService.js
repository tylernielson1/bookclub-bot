const {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
} = require('discord.js');

class ConfigureService {
	constructor(guildConfigManager) {
		this.guildConfigManager = guildConfigManager;
	}

	getConfig(guildId) {
		return this.guildConfigManager.getGuildConfig(guildId);
	}

	buildCurrentConfigMenu(config) {
		const settingSelect = new StringSelectMenuBuilder()
			.setCustomId('config_setting_selection')
			.setPlaceholder('Select a setting below to modify it')
			.addOptions(
				{
					label: 'Announcement Channel',
					description: config.announcementChannelId
						? 'Change the announcement channel'
						: 'Not configured',
					value: 'announcement',
				},
				{
					label: 'Discussion Channel',
					description: config.discussionChannelId
						? 'Change the discussion channel'
						: 'Not configured',
					value: 'discussion',
				},
				{
					label: 'Poll Duration',
					description: config.pollDuration
						? `Currently ${config.pollDuration} hours`
						: 'Not configured',
					value: 'pollduration',
				},
			);

		const closeButton = new ButtonBuilder()
			.setCustomId('config_close')
			.setLabel('Close')
			.setStyle(ButtonStyle.Danger);

		return {
			content: this.buildConfigSummary(config),
			components: [
				new ActionRowBuilder().addComponents(settingSelect),
				new ActionRowBuilder().addComponents(closeButton),
			],
		};
	}

	buildConfigSummary(config) {
		return (
			'⚙️ **Book Club Configuration**\n\n' +
            `📢 **Announcement Channel:** ${config.announcementChannelId
            	? `<#${config.announcementChannelId}>`
            	: 'Not configured'}\n` +
            `💬 **Discussion Channel:** ${config.discussionChannelId
            	? `<#${config.discussionChannelId}>`
            	: 'Not configured'}\n` +
            `⏱️ **Poll Duration:** ${config.pollDuration
            	? `${config.pollDuration} hours`
            	: 'Not configured'}\n\n` +
            'Select a setting below to modify it.'
		);
	}

	buildAnnouncementChannelConfigSummary(channel) {
		const channelSelect = new ChannelSelectMenuBuilder()
			.setCustomId('config_announcement_channel')
			.setPlaceholder('Select the announcement channel')
			.setChannelTypes(ChannelType.GuildText);


		const clearButton = new ButtonBuilder()
			.setCustomId('config_clear_announcement')
			.setLabel('Clear Setting')
			.setStyle(ButtonStyle.Danger);

		const backButton = new ButtonBuilder()
			.setCustomId('config_back')
			.setLabel('⬅️ Back')
			.setStyle(ButtonStyle.Secondary);

		return {
			content:
            '⚙️ **Announcement Channel**\n\n' +
            'Currently:\n' +
            `<#${channel}>\n` +
            'Select a new announcement channel:\n',
			components: [
				new ActionRowBuilder().addComponents(channelSelect),
				new ActionRowBuilder().addComponents(
					clearButton,
					backButton,
				),
			],
		};
	}

	buildDiscussionChannelConfigSummary(channel) {
		const channelSelect = new ChannelSelectMenuBuilder()
			.setCustomId('config_discussion_channel')
			.setPlaceholder('Select the discussion channel')
			.setChannelTypes(ChannelType.GuildForum);


		const clearButton = new ButtonBuilder()
			.setCustomId('config_clear_discussion')
			.setLabel('Clear Setting')
			.setStyle(ButtonStyle.Danger);

		const backButton = new ButtonBuilder()
			.setCustomId('config_back')
			.setLabel('⬅️ Back')
			.setStyle(ButtonStyle.Secondary);

		return {
			content:
            '⚙️ **Discussion Channel**\n\n' +
            'Currently:\n' +
            `<#${channel}>\n` +
            'Select a new discussion channel:\n',
			components: [
				new ActionRowBuilder().addComponents(channelSelect),
				new ActionRowBuilder().addComponents(
					clearButton,
					backButton,
				),
			],
		};
	}

	buildPollDurationConfigSummary(duration) {
		const durationSelect = new StringSelectMenuBuilder()
			.setCustomId('config_poll_duration')
			.setPlaceholder('Select a poll duration')
			.addOptions(
				{
					label: '24 hours',
					value: '24',
				},
				{
					label: '3 days',
					value: '72',
				},
				{
					label: '1 week',
					value: '168',
				},
				{
					label: '2 weeks',
					value: '336',
				},
			);

		const backButton = new ButtonBuilder()
			.setCustomId('config_back')
			.setLabel('⬅️ Back')
			.setStyle(ButtonStyle.Secondary);

		return {
			content:
            '⚙️ **Poll Duration**\n\n' +
            'Currently:\n' +
            `${formatDuration(duration)}\n` +
            'Select a new duration:\n',
			components: [
				new ActionRowBuilder().addComponents(durationSelect),
				new ActionRowBuilder().addComponents(
					backButton,
				),
			],
		};
	}

	formatDuration(hours) {
		if (hours < 24) {
			return `${hours} hours`;
		}

		const days = hours / 24;

		if (days === 1) {
			return '1 day';
		}

		return `${days} days`;
	}

	async setAnnouncementChannel(guildId, channelId) {
		return this.guildConfigManager.editConfig(guildId, 'announcementChannelId', channelId);
	}

	async setDiscussionChannelId(guildId, channelId) {
		return this.guildConfigManager.editConfig(guildId, 'discussionChannelId', channelId);
	}

	async setPollDuration(guildId, duration) {
		return this.guildConfigManager.editConfig(guildId, 'pollDuration', duration);
	}

	async clearSetting(guildId, setting) {
		return this.guildConfigManager.clearConfig(guildId, setting);
	}
}

module.exports = ConfigureService;
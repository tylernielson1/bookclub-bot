const {
	ActionRowBuilder,
	ChannelSelectMenuBuilder,
	ChannelType,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

class SetupService {
	constructor(guildConfigManager) {
		this.guildConfigManager = guildConfigManager;
		this.sessions = new Map();
	}

	start(guildId) {
		this.sessions.set(guildId, {
			step: 'announcement',
			announcementChannelId: null,
			discussionChannelId: null,
		});

		return this.buildAnnouncementStep();
	}

	getSession(guildId) {
		return this.sessions.get(guildId) ?? null;
	}

	cancel(guildId) {
		this.sessions.delete(guildId);
	}

	buildAnnouncementStep() {
		const channelSelect = new ChannelSelectMenuBuilder()
			.setCustomId('setup_announcement_channel')
			.setPlaceholder('Select the announcement channel')
			.setChannelTypes(ChannelType.GuildText);

		const cancelButton = new ButtonBuilder()
			.setCustomId('setup_cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		return {
			content:
                '📚 **Book Club Setup**\n\n' +
                'First, select the channel where poll winners should be announced.',
			components: [
				new ActionRowBuilder().addComponents(channelSelect),
				new ActionRowBuilder().addComponents(cancelButton),
			],
		};
	}

	buildDiscussionStep() {
		const channelSelect = new ChannelSelectMenuBuilder()
			.setCustomId('setup_discussion_channel')
			.setPlaceholder('Select the discussion channel')
			.setChannelTypes(ChannelType.GuildForum);

		const backButton = new ButtonBuilder()
			.setCustomId('setup_back_announcement')
			.setLabel('Back')
			.setStyle(ButtonStyle.Secondary);

		const cancelButton = new ButtonBuilder()
			.setCustomId('setup_cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		return {
			content:
                '📚 **Book Club Setup**\n\n' +
                'Great! Now select the forum channel where book discussions should be created.',
			components: [
				new ActionRowBuilder().addComponents(channelSelect),
				new ActionRowBuilder().addComponents(
					backButton,
					cancelButton,
				),
			],
		};
	}

	buildConfirmationStep(guildId) {
		const session = this.getSession(guildId);

		const confirmButton = new ButtonBuilder()
			.setCustomId('setup_confirm')
			.setLabel('Confirm Setup')
			.setStyle(ButtonStyle.Success);

		const backButton = new ButtonBuilder()
			.setCustomId('setup_back_discussion')
			.setLabel('Back')
			.setStyle(ButtonStyle.Secondary);

		const cancelButton = new ButtonBuilder()
			.setCustomId('setup_cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Danger);

		return {
			content:
                '📚 **Book Club Setup**\n\n' +
                'Here is your configuration:\n\n' +
                `📢 **Announcement:** <#${session.announcementChannelId}>\n` +
                `💬 **Discussion:** <#${session.discussionChannelId}>\n` +
                'Is everything correct?',
			components: [
				new ActionRowBuilder().addComponents(
					confirmButton,
					backButton,
					cancelButton,
				),
			],
		};
	}

	async setAnnouncementChannel(guildId, channelId) {
		const session = this.getSession(guildId);

		if (!session) {
			throw new Error('No active setup session.');
		}

		session.announcementChannelId = channelId;
		session.step = 'discussion';

		return this.buildDiscussionStep();
	}

	async setDiscussionChannel(guildId, channelId) {
		const session = this.getSession(guildId);

		if (!session) {
			throw new Error('No active setup session.');
		}

		session.discussionChannelId = channelId;
		session.step = 'confirmation';

		return this.buildConfirmationStep(guildId);
	}

	async confirm(guildId) {
		const session = this.getSession(guildId);

		if (!session) {
			throw new Error('No active setup session.');
		}

		try {
			this.guildConfigManager.saveConfig(guildId, {
				announcementChannelId: session.announcementChannelId,
				discussionChannelId: session.discussionChannelId,
			});

			this.sessions.delete(guildId);

			return true;
		}
		catch (error) {
			console.error(`Failed to save config for ${guildId}:`, error);
			throw error;
		}
	}

	back(guildId, step) {
		const session = this.getSession(guildId);

		if (!session) {
			throw new Error('No active setup session.');
		}

		session.step = step;

		switch (step) {
		case 'announcement':
			return this.buildAnnouncementStep();

		case 'discussion':
			return this.buildDiscussionStep();

		default:
			throw new Error(`Unknown setup step: ${step}`);
		}
	}
}

module.exports = SetupService;
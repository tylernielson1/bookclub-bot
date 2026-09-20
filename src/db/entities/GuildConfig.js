class GuildConfig {
	constructor(guildId, announcementChannelId, discussionChannelId) {
		this.guildId = guildId;
		this.announcementChannelId = announcementChannelId;
		this.discussionChannelId = discussionChannelId;
	}
}

module.exports = GuildConfig;
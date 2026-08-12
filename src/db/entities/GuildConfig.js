class GuildConfig {
    constructor(guildId, announcementChannelId, discussionChannelId, pollDuration) {
        this.guildId = guildId;
        this.announcementChannelId = announcementChannelId;
        this.discussionChannelId = discussionChannelId;
        this.pollDuration = pollDuration;
    }
}

module.exports = GuildConfig;
class Poll {
	constructor({
		id = null,
		messageId,
		channelId,
		guildId,
		books = [],
		announcementChannelId,
		discussionChannelId,
		announcementMessageId = null,
		discussionThreadId = null,
		status = 'active',
		winner = null,
		expiresAt,
		createdAt = Date.now(),
		processedAt = null,
	}) {
		this.id = id;
		this.messageId = messageId;
		this.channelId = channelId;
		this.guildId = guildId;
		this.books = books;

		this.announcementChannelId = announcementChannelId;
		this.discussionChannelId = discussionChannelId;

		this.announcementMessageId = announcementMessageId;
		this.discussionThreadId = discussionThreadId;

		this.status = status;
		this.winner = winner;

		this.expiresAt = expiresAt;
		this.createdAt = createdAt;
		this.processedAt = processedAt;
	}
}

module.exports = Poll;
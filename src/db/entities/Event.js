class Event {
	constructor({
		id = null,
		guildId,
		channelId,
		messageId,
		creatorId,
		name,
		location,
		startTime,
		reminderAt,
		reminderSent,
		cancelled,
		rsvps,
		reminderInterval = 3,
	}) {
		this.id = id;
		this.guildId = guildId;
		this.channelId = channelId;
		this.messageId = messageId;
		this.creatorId = creatorId;
		this.name = name;
		this.location = location;
		this.startTime = startTime;
		this.reminderAt = reminderAt;
		this.reminderSent = reminderSent;
		this.cancelled = cancelled;
		this.rsvps = rsvps;
		this.reminderInterval = reminderInterval;
	}
}

module.exports = Event;
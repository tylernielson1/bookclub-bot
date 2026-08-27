const { DateTime } = require('luxon');
const EventView = require('../ui/EventView');

class EventService {
	constructor(client, eventManager, guildConfigManager) {
		this.client = client;
		this.eventManager = eventManager;
		this.guildConfigManager = guildConfigManager;
	}

	async createEvent(data, channel) {
		const startTime = DateTime.fromObject({
			year: data.date.year,
			month: data.date.month,
			day: data.date.day,
			hour: data.time.hour,
			minute: data.time.minute,
		}, {
			zone: 'America/Chicago',
			locale: 'en-US',
		});

		const reminderTime = startTime.minus({ hours: 3 });

		const startTimeEpochMillis = startTime.toMillis();
		const reminderTimeEpochMillis = reminderTime.toMillis();

		const dbData = {
			guildId: channel.guildId,
			channelId: channel.id,
			creatorId: data.userId,
			name: data.name,
			location: data.location,
			startTime: startTimeEpochMillis,
			reminderAt: reminderTimeEpochMillis,
		};

		const event = this.eventManager.createEvent({
			...dbData,
			status: 'pending',
		});

		let message;

		try {
			message = await channel.send(
				EventView.render(event),
			);

			this.eventManager.editEvent(event.id, {
				messageId: message.id,
				status: 'active',
			});

			return event;
		}
		catch (error) {
			if (message) {
				try {
					await message.delete();
				}
				catch (deleteError) {
					console.error('Failed to clean up event message:', deleteError);
				}
			}

			this.eventManager.deleteEvent(event.id);

			throw error;
		}
	}

	async editEvent(eventId, data) {
		const event = this.eventManager.getEvent(eventId);

		if (!event) {
			throw new Error('Event not found.');
		}

		this.eventManager.editEvent(eventId, data);

		return this.eventManager.getEvent(eventId);
	}

	cancelEvent(eventId) {
		if (!eventId) return;
		this.eventManager.cancelEvent(eventId);

		return this.eventManager.getEvent(eventId);
	}

	rsvp(eventId, userId) {
		if (!eventId || !userId) return;

		this.eventManager.rsvpToEvent({
			eventId: eventId,
			userId: userId,
		});

		return this.eventManager.getEvent(eventId);
	}

	unRsvp(eventId, userId) {
		if (!eventId || !userId) return;

		this.eventManager.unRsvpToEvent({
			eventId: eventId,
			userId: userId,
		});

		return this.eventManager.getEvent(eventId);
	}

	getEvents(userId, isAdmin) {
		return this.eventManager.getActiveEventsForEdits(userId, isAdmin);
	}

	getEvent(eventId) {
		return this.eventManager.getEvent(eventId);
	}

	getEventAttendees(eventId) {
		return this.eventManager.getEventRsvps(eventId);
	}

	async checkForReminders() {
		console.log('checking for event reminders...');
		for (const event of this.eventManager.getActiveEventsForReminders()) {
			try {
				await this.processEventReminder(event);
			}
			catch (error) {
				console.error(`Failed to process event ${event.id}:`, error);
			}
		}
	}

	async processEventReminder(event) {
		const rsvps = this.eventManager.getEventRsvps(event.id);

		const results = await Promise.allSettled(
			rsvps.map(async (rsvp) => {
				const user = await this.client.users.fetch(rsvp.userId);

				return user.send({
					content: `🔔 Reminder: **${event.name}** is coming up!`,
					...EventView.renderReminder(event),
				});
			}),
		);

		for (const result of results) {
			if (result.status === 'rejected') {
				console.error('Failed to send event reminder:', result.reason);
			}
		}

		this.eventManager.editEvent(event.id, { reminderSent: 1 });
	}

	start(interval = 30_000) {
		this.checkForReminders().catch(error => {
			console.error('Failed initial reminder check:', error);
		});

		this.interval = setInterval(() => {
			this.checkForReminders().catch(error => {
				console.error('Failed reminder check:', error);
			});
		}, interval);

		return this.interval;
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}

module.exports = EventService;
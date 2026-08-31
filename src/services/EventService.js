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
			description: data.description,
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
		console.log('Processing event with id:', event.id);
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

	async checkForExpiration() {
		for (const event of this.eventManager.getExpiredEvents()) {
			try {
				await this.processEventExpiration(event);
			}
			catch (error) {
				console.error(`Failed to properly expire event ${event.id}:`, error);
			}
		}
	}

	async processEventExpiration(event) {
		console.log('Expiring event with id:', event.id);
		if (!event.channelId || !event.messageId) return;

		const channel = await this.client.channels.fetch(event.channelId);
		const message = await channel.messages.fetch(event.messageId);
		await message.delete();

		this.eventManager.editEvent(event.id, { status: 'complete' });
		console.log('Expired event with id:', event.id);
	}

	start(interval = 30_000) {
		const run = () => {
			this.checkForReminders().catch(error => {
				console.error('Failed reminder check:', error);
			});

			this.checkForExpiration().catch(error => {
				console.error('Failed expiration check:', error);
			});
		};

		console.log('Performing initial check for event reminders and expiration...');
		run();

		this.interval = setInterval(run, interval);

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
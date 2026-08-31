const Event = require('../entities/Event');
const EventRsvp = require('../entities/EventRsvp');

class EventManager {
	constructor(db) {
		this.db = db;
	}

	mapRowToEvent(row, rsvps = []) {
		return new Event({
			id: row.id,
			guildId: row.guild_id,
			channelId: row.channel_id,
			messageId: row.message_id,
			creatorId: row.creator_id,
			name: row.name,
			location: row.location,
			startTime: row.start_time,
			reminderAt: row.reminder_at,
			reminderSent: row.reminder_sent,
			cancelled: row.cancelled,
			status: row.status,
			rsvps: this.mapRowsToRsvp(rsvps),
            description: row.description,
		});
	}

	mapRowsToRsvp(rows) {
		return rows.map((row) => {
			return new EventRsvp({
				eventId: row.event_id,
				userId: row.user_id,
			});
		});
	}

	createEvent(data) {
		const row = this.db.get(
			`
            INSERT INTO events (
                guild_id,
                channel_id,
                creator_id,
                name,
                location,
                start_time,
                reminder_at,
                status,
                description
            )
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            `,
			[
				data.guildId,
				data.channelId,
				data.creatorId,
				data.name,
				data.location,
				data.startTime,
				data.reminderAt,
				data.status,
                data.description,
			],
		);

		return this.mapRowToEvent(row);
	}

	getEvent(eventId) {
		const event = this.db.get(
			`
            SELECT *
            FROM events
            WHERE events.id = ?
            `,
			[eventId],
		);

		const rsvps = this.db.all(
			`
            SELECT *
            FROM event_rsvps
            WHERE event_rsvps.event_id = ?
            `,
			[eventId],
		);

		return this.mapRowToEvent(event, rsvps);
	}

	getActiveEventsForEdits(userId, isAdmin) {
		const baseEventsQuery = 'SELECT id, name, creator_id FROM EVENTS WHERE events.status = \'active\'';
		const eventsQuery = isAdmin ? baseEventsQuery : baseEventsQuery + ' AND events.creator_id = ?';
		const events = this.db.all(
			eventsQuery,
			isAdmin ? [] : [userId],
		);

		return events.map((event) => {
			const rsvps = this.getEventRsvps(event.id);
			return this.mapRowToEvent(event, rsvps);
		});
	}

	editEvent(eventId, data) {
		const fields = {
			name: 'name',
			location: 'location',
			startTime: 'start_time',
			messageId: 'message_id',
			status: 'status',
			reminderAt: 'reminder_at',
			reminderSent: 'reminder_sent',
            description: 'description',
		};

		const updates = [];
		const values = [];

		for (const [key, value] of Object.entries(data)) {
			const column = fields[key];

			if (!column) continue;

			updates.push(`${column} = ?`);
			values.push(value);
		}

		if (!updates.length) return;

		values.push(eventId);

		return this.db.run(
			`
            UPDATE events
            SET ${updates.join(', ')}
            WHERE id = ?
            `,
			values,
		);
	}

	getActiveEventsForReminders() {
		const rows = this.db.all(
			`
            SELECT *
            FROM events
            WHERE status = 'active'
            AND reminder_at <= ?
            AND reminder_sent = 0
            ORDER BY reminder_at ASC
            `,
			[Date.now()],
		);

		return rows.map((row) => this.mapRowToEvent(row));
	}

	cancelEvent(eventId) {
		return this.db.run(
			`
            UPDATE events
            SET cancelled = 1, status = 'cancelled'
            WHERE id = ?
            `,
			[eventId],
		);
	}

	deleteEvent(eventId) {
		return this.db.run(
			`
            DELETE FROM events
            where id = ?
            `,
			[eventId],
		);
	}

	rsvpToEvent(data) {
		return this.db.run(
			`
            INSERT OR IGNORE INTO event_rsvps (
                event_id,
                user_id
            )
            VALUES(?, ?)
            `,
			[
				data.eventId,
				data.userId,
			],
		);
	}

	unRsvpToEvent(data) {
		return this.db.run(
			`
            DELETE FROM event_rsvps
            WHERE event_id = ? AND user_id = ?
            `,
			[
				data.eventId,
				data.userId,
			],
		);
	}

	getEventRsvps(eventId) {
		const rows = this.db.all(
			`
            SELECT *
            FROM event_rsvps
            WHERE event_id = ?
            `,
			[eventId],
		);

		return this.mapRowsToRsvp(rows);
	}

    getExpiredEvents() {
        const rows = this.db.all(
            `
            SELECT *
            FROM events
            WHERE start_time <= ?
            AND status = 'active'
            `,
            [Date.now() - 60 * 1 * 1000]
        );

        return rows.map((row) => {
            return this.mapRowToEvent(row);
        });
    }
}

module.exports = EventManager;
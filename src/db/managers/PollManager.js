const Poll = require('../entities/Poll');

class PollManager {
    constructor(db) {
        this.db = db;
    }

    mapRowToPoll(row) {
		return new Poll({
			id: row.id,
			messageId: row.message_id,
			channelId: row.channel_id,
			guildId: row.guild_id,
			books: JSON.parse(row.books),
			announcementChannelId: row.announcement_channel_id,
			discussionChannelId: row.discussion_channel_id,
			announcementMessageId: row.announcement_message_id,
			discussionThreadId: row.discussion_thread_id,
			status: row.status,
			winner: row.winner,
			expiresAt: row.expires_at,
			createdAt: row.created_at,
			processedAt: row.processed_at,
		});
	}

    createPoll(data) {
        return this.db.run(
            `
            INSERT INTO polls (
                message_id,
                channel_id,
                guild_id,
                expires_at,
                announcement_channel_id,
                discussion_channel_id,
                books
            )
            VALUES(?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.messageId,
                data.channelId,
                data.guildId,
                data.expiresAt,
                data.announcementChannelId,
                data.discussionChannelId,
                JSON.stringify(data.books)
            ],
        );
    }

    getPoll(id) {
        const row = this.db.get(
            `
            SELECT *
            FROM polls
            WHERE id = ?
            `,
            [id]
        );

        return row ? this.mapRowToPoll(row) : null;
    }

    getPollByMessageId(messageId) {
        const row = this.db.get(
            `
            SELECT *
            FROM polls
            WHERE message_id = ?
            `,
            [messageId],
        );

        return row ? this.mapRowToPoll(row) : null;
    }

    getActivePolls() {
        const rows = this.db.all(
            `
            SELECT *
            FROM polls
            WHERE status = 'active'
            ORDER BY expires_at ASC
            `
        );

        return rows.map(row => this.mapRowToPoll(row));
    }

    getExpiredPolls() {
        const rows = this.db.all(
            `
            SELECT *
            FROM polls
            WHERE status = 'active'
            AND expires_at <= ?
            ORDER BY expires_at ASC
            `,
            [Date.now()],
        );

        return rows.map(row => this.mapRowToPoll(row));
    }

    completePoll(id, results) {
        const result = this.db.run(
            `
            UPDATE polls
            SET
                status = 'completed',
                winner = ?,
                announcement_message_id = ?,
                discussion_thread_id = ?,
                processed_at = ?
            WHERE id = ?
            AND status = 'active'
            `,
            [
                results.winner,
                results.announcementMessageId,
                results.discussionThreadId,
                Date.now(),
                id
            ],
        );

        return result.changes > 0;
    }

    saveDiscussionThread(id, threadId) {
        return this.db.run(
            `
            UPDATE polls
            SET discussion_thread_id = ?
            WHERE id = ?
            `,
            [threadId, id],
        );
    }

    saveAnnouncementMessage(id, messageId) {
        return this.db.run(
            `
            UPDATE polls
            SET announcement_message_id = ?
            WHERE id = ?
            `,
            [messageId, id],
        );
    }
}

module.exports = PollManager;
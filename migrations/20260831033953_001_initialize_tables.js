/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
	await knex.raw(`
        CREATE TABLE registered_guilds (
            guild_id TEXT PRIMARY KEY,
            registered_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
    `);

	await knex.raw(`
        CREATE TABLE guild_config (
            guild_id TEXT PRIMARY KEY,
            announcement_channel_id TEXT,
            discussion_channel_id TEXT,
            poll_duration INTEGER,
            created_at INTEGER NOT NULL DEFAULT(unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT(unixepoch()),
            FOREIGN KEY(guild_id) REFERENCES registered_guilds(guild_id)
        );
    `);

	await knex.raw(`
        CREATE TABLE polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id TEXT NOT NULL UNIQUE,
            channel_id TEXT NOT NULL,
            guild_id TEXT,
            expires_at INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            winner TEXT,
            announcement_channel_id TEXT,
            discussion_channel_id TEXT,
            announcement_message_id TEXT,
            discussion_thread_id TEXT,
            books TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
            processed_at INTEGER
        );
    `);

	await knex.raw(`
        CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            message_id TEXT,
            creator_id TEXT NOT NULL,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            reminder_at INTEGER NOT NULL,
            reminder_sent INTEGER DEFAULT 0,
            cancelled INTEGER DEFAULT 0,
            status TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
        );
    `);

	await knex.raw(`
        CREATE TABLE event_rsvps (
            event_id INTEGER NOT NULL,
            user_id TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT(unixepoch() * 1000),
            PRIMARY KEY (event_id, user_id),
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
        );
    `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
	await knex.raw('DROP TABLE event_rsvps;');
	await knex.raw('DROP TABLE events;');
	await knex.raw('DROP TABLE polls;');
	await knex.raw('DROP TABLE guild_config;');
	await knex.raw('DROP TABLE registered_guilds;');
};

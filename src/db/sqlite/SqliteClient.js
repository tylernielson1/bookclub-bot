const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');

class SQLiteClient {
	constructor(databasePath = './data/bookclub.db') {
		this.databasePath = path.resolve(databasePath);
		const directory = path.dirname(this.databasePath);

		if (!fs.existsSync(directory)) {
			fs.mkdirSync(directory, { recursive: true });
		}

		this.db = new Database(this.databasePath);
		this.configure();
	}

	configure() {
		this.db.pragma('foreign_keys = ON');
		this.db.pragma('busy_timeout = 5000');
		this.db.pragma('journal_mode = WAL');
	}

	initialize() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS registered_guilds (
                guild_id TEXT PRIMARY KEY,
                registered_at INTEGER NOT NULL DEFAULT (unixepoch())
            );
        `);

        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guild_config (
                guild_id TEXT PRIMARY KEY,
                announcement_channel_id TEXT,
                discussion_channel_id TEXT,
                poll_duration INTEGER,
                created_at INTEGER NOT NULL DEFAULT(unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT(unixepoch()),
                FOREIGN KEY(guild_id) REFERENCES registered_guilds(guild_id)
            );
        `);

		this.db.exec(`
            CREATE TABLE IF NOT EXISTS polls (
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
	}

	run(sql, params = []) {
		const preparedStatement = this.db.prepare(sql);
		return preparedStatement.run(params);
	}

	get(sql, params = []) {
		const statement = this.db.prepare(sql);
		return statement.get(params);
	}

	all(sql, params = []) {
		const statement = this.db.prepare(sql);
		return statement.all(params);
	}

	transaction(callback) {
		return this.db.transaction(callback)();
	}

	close() {
		if (this.db.open) {
			this.db.close();
		}
	}
}

module.exports = SQLiteClient;
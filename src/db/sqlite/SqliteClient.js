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
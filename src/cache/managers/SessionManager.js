const SearchSession = require('../entities/SearchSession');

const SESSION_CACHE_PREFIX = 'session-cache';
const SESSION_TTL = 15 * 60;

class SessionManager {
	constructor(store) {
		this.store = store;
	}

	key(messageId) {
		return `${SESSION_CACHE_PREFIX}:${messageId}`;
	}

	async set(key, session) {
		console.log(`Caching ${this.key(key)}\n${session.toJSON()}`);
		return this.store.set(
			this.key(key),
			session.toJSON(),
			SESSION_TTL,
		);
	}

	async get(key) {
		const data = await this.store.get(this.key(key));

		if (!data) return null;

		return SearchSession.fromJSON(data);
	}

	async delete(key) {
		this.store.delete(this.key(key));
	}

	async clear() {
		this.store.flushPrefix(SESSION_CACHE_PREFIX);
	}
}

module.exports = SessionManager;
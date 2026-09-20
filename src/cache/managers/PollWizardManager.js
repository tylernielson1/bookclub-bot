const PollWizardSession = require('../entities/PollWizardSession');

const POLL_WIZARD_CACHE_PREFIX = 'poll-wizard';
const WIZARD_TTL = 5 * 60;

class PollWizardManager {
	constructor(store) {
		this.store = store;
	}

	key(messageId) {
		return `${POLL_WIZARD_CACHE_PREFIX}:${messageId}`;
	}

	async set(key, session) {
		return this.store.set(
			this.key(key),
			session.toJson(),
			WIZARD_TTL,
		);
	}

	async get(key) {
		const data = await this.store.get(this.key(key));

		if (!data) return null;

		return PollWizardSession.fromJSON(data);
	}

	async delete(key) {
		this.store.delete(this.key(key));
	}

	async clear() {
		this.store.flushPrefix(POLL_WIZARD_CACHE_PREFIX);
	}
}

module.exports = PollWizardManager;
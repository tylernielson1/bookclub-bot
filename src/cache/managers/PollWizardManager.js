const PollWizardSession = require('../entities/PollWizardSession');

const POLL_WIZARD_CACHE_PREFIX = 'poll-wizard';
const WIZARD_TTL = 5 * 60;

class PollWizardManager {
	constructor(store) {
		this.store = store;
	}

	key(guildId, userId) {
		return `${POLL_WIZARD_CACHE_PREFIX}:${guildId}-${userId}`;
	}

	async set(guildId, userId, session) {
		return this.store.set(
			this.key(guildId, userId),
			session.toJSON(),
			WIZARD_TTL,
		);
	}

	async get(guildId, userId) {
		const data = await this.store.get(this.key(guildId, userId));

		if (!data) return null;

		return PollWizardSession.fromJSON(data);
	}

	async delete(guildId, userId) {
		await this.store.delete(this.key(guildId, userId));
	}

	async clear() {
		await this.store.flushPrefix(POLL_WIZARD_CACHE_PREFIX);
	}
}

module.exports = PollWizardManager;
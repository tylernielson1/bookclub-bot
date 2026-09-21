const CacheManager = require('./managers/CacheManager');
const SessionManager = require('./managers/SessionManager');
const PollWizardManager = require('./managers/PollWizardManager');
const RedisCacheStore = require('./redis/RedisCacheStore');

require('dotenv').config();

const redisStore = new RedisCacheStore(
	process.env.REDIS_URL,
);

const cacheManager = new CacheManager(redisStore);
const sessionManager = new SessionManager(redisStore);
const pollWizardManager = new PollWizardManager(redisStore);

async function connectCache() {
	await redisStore.connect();
}

module.exports = {
	cacheManager,
	sessionManager,
	pollWizardManager,
	connectCache,
};
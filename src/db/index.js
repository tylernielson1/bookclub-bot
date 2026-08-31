const EventManager = require('./managers/EventManager');
const GuildConfigManager = require('./managers/GuildConfigManager');
const PollManager = require('./managers/PollManager');
const sqlite = require('./sqlite/SqliteClient');

require('dotenv').config();

const db = new sqlite('./data/bookclub.db');

const pollManager = new PollManager(db);

const guildConfigManager = new GuildConfigManager(db);
guildConfigManager.initialize();

const eventManager = new EventManager(db);

module.exports = {
	pollManager,
	guildConfigManager,
	eventManager,
};
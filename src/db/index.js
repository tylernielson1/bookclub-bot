const GuildConfigManager = require('./managers/GuildConfigManager');
const PollManager = require('./managers/PollManager');
const sqlite = require('./sqlite/SqliteClient');

require('dotenv').config();

const db = new sqlite('./data/bookclub.db');
db.initialize();

const pollManager = new PollManager(db);

const guildConfigManager = new GuildConfigManager(db);
guildConfigManager.initialize();

module.exports = {
	pollManager,
    guildConfigManager
};
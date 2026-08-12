const GuildConfig = require('../entities/GuildConfig');

class GuildConfigManager {
    constructor(db) {
        this.db = db;
        this.registeredGuilds = new Set();
    }

    initialize() {
        const rows = this.db.all(
            `
            SELECT guild_id
            FROM registered_guilds
            `
        );

        this.registeredGuilds = new Set(rows.map(row => row.guild_id));
    }

    isRegistered(guildId) {
        return this.registeredGuilds.has(guildId);
    }

    mapRowToGuildConfig(row) {
        return new GuildConfig(
            row.guild_id,
            row.announcement_channel_id,
            row.discussion_channel_id,
            row.poll_duration
        );
    }

    registerGuild(guildId) {
        this.db.transaction(() => {
            this.db.run(
                `
                INSERT INTO registered_guilds (guild_id)
                VALUES(?)
                `,
                [guildId]
            );

            this.db.run(
                `
                INSERT INTO guild_config (guild_id)
                VALUES(?)
                `,
                [guildId]
            );
        });

        this.registeredGuilds.add(guildId);
    }

    getGuildConfig(guildId) {
        const row = this.db.get(
            `
            SELECT *
            FROM guild_config
            WHERE guild_id = ?
            `,
            [guildId]
        );

        return row ? this.mapRowToGuildConfig(row) : null;
    }

    getAllConfig() {
        const rows = this.db.all(
            `
            SELECT *
            FROM guild_config
            `
        );

        return rows.map(row => this.mapRowToGuildConfig(row));
    }

    saveConfig(guildId, config = {}) {
        return this.db.run(
            `
            UPDATE guild_config
            SET announcement_channel_id = ?, discussion_channel_id = ?, poll_duration = ?, updated_at = unixepoch()
            WHERE guild_id = ?
            `,
            [
                config.announcementChannelId ?? null,
                config.discussionChannelId ?? null,
                config.pollDuration ?? null,
                guildId
            ],
        );
    }

    clearConfig(guildId, key) {
        const fields = {
            announcementChannelId: 'announcement_channel_id',
            discussionChannelId: 'discussion_channel_id',
            pollDuration: 'poll_duration',
        };

        const column = fields[key];

        if (!column) {
            throw new Error(`Unknown config key: ${key}`);
        }

        return this.db.run(
            `
            UPDATE guild_config
            SET ${column} = NULL
            WHERE guild_id = ?
            `,
            [guildId]
        );
    }

    unregisterGuild(guildId) {
        this.db.transaction(() => {
            this.db.run(
                `
                DELETE FROM guild_config
                WHERE guild_id = ?
                `,
                [guildId]
            );

            this.db.run(
                `
                DELETE FROM registered_guilds
                WHERE guild_id = ?
                `,
                [guildId]
            );
        });
        
        this.registeredGuilds.delete(guildId);
    }
}

module.exports = GuildConfigManager;
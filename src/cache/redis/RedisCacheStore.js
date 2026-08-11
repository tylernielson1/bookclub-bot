const { createClient } = require('redis');

class RedisCacheStore {
	constructor(url) {
		this.client = createClient({ url });

		this.client.on('error', error => {
			console.error('Redis error:', error);
		});
	}

	async connect() {
		if (!this.client.isOpen) {
			await this.client.connect();
		}
	}

	async get(key) {
		const value = await this.client.get(key);

		return value === null ? null : JSON.parse(value);
	}

	async set(key, value, ttl = 3600) {
		const serialized = JSON.stringify(value);

		await this.client.set(key, serialized, {
			EX: ttl,
		});
	}

	async delete(key) {
		await this.client.del(key);
	}

	async flush() {
		await this.client.flushDb();
	}

	async flushPrefix(prefix) {
		let cursor = '0';

		do {
			const result = await this.client.scan(cursor, {
				MATCH: `${prefix}:*`,
				COUNT: 100,
			});

			cursor = result.cursor;

			if (result.keys.length > 0) {
				await this.client.del(result.keys);
			}
		} while (cursor !== '0');
	}
}

module.exports = RedisCacheStore;
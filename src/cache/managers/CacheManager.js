const API_CACHE_PREFIX = 'api-cache';

class CacheManager {
	constructor(store) {
		this.store = store;
		this.pending = new Map();
	}

	key(messageId) {
		return `${API_CACHE_PREFIX}:${messageId}`;
	}

	async get(key) {
		return this.store.get(this.key(key));
	}

	async set(key, value, ttl = 3600) {
		return this.store.set(this.key(key), value, ttl);
	}

	async delete(key) {
		return this.store.delete(this.key(key));
	}

	async flushPrefix(prefix) {
		if (!prefix) {
			return;
		}

		console.warn(`Flushing cache with prefix: ${prefix}`);
		await this.store.flushPrefix(prefix);
		for (const key of this.pending.keys()) {
			if (key.startsWith(`${prefix}:`)) {
				this.pending.delete(key);
			}
		}
		console.warn('Cache flushed');
	}

	async flush() {
		console.warn('Flushing all cache entries');
		await this.store.flush();
		this.pending.clear();
		console.warn('Cache flushed');
	}

	async getOrFetch(key, fetch, ttl) {
		let cached;
		const prefixedKey = this.key(key);

		try {
			cached = await this.get(prefixedKey);
		}
		catch (error) {
			console.error(`Failed to read cache ${prefixedKey}:`, error);
		}

		if (cached !== null && cached !== undefined) {
			console.log(`Cache hit: ${prefixedKey}`);
			return cached;
		}

		console.log(`Cache miss: ${prefixedKey}`);

		if (this.pending.has(prefixedKey)) {
			console.log(`Waiting for pending request: ${prefixedKey}`);
			return this.pending.get(prefixedKey);
		}

		const promise = (async () => {
			try {
				const value = await fetch();

				try {
					await this.set(prefixedKey, value, ttl);
					console.log(`Cached: ${prefixedKey} (TTL: ${ttl}s)`);
				}
				catch (error) {
					console.error(`Failed to cache ${prefixedKey}:`, error);
				}

				return value;
			}
			finally {
				this.pending.delete(prefixedKey);
			}
		})();

		this.pending.set(prefixedKey, promise);

		return promise;
	}
}

module.exports = CacheManager;
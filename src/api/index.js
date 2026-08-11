const { cacheManager } = require('../cache');

const OpenLibraryClient = require('./OpenLibraryClient');

module.exports = {
	openLibraryClient: new OpenLibraryClient(cacheManager),
};
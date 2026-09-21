class PollWizardSession {
	constructor({
		userId,
		guildId,
		channelId,
		pollName,
		bookCount,
		inputs = [],
		currentBook = 1,
		duration = null,
		decideTies = false,
		books = [],
	}) {
		this.userId = userId;
		this.guildId = guildId;
		this.channelId = channelId;
		this.pollName = pollName;
		this.bookCount = bookCount;
		this.inputs = inputs;
		this.currentBook = currentBook;
		this.duration = duration;
		this.decideTies = decideTies;
		this.books = books;
	}

	toJSON() {
		return {
			userId: this.userId,
			guildId: this.guildId,
			channelId: this.channelId,
			pollName: this.pollName,
			bookCount: this.bookCount,
			inputs: this.inputs,
			currentBook: this.currentBook,
			duration: this.duration,
			decideTies: this.decideTies,
			books: this.books,
		};
	}

	static fromJSON(data) {
		return new PollWizardSession(data);
	}
}

module.exports = PollWizardSession;
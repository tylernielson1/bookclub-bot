class PollWizardSession {
	constructor(userId, guildId, channelId, pollName, bookCount) {
		this.userId = userId;
		this.guildId = guildId;
		this.channelId = channelId;
		this.pollName = pollName;
		this.bookCount = bookCount;
		this.inputs = [];
		this.currentBook = 0;
		this.duration = 0;
		this.decideTies = false;
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
		};
	}

	static fromJSON(data) {
		const pollWizard = new PollWizardSession(
			data.userId,
			data.guildId,
			data.channelId,
			data.pollName,
			data.bookCount,
			data.inputs,
			data.currentBook,
			data.duration,
			data.decideTies,
		);

		return pollWizard;
	}
}

module.exports = PollWizardSession;
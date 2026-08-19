const BookPollView = require('../ui/BookPollView');
const FamiliarMessages = require('../utils/FamiliarMessages');

class BookPollService {
	constructor(client, pollManager, guildConfigManager) {
		this.client = client;
		this.pollManager = pollManager;
		this.guildConfigManager = guildConfigManager;
	}

	async createPoll(channel, books, pollName) {
		if (!Array.isArray(books) || books.length !== 3) {
			throw new Error('A book poll requires exactly three books.');
		}

		const config = this.guildConfigManager.mapRowToGuildConfig(await this.guildConfigManager.getGuildConfig(channel.guildId));

		if (!config) {
			throw new Error('Book polls have not been configured for this server.');
		}

		const pollMessage = await channel.send(
			BookPollView.render(books, pollName, {
				duration: config.pollDuration,
			}),
		);

		const thread = await pollMessage.startThread({
			name: '📚 Book Discussion',
			autoArchiveDuration: 10080,
			reason: 'Book poll discussion',
		});

		for (const book of books) {
			await thread.send(BookPollView.buildBookMessage(book));
		}

		this.pollManager.createPoll({
			messageId: pollMessage.id,
			channelId: channel.id,
			guildId: channel.guildId,
			books: books,
			announcementChannelId: config.announcementChannelId,
			discussionChannelId: config.discussionChannelId,
			expiresAt: pollMessage.poll.expiresAt.getTime(),
		});

		return pollMessage;
	}

	async checkExpiredPolls() {
		console.log('checking for expired polls...');
		for (const poll of this.pollManager.getExpiredPolls()) {
			try {
				await this.processExpiredPoll(poll);
			}
			catch (error) {
				console.error(`Failed to process poll ${poll.messageId}:`, error);
			}
		}
	}

	async processExpiredPoll(poll, useTieSelector = false) {
		console.log(`Processing poll ${poll.id}`);
		const channel = await this.client.channels.fetch(poll.channelId);

		if (!channel?.isTextBased()) {
			throw new Error(`Unable to access poll channel ${poll.channelId}.`);
		}

		const message = await channel.messages.fetch(poll.messageId);

		if (!message.poll) {
			throw new Error(`Message ${poll.messageId} no longer contains a poll.`);
		}

		// Make sure the latest poll data is available.
		const pollData = message.poll;
		const winner = useTieSelector ?
			this.getTiedWinner(pollData, poll.books) : this.getWinner(pollData, poll.books);
		if (!winner) {
			const noWinnerMessage = await this.announceNoWinner(poll);
			const completed = this.pollManager.completePoll(poll.id, {
				winner: null,
				announcementMessageId: noWinnerMessage?.id ?? null,
				discussionThreadId: null,
			});

			if (!completed) {
				console.warn(`Poll ${poll.id} was already completed.`);
			}
			return;
		}

		const result = await this.announceWinner(poll, winner, useTieSelector);

		const completed = this.pollManager.completePoll(poll.id, {
			winner: winner.title,
			announcementMessageId: result.announcement?.id ?? null,
			discussionThreadId: result.discussion?.id ?? null,
		});

		if (!completed) {
			console.warn(`Poll ${poll.id} was already completed.`);
		}
	}

	getWinner(poll, books) {
		const answers = [...poll.answers.values()];

		if (!answers.length) {
			return null;
		}

		let winningAnswer = null;

		for (const answer of answers) {
			if (!winningAnswer || answer.voteCount > winningAnswer.voteCount) {
				winningAnswer = answer;
			}
		}

		if (!winningAnswer || winningAnswer.voteCount === 0) {
			return null;
		}

		const answerIndex = answers.findIndex(answer => answer.id === winningAnswer.id);

		return books[answerIndex] ?? null;
	}

	getTiedWinner(poll, books) {
		const answers = [...poll.answers.values()];

		if (!answers.length) {
			return null;
		}

		const maxVotes = Math.max(
			...answers.map(answer => answer.voteCount),
		);

		if (maxVotes === 0) {
			return null;
		}

		const tiedAnswers = answers.filter(
			answer => answer.voteCount === maxVotes,
		);

		const winningAnswer = tiedAnswers[Math.floor(Math.random() * tiedAnswers.length)];

		const answerIndex = answers.findIndex(answer => answer.id === winningAnswer.id);

		return books[answerIndex] ?? null;
	}

	async announceNoWinner(poll) {
		if (!poll.announcementChannelId) {
			return;
		}

		const channel = await this.client.channels.fetch(poll.announcementChannelId);

		if (!channel?.isTextBased()) {
			throw new Error(`Unable to access announcement channel ${poll.announcementChannelId}.`);
		}

		if (poll.announcementMessageId) {
			try {
				return await channel.messages.fetch(poll.announcementMessageId);
			}
			catch (error) {
				if (error.code !== 10008) throw error;

				console.warn(`Announcement ${poll.announcementMessageId} could not be found. Creating new announcement.`);

				poll.announcementMessageId = null;
			}
		}

		const announcement = await channel.send(BookPollView.buildNoWinnerAnnouncement());

		this.pollManager.saveAnnouncementMessage(poll.id, announcement.id);

		poll.announcementMessageId = announcement.id;

		return announcement;
	}

	async announceWinner(poll, winner, useTieSelector) {
		const announcementChannel = await this.client.channels.fetch(poll.announcementChannelId);

		if (!announcementChannel?.isTextBased()) {
			throw new Error(`Unable to access announcement channel ${poll.announcementChannelId}.`);
		}

		let discussion = null;

		if (poll.discussionThreadId) {
			try {
				discussion = await this.client.channels.fetch(
					poll.discussionThreadId,
				);

				if (!discussion?.isThread()) {
					throw new Error(
						`Channel ${poll.discussionThreadId} is not a thread.`,
					);
				}
			}
			catch (error) {
				if (error.code !== 10003) {
					throw error;
				}

				console.warn(
					`Discussion ${poll.discussionThreadId} could not be found. Creating new thread.`,
				);

				poll.discussionThreadId = null;
			}
		}

		if (!discussion) {
			discussion = await this.createDiscussion(poll, winner);

			if (discussion) {
				this.pollManager.saveDiscussionThread(
					poll.id,
					discussion.id,
				);

				poll.discussionThreadId = discussion.id;
			}
		}

		if (poll.announcementMessageId) {
			try {
				const announcement = await announcementChannel.messages.fetch(
					poll.announcementMessageId,
				);

				return {
					announcement,
					discussion,
				};
			}
			catch (error) {
				if (error.code !== 10008) throw error;

				console.warn(`Announcement ${poll.announcementMessageId} could not be found. Creating new announcement.`);

				poll.announcementMessageId = null;
			}
		}

		const announcement = await announcementChannel.send(
			BookPollView.buildWinnerAnnouncement(
				winner.title,
				useTieSelector,
				discussion?.url,
			),
		);

		this.pollManager.saveAnnouncementMessage(
			poll.id,
			announcement.id,
		);

		poll.announcementMessageId = announcement.id;

		return {
			announcement,
			discussion,
		};
	}

	async createDiscussion(poll, book) {
		if (!poll.discussionChannelId) {
			return;
		}

		const discussionChannel = await this.client.channels.fetch(poll.discussionChannelId);

		if (!discussionChannel?.isThreadOnly()) {
			throw new Error(`Channel ${poll.discussionChannelId} is not a forum channel.`);
		}

		return await discussionChannel.threads.create({
			name: book.title,
			message: FamiliarMessages.discussions(book.title),
			reason: 'Create a book discussion for this month\'s winner.',
		});
	}

	start(interval = 30_000) {
		this.checkExpiredPolls().catch(error => {
			console.error('Failed initial poll check:', error);
		});

		this.interval = setInterval(() => {
			this.checkExpiredPolls().catch(error => {
				console.error('Failed poll check:', error);
			});
		}, interval);

		return this.interval;
	}

	stop() {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}

module.exports = BookPollService;
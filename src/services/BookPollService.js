const BookPollView = require('../ui/BookPollView');
const FamiliarMessages = require('../utils/FamiliarMessages');
const { sleep } = require('../utils/utils');

class BookPollService { 
    constructor(client, options = {}) { 
        this.client = client; 
        this.polls = new Map();
        this.pollDuration = options.pollDuration ?? 168; // 7 days 
        this.announcementChannelId = options.announcementChannelId ?? null;
        this.discussionChannelId = options.discussionChannelId ?? null;
    } 
    
    async createPoll(channel, books, pollName) { 
        if (!Array.isArray(books) || books.length !== 3) { 
            throw new Error('A book poll requires exactly three books.'); 
        } 
        
        const pollMessage = await channel.send(
            BookPollView.render(books, pollName, {
                duration: this.pollDuration
            })
        );

        const thread = await pollMessage.startThread({ 
            name: '📚 Book Discussion',
            autoArchiveDuration: 10080,
            reason: 'Book poll discussion' 
        });
        
        for (const book of books) {
            await thread.send(BookPollView.buildBookMessage(book)); 
        } 
        
        this.trackPoll(pollMessage, books);

        await sleep(10000);

        await this.testAnnouncement(pollMessage.id);
        
        return pollMessage; 
    } 
        
    trackPoll(message, books) { 
        if (!message.poll) { 
            throw new Error('Poll message does not contain a poll.'); 
        } 
        
        this.polls.set(
            message.id, { 
                messageId: message.id, 
                channelId: message.channel.id, 
                announcementChannelId: this.announcementChannelId,
                discussionChannelId: this.discussionChannelId,
                books, 
                expiresAt: message.poll.expiresAt, 
                announced: false 
            }); 
    } 
        
    async checkExpiredPolls() { 
        for (const poll of this.polls.values()) { 
            if (poll.announced) { 
                continue; 
            } 
            
            if (!poll.expiresAt || Date.now() < poll.expiresAt.getTime()) { 
                continue; 
            } 
            
            try { 
                await this.announceWinner(poll); 
                poll.announced = true; 
            } catch (error) { 
                console.error( `Failed to announce poll ${poll.messageId}:`, error );
            } 
        } 
        
        this.cleanup(); 
    } 
    
    async announceWinner(poll, useTieSelector = false) { 
        const channel = await this.client.channels.fetch( poll.channelId );
        
        if (!channel?.isTextBased()) { 
            throw new Error( `Unable to access poll channel ${poll.channelId}.` ); 
        } 
        
        const message = await channel.messages.fetch( poll.messageId );
        
        if (!message.poll) { 
            throw new Error( `Message ${poll.messageId} no longer contains a poll.` ); 
        } 
        
        // Make sure the latest poll data is available. 
        const pollData = message.poll;
        const winner = useTieSelector ? 
            this.getTiedWinner(pollData, poll.books) : this.getWinner( pollData, poll.books );
        if (!winner) { 
            await this.announceNoWinner(poll); 
            return; 
        }
        
        const announcementChannel = await this.client.channels.fetch( poll.announcementChannelId );
        
        if (!announcementChannel?.isTextBased()) { 
            throw new Error( `Unable to access announcement channel ${poll.announcementChannelId}.` ); 
        }

        const discussion = await this.createDiscussion(winner); 
        
        await announcementChannel.send(BookPollView.buildWinnerAnnouncement(winner.title, useTieSelector, discussion?.url)); 
    }

    getWinner(poll, books) { 
        const answers = [...poll.answers.values()];
        
        if (!answers.length) { 
            return null; 
        }

        let winningAnswer = null; 
        
        for (const answer of answers) { 
            if ( !winningAnswer || answer.voteCount > winningAnswer.voteCount ) { 
                winningAnswer = answer; 
            } 
        } 
        
        if (!winningAnswer || winningAnswer.voteCount === 0) { 
            return null; 
        } 
        
        const answerIndex = answers.findIndex( answer => answer.id === winningAnswer.id ); 
        
        return books[answerIndex] ?? null; 
    }

    getTiedWinner(poll, books) {
        const answers = [...poll.answers.values()];
        
        if (!answers.length) { 
            return null; 
        }

        const maxVotes = Math.max(
            ...answers.map(answer => answer.voteCount)
        );

        if (maxVotes === 0) {
            return null;
        }

        const tiedAnswers = answers.filter(
            answer => answer.voteCount === maxVotes
        );

        const winningAnswer = tiedAnswers[Math.floor(Math.random() * tiedAnswers.length)];
        
        const answerIndex = answers.findIndex( answer => answer.id === winningAnswer.id ); 
        
        return books[answerIndex] ?? null; 
    }
    
    async announceNoWinner(poll) { 
        if (!poll.announcementChannelId) { 
            return; 
        } 
        
        const channel = await this.client.channels.fetch( poll.announcementChannelId );
        
        if (!channel?.isTextBased()) { 
            throw new Error( `Unable to access announcement channel ${poll.announcementChannelId}.` ); 
        } 
        
        await channel.send( BookPollView.buildNoWinnerAnnouncement() ); 
    }
    
    async testAnnouncement(pollMessageId) {
        const poll = this.polls.get(pollMessageId);

        if (!poll) {
            console.error('Poll not found');
        }

        await this.announceWinner(poll);
    }

    async createDiscussion(book) {
        if (!this.discussionChannelId) {
            return;
        }

        const discussionChannel = await this.client.channels.fetch(this.discussionChannelId);

        if (!discussionChannel?.isThreadOnly()) {
            throw new Error(`Channel ${this.discussionChannelId} is not a forum channel.`);
        }

        const thread = await discussionChannel.threads.create({
            name: book.title,
            message: FamiliarMessages.discussions(book.title),
            reason: 'Create a book discussion for this month\'s winner.'
        });

        return thread;
    }
    
    cleanup() { 
        for (const [messageId, poll] of this.polls) { 
            if (poll.announced) { 
                this.polls.delete(messageId); 
            } 
        } 
    } 
    
    start(interval = 30_000) { 
        this.interval = setInterval(() => this.checkExpiredPolls(), interval ); 
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
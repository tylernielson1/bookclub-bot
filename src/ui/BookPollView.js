const FamiliarMessages = require('../utils/FamiliarMessages');
const { EmbedBuilder } = require('discord.js');
const { truncate } = require('../utils/utils');

class BookPollView {
    render(books, name, options = {}) {
        return {
            content: FamiliarMessages.pollCreation(),
            poll: {
                question: {
                    text: name
                },
                answers: books.map(book => ({
                    text: truncate(`${book.title} by ${book.authors ?? 'Unknown'}`, 55)
                })),
                allowMultiselect: false,
                duration: options.duration ?? 168
            }
        };
    }

    buildBookMessage(book) {
        const embed = new EmbedBuilder()
            .setColor(0x4F46E5)
            .setTitle(book.title);

        const links = [];
        if (book.goodreadsLink) {
            links.push(`[Goodreads](${book.goodreadsLink})`);
        }

        if (book.storygraphLink) {
            links.push(`[Storygraph](${book.storygraphLink})`);
        }

        embed.addFields({
            name: "Author",
            value: book.authors ?? "Unknown",
            inline: true
        });

        if (links.length > 0) {
            embed.addFields({
                name: "Links",
                value: links.join('\n')
            });
        }

        return {
            embeds: [embed]
        };
    }

    buildWinnerAnnouncement(book, wasTied, link) {
        let joinLink = '';
        if (link) {
            joinLink = `\nJoin the discussion here: ${link}.`
        }
        return {
            content: `@everyone ${FamiliarMessages.pollWinner(book, wasTied)}${joinLink}`
        };
    }

    buildNoWinnerAnnouncement() {
        return {
            content: FamiliarMessages.noPollWinner()
        };
    }
}

module.exports = new BookPollView();
const { EmbedBuilder } = require('discord.js');
const { backButton } = require('./components');
const OpenLibraryClient = require('../api/OpenLibraryClient');
const { truncate } = require('../utils/utils');

class BookDetailView {
    async render(book, options = {}) {
        const { showBackButton = true } = options;
        const embed = new EmbedBuilder()
            .setColor(0x4F46E5)
            .setTitle(book.title);

        if (book.description) {
            embed.setDescription(truncate(book.description, 500));
        }

        if (book.thumbnail) {
            embed.setThumbnail(`https://covers.openlibrary.org/b/id/${book.thumbnail}-S.jpg`);
        }

        const links = [];
        if (book.goodreadsLink) {
            links.push(`[Goodreads](${book.goodreadsLink})`);
        }

        if (book.storygraphLink) {
            links.push(`[Storygraph](${book.storygraphLink})`);
        }

        embed.addFields(
            {
                name: "Author",
                value: book.authors ?? "Unknown",
                inline: true
            },
            {
                name: "Published",
                value: String(book.publishYear ?? "Unknown"),
                inline: true
            },
            {
                name: "Pages",
                value: String(book.pages ?? "Unknown"),
                inline: true
            },
            {
                name: "Publisher",
                value: book.publisher ?? "Unknown",
                inline: true
            },
            {
                name: "ISBN",
                value: book.isbn13 ?? "Unknown",
                inline: true
            }
        );

        if (links.length > 0) {
            embed.addFields({
                name: "Links",
                value: links.join('\n')
            });
        }

        const components = [];
        if (showBackButton) {
            components.push(backButton());
        }

        return {
            embeds: [embed],
            components: components
        };
    }
}

module.exports = new BookDetailView();
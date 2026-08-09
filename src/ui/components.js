const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require('discord.js');

exports.paginationButtons = (page, totalPages) => {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('books_prev')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),

            new ButtonBuilder()
                .setCustomId('books_next')
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page >= totalPages - 1)
        );
};

exports.bookSelect = (books) => {
    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('books_select')
                .setPlaceholder('Choose a book...')
                .addOptions(
                    books.map((book, index) => ({
                        label: book.title.substring(0, 100),
                        description: `${book.authors} (${book.publishYear})`.substring(0, 100),
                        value: index.toString()
                    }))
                )
        );
};

exports.backButton = () => {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('books_back')
                .setLabel('Back')
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Primary)
        )
};
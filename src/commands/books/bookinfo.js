const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const OpenLibraryClient = require('../../api/OpenLibraryClient');
const BookDetailView = require('../../ui/BookDetailView');
const BookSearchView = require('../../ui/BookSearchView');
const FamiliarMessages = require('../../utils/FamiliarMessages');
const SearchSession = require('../../sessions/SearchSession');
const SessionManager = require('../../sessions/SessionManager');
const { sleep } = require('../../utils/utils');

async function handleIsbnSearch(interaction, isbn) {
    let book;
    try {
        book = await timedSearch(() => 
            OpenLibraryClient.searchIsbn(isbn)
        );
    } catch (error) {
        console.error('Error fetching books:', error);
        return interaction.editReply({
            content: FamiliarMessages.apiUnavailable()
        });
    }

    if (!book) {
        return interaction.editReply({
            content: FamiliarMessages.noResults()
        });
    }

    const detailsView = await BookDetailView.render(book, {showBackButton: false});

    await reply(interaction, detailsView);
}

async function handleTitleSearch(interaction, title, author) {
    let books;
    try {
        books = await timedSearch(() => 
            OpenLibraryClient.searchTitleAuthor(title, author)
        );
    } catch (error) {
        console.error('Error fetching books:', error);
        return interaction.editReply({
            content: FamiliarMessages.apiUnavailable()
        });
    }

    if (!books.length) {
        return interaction.editReply({
            content: FamiliarMessages.noResults()
        });
    }

    const session = new SearchSession(
        interaction.user.id,
        books,
        {
            title,
            author
        }
    );

    const view = BookSearchView.render(session);

    await reply(interaction, view);

    const message = await interaction.fetchReply();

    SessionManager.set(message.id, session);
}

async function timedSearch(callback) {
    const start = Date.now();
    
    const result = await callback();

    const elapsed = Date.now() - start;

    if (elapsed < 1000) {
        await sleep(1000 - elapsed);
    }

    return result;
}

async function reply(interaction, view) {
    return interaction.editReply({
        content: null,
        ...view
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bookinfo')
        .setDescription('Gets information about the provided book.')
        .addStringOption((option) => option.setName('title').setDescription('The title of the book'))
        .addStringOption((option) => option.setName('author').setDescription('Author of the book'))
        .addStringOption((option) => option.setName('isbn').setDescription('ISBN of the book')),
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const author = interaction.options.getString('author');
        const isbn = interaction.options.getString('isbn');

        if (!isbn && !title) {
            return interaction.reply({
                content: 'I require an ISBN or title to perform my services.',
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply();

        await interaction.editReply({
            content: FamiliarMessages.loading()
        });

        if (isbn) {
            return handleIsbnSearch(interaction, isbn);
        }

        return handleTitleSearch(interaction, title, author);
    },
};
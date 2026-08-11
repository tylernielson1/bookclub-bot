const loadingMessages = [
    '🐈‍⬛ I know it was on this shelf...',
    '📚 Someone keeps shelving these by moon phase...',
    '🌿 One moment... the shelves have moved again.',
    '🔮 The crystal is a bit foggy today.',
    '🧹 I promise I didn\'t knock that pile over.',
    '🐦 Don\'t mind the fluttering pages...',
    '🕸️ Just untangling a few cobwebs...'
];

const noResultsMessages = [
    '🐈‍⬛ I searched every shelf, but no such tome could be found.',
    '📚 The coven\'s library holds no record of that title.',
    '🔮 Even the crystal cannot find that book.',
    '🌿 The trail of ink has gone cold.',
    '📜 No matching volume appears in the archives.',
];

const sessionExpirationMessages = [
    '🌙 The spell has faded. Ask me again, and I\'ll search anew.',
    '🕯️ The enchantment has worn off. Cast another search.',
    '📚 Those pages have slipped back into the stacks. Search again to continue.',
    '🐈‍⬛ I\'ve wandered off since then. Summon me again with a new search.'
];

const apiUnavailableMessages = [
    '🌩️ The ley lines are unusually turbulent. I can\'t reach the archives right now.',
    '🔮 My crystal has gone cloudy. Please try your search again in a moment.',
    '🕯️ The candles flicker, but the archives remain silent. Try again shortly.',
    '📚 The enchanted library isn\'t answering my call. Please try again soon.',
    '🌙 The veil is restless tonight. I can\'t consult the archives at the moment.',
    '✨ The magic is wavering. Give me a moment before asking again.'
];

const sessionPermissionsMessages = [
    '🐈‍⬛ This spell belongs to another member of the coven. I can only answer to the witch who summoned it.',
    '🔮 This scrying circle was not cast by you. Please summon your own search.',
    '🕯️ I recognize this spell, but not its caster. Only the summoner may guide it.',
    '📜 This tome search is bound to another witch. You\'ll need to cast your own spell.',
    '🌙 The enchantment recognizes its original caster and will not answer to another.'
];

const pollCreationMessages = [
    '🔮 I\'ve consulted the shelves. They were surprisingly unhelpful, so I\'ve brought you three choices.',
    '🐈‍⬛ My little claws have gathered three tomes. Which one shall we read?',
    '📚 The shelves have been searched, the candles have been lit, and I have three suggestions.',
    '📜 I have brought forth three tomes from the stacks. Surely one shall please the coven.',
    '🌿 The reading circle is hungry. I have prepared three offerings.',
    '🌙 I\'ve done the summoning. You lot can handle the voting.',
    '✨ Three books have crossed my path. I suspect the library is trying to tell us something.'
];

const pollWinnerMessages = [
    (title) => `✨ We have a winner! "${title}" it is. Shall I fetch the tea?`,
    (title) => `🔮 The votes have settled on "${title}". I'm quite curious to see what awaits us inside...`,
    (title) => `🐈‍⬛ Well, well, well... "${title}" has won the vote. I suppose I'll have to dust off the reading cushions.`
];

const pollWinnerTieMessages = [
    (title) => `🔮 The coven couldn't decide, so I made the decision for you. ${title} it is!`,
    (title) => `🐈‍⬛ It was a tie, so I made an executive magical decision. ${title} wins! Please direct all complaints to the cauldron.`,
    (title) => `🕯️ The scales were perfectly balanced... until I gave them a little nudge. {title} emerges victorious!`
];

const noPollWinnerMessages = [
    '🐈‍⬛ Nobody chose? Fine. I shall choose next time. You clearly cannot be trusted with this responsibility.',
    '🌙 The votes have faded into silence. It seems the coven could not be persuaded this time.',
    '🔮 The crystal reveals no victor. Perhaps the books are waiting for a more decisive summoning.'
];

const bookDiscussionMessages = [
    (title) => `📚 The coven has spoken! **${title}** has been chosen as our next read. Gather your thoughts, sharpen your quills, and let the discussion begin.`, 
    (title) => `🔮 The reading has been decided. **${title}** now awaits the coven. Enter if you dare, and bring your theories with you.`,
    (title) => `🐈‍⬛ The votes have spoken, and **${title}** has been dragged from the shelves. I expect everyone to actually read it this time.`,
    (title) => `🕯️ The candles are lit, the tea is steeping, and **${title}** has been chosen. The reading circle is officially summoned.`,
    (title) => `✨ A new tome has been selected! **${title}** shall be our next literary adventure. May the pages be kind and the spoilers remain contained.`,
    (title) => `🌙 Fate has chosen **${title}** for the coven. Turn the first page, brave reader, and meet me here when you've discovered what lies within.`
];

function random(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
    loading() {
        return random(loadingMessages);
    },

    noResults() {
        return random(noResultsMessages);
    },

    sessionExpiration() {
        return random(sessionExpirationMessages);
    },

    apiUnavailable() {
        return random(apiUnavailableMessages);
    },

    sessionPermissions() {
        return random(sessionPermissionsMessages);
    },
    pollCreation() {
        return random(pollCreationMessages);
    },
    pollWinner(title, wasTied) {
        const selectedMessage = wasTied ? random(pollWinnerTieMessages) : random(pollWinnerMessages);
        return selectedMessage(title);
    },
    noPollWinner() {
        return random(noPollWinnerMessages);
    },
    discussions(title) {
        const selectedMessage = random(bookDiscussionMessages);
        return selectedMessage(title);
    }
};
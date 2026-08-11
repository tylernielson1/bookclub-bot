const summoningSpells = [
	{
		name: 'Spell of the Wandering Tome',
		incantation: 'By ink and spine, by shelf and stone, bring forth the book I seek to own.',
		effect: 'Summons a mysterious book from somewhere deep within the library.',
		comment: '🐈‍⬛ "I do hope it is the correct book this time."',
		rarity: 'common',
		type: 'summoning',
	},
	{
		name: 'Conjuration of the Cozy Nook',
		incantation: 'By candle flame and cushions deep, conjure forth a place to read and sleep.',
		effect: 'Summons the perfect reading spot.',
		comment: '🕯️ "Excellent. Now we simply need to convince everyone to stop talking."',
		rarity: 'common',
		type: 'summoning',
	},
	{
		name: 'Summoning of the Forgotten Bookmark',
		incantation: 'By folded page and ribbon thread, return the marker where it fled.',
		effect: 'Summons a lost bookmark from the shadowy depths of the library.',
		comment: '📚 "It was under the book the entire time. Naturally."',
		rarity: 'common',
		type: 'summoning',
	},
	{
		name: 'Call of the Endless Stacks',
		incantation: 'Stacks above and stacks below, open wide and let me know.',
		effect: 'Reveals a hidden passage into the library stacks.',
		comment: '🔮 "Please do not wander too far. The shelves rearrange themselves when they get bored."',
		rarity: 'uncommon',
		type: 'summoning',
	},
	{
		name: 'Familiar\'s Summoning',
		incantation: 'By moon and mist and midnight hour, summon forth the creature of power.',
		effect: 'Summons your faithful magical familiar.',
		comment: '🐈‍⬛ "You called? I was busy doing absolutely nothing."',
		rarity: 'uncommon',
		type: 'summoning',
	},
	{
		name: 'Ritual of the Next Read',
		incantation: 'By borrowed word and printed page, bring forth the tale for our next stage.',
		effect: 'Summons a book worthy of joining the reading circle.',
		comment: '✨ "Something tells me this one will cause arguments. Excellent."',
		rarity: 'rare',
		type: 'summoning',
	},
];

const divinationSpells = [
	{
		name: 'Scrying of the Next Chapter',
		incantation: 'By ink and candle, page and quill, reveal the tale that calls me still.',
		effect: 'Reveals a glimpse of the next book waiting to be read.',
		comment: '🔮 "The crystal is showing me something... oh. It is a very large book."',
		rarity: 'common',
		type: 'divination',
	},
	{
		name: 'Oracle of the Open Page',
		incantation: 'Turn the page and speak the word, reveal the tale that must be heard.',
		effect: 'Reveals a mysterious literary omen.',
		comment: '📜 "I have no idea what that means. The oracle has always been annoyingly vague."',
		rarity: 'common',
		type: 'divination',
	},
	{
		name: 'Divination of Literary Fate',
		incantation: 'Stars above and pages below, show me where the reader\'s path shall go.',
		effect: 'Foretells the kind of book fate has chosen for you.',
		comment: '🌙 "Apparently, you are destined to read something with at least three hundred pages."',
		rarity: 'common',
		type: 'divination',
	},
	{
		name: 'Crystal Ball of Bad Decisions',
		incantation: 'Crystal bright and crystal clear, show the book I should not fear.',
		effect: 'Reveals a book you probably should have started months ago.',
		comment: '🐈‍⬛ "Ah. Yes. You still haven\'t finished that one."',
		rarity: 'uncommon',
		type: 'divination',
	},
	{
		name: 'Augury of the Unread Shelf',
		incantation: 'Dusty spine and waiting tome, reveal the book that waits at home.',
		effect: 'Identifies a neglected book from your unread collection.',
		comment: '📚 "The answer appears to be... the book you bought two years ago."',
		rarity: 'uncommon',
		type: 'divination',
	},
	{
		name: 'Moonlit Bibliomancy',
		incantation: 'Moon above and pages turn, show me what I need to learn.',
		effect: 'Uses the ancient art of bibliomancy to reveal a literary omen.',
		comment: '🌙 "The moon has spoken. I am not sure it has read the book either."',
		rarity: 'rare',
		type: 'divination',
	},
];

const chaosSpells = [
	{
		name: 'Spell of the Unruly Shelves',
		incantation: 'By crooked spine and crooked shelf, let every book arrange itself!',
		effect: 'Randomizes the library shelves.',
		comment: '🐈‍⬛ "Oh dear. That was not supposed to happen."',
		rarity: 'common',
		type: 'chaotic',
	},
	{
		name: 'Curse of the Endless Chapter',
		incantation: 'By candle smoke and reader\'s plight, let this chapter last all night.',
		effect: 'Makes one chapter suspiciously difficult to put down.',
		comment: '📚 "You said one more chapter. I merely ensured you meant it."',
		rarity: 'uncommon',
		type: 'chaotic',
	},
	{
		name: 'Hex of the Missing Bookmark',
		incantation: 'By ink and page and reader\'s dread, hide the marker where it\'s least well-read.',
		effect: 'Makes your bookmark mysteriously disappear.',
		comment: '😈 "Perhaps you should have used a less tempting bookmark."',
		rarity: 'rare',
		type: 'chaotic',
	},
	{
		name: 'Ritual of Literary Confusion',
		incantation: 'Words above and words below, scramble what the readers know!',
		effect: 'Temporarily scrambles the familiar\'s understanding of literature.',
		comment: '🔮 "I have forgotten what this spell does. Which means it worked perfectly."',
		rarity: 'very rare',
		type: 'chaotic',
	},
];

const legendarySpells = [
	{
		legendaryTitle: '✨ LEGENDARY SPELL DISCOVERED',
		name: 'The Grand Bibliomantic Invocation',
		incantation: 'By every tale that ever was, by every word and written cause, awaken now the ancient lore.',
		effect: 'Summons the accumulated knowledge of the entire enchanted library.',
		comment: '✨ "I have consulted every book in the library. I regret to inform you that none of them know where you left your bookmark."',
	},
	{
		legendaryTitle: '✨ LEGENDARY SPELL DISCOVERED',
		name: 'The Forbidden Spell of Infinite Stories',
		incantation: 'By ink eternal, page unbound, let every story circle round.',
		effect: 'Opens a portal to the infinite library, where every possible story waits to be read.',
		comment: '🌙 "We should probably close that. Quickly. Before you realize how many books are in there."',
	},
];

const spellRefusal = [
	{
		name: 'The Uncastable Spell',
		incantation: 'By moon and flame and ancient rite, I call upon the-',
		effect: 'The spell refuses to be completed.',
		comment: '🐈‍⬛ "No. I don\'t like where that was going."',
		type: 'refusal',
	},
	{
		name: 'The Familiar\'s Veto',
		incantation: 'By candle, crystal, book, and bone, I summon-',
		effect: 'The familiar has personally vetoed the spell.',
		comment: '🔮 "Absolutely not. I have reviewed the proposal and rejected it on magical grounds."',
		type: 'refusal',
	},
	{
		name: 'The Forbidden Bookmark',
		incantation: 'By ink and page, by ancient lore, reveal to me what lies-',
		effect: 'The spell has been sealed by forces beyond your understanding.',
		comment: '📚 "That knowledge is forbidden. Also, I forgot what it was."',
		type: 'refusal',
	},
	{
		name: 'The Spell of Absolutely Not',
		incantation: 'Ancient powers, hear my plea, grant me-',
		effect: 'Nothing happens.',
		comment: '🐈‍⬛ "No."',
		type: 'refusal',
	},
	{
		name: 'The Unwise Invocation',
		incantation: 'By stars above and shadows below, awaken what should-',
		effect: 'The spell has been interrupted before something regrettable could happen.',
		comment: '🌙 "Trust me. You do not want to finish that sentence."',
		type: 'refusal',
	},
	{
		name: 'The Library\'s Refusal',
		incantation: 'By every tome upon the shelf, grant me knowledge of-',
		effect: 'The library itself has declined your request.',
		comment: '📜 "Even the books think that was a terrible idea."',
		type: 'refusal',
	},
];

function random(messages) {
	return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
	getSpell(type, target) {
		// 20% chance for familiar to refuse to cast spell.
		if (Math.random() < 0.2) {
			return random(spellRefusal);
		}

		let spell;
		switch (type) {
		case 'summon':
			spell = random(summoningSpells);
			break;
		case 'divination':
			spell = random(divinationSpells);
			break;
		case 'chaos':
			spell = random(chaosSpells);
			break;
		default:
			spell = random([...summoningSpells, ...divinationSpells, ...chaosSpells]);
			break;
		}

		if (target) {
			return {
				name: `${target} has been targeted by the ${spell.name}`,
				incantation: spell.incantation,
				effect: spell.effect,
				comment: spell.comment,
				type: spell.type,
				rarity: spell.rarity,
			};
		}

		if (!type) {
			// 1% chance to find legendary spell.
			if (Math.random() < 0.01) {
				return random(legendarySpells);
			}
		}

		return spell;
	},
};
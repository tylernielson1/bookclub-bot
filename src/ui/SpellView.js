const { EmbedBuilder } = require('discord.js');
const Spells = require('../utils/Spells');

class SpellView {
	render(type, target) {
		const spell = Spells.getSpell(type, target);

		return spell.type === 'refusal' ? this.renderRefusal(spell) : this.renderSpell(spell);
	}

	renderSpell(spell) {
		const spellTitle = spell.legendaryTitle ? spell.legendaryTitle : `A ${spell.rarity} ${spell.type} spell has been cast!`;

		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle(spellTitle)
			.setDescription(
				[
					`**${spell.name}**`,
					`"*${spell.incantation}*"`,
					`Effect: ${spell.effect}`,
					`${spell.comment}`,
				].join('\n\n'),
			);

		return {
			embeds: [embed],
		};
	}

	renderRefusal(refusal) {
		const embed = new EmbedBuilder()
			.setColor(0x4F46E5)
			.setTitle('🐈‍⬛ The familiar refuses to cast this spell.')
			.setDescription(
				[
					`**${refusal.name}**`,
					`"*${refusal.incantation}*"`,
					`Effect: ${refusal.effect}`,
					`${refusal.comment}`,
				].join('\n\n'),
			);

		return {
			embeds: [embed],
		};
	}
}

module.exports = new SpellView();
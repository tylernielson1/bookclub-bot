const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');
const { DateTime } = require('luxon');
const { discordTimestamp } = require('../utils/utils');

class EventEditView {
	render(event) {
		return {
			embeds: [this.buildEventEditEmbed(event)],
			components: [this.buildEditButtons(event.id)],
		};
	}

	buildEventEditEmbed(event) {
		return new EmbedBuilder()
			.setTitle(event.name)
			.addFields(
				{
					name: '📍 Location',
					value: event.location,
				},
				{
					name: '📆 Date and Time',
					value: [
						discordTimestamp(event.startTime),
						discordTimestamp(event.startTime, 'R'),
					].join('\n'),
				},
			);
	}

	buildEditButtons(eventId) {
		return new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`eventEdit_:name:${eventId}`)
					.setLabel('Edit Name')
					.setStyle(ButtonStyle.Primary),

				new ButtonBuilder()
					.setCustomId(`eventEdit_:location:${eventId}`)
					.setLabel('Edit Location')
					.setStyle(ButtonStyle.Primary),

				new ButtonBuilder()
					.setCustomId(`eventEdit_:date:${eventId}`)
					.setLabel('Edit Date')
					.setStyle(ButtonStyle.Primary),

				new ButtonBuilder()
					.setCustomId(`eventEdit_:time:${eventId}`)
					.setLabel('Edit Time')
					.setStyle(ButtonStyle.Primary),

				new ButtonBuilder()
					.setCustomId(`eventEdit_done:done:${eventId}`)
					.setLabel('Done')
					.setStyle(ButtonStyle.Secondary),
			);
	}

	buildEditModal(field, event) {
		const modal = new ModalBuilder()
			.setCustomId(`eventEdit_modal:${field}:${event.id}:${Date.now()}`)
			.setTitle(`Edit ${this.getFieldLabel(field)}`);

		const input = new TextInputBuilder()
			.setCustomId('value')
			.setLabel(this.getFieldLabel(field))
			.setStyle(TextInputStyle.Short)
			.setRequired(true)
			.setValue(this.getFieldValue(field, event));

		modal.addComponents(
			new ActionRowBuilder().addComponents(input),
		);

		return modal;
	}

	getFieldLabel(field) {
		switch (field) {
		case 'name':
			return 'Event Name';

		case 'location':
			return 'Location';

		case 'date':
			return 'Date';

		case 'time':
			return 'Time';

		default:
			throw new Error(`Unknown event field: ${field}`);
		}
	}

	getFieldValue(field, event) {
		const timestamp = DateTime.fromMillis(event.startTime);
		const date = timestamp.toLocaleString(DateTime.DATE_SHORT);
		const time = timestamp.toLocaleString(DateTime.TIME_SIMPLE);
		switch (field) {
		case 'name':
			return event.name;

		case 'location':
			return event.location;

		case 'date':
			return date;

		case 'time':
			return time;

		default:
			throw new Error(`Unknown event field: ${field}`);
		}
	}
}

module.exports = new EventEditView();
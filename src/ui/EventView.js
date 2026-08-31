const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageFlags,
} = require('discord.js');
const { discordTimestamp } = require('../utils/utils');

class EventView {
	render(event, rsvpCount = 0) {
		return {
			embeds: [this.buildEventEmbed(event, rsvpCount)],
			components: event.cancelled ? [] : [this.buildRsvpButtons(event.id)],
		};
	}

	renderAttendees(eventName, mentions) {
		return {
			embeds: [this.buildAttendeesEmbed(eventName, mentions)],
			components: [],
			flags: MessageFlags.Ephemeral,
		};
	}

	renderReminder(event) {
		return {
			embeds: [this.buildReminderEmbed(event)],
		};
	}

	buildEventEmbed(event, rsvpCount) {
        const embed = new EmbedBuilder()
            .setColor(event.cancelled ? 0x808080 : 0x4F46E5)
			.setTitle(event.cancelled ? `${event.name} - CANCELLED` : event.name)
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
				{
					name: '👥 RSVP Count',
					value: `${rsvpCount} attending`,
				},
			);

        if (event.description) {
            embed.addFields(
                {
                    name: '💬 Description',
                    value: event.description,
                }
            );
        }

        return embed;
	}

	buildAttendeesEmbed(eventName, mentions) {
		return new EmbedBuilder()
			.setTitle(`Attendees - ${eventName}`)
			.setDescription(mentions || 'No one has RSVP\'d yet.');
	}

	buildReminderEmbed(event) {
		return new EmbedBuilder()
			.setTitle(`🔔 ${event.name}`)
			.addFields(
				{
					name: '📍 Location',
					value: event.location,
				},
				{
					name: '📆 When',
					value: [
						discordTimestamp(event.startTime),
						discordTimestamp(event.startTime, 'R'),
					].join('\n'),
				},
			);
	}

	buildRsvpButtons(eventId) {
		return new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`event_rsvp:${eventId}`)
					.setEmoji('✅')
					.setLabel('RSVP')
					.setStyle(ButtonStyle.Success),

				new ButtonBuilder()
					.setCustomId(`event_unrsvp:${eventId}`)
					.setEmoji('❌')
					.setLabel('Un-RSVP')
					.setStyle(ButtonStyle.Secondary),

				new ButtonBuilder()
					.setCustomId(`event_attendees:${eventId}`)
					.setEmoji('👥')
					.setLabel('Attendees')
					.setStyle(ButtonStyle.Secondary),
			);
	}
}

module.exports = new EventView();
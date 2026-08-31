const { MessageFlags } = require('discord.js');
const BookSearchView = require('../ui/BookSearchView');
const BookDetailView = require('../ui/BookDetailView');
const EventView = require('../ui/EventView');
const EventEditView = require('../ui/EventEditView');
const FamiliarMessages = require('../utils/FamiliarMessages');
const HelpView = require('../ui/HelpView');
const { openLibraryClient } = require('../api');
const { sessionManager } = require('../cache');
const { parseDate, parseTime } = require('../utils/utils');
const { DateTime } = require('luxon');

async function handleComponent(interaction) {
	try {
		if (interaction.customId.startsWith('setup_')) {
			return handleSetupComponent(interaction);
		}

		if (interaction.customId.startsWith('config_')) {
			return handleConfigComponent(interaction);
		}

		if (interaction.customId.startsWith('help_')) {
			return handleHelpComponent(interaction);
		}

		if (interaction.customId.startsWith('event_')) {
			return handleEventComponent(interaction);
		}

		if (interaction.customId.startsWith('eventEdit_')) {
			return handleEventEditComponent(interaction);
		}

		return handleBookSearchComponent(interaction);
	}
	catch (error) {
		console.error('Component handler error:', error);

		if (!interaction.replied) {
			return interaction.reply({
				content: FamiliarMessages.apiUnavailable(),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

async function handleBookSearchComponent(interaction) {
	const messageId = interaction.message.id;
	const session = await sessionManager.get(messageId);

	if (!session) {
		return interaction.reply({
			content: FamiliarMessages.sessionExpiration(),
			flags: MessageFlags.Ephemeral,
		});
	}

	// Only allow the person who started the search
	if (interaction.user.id !== session.userId) {
		return interaction.reply({
			content: FamiliarMessages.sessionPermissions(),
			flags: MessageFlags.Ephemeral,
		});
	}

	switch (interaction.customId) {
	case 'books_next':
		session.nextPage();

		await sessionManager.set(messageId, session);

		return interaction.update(
			BookSearchView.render(session),
		);

	case 'books_prev':
		session.previousPage();

		await sessionManager.set(messageId, session);

		return interaction.update(
			BookSearchView.render(session),
		);

	case 'books_select': {
		const index = Number(
			interaction.values[0],
		);

		const book = session.select(index);

		if (!book) {
			return interaction.reply({
				content: FamiliarMessages.noResults(),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Fetch full details
		const details = await openLibraryClient.getBookDetails(book.worksKey);

		await sessionManager.set(messageId, session);

		return interaction.update(
			await BookDetailView.render(details),
		);
	}

	case 'books_back':
		session.selectedBook = null;

		await sessionManager.set(messageId, session);

		return interaction.update(
			BookSearchView.render(session),
		);

	default:
		console.warn(`Unknown component: ${interaction.customId}`);
		return;
	}
}

async function handleSetupComponent(interaction) {
	const setupService = interaction.client.setupService;

	if (!setupService) {
		throw new Error('SetupService has not been initialized.');
	}

	switch (interaction.customId) {
	case 'setup_announcement_channel': {
		const channelId = interaction.values[0];

		await interaction.deferUpdate();

		const response = await setupService.setAnnouncementChannel(
			interaction.guildId,
			channelId,
		);

		return interaction.editReply(response);
	}


	case 'setup_discussion_channel': {
		const channelId = interaction.values[0];

		await interaction.deferUpdate();

		const response = await setupService.setDiscussionChannel(
			interaction.guildId,
			channelId,
		);

		return interaction.editReply(response);
	}


	case 'setup_poll_duration': {
		const duration = interaction.values[0];

		await interaction.deferUpdate();

		const response = await setupService.setPollDuration(
			interaction.guildId,
			duration,
		);

		return interaction.editReply(response);
	}

	case 'setup_confirm': {
		await interaction.deferUpdate();

		await setupService.confirm(interaction.guildId);

		return interaction.editReply({
			content: '✅ **Book Club setup complete!**\n\n' +
				'Your server is now configured and ready to use the bot.',
			components: [],
		});
	}

	case 'setup_cancel': {
		setupService.cancel(interaction.guildId);

		return interaction.update({
			content: '❌ **Setup cancelled.**',
			components: [],
		});
	}

	case 'setup_back_announcement': {
		const response = setupService.back(
			interaction.guildId,
			'announcement',
		);

		return interaction.update(response);
	}

	case 'setup_back_discussion': {
		const response = setupService.back(
			interaction.guildId,
			'discussion',
		);

		return interaction.update(response);
	}

	case 'setup_back_duration': {
		const response = setupService.back(
			interaction.guildId,
			'duration',
		);

		return interaction.update(response);
	}

	default:
		console.warn(`Unknown setup component: ${interaction.customId}`);
		return;
	}
}

async function handleConfigComponent(interaction) {
	const configureService = interaction.client.configureService;

	if (!configureService) {
		throw new Error('ConfigureService has not been initialized.');
	}

	let config = configureService.getConfig(interaction.guildId);

	switch (interaction.customId) {
	case 'config_setting_selection': {
		switch (interaction.values[0]) {
		case 'announcement': {
			const response = configureService.buildAnnouncementChannelConfigSummary(config.announcementChannelId);

			return interaction.update(response);
		}

		case 'discussion': {
			const response = configureService.buildDiscussionChannelConfigSummary(config.discussionChannelId);

			return interaction.update(response);
		}

		case 'pollduration': {
			const response = configureService.buildPollDurationConfigSummary(config.pollDuration);

			return interaction.update(response);
		}

		default:
			console.warn(`Unknown configure component: ${interaction.customId}`);
			return;
		}
	}

	case 'config_back': {
		const response = configureService.buildCurrentConfigMenu(config);

		return interaction.update(response);
	}

	case 'config_close': {
		return interaction.update({
			content: '**Config closed.**',
			components: [],
		});
	}

	case 'config_clear_announcement': {
		await interaction.deferUpdate();

		await configureService.clearSetting(interaction.guildId, 'announcementChannelId');

		config = configureService.getConfig(interaction.guildId);

		const response = configureService.buildCurrentConfigMenu(config);

		return interaction.update(response);
	}

	case 'config_clear_discussion': {
		await interaction.deferUpdate();

		await configureService.clearSetting(interaction.guildId, 'discussionChannelId');

		config = configureService.getConfig(interaction.guildId);

		const response = configureService.buildCurrentConfigMenu(config);

		return interaction.update(response);
	}

	case 'config_announcement_channel': {
		const channelId = interaction.values[0];

		await interaction.deferUpdate();

		await configureService.setAnnouncementChannel(interaction.guildId, channelId);

		config = configureService.getConfig(interaction.guildId);

		const response = configureService.buildAnnouncementChannelConfigSummary(config.announcementChannelId);

		return interaction.editReply(response);
	}

	case 'config_discussion_channel': {
		const channelId = interaction.values[0];

		await interaction.deferUpdate();

		await configureService.setDiscussionChannel(interaction.guildId, channelId);

		config = configureService.getConfig(interaction.guildId);

		const response = configureService.buildDiscussionChannelConfigSummary(config.discussionChannelId);

		return interaction.editReply(response);
	}

	case 'config_poll_duration': {
		const duration = interaction.values[0];

		await interaction.deferUpdate();

		await configureService.setPollDuration(interaction.guildId, duration);

		config = configureService.getConfig(interaction.guildId);

		const response = configureService.buildPollDurationConfigSummary(config.discussionChannelId);

		return interaction.editReply(response);
	}

	default:
		console.warn(`Unknown config component: ${interaction.customId}`);
		return;
	}
}

async function handleHelpComponent(interaction) {
	const [action, index] = interaction.customId.split(':');
	const currentIndex = Number(index);

	const commands = [...interaction.client.commands.values()].filter(command => !command.hidden);
	let newIndex = currentIndex;

	switch (action) {
	case 'help_prev':
		newIndex--;
		break;
	case 'help_next':
		newIndex++;
		break;
	case 'help_close': {
		await interaction.update({
			content: 'Help menu closed.',
			embeds: [],
			components: [],
		});
		return;
	}
	default:
		console.warn(`Unknown config component: ${interaction.customId}`);
		return;
	}

	const command = commands[newIndex];

	const view = HelpView.render(command.data, newIndex, commands.length);

	await interaction.update(view);
}

async function handleEventComponent(interaction) {
	const [action, eventId] = interaction.customId.split(':');

	const eventService = interaction.client.eventService;

	if (!eventService) {
		throw new Error('EventService has not been initialized.');
	}

	switch (action) {
	case 'event_rsvp': {
		await interaction.deferUpdate();
		const event = eventService.rsvp(eventId, interaction.user.id);
		await refreshEventMessage(interaction.client, event);
		return;
	}

	case 'event_unrsvp': {
		await interaction.deferUpdate();
		const event = eventService.unRsvp(eventId, interaction.user.id);
		await refreshEventMessage(interaction.client, event);
		return;
	}

	case 'event_attendees': {
		const event = eventService.getEvent(eventId);
		const mentions = event.rsvps.map((attendee) => {
			return `<@${attendee.userId}>`;
		}).join('\n');
		return interaction.reply(EventView.renderAttendees(event.name, mentions));
	}

	default: {
		console.warn(`Unknown config component: ${interaction.customId}`);
		return;
	}
	}
}

async function handleEventEditComponent(interaction) {
	const [action, field, eventId] = interaction.customId.split(':');
	const eventService = interaction.client.eventService;

	if (!eventService) {
		throw new Error('EventService has not been initialized.');
	}

	switch (action) {
	case 'eventEdit_': {
		const event = eventService.getEvent(eventId);

		if (!event) {
			return interaction.reply({
				content: 'That event could not be found.',
				flags: MessageFlags.Ephemeral,
			});
		}

		return interaction.showModal(
			EventEditView.buildEditModal(field, event),
		);
	}
	case 'eventEdit_modal': {
		return handleEventEditModalComponent(interaction);
	}
	case 'eventEdit_done':
		return interaction.update({
			content: 'Event editing closed.',
			embeds: [],
			components: [],
		});
	default:
		console.warn(`Unknown config component: ${interaction.customId}`);
		return;
	}
}

async function handleEventEditModalComponent(interaction) {
	const [, field, eventId] = interaction.customId.split(':');

	const eventService = interaction.client.eventService;

	if (!eventService) {
		throw new Error('EventService has not been initialized.');
	}

	const value = interaction.fields.getTextInputValue('value');
	const event = eventService.getEvent(eventId);

	try {
		let data;

		switch (field) {
		case 'name':
			data = {
				name: value.trim(),
			};
			break;

		case 'location':
			data = {
				location: value.trim(),
			};
			break;

		case 'date':
			data = parseStartDateChange(value, event, 3);
			break;

		case 'time':
			data = parseStartTimeChange(value, event, 3);
			break;

		case 'description':
			data = {
				description: value.trim(),
			};
			break;

		default:
			throw new Error(`Unknown edit field: ${field}`);
		}

		const updatedEvent = await eventService.editEvent(eventId, data);

		await refreshEventMessage(interaction.client, updatedEvent);

		return interaction.reply({
			content: 'Event updated successfully.',
			flags: MessageFlags.Ephemeral,
		});
	}
	catch (error) {
		console.error('Error editing event:', error);

		return interaction.editReply({
			content: FamiliarMessages.apiUnavailable(),
			flags: MessageFlags.Ephemeral,
		});
	}
}

function parseStartDateChange(value, event, offset) {
	const newDate = parseDate(value);
	const time = DateTime.fromSeconds(event.startTime, {
		zone: 'America/Chicago',
	});

	const startTime = DateTime.fromObject({
		year: newDate.year,
		month: newDate.month,
		day: newDate.day,
		hour: time.hour,
		minute: time.minute,
	}, {
		zone: 'America/Chicago',
		locale: 'en-US',
	});

	const reminderTime = startTime.minus({
		hours: offset,
	});

	return {
		startTime: startTime.toMillis(),
		reminderAt: reminderTime.toMillis(),
	};
}

function parseStartTimeChange(value, event, offset) {
	const date = DateTime.fromSeconds(event.startTime, {
		zone: 'America/Chicago',
	});
	const newTime = parseTime(value);

	const startTime = DateTime.fromObject({
		year: date.year,
		month: date.month,
		day: date.day,
		hour: newTime.hour,
		minute: newTime.minute,
	}, {
		zone: 'America/Chicago',
		locale: 'en-US',
	});

	const reminderTime = startTime.minus({ hours: offset });

	return {
		startTime: startTime.toMillis(),
		reminderAt: reminderTime.toMillis(),
	};
}

async function refreshEventMessage(client, event) {
	const channel = await client.channels.fetch(event.channelId);
	const message = await channel.messages.fetch(event.messageId);
	return message.edit(
		EventView.render(event, event.rsvps.length),
	);
}

module.exports = {
	handleComponent,
};
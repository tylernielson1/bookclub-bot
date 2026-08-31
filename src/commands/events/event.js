const {
	MessageFlags,
	SlashCommandBuilder,
} = require('discord.js');
const EventView = require('../../ui/EventView');
const EventEditView = require('../../ui/EventEditView');
const FamiliarMessages = require('../../utils/FamiliarMessages');
const { parseDate, parseTime } = require('../../utils/utils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Create and manage events.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create a new event.')
				.addStringOption((option) =>
					option
						.setName('name')
						.setDescription('Name of the event.')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('location')
						.setDescription('Where the event will take place.')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('date')
						.setDescription('Date of the event.')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('time')
						.setDescription('Time of the event.')
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName('description')
						.setDescription('Optional description/details for the event.'),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('edit')
				.setDescription('Edit an existing event.')
				.addStringOption((option) =>
					option
						.setName('event')
						.setDescription('The event to edit.')
						.setRequired(true)
						.setAutocomplete(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('cancel')
				.setDescription('Cancel an existing event.')
				.addStringOption((option) =>
					option
						.setName('event')
						.setDescription('The event to cancel.')
						.setRequired(true)
						.setAutocomplete(true),
				),
		),
	requiresRegistration: true,
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();

		switch (subcommand) {
		case 'create': {
			const name = interaction.options.getString('name');
			const location = interaction.options.getString('location');
			const date = parseDate(interaction.options.getString('date'));
			const time = parseTime(interaction.options.getString('time'));
			const channel = interaction.channel;
			const creatorId = interaction.user.id;
			const description = interaction.options.getString('description');

			await interaction.deferReply();

			try {
				await interaction.client.eventService.createEvent({
					name: name,
					location: location,
					date: date,
					time: time,
					userId: creatorId,
					description: description,
				}, channel);

				return interaction.deleteReply();
			}
			catch (error) {
				console.error('Error creating event:', error);

				return interaction.editReply({
					content: FamiliarMessages.apiUnavailable(),
				});
			}
		}
		case 'edit': {
			const eventId = interaction.options.getString('event', true);
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			try {
				const event = interaction.client.eventService.getEvent(eventId);

				return interaction.editReply(
					EventEditView.render(event),
				);
			}
			catch (error) {
				console.error('Error loading event for editing:', error);

				return interaction.editReply({
					content: FamiliarMessages.apiUnavailable(),
				});
			}
		}
		case 'cancel': {
			const eventId = interaction.options.getString('event', true);
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			try {
				const event = interaction.client.eventService.cancelEvent(eventId);

				const channel = await interaction.client.channels.fetch(event.channelId);
				const message = await channel.messages.fetch(event.messageId);

				message.edit(
					EventView.render(event),
				);

				return interaction.editReply({
					content: `Successfully cancelled event ${event.name}`,
					flags: MessageFlags.Ephemeral,
				});
			}
			catch (error) {
				console.error('Error cancelling event:', error);

				return interaction.editReply({
					content: FamiliarMessages.apiUnavailable(),
				});
			}
		}
		}
	},

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name !== 'event') return interaction.respond([]);

		const events = interaction.client.eventService.getEvents(interaction.user.id, interaction.memberPermissions.has('Administrator'));

		await interaction.respond(
			events.map((event) => ({
				name: event.name,
				value: event.id.toString(),
			})),
		);
	},
};
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { handleComponent } = require('./src/interactions/componentHandler');
const fs = require('node:fs');
const path = require('node:path');
const BookPollService = require('./src/services/BookPollService');
const SetupService = require('./src/services/SetupService');
const { connectCache } = require('./src/cache');
const { pollManager, guildConfigManager } = require('./src/db');

require('dotenv').config();

// Create new client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessagePolls,
	],
});

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	const setupService = new SetupService(guildConfigManager);

	client.setupService = setupService;

	const bookPollService = new BookPollService(client, pollManager, {
		pollDuration: 168,
		announcementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID,
		discussionChannelId: process.env.DISCUSSION_CHANNEL_ID,
	});

	client.bookPollService = bookPollService;

	bookPollService.start();
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'src/commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			if (!interaction.guildId) {
				await interaction.reply({
					content: 'I am not available for use in DMs just yet.',
				});
				return;
			}

			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			if (command.requiresRegistration && !guildConfigManager.isRegistered(interaction.guildId)) {
				await interaction.reply({
					content: 'This server is not registered with the bot.',
					flags: MessageFlags.Ephemeral,
				});

				return;
			}

			await command.execute(interaction);

			return;
		}

		if (interaction.isMessageComponent()) {
			await handleComponent(interaction);

			return;
		}
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
		else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

client.on(Events.GuildCreate, async (guild) => {
	console.log(`I have joined a new guild with id: ${guild.id}`);
});

client.on(Events.GuildDelete, async (guild) => {
	console.log(`I have left the guild with id ${guild.id}`);

	try {
		guildConfigManager.unregisterGuild(guild.id);
	}
	catch (error) {
		console.error(`Failed to unregister guild ${guild.id}:`, error);
	}
});

async function start() {
	await connectCache();

	await client.login(process.env.DISCORD_TOKEN);
}

start().catch((error) => {
	console.error('Failed to start bot:', error);
	process.exit(1);
});
const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { handleComponent } = require('./src/interactions/componentHandler');
const env = require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const SessionManager = require('./src/sessions/SessionManager');
const BookPollService = require('./src/services/BookPollService');

// Create new client
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessagePolls
	] 
});

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

	setInterval(() => {
		SessionManager.cleanup();
	}, 60 * 60 * 1000);

	const bookPollService = new BookPollService(client, {
		pollDuration: 1,
		announcementChannelId: process.env.ANNOUNCEMENT_CHANNEL_ID
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
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			await command.execute(interaction);

			return;
		}

		if (interaction.isButton() || interaction.isStringSelectMenu()) {
			await handleComponent(interaction);

			return;
		}
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

// login to Discord
client.login(process.env.DISCORD_TOKEN)
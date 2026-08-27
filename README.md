# bookclub-bot
This is a Discord bot written in JavaScript to integrate with book club Discord servers. I wrote this for my wife, so it does have a witch-y theme to it.
The bot integrates with the OpenLibrary API to fetch book information using either book title (with an optional author) or an ISBN. The bot also allows for the server users to create a poll with three books to select for the next monthly reading. The bot will do the work of creating the poll, gathering high-level information about the book, and displaying Goodreads and/or Storygraph links (if available). After the poll expires, the bot will announce the winner to the server in a channel that the server administrators have designated the announcement channel, and create a discussion post in another channel. Additionally, the bot has some fun easter egg commands for server users to enjoy.

## Running the bot locally
### Building the bot
The bot uses node, and yarn as the package manager. Once you've dowloaded the most recent versions of node and yarn, run `yarn install` in the base directory of the project to install the necessary dependencies.

### Environment Variable Setup
If you are wanting to run the bot locally for testing, you will need to register the bot with Discord [here](https://Discord.com/developers). This will get you set up with the necessary `APP_ID` and `PUBLIC_KEY` you will need for the bot to run locally. You will also need your bot's token, which is essentially the bot's password (DO NOT SHARE THIS WITH ANYONE). This can be accessed on the developer portal. This [page](https://Discordjs.guide/legacy/preparations/app-setup#your-bots-token) is a pretty good description of the token if you want more details. You will also need the guild id of the server you intend to test on. This can be accessed by right-clicking on the name of the server and finding the 'Copy Server Info' menu. There should be an option to copy the server id there. Store this in your `.env` file under `GUILD_ID`. (A guild is how Discord refers to servers internally.) If you don't see this option, [this](https://docs.discord.com/developers/activities/building-an-activity#step-0-enable-developer-mode) covers how to enable developer mode for your account. There are two other environment variables in the `.env.example`, `APP_NAME` and `OPENLIBRARY_EMAIL`. The OpenLibrary API does not require an API key to access the data but the developers have requested that any users identify themselves in the request headers. If these headers are supplied, the call allowance goes from 1/second to 3/second.

### Persistence Setup
The bot is set up to persist information about servers in a sqlite database stored locally. The bot should handle the database setup on boot, so this shouldn't be of concern to you. The bot also has caching setup to allow for caching calls to OpenLibrary. This should hopefully prevent the bot from being throttled by OpenLibrary. In order to enable caching, you'll need to run a Redis Docker container. You will also need to supply a Redis url in the `.env` file, usually something like: `redis://localhost:6379`.

### Running the bot
Once you've added these values to a `.env` file and read the above section, you should just about be ready to add your bot to the server and run it locally. [This](https://discordjs.guide/legacy/preparations/adding-your-app) covers how to add an app to a server. Once you've added your version of the bot to the server of your choice, you will need to execute the `yarn deploy` command. This analyzes all of the commands located in the `src/commands` directory and pushes them to your bot. Without this, your bot has no concept of what functionality it has. After this command has ran successfully, you can run `yarn discord` to start up your bot. Congratulations! The bot should be running locally and can execute commands for you. The first command you will need to run is the `/register` command. If the server is not registered with the bot, very few commands will work. If you are testing the polling functionality, you will also need to run `/setup` to configure the polling information.

## Planned functionality
- [X] Event creation, rsvp, and editing
- [ ] Dockerization of app
- [ ] Trigger warning search, using doesthedogdie.com
- [ ] Refactoring to a consistent architecture

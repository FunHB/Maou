import { Client, Message } from 'discord.js'
import { BotInterface, ConfigInterface } from './api'
import { CommandHandler } from './command-handler'

export default class Bot implements BotInterface {
    public start(client: Client, config: ConfigInterface): void {
        const commandHandler = new CommandHandler(config.prefix)

        if (!config.token) { throw new Error('invalid discord token') }

        client.on('ready', () => {
            console.info(`Logged in as ${client.user.tag}!`);
            client.user.setActivity(`!pomoc`)
        });

        client.on('message', (message: Message) => {
            commandHandler.handleMessage(message);
        });

        client.login(config.token)
    }
}


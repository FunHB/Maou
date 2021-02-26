import { Client, Message } from 'discord.js'
import { BotInterface } from './api'
import { CommandHandler } from './command-handler'
import { Config } from './config'
import { MutedManager } from './modules/mutedManager'

export default class Bot implements BotInterface {
    public start(client: Client): void {
        const commandHandler = new CommandHandler(Config.prefix)

        if (!Config.token) { throw new Error('invalid discord token') }

        client.on('ready', () => {
            console.info(`Logged in as ${client.user.tag}!`)
            client.user.setActivity(`${Config.prefix}pomoc`)
        })

        client.on('message', async (message: Message) => {
            await commandHandler.handleMessage(message)

            if (!MutedManager.isRunning) {
                await MutedManager.checkMuted(message)
                return
            }
        })

        client.login(Config.token)
    }
}


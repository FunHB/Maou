import "reflect-metadata";
import { Client } from 'discord.js'
import { Config } from './config'
import { CommandHandler } from './command-handler'
import { MessageDelete } from './services/messageDelete'
import { DatabaseManager } from './database/databaseManager'
import { ExpManager } from './services/expManager'
import { Supervisor } from './services/supervisor/supervisor'
import { PenaltiesManager } from './services/penaltiesManager'
import { AutoPublic } from './services/autoPublic'

export default class Bot {
    public static async start(client: Client): Promise<void> {
        const commandHandler = new CommandHandler()
        const supervisor = new Supervisor()
        const expManager = new ExpManager()
        new PenaltiesManager(client)
        const config = new Config()

        if (!config.token) { throw new Error('invalid discord token') }

        await DatabaseManager.connect()

        client.on('ready', () => {
            console.info(`[Info] Logged in as ${client.user.tag}!`)
            client.user.setActivity(`${config.prefix}pomoc`)
        })

        client.on('guildMemberAdd', async member => {
            const config = new Config()
            await member.guild.systemChannel.send(config.messages.welcome.replace(/({user})/g, `<@${member.id}>`))
        });

        client.on('guildMemberRemove', async member => {
            const config = new Config()
            await member.guild.systemChannel.send(config.messages.farewell.replace(/({user})/g, member.nickname || member.user.username))
        });

        client.on('message', async (message) => {
            await commandHandler.handleMessage(message)
            await supervisor.handleMessage(message)
            await expManager.handleMessage(message)
            await AutoPublic.public(message)
        })

        client.on('messageDelete', async (message) => {
            await MessageDelete.handleMessage(message)
        })

        client.login(config.token)
    }
}
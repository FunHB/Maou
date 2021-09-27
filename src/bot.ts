import "reflect-metadata";
import { Client } from 'discord.js'
import { Config } from './config'
import { MessageDelete } from './services/messageDelete'
import { DatabaseManager } from './database/databaseManager'
import { ExpManager } from './services/expManager'
import { Supervisor } from './services/supervisor/supervisor'
import { PenaltiesManager } from './services/penaltiesManager'
import { AutoPublic } from './services/autoPublic'
import { CommandHandler } from "./commandHandler";
import { MessageEntity, MessageType } from "./database/entity/Message";

export default class Bot {
    private readonly client: Client
    private readonly commandHandler: CommandHandler
    private readonly supervisor: Supervisor
    private readonly expManager: ExpManager

    constructor(client: Client) {
        this.client = client
        this.commandHandler = new CommandHandler()
        this.supervisor = new Supervisor()
        this.expManager = new ExpManager()
        new PenaltiesManager(client)
    }

    public async start(): Promise<void> {
        const config = new Config()

        if (!config.token) { throw new Error('invalid discord token') }

        await DatabaseManager.connect()

        this.client.on('ready', () => {
            console.info(`[Info] Logged in as ${this.client.user.tag}!`)
            this.client.user.setActivity(`${config.prefix}pomoc`)
        })

        this.client.on('guildMemberAdd', async member => {
            const welcomeMessage = await DatabaseManager.getEntity(MessageEntity, { guild: member.guild.id, type: MessageType.welcome })
            if (!welcomeMessage || welcomeMessage.value === 'off') return
            await member.guild.systemChannel.send(welcomeMessage.value.replace(/({user})/g, `<@${member.id}>`))
        })

        this.client.on('guildMemberRemove', async member => {
            const farewellMessage = await DatabaseManager.getEntity(MessageEntity, { guild: member.guild.id, type: MessageType.farewell })
            if (!farewellMessage || farewellMessage.value === 'off') return
            await member.guild.systemChannel.send(farewellMessage.value.replace(/({user})/g, member.nickname || member.user.username))
        })

        this.client.on('messageCreate', async message => {
            await this.commandHandler.handleMessage(message)
            await this.supervisor.handleMessage(message)
            await this.expManager.handleMessage(message)
            await AutoPublic.public(message)
        })

        this.client.on('messageDelete', async message => {
            await MessageDelete.handleMessage(message)
        })

        this.client.login(config.token)
    }
}
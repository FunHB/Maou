import "reflect-metadata"
import { Client } from 'discord.js'
import { Config } from './config'
import { MessageDelete } from './services/messageDelete'
import { DatabaseManager } from './database/databaseManager'
import { ExpManager } from './services/expManager'
import { Supervisor } from './services/supervisor/supervisor'
import { PenaltiesManager } from './services/penaltiesManager'
import { AutoPublic } from './services/autoPublic'
import { CommandHandler } from "./services/commandHandler"
import { MessageEntity, MessageType } from "./database/entity/Message"
import { UserManager } from "./services/userManager"
import { Logger } from "./services/logger"

export default class Bot {
    private readonly client: Client
    private readonly logger: Logger
    private readonly commandHandler: CommandHandler
    private readonly supervisor: Supervisor
    private readonly expManager: ExpManager
    private readonly userManager: UserManager
    private readonly messageDelete: MessageDelete
    private readonly autoPublic: AutoPublic

    constructor(client: Client) {
        this.client = client
        this.logger = new Logger()
        this.commandHandler = new CommandHandler(this.logger)
        this.supervisor = new Supervisor(this.commandHandler, this.logger)
        this.expManager = new ExpManager()
        this.userManager = new UserManager(this.logger)
        this.messageDelete = new MessageDelete(this.logger)
        this.autoPublic = new AutoPublic()
        new PenaltiesManager(client, this.logger)
    }

    public async start(): Promise<void> {
        const config = new Config()

        if (!config.token) { throw new Error('invalid Discord token') }

        await DatabaseManager.connect()

        this.client.on('ready', () => {
            this.logger.HandleMessage(`[Info] Logged in as ${this.client.user.tag}!`, false)
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
            await this.userManager.handleMessage(message)
            await this.autoPublic.public(message)
        })

        this.client.on('messageDelete', async message => {
            await this.messageDelete.handleMessage(message)
        })

        this.client.on('error', (error) => {
            this.logger.HandleMessage(`[Client] ${error.name}: ${error.message}`)
        })

        this.client.login(config.token)
    }
}
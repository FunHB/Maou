import { Client, Message } from 'discord.js'
import { BotInterface, ConfigInterface } from './api'
import { CommandHandler } from './command-handler'
import { MutedManager } from './modules/mutedManager'

export default class Bot implements BotInterface {
    public start(client: Client, config: ConfigInterface): void {
        const commandHandler = new CommandHandler(config.prefix)

        if (!config.token) { throw new Error('invalid discord token') }

        client.on('ready', () => {
            console.info(`Logged in as ${client.user.tag}!`)
            client.user.setActivity(`!pomoc`)

            setInterval(() => {
                const path = `../${__dirname}/data/muted.json`
                const mutedManager = new MutedManager(path)
                mutedManager.muted.forEach(user => {
                    if (!mutedManager.isStillMuted(user)) {
                        client.guilds.cache.get(user.guildID).members.cache.get(user.id).roles.remove(config.muteRole)
                        mutedManager.removeMuted(user.id)
                        mutedManager.saveChanges(path)
                    }
                })

            }, 
                60000
            )
        })

        client.on('message', (message: Message) => {
            commandHandler.handleMessage(message)
        })

        client.login(config.token)
    }
}


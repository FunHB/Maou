import { Client, Message } from 'discord.js'
import { BotInterface } from './api'
import { CommandHandler } from './command-handler'
import { Config } from './config'
// import { MutedManager } from './modules/mutedManager'

export default class Bot implements BotInterface {
    public start(client: Client): void {
        const commandHandler = new CommandHandler(Config.prefix)

        if (!Config.token) { throw new Error('invalid discord token') }

        client.on('ready', () => {
            console.info(`Logged in as ${client.user.tag}!`)
            client.user.setActivity(`!pomoc`)

            /* Database is required
            setInterval(() => {
                const mutedManager = new MutedManager()
                if (mutedManager.muted) {
                    mutedManager.muted.forEach(user => {
                        if (!mutedManager.isStillMuted(user)) {
                            client.guilds.cache.get(user.guildID).members.cache.get(user.id).roles.remove(config.muteRole)
                            mutedManager.removeMuted(user.id)
                            mutedManager.saveChanges()
                        }
                    })
                }
            },
                60000
            )
            */
        })

        client.on('message', (message: Message) => {
            commandHandler.handleMessage(message)
        })

        client.login(Config.token)
    }
}


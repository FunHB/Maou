import { Client } from 'discord.js'
import { Config } from './config'
import { CommandHandler } from './command-handler'
import { MutedManager } from './modules/mutedManager'
import { MessageDelete } from './modules/messageDelete'

export default class Bot {
    public static start(client: Client): void {
        const commandHandler = new CommandHandler()

        if (!Config.token) { throw new Error('invalid discord token') }

        client.on('ready', () => {
            console.info(`[Info] Logged in as ${client.user.tag}!`)
            client.user.setActivity(`${Config.prefix}pomoc`)
        })

        client.on('guildMemberAdd', async member => {
            const rulesChannel = '723107524194205818'

            await member.guild.systemChannel.send(`Witaj <@${member.id}> na serwerze grupy Maou Subs. Zanim coś napiszesz zapoznaj się z <#${rulesChannel}>`)
        });

        client.on('guildMemberRemove', async member => {
            await member.guild.systemChannel.send(`${member.nickname || member.user.username} spłonął w czeluściach ciemności`)
        });

        client.on('message', async (message) => {
            await commandHandler.handleMessage(message)

            if (!MutedManager.isRunning) {
                await MutedManager.checkMuted(message)
            }
        })

        client.on('messageDelete', async (message) => {
            await MessageDelete.handle(message)
        })

        client.login(Config.token)
    }
}


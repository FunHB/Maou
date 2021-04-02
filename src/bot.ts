import { Client, Message, MessageEmbed } from 'discord.js'
import { BotInterface, Colors } from './api'
import { Config } from './config'
import { CommandHandler } from './command-handler'
import { MutedManager } from './modules/mutedManager'
import { Utils } from './modules/utils'

export default class Bot implements BotInterface {
    public start(client: Client): void {
        const commandHandler = new CommandHandler(Config.prefix)

        if (!Config.token) { throw new Error('invalid discord token') }

        client.on('ready', () => {
            console.info(`Logged in as ${client.user.tag}!`)
            client.user.setActivity(`${Config.prefix}pomoc`)
        })

        client.on('guildMemberAdd', async member => {
            const rulesChannel = '723107524194205818'

            await member.guild.systemChannel.send(`Witaj <@${member.id}> na serwerze grupy tłumaczeniowej Maou Subs. Zanim coś napiszesz zapoznaj się z <#${rulesChannel}>`)
        });

        client.on('guildMemberRemove', async member => {
            await member.guild.systemChannel.send(`<@${member.id}> spłonął w czeluściach ciemności`)
        });

        client.on('message', async (message: Message) => {
            await commandHandler.handleMessage(message)

            if (!MutedManager.isRunning) {
                await MutedManager.checkMuted(message)
            }
        })

        client.on('messageDelete', async (message) => {
            const { guild, member, channel } = message
            const { user } = member
            const messageDeleteLogChannel = guild.channels.cache.get(Config.messageDeleteLogChannel)

            if (user.bot) return

            console.error("Message Delete: ", user.id, message.content)

            if (messageDeleteLogChannel.isText()) {
                await messageDeleteLogChannel.send((new MessageEmbed({
                    color: Colors.Error,
                    author: {
                        name: `${user.username}`,
                        iconURL: Utils.getAvatar(user)
                    },
                    fields: [
                        { name: 'Skasowana wiadomość', value: message.content },
                        { name: 'ID użytkownika', value: user.id, inline: true },
                        { name: 'Nazwa użytkownika', value: user.username || 'Brak', inline: true },
                        { name: '\u200b', value: '\u200b', inline: true },
                        { name: 'ID kanału', value: channel.id, inline: true },
                        { name: 'Nazwa kanału', value: guild.channels.cache.get(channel.id).name, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true }
                    ]
                })))
            }
        })

        client.login(Config.token)
    }
}


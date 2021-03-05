import { Client, Message, MessageEmbed } from 'discord.js'
import { BotInterface } from './api'
import { CommandHandler } from './command-handler'
import { Config } from './config'
import { MutedManager } from './modules/mutedManager'

import { Utils } from './modules/utils'
import { Colors } from './api'

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

        client.on('messageDelete', async (message) => {
            const { guild, member, channel } = message
            const messageDeleteLogChannel = guild.channels.cache.get(Config.messageDeleteLogChannel)

            const { user } = member

            console.error("Message Delete: ", user.id, message.content)

            if (messageDeleteLogChannel.isText()) {
                messageDeleteLogChannel.send((new MessageEmbed({
                    color: Colors.Error,
                    author: {
                        name: `${user.username}`,
                        iconURL: Utils.getAvatar(user)
                    },
                    title: "Wiadomość skasowana",
                    description: message.content,
                    fields: [
                        { name: 'ID użytkownika', value: user.id, inline: true },
                        { name: 'Nazwa', value: user.username || 'Brak', inline: true },
                        { name: 'Bot', value: user.bot ? 'Tak' : 'Nie', inline: true },
                        { name: 'ID kanału', value: channel.id, inline: true },
                        { name: 'Nazwa kanału', value: guild.channels.cache.get(channel.id).name, inline: true },
                    ]
                })))
            }

        })

        client.login(Config.token)
    }
}


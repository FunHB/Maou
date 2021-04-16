import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'
import { Command } from './command'

export class InfoCommand extends Command {
    public name = 'info'
    public description = 'Wyświetla informacje o bocie'
    public aliases: string[] = ['informacje']
    public channelType: channelType = channelType.botCommands

    public async execute(message: Message): Promise<void> {
        const { client } = message
        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${client.user.tag}`,
                iconURL: Utils.getAvatar(client.user)
            },
            description: 'Bot stworzony dla grupy Maou Subs!',
            thumbnail: {
                url: Utils.getAvatar(client.user)
            },
            fields: [
                { name: 'Autor', value: Config.botAuthor, inline: true },
                { name: 'Wersja', value: Config.botVersion, inline: true }
            ],
            footer: { text: `Aktualny czas ${Date().toLocaleString().slice(16, 21)}` }
        }))
    }
}
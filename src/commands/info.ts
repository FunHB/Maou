import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'

export class InfoCommand implements Command {
    public name = 'info'
    public description = 'Wyświetla informacje o bocie'
    public aliases: string[] = ['informacje']
    public args = false
    public channelType: channelType = channelType.botCommands
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message): Promise<void> {
        const { client } = message
        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${client.user.tag}`,
                iconURL: Utils.getAvatar(client.user)
            },
            description: 'Bot stworzony dla grupy tłumaczy Maou Subs!',
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
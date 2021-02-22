import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';
import { Config } from '../config';
const config = new Config()

export class InfoCommand implements Command {
    public name = 'info'
    public description = 'Wyświetla informacje o bocie!'
    public aliases: string[] = ['informacje']
    public args = false
    public roles: string[]
    public usage = 'template'
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message): Promise<void> {
        await message.channel.send(new MessageEmbed({
            color: Colors.Info,
            author: {
                name: `${message.client.user.tag}`,
                iconURL: message.client.user.avatarURL({
                    size: 128,
                    format: "jpg"
                })
            },
            description: 'Bot stworzony dla grupy tłumaczy Maou Subs!',
            thumbnail: {
                url: message.client.user.avatarURL({
                    size: 128,
                    format: "jpg"
                })
            },
            fields: [
                { name: 'Autor', value: config.botAuthor, inline: true },
                { name: 'Wersja', value: config.botVersion, inline: true }
            ],
            footer: { text: `Aktualny czas ${Date().toLocaleString().slice(16, 21)}` }
        }))
    }
}
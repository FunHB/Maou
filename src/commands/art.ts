import { Message, MessageEmbed } from 'discord.js';
import { channelType, Command } from '../api';
import arts from '../data/artdatabase.json'

export class ArtCommand implements Command {
    public name = 'art'
    public description = 'Wyświetla losowy obrazke z anime!'
    public aliases: string[] = ['obrazek', 'fanart']
    public args = false
    public channelType: channelType = channelType.artschannel
    public guildonly = true
    public cooldown = 15

    public async execute(message: Message): Promise<void> {
        const index = Math.floor(Math.random() * arts.length)

        await message.channel.send(new MessageEmbed({
            color: 'RANDOM',
            description: `<@!${message.author.id}> o to obrazek dla ciebie <3`,
            image: { url: arts[index] },
            footer: { text: `Index: ${index}`}
        }))
    }
}

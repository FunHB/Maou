import { Message, MessageEmbed } from 'discord.js';
import { channelType, Colors, Command } from '../api';

export class PingCommand implements Command {
    public name = 'ping'
    public description = 'Sprawdza opóźnienie między botem a serwerem!'
    public args = false
    public channelType: channelType = channelType.normal
    public guildonly = true
    public cooldown = 10

    public async execute(message: Message): Promise<void> {
        const pingMessage = await message.channel.send('Ping?')
        await pingMessage.delete()
        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Ping **<@!${message.member.id}>** wynosi - ${pingMessage.createdTimestamp - message.createdTimestamp}ms`
        }))
    }
}
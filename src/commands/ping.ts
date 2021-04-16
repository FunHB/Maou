import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors } from '../api'
import { Command } from './command'

export class PingCommand extends Command {
    public name = 'ping'
    public description = 'Sprawdza opóźnienie między botem a serwerem'
    public channelType: channelType = channelType.botCommands

    public async execute(message: Message): Promise<void> {
        const pingMessage = await message.channel.send('Ping?')
        await pingMessage.delete()
        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Ping **<@!${message.member.id}>** wynosi - \`${pingMessage.createdTimestamp - message.createdTimestamp}ms\``
        }))
    }
}
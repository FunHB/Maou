import { Message, MessageEmbed } from 'discord.js'
import { channelType, Colors, Command } from '../api'

export class RoleCommand implements Command {
    public name = 'template'
    public description = 'template'
    public aliases: string[] = []
    public args: boolean
    public roles: string[] = []
    public usage = 'template'
    public channelType: channelType = channelType.normal
    public guildonly: boolean
    public cooldown: number

    public async execute(message: Message, args: string[]): Promise<void> {
        await message.channel.send(new MessageEmbed({
            color: Colors.Neutral,
            description: args.join(' ')
        }))
    }
}
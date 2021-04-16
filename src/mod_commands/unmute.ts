import { Message, MessageEmbed } from 'discord.js'
import { Colors } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'
import { MutedManager } from '../modules/mutedManager'
import { Command } from '../commands/command'

export class UnmuteCommand extends Command {
    public name = 'unmute'
    public description = 'Zdejmuje role wyciszonego!'
    public requireArgs = true
    public group = 'mod'
    public usage = '<użytkownik>'
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const { guild } = message
        const member = await Utils.getMember(message, args.join(' '))
        const role = guild.roles.cache.get(Config.muteRole)
        const type = this.name

        if (!member) return

        if (!member.roles.cache.has(Config.muteRole)) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Ta osoba nie jest wyciszona!'
            }))
            return
        }

        await member.roles.remove(role)
        await message.channel.send(Utils.getMessageFromType(member, type))

        MutedManager.setMuted(guild.id)
        MutedManager.removeMuted(guild.id, member.id)
    }
}
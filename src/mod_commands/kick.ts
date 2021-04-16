import { Message, MessageEmbed } from 'discord.js'
import { Colors } from '../api'
import { Command } from '../commands/command'
import { Config } from '../config'
import { Utils } from '../modules/utils'

export class KickCommand extends Command {
    public name = 'kick'
    public description = 'Wyrzuca użytkownika z serwera!'
    public aliases: string[] = ['wyrzuc', 'wyrzuć']
    public requireArgs = true
    public group = 'mod'
    public usage = '<użytkownik> [powód]'
    public cooldown = 0

    public async execute(message: Message, args: string[]): Promise<void> {
        const member = await Utils.getMember(message, args.shift())
        const reasonArg = args.join(' ') || 'Brak.'
        const modlogChannel = message.guild.channels.cache.get(Config.modLogsChannel)
        const errorCode = Utils.errorCode(message, member, true)
        const type = this.name

        if (errorCode) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: Utils.getMessageFromErrorCode(errorCode, type)
            }))
            return
        }

        await member.kick(reasonArg)
        await message.channel.send(Utils.getMessageFromType(member, type))

        if (modlogChannel.isText()) {
            await modlogChannel.send(Utils.getEmbedFromType(message, member.user, reasonArg, type))
        }
    }
}
import { Message, MessageEmbed, Permissions } from 'discord.js'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'

export class ChangeNickCommand implements Command {
    public name = 'changenick'
    public description = 'Zmienia pseudonim podanemu użytkownikowi'
    public aliases: string[] = ['zmieńnick', 'zmiennick', 'zmienpseudonim', 'zmieńpseudonim']
    public args = true
    public roles: string[] = [Config.modRole]
    public usage = '<użytkownik> [nowy pseudonim]'
    public channelType: channelType = channelType.normal
    public guildonly = true

    public async execute(message: Message, args: string[]): Promise<void> {
        const member = await Utils.getMember(message, args.shift())
        const oldNickname = member.nickname

        if (!member) return

        if (!message.guild.me.hasPermission(Permissions.FLAGS.CHANGE_NICKNAME) || !member.bannable) {
            await message.channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Bot nie ma uprawnień do zmiany nicków'
            }))
            return
        }
        
        await member.setNickname(args.join(' '))

        await message.channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Pseudonim użytkownika <@${member.id}> został zmieniony z ${oldNickname} na ${member.nickname || 'Brak'}`
        }))
    }
}
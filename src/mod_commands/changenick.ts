import { Message, MessageEmbed, Permissions } from 'discord.js'
import { Colors } from '../api'
import { Command } from '../commands/command'
import { Utils } from '../modules/utils'

export class ChangeNickCommand extends Command {
    public name = 'change nick'
    public description = 'Zmienia pseudonim podanemu użytkownikowi'
    public aliases: string[] = ['zmień nick', 'zmien nick']
    public requireArgs = true
    public group = 'mod'
    public usage = '<użytkownik> [nowy pseudonim]'

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
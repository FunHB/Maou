import { Collection, Guild, GuildMember, Message, MessageEmbed, MessageReaction, Role } from 'discord.js'
import fs from 'fs'
import { channelType, Colors, Command } from '../api'
import { Config } from '../config'
import { Utils } from '../modules/utils'

export class RoleCommand implements Command {
    public name = 'role'
    public description = 'pozwala na przypisanie, bądź usunięcie sobie roli'
    public aliases: string[] = ['rola']
    public args = false
    public roles: string[] = [Config.modRole]
    public channelType: channelType = channelType.botCommands
    public guildonly = true
    public cooldown = 10

    private _emojis: string[] = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇼', '🇾', '🇽', '🇿']
    private _path = './data/addableRoles.json'
    private _roles: Collection<string, Role[]> = new Collection()

    public async execute(message: Message): Promise<void> {
        const { guild } = message
        const filter = (reaction: MessageReaction) => this._emojis.includes(reaction.emoji.name)
        this.setRoles(guild)
        const roles = this._roles.get(guild.id)

        const rolesMessage = await message.channel.send(new MessageEmbed({
            color: Colors.Warning,
            title: 'Możliwe do przyznania sobie role',
            description: this.rolesNames(roles)
        }))

        await this.getEmojisForRoles(rolesMessage, roles.length)

        const collector = rolesMessage.createReactionCollector(filter, { dispose: true })

        collector.on('collect', async (reaction, user) => {
            const member = await Utils.getMember(message, user.id)
            if (!this.hasRole(member, roles, reaction)) {
                member.roles.add(roles[this._emojis.indexOf(reaction.emoji.name)].id)
            }
        })
        
        collector.on('remove', async (reaction, user) => {
            const member = await Utils.getMember(message, user.id)
            if (this.hasRole(member, roles, reaction)) {
                member.roles.remove(roles[this._emojis.indexOf(reaction.emoji.name)].id)
            }
        })
    }

    private rolesNames(roles: Role[]): string {
        const out: string[] = []
        for (let i = 0; i < roles.length; ++i) {
            out.push(`:regional_indicator_${String.fromCharCode(97 + i)}: ${roles[i].name}`)
        }
        return out.join('\n')
    }

    private async getEmojisForRoles(message: Message, quantity: number): Promise<void> {
        for (let i = 0; i < quantity; ++i) {
            await message.react(`${this._emojis[i]}`)
        }
    }

    private hasRole(member: GuildMember, roles: Role[], reaction: MessageReaction): boolean {
        return member.roles.cache.has(roles[this._emojis.indexOf(reaction.emoji.name)].id)
    }

    private setRoles(guild: Guild): void {
        const object = JSON.parse(fs.readFileSync(this._path).toString() || '{}')
        this._roles = new Collection(Object.keys(object).map(key => [key, guild.roles.cache.filter(role => object[key].includes(role.id)).array()]))
        if (!this._roles.get(guild.id)) this._roles.set(guild.id, [])
    }
}
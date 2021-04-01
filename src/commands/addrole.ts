import { Collection, Guild, Message, MessageEmbed, Role } from 'discord.js'
import fs from 'fs'
import { channelType, Colors, Command } from '../api'

export class AddroleCommand implements Command {
    public name = 'addrole'
    public description = 'Dodaje użytkownikowi jedną z ról'
    public aliases: string[] = ['dodajrole']
    public args = true
    public channelType: channelType = channelType.botCommands
    public guildonly = true
    public cooldown = 10

    private _path = './data/addableRoles.json'
    private _roles: Collection<string, Role[]> = new Collection()

    public async execute(message: Message, args: string[]): Promise<void> {
        const { guild, channel, member } = message
        const identificator = args.join(' ')
        this.setRoles(guild)
        const roles = this._roles.get(guild.id)
        const role = roles.find(role => role.id == identificator || role.name == identificator)

        if (!role) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: 'Nie znaleziono podanej roli!'
            }))
            return
        }

        if (member.roles.cache.has(role.id)) {
            await channel.send(new MessageEmbed({
                color: Colors.Error,
                description: `Użytkownik <@${member.id}> posiada już rolę <@&${role.id}>!`
            }))
            return
        }

        await member.roles.add(role.id)

        await channel.send(new MessageEmbed({
            color: Colors.Success,
            description: `Użytkownik <@${member.id}> nadał sobie rolę <@&${role.id}>`
        }))
    }

    private setRoles(guild: Guild): void {
        const object = JSON.parse(fs.readFileSync(this._path).toString() || '{}')
        this._roles = new Collection(Object.keys(object).map(key => [key, guild.roles.cache.filter(role => object[key].includes(role.id)).array()]))
        if (!this._roles.get(guild.id)) this._roles.set(guild.id, [])
    }
}
import { Collection, Guild, Message, MessageEmbed, Role } from 'discord.js'
import fs from 'fs'
import { channelType, Colors } from '../api'
import { Command } from './command'

export class ShowrolesCommand extends Command {
    public name = 'show roles'
    public description = 'Wypisuje możliwe do nadania sobie role'
    public aliases: string[] = ['wypisz role']
    public channelType: channelType = channelType.botCommands

    private _path = './data/addableRoles.json'
    private _roles: Collection<string, Role[]> = new Collection()

    public async execute(message: Message): Promise<void> {
        const { guild, channel } = message
        this.setRoles(guild)
        const roles = this._roles.get(guild.id)

        await channel.send(new MessageEmbed({
            color: Colors.Info,
            description: roles.map(role => role).join('\n')
        }))
    }

    private setRoles(guild: Guild): void {
        const object = JSON.parse(fs.readFileSync(this._path).toString() || '{}')
        this._roles = new Collection(Object.keys(object).map(key => [key, guild.roles.cache.filter(role => object[key].includes(role.id)).array()]))
        if (!this._roles.get(guild.id)) this._roles.set(guild.id, [])
    }
}
import { Collection, Guild, Role } from "discord.js"
import fs from 'fs'

export class AddableRoles {
    private static _path = './data/addableRoles.json'

    public static get roles(): Collection<string, Role[]> { return this._roles }
    private static _roles: Collection<string, Role[]> = new Collection()

    public static setRoles(guild: Guild): void {
        const object = JSON.parse(fs.readFileSync(this._path).toString() || '{}')
        this._roles = new Collection(Object.keys(object).map(key => [key, guild.roles.cache.filter(role => object[key].includes(role.id)).array()]))
        if (!this._roles.get(guild.id)) this._roles.set(guild.id, [])
    }
}
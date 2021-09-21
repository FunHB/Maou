import { Guild, Role } from "discord.js"
import { DatabaseManager } from "../database/databaseManager"
import { RoleEntity, RoleType } from "../database/entity/Role"

export class AddableRoles {
    public static async getRoles(guild: Guild): Promise<Role[]> {
        const rolesid: string[] = (await DatabaseManager.getEntities(RoleEntity, { guild: guild.id, type: RoleType.addable })).map(role => role.id)

        const roles: Role[] = guild.roles.cache.filter(role => rolesid.includes(role.id)).map(r => r)

        return roles
    }
}
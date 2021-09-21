import { Client, GuildMember } from "discord.js";
import { DatabaseManager } from "../database/databaseManager";
import { PenaltyEntity, PenaltyType } from "../database/entity/Penalty";
import { RoleEntity, RoleType } from "../database/entity/Role";
import { Utils } from "../extensions/utils";

export class PenaltiesManager {
    private client: Client

    constructor(client: Client) {
        this.client = client

        setInterval(async () => {
            try {
                await this.autoValidate()
            } catch (exception) {
                console.error(`[Penalties Manager] ${exception}`)
            }
        },
            30000
        )
    }

    private async autoValidate(): Promise<void> {
        console.info(`[Penalties Manager] Auto validate at ${Utils.dateToString(new Date())}`)
        const penalties: PenaltyEntity[] = await PenaltiesManager.getPenaltiesByTypeOrGuild(PenaltyType.mute)

        penalties.forEach(async penalty => {
            const muteRole = await DatabaseManager.getEntity(RoleEntity, { guild: penalty.guild, type: RoleType.mute })
            if (!muteRole) return

            try {
                const guild = await this.client.guilds.fetch(penalty.guild)
                if (!guild) return

                const member = await guild.members.fetch(penalty.user)
                if (member) {
                    if ((Date.now() - penalty.startDate.getTime()) / 1000 / 60 / 60 < penalty.duration) {
                        if (!member.roles.cache.has(muteRole.id)) {
                            await member.roles.add(muteRole.id)
                        }
                        return
                    }
                    await DatabaseManager.remove(penalty)
                    if (member.roles.cache.has(muteRole.id)) {
                        await member.roles.remove(muteRole.id)
                    }
                    return
                }

                if ((Date.now() - penalty.startDate.getTime()) / 1000 / 60 / 60 > penalty.duration) {
                    await DatabaseManager.remove(penalty)
                }
            } catch (exception) {
                console.error(`[Penalties Manager] ${exception}`)
            }
        })
    }

    public static async addPenalty(member: GuildMember, penalty: PenaltyEntity) {
        const muteRole = await DatabaseManager.getEntity(RoleEntity, { guild: penalty.guild, type: RoleType.mute })

        if (muteRole) {
            await member.roles.add(muteRole.id)
        }
        await DatabaseManager.save(penalty)
    }

    public static async removePenalty(user: string, type: PenaltyType): Promise<void> {
        await DatabaseManager.remove(await DatabaseManager.getEntity(PenaltyEntity, { user: user, type: type }))
    }

    public static async getPenaltiesByTypeOrGuild(type: PenaltyType = null, guild: string = null): Promise<PenaltyEntity[]> {
        const filter: any = {}
        if (type) filter.type = type
        if (guild) filter.guild = guild
        return DatabaseManager.getEntities(PenaltyEntity, filter)
    }
}
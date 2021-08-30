import { Client } from "discord.js";
import { IConfig } from "../api/IConfig";
import { Config } from "../config";
import { DatabaseManager } from "../database/databaseManager";
import { PenaltyEntity, PenaltyType } from "../database/entity/Penalty";
import { Utils } from "../extensions/utils";

export class PenaltiesManager {
    private config: IConfig
    private client: Client

    constructor(client: Client) {
        this.config = new Config()
        this.client = client

        if (!this.config.roles.mute) {
            console.error('[Penalties Manager] mute role not set!')
            return
        }

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
            try {
                const guild = await this.client.guilds.fetch(penalty.guild)
                if (!guild) return

                const member = await guild.members.fetch(penalty.user)
                if (member) {
                    if ((Date.now() - penalty.startDate.getTime()) / 1000 / 60 / 60 < penalty.duration) {
                        if (!member.roles.cache.has(this.config.roles.mute)) {
                            await member.roles.add(this.config.roles.mute)
                        }
                        return
                    }
                    await DatabaseManager.remove(penalty)
                    if (member.roles.cache.has(this.config.roles.mute)) {
                        await member.roles.remove(this.config.roles.mute)
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
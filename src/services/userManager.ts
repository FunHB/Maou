import { Message } from "discord.js"
import { MoreThan } from "typeorm"
import { IUser } from "../api/interfaces/IUser"
import { TopType } from "../api/types/topType"
import { Config } from "../config"
import { DatabaseManager } from "../database/databaseManager"
import { ChannelEntity, ChannelType } from "../database/entity/Channel"
import { UserEntity } from "../database/entity/User"
import { Logger } from "./logger"

export class UserManager {
    private static defaultUser(id: string): IUser {
        return {
            id: id,
            exp: 9,
            level: 1,
            totalMessages: 0,
            messagesInMonth: 0,
            totalCommands: 0
        }
    }

    private measureDate: Date

    constructor(logger: Logger) {
        const date = new Date()
        const config = new Config()

        if (!config.measureDate) {
            this.measureDate = new Date(date.getFullYear(), date.getMonth(), 1)
            config.measureDate = this.measureDate
            config.save();
        } else {
            this.measureDate = config.measureDate;
        }

        setInterval(async () => {
            try {
                await this.autoValidate()
            } catch (exception) {
                logger.HandleMessage(`[UserManager] ${exception}`)
            }
        },
            30000
        )
    }

    private async autoValidate(): Promise<void> {
        const date = new Date()
        if (this.measureDate.getFullYear() == date.getFullYear() && this.measureDate.getMonth() == date.getMonth()) return

        await DatabaseManager.updateEntites(UserEntity, {
            messagesInMonth: MoreThan(0)
        }, {
            messagesInMonth: 0
        })

        this.measureDate = new Date(date.getFullYear(), date.getMonth(), 1)
        const config = new Config()
        config.measureDate = this.measureDate
        config.save()
    }

    public async handleMessage(message: Message): Promise<void> {
        const { guild, channel, author } = message

        if (author.bot) return

        const user = await UserManager.getUserOrCreate(author.id)
        const { prefix } = new Config()

        if (message.content.startsWith(prefix)) {
            ++user.totalCommands
        }

        const channelsWithExp: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.withExp })).map(channel => channel.id)
        if (channelsWithExp.includes(channel.id)) {
            ++user.totalMessages
            ++user.messagesInMonth
        }

        await DatabaseManager.save(user)
    }

    public static async getUserOrCreate(memberID: string): Promise<UserEntity> {
        const user = await DatabaseManager.getEntity(UserEntity, { id: memberID })
        if (user) return user

        return new UserEntity(UserManager.defaultUser(memberID))
    }

    public static async getTopUsers(type: TopType, limit?: number): Promise<UserEntity[]> {
        let order = {}

        if (type == 'level' || type == 'lvl' || type == 'poziom') {
            order = {
                exp: 'DESC'
            }
        }

        if (type == 'posty' || type == 'posts') {
            order = {
                totalMessages: 'DESC'
            }
        }

        if (type == 'mposts' || type == 'mposty' || type == 'postym') {
            order = {
                messagesInMonth: 'DESC'
            }
        }

        if (Object.keys(order).length === 0) return null
        return await DatabaseManager.findEntities(UserEntity, {
            order: order,
            skip: 0,
            take: limit || 10
        })
    }

    public static getTopName(type: TopType): string {
        if (type == 'level' || type == 'lvl' || type == 'poziom') return 'Poziomów'
        if (type == 'posty' || type == 'posts') return 'Wiadomości'
        if (type == 'mposts' || type == 'mposty' || type == 'postym') return 'Wiadomości w miesiącu'
        return ''
    }

    public static getTopInfo(position: number, user: UserEntity, type: TopType): string {
        if (type == 'level' || type == 'lvl' || type == 'poziom') {
            return `**${position}**: <@${user.id}>: ${user.level} **LVL** (${user.exp.toFixed(0)} **EXP**)`
        }

        if (type == 'posty' || type == 'posts') {
            return `**${position}**: <@${user.id}>: ${user.totalMessages} **Wiadomości**`
        }

        if (type == 'mposts' || type == 'mposty' || type == 'postym') {
            return `**${position}**: <@${user.id}>: ${user.messagesInMonth} **Wiadomości**`
        }

        return ''
    }
}
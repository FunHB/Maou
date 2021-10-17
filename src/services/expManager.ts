import { Message, MessageEmbed } from 'discord.js'
import { Config } from '../config'
import { DatabaseManager } from '../database/databaseManager'
import { ChannelEntity, ChannelType } from '../database/entity/Channel';
import { RoleEntity, RoleType } from '../database/entity/Role';
import { UserEntity } from '../database/entity/User';

export class ExpManager {
    private static levelMultiplier = 0.35

    private minCharInMsg: number
    private maxCharInMsg: number
    private minExpFromMsg: number
    private maxExpFromMsg: number
    private expMultiplier: number

    constructor() {
        const config = new Config()
        this.minCharInMsg = config.exp.minCharInMsg
        this.maxCharInMsg = config.exp.maxCharInMsg
        this.minExpFromMsg = config.exp.minExpFromMsg
        this.maxExpFromMsg = config.exp.maxExpFromMsg
        this.expMultiplier = config.exp.expMultiplier
    }

    public async handleMessage(message: Message): Promise<void> {
        const { guild, channel, member } = message

        if (message.author.bot) return

        const config = new Config()
        const channelsWithExp: string[] = (await DatabaseManager.getEntities(ChannelEntity, { guild: guild.id, type: ChannelType.withExp })).map(channel => channel.id)

        if (!channelsWithExp.includes(channel.id)) return

        const user = await ExpManager.getUserOrCreate(member.id)
        const expFromMessage = this.getExpFromMsg(this.charCount(message.content, config.prefix), this.minCharInMsg, this.maxCharInMsg, this.minExpFromMsg, this.maxExpFromMsg, this.expMultiplier);

        user.exp += expFromMessage
        const toNextLvl = ExpManager.expToNextLevel(user.level)

        if (user.exp >= toNextLvl) {
            user.exp -= toNextLvl
            ++user.level

            const roles: RoleEntity[] = await DatabaseManager.getEntities(RoleEntity, { guild: guild.id, type: RoleType.level })
            const newRoles = roles.filter(role => role.minLevel <= user.level);

            newRoles.forEach(newRole => {
                if (!member.roles.cache.has(newRole.id)) {
                    member.roles.add(newRole.id);
                }
            })

            channel.send({
                embeds: [new MessageEmbed({
                    color: member.displayHexColor,
                    title: 'Nowy poziom',
                    description: `<@${member.id}> awansował na poziom ${user.level}`,
                })]
            })
        }

        await DatabaseManager.save(user)
    }

    private charCount(messageContent: string, prefix: string): number {
        return messageContent.startsWith(prefix) ? 1 : messageContent.replace(/\s+/g, '').replace(/:[\S]+:/g, '').replace(/https:\/\/[\S]+/g, '').replace(/http:\/\/[\S]+/g, '').length
    }

    private getExpFromMsg(charCount: number, minCharInMsg: number, maxCharInMsg: number, minExpFromMsg: number, maxExpFromMsg: number, expMultiplier: number): number {
        if (charCount <= minCharInMsg) return minExpFromMsg;
        if (charCount >= maxCharInMsg) return maxExpFromMsg;
        return charCount * expMultiplier;
    }

    public static expToNextLevel(level: number): number {
        return level <= 0 ? 0 : Math.floor(Math.pow(level / this.levelMultiplier, 2)) + 1
    }

    public static async getUserOrCreate(memberID: string): Promise<UserEntity> {
        const user = await DatabaseManager.getEntity(UserEntity, { id: memberID })
        if (user) return user
        return new UserEntity({ id: memberID, exp: 0, level: 0 })
    }

    public static async getTopUsers(limit?: number) {
        return await DatabaseManager.findEntities(UserEntity, {
            order: {
                level: 'DESC',
                exp: 'DESC'
            },
            skip: 0,
            take: limit || 10
        })
    }
}
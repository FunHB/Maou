import { Collection, Message } from 'discord.js'
import fs from 'fs'
import { Muted } from "../api"
import { Config } from '../config'
import { Utils } from './utils'

export class MutedManager {
    private static mutedUsers: Collection<string, Muted[]> = new Collection()
    public static path = `./data/muted.json`
    public static isRunning = false

    public static isStillMuted(muted: Muted): boolean {
        const time = new Date().getTime()
        return time <= (new Date(muted.start).getTime() + muted.duration)
    }

    public static saveChanges(): void {
        fs.writeFileSync(this.path, JSON.stringify(Object.fromEntries(this.mutedUsers)))
    }

    public static addMuted(guildID: string, user: Muted): void {
        this.mutedUsers.get(guildID).push(user)
        this.saveChanges()
    }

    public static removeMuted(guildID: string, userID: string): void {
        const muted = this.mutedUsers.get(guildID)
        muted.splice(muted.indexOf(muted.find(user => user.id == userID)), 1)
        this.saveChanges()
    }

    public static setMuted(guildID: string): void {
        if (!fs.existsSync(this.path)) this.saveChanges()
        const object = JSON.parse(fs.readFileSync(this.path).toString() || '{}')
        this.mutedUsers = new Collection(Object.keys(object).map(key => [key, object[key]]))
        if (!this.mutedUsers.get(guildID)) this.mutedUsers.set(guildID, [])
    }

    public static getMuted(guildID: string): Muted[] {
        return this.mutedUsers.get(guildID)
    }

    public static async checkMuted(message: Message): Promise<void> {
        const { guild } = message
        this.isRunning = true

        console.info('[Mutes Manager] Mutes Manager is running')

        setInterval(() => {
            this.setMuted(guild.id)

            this.mutedUsers.get(guild.id).forEach(async muted => {
                if (!this.isStillMuted(muted)) {
                    this.removeMuted(guild.id, muted.id)
                    return
                }

                await guild.members.fetch()
                const mutedMember = guild.members.cache.get(muted.id)

                if (!mutedMember) return

                if (!mutedMember.roles.cache.has(Config.muteRole)) {
                    await mutedMember.roles.add(Config.muteRole)
                }
            })

            guild.roles.cache.get(Config.muteRole).members.filter(member => !this.mutedUsers.get(guild.id).find(muted => muted.id === member.id)).forEach(async member => {
                await member.roles.remove(Config.muteRole)
            })

            console.info(`[Mutes Manager] iteration end at time - ${Utils.dateToString(new Date())}`)
        },
            60000
        )
    }
}
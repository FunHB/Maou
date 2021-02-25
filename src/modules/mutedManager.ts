import { Collection, Message } from 'discord.js'
import fs from 'fs'
import { Muted } from "../api"
import { Config } from '../config'

export class MutedManager {
    private static mutedUsers: Collection<string, Muted[]> = new Collection()
    public static path = `./data/muted.json`
    public static isRunning = false

    public static isStillMuted(user: Muted): boolean {
        const time = new Date().getTime()
        return time <= (new Date(user.start).getTime() + user.duration)
    }

    public static saveChanges(): void {
        fs.writeFileSync(this.path, JSON.stringify(Object.fromEntries(this.mutedUsers)))
    }

    public static addMuted(guildID: string, user: Muted): void {
        this.mutedUsers.get(guildID).push(user)
        MutedManager.saveChanges()
    }

    public static removeMuted(guildID: string, userID: string): void {
        const muted = this.mutedUsers.get(guildID)
        muted.splice(muted.indexOf(muted.find(user => user.id === userID)))
        MutedManager.saveChanges()
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

        setInterval(() => {
            this.setMuted(guild.id)

            if (this.mutedUsers.get(guild.id)) {
                this.mutedUsers.get(guild.id).forEach(async user => {
                    await guild.members.fetch()
                    const mutedUser = guild.members.cache.get(user.id)

                    if (!mutedUser) return

                    if (mutedUser.roles.cache.has(Config.muteRole)) {
                        if (!this.isStillMuted(user)) {
                            await mutedUser.roles.remove(Config.muteRole)
                            this.removeMuted(guild.id, user.id)
                            return
                        }
                    }

                    if (this.isStillMuted(user)) {
                        await mutedUser.roles.add(Config.muteRole)
                    }
                })
            }
        },
            60000
        )
    }
}
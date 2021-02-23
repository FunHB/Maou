import fs from 'fs'
import { Muted } from "../api";

export class MutedManager {
    public get muted(): Muted[] { return this._muted }

    private _muted: Muted[]

    constructor(path: string) {
        this._muted = this.getMutedUsers(path)
    }

    private getMutedUsers(path: string): Muted[] {
        return JSON.parse(fs.readFileSync(path).toString())
    }

    public isStillMuted(user: Muted): boolean {
        const time = new Date().getTime()
        return time <= (user.start.getTime() + user.duration)
    }

    public saveChanges(path: string): void {
        fs.writeFileSync(path, JSON.stringify(this._muted))
    }

    public addMuted(user: Muted): void {
        this._muted.push(user)
    }

    public removeMuted(userID: string): void {
        this._muted.splice(this._muted.indexOf(this._muted.find(user => user.id === userID)), 1)
    }
}
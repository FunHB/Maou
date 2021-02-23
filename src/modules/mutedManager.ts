import fs from 'fs'
import { Muted } from "../api";

export class MutedManager {
    public get muted(): Muted[] { return this._muted }

    private _muted: Muted[]
    private _path = './data/muted.json'

    constructor() {
        this._muted = JSON.parse(fs.readFileSync(this._path).toLocaleString())
    }

    public isStillMuted(user: Muted): boolean {
        const time = new Date().getTime()
        return time <= (new Date(user.start).getTime() + user.duration)
    }

    public saveChanges(): void {
        fs.writeFileSync(this._path, JSON.stringify(this._muted))
    }

    public addMuted(user: Muted): void {
        this._muted.push(user)
    }

    public removeMuted(userID: string): void {
        this._muted.splice(this._muted.indexOf(this._muted.find(user => user.id === userID)), 1)
    }
}
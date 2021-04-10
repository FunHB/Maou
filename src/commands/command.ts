import { Message } from 'discord.js'

export class CommandBody {
  public get commandName(): string { return this._commandName }
  public get args(): string[] { return this._args }
  public get modCommand(): boolean { return this._modCommand }

  readonly _commandName: string
  readonly _args: string[] = []
  private _modCommand = false
  private _modPrefix = 'mod'

  constructor(message: Message, prefix: string) {
    const regex = new RegExp('"[^"]+"|[^\\ ]+', 'g')

    message.content.slice(prefix.length).match(regex).forEach(element => {
      return this._args.push(element.replace(/"/g, ''))
    })

    this._commandName = this._args.shift()
    if (this._commandName === this._modPrefix) {
      this._commandName = this._args.shift() || 'h'
      this._modCommand = true
    }
  }
}
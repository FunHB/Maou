import { Message } from 'discord.js'
import { channelType } from '../preconditions/requireChannel'

export class Command {
  public name: string
  public description: string
  public aliases?: string[]
  public requireArgs? = false
  public usage?: string
  public channelType?: channelType = channelType.normal
  public guildonly? = true
  public precondition?: (...args: any) => any

  public execute: (message: Message, args: string[]) => Promise<void>
}
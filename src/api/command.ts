import { Message } from 'discord.js'
import { channelType } from './channelType'

export class Command {
  public name: string
  public description: string
  public aliases?: string[]
  public requireArgs? = false
  public usage?: string
  public channelType?: channelType = channelType.normal
  public guildonly? = true

  public async execute(_message: Message, _args: string[]): Promise<void> {}
}
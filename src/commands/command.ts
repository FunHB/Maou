import { Message } from 'discord.js'
import { channelType } from '../api'

export class Command {
  public name: string
  public description: string
  public aliases: string[]
  public requireArgs = false
  public group: string
  public usage = ''
  public channelType: channelType = channelType.normal
  public guildonly = true
  public cooldown = 10

  public async execute(_message: Message, _args: string[]): Promise<void> {}
}
import { Message } from 'discord.js'
import { channelType } from '../../preconditions/requireChannel'

export interface Command {
  name: string
  description: string
  aliases?: string[]
  requireArgs?: boolean
  usage?: string
  channelType?: channelType
  guildonly?: boolean
  precondition?: (...args: any) => any

  execute: (message: Message, args: string[]) => Promise<void>
}
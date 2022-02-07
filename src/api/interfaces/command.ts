import { Message } from 'discord.js'
import { ChannelType } from '../../database/entity/Channel';

export interface Command {
  name: string
  description: string
  aliases?: string[]
  requireArgs?: boolean
  usage?: string
  channelType?: ChannelType
  guildonly?: boolean
  precondition?: (...args: any) => any

  execute: (message: Message, args: string[]) => Promise<void>
}
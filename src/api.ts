import { Client, Message } from 'discord.js'

// types

export enum channelType {
    normal,
    botCommands,
    artschannel,
    reports
}

export enum Colors {
    Error = '#ff0000',
    Info = '#007acc',
    Success = '#33ff33',
    Warning = '#ffff00',
    Neutral = '#808080'
}

// main interfaces

export interface ConfigInterface {
    // main configs
    token: string
    prefix: string
    botAuthor: string
    botVersion: string
    owner: string

    // channels configs
    botCommandsChannel: string
    reportsChannel: string
    modLogsChannel: string
    artsChannel: string

    // roles configs
    modRole: string
    muteRole: string
}

export interface BotInterface {
    start(client: Client): void
}

export interface Command {
    name: string
    description: string
    aliases?: string[]
    args: boolean
    roles?: string[]
    usage?: string
    channelType: channelType
    guildonly: boolean
    cooldown?: number
    execute(message: Message, args: string[]): Promise<void>
}

export interface Muted {
    id: string
    guildID: string
    reason: string
    start: Date
    duration: number
}
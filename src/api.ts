/* types */

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

/* interfaces */

export interface IMuted {
    id: string
    reason: string
    start: Date
    duration: number
}
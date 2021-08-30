export interface IConfig {
    readonly token: string
    readonly upload: Record<string, string>
    prefix: string
    channels: Record<string, string>
    roles: Record<string, string>
    messages: Record<string, string>
    exp: IExp
}

export interface IExp {
    minCharInMsg: number
    maxCharInMsg: number
    minExpFromMsg: number
    maxExpFromMsg: number
    expMultiplier: number
}
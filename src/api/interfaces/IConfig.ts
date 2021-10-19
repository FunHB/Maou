export interface IConfig {
    readonly token: string
    readonly databaseString: string
    readonly upload: Record<string, string>
    prefix: string
    messages: Record<string, string>
    exp: IExp
    measureDate: Date
}

export interface IExp {
    minCharInMsg: number
    maxCharInMsg: number
    minExpFromMsg: number
    maxExpFromMsg: number
    expMultiplier: number
}
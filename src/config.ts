
import { load } from 'ts-dotenv'
import { ConfigInterface } from './api'

export class Config implements ConfigInterface {

    // main configs
    public get token(): string { return this.env.TOKEN }
    public get prefix(): string { return this.env.PREFIX }
    public get botAuthor(): string { return 'FunHB' }
    public get botVersion(): string { return '1.0.5' }
    public get owner(): string { return '324612588677627904' }

    // channels configs
    public get botCommandsChannel(): string { return this.env.BOTCOMMANDSCHANNEL }
    public get reportsChannel(): string { return this.env.REPORTSCHANNEL }
    public get modLogsChannel(): string { return this.env.MODLOGSCHANNEL }
    public get artsChannel(): string { return this.env.ARTSCHANNEL }

    // roles configs
    public get modRole(): string { return this.env.MODROLE }
    public get muteRole(): string { return this.env.MUTEROLE }

    private env = load({
        TOKEN: String,
        BOTCOMMANDSCHANNEL: String,
        REPORTSCHANNEL: String,
        MODROLE: String,
        MODLOGSCHANNEL: String,
        MUTEROLE: String,
        ARTSCHANNEL: String,
        PREFIX: String
    })
}
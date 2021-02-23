
import { load } from 'ts-dotenv'

export class Config {

    // main configs
    public static get token(): string { return this.env.TOKEN }
    public static get prefix(): string { return this.env.PREFIX }
    public static get botAuthor(): string { return 'FunHB' }
    public static get botVersion(): string { return '1.0.6' }
    public static get owner(): string { return '324612588677627904' }

    // channels configs
    public static get botCommandsChannel(): string { return this.env.BOTCOMMANDSCHANNEL }
    public static get reportsChannel(): string { return this.env.REPORTSCHANNEL }
    public static get modLogsChannel(): string { return this.env.MODLOGSCHANNEL }
    public static get artsChannel(): string { return this.env.ARTSCHANNEL }

    // roles configs
    public static get modRole(): string { return this.env.MODROLE }
    public static get muteRole(): string { return this.env.MUTEROLE }

    private static env = load({
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
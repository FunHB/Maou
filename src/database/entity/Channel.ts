import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ChannelType {
    normal = '',
    autoPublic = 'autopublic',
    withExp = 'withexp',
    supervisor = 'supervisor',
    commands = 'commands',
    reports = 'reports',
    modLogs = 'modlogs',
    arts = 'arts',
    messageDeleteLogs = 'messagedeletelogs',
    recrutation = 'recrutation',
    upload = 'upload'
}

@Entity()
export class ChannelEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar', { length: 19 })
    public id: string

    @Column('varchar', { length: 19 })
    public guild: string

    @Column('varchar')
    public type: ChannelType

    constructor(id: string, guild: string, type: ChannelType) {
        this.id = id
        this.guild = guild
        this.type = type
    }
}
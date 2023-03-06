import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RoleType {
    addable = 'addable',
    level = 'level',
    mod = 'mod',
    mute = 'mute',
    recrutation = 'recrutation'
}

@Entity()
export class RoleEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar')
    public id: string

    @Column('varchar', { length: 19 })
    public guild: string

    @Column('varchar')
    public type: RoleType

    @Column('integer')
    public minLevel?: number

    constructor(id: string, guild: string, type: RoleType, minLevel: number = -1) {
        this.id = id
        this.guild = guild
        this.type = type
        this.minLevel = minLevel
    }
}
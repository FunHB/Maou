import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum MessageType {
    welcome = 'welcome',
    farewell = 'farewell',
    recrutation = 'recrutation'
}

@Entity()
export class MessageEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar', { length: 18 })
    public guild: string

    @Column('varchar')
    public type: MessageType

    @Column('varchar')
    public value: string

    constructor(guild: string, type: MessageType, value: string) {
        this.guild = guild
        this.type = type
        this.value = value
    }
}
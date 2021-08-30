import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ChannelType {
    autoPublic = 'autopublic',
    withExp = 'withexp',
    supervisor = 'supervisor'
}

@Entity()
export class ChannelEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar', { length: 18 })
    public id: string

    @Column('varchar')
    public type: ChannelType

    constructor(id: string, type: ChannelType) {
        this.id = id
        this.type = type
    }
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum RoleType {
    addable = 'addable',
    level = 'level'
}

@Entity()
export class RoleEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar')
    public id: string

    @Column('varchar')
    public type: RoleType

    @Column('integer')
    public minLevel?: number

    constructor(id: string, type: RoleType, minLevel: number = -1) {
        this.id = id
        this.type = type
        this.minLevel = minLevel
    }
}
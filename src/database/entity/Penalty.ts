import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IPenalty } from "../../api/interfaces/IPenalty";

export enum PenaltyType {
    mute = 'mute',
    ban = 'ban',
    kick = 'kick'
}

@Entity()
export class PenaltyEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar', { length: 19 })
    public user: string

    @Column('varchar', { length: 19 })
    public guild: string

    @Column('varchar')
    public reason: string
    
    @Column('timestamp')
    public startDate: Date
    
    @Column('integer')
    public duration: number
    
    @Column('varchar')
    public type: PenaltyType

    constructor(penalty: IPenalty) {
        if (!penalty) return
        this.user = penalty.user
        this.guild = penalty.guild
        this.reason = penalty.reason
        this.startDate = penalty.startDate
        this.duration = penalty.duration
        this.type = penalty.type
    }
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IUser } from "../../api/interfaces/IUser";

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar')
    public id: string

    @Column('double precision')
    public exp: number

    @Column('integer')
    public level: number

    @Column('integer')
    public totalMessages: number

    @Column('integer')
    public messagesInMonth: number

    constructor(user: IUser) {
        if (!user) return
        this.id = user.id
        this.exp = user.exp
        this.level = user.level
        this.totalMessages = user.totalMessages
        this.messagesInMonth = user.messagesInMonth
    }
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IReport } from "../../api/interfaces/IReport";

@Entity()
export class ReportEntity {

    @PrimaryGeneratedColumn('uuid')
    public _id: string

    @Column('varchar')
    public reportId: string

    @Column('varchar', { length: 18 })
    public guild: string

    @Column('varchar')
    public reportedUserId: string

    @Column('varchar')
    public reportingUserId: string

    @Column('varchar')
    public channelId: string

    @Column('varchar')
    public messageId: string

    @Column('timestamp')
    public date: Date

    @Column('varchar')
    public reason: string

    @Column('varchar')
    public message: string

    constructor(report: IReport) {
        if (!report) return
        this.reportId = report.reportId
        this.guild = report.guild
        this.reportedUserId = report.reportedUserId
        this.reportingUserId = report.reportingUserId
        this.channelId = report.channelId
        this.messageId = report.messageId
        this.date = report.date
        this.reason = report.reason
        this.message = report.message
    }
}
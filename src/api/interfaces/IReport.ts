export interface IReport {
    reportId: string
    guild: string
    reportedUserId: string
    reportingUserId: string
    channelId: string
    messageId: string
    date: Date
    reason: string
    message: string
}
export interface IReport {
    reportId: string,
    reportedUserId: string,
    reportingUserId: string,
    channelId: string,
    messageId: string,
    date: Date,
    reason: string,
    message: string
}
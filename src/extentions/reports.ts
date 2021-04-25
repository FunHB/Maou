import { Collection, Message } from "discord.js"

export class Reports {
    private static _reports: Collection<string, { reported: Message }> = new Collection()

    public static getReport(): Collection<string, { reported: Message }> {
        return this._reports
    }

    public static setReports(reportedID: string, reported: Message): void {
        this._reports.set(reportedID, { reported: reported })
    }

    public static deleteReport(id: string): void {
        this._reports.delete(id)
    }

    public static reportErrorCode(reported: string, reason: string, message: Message): number {
        if (!reported.match(/[0-9]{18}/)) return 1
        if (!reason) return 2
        if (Date.now() - message.createdTimestamp > 10800000) return 3
        return 0
    }

    public static getReportMessageFromErrorCode(errorCode: number): string {
        const messages = [
            'Id wiadomości się nie zgadza!',
            'Musisz podać powód zgłoszenia!',
            'Wiadmości starszych niż trzy godziny nie można zgłaszać'
        ]
        return messages[errorCode-1]
    }

    public static getResolveDecision(decision: string): number {
        switch (decision) {
            case 'reject':
            case 'odrzuć':
            case 'odrzuc':
            case 'nah':
                return 0

            case 'approve':
            case 'zatwierdź':
            case 'zatwierdz':
            case 'ok':
                return 1

            default:
                return 2
        }
    }
}
export class Utils {
    public static dateToString(date: Date, noSeconds = false): string {
        const out = `${('0' + date.getUTCDate()).slice(-2)}.${('0' + (date.getUTCMonth() + 1)).slice(-2)}.${date.getUTCFullYear()} ${('0' + (date.getUTCHours() + 1)).slice(-2)}:${('0' + date.getUTCMinutes()).slice(-2)}`
        if (noSeconds) return out
        return `${out}:${('0' + date.getUTCSeconds()).slice(-2)}`
    }
}
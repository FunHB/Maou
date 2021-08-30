export class SupervisorMessage {
    public previousOccurrence: Date
    public content: string
    public count: number

    constructor(content: string, count = 1) {
        this.previousOccurrence = new Date()
        this.content = content
        this.count = count
    }

    public increment = (): number => { return ++this.count }
    public isValid = (): boolean => { return (Date.now() - this.previousOccurrence.getTime()) / 1000 / 60 <= 1 }
}
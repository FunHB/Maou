import { PenaltyType } from "../../database/entity/Penalty";

export interface IPenalty {
    user: string
    guild: string
    reason: string
    startDate: Date
    duration: number
    type: PenaltyType
}
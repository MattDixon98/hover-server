import { Keyword } from "./KeywordType"
import { Repetition } from "./RepetitionInterface"
import { Score } from "./ScoreType"

export type Diagnosis = {
    analysedMessage: string,
    keywords: Array<Keyword>,
    repetition: Repetition,
    score: Score,
    correctness: number
}
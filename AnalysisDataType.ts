export type AnalysisData = {
    score: number,
    repetition: Array<{ word: string, recurrence: number }>,
    correctness: number
}
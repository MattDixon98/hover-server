import { Repetition } from "./RepetitionInterface";
import { Score } from "./ScoreType";

export type AnalysisData = {
    score: Score,
    repetition: Repetition,
    correctness: number,
    typingSpeed: number
}
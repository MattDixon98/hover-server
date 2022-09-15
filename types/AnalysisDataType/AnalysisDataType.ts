import { Repetition } from "../RepetitionInterface/RepetitionInterface";
import { Score } from "../ScoreType/ScoreType";

export type AnalysisData = {
    score: Score,
    repetition: Repetition,
    correctness: number,
    typingSpeed: number
}
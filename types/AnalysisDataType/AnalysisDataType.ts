import { Repetition } from "../RepetitionInterface/RepetitionInterface";
import { Score } from "../ScoreType/ScoreType";

export type AnalysisData = {
    rollingScore: Score,
    newScore: Score,
    repetition: Repetition,
    correctness: number,
    typingSpeed: number
}
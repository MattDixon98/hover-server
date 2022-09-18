import { Repetition } from "../RepetitionInterface/RepetitionInterface";
import { Score } from "../ScoreType/ScoreType";
import { TypingSpeedAnalysis } from "../TypingSpeedAnalysisType/TypingSpeedAnalysisType";

export type AnalysisData = {
    rollingScore: Score,
    newScore: Score,
    repetition: Repetition,
    correctness: number,
    typingSpeed: TypingSpeedAnalysis
}
import { AnalysisData } from "../AnalysisDataType";
import { Repetition } from "../RepetitionInterface";
import { Score } from "../ScoreType";

export function generateHoverMessage(analysisData: AnalysisData): string {
    let message: string = "";
    // Check for repetition in the message
    if(Object.keys(analysisData.repetition).length > 0){
        message += createRepetitionComment(analysisData.repetition);
    }
    // Check for anxiety, depression and risk scores
    if(analysisData.score.anxiety || analysisData.score.depression || analysisData.score.risk){
        message += createScoreComment(analysisData.score);
    }
    // Check for correctness of message
    if(analysisData.correctness < 100){
        message += `Patient wrote message with ${analysisData.correctness}% correctness.\n`;
    }
    // Check for message speed
    if(analysisData.typingSpeed > 0){
        message += `Patient's typing speed is ~${analysisData.typingSpeed} characters per second.`;
    }
    return message.trim();
}

function createRepetitionComment(repetition: Repetition) : string {
    let comment: string = "";
    Object.keys(repetition).forEach((word: string) => {
        comment += `Patient repeated the term "${word}" ${repetition[word]} times.\n`;
    })
    return comment;
}

function createScoreComment(score: Score): string {
    let comment: string = "";
    if(score.anxiety > 1){
        comment += "Patient is displaying signs of anxiety.\n"
    }
    if(score.depression > 1){
        comment += "Patient is displaying signs of depression.\n"
    }
    if(score.risk){
        comment += "Patient may be a risk to themselves or others.\n"
    }
    return comment;
}
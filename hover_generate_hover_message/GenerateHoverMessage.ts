import { AnalysisData } from "../types/AnalysisDataType/AnalysisDataType";
import { Repetition } from "../types/RepetitionInterface/RepetitionInterface";
import { Score } from "../types/ScoreType/ScoreType";
import { HoverMessage } from "../types/HoverMessageType/HoverMessageType";
import { generateFacilitatorSuggestion } from "../hover_facilitator_suggestion/FacilitatorSuggestion";

export function generateHoverMessage(analysisData: AnalysisData): HoverMessage {
    let message: string = "";
    // Check for repetition in the message
    if(Object.keys(analysisData.repetition).length > 0){
        message += createRepetitionComment(analysisData.repetition);
    }
    // Check for anxiety, depression and risk scores
    // if(analysisData.newScore.anxiety || analysisData.newScore.depression || analysisData.newScore.risk){
    //     message += createScoreComment(analysisData.newScore);
    // }
    // Check for correctness of message
    if(analysisData.correctness < 100){
        message += `Patient wrote message with ${analysisData.correctness}% correctness.\n`;
    }
    // Check for message speed
    if(analysisData.typingSpeed.anx_score > 0){
        message += analysisData.typingSpeed.message + "\n";
    }
    // Check for facilitator suggestion
    const facilitatorSuggestion = generateFacilitatorSuggestion(analysisData.rollingScore.anxiety, analysisData.rollingScore.depression)
    if(facilitatorSuggestion.therapyType.trim().length > 0){
        message += `${facilitatorSuggestion.text} <a target="_blank" href=${facilitatorSuggestion.link}>${facilitatorSuggestion.therapyType}</a>.\n`
    }

    return { comment: message.trim(), score: analysisData.newScore };
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
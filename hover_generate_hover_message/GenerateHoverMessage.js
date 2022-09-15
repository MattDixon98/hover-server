"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHoverMessage = void 0;
function generateHoverMessage(analysisData) {
    let message = "";
    // Check for repetition in the message
    if (Object.keys(analysisData.repetition).length > 0) {
        message += createRepetitionComment(analysisData.repetition);
    }
    // Check for anxiety, depression and risk scores
    if (analysisData.score.anxiety || analysisData.score.depression || analysisData.score.risk) {
        message += createScoreComment(analysisData.score);
    }
    // Check for correctness of message
    if (analysisData.correctness < 100) {
        message += `Patient wrote message with ${analysisData.correctness}% correctness.\n`;
    }
    // Check for message speed
    if (analysisData.typingSpeed > 0) {
        message += `Patient's typing speed is ~${analysisData.typingSpeed} characters per second.`;
    }
    return { comment: message.trim(), score: analysisData.score };
}
exports.generateHoverMessage = generateHoverMessage;
function createRepetitionComment(repetition) {
    let comment = "";
    Object.keys(repetition).forEach((word) => {
        comment += `Patient repeated the term "${word}" ${repetition[word]} times.\n`;
    });
    return comment;
}
function createScoreComment(score) {
    let comment = "";
    if (score.anxiety > 1) {
        comment += "Patient is displaying signs of anxiety.\n";
    }
    if (score.depression > 1) {
        comment += "Patient is displaying signs of depression.\n";
    }
    if (score.risk) {
        comment += "Patient may be a risk to themselves or others.\n";
    }
    return comment;
}

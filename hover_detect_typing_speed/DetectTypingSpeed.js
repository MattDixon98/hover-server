"use strict";
// DetectTypingSpeed.ts by Matt Dixon
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTypingSpeed = void 0;
function detectTypingSpeed(prevMessage, currMessage) {
    // Calculate the time in milliseconds difference between the latestMessage and nextLatestMessage
    let secondsBetweenTwoDate = Math.abs((new Date(currMessage.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) / 1000);
    // Calculate characters per millisecond
    let typingSpeedSec = currMessage.content.length / secondsBetweenTwoDate;
    return Math.round(typingSpeedSec * 100) / 100;
}
exports.detectTypingSpeed = detectTypingSpeed;

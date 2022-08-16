// DetectTypingSpeed.ts by Matt Dixon

import { TypingSpeedMessage } from "../TypingSpeedMessageType";

export function detectTypingSpeed(prevMessage: TypingSpeedMessage, currMessage: TypingSpeedMessage): number {

    // Calculate the time in milliseconds difference between the latestMessage and nextLatestMessage
    let secondsBetweenTwoDate: number = Math.abs((new Date(currMessage.timestamp).getTime() - new Date(prevMessage.timestamp).getTime())/1000);
    // Calculate characters per millisecond
    let typingSpeedSec: number = currMessage.content.length/secondsBetweenTwoDate;

    return Math.round(typingSpeedSec * 100) / 100;

}
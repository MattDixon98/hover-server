"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTranscript = void 0;
const fs = __importStar(require("fs"));
// const transcriptData: Array<TranscriptMessage> = [
//     { messageContent: "Hi there :)", author: "jamierossiter", dateSent: "9:44 pm", role: "patient" },
//     { messageContent: "Hey how you going?", author: "mattdixon", dateSent: "9:45 pm", role: "facilitator" },
//     { messageContent: "Not bad actually. Yourself?", author: "jamierossiter", dateSent: "9:45 pm", role: "patient" },
//     { messageContent: "I just ate a whole bowl of nutrigrain", author: "mattdixon", dateSent: "9:47 pm", role: "facilitator" }
// ]
function generateTranscript(messageHistory) {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${currentDate.getMilliseconds()}`;
    const fileName = `./hover_transcript_generator/transcript_outputs/transcript_${formattedDate}.csv`;
    // Create file
    fs.writeFile(fileName, "", (err) => {
        if (err)
            console.error(err);
    });
    const transcriptStream = fs.createWriteStream(fileName, {
        flags: "a"
    });
    transcriptStream.write("author, role, dateSent, message, hoverComment, anxietyScore, depressionScore, riskFlag\n");
    messageHistory.forEach((msg) => {
        const line = `${msg.author}, ${msg.role}, ${msg.dateSent}, ${msg.messageContent}, ${msg.hoverComment}, ${msg.messageScore.anxiety}, ${msg.messageScore.depression}, ${msg.messageScore.risk}\n`;
        transcriptStream.write(line);
    });
    transcriptStream.end();
}
exports.generateTranscript = generateTranscript;

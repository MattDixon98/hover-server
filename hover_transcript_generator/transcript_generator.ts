import * as fs from "fs";
import { TranscriptMessage } from "./TranscriptMessageType";

// const transcriptData: Array<TranscriptMessage> = [
//     { messageContent: "Hi there :)", author: "jamierossiter", dateSent: "9:44 pm", role: "patient" },
//     { messageContent: "Hey how you going?", author: "mattdixon", dateSent: "9:45 pm", role: "facilitator" },
//     { messageContent: "Not bad actually. Yourself?", author: "jamierossiter", dateSent: "9:45 pm", role: "patient" },
//     { messageContent: "I just ate a whole bowl of nutrigrain", author: "mattdixon", dateSent: "9:47 pm", role: "facilitator" }
// ]

export function generateTranscript(messageHistory: Array<TranscriptMessage>){

    const currentDate: Date = new Date();
    const formattedDate: string = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}-${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${currentDate.getMilliseconds()}`;

    const fileName: string = `./hover_transcript_generator/transcript_outputs/transcript_${formattedDate}.csv`;
    // Create file
    fs.writeFile(fileName, "", (err: NodeJS.ErrnoException | null) => {
        if(err) console.error(err);
    })
    const transcriptStream: fs.WriteStream = fs.createWriteStream(fileName, {
        flags: "a"
    });

    transcriptStream.write("author, role, dateSent, message, hoverComment\n");

    messageHistory.forEach((msg: TranscriptMessage) => {

        const line: string = `${msg.author}, ${msg.role}, ${msg.dateSent}, ${msg.messageContent}, ${msg.hoverComment}\n`;
        transcriptStream.write(line);

    })

    transcriptStream.end();

}


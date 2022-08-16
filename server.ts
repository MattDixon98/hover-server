
/* TODO: 
    - ASSIGN ALL MESSAGES SENT BY A CLIENT TO THE CLIENT OBJECT FOR TYPING SPEED/MESSAGE SPEED ANALYSIS
    - Broadcast chat room information to clients so they are aware of who they are chatting to.
*/

import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import { ClientProfile } from "./ClientProfileType";
import { WebSocketCommunication } from "./WebSocketCommunicationType";
import { ProfileValidation } from "./ProfileValidationType";
import { SocketClosureCodes } from "./SocketClosureCodes";
import { Keyword } from "./hover_message_diagnosis/types/KeywordType";
import { createMessageDiagnosis } from "./hover_message_diagnosis/message_diagnosis/message-diagnosis";
import { Diagnosis } from "./hover_message_diagnosis/types/DiagnosisType";
import { ChatMessageContent } from "./ChatMessageContentType";
import { generateTranscript } from "./hover_transcript_generator/transcript_generator";
import { TranscriptMessage } from "./TranscriptMessageType";
import { detectTypingSpeed } from "./hover_detect_typing_speed/DetectTypingSpeed";
import { TypingSpeedMessage } from "./TypingSpeedMessageType";

const MAX_CLIENTS: number = 2;
const port: number = 9000;
const server: WebSocketServer = new WebSocketServer({ port: port });
let messageHistory: Array<string> = []; // Save message history

server.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {

    // Create connecting client's profile (id and username)
    const client: any = socket;
    client.profile = getClientProfile(request.url);

    handleConnection(socket, request, client); // Handle an incoming client connection
    sendConnectionMessages(client); // Send messages as a result of incoming client connection

    // Handle client disconnect
    client.on("close", (code: number, reason: Buffer) => {

        let message: string = "";

        // TODO: SAVE CHAT TRANSCRIPT TO FILE SERVER, THEN SAVE THE LINK TO THAT FILE IN DATABASE!
        if(messageHistory.length > 0) generateChatTranscript(messageHistory); // Generate chat transcript if there are messages in message history
        messageHistory = []; // Clear message history between clients
        
        if(code !== SocketClosureCodes.INVALID_REQUEST){

            message = `${client.profile.user} has left the chat.`;
            broadcastMessage(server, processServerMessage(message), false, client); // Broadcast message to all clients

            console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has disconnected from the server.`);

        }

    })

    // Handle message reception
    socket.on("message", msg => {

        const receivedMessage: string = processChatMessage(msg.toString(), client.profile);
        messageHistory.push(receivedMessage); // Add to message history
        broadcastMessage(server, receivedMessage, false, client); // Broadcast message to all clients

    })

})

function handleConnection(socket: WebSocket, request: http.IncomingMessage, client: any) : void {

    let error: boolean = false;
    let message: string = "";
    
    // If the client's user profile is not valid, close the current connecting client's connection
    const clientUserProfileValidation: ProfileValidation = validateUserProfile(client.profile, server);
    if(!clientUserProfileValidation.valid){

        message = clientUserProfileValidation.reason;
        client.close(SocketClosureCodes.INVALID_REQUEST);
        error = true;

    }
    
    // If number of clients exceeds max, close the current connecting client's connection
    if(server.clients.size > MAX_CLIENTS){

        message = `Connection failed: too many clients. This server permits a maximum of ${MAX_CLIENTS} clients at one time.`;
        client.close(SocketClosureCodes.INVALID_REQUEST);
        error = true;

    }

    // If a username cannot be extracted from the client's query, close the current connecting client's connection
    if(!(client.profile.user && client.profile.role)){

        message = "Connection failed: incorrect query provided. Please provide 'user' and 'role' query parameters in WebSocket request.";
        client.close(SocketClosureCodes.INVALID_REQUEST);
        error = true;

    } 

    // Handle connection errors
    if(!error){

        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has connected to the server.`);

    } else { 

        client.send(processServerMessage(message));
        error = false;
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) unsuccessfully attempted to connect to the server.`);

    } 

}

function sendConnectionMessages(client: any): void {

    const message: string = `${client.profile.user} has joined the chat.`;
    sendWelcomeMessage(client); // Send connecting client a welcome message
    broadcastMessage(server, processServerMessage(message), true, client); // Broadcast message to all clients except current connecting

}

function sendWelcomeMessage(client: any): void {   

    const welcomeMessage: string = `Welcome to the chat, ${client.profile.user}! Hover is ready to go!`;
    client.send(processServerMessage(welcomeMessage)); // Send message to current connecting client

}

function broadcastMessage(server: WebSocketServer, message: string, excludeCurrentClient: boolean, currentClient: any): void {

    server.clients.forEach((c: any) => {

        if(excludeCurrentClient){
            if(c.profile.user !== currentClient.profile.user) c.send(message); // Broadcast message to everyone except current connecting client
        } else {
            c.send(message)
        }
        
    })
}

function getClientProfile(reqUrl: string | undefined): ClientProfile {

    let profile: ClientProfile = { id: "", user: null, role: null };

    if(reqUrl){
        profile.id = uuidv4(); // Generate unique identifier
        profile.user = extractDataFromUrl(url.parse(reqUrl as string), "user"); // Extract user name from query params
        profile.role = extractDataFromUrl(url.parse(reqUrl as string), "role"); // Extract user name from query params
    } 

    return profile;

}

function extractDataFromUrl(url: url.UrlWithStringQuery, extractToken: string) : string | null {
    
    let query: string | null = null;

    if(url.query){
        if(url.query.includes(`${extractToken}=`)){
            query = url.query.split(`${extractToken}=`)[1].split("&")[0]; // Split the query param by the extract token, then split it by an ampersand (&), which indicates next query param
        }
    }

    return query;

}

function validateUserProfile(profile: ClientProfile, server: WebSocketServer): ProfileValidation {

    let valid: boolean = true;
    let reason: string = "";

    // Username validation
    if(profile.user){

        // Check username character length
        const maxCharacters: number = 20; // TODO: Update this based on frontend requirements
        const minCharacters: number = 5;
        if(profile.user.length > maxCharacters){
            valid = false;
            reason += "\u2022 Username contains too many characters\n";
        } else if (profile.user.length < minCharacters) {
            valid = false;
            reason += "\u2022 Username contains too few characters\n";
        }

        // Check username does not contain illegal characters
        const illegalRegExp: RegExp = /[/?!@#$%^&*()+\\[\]';:,`~<>=]/g;
        if(illegalRegExp.test(profile.user)){
            valid = false;
            reason += "\u2022 Username contains illegal characters\n";
        }

        // Check to see if username is already being used in the chat room
        let dupes: number = 0;
        server.clients.forEach((c: any)=> {

            if(c.profile.user === profile.user){
                dupes++;
            }

            if(dupes > 1){
                valid = false;
                reason += "\u2022 Username is already being used in this chat room\n";
            }

        })

        // Check to see if username contains spaces
        if(profile.user.split(" ").length > 1){
            valid = false;
            reason += "\u2022 Username cannot contain whitespaces\n"
        }

    } else {
        valid = false;
        reason += "\u2022 Username does not exist\n";
    }

    // User Role validation
    if(profile.role){

        // Check that role conforms to "patient" or "facilitator"
        const role: string = profile.role.toLowerCase();
        if(!(role === "patient" || role === "facilitator")){
            valid = false;
            reason += "\u2022 User does not have a valid role. User must be a 'client' or a 'faciliator'\n";
        }

    } else {
        valid = false;
        reason += "\u2022 Role does not exist\n";
    }

    return { valid: valid, reason: reason }

}

function processServerMessage(message: string) : string {

    return JSON.stringify({ type: "serverMessage", content: message }); // WebSocketCommunication Type

}

function processChatMessage(message: string, client: ClientProfile) : string {

    const diagnosis: Diagnosis = createMessageDiagnosis(message);

    const chatMessageContent: ChatMessageContent = {
        message: diagnosis.analysedMessage,
        keywords: diagnosis.keywords,
        author: client,
        date: new Date(),
        hover: "Add Hover message here"
    }

    if(messageHistory.length > 0){
        calculateTypingSpeed(chatMessageContent); // Use this to generate a Hover message.
    }

    return JSON.stringify({ type: "chatMessage", content: JSON.stringify(chatMessageContent) }); // WebSocketCommunication Type
}

function generateChatTranscript(history: Array<string>){

    const transcriptMessageObjects: Array<TranscriptMessage> = history.map(websocketcomm => {

        const parsedComm: WebSocketCommunication = JSON.parse(websocketcomm);
        const parsedContent: ChatMessageContent = JSON.parse(parsedComm.content);
        const parsedAuthor: { user: string, role: string } = { user: "Hover", role: "server" }

        // Check that author properties exist on parsedContent
        if(parsedContent.author.user){
            parsedAuthor.user = parsedContent.author.user;
        }
        if(parsedContent.author.role){
            parsedAuthor.role = parsedContent.author.role;
        }

        return { messageContent: parsedContent.message, author: parsedAuthor.user, dateSent: parsedContent.date.toLocaleString(), role: parsedAuthor.role }

    })

    generateTranscript(transcriptMessageObjects);

}

function calculateTypingSpeed(currentMessage: ChatMessageContent): number {
    const prevMsg: ChatMessageContent = JSON.parse(JSON.parse(messageHistory[messageHistory.length - 1]).content);

    const prevTypingSpeedMsg: TypingSpeedMessage = { content: prevMsg.message, timestamp: prevMsg.date };
    const currTypingSpeedMsg: TypingSpeedMessage = { content: currentMessage.message, timestamp: currentMessage.date }

    const messageSpeedDetection: number = detectTypingSpeed(prevTypingSpeedMsg, currTypingSpeedMsg);

    return messageSpeedDetection;

    /*
        DetectTypingSpeed returns and int; lets call it "result"

        result is then compared to the current Diagnosis.typingSpeed

        if result is greater than (Diagnosis.typingSpeed + 3)
            then let hover comment know that the given message exhibits anxiety
        else
            dont hover comment

        update Diagnosis.typingSpeed to (Diagnosis.typingSpeed + result)/2  
    */
}

console.log(`Hover Server v1.0 is running on port ${port}`);
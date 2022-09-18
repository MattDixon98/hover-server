
/* TODO: 
    - ASSIGN ALL MESSAGES SENT BY A CLIENT TO THE CLIENT OBJECT FOR TYPING SPEED/MESSAGE SPEED ANALYSIS
    - Broadcast chat room information to clients so they are aware of who they are chatting to.
*/

import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import { ClientProfile } from "./types/ClientProfileType/ClientProfileType";
import { WebSocketCommunication } from "./types/WebSocketCommunicationType/WebSocketCommunicationType";
import { ProfileValidation } from "./types/ProfileValidationType/ProfileValidationType";
import { SocketClosureCodes } from "./types/SocketClosureCodes/SocketClosureCodes";
import { Keyword } from "./types/KeywordType/KeywordType";
import { createMessageDiagnosis } from "./hover_message_diagnosis/message_diagnosis/message-diagnosis";
import { Diagnosis } from "./types/DiagnosisType/DiagnosisType";
import { ChatMessageContent } from "./types/ChatMessageContentType/ChatMessageContentType";
import { generateTranscript } from "./hover_transcript_generator/transcript_generator";
import { TranscriptMessage } from "./types/TranscriptMessageType/TranscriptMessageType";
import { detectTypingSpeed, flagTypingSpeed } from "./hover_detect_typing_speed/DetectTypingSpeed";
import { TypingSpeedMessage } from "./types/TypingSpeedMessageType/TypingSpeedMessageType";
import { generateHoverMessage } from "./hover_generate_hover_message/GenerateHoverMessage";
import { Score } from "./types/ScoreType/ScoreType";
import { TypingSpeedAnalysis } from "./types/TypingSpeedAnalysisType/TypingSpeedAnalysisType";

const MAX_CLIENTS: number = 2;
const port: number = 9000;
const server: WebSocketServer = new WebSocketServer({ port: port });
let users: Array<ClientProfile> = [];
let messageHistory: Array<string> = []; // ChatMessageContent - content: stringified JSON [message: string, keywords: Array<string>, author: ClientProfile, date: Date, hover: HoverMessage[comment: string, score: Score]]

server.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {

    // Create connecting client's profile (id and username)
    const client: any = socket;
    client.profile = getClientProfile(request.url); // ClientProfile type
    
    // Handle an incoming client connection
    if(handleConnection(socket, request, client)){
        sendConnectionMessages(client); // Send messages as a result of incoming client connection
    } else {
        client.close(SocketClosureCodes.INVALID_REQUEST);
    }
    
    // Handle client disconnect
    client.on("close", (code: number, reason: Buffer) => {

        let message: string = "";

        if(messageHistory.length > 0) generateChatTranscript(messageHistory); // Generate chat transcript if there are messages in message history
        messageHistory = []; // Clear message history between clients
        
        if(code !== SocketClosureCodes.INVALID_REQUEST){

            message = `${client.profile.user} has left the chat.`;
            broadcastMessage(server, processServerMessage(message), false, client); // Broadcast message to all clients
            users = users.filter((removedUser: ClientProfile) => { // Remove the user from the global user list
                return removedUser.id !== client.profile.id
            })

            console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has disconnected from the server.`);

        }

    })

    // Handle message reception
    socket.on("message", msg => {

        const receivedMessage: string = processChatMessage(msg.toString(), client.profile);
        broadcastMessage(server, receivedMessage, false, client); // Broadcast message to all clients

    })

})

function handleConnection(socket: WebSocket, request: http.IncomingMessage, client: any) : boolean {

    let error: boolean = false;
    let message: string = "";
    
    // If the client's user profile is not valid, close the current connecting client's connection
    const clientUserProfileValidation: ProfileValidation = validateUserProfile(client.profile, server);
    if(!clientUserProfileValidation.valid){

        message = clientUserProfileValidation.reason + "\n";
        error = true;

    }
    
    // If number of clients exceeds max, close the current connecting client's connection
    if(server.clients.size > MAX_CLIENTS){

        message = `Connection failed: too many clients. This server permits a maximum of ${MAX_CLIENTS} clients at one time.\n`;
        error = true;

    }

    // If chat room already contains one of either facilitator or patient, close the current connecting client's connection
    users.forEach((u: ClientProfile) => {
        if(u.role && (u.role === client.profile.role)){
            error = true;
            message += `Connection failed: a ${client.profile.role} already exists in this room.\n`;
            return;
        }
    })

    // If a username cannot be extracted from the client's query, close the current connecting client's connection
    if(!(client.profile.user && client.profile.role)){

        message += "Connection failed: incorrect query provided. Please provide 'user' and 'role' query parameters in WebSocket request.\n";
        error = true;

    } 

    // Handle connection errors
    if(!error){

        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has connected to the server.`);
        users.push(client.profile); // Add client to the global users list 

    } else { 

        client.send(processServerErrorMessage(message));
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) unsuccessfully attempted to connect to the server.`);

    }
    
    return !error;

}

function sendConnectionMessages(client: any): void {

    const message: string = `${client.profile.user} has joined the chat.`;
    sendWelcomeMessage(client); // Send connecting client a welcome message
    broadcastMessage(server, processServerMessage(message), true, client); // Broadcast server message to clients indicating the newly-joined client has joined
    broadcastMessage(server, processUserDetailsMessage(users), false, client) // Broadcast newly-joined client's details
    
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

    let profile: ClientProfile = { id: "", user: null, role: null, typingSpeed: 0 };

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

function processUserDetailsMessage(clients: Array<ClientProfile>){
    return JSON.stringify({type: "joinedUserDetailsMessage", content: JSON.stringify(clients)}); // User
}

function processServerMessage(message: string) : string {
    return JSON.stringify({ type: "serverMessage", content: message }); // WebSocketCommunication Type
}

function processServerErrorMessage(message: string) : string {
    return JSON.stringify({ type: "serverErrorMessage", content: message});
}

function processChatMessage(message: string, client: ClientProfile) : string {

    const currentDate: Date = new Date();

    const diagnosis: Diagnosis = createMessageDiagnosis(message);

    // If there is more than one message, calculate characters per second between most recently sent message and current message
    let typingSpeed: TypingSpeedAnalysis = { message: "", anx_score: 0, speed: 0 };
    if(messageHistory.length > 0){
        typingSpeed = calculateTypingSpeed({message: message, date: currentDate}, client.id); // Use this to generate a Hover message.
        diagnosis.score.anxiety += typingSpeed.anx_score; // Add typing speed anxiety score to diagnosis anxiety
    }

    console.log("Diagnosis Score", diagnosis.score);

    const chatMessageContent: ChatMessageContent = {
        message: diagnosis.analysedMessage,
        keywords: diagnosis.keywords,
        author: client,
        date: new Date(),
        hover: generateHoverMessage({
            rollingScore: generateRollingScore(client.id, messageHistory),
            newScore: diagnosis.score,
            repetition: diagnosis.repetition,
            correctness: diagnosis.correctness,
            typingSpeed: typingSpeed
        })
    }

    messageHistory.push(JSON.stringify({content: JSON.stringify(chatMessageContent)})); // Add to message history

    return JSON.stringify({ type: "chatMessage", content: JSON.stringify(chatMessageContent) }); // WebSocketCommunication Type
}

function generateRollingScore(clientId: string, history: Array<string>): Score {
    const idScoresArray: Array<{id: string, score: Score}> = [];

    history.forEach((msg: string) => {
        const userIdAndScore: { id: string, score: Score } = { id: "", score: { anxiety: 0, depression: 0, risk: false } };
        const parsedMsg: WebSocketCommunication = JSON.parse(msg);
        if(parsedMsg){
            userIdAndScore.id = JSON.parse(parsedMsg.content).author.id 
            userIdAndScore.score = JSON.parse(parsedMsg.content).hover.score;
        } else return;
        idScoresArray.push(userIdAndScore);
    })

    const filteredIdScores: Array<{id: string, score: Score}> = idScoresArray.filter((idScore: { id: string, score: Score }) => {
        return idScore.id === clientId;
    })

    let finalScore: Score = { anxiety: 0, depression: 0, risk: false };
    filteredIdScores.forEach((idScore: {id: string, score: Score}) => {
        if(idScore.id && idScore.score){
            finalScore.anxiety = finalScore.anxiety + idScore.score.anxiety;
            finalScore.depression = finalScore.depression + idScore.score.depression;
        }
    })

    finalScore.anxiety = finalScore.anxiety / filteredIdScores.length;
    finalScore.depression = finalScore.depression / filteredIdScores.length;

    // console.log("Average anxiety score", finalScore.anxiety);
    // console.log("Average depression score", finalScore.depression);

    return finalScore;
}

function generateChatTranscript(history: Array<string>){

    const transcriptMessageObjects: Array<TranscriptMessage> = history.map(websocketcomm => {

        const parsedComm: WebSocketCommunication = JSON.parse(websocketcomm);
        const parsedContent: ChatMessageContent = JSON.parse(parsedComm.content);
        const parsedAuthor: { user: string, role: string } = { user: "Hover", role: "server" }
        let parsedHoverComment: string = "";
        let parsedMessage: string = "";

        // Check that author properties exist on parsedContent
        if(parsedContent.author.user){
            parsedAuthor.user = parsedContent.author.user;
        }
        if(parsedContent.author.role){
            parsedAuthor.role = parsedContent.author.role;
        }

        // Remove line breaks and commas from Hover comment for CSV format
        if(parsedContent.hover.comment.length > 0){
            parsedHoverComment = parsedContent.hover.comment.replace(/\n/g, " ").replace(/,/g, " ");
        }

        // Remove commas from message and Hover comments for CSV format
        if(parsedContent.message.length > 0){
            parsedMessage = parsedContent.message.replace(/,/g, " ");
        }

        return { messageContent: parsedMessage, author: parsedAuthor.user, dateSent: parsedContent.date.toLocaleString(), role: parsedAuthor.role, hoverComment: parsedHoverComment, messageScore: parsedContent.hover.score }

    })

    generateTranscript(transcriptMessageObjects);

}

function calculateTypingSpeed(current: {message: string, date: Date}, userId: string ): TypingSpeedAnalysis {
    const prevMsg: ChatMessageContent = JSON.parse(JSON.parse(messageHistory[messageHistory.length - 1]).content);

    const prevTypingSpeedMsg: TypingSpeedMessage = { content: prevMsg.message, timestamp: prevMsg.date };
    const currTypingSpeedMsg: TypingSpeedMessage = { content: current.message, timestamp: current.date }

    const messageSpeedDetection: number = detectTypingSpeed(prevTypingSpeedMsg, currTypingSpeedMsg);
    const user: ClientProfile | undefined = users.find((user: ClientProfile) => user.id === userId);
    if(user){
        const flagged: TypingSpeedAnalysis = flagTypingSpeed(user.typingSpeed, messageSpeedDetection, messageHistory);
        user.typingSpeed = flagged.speed; // TODO: Test to make sure this actually detects the global user's typing speed
        return flagged;
    } else {
        return { message: "", anx_score: 0, speed: 0 }
    }
}

console.log(`Hover Server v1.0 is running on port ${port}`);
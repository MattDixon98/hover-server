
/* TODO: 
    - Handle message reception from client. 
        - Send the message to message diagnosis system!!!
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

const MAX_CLIENTS: number = 2;
const port: number = 9000;
const server: WebSocketServer = new WebSocketServer({ port: port });

server.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {

    // Create connecting client's profile (id and username)
    const client: any = socket;
    client.profile = getClientProfile(request.url);

    handleConnection(socket, request, client); // Handle an incoming client connection
    sendConnectionMessages(client); // Send messages as a result of incoming client connection

    // Handle client disconnect
    client.on("close", (code: number, reason: Buffer) => {

        let message: string = "";
        
        if(code !== SocketClosureCodes.INVALID_REQUEST){

            message = `${client.profile.user} has left the chat.`;
            broadcastMessage(server, processServerMessage(message), false, client); // Broadcast message to all clients

            console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has disconnected from the server.`);

        }

    })

    // Handle message reception
    socket.on("message", msg => {

        const receivedMessage: string = processChatMessage(msg.toString(), client.profile);
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

        // Check that role conforms to "client" or "facilitator"
        const role: string = profile.role.toLowerCase();
        if(!(role === "client" || role === "facilitator")){
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

    const chatMessageContent: { message: string, author: ClientProfile, date: Date } = {
        message: message,
        author: client,
        date: new Date()
    }

    return JSON.stringify({ type: "chatMessage", content: JSON.stringify(chatMessageContent) }); // WebSocketCommunication Type
}

console.log(`Hover Server v1.0 is running on port ${port}`);
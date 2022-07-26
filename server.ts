
import WebSocket, { WebSocketServer } from "ws";
import http from "http";
import url from "url";
import { v4 as uuidv4 } from "uuid";
import { ClientProfile } from "./ClientProfileType";

const MAX_CLIENTS: number = 2;
const port: number = 9000;
const server: WebSocketServer = new WebSocketServer({ port: port });

server.on("connection", (socket: WebSocket, request: http.IncomingMessage) => {

    let error: boolean = false;

    // Create connecting client's profile (id and username)
    const client: any = socket;
    client.profile = getClientProfile(request.url);
    
    // If number of clients exceeds max, close the current connecting client's connection
    if(server.clients.size > MAX_CLIENTS){

        client.send(`Connection failed: too many clients. This server permits a maximum of ${MAX_CLIENTS} clients at one time.`);
        client.close();
        error = true;

    }

    // If a username cannot be extracted from the client's query, close the current connecting client's connection
    if(!(client.profile.user && client.profile.role)){

        client.send("Connection failed: incorrect query provided. Please provide 'user' and 'role' query parameters in WebSocket request.");
        client.close();
        error = true;

    } 

    // Handle connection errors
    if(!error) console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has connected to the server.`); 
    else error = false;

    // Send messages
    sendWelcomeMessage(client); // Send connecting client a welcome message
    broadcastMessage(server, `${client.profile.user} has joined the chat.`, true, client); // Broadcast message to all clients except current connecting

    // Handle client disconnect
    client.on("close", (code: number, reason: Buffer) => {

        broadcastMessage(server, `${client.profile.user} has left the chat.`, false, client); // Broadcast message to all clients
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has disconnected from the server.`);

    })

    socket.on("message", msg => {
    })

})

function sendWelcomeMessage(client: any): void {   
    const welcomeMessage: string = `Welcome to the chat, ${client.profile.user}! Hover is ready to go!`;
    client.send(welcomeMessage); // Send message to current connecting client
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

console.log(`Hover Server v1.0 is running on port ${port}`);
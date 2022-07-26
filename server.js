"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const uuid_1 = require("uuid");
const MAX_CLIENTS = 2;
const port = 9000;
const server = new ws_1.WebSocketServer({ port: port });
server.on("connection", (socket, request) => {
    let error = false;
    // Create connecting client's profile (id and username)
    const client = socket;
    client.profile = getClientProfile(request.url);
    // If number of clients exceeds max, close the current connecting client's connection
    if (server.clients.size > MAX_CLIENTS) {
        client.send(`Connection failed: too many clients. This server permits a maximum of ${MAX_CLIENTS} clients at one time.`);
        client.close();
        error = true;
    }
    // If a username cannot be extracted from the client's query, close the current connecting client's connection
    if (!(client.profile.user && client.profile.role)) {
        client.send("Connection failed: incorrect query provided. Please provide 'user' and 'role' query parameters in WebSocket request.");
        client.close();
        error = true;
    }
    // Handle connection errors
    if (!error)
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has connected to the server.`);
    else
        error = false;
    // Send messages
    sendWelcomeMessage(client); // Send connecting client a welcome message
    broadcastMessage(server, `${client.profile.user} has joined the chat.`, true, client); // Broadcast message to all clients except current connecting
    // Handle client disconnect
    client.on("close", (code, reason) => {
        broadcastMessage(server, `${client.profile.user} has left the chat.`, false, client); // Broadcast message to all clients
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has disconnected from the server.`);
    });
    socket.on("message", msg => {
    });
});
function sendWelcomeMessage(client) {
    const welcomeMessage = `Welcome to the chat, ${client.profile.user}! Hover is ready to go!`;
    client.send(welcomeMessage); // Send message to current connecting client
}
function broadcastMessage(server, message, excludeCurrentClient, currentClient) {
    server.clients.forEach((c) => {
        if (excludeCurrentClient) {
            if (c.profile.user !== currentClient.profile.user)
                c.send(message); // Broadcast message to everyone except current connecting client
        }
        else {
            c.send(message);
        }
    });
}
function getClientProfile(reqUrl) {
    let profile = { id: "", user: null, role: null };
    if (reqUrl) {
        profile.id = (0, uuid_1.v4)(); // Generate unique identifier
        profile.user = extractDataFromUrl(url_1.default.parse(reqUrl), "user"); // Extract user name from query params
        profile.role = extractDataFromUrl(url_1.default.parse(reqUrl), "role"); // Extract user name from query params
    }
    return profile;
}
function extractDataFromUrl(url, extractToken) {
    let query = null;
    if (url.query) {
        if (url.query.includes(`${extractToken}=`)) {
            query = url.query.split(`${extractToken}=`)[1].split("&")[0]; // Split the query param by the extract token, then split it by an ampersand (&), which indicates next query param
        }
    }
    return query;
}
console.log(`Hover Server v1.0 is running on port ${port}`);

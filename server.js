"use strict";
/* TODO:
    - Handle message reception from client.
        - Send the message to message diagnosis system.
    - Broadcast chat room information to clients so they are aware of who they are chatting to.
        - Send chat room information as a WebSocketCommunication of type "serverMessage". Broadcast that information everytime something on the server changes.
    - Store chat information in database so that it can be called upon on re-renders.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const url_1 = __importDefault(require("url"));
const uuid_1 = require("uuid");
const SocketClosureCodes_1 = require("./SocketClosureCodes");
const MAX_CLIENTS = 2;
const port = 9000;
const server = new ws_1.WebSocketServer({ port: port });
server.on("connection", (socket, request) => {
    // Create connecting client's profile (id and username)
    const client = socket;
    client.profile = getClientProfile(request.url);
    handleConnection(socket, request, client); // Handle an incoming client connection
    sendConnectionMessages(client); // Send messages as a result of incoming client connection
    // Handle client disconnect
    client.on("close", (code, reason) => {
        let message = "";
        if (code !== SocketClosureCodes_1.SocketClosureCodes.INVALID_REQUEST) {
            message = `${client.profile.user} has left the chat.`;
            broadcastMessage(server, processServerMessage(message), false, client); // Broadcast message to all clients
            console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has disconnected from the server.`);
        }
    });
    // Handle message reception
    socket.on("message", msg => {
        const receivedMessage = processChatMessage(msg.toString(), client.profile);
        broadcastMessage(server, receivedMessage, false, client); // Broadcast message to all clients
    });
});
function handleConnection(socket, request, client) {
    let error = false;
    let message = "";
    // If the client's user profile is not valid, close the current connecting client's connection
    const clientUserProfileValidation = validateUserProfile(client.profile, server);
    if (!clientUserProfileValidation.valid) {
        message = clientUserProfileValidation.reason;
        client.close(SocketClosureCodes_1.SocketClosureCodes.INVALID_REQUEST);
        error = true;
    }
    // If number of clients exceeds max, close the current connecting client's connection
    if (server.clients.size > MAX_CLIENTS) {
        message = `Connection failed: too many clients. This server permits a maximum of ${MAX_CLIENTS} clients at one time.`;
        client.close(SocketClosureCodes_1.SocketClosureCodes.INVALID_REQUEST);
        error = true;
    }
    // If a username cannot be extracted from the client's query, close the current connecting client's connection
    if (!(client.profile.user && client.profile.role)) {
        message = "Connection failed: incorrect query provided. Please provide 'user' and 'role' query parameters in WebSocket request.";
        client.close(SocketClosureCodes_1.SocketClosureCodes.INVALID_REQUEST);
        error = true;
    }
    // Handle connection errors
    if (!error) {
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) has connected to the server.`);
    }
    else {
        client.send(processServerMessage(message));
        error = false;
        console.log(`${client.profile.user} (id: ${client.profile.id}, role: ${client.profile.role}) unsuccessfully attempted to connect to the server.`);
    }
}
function sendConnectionMessages(client) {
    const message = `${client.profile.user} has joined the chat.`;
    sendWelcomeMessage(client); // Send connecting client a welcome message
    broadcastMessage(server, processServerMessage(message), true, client); // Broadcast message to all clients except current connecting
}
function sendWelcomeMessage(client) {
    const welcomeMessage = `Welcome to the chat, ${client.profile.user}! Hover is ready to go!`;
    client.send(processServerMessage(welcomeMessage)); // Send message to current connecting client
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
function validateUserProfile(profile, server) {
    let valid = true;
    let reason = "";
    // Username validation
    if (profile.user) {
        // Check username character length
        const maxCharacters = 20; // TODO: Update this based on frontend requirements
        const minCharacters = 5;
        if (profile.user.length > maxCharacters) {
            valid = false;
            reason += "\u2022 Username contains too many characters\n";
        }
        else if (profile.user.length < minCharacters) {
            valid = false;
            reason += "\u2022 Username contains too few characters\n";
        }
        // Check username does not contain illegal characters
        const illegalRegExp = /[/?!@#$%^&*()+\\[\]';:,`~<>=]/g;
        if (illegalRegExp.test(profile.user)) {
            valid = false;
            reason += "\u2022 Username contains illegal characters\n";
        }
        // Check to see if username is already being used in the chat room
        let dupes = 0;
        server.clients.forEach((c) => {
            if (c.profile.user === profile.user) {
                dupes++;
            }
            if (dupes > 1) {
                valid = false;
                reason += "\u2022 Username is already being used in this chat room\n";
            }
        });
        // Check to see if username contains spaces
        if (profile.user.split(" ").length > 1) {
            valid = false;
            reason += "\u2022 Username cannot contain whitespaces\n";
        }
    }
    else {
        valid = false;
        reason += "\u2022 Username does not exist\n";
    }
    // User Role validation
    if (profile.role) {
        // Check that role conforms to "client" or "facilitator"
        const role = profile.role.toLowerCase();
        if (!(role === "client" || role === "facilitator")) {
            valid = false;
            reason += "\u2022 User does not have a valid role. User must be a 'client' or a 'faciliator'\n";
        }
    }
    else {
        valid = false;
        reason += "\u2022 Role does not exist\n";
    }
    return { valid: valid, reason: reason };
}
function processServerMessage(message) {
    return JSON.stringify({ type: "serverMessage", content: message });
}
function processChatMessage(message, client) {
    const chatMessageContent = {
        message: message,
        author: client,
        date: new Date()
    };
    return JSON.stringify({ type: "chatMessage", content: JSON.stringify(chatMessageContent) });
}
console.log(`Hover Server v1.0 is running on port ${port}`);

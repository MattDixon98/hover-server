import React from "react";
import ChatMessage from "../hov-23/ChatMessage";
import ChatBar from "../hov-24/ChatBar";
import { Message } from "../types/MessageType";
import { ChatWindowProps } from "../types/PropTypes";
import { UserData } from "../types/UserDataType";
 
const CHAT_SERVER_URI: string = "localhost:9000";

function ChatWindow(props: ChatWindowProps){
    
    // Run on first render
    React.useEffect(() => { 
        establishChatServerConnection(props.userData);
    }, [])
    
    // TODO: Make a persistent connection to the WebSockets server to send and receive messages
    function establishChatServerConnection(data: UserData) : void {
        console.log(data);
        console.log("Connection to chat server established.");
    }
    
    // TODO: Receive messages from the WebSockets server via the persistent connection
    function getMessages() : Message {
        return { message: "Test", author: "Test", date: new Date()};
    }

    // TODO: Generate <ChatMessage> components based on data received from the persistent connection
    function generateMessageComponents() : Array<JSX.Element> {
        return [ 
            <ChatMessage 
                profile={{username: "jamierossiter", profilePicSrc: "res/profile_placeholder.jpg"}} 
                message={{message: "I am the composer of the entire composer.", keywords: [
                    { word: "composer", derived: "composer", flag: "depression", position: [3, 7]},
                    { word: "entire", derived: "entire", flag: "risk", position: [6]}
                ]}} 
                timestamp={{time: new Date()}} 
            /> 
        ]
    }

    function testSendMessage(message: string){
        window.alert(`"${message}" sent.`);
    }

    return(
        <>
            <div className="chat-window-message-wall-container">
                {generateMessageComponents()}
            </div>
            <div className="chat-window-chat-bar-container">
                <ChatBar onMessageSend={(message: string) => { testSendMessage(message) }} />    
            </div>
        </>
    )
}

export default ChatWindow;
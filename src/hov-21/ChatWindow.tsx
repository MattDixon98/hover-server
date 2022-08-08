import React from "react";
import ChatMessage from "../hov-23/ChatMessage";
import ChatBar from "../hov-24/ChatBar";
import { Keyword } from "../types/KeywordType";
import { Message } from "../types/MessageType";
import { ChatWindowProps } from "../types/PropTypes";
import { UserData } from "../types/UserDataType";
import "./ChatWindow.css";
 
const CHAT_SERVER_URI: string = "localhost:9000";

function ChatWindow(props: ChatWindowProps){

    const [chatMessages, updateChatMessages] = React.useState<Array<Message>>([]);
    
    // Run once on first render only
    React.useEffect(() => {
         
        const websocket: WebSocket = establishChatServerConnection(props.userData);

        websocket.addEventListener("message", (message: any) => {
            handleIncomingMessage(message.data) // Handle certain messages (e.g. server or chat messages) from the WebSockets server
        })

    }, [])
    
    // Make a persistent connection to the WebSockets server to send and receive messages
    function establishChatServerConnection(data: UserData) : WebSocket {
        return new WebSocket(`ws://${CHAT_SERVER_URI}?user=${data.name}&role=${data.role}`); // WebSockets server expects "user" and "role" query parameters upon establishing a connection
    }
    
    // Format and process incoming messages, then add them to state
    function handleIncomingMessage(incomingMessage: any): void {
        const incomingMessageObj: any = JSON.parse(incomingMessage);
        let formattedMessage: Message;
        
        switch(incomingMessageObj.type){
            case "serverMessage":
                formattedMessage = { message: incomingMessageObj.content, author: "Hover", date: new Date(), chatRole: "server" };
                break;
            case "chatMessage":
                const chatContent: any = JSON.parse(incomingMessageObj.content);
                const chatMessage: string = chatContent.message;
                const chatAuthor: string = chatContent.author.user;
                formattedMessage = { message: chatMessage, author: chatAuthor, date: new Date(), chatRole: "receiver" }
                break;
        }

        updateChatMessages(chatMessages => [...chatMessages, formattedMessage]);
    }

    // Generate <ChatMessage> components based on chat messages in state
    function generateMessageComponents() : Array<JSX.Element> {
        const components: Array<JSX.Element> = chatMessages.map((msg: Message) => {
            return <ChatMessage profile={{username: msg.author, profilePicSrc: "res/profile_placeholder.jpg"}} message={{message: msg.message, keywords: new Array<Keyword>}} timestamp={{time: msg.date}} chatRole={msg.chatRole} />
        })
        return components;
    }

    function testSendMessage(message: string){
        // TODO: SEND MESSAGE TO WEBSOCKETS SERVER AND PERFORM ANALYSIS ON MESSAGE!
    }

    return(
        <>
            <div className="chat-window-main-container">
                <div className="chat-window-message-wall-container">
                    {generateMessageComponents()}
                </div>
                <div className="chat-window-chat-bar-container">
                    <ChatBar onMessageSend={(message: string) => { testSendMessage(message) }} />    
                </div>
            </div>
        </>
    )
}

export default ChatWindow;
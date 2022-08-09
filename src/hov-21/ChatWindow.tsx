import React from "react";
import ChatMessage from "../hov-23/ChatMessage";
import ChatBar from "../hov-24/ChatBar";
import ServerMessage from "../ServerMessageComponent/ServerMessage";
import { Keyword } from "../types/KeywordType";
import { Message } from "../types/MessageType";
import { ChatMessageContentProps, ChatWindowProps } from "../types/PropTypes";
import { UserData } from "../types/UserDataType";
import "./ChatWindow.css";
 
const CHAT_SERVER_URI: string = "localhost:9000";

function ChatWindow(props: ChatWindowProps){

    const [chatMessages, updateChatMessages] = React.useState<Array<Message>>([]);
    const websocket: any = React.useRef(null);
    
    // Run once on first render only
    React.useEffect(() => {
         
        websocket.current = establishChatServerConnection(props.userData);

        websocket.current.addEventListener("message", (message: any) => {
            handleIncomingMessage(message.data) // Handle certain messages (e.g. server or chat messages) from the WebSockets server
        })

        return () => {
            websocket.current.close(); // Cleanup
        }

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
                formattedMessage = { messageContent: incomingMessageObj.content, keywords: null, author: "Hover", date: new Date(), chatRole: "server" };
                break;
            case "chatMessage":
                const chatContent: any = JSON.parse(incomingMessageObj.content);
                const chatMessage: string = chatContent.message;
                const chatKeywords: Array<Keyword> = chatContent.keywords;
                const chatAuthor: string = chatContent.author.user;
                formattedMessage = { messageContent: chatMessage, keywords: chatKeywords, author: chatAuthor, date: new Date(), chatRole: determineChatRole(chatAuthor, props.userData.name) }
                break;
        }

        updateChatMessages(chatMessages => [...chatMessages, formattedMessage]);
    }

    function determineChatRole(author: string, clientUsername: string) : "receiver" | "sender" {
        return author === clientUsername ? "sender" : "receiver";
    }

    // Generate <ChatMessage> components based on chat messages in state
    function generateMessageComponents() : Array<JSX.Element> {
        const components: Array<JSX.Element> = chatMessages.map((msg: Message, index: number) => {
            if(msg.chatRole === "server") return <ServerMessage key={`serverMsg_${index}`} message={msg.messageContent} />
            else return <ChatMessage key={`chatMsg_${index}`} profile={{username: msg.author, profilePicSrc: "res/profile_placeholder.jpg"}} message={{message: msg.messageContent, keywords: msg.keywords ? msg.keywords : new Array<Keyword>()}} timestamp={{time: msg.date}} chatRole={msg.chatRole} />
        })
        return components;
    }

    function testSendMessage(message: string){
        // TODO: SEND MESSAGE TO WEBSOCKETS SERVER AND PERFORM ANALYSIS ON MESSAGE!
        websocket.current.send(message); // Send message to WebSockets server
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
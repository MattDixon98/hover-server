import React from "react";
import ChatWindow from "../hov-21_ChatWindow/ChatWindow";
import { ChatHoverSuperProps } from "../types/PropTypes";
import { UserData } from "../types/UserDataType";

function ChatHoverSuperwindow(props: ChatHoverSuperProps){

    const CHAT_SERVER_URI: string = "localhost:9000";
    const [websocket, updateWebsocket] = React.useState<WebSocket | null>(null);
    
    // Run once on first render only
    React.useEffect(() => { 
        
        if(!websocket){
            updateWebsocket(establishChatServerConnection(props.userData));
        }

        return () => {

            if(websocket){
                websocket.close(); // Cleanup
            }

        }

    }, [])
        
    // Make a persistent connection to the WebSockets server to send and receive messages
    function establishChatServerConnection(data: UserData) : WebSocket {
        return new WebSocket(`ws://${CHAT_SERVER_URI}?user=${data.name}&role=${data.role}`); // WebSockets server expects "user" and "role" query parameters upon establishing a connection
    }

    return(
        <>
            { websocket ? <ChatWindow server={websocket} userData={props.userData} /> : <p>Loading...</p> }
            {/* Add HoverWindow here, and pass the websocket server instance as a prop */}
        </>
    )
}

export default ChatHoverSuperwindow;
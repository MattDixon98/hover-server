import React from "react";
import ChatInput from "../hov-32/ChatInput";
import PositiveButton from "../hov-33/PositiveButton";
import "./ChatBar.css";
import { ChatBarProps } from "../types/PropTypes";

function ChatBar(props: ChatBarProps){
    
    const [chatInputMessage, updateChatInputMessage] = React.useState("");

    function handleInput(value: string) : void {
        updateChatInputMessage(value);
    }

    return(
        <>
            <div className="chat-bar-container">
                <ChatInput onInput={(inpVal: string) => {handleInput(inpVal)}} placeholder="Send a message..." />
                <PositiveButton onSend={() => {props.onMessageSend(chatInputMessage)}} />
            </div>
        </>
    )
}

export default ChatBar;
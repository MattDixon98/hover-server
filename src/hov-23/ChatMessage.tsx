import React from "react";
import ChatMessageProfile from "../hov-29/ChatMessageProfile";
import ChatMessageContent from "../hov-30/ChatMessageContent";
import Timestamp from "../hov-31/Timestamp";
import { ChatMessageProps } from "../types/PropTypes";
import "./ChatMessage.css";

function ChatMessage(props: ChatMessageProps){
    return(
        <>
            <div className="chat-message-chat-message-profile-container">
                <ChatMessageProfile username={props.profile.username} profilePicSrc={props.profile.profilePicSrc} />
            </div>
            <div className="chat-message-chat-message-content-container">
                <ChatMessageContent message={props.message.message} keywords={props.message.keywords} />
            </div>
            <div className="chat-message-timestamp-container">
                <Timestamp time={props.timestamp.time} />
            </div>
        </>
    )
}

export default ChatMessage;
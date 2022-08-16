import React from "react";
import ChatMessageProfile from "../hov-29_ChatMessageProfile/ChatMessageProfile";
import ChatMessageContent from "../hov-30_ChatMessageContent/ChatMessageContent";
import Timestamp from "../hov-31_Timestamp/Timestamp";
import { ChatMessageProps } from "../types/PropTypes";
import "./ChatMessage.css";

function ChatMessage(props: ChatMessageProps){
    return(
        <>
            <div className={`chat-message-container chat-role-${props.chatRole}`}>
                <div className="chat-message-chat-message-profile-container">
                    <ChatMessageProfile username={props.profile.username} profilePicSrc={props.profile.profilePicSrc} />
                </div>
                <div className={`chat-message-chat-message-content-container chat-role-${props.chatRole}`}>
                    <ChatMessageContent message={props.message.message} keywords={props.message.keywords} />
                </div>
                <div className="chat-message-timestamp-container">
                    <Timestamp time={props.timestamp.time} />
                </div>
            </div>
        </>
    )
}

export default ChatMessage;
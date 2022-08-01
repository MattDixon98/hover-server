import React from "react";
import "./ChatMessageProfile.css";

type ChatMessageProfileProps =  {
    username: string,
    profilePicSrc: string
}

function ChatMessageProfile(props: ChatMessageProfileProps) {

    return(
        <>
            <div className="chat-message-profile-container">
                <img className="chat-message-profile-image" src={props.profilePicSrc} alt="Profile" />
                <p className="chat-message-profile-name">{props.username}</p>
            </div>
        </>
    )

}

export default ChatMessageProfile;
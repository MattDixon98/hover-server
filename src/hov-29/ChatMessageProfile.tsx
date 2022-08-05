import React, { CSSProperties } from "react";
import Profile from "../parents/Profile/Profile";

type ChatMessageProfileProps =  {
    username: string,
    profilePicSrc: string
}

function ChatMessageProfile(props: ChatMessageProfileProps) {

    const yPosition: CSSProperties = {top: "-0.8em"};

    return(
        <>
            <Profile name={props.username} profilePicSrc={props.profilePicSrc} yPosition={yPosition} />
        </>
    )

}

export default ChatMessageProfile;
import React, { CSSProperties } from "react";
import Profile from "../parents/Profile/Profile";
import {ChatMessageProfileProps} from "../types/PropTypes";


function ChatMessageProfile(props: ChatMessageProfileProps) {

    const yPosition: CSSProperties = {top: "-0.9em"};

    return(
        <>
            <Profile name={props.username} profilePicSrc={props.profilePicSrc} yPosition={yPosition} />
        </>
    )

}

export default ChatMessageProfile;
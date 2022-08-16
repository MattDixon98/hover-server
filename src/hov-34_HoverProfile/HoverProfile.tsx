import React, { CSSProperties } from "react";
import Profile from "../parents/Profile/Profile";

function HoverProfile(){

    const yPosition: CSSProperties = {top: "-0.5em"};

    return(
        <>
            <Profile name="HOVER" profilePicSrc="res/hover_placeholder.jpg" yPosition={yPosition} />
        </>
    )
}

export default HoverProfile;
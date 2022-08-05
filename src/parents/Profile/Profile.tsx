import React, { CSSProperties } from "react";
import "./Profile.css";

type ProfileProps =  {
    name: string,
    profilePicSrc: string,
    yPosition: CSSProperties
}

function Profile(props: ProfileProps) {

    return(
        <>
            <div className="profile-container">
                <img className="profile-image" src={props.profilePicSrc} alt="Profile" />
                <p className="profile-name" style={props.yPosition}>{props.name}</p>
            </div>
        </>
    )

}

export default Profile;


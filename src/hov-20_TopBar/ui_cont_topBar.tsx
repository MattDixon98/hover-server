import React from "react";

import Logo from "../hov-26_TopBarLogo/ui_sc_logo";
import Profile from "../hov-27_TopBarProfile/ui_sc_profile";
import NegativeButton from "../hov-28_TopBarNegativeButton/ui_sc_negativeButton";

type ProfileProps = {
    img: string,
    name: string
}

function TopBar(props: ProfileProps){
    const [fetchState, fetchStateUpdater] = React.useState(null);

    //Call database, table "posts", search for "1"
    fetch(
    // Replace URL here with actual server
    'https://ubahthebuilder.tech/posts/1'
    )
    // Pass response to JSON
    .then((response) => response.json())
    // Update the "profile" with the JSON stored in "obj"
    .then(obj => {fetchStateUpdater(obj)})

    return(
        <>
            <div>
                <Logo/>
                <Profile img={props.img} name={props.name}/>
                <NegativeButton/>
            </div>
        </>
    )
}

export default TopBar;
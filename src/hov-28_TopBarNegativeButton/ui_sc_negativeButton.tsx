import React from "react";

function NegativeButton() {
    return(
        <button onClick={()=>
            // Replace this with url for drop page
            window.location.reload()
        }>
            End Session
        </button>
    );
}

export default NegativeButton;
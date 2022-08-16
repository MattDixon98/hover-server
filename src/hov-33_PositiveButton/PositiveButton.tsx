import React from "react";
import { PositiveButtonProps } from "../types/PropTypes"
import "./PositiveButton.css";


function PositiveButton(props: PositiveButtonProps) {
        
    return(
        <button className="positive-button-button" onClick={()=> { props.onSend() }}>Send</button>
    );
}

export default PositiveButton;
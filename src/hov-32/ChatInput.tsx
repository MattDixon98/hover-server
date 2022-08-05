import React from "react";
import "./ChatInput.css";

type ChatInputProps = {
    width: number,
    placeholder: string
}

function ChatInput(props: ChatInputProps){

    return(
        <input className="chat-input-text-input" type="text" placeholder={props.placeholder} size={props.width} />
    )

}

export default ChatInput;
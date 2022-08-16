import { Keyword } from "./KeywordType";
import { UserData } from "./UserDataType";

// HOV-21 
export type ChatWindowProps = {
    server: WebSocket,
    userData: UserData
}

// HOV-22
export type HoverWindowProps = {
    server: WebSocket
}

// HOV-23
export type ChatMessageProps = {
    profile: ChatMessageProfileProps,
    message: ChatMessageContentProps,
    timestamp: TimestampProps,
    chatRole: "receiver" | "sender" | "server" // Determines who sent the message for styling purposes
}

// HOV-24
export type ChatBarProps = {
    onMessageSend: Function
}

// HOV-25
export type HoverCommentProps = {
    comment: string,
    time: Date
}

// HOV-29
export type ChatMessageProfileProps =  {
    username: string,
    profilePicSrc: string
}

// HOV-30
export type ChatMessageContentProps = {
    message: string,
    keywords: Array<Keyword> // Keyword = word that has been identified as noteworthy by the Hover Message Diagnosis System,
}

// HOV-31
export type TimestampProps = {
    time: Date
}

// HOV-32
export type ChatInputProps = {
    placeholder: string,
    onInput: Function
}

// HOV-33
export type PositiveButtonProps = {
    onSend: Function
}

// HOV-35
export type HoverCommentContentProps = {
    comment: string // String with HTML that will is parsed by the component
}

// ServerMessage
export type ServerMessageProps = {
    message: string;
}

// ChatHoverSuper
export type ChatHoverSuperProps = {
    userData: UserData
}


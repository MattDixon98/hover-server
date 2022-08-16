// Message Type = represents a message sent by a user in the chat application
// message: the textual content of the message
// author: the name of the user who sent the message
// date: the date at which the message was sent

import { Keyword } from "./KeywordType"
import { ChatMessageContentProps } from "./PropTypes"


export type Message = {
    messageContent: string,
    keywords: Array<Keyword> | null,
    author: string,
    date: Date,
    chatRole: "receiver" | "sender" | "server"
}
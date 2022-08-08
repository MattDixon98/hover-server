// Message Type = represents a message sent by a user in the chat application
// message: the textual content of the message
// author: the name of the user who sent the message
// date: the date at which the message was sent


export type Message = {
    message: string,
    author: string,
    date: Date,
    chatRole: "receiver" | "sender" | "server"
}
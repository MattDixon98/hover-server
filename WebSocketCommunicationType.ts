import { ClientProfile } from "./ClientProfileType"

export type WebSocketCommunication = {
    type: "chatMessage" | "serverMessage",
    content: string
}
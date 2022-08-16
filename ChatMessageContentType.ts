import { ClientProfile } from "./ClientProfileType";
import { Keyword } from "./hover_message_diagnosis/types/KeywordType";

export type ChatMessageContent = { 
    message: string, 
    keywords: Array<Keyword>, 
    author: ClientProfile, 
    date: Date,
    hover: string
}
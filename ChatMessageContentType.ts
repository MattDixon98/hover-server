import { ClientProfile } from "./ClientProfileType";
import { Keyword } from "./KeywordType";

export type ChatMessageContent = { 
    message: string, 
    keywords: Array<Keyword>, 
    author: ClientProfile, 
    date: Date,
    hover: string
}
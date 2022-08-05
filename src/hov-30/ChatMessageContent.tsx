import React from "react";
import DOMPurify from "dompurify";
import { Keyword } from "../types/KeywordType";
import "./ChatMessageContent.css";

type ChatMessageContentProps = {
    message: string,
    keywords: Array<Keyword> // Keyword = word that has been identified as noteworthy by the Hover Message Diagnosis System
}

type HoveredKeywordData = {
    keyword: string | null,
    flag: string | null
}

function ChatMessageContent(props: ChatMessageContentProps){
    
    const [hoveredKeywordData, updateHoveredKeywordData] = React.useState<HoveredKeywordData>({ keyword: null, flag: null });

    // Handle user hovering mouse over Keyword
    function onKeywordHover(e: any) : void {
        
        // Filter the parent <p> element from any processing. Target <span> elements only
        if(e.target.nodeName.toLowerCase() === "span"){

            const keyword: string = e.target.textContent;
            const flag: string = e.target.className.split("chat-message-content-highlight-")[1];
            updateHoveredKeywordData({keyword: keyword, flag: flag}); // Update state with current hovered keyword data

        } else {

            updateHoveredKeywordData({ keyword: null, flag: null }); // If keyword <span> element is unhovered, update state

        }

    }

    // If keyword's parent <p> element is unhovered, update state   
    function onKeywordUnhover(): void {
        updateHoveredKeywordData({ keyword: null, flag: null }); 
    }

    // Takes the original message, then formats it with <span> tags to highlight particular keywords
    function processKeywords(message: string, keywords: Array<Keyword>) : string {
        
        let formattedMessage: string = message;
        
        keywords.forEach((kw: Keyword) => {
            
            // Iterate through each position of the word in case there are duplicates within the message
            if(kw.position){
                kw.position.forEach(pos => {

                    const splitMessage: Array<string> = formattedMessage.split(" ");
                    const targetKeyword: string = splitMessage[pos]; // Find the keyword based on its position in the array
                    const spannedKeyword: string = `<span\nclass="chat-message-content-highlight-${kw.flag}">${targetKeyword}</span>` // Add span tags to targeted keyword, use a line break instead of a whitespace to avoid span tag being split by whitespace

                    splitMessage[pos] = spannedKeyword; // Replace element in array with new keywords with <span> tags
                    formattedMessage = splitMessage.join(" ");

                })
            }

        })

        return formattedMessage;

    }

    return(
        <>
            {/* Parse sanitized text as HTML, permitting the use of the "class" and "onmouseover" attribute within the generated HTML tags */}
            <p onMouseOver={e => {onKeywordHover(e)}} onMouseLeave={onKeywordUnhover} className="chat-message-content-text" dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(processKeywords(props.message, props.keywords), {ADD_ATTR: ["class", "onmouseover"]})
                }} 
            /> 
        </>
    )

}

export default ChatMessageContent;
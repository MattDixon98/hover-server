import React from "react";
import HoverCommentComponent from "../hov-25_HoverComment/HoverComment";
import { HoverComment } from "../types/HoverCommentType";
import { HoverWindowProps } from "../types/PropTypes";

function HoverWindow(props: HoverWindowProps){
    const [hoverComments, updateHoverComments] = React.useState<Array<HoverComment>>([]);

    function generateHoverComment() : Array<JSX.Element> {
        const comments: Array<JSX.Element> = hoverComments.map((hovCom: HoverComment, index: number) => {
            
            return <HoverCommentComponent
                key={`hoverCom_${index}`}
                comment={hovCom.messageContent}
                time={hovCom.date}
            />
        })
        return comments;
    }

    return(
        <>
            <div className="hover-window-window-container">
                <div className="hover-comment-wall-container">
                    {generateHoverComment()}
                </div>
            </div>
        </>
    )
}

export default HoverWindow;
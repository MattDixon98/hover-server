import React from "react";
import HoverProfile from "../hov-34_HoverProfile/HoverProfile";
import Timestamp from "../hov-31_Timestamp/Timestamp";
import HoverCommentContent from "../hov-35_HoverCommentContent/HoverCommentContent";
import "./HoverComment.css";
import { HoverCommentProps } from "../types/PropTypes";

function HoverComment(props: HoverCommentProps){

    return(
        <>
            <div className="hover-comment-container">
                <div className="hover-comment-metadata">
                    <div className="hover-comment-profile">
                        <HoverProfile />
                    </div>
                    <div className="hover-comment-timestamp">
                        <Timestamp time={props.time} />
                    </div>
                </div>

                <div className="hover-comment-content">
                    <HoverCommentContent comment={props.comment} />
                </div>
            </div>
        </>
    )

}

export default HoverComment;
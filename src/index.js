import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatMessageProfile from "./hov-29_ChatMessageProfile/ChatMessageProfile";
import ChatMessageContent from "./hov-30_ChatMessageContent/ChatMessageContent";
import Timestamp from "./hov-31_Timestamp/Timestamp";
import ChatInput from "./hov-32_ChatInput/ChatInput";
import HoverProfile from "./hov-34_HoverProfile/HoverProfile";
import HoverCommentContent from "./hov-35_HoverCommentContent/HoverCommentContent";
import HoverComment from "./hov-25_HoverComment/HoverComment";
import ChatMessage from "./hov-23_ChatMessage/ChatMessage";
import ChatBar from "./hov-24_ChatBar/ChatBar";
import ChatWindow from "./hov-21_ChatWindow/ChatWindow";
import ChatHoverSuperwindow from "./ChatHoverSuperwindow/ChatHoverSuperwindow";

const keywords = [
  { word: "composer", derived: "composer", flag: "depression", position: [3, 7]},
  { word: "entire", derived: "entire", flag: "risk", position: [6]}
]

const hoverComment = "<p>Patient may be displaying signs of anxiety. Please use the <a href='https://google.com' target='_blank'>following service</a> to research anxiety mitigation techniques.</p>"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    {/* <ChatMessageProfile username="jamierossiter" profilePicSrc="res/profile_placeholder.jpg" /> */}
    {/* <ChatMessageContent message="I am the composer of the entire composer." keywords={keywords} /> */}
    {/* <Timestamp time={new Date()} /> */}
    {/* <ChatInput placeholder="Enter your text here" width={50} /> */}
    {/* <HoverProfile /> */}
    {/* <HoverCommentContent comment="<p>Hello <a href='https://www.google.com' alt='A link'>World!</a></p>" /> */}
    {/* <HoverComment comment={hoverComment} time={new Date()} /> */}
    {/* <ChatMessage 
      profile={{username: "jamierossiter", profilePicSrc: "res/profile_placeholder.jpg"}} 
      message={{message: "I am the composer of the entire composer.", keywords: keywords}} 
      timestamp={{time: new Date()}}
    /> */}
    {/* <ChatBar /> */}
    {/* <ChatWindow userData={{ role: "facilitator", name: "jamierossiter", email: "jimjams123@gmail.com" }} /> */}
    <ChatHoverSuperwindow userData={{ role: "facilitator", name: "jamierossiter", email: "jimjams123@gmail.com" }} />
  </>
);

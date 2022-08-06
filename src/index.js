import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatMessageProfile from "./hov-29/ChatMessageProfile";
import ChatMessageContent from "./hov-30/ChatMessageContent";
import Timestamp from "./hov-31/Timestamp";
import ChatInput from "./hov-32/ChatInput";
import HoverProfile from "./hov-34/HoverProfile";
import HoverCommentContent from "./hov-35/HoverCommentContent";
import HoverComment from "./hov-25/HoverComment";
import ChatMessage from "./hov-23/ChatMessage";
import ChatBar from "./hov-24/ChatBar";
import ChatWindow from "./hov-21/ChatWindow";

const keywords = [
  { word: "composer", derived: "composer", flag: "depression", position: [3, 7]},
  { word: "entire", derived: "entire", flag: "risk", position: [6]}
]

const hoverComment = "<p>Patient may be displaying signs of anxiety. Please use the <a href='https://google.com' target='_blank'>following service</a> to research anxiety mitigation techniques.</p>"

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
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
    <ChatWindow userData={{ role: "facilitator", name: "jimjams", email: "jimjams123@gmail.com" }} />
  </React.StrictMode>
);

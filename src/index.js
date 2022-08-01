import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatMessageProfile from "./hov-29/ChatMessageProfile";
import ChatMessageContent from "./hov-30/ChatMessageContent";

const keywords = [
  { word: "composer", derived: "composer", flag: "depression", position: [3, 7]},
  { word: "entire", derived: "entire", flag: "risk", position: [6]},
  { word: "am", derived: "am", flag: "anxiety", position: [1]}
]

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <ChatMessageProfile username="jamierossiter" profilePicSrc="res/profile-placeholder.jpg" /> */}
    <ChatMessageContent message="I am the composer of the entire composer." keywords={keywords} />
  </React.StrictMode>
);

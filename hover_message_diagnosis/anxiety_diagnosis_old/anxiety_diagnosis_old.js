"use strict";
// /* TODO: 
//     - Add lemmetisation
//     - Add synonym generator
//     - Add spell check
//     - Add abbreviation/slang detection
//     - Fetch anxiety word list from text file
// */
// /* -- Imports -- */
// import Sentiment = require("sentiment");
// // import { lemmatizer } from "lemmatizer";
// import { Diagnosis } from "../DiagnosisType";
// /* -- Initialise Sentiment library -- */
// const options: Sentiment.SentimentOptions = {
//     extras: {
//         "edge": -3, // Assign custom values to certain words, good for making negative anxiety-related words more severe than standard negative words
//         "overthink": -3
//     }
// }
// const sentiment: Sentiment = new Sentiment();
// /* -- List of key anxiety words - this should be fetched from a text document or something. Expand so that each word is lemmefied, synonymed, etc. -- */
// const anxietyWordList: Array<string> = [
//     "worry",
//     "overthink",
//     "scared",
//     "nervous",
//     "edge"
// ]
// /* -- Message Analysis -- */
// let exampleMessage: string = "i always overthink things. i'm constantly on edge";
// let analysisResult: Sentiment.AnalysisResult = sentiment.analyze(exampleMessage, options);
// /* Populate diagnosis object */
// let diagnosis: Diagnosis = {
//     analysedMessage: exampleMessage,
//     isDiagnosed: analyseAnxiety(analysisResult.score, filterAnxietyWords(analysisResult.words)),
//     score: analysisResult.score,
//     keywords: filterAnxietyWords(analysisResult.words)
// }
// console.log(diagnosis); // Present diagnosis object
// /* -- Analysis Functions -- */
// /* Determine whether message displays signs of anxiety */
// function analyseAnxiety(score: number, anxietyKeywords: Array<string>): boolean {
//     // Compare score
//     if(score > 0) return false;
//     // Compare word list to words in message
//     if(anxietyKeywords.length === 0) return false;
//     // Message displays signs of anxiety if all checks pass
//     return true;
// }
// /* Filter keywords based on the anxiety word list */
// function filterAnxietyWords(keywords: Array<string>){
//     return keywords.filter(keyword => { return anxietyWordList.indexOf(keyword) >= 0});
// }

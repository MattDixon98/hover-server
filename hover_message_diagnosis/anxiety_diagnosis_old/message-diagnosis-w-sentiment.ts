// // /* TODO: 
// //     - Add abbreviation/slang detection
// // */

// import Sentiment = require("sentiment");
// import { Diagnosis } from "./DiagnosisType";
// import * as fs from "fs";
// const pos = require("pos");
// const lemmatize = require("wink-lemmatizer");
// const synonyms = require("synonyms");
// const spellchecker = require("simple-spellchecker");

// // Options for the Sentiment object, passed as a constructor argument
// const sentimentOptions: Sentiment.SentimentOptions = {
//     extras: {
//         "social anxiety": -3, // Assign custom values to certain words, good for making negative anxiety-related words more severe than standard negative words
//     }
// }
// const sentiment: Sentiment = new Sentiment();

// // Create POS tagger, for determining if words are nouns, adjectives or verbs
// const tagger: any = new pos.Tagger();

// // Create an array (list) of words from a text file
// function createWordListFromFile(filePath: string): Array<string> {
//     let file = fs.readFileSync(filePath);
//     const list: Array<string> = file.toString("utf-8").split("\n");
//     return list;
// }

// // Analyse the message and return a "Diagnosis" object
// export function createMessageDiagnosis(message: string, diagnosisType: string): Diagnosis {

//     const wordList: Array<string> = createWordListFromFile(`${diagnosisType}_wordlist_lemmatized.txt`); // Word list of anxiety or depression words
//     const sentimentAnalysis: Sentiment.AnalysisResult = sentiment.analyze(message); // Perform sentiment analysis on message
    
//     const spellCheck: Array<string> = spellCheckMessage(message); // Perform spell check on original message (not keywords)
//     const spellCheckedList: Array<string> = sentimentAnalysis.words.concat(spellCheck); // Combine spell checked words with words gathered from sentiment analysis

//     const keywordList: Array<string> = filterSentimentAnalysisWordsBasedOnWordList(spellCheckedList, wordList); // Keywords that indicate anxiety or depression
    
//     const messageDiagnosis: Diagnosis = {
//         analysedMessage: message,
//         isDiagnosed: isMessageDiagnosed(sentimentAnalysis.score, keywordList),
//         // score: sentimentAnalysis.score,
//         keywords: keywordList
//     }

//     return messageDiagnosis;

// }

// // Determine if the message contains words that potentially indicate depression or anxiety
// function isMessageDiagnosed(score: number, keywords: Array<string>): boolean {
//     // Compare score - anything over 0 is considered positive
//     if(score > 0) return false;
//     // Compare word list to words in message - no matches means no words can be used to diagnose the message as depressed or anxious
//     if(keywords.length === 0) return false;
//     // Message is diagnosed as depressed or anxious
//     return true;
// }

// // Filter words found in sentiment analysis and compare them to words in the anxiety or depression word list
// function filterSentimentAnalysisWordsBasedOnWordList(sentimentAnalysisWords: Array<string>, wordList: Array<string>): Array<string> {

//     const wordListPosForLemm: Array<Array<string>> = getWordPosInWordList(sentimentAnalysisWords);
//     console.log(sentimentAnalysisWords);
//     const wordListLemmatized: Array<string> = lemmatizeWordList(wordListPosForLemm); // Lemmatize words from sentiment analysis 
//     console.log("Lemmatized Word list", wordListLemmatized);

//     const wordListPosForSyno: Array<Array<string>> = getWordPosInWordList(wordListLemmatized); 
//     const wordListSynonymized: Array<string> = synonymizeWordList(wordListPosForSyno); // Synonymize lemmatized sentiment analysis words
//     console.log("Synonymized Word list", wordListSynonymized);

//     const amalgamatedWordList: Array<string> = wordListLemmatized.concat(wordListSynonymized); // Combine the lemmatized and synonymized word lists together
//     const wordListOptimised: Array<string> = [...new Set(amalgamatedWordList)]; // Use an ES6 Set to remove any duplicates, making the word list "optimised"
//     console.log("Optimised Word list", wordListOptimised);

//     return wordListOptimised.filter((word: string) => { return wordList.indexOf(word) >= 0});
// }

// // Take a list of words, determine their POS (part of speech e.g. adjective, noun, verb) and lemmatize accordingly
// function lemmatizeWordList(wordListPos: Array<Array<string>>): Array<string> {

//     const lemmatized: Array<string> = [];
    
//     wordListPos.forEach(wordPos => {

//         const wordPosTagInitial: { word: string, tagInitial: string } = getWordPosTagInitial(wordPos);

//         switch(wordPosTagInitial.tagInitial){
//             case "V" || "R": // Verb or Adverb
//                 lemmatized.push(lemmatize.verb(wordPosTagInitial.word));
//                 break;
//             case "N": // Noun
//                 lemmatized.push(lemmatize.noun(wordPosTagInitial.word));
//                 break;
//             case "J": // Adjective
//                 lemmatized.push(lemmatize.adjective(wordPosTagInitial.word));
//                 break;
//             default:
//                 lemmatized.push(lemmatize.noun(wordPosTagInitial.word));
//         }

//     })

//     return lemmatized;
// }

// function getWordPosInWordList(wordList: Array<string>): Array<Array<string>> {
//     return tagger.tag(wordList);
// }

// function getWordPosTagInitial(wordPos: Array<string>): { word: string, tagInitial: string } {
//     return { 
//         word: wordPos[0], // Get actual word
//         tagInitial: wordPos[1][0] // Get initial letter of tag. This will denote its status as noun, verb or adjective.
//     }
// }

// // Take a list of lemmatized words and synonymize them
// function synonymizeWordList(wordListPos: Array<Array<string>>): Array<string> {

//     const synonymized: Array<string> = [];

//     wordListPos.forEach(wordPos => {
        
//         const wordPosTagInitial: { word: string, tagInitial: string } = getWordPosTagInitial(wordPos);

//         switch(wordPosTagInitial.tagInitial){
//             case "V": // Verb or Adverb
//                 synonyms(wordPosTagInitial.word, "v")?.forEach((synonym: string, index: number) => {
//                     synonymized.push(synonym);
//                 })
//                 break;
//             case "N": // Noun
//                 synonyms(wordPosTagInitial.word, "n")?.forEach((synonym: string, index: number) => {
//                     synonymized.push(synonym);
//                 })
//                 break;
//             case "J": // Adjective
//                 synonyms(wordPosTagInitial.word, "s")?.forEach((synonym: string, index: number) => {
//                     synonymized.push(synonym);
//                 })
//                 break;
//         }

//     })

//     return synonymized;

// }

// // Check the originally analysed message (not keywords) for any spelling errors, then return suggestions
// export function spellCheckMessage(message: string): Array<string> {

//     const individualWords: Array<string> = message.split(" ");
//     let suggestions: Array<string> = [];

//     const dictionary = spellchecker.getDictionarySync("en-GB");

//     individualWords.forEach(word => {

//         if(!dictionary.spellCheck(word)){

//             dictionary.getSuggestions(word).forEach( (sugg: any) => suggestions.push(sugg) );

//         }

//     })

//     return suggestions;
// }


/* TODO: 
*/

import { Diagnosis } from "../../types/DiagnosisType/DiagnosisType";
import { Keyword } from "../../types/KeywordType/KeywordType";
import { TagInitial } from "../../types/TagInitialType/TagInitialType";
import { WordLists } from "../../types/WordListsType/WordListsType";
import * as fs from "fs";
import { Score } from "../../types/ScoreType/ScoreType";
const pos = require("pos");
const lemmatize = require("wink-lemmatizer");
const synonyms = require("synonyms");
const spellchecker = require("simple-spellchecker");
import { stringCorrectness } from "../../hover_string_correctness/string-correctness";
import { analyseRepetition } from "../../hover_repetition_analysis/RepetitionAnalysis";

// Create POS tagger, for determining if words are nouns, adjectives or verbs
const tagger: any = new pos.Tagger();

// Create an array (list) of words with ratings from a text file
function createWordRatingListFromFile(filePath: string): Array<[string, number]> {
    let file = fs.readFileSync(filePath);
    const list: Array<string> = file.toString("utf-8").split("\n");
    const formattedList: Array<[string, number]> = [];
    list.forEach((wordAndRating: string) => {
        if(!(wordAndRating.trim().length > 0)){
            return;
        }
        const split: Array<string> = wordAndRating.split(":");
        const word = split[0].trim();
        const rating = parseInt(split[1].trim());
        formattedList.push([word, rating]);
    })
    return formattedList;
}

function createWordListFromFile(filePath: string): Array<string> {
    let file = fs.readFileSync(filePath);
    const list: Array<string> = file.toString("utf-8").split("\n");
    return list;
}

// Analyse the message and return a "Diagnosis" object
export function createMessageDiagnosis(message: string):  Diagnosis {

     // List of words extracted from external text files containing categories of words
    const externalWordLists: WordLists = {
        anxiety: createWordRatingListFromFile("./hover_message_diagnosis/wordlists/anxiety_wordlist.txt"),
        depression: createWordRatingListFromFile("./hover_message_diagnosis/wordlists/depression_wordlist.txt"),
        risk: createWordRatingListFromFile("./hover_message_diagnosis/wordlists/risk_wordlist.txt")
    }

    const tokenizedMessage: Array<Keyword> = tokenizeMessage(message); // Split the message into indiviual "tokens" that take the form of Keyword types

    const spellCheckedTokens: Array<Keyword> = tokenizedMessage.concat(spellCheckMessage(tokenizedMessage)); // Concatenate the tokenized message with spellcheck suggestions and perform spell check on original message (not keywords)

    const optimisedTokens: Array<Keyword> = optimiseTokens(spellCheckedTokens); // Lemmatized and synonymized list of keywords
    const finalisedTokens: Array<Keyword> = finaliseTokens(optimisedTokens, externalWordLists, message); // Filter tokens based on external word lists, flag tokens with "anxiety", "depression", "risk" and assign positions of tokens based on original message

    return {
        analysedMessage: message,
        keywords: finalisedTokens,
        repetition: analyseRepetition(message),
        score: calculateMessageScore(finalisedTokens),
        correctness: parseFloat(stringCorrectness(message))
    };

}

// Tokenize the message by separating it into individual words
function tokenizeMessage(message: string): Array<Keyword> {

    const tokenized = removeStopwords(message.toLowerCase().split(" "));
    return tokenized.map(word => {
        let token: Keyword = { word: word, score: 0, derived: word, flag: null, position: null };
        return token;
    })
    
}

// Get the position of a particular token within an original message, returns an array of tuples in case of duplicate tokens
// function getTokenPositionInMessage(token: string, message: string): Array<[ number, number ]> {

//     let positions: Array<[number, number]> = []; // index 0 = start pos, index 1 = end pos
//     let index: number = message.indexOf(token);

//     while(index !== -1){
//         positions.push([index + 1, index + token.length]);
//         index = message.indexOf(token, index + 1);
//     }

//     return positions;

// }

function getTokenPositionInMessage(token: string, message: string): Array<number> {

    let positions: Array<number> = [];
    let splitMessage: Array<string> = message.split(" ");

    splitMessage.forEach((word: string, index: number) => {
        if(word === token) positions.push(index);
    })

    return positions;
    
}

// Remove stop words (e.g. i, you, me) from a tokenized message
function removeStopwords(tokenizedMessage: Array<string>): Array<string>{

    const stopwordsList: Array<string> = createWordListFromFile("./hover_message_diagnosis/wordlists/stopwords.txt");
    return tokenizedMessage.filter(token => { return !stopwordsList.includes(token) })

}

// Lemmatize and synonymize all analysis words
function optimiseTokens(analysisWords: Array<Keyword>): Array<Keyword> {

    const keywordListPosForLemm: Array<[Keyword, string]> = getWordPosInKeywordList(analysisWords);

    const keywordListLemmatized: Array<Keyword> = lemmatizeKeywordList(keywordListPosForLemm); // Lemmatize words from analysis

    const keywordListPosForSyno: Array<[Keyword, string]> = getWordPosInKeywordList(keywordListLemmatized); 
    const keywordListSynonymized: Array<Keyword> = synonymizeKeywordList(keywordListPosForSyno); // Synonymize lemmatized analysis words

    const amalgamatedWordList: Array<Keyword> = keywordListLemmatized.concat(keywordListSynonymized); // Combine the lemmatized and synonymized word lists together
    const keywordListOptimised: Array<Keyword> = removeDuplicatesFromKeywordList(amalgamatedWordList); // Remove duplicates

    return keywordListOptimised;

}

// Filter tokens based on word lists, flag them appropriately (anxiety, depression, risk) and assign their positions based on original message
function finaliseTokens(tokens: Array<Keyword>, wordLists: WordLists, message: string) : Array<Keyword> {

    let tokenFlags: Array<Keyword> = [];
    const lists: Array<[string, Array<[string, number]>]> = Object.entries(wordLists); // This is an array of tuples, with each tuple containing [ word list name, word list contents ]

    tokens.forEach((tok: Keyword) => {

        lists.forEach((list: [string, Array<[string, number]>]) => {

            const listKey: string = list[0];
            const listValue: Array<[string, number]> = list[1];

            listValue.forEach((value: [string, number]) => {
                if(value[0] == tok.word){
                    tokenFlags.push({word: tok.word, score: value[1], flag: listKey, derived: tok.derived, position: getTokenPositionInMessage(tok.derived, message)});
                }
                
            })

        })

    })

    return tokenFlags;

}

// Removes all duplicates from a list/array of Keyword types
function removeDuplicatesFromKeywordList(list: Array<Keyword>): Array<Keyword> {

    return list.filter((keyword: Keyword, index: number, self: Array<Keyword>) => {

        return index === self.findIndex((k) => (
            k.word === keyword.word && k.derived === keyword.derived
        ))

    })

}

// Take a list of words, determine their POS (part of speech e.g. adjective, noun, verb) and lemmatize accordingly
function lemmatizeKeywordList(wordListPos: Array<[Keyword, string]>): Array<Keyword> {

    const lemmatized: Array<string> = [];
    
    wordListPos.forEach(wordPos => {

        const wordPosTagInitial: TagInitial = getWordPosTagInitial(wordPos);

        switch(wordPosTagInitial.initial){
            case "V" || "R": // Verb or Adverb
                lemmatized.push(lemmatize.verb(wordPosTagInitial.word));
                break;
            case "N": // Noun
                lemmatized.push(lemmatize.noun(wordPosTagInitial.word));
                break;
            case "J": // Adjective
                lemmatized.push(lemmatize.adjective(wordPosTagInitial.word));
                break;
            default:
                lemmatized.push(lemmatize.noun(wordPosTagInitial.word));
        }

    })

    return wordListPos.map((pos: [Keyword, string], index: number) => { // Convert Array[Keyword, string] tuple into lemmatized Array<Keyword> 
        pos[0].word = lemmatized[index];
        return pos[0];
    })

}

function getWordPosInKeywordList(list: Array<Keyword>): Array<[Keyword, string]> {
    const rawWordList: Array<string> = list.map(item => { return item.word }) // Extract raw words from Keyword type
    const taggedWordList: Array<Array<string>> = tagger.tag(rawWordList); // Tag POS
    const keywordWordList: Array<[Keyword, string]> = []; // Create a tuple that holds a Keyword type and an array of strings

    list.forEach((keyword: Keyword, index: number) => {
        keywordWordList.push([keyword, taggedWordList[index][1]]); // Push the original keyword 
    })

    return keywordWordList;
}

function getWordPosTagInitial(wordPos: [Keyword, string]): TagInitial {
    return { 
        word: wordPos[0].word, // Get actual word
        initial: wordPos[1][0] // Get initial letter of tag. This will denote its status as noun, verb or adjective.
    } 
}

// Take a list of lemmatized words and synonymize them
function synonymizeKeywordList(wordListPos: Array<[Keyword, string]>): Array<Keyword> {

    const synonymized: Array<Keyword> = [];

    wordListPos.forEach(wordPos => {
        
        const wordPosTagInitial: TagInitial = getWordPosTagInitial(wordPos);

        switch(wordPosTagInitial.initial){
            case "V": // Verb or Adverb
                synonyms(wordPosTagInitial.word, "v")?.forEach((synonym: string) => {
                    synonymized.push(
                        {
                            word: synonym,
                            score: 0,
                            derived: wordPos[0].derived, // The derived word is the word that was in the original message,
                            flag: null,
                            position: wordPos[0].position
                        }
                    );
                })
                break;
            case "N": // Noun
                synonyms(wordPosTagInitial.word, "n")?.forEach((synonym: string) => {
                    synonymized.push(
                        {
                            word: synonym,
                            score: 0,
                            derived: wordPos[0].derived, // The derived word is the word that was in the original message
                            flag: null,
                            position: wordPos[0].position 
                        }
                    );
                })
                break;
            case "J": // Adjective
                synonyms(wordPosTagInitial.word, "s")?.forEach((synonym: string) => {
                    synonymized.push(
                        {
                            word: synonym,
                            score: 0,
                            derived: wordPos[0].derived, // The derived word is the word that was in the original message
                            flag: null,
                            position: wordPos[0].position
                        }
                    );
                })
                break;
        }

    })

    return synonymized;

}

// Check the originally analysed message (not keywords) for any spelling errors, then return suggestions
function spellCheckMessage(tokenizedMessage: Array<Keyword>): Array<Keyword> {

    let suggestions: Array<Keyword> = [];

    const dictionary = spellchecker.getDictionarySync("en-GB");

    tokenizedMessage.forEach(token => {

        if(!dictionary.spellCheck(token.word)){

            dictionary.getSuggestions(token.word).forEach( (sugg: any) => { 
                let keyword: Keyword = { word: sugg, score: 0, derived: token.word, flag: null, position: token.position };
                suggestions.push(keyword); 
            });
    
        }

    })

    return suggestions;
}

function calculateMessageScore(tokens: Array<Keyword>): Score {
    const finalScore: Score = {anxiety: 0, depression: 0, risk: false};
    tokens.forEach((tok: Keyword) => {
        if(tok.flag){
            
            if((tok.flag === "anxiety" || tok.flag === "depression")){
                finalScore[tok.flag] += tok.score;
            }

            if(tok.flag === "risk"){
                finalScore["risk"] = true;
            }

        }
    })
    return finalScore;
}


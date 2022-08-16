"use strict";
/* TODO:
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageDiagnosis = void 0;
const fs = __importStar(require("fs"));
const pos = require("pos");
const lemmatize = require("wink-lemmatizer");
const synonyms = require("synonyms");
const spellchecker = require("simple-spellchecker");
const string_correctness_1 = require("../string_correctness/string-correctness");
// Create POS tagger, for determining if words are nouns, adjectives or verbs
const tagger = new pos.Tagger();
// Create an array (list) of words with ratings from a text file
function createWordRatingListFromFile(filePath) {
    let file = fs.readFileSync(filePath);
    const list = file.toString("utf-8").split("\n");
    const formattedList = [];
    list.forEach((wordAndRating) => {
        if (!(wordAndRating.trim().length > 0)) {
            return;
        }
        const split = wordAndRating.split(":");
        const word = split[0].trim();
        const rating = parseInt(split[1].trim());
        formattedList.push([word, rating]);
    });
    return formattedList;
}
function createWordListFromFile(filePath) {
    let file = fs.readFileSync(filePath);
    const list = file.toString("utf-8").split("\n");
    return list;
}
// Analyse the message and return a "Diagnosis" object
function createMessageDiagnosis(message) {
    // List of words extracted from external text files containing categories of words
    const externalWordLists = {
        anxiety: createWordRatingListFromFile("./hover_message_diagnosis/wordlists/anxiety_wordlist.txt"),
        depression: createWordRatingListFromFile("./hover_message_diagnosis/wordlists/depression_wordlist.txt"),
        risk: createWordRatingListFromFile("./hover_message_diagnosis/wordlists/risk_wordlist.txt")
    };
    const tokenizedMessage = tokenizeMessage(message); // Split the message into indiviual "tokens" that take the form of Keyword types
    const spellCheckedTokens = tokenizedMessage.concat(spellCheckMessage(tokenizedMessage)); // Concatenate the tokenized message with spellcheck suggestions and perform spell check on original message (not keywords)
    const optimisedTokens = optimiseTokens(spellCheckedTokens); // Lemmatized and synonymized list of keywords
    const finalisedTokens = finaliseTokens(optimisedTokens, externalWordLists, message); // Filter tokens based on external word lists, flag tokens with "anxiety", "depression", "risk" and assign positions of tokens based on original message
    return {
        analysedMessage: message,
        keywords: finalisedTokens,
        repetition: analyseRepetition(tokenizedMessage),
        score: calculateMessageScore(finalisedTokens),
        correctness: (0, string_correctness_1.stringCorrectness)(message)
    };
}
exports.createMessageDiagnosis = createMessageDiagnosis;
// Tokenize the message by separating it into individual words
function tokenizeMessage(message) {
    const tokenized = removeStopwords(message.toLowerCase().split(" "));
    return tokenized.map(word => {
        let token = { word: word, score: 0, derived: word, flag: null, position: null };
        return token;
    });
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
function getTokenPositionInMessage(token, message) {
    let positions = [];
    let splitMessage = message.split(" ");
    splitMessage.forEach((word, index) => {
        if (word === token)
            positions.push(index);
    });
    return positions;
}
// Remove stop words (e.g. i, you, me) from a tokenized message
function removeStopwords(tokenizedMessage) {
    const stopwordsList = createWordListFromFile("./hover_message_diagnosis/wordlists/stopwords.txt");
    return tokenizedMessage.filter(token => { return !stopwordsList.includes(token); });
}
// Lemmatize and synonymize all analysis words
function optimiseTokens(analysisWords) {
    const keywordListPosForLemm = getWordPosInKeywordList(analysisWords);
    const keywordListLemmatized = lemmatizeKeywordList(keywordListPosForLemm); // Lemmatize words from analysis
    const keywordListPosForSyno = getWordPosInKeywordList(keywordListLemmatized);
    const keywordListSynonymized = synonymizeKeywordList(keywordListPosForSyno); // Synonymize lemmatized analysis words
    const amalgamatedWordList = keywordListLemmatized.concat(keywordListSynonymized); // Combine the lemmatized and synonymized word lists together
    const keywordListOptimised = removeDuplicatesFromKeywordList(amalgamatedWordList); // Remove duplicates
    return keywordListOptimised;
}
// Filter tokens based on word lists, flag them appropriately (anxiety, depression, risk) and assign their positions based on original message
function finaliseTokens(tokens, wordLists, message) {
    let tokenFlags = [];
    const lists = Object.entries(wordLists); // This is an array of tuples, with each tuple containing [ word list name, word list contents ]
    tokens.forEach((tok) => {
        lists.forEach((list) => {
            const listKey = list[0];
            const listValue = list[1];
            listValue.forEach((value) => {
                if (value[0] == tok.word) {
                    tokenFlags.push({ word: tok.word, score: value[1], flag: listKey, derived: tok.derived, position: getTokenPositionInMessage(tok.derived, message) });
                }
            });
        });
    });
    return tokenFlags;
}
// Removes all duplicates from a list/array of Keyword types
function removeDuplicatesFromKeywordList(list) {
    return list.filter((keyword, index, self) => {
        return index === self.findIndex((k) => (k.word === keyword.word && k.derived === keyword.derived));
    });
}
// Take a list of words, determine their POS (part of speech e.g. adjective, noun, verb) and lemmatize accordingly
function lemmatizeKeywordList(wordListPos) {
    const lemmatized = [];
    wordListPos.forEach(wordPos => {
        const wordPosTagInitial = getWordPosTagInitial(wordPos);
        switch (wordPosTagInitial.initial) {
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
    });
    return wordListPos.map((pos, index) => {
        pos[0].word = lemmatized[index];
        return pos[0];
    });
}
function getWordPosInKeywordList(list) {
    const rawWordList = list.map(item => { return item.word; }); // Extract raw words from Keyword type
    const taggedWordList = tagger.tag(rawWordList); // Tag POS
    const keywordWordList = []; // Create a tuple that holds a Keyword type and an array of strings
    list.forEach((keyword, index) => {
        keywordWordList.push([keyword, taggedWordList[index][1]]); // Push the original keyword 
    });
    return keywordWordList;
}
function getWordPosTagInitial(wordPos) {
    return {
        word: wordPos[0].word,
        initial: wordPos[1][0] // Get initial letter of tag. This will denote its status as noun, verb or adjective.
    };
}
// Take a list of lemmatized words and synonymize them
function synonymizeKeywordList(wordListPos) {
    const synonymized = [];
    wordListPos.forEach(wordPos => {
        var _a, _b, _c;
        const wordPosTagInitial = getWordPosTagInitial(wordPos);
        switch (wordPosTagInitial.initial) {
            case "V": // Verb or Adverb
                (_a = synonyms(wordPosTagInitial.word, "v")) === null || _a === void 0 ? void 0 : _a.forEach((synonym) => {
                    synonymized.push({
                        word: synonym,
                        score: 0,
                        derived: wordPos[0].derived,
                        flag: null,
                        position: wordPos[0].position
                    });
                });
                break;
            case "N": // Noun
                (_b = synonyms(wordPosTagInitial.word, "n")) === null || _b === void 0 ? void 0 : _b.forEach((synonym) => {
                    synonymized.push({
                        word: synonym,
                        score: 0,
                        derived: wordPos[0].derived,
                        flag: null,
                        position: wordPos[0].position
                    });
                });
                break;
            case "J": // Adjective
                (_c = synonyms(wordPosTagInitial.word, "s")) === null || _c === void 0 ? void 0 : _c.forEach((synonym) => {
                    synonymized.push({
                        word: synonym,
                        score: 0,
                        derived: wordPos[0].derived,
                        flag: null,
                        position: wordPos[0].position
                    });
                });
                break;
        }
    });
    return synonymized;
}
// Check the originally analysed message (not keywords) for any spelling errors, then return suggestions
function spellCheckMessage(tokenizedMessage) {
    let suggestions = [];
    const dictionary = spellchecker.getDictionarySync("en-GB");
    tokenizedMessage.forEach(token => {
        if (!dictionary.spellCheck(token.word)) {
            dictionary.getSuggestions(token.word).forEach((sugg) => {
                let keyword = { word: sugg, score: 0, derived: token.word, flag: null, position: token.position };
                suggestions.push(keyword);
            });
        }
    });
    return suggestions;
}
function analyseRepetition(tokenizedMessage) {
    const words = tokenizedMessage.map(tok => { return tok.word; });
    let repetition = {};
    words.forEach(w => {
        repetition[w] = 0; // Init dynamic keys with a value of zero
    });
    words.forEach(w => {
        repetition[w] = (repetition[w] || 0) + 1; // Iterate through each word and count number of times it is encountered
    });
    Object.keys(repetition).forEach(key => {
        if (repetition[key] <= 1)
            delete repetition[key]; // Delete entries that have not been counted more than once
    });
    return repetition;
}
function calculateMessageScore(tokens) {
    const finalScore = { anxiety: 0, depression: 0, risk: 0 };
    tokens.forEach((tok) => {
        if (tok.flag && (tok.flag === "anxiety" || tok.flag === "depression" || tok.flag === "risk")) {
            finalScore[tok.flag] += tok.score;
        }
    });
    return finalScore;
}

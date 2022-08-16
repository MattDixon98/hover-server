import * as fs from 'fs';
import * as pos from "pos";
import lemmatize from "wink-lemmatizer";
const tagger = new pos.Tagger();

fs.readFile("./anxiety_wordlist.txt", "utf-8", (err, list) => {
    let lemmatizedArray = [];
    const array = list.split("\n");
    lemmatizedArray = lemmatizeWordList(getWordPosInWordList(array));
    let stringifiedLemmatizedArray = ""; 
    lemmatizedArray.forEach(lem => {
        stringifiedLemmatizedArray += lem + "\n";
    })
    fs.writeFile("./anxiety_wordlist_lemmatized.txt", stringifiedLemmatizedArray, err => {
        if(err) console.error(err);
    })
})

function getWordPosInWordList(wordList) {
    return tagger.tag(wordList);
}

function lemmatizeWordList(wordListPos) {

    const lemmatized = [];
    
    wordListPos.forEach(wordPos => {

        const word = wordPos[0];
        const tagInitial = wordPos[1][0].toUpperCase(); // Get initial letter of tag. This will denote its status as noun, verb or adjective.

        console.log(tagInitial);

        switch(tagInitial){
            case "V" || "R":
                lemmatized.push(lemmatize.verb(word));
                break;
            case "N":
                lemmatized.push(lemmatize.noun(word));
                break;
            case "J":
                lemmatized.push(lemmatize.adjective(word));
                break;
            default:
                lemmatized.push(lemmatize.noun(word));
        }

    })

    return lemmatized;
}
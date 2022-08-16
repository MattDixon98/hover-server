import * as fs from 'fs';

fs.readFile("./hover_message_diagnosis/wordlists/depression_wordlist.txt", "utf-8", (err, list) => {
    let splitWords = list.split("\n");
    let condensed = splitWords.map(word => {
        let removeDot = word.replace("•", "");
        let removeT = removeDot.replace("\t", "");
        let removeR = removeT.replace("\r", "");
        return removeR;
    })
    let condensedString = ""
    condensed.forEach(word => {
        condensedString += word + "\n";
    })
    // console.log(condensedString);
    fs.writeFile("./hover_message_diagnosis/wordlists/depression_wordlist.txt", condensedString, err => {
        if(err) console.error(err);
    })
})
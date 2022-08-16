"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringCorrectness = void 0;
const Spelling = require("spelling");
const dictionary = require("./dictionary");
let dict = new Spelling(dictionary);
function stringCorrectness(message) {
    // Initialise place holder for errors
    let err_counter = 0;
    // Split message into an array by spaces
    let message_ary = message.split(" ");
    // Get the length of the array (how many words)
    let message_lng = message.length;
    for (let i = 0; i < message_lng; i++) {
        if (message_ary[i]) {
            if (!dict.lookup(message_ary[i]).found) {
                err_counter++;
            }
        }
    }
    let result = Math.round((((message_lng - err_counter) / message_lng) * 100) * 100) / 100;
    return result;
}
exports.stringCorrectness = stringCorrectness;

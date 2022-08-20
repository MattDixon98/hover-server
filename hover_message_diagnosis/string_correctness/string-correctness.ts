const Dictionary = require("./dictionary");

export function stringCorrectness(message: string){
    // Initialise place holder for errors
    let err_counter = 0;
    // Split message into an array by spaces and hyphens
    let message_ary = message.split(/[ -]+/);
    // Get the length of the array (how many words)
    let message_lng = message_ary.length;

    // Remove any special characters (such as commas and exclamation marks) from each string in the array
    for(let i = 0; i < message_lng ; i++){
        message_ary[i] = message_ary[i].toLowerCase().replace(/[^\w\s]/gi, '');
    }

    // Cycle through the array to find any errors
    for(let i = 0; i < message_lng ; i++){
        if(!Dictionary.includes(message_ary[i])){
            // If a word is not found, add to the error counter
            err_counter++;
        }
    }

    // Get the percentage of the message correctness
    let result = ((message_lng-err_counter)/message_lng)*100;
    return result;
}

// console.log(stringCorrectness("hello-world and this, more words"));
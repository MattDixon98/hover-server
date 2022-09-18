import { createMessageDiagnosis, createWordRatingListFromDictionaryJson } from "./message_diagnosis/message-diagnosis";
const message: string = "I am involved in a kidnapping";

console.log(createMessageDiagnosis(message));
// createMessageDiagnosis(message);
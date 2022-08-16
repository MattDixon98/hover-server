"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_diagnosis_1 = require("./message_diagnosis/message-diagnosis");
const exampleMessage = "i'm feeling very depreshun and that I might kill someone";
const diagnosis = (0, message_diagnosis_1.createMessageDiagnosis)(exampleMessage);
console.log(diagnosis);

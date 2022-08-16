import { Diagnosis } from "./types/DiagnosisType";
import { createMessageDiagnosis } from "./message_diagnosis/message-diagnosis";

const exampleMessage: string = "i'm feeling very depreshun and that I might kill someone";
const diagnosis: Diagnosis = createMessageDiagnosis(exampleMessage);

console.log(diagnosis);

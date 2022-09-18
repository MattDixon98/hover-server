import { Suggestion } from "../types/SuggestionType/SuggestionType";

export function generateFacilitatorSuggestion(rolling_anx_score: number, rolling_dpr_score: number, new_anx_score: number, new_dpr_score: number): Suggestion {

    let suggestion: Suggestion = {text: "", link: "", therapyType: ""};
    
    if(rolling_anx_score + new_anx_score > 3) {
        suggestion.text = "Patient seems to be exhibiting mild anxiety and mild depression. Consider using ";
        suggestion.link = "/therapeuticModel/sfbt";
        suggestion.therapyType = "SFBT";
    }

    return suggestion;
}
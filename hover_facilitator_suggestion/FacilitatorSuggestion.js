"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFacilitatorSuggestion = void 0;
function generateFacilitatorSuggestion(rolling_anx_score, rolling_dpr_score, new_anx_score, new_dpr_score) {
    let suggestion = { text: "", link: "", therapyType: "" };
    if (rolling_anx_score + new_anx_score > 3) {
        suggestion.text = "Patient seems to be exhibiting mild anxiety and mild depression. Consider using ";
        suggestion.link = "/therapeuticModel/sfbt";
        suggestion.therapyType = "SFBT";
    }
    return suggestion;
}
exports.generateFacilitatorSuggestion = generateFacilitatorSuggestion;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFacilitatorSuggestion = void 0;
function generateFacilitatorSuggestion(rolling_anx_score, rolling_dpr_score) {
    let suggestion = { text: "", link: "", therapyType: "" };
    if ((rolling_anx_score >= 3 &&
        rolling_anx_score <= 14) ||
        (rolling_dpr_score >= 3 &&
            rolling_dpr_score <= 14)) {
        suggestion.text = "Patient seems to be exhibiting mild-low anxiety and mild-low depression. Consider using ";
        suggestion.link = "/therapeuticModel/sfbt";
        suggestion.therapyType = "SFBT";
    }
    else if ((rolling_anx_score >= 15 &&
        rolling_anx_score <= 20) ||
        (rolling_dpr_score >= 15 &&
            rolling_dpr_score <= 20)) {
        suggestion.text = "Patient seems to be exhibiting mild anxiety and mild depression. Consider using ";
        suggestion.link = "/therapeuticModel/cbt";
        suggestion.therapyType = "CBT";
    }
    return suggestion;
}
exports.generateFacilitatorSuggestion = generateFacilitatorSuggestion;

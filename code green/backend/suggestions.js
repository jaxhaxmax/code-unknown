// backend/suggestions.js
function getSuggestions(electricity, car, meat) {
    const tips = []; // ✅ should be tips, not suggestions
  
    if (electricity > 300) tips.push("Reduce electricity usage or switch to renewables.");
    if (car > 100) tips.push("Consider using public transportation or carpooling.");
    if (meat > 7) tips.push("Reduce meat consumption to lower carbon impact.");
  
    if (tips.length === 0) tips.push("Great job! You're already eco-conscious!");
  
    return tips;
  }
  
  module.exports = { getSuggestions };
  
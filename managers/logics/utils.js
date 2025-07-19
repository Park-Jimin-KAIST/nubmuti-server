/**
 * 배열 셔플 함수 (Fisher-Yates 알고리즘)
 * @param {Array} array 셔플할 배열
 * @returns {Array} 셔플된 배열
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = {
    shuffleArray
}; 
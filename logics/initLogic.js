const data = require('../data');
const { shuffleArray } = require('./utils');
const { room } = require('../roomManager');

/**
 * 카드 덱 셔플
 */
function shuffleDeck(deck) {
    return shuffleArray([...deck]); // 카드 덱 셔플 + data.deck에 직접 접근하지 않음 (데이터 분리)
}

/**
 * 플레이어별 카드 분배
 * @param {Array} shuffledDeck 셔플된 카드 덱
 */
function dealCards(shuffledDeck) {
    const participants = room.participants;
    
    participants.forEach(player => player.hand = []);

    let playerCount = participants.length;
    for (let i = 0; i < shuffledDeck.length; i++) {
        const playerIndex = i % playerCount;
        participants[playerIndex].hand.push(shuffledDeck[i]);
    }
}

/**
 * 카드 교환 단계
 * @param {Object} selectedCards 프론트엔드에서 받은 교환 카드 정보
 */
function exchangeCards(selectedCards) {
    const participants = room.participants;
    
    participants.sort((a, b) => b.rank - a.rank); // 계급 내림차순 정렬

    const mainExchangeCount = 2; //넙죽이가 대학원생에게 줄 카드 수
    const subExchangeCount = 1; // 이광형이 연차초과자에게 줄 카드 수

    const n = participants.length;

    const high = participants[0]; // 넙죽이
    const low = participants[n - 1]; // 대학원생

    const highGive = selectedCards.highToLow; // highToLow는 프론트엔드에서 추후 구현 필요
    const lowGive = low.hand.slice().sort((a, b) => a - b).slice(0, mainExchangeCount);

    highGive.forEach(card => {
        const idx = high.hand.indexOf(card);
        if (idx !== -1) high.hand.splice(idx, 1);
    });

    lowGive.forEach(card => {
        const idx = low.hand.indexOf(card);
        if (idx !== -1) low.hand.splice(idx, 1);
    });

    high.hand.push(...lowGive);
    low.hand.push(...highGive);

    const high2 = participants[1]; // 이광형
    const low2 = participants[n - 2]; // 연차초과자

    const high2Give = selectedCards.high2ToLow2; // high2ToLow2는 프론트엔드에서 추후 구현 필요
    const low2Give = low2.hand.slice().sort((a, b) => a - b).slice(0, subExchangeCount);

    high2Give.forEach(card => {
        const idx = high2.hand.indexOf(card);
        if (idx !== -1) high2.hand.splice(idx, 1);
    });

    low2Give.forEach(card => {
        const idx = low2.hand.indexOf(card);
        if (idx !== -1) low2.hand.splice(idx, 1);
    });

    high2.hand.push(...low2Give);
    low2.hand.push(...high2Give);
}

module.exports = {
    shuffleDeck,
    dealCards,
    exchangeCards
};
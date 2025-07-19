const { TbRuler } = require('react-icons/tb');
const data = require('../data');
const { shuffleArray } = require('./logics/utils');
const { room } = require('./roomManager');

/**
 * 참가자 순서 정하기
 * 섞여진 덱에서 참가자들에게 카드를 무작위로 한 장씩 분배
 * 여기서 활용할 덱은 다른 덱: 카드가 숫자별로 한장씩만 포함된 덱이므로 카드 덱 셔플 필요 없음
 * 숫자가 낮은 순서대로 rank가 높음
 * 첫 라운드에만 실행되고, 다음 라운드부터는 이전 라운드 결과로 계급 결정
 */
function setRanksByDealingCards() {
    if (room.gameState.round !== 1) return; // 첫 라운드에만 실행

    const participants = room.participants; // participants 복사
    const playerCount = participants.length; // 참가자 수
   
    // 계급 결정용 카드 덱 (숫자별로 한 장씩)
    const rankDeck = []; // 계급 결정용 카드 덱
    for (let i = 1; i <= 10; i++) {
        rankDeck.push(i);
    }
    
    // 덱 셔플
    const shuffledRankDeck = shuffleArray(rankDeck); // rankDeck셔플
    const rankNamesforFourPlayers = [
        'nubjuki',    // 1등 - 넙죽이
        'lkh',        // 2등 - 이광형
        'over-year',  // 9등 - 연차초과자
        'grad'        // 10등 - 대학원생
    ];
    const rankNamesforFivePlayers = [
        'nubjuki',    // 1등 - 넙죽이
        'lkh',        // 2등 - 이광형
        'rsy',        // 3등 - 류석영
        'over-year',  // 4등 - 연차초과자
        'grad'        // 5등 - 대학원생
    ];
    const rankNamesforSixPlayers = [
        'nubjuki',    // 1등 - 넙죽이
        'lkh',        // 2등 - 이광형
        'rsy',        // 3등 - 류석영
        'prof',       // 4등 - 교수
        'over-year',  // 5등 - 연차초과자
        'grad'        // 6등 - 대학원생
    ];
    // 각 플레이어에게 카드 분배
    participants.forEach((player, index) => {
        const rankCard = shuffledRankDeck[index]; // 임시 변수로만 사용
        
        // 참가자 수별 계급 설정
        if (playerCount === 4) {
            // 4명 플레이
            if (rankCard === 1) {
                player.rank = 'nubjuki';    // 1번 - 넙죽이
            } else if (rankCard === 2) {
                player.rank = 'lkh';        // 2번 - 이광형
            } else if (rankCard === 3) {
                player.rank = 'over-year';  // 3번 - 연차초과자
            } else if (rankCard === 4) {
                player.rank = 'grad';       // 4번 - 대학원생
            }
        } else if (playerCount === 5) {
            // 5명 플레이
            const rankNamesforFivePlayers = [
                'nubjuki',    // 1등 - 넙죽이
                'lkh',        // 2등 - 이광형
                'rsy',        // 3등 - 류석영
                'over-year',  // 4등 - 연차초과자
                'grad'        // 5등 - 대학원생
            ];
            player.rank = rankNamesforFivePlayers[rankCard - 1];
        } else if (playerCount === 6) {
            // 6명 플레이
            const rankNamesforSixPlayers = [
                'nubjuki',    // 1등 - 넙죽이
                'lkh',        // 2등 - 이광형
                'rsy',        // 3등 - 류석영
                'prof',       // 4등 - 교수
                'over-year',  // 5등 - 연차초과자
                'grad'        // 6등 - 대학원생
            ];
            player.rank = rankNamesforSixPlayers[rankCard - 1];
        } else {
            // 지원하지 않는 인원수
            throw new Error(`지원하지 않는 플레이어 수입니다: ${playerCount}명 (4-6명만 지원)`);
        }
    });

    return {
        success: true,
        message: '계급 결정 완료',
        // 프론트엔드와 추후 협업 필요. 필요한 정보 구상 요함
    }
}

/**
 * 이전 라운드 결과로 계급 업데이트
 */
function setRanksByRoundResult() {
    const roundResult = room.gameState.roundResults; // 플레이어 객체 배열

    if (!roundResult) {
        console.log('이전 라운드 결과가 없습니다.');
        return;
    }

    const playerCount = roundResult.length;
    let rankNames;
    if (playerCount === 4) {
        rankNames = ['nubjuki', 'lkh', 'over-year', 'grad'];
    } else if (playerCount === 5) {
        rankNames = ['nubjuki', 'lkh', 'rsy', 'over-year', 'grad'];
    } else if (playerCount === 6) {
        rankNames = ['nubjuki', 'lkh', 'rsy', 'prof', 'over-year', 'grad'];
    } else {
        throw new Error(`지원하지 않는 플레이어 수입니다: ${playerCount}명 (4~6명만 지원)`);
    }

    // roundResult의 순서대로 계급 재설정
    roundResult.forEach((player, index) => {
        if (index < rankNames.length) {
            player.rank = rankNames[index];
        }
    });

    console.log(`라운드 결과로 계급 업데이트 완료`);
}

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
 * 랭크 순서대로 턴 순서(order) 설정
 */
function setTurnOrder() {
    const playerCount = room.participants.length;
    let rankNames;
    if (playerCount === 4) {
        rankNames = ['nubjuki', 'lkh', 'over-year', 'grad'];
    } else if (playerCount === 5) {
        rankNames = ['nubjuki', 'lkh', 'rsy', 'over-year', 'grad'];
    } else if (playerCount === 6) {
        rankNames = ['nubjuki', 'lkh', 'rsy', 'prof', 'over-year', 'grad'];
    } else {
        throw new Error(`지원하지 않는 플레이어 수입니다: ${playerCount}명 (4~6명만 지원)`);
    }

    // rankNames 순서대로 플레이어 정렬
    const sortedPlayers = rankNames
        .map(rank => room.participants.find(p => p.rank === rank))
        .filter(Boolean); // 혹시 누락된 플레이어가 있으면 제외

    // 턴 순서(order)만 세팅
    room.gameState.turn.order = sortedPlayers.map(p => p.id);
    room.gameState.turn.currentPlayer = room.gameState.turn.order[0]; // 첫 번째 플레이어로 초기화
}

/**
 * 게임 초기화 (계급 결정 + 카드 분배 + 턴 순서 설정)
 */
// function initializeGame() {
//     // 1. 계급 결정 (카드 분배로)
//     dealRankCards();
    
//     // 2. 게임용 카드 분배
//     const shuffledDeck = shuffleDeck(data.deck.cards);
//     dealCards(shuffledDeck);
    
//     // 3. 턴 순서 설정
//     setTurnOrder();
// }

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
    dealRankCards,
    setTurnOrder,
    // initializeGame,
    exchangeCards
};
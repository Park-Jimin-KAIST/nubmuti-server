// const player = [
//     {
//         id: '', // 소켓 ID
//         name: '', // 플레이어 이름
//         hand: [], // 손에 쥐고 있는 카드 배열
//         rank: 'nubjuki', // | 'lkh' | 'rsy' | 'prof' | 'freshman' | 'sixth' | 'seventh' | 'undergrad' | 'over-year' | 'grad', // 계급: 1 ~ # of players
//         isReady: false, // 준비 여부
//         hasPasses: false, // 현재 턴에서의 패스 여부
//     }
// ];

/**
 * 플레이어 생성자 함수
 * @param {string} ws 웹소켓 객체   
 * @param {string} nickname 플레이어 이름
 */
function Player(ws, nickname) {
    this.ws = ws; // 웹소켓 객체
    this.nickname = nickname; // 플레이어 이름
    this.hand = []; // 
    this.rank = null; // 계급: 1 ~ # of players
    this.hasPasses = false; // 현재 턴에서의 패스 여부
    this.isHost = false; // 방장 여부
}

const cards = {
    number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'Goose' | 'Duck',
    type: 'single' | 'double' | 'triple' | 'quad' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'eleven',
}

const baseGameState = {
    phase: 'waiting' | 'exchange' | 'playing' | 'ended', // 게임 상태: [waiting, cardExchange, playing, ended]
    turn: { //현재 턴 정보
        currentPlayer: null, // 현재 턴 플레이어 객체
        order: [], //턴 순서 배열 - 플레이어 객체 배열
        lastPlay: {
            lastPlayer: '',
            cardNumber: 0,
            cardType: 'single' | 
                      'double' | 
                      'triple' | 
                        'quad' | 
                        'five' | 
                         'six' | 
                       'seven' | 
                       'eight' | 
                        'nine' | 
                         'ten' |
                       'eleven',
        },
        passCount: 0, // 패스 횟수
    },
    table: {
        pile: [], // 플레이 도중 플레이어들이 낸 (버린) 카드 배열
    },
    round: 1, // 현재 라운드 수
    maxRound: 3,
    roundResults: [], // 최종 라운드 결과대로 배열, 다음 라운드 순서 결정에 사용
};

const deck = {
    cards: [1, 
            2, 2, 
            3, 3, 3, 
            4, 4, 4, 4, 
            5, 5, 5, 5, 5, 
            6, 6, 6, 6, 6, 6, 
            7, 7, 7, 7, 7, 7, 7, 
            8, 8, 8, 8, 8, 8, 8, 8, 
            9, 9, 9, 9, 9, 9, 9, 9, 9, 
            10, 10, 10, 10, 10, 10, 10, 10, 10, 10,
            'Goose', 'Duck']
};

module.exports = {
    // player, // 플레이어 목록 
    deck, // 카드 덱
    baseGameState, // 게임 상태 기본 구조
    Player, // 플레이어 생성자 함수
    cards, // 카드 목록
};
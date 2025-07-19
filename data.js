const player = [
    {
        id: '', // 소켓 ID
        name: '', // 플레이어 이름
        hand: [], // 손에 쥐고 있는 카드 배열
        rank: 'nubjuki', // | 'lkh' | 'rsy' | 'prof' | 'freshman' | 'sixth' | 'seventh' | 'undergrad' | 'over-year' | 'grad', // 계급: 1 ~ # of players
        isReady: false, // 준비 여부
        hasPasses: false, // 현재 턴에서의 패스 여부
    }
];

const participants = [
    {
      id: '', 
      name: '', 
      hand: [], 
      rank: '', 
      isReady: false, 
      hasPasses: false,
    },
    // 다른 플레이어들...
  ];

const gameState = {
    phase: 'waiting' | 'exchange' | 'playing' | 'ended', // 게임 상태: [waiting, cardExchange, playing, ended]
    participants: [], // 플레이어 목록
    turn: { //현재 턴 정보
        currentPlayerIndex: 0,
        order: [], //턴 순서 배열 - 소켓 ID 배열, 
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
        passCount: 0, // 패스 횟수
        },
    },
    table: {
        pile: [], // 플레이 도중 플레이어들이 낸 (버린) 카드 배열
    },
    round: 0, // 현재 라운드 수
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
            'Goose', 'Duck'] // 플레이 도중 플레이어들이 낸 (버린) 카드 배열
};

// const room = {
//     id: 'room1', // 방 아이디
//     hostID: '', // 방장 소켓 ID
//     maxPlayers: 6, // 최대 플레이어 수
//     createdAt: new Date.now(), // 방 생성 시간
// };

const flags = {
    isGameStarted: false, // 게임 시작 여부
    isExchangePhase: false, // 카드 교환 단계 여부
    exchangeCount: 0, // 카드 교환 횟수
};

module.exports = {
    player, // 플레이어 목록 
    participants, // 참가자 목록
    gameState, // 게임 상태
    deck, // 카드 덱
    room, // 방 정보
    flags, // 플래그 정보
};
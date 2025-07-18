const players = [
    {
        id: '', // 소켓 ID
        name: '', // 플레이어 이름
        hand: [], // 손에 쥐고 있는 카드 배열
        rank: null, // 계급: [넙죽이, 이광형, 류석영 , ... , 대학원생]
        isReady: false, // 준비 여부
        hasPasses: false, // 현재 턴에서의 패스 여부
    }
];

const gameState = {
    phase: 'waiting', // 게임 상태: [waiting, cardExchange, playing, ended]
    currentTurn: null, // 현재 턴 플레이어
    lastPlay: null, // 마지막 플레이 카드 정보
    turnOrder: [], // 턴 순서 (소켓 ID 배열)
    round: 0, // 현재 라운드 수
};

const deck = {
    cards: [], // 초기 카드 배열 [넙죽이, 이광형, 이광형, 류석영, 류석영, 류석영, ... , 대학원생, 대학원생, 대학원생]
    discardPile: [], // 플레이 도중 플레이어들이 낸 (버린) 카드 배열
};

const room = {
    id: 'room1', // 방 아이디
    hostID: '', // 방장 소켓 ID
    maxPlayers: 6, // 최대 플레이어 수
    createdAt: new Date.now(), // 방 생성 시간
};

const flags = {
    isGameStarted: false, // 게임 시작 여부
    isExchangePhase: false, // 카드 교환 단계 여부
    exchangeCount: 0, // 카드 교환 횟수
};

module.exports = {
    players, // 플레이어 목록 
    gameState, // 게임 상태
    deck, // 카드 덱
    room, // 방 정보
    flags, // 플래그 정보
};
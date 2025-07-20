const { deck, baseGameState, Player } = require('../data');

const room = {
    id: 'room1',           // 방 아이디
    name: '싱글룸',          // 방 이름 (필요시)
    maxPlayers: 6,         // 최대 인원
    minPlayers: 4,         // 최소 인원
    hostID: null,          // 방장 소켓 ID
    participants: [],      // 플레이어 목록
    gameState: baseGameState,
    createdAt: new Date(),  // 생성 시간
    flags: {
        isRoomCreated: false, // 방 생성 여부
        isGameStarted: false, // 게임 시작 여부
        isExchangePhase: false, // 카드 교환 단계 여부
        exchangeCount: 0, // 카드 교환 횟수
        isEnoughPlayers: room.participants.length >= room.minPlayers, // 최소 인원 이상 최대 인원 이하인지 여부
    },
    finishedPlayers:[]
};

function initRoom() {
    room.id = 'room1';
    room.name = '싱글룸';
    room.maxPlayers = 6;
    room.hostID = null;
    room.participants = [];
    room.gameState = baseGameState;
    room.createdAt = new Date();
    room.flags.isRoomCreated = false;
    room.flags.isGameStarted = false;
    room.flags.isExchangePhase = false;
    room.flags.exchangeCount = 0;
};

/**
 * 방 정보 조회
 * @returns {Object} 방 정보
 * @event GET_ROOM_INFO: 1003
 */
function getRoomInfo() {
    return {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        hostID: room.hostID,
        participantCount: room.gameState.participants.length,
        participants: room.gameState.participants.map(p => ({
            id: p.id,
            name: p.name,
            isReady: p.isReady,
            rank: p.rank
        }))
    };
}

/**
 * 방 생성
 * 싱글룸에서 아무 참가자가 없고 플레이 중이 아닐 때 참가자가 접속하면 방을 생성
 * @param {string} playerId 소켓 ID
 * @param {string} playerName 플레이어 이름
 * @returns {Object} 결과 정보
 * @event CREATE_ROOM: 1004
 */
function createRoom(playerId, playerName) {
    // 이미 방이 생성된 경우
    if (room.flags.isRoomCreated) {
        return { 
            success: false, 
            message: '이미 방이 생성되어 있습니다.' 
        };
    }

    // 이미 참가자가 있는 경우
    if (room.gameState.participants.length > 0) {
        return { 
            success: false, 
            message: '이미 방에 참가자가 있습니다.' 
        };
    }

    // 새 플레이어 생성 (Player 생성자 함수 사용)
    const newPlayer = new Player(playerId, playerName);

    // 첫 번째 참가자를 방장으로 설정
    room.hostID = playerId;
    room.gameState.participants.push(newPlayer);

    return { 
        success: true, 
        message: '방이 생성되었습니다.',
        player: newPlayer,
        roomInfo: getRoomInfo()
    };
}

/**
 * 방 입장
 * 방이 이미 생성되어 있는 상태에서 참가자가 접속할 때 실행
 * @param {string} playerId 소켓 ID
 * @param {string} nickname 플레이어 이름
 * @returns {Object} 결과 정보
 * @event ENTER_ROOM: 1001
 */
function enterRoom(playerId, nickname) {
    // 방이 생성되지 않은 경우
    if (!room.flags.isRoomCreated) {
        return { 
            success: false, 
            message: '방이 생성되지 않았습니다.' 
        };
    }

    // 방이 가득 찬 경우
    if (room.gameState.participants.length >= room.maxPlayers) {
        return { 
            success: false, 
            message: '방이 가득 찼습니다.' 
        };
    }

    // 이미 입장한 플레이어인 경우
    const existingPlayer = room.gameState.participants.find(p => p.id === playerId);
    if (existingPlayer) {
        return { 
            success: false, 
            message: '이미 입장한 플레이어입니다.' 
        };
    }

    // 게임이 진행 중인 경우
    if (room.flags.isGameStarted) {
        return { 
            success: false, 
            message: '게임이 진행 중입니다.' 
        };
    }

    // 새 플레이어 생성
    const newPlayer = new Player(playerId, nickname);

    // 참가자 목록에 추가
    room.gameState.participants.push(newPlayer);

    return { 
        success: true, 
        message: '방 입장 성공',
        player: newPlayer,
        roomInfo: getRoomInfo()
    };
}

/**
 * 방 퇴장
 * @param {string} playerId 소켓 ID
 * @returns {Object} 결과 정보
 */
function leaveRoom(playerId) {
    // 방에 입장하지 않은 플레이어인 경우
    const playerIndex = room.gameState.participants.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
        return { 
            success: false, 
            message: '방에 입장하지 않은 플레이어입니다.'
        };
    }

    // 플레이어 제거
    const removedPlayer = room.gameState.participants.splice(playerIndex, 1)[0];

    // 방장이 나간 경우, 다음 플레이어를 방장으로 설정
    if (room.hostID === playerId && room.gameState.participants.length > 0) {
        room.hostID = room.gameState.participants[0].id;
    }

    // 모든 플레이어가 나간 경우 방 초기화
    if (room.gameState.participants.length === 0) {
        initRoom();
    }

    return { 
        success: true, 
        message: '방 퇴장 성공',
        removedPlayer,
        roomInfo: getRoomInfo()
    };
}

module.exports = {
    room,
    createRoom,
    getRoomInfo,
    leaveRoom,
    enterRoom,
    initRoom
};

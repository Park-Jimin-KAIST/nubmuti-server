const { room, initRoom } = require('./roomManager');
const { getRoomInfo } = require('./roomManager');
const { shuffleDeck, dealCards } = require('./initManager');
const { deck } = require('../data');

/**
 * 게임 시작
 * @param {WebSocket} ws 웹소켓 객체 (방장만 가능)
 * @returns {Object} 결과 정보
 * @event START_GAME: 1010
 */
function startGame(ws) {
    // 방장만 게임 시작 가능
    if (room.hostWS !== ws) {
        return { 
            success: false, 
            message: '방장만 게임을 시작할 수 있습니다.' 
        };
    }

    // 최소 인원 체크
    if (!room.isEnoughPlayers()) {
        return { 
            success: false, 
            message: `최소 4명 이상 필요합니다.` 
        };
    }

    // 게임이 이미 진행 중인 경우
    // if (room.flags.isGameStarted) {
    //     return { 
    //         success: false, 
    //         message: '게임이 이미 진행 중입니다.' 
    //     };
    // }

    // 게임 시작
    room.flags.isGameStarted = true;
    room.gameState.phase = 'playing';
    room.gameState.round = 1;

    return { 
        success: true, 
        message: '게임이 시작되었습니다.',
    };
}

/**
 * 게임 종료 조건 확인
 * @returns {boolean}
 */
function isGameOver() {
    return room.gameState.round > room.gameState.maxRound;
}

/**
 * 게임 종료
 * @param {WebSocket} ws 웹소켓 객체
 * @returns {Object} 결과 정보
 * @event END_GAME: 3000
 */
function endGame() {
    // 게임 종료
    room.flags.isGameStarted = false;
    room.gameState.phase = 'ended';

    initRoom();

    return { 
        success: true, 
        message: '게임이 종료되었습니다.'
    };
}

/**
 * 게임 준비/시작 요청 (READY_GAME을 게임 시작 요청으로 사용)
 * @param {WebSocket} ws 웹소켓 객체
 * @returns {Object} 결과 정보
 * @event READY_GAME: 1011
 */
function readyGame(ws) {
    // 방장만 게임 시작 요청 가능
    if (room.hostWS !== ws) {
        return { 
            success: false, 
            message: '방장만 게임을 시작할 수 있습니다.' 
        };
    }

    // 게임이 이미 진행 중인 경우
    if (room.flags.isGameStarted) {
        return { 
            success: false, 
            message: '게임이 이미 진행 중입니다.' 
        };
    }

    // startGame 함수 호출
    return startGame(ws);
}

module.exports = {
    startGame,
    endGame,
    readyGame,
    isGameOver
};

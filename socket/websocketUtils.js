const WebSocket = require('ws');
const { PACKET_TYPE } = require('./packetType');

// 메시지 전송 함수들

/**
 * 단일 클라이언트에게 메시지 전송
 * @param {WebSocket} ws 클라이언트 소켓
 * @param {int} signal 이벤트 타입 i.e. YOUR_TURN, GAME_START, GAME_END, etc.
 * @param {any} data 전송할 데이터 i.e. { playerId, cards }
 */
function sendToClient(ws, signal, data) {
    const message = JSON.stringify({ signal, data });
    ws.send(message);
}

/**
 * 모든 클라이언트에게 메시지 전송
 * @param {WebSocket.Server} wss 웹소켓 서버
 * @param {int} signal 이벤트 타입 i.e. YOUR_TURN, GAME_START, GAME_END, etc.
 * @param {any} data 전송할 데이터 i.e. { playerId, cards }
 */
function broadcastToAll(wss, signal, data) {
    const message = JSON.stringify({ signal, data });
    wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
}

// 메시지 전송 함수들

/**
 * 메시지 파싱
 * @param {string} message 파싱할 메시지
 * @returns {Object} 파싱된 메시지 객체
 */
function parseMessage(message) {
    try {
        return JSON.parse(message);
    } catch (error) {
        console.error('메시지 파싱 오류:', error);
        return { success: false, error: '메시지 파싱 오류' };
    }
}

/**
 * 메시지 유효성 검사
 * @param {Object} data 검사할 데이터
 * @param {string[]} requiredFields 필수 필드 목록
 * @returns {Object} 검사 결과 객체
 */

function validateMessage(data, requiredFields) {
    for (const field of requiredFields) {
        if (!data[field]) {
            return { success: false, error: `필수 필드 ${field}가 누락되었습니다` };
        }
    }
    return { success: true };
}

/**
 * 에러 메시지 전송
 * @param {WebSocket} ws 클라이언트 소켓
 * @param {string} message 에러 메시지
 * @param {any} details 상세 정보
 */
function sendError(ws, message, details = null) {
    sendToClient(ws, 'ERROR', { 
        message: message,
        details: details,
        timestamp: Date.now()
     });
}

// 클라이언트 관리 함수들

/**
 * 연결된 클라이언트 개수 조회
 * @param {WebSocket.Server} wss 웹소켓 서버
 * @returns {number} 클라이언트 개수
 */
function getConnectedClientsCount(wss) {
    let count = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            count++;
        }
    });
    return count;
}

/**
 * 클라이언트 정보 업데이트
 * @param {WebSocket} ws 클라이언트 소켓
 * @param {Object} info 업데이트할 정보 i.e. { playerId, nickname, roomId }
 */
function updateClientInfo(ws, info) {
    ws.clientInfo = info;
}

/**
 * 각 클라이언트에게 각자 다른 정보를 전송
 * @param {Array} participants 참가자 배열 (각 객체에 ws와 원하는 데이터가 있어야 함)
 * @param {string} type 이벤트 타입
 * @param {function} dataFn (player) => data  // 각 플레이어별로 보낼 데이터를 반환하는 함수
 */
function sendEachClient(participants, signal, dataFn) {
    participants.forEach(player => {
        if (player.ws && player.ws.readyState === WebSocket.OPEN) {
            const data = dataFn(player);
            console.log(data);
            sendToClient(player.ws, signal, data);
        }
    });
}

/**
 * 특정 클라이언트에게 오름차순으로 정렬된 hand와 UPDATE_HAND 시그널을 전송
 * @param {WebSocket} ws 클라이언트 소켓
 * @param {Array<number>} hand 플레이어의 패 배열
 */
function sendUpdateHand(ws, hand) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const sortedHand = hand.slice().sort((a, b) => a - b);
        sendToClient(ws, PACKET_TYPE.UPDATE_HAND, { hand: sortedHand });
    }
}

/**
 * 전체 참가자에게 각자의 오름차순 정렬된 hand와 UPDATE_HAND 시그널을 전송
 * @param {Array} participants 참가자 배열 (각 객체에 ws, hand가 있어야 함)
 */
function sendUpdateHandAll(participants) {
    sendEachClient(participants, PACKET_TYPE.UPDATE_HAND, (player) => {
        const sortedHand = player.hand.slice().sort((a, b) => a - b);
        return { hand: sortedHand };
    });
}

function showMessage(ws, message) {
    sendToClient(ws, PACKET_TYPE.SHOW_MESSAGE, { message });
}


/** */
module.exports = {
    sendToClient,
    broadcastToAll,
    parseMessage,
    validateMessage,
    sendError,
    getConnectedClientsCount,
    updateClientInfo,
    sendEachClient,
    sendUpdateHand,
    sendUpdateHandAll,
    showMessage
}
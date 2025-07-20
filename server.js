const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Express 앱 설정
const app = express();
app.use(express.static('Build'));
app.use(express.static('public'));

// HTTP 서버 생성
const server = http.createServer(app);

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

// 핸들러들 import
const { handleRoomEvents } = require('./socket/handler/roomHandler');
const { handleGameEvents } = require('./socket/handler/gameHandler');
const { handleRoundEvents } = require('./socket/handler/roundHandler');
const { handleCommonEvents } = require('./socket/handler/commonHandler');

// 서버 에러 처리
server.on('error', (error) => {
    console.error('서버 에러:', error);
});

wss.on('error', (error) => {
    console.error('WebSocket 서버 에러:', error);
});

// WebSocket 연결 처리
wss.on('connection', (ws) => {
    console.log('클라이언트 연결됨');
    
    // 클라이언트 정보 추가
    ws.clientId = generateClientId();
    ws.isAlive = true;
    
    // 각 핸들러 등록
    handleCommonEvents(ws, wss);
    handleRoomEvents(ws, wss);
    handleGameEvents(ws, wss);
    handleRoundEvents(ws, wss);
    
    // 연결 해제 처리
    ws.on('close', () => {
        console.log('클라이언트 연결 해제');
        handlePlayerDisconnect(ws.clientId);
    });
    
    // 에러 처리
    ws.on('error', (error) => {
        console.error('WebSocket 에러:', error);
    });
});

// 클라이언트 ID 생성
function generateClientId() {
    return Math.random().toString(36).substr(2, 9);
}

// 플레이어 연결 해제 처리
function handlePlayerDisconnect(clientId) {
    // 연결 해제된 플레이어 정리
    console.log(`플레이어 ${clientId} 연결 해제 처리`);
}

// 유틸리티 함수들 (핸들러에서 사용)
// 단일 클라이언트에게 메시지 전송
function sendToClient(ws, type, data) {
    const message = JSON.stringify({ type, data });
    ws.send(message);
}

// 모든 클라이언트에게 메시지 전송
function broadcastToAll(wss, type, data) {
    const message = JSON.stringify({ type, data });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// 핸들러에서 사용할 수 있도록 export
module.exports = { sendToClient, broadcastToAll };

// 환경 변수로 포트 설정
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
    console.log(`- HTTP 서버: http://localhost:${PORT}`);
    console.log(`- WebSocket 서버: ws://localhost:${PORT}`);
});

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
const { handleRoomEvents } = require('./handler/roomHandler');
const { handleGameEvents } = require('./handler/gamehandler');
const { handleRoundEvents } = require('./handler/roundHandler');
// const { handleCommonEvents } = require('./handler/commonHandler');

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
    //ws.clientId = generateClientId();
    //ws.isAlive = true;
    
    // 각 핸들러 등록
    //handleCommonEvents(ws, wss);
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

// 환경 변수로 포트 설정
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
    console.log(`- HTTP 서버: http://localhost:${PORT}`);
    console.log(`- WebSocket 서버: ws://localhost:${PORT}`);
});

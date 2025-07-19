// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws) => {
  console.log('클라이언트 연결됨');

  ws.on('message', (message) => {
    console.log(`받은 메시지: ${message}`);
    // 예: 클라이언트로 다시 돌려주기
    ws.send(`서버가 받은 메시지: ${message}`);
  });

  ws.on('close', () => {
    console.log('클라이언트 연결 종료됨');
  });
});

console.log('WebSocket 서버가 3000번 포트에서 실행 중...');

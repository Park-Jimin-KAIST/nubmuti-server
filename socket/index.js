// socket/index.js

const { PACKET_TYPE } = require('./event');
const roomHandler = require('./handlers/roomHandler');
const authHandler = require('./handlers/authHandler');
// ... 필요한 핸들러 모듈 import

function onMessage(ws, data) {
  let message;
  try {
    message = JSON.parse(data);
  } catch (err) {
    console.error('Invalid JSON:', data);
    return;
  }

  const { type, payload } = message;

  switch (type) {
    case PACKET_TYPE.PING:
      ws.send(JSON.stringify({ type: PACKET_TYPE.PONG }));
      break;

    case PACKET_TYPE.ENTER_ROOM:
        const { roomId } = payload;
        
  }
}

module.exports = {
  onMessage,
};

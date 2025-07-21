const { PACKET_TYPE } = require('../socket/event');
const { sendToClient, parseMessage, sendError, broadcastToAll } = require('../socket/websocketUtils');
const { startGame, endGame, readyGame, isGameOver } = require('../managers/gameManager');

function handleGameEvents(ws, wss) {
    ws.on('message', (msg) => {
        const parsed = parseMessage(msg);
        if (!parsed || parsed.success === false) {
            sendError(ws, '메시지 파싱 오류', parsed?.error);
            return;
        }
        const { type, data } = parsed;

        switch (type) {
            case PACKET_TYPE.START_GAME:
                const startResult = startGame(ws);
                broadcastToAll(wss, PACKET_TYPE.START_GAME, startResult);
                break;

            case PACKET_TYPE.END_GAME:
                const endResult = endGame();
                broadcastToAll(wss, PACKET_TYPE.END_GAME, endResult);
                break;
        }
    });
}
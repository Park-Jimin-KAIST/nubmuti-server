const { PACKET_TYPE } = require('../socket/event');
const { enterRoom, getRoomInfo, createRoom, leaveRoom, isReady, isHost } = require('../managers/roomManager');
const { sendToClient, parseMessage, sendError, broadcastToAll } = require('../socket/websocketUtils');

function handleRoomEvents(ws, wss) {
    ws.on('message', (msg) => {
        const parsed = parseMessage(msg);
        if (!parsed || parsed.success === false) {
            sendError(ws, '메시지 파싱 오류', parsed?.error);
            return;
        }
        const { type, data } = parsed; //프론트엔드에서 넘어온 정보

        switch (type) {
            case PACKET_TYPE.CREATE_ROOM:
                const createResult = createRoom(ws, data.nickname);
                sendToClient(ws, PACKET_TYPE.ENTER_ROOM, roomInfo.participants.length);
                sendToClient(ws, PACKET_TYPE.YOU_ARE_HOST, createResult);
                break;

            case PACKET_TYPE.ENTER_ROOM:
                if (!data || !data.nickname) {
                    sendError(ws, '닉네임이 필요합니다.');
                    return;
                }
                const result = enterRoom(ws, data.nickname);
                sendToClient(ws, PACKET_TYPE.ENTER_ROOM, roomInfo.participants.length);

                if (result.success) {
                    // const roomInfo = getRoomInfo();
                    broadcastToAll(wss, PACKET_TYPE.PLAYER_COUNT_CHANGED, {
                        participantCount: roomInfo.participants.length,
                        maxPlayer: 6
                    });
                }

                if (isReady()) {
                    sendToClient(room.hostWS, PACKET_TYPE.READY_GAME, { isReady: true });
                } else {
                    sendToClient(room.hostWS, PACKET_TYPE.READY_GAME, { isReady: false });
                }
                break;
            
            case PACKET_TYPE.LEAVE_ROOM:
                const leaveResult = leaveRoom(ws);
                sendToClient(ws, PACKET_TYPE.LEAVE_ROOM, leaveResult);

                if (leaveResult.success) {
                    const roomInfo = getRoomInfo();
                    broadcastToAll(wss, PACKET_TYPE.PLAYER_COUNT_CHANGED, {
                        participantCount: roomInfo.participants.length,
                        maxPlayer: 6
                    });
                    broadcastToAll(wss, PACKET_TYPE.YOU_ARE_HOST, isHost(ws.clientId));
                }

                if (isReady()) {
                    sendToClient(room.hostWS, PACKET_TYPE.READY_GAME, { isReady: true });
                } else {
                    sendToClient(room.hostWS, PACKET_TYPE.READY_GAME, { isReady: false });
                }
                break;
        }
    });
}

module.exports = {
    handleRoomEvents,
}
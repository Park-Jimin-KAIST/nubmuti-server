const { PACKET_TYPE } = require('../socket/event');
const { enterRoom, getRoomInfo } = require('../managers/roomManager');
const { sendToClient } = require('../../server')

function handleRoomEvents(ws, wss) {
    ws.on('message', (msg) => {
        const parsed = parseMessage(msg);
        if (!parsed || parsed.success === false) {
            sendError(ws, '메시지 파싱 오류', parsed?.error);
            return;
        }
        const { type, data } = parsed; //프론트엔드에서 넘어온 정보

        switch (type) {
            case PACKET_TYPE.ENTER_ROOM:
                if (!data || !data.nickname) {
                    sendError(ws, '닉네임이 필요합니다.');
                    return;
                }
                const result = enterRoom(ws, data.nickname);
                sendToClient(ws, PACKET_TYPE.ENTER_ROOM, result);

                if (result.success) {
                    // const roomInfo = getRoomInfo();
                    wss.clients.forEach(client => {
                        if (client.readyState === ws.OPEN) {
                            sendToClient(client, PACKET_TYPE.PLAYER_COUNT_CHANGED, {
                                participantCount: roomInfo.participants.length
                            });
                        }
                    });
                }
                break;
            
            case PACKET_TYPE.LEAVE_ROOM:
                const leaveResult = leaveRoom(ws.clientId);
                sendToClient(ws, PACKET_TYPE.LEAVE_ROOM, leaveResult);

                if (leaveResult.success) {
                    const roomInfo = getRoomInfo();
                    wss.clients.forEach(client => {
                        if (client.readyState === ws.OPEN) {
                            sendToClient(client, PACKET_TYPE.PLAYER_COUNT_CHANGED, {
                                participantCount: roomInfo.participants.length
                            })
                        }
                    });
                }
                break;

            case PACKET_TYPE.GET_ROOM_INFO:
                const info = getROo
            default:
                // 알 수 없는 타입 처리
                sendError(ws, '알 수 없는 이벤트 타입입니다.');
        }
    });
}

module.exports = {
    handleRoomEvents,
}
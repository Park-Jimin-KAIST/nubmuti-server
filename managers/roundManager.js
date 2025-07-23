const { room } = require('./roomManager');

function getCurrentPlayer() {
    const currentId = room.gameState.turn.currentPlayer;
    return room.participants.find(p => p.id === currentId);
}

/**
 * 턴 진행: 플레이어에게 행동 권한 부여
 * (프론트엔드에서 카드 내기/패스 요청이 오면 아래 playCard/pass 함수 호출)
 */

/**
 * 모두 패스했는지 체크
 * @returns {boolean}
 */
function isAllPassed() {
    const passCount = room.gameState.turn.passCount || 0;
    const totalPlayers = room.participants.length;
    
    return passCount === totalPlayers - 1;
}

function startRound() {
    return { message: `${room.gameState.round}라운드 시작` };
}

/**
 * 카드 내기
 * @param {WebSocket} ws 제출 버튼을 누른 참가자의 소켓 ID
 * @param {Array} cards 참가자가 제출 버튼을 눌러 낸 카드 배열, 프론트엔드에서 넘어온 정보
 * @returns {Object}
 */
function playCard(ws, cards) {
    // 1. Check if it's the player's turn
    if (room.gameState.turn.currentPlayer.ws !== ws) {
        return { success: false, message: '당신의 턴이 아닙니다'};
    }
    // 2. Check validity of the cards
    const isValid = validatePlay(cards);
    if (!isValid.success) {
        sendToClient(ws, PACKET_TYPE.INVALID_CARD, { message: isValid.message });
        return { success: false, message: isValid.message };
    }

    // 3. Put the cards on the table
    room.gameState.table.pile.push(cards);

    // 4. Remove the cards from the player's hand
    const player = room.participants.find(p => p.ws === ws);
    cards.forEach(card => {
        const index = player.hand.indexOf(card);
        if (index !== -1) {
            player.hand.splice(index, 1);
        }
    });
    // const isDone = player.hand.length === 0;
    // if (isDone) {
    //     excludeFinishedPlayer(ws);
    // }

    // 5. Next turn
    room.gameState.turn.passCount = 0; // Reset pass count after a card is played
    return { success: true, message: '카드를 내었습니다', isDone, ws }; // 추후 프론트엔드와 논의 후 게임 스테이트 반환 여부 결정
}

// roundHandler.js
//    const { playCard } = require('./roundManager');
//    socket.on('PLAY_CARD', (data) => {
//        const result = playCard(data.playerId, data.cards);
//        if (result.isDone) {
//            io.to(roomId).emit('DONE_ROUND', { playerId: result.playerId });
//        }
//    });
// a client requests PLAY_CARD event -> call playCard function  -> if the player has no cards left, server sends DONE_ROUND event
/**
 * 패스
 * @param {WebSocket} ws
 * @returns {Object}
 */
function pass(ws) {
    // 1. Check if it's the player's turn
    if (room.gameState.turn.currentPlayer.ws !== ws) {
        return { success: false, message: '당신의 턴이 아닙니다'};
    }

    // 2. Pass
    room.gameState.turn.currentPlayer.hasPasses = true;
    room.gameState.turn.passCount++;

    // 3. Next turn
    // nextTurn();

    // // 4. Check if all players have passed
    // if (isAllPassed()) {
    //     room.gameState.table.pile = [];
    //     room.gameState.turn.passCount = 0;
    //     return { success: true, message: '모두 패스했습니다'};
    // }

    return { success: true, message: '패스했습니다'};
}

/**
 * 턴 넘기기
 */
function nextTurn() {
    const order = room.gameState.turn.order;
    const idx = order.indexOf(room.gameState.turn.currentPlayer);

    // 현재 플레이어를 맨 뒤로 보냄
    const [current] = order.splice(idx, 1);
    order.push(current);


    // 다음 턴 플레이어는 맨 앞
    room.gameState.turn.currentPlayer = order[0];
}

/**
 * 카드 내기 유효성 검사
 * @param {Array} cards
 * @returns {Object}
 */

function validatePlay(cards) {
    // 1. IfAllPassed, always return true
    if (isAllPassed()) {
        return { success: true, message: '모두 패스했습니다'};
    }

    // 2. Check the last cards on the table
    const pile = room.gameState.table.pile;
    const lastPlay = pile[pile.length - 1];

    // 3. Check the number of the cards the the current player has submitted
    if (cards.length !== lastPlay.cards.length) {
        return { success: false, message: '카드 개수가 맞지 않습니다'};
    }

    // 4. Check if the number of the cards the the current player has submitted is correct
    /**
     * 조커 카드가 포함되어 있을 때, 만약 제출한 카드 배열의 길이가 1이 아니면(조커 카드를 제외한 다른 카드도 포함되어 있으면), 조커의 숫자를 그 카드의 숫자와 같다고 간주
     * 조커 카드가 포함되어 있을 때, 제출한 카드 배열의 길이가 1이면(조커 카드만 제출했을 때) 조커 카드의 숫자는 11이다.
     * 조커 카드가 포함되어 있지 않으면 그냥 카드의 숫자가 맞는지 확인
     */
    const isJoker = card => card === 11 || card === 12;
    let myNumber;
    if (cards.every(isJoker)) {
        myNumber = 11;
    } else {
        const nonJokerNumbers = cards.filter(card => !isJoker(card));
        myNumber = Math.min(...nonJokerNumbers);
    }
    let tableNumber ;
    if (lastPlay.cards.every(isJoker)) {
        tableNumber = 11;
    } else {
        const nonJokerNumbers = lastPlay.cards.filter(card => !isJoker(card));
        tableNumber = Math.min(...nonJokerNumbers);
    }

    // 5. Check if the number of the cards the the current player has submitted is correct
    if (myNumber >= tableNumber) {
        return { success: false, message: '더 작은 숫자의 카드를 내야 합니다'};
    }
    return { success: true, message: '카드를 내었습니다' };
}

/**
 * 플레이어를 order, participants에서 제외하고 finishedPlayers에 추가
 * @param {WebSocket} ws // the same playerId as the one in the playCard function
 * @returns {Object} { nickname, message }
 */
function excludeFinishedPlayer(ws) {
    // order에서 제거
    const order = room.gameState.turn.order;
    const idx = order.indexOf(ws);
    if (idx !== -1) order.splice(idx, 1);

    // participants에서 제거 및 플레이어 정보 저장
    const pIdx = room.participants.findIndex(p => p.ws === ws);
    let finishedPlayer;
    if (pIdx !== -1) {
        finishedPlayer = room.participants.splice(pIdx, 1)[0];
    }

    // finishedPlayers에 추가
    if (!room.gameState.finishedPlayers) room.gameState.finishedPlayers = [];
    let nickname = '';
    if (finishedPlayer) {
        nickname = finishedPlayer.nickname;
        room.gameState.finishedPlayers.push({
            ws: finishedPlayer.ws,
            nickname: finishedPlayer.nickname,
            rank: room.gameState.finishedPlayers.length + 1
        });
    }

    // 닉네임과 메시지 리턴
    return {
        nickname,
        message: `${nickname}님이 라운드를 끝냈습니다!`
    };
}

/** 
 * 남은 플레이어가 1명인지 확인
 * @returns {boolean}
 */
function isLastPlayer() {
    return room.participants.length === 1;
}

/**
 * 라운드 종료 처리
 * - 마지막 남은 플레이어도 finishedPlayers에 추가
 * - 등수표 반환
 * - 라운드 종료 이벤트 핸들링
 * @return {Object}
 */
function endRound() {
    // 남은 플레이어가 1명인지 확인
    if (isLastPlayer()) {
        const lastPlayer = room.participants[0];
        // finishedPlayers에 추가
        if (!room.gameState.finishedPlayers) room.gameState.finishedPlayers = [];
        room.gameState.finishedPlayers.push({
            ws: lastPlayer.ws,
            nickname: lastPlayer.nickname,
            rank: room.gameState.finishedPlayers.length + 1
        });
        // gameState init
        room.gameState.turn.order = [];
        room.gameState.turn.currentPlayer = null;
        room.gameState.turn.passCount = 0;
        room.gameState.turn.lastPlay = null;
        room.gameState.table.pile = [];
        // 라운드 수 하나 증가
        room.gameState.round++;
        // 등수표 반환
        return {
            success: true,
            message: '라운드가 종료되었습니다',
            rankings: room.gameState.finishedPlayers
        };
    }
    return {
        success: false,
        message: '아직 라운드 종료 조건이 아닙니다'
    };
}

module.exports = {
    getCurrentPlayer,
    startRound,
    playCard,
    pass,
    nextTurn,
    endRound,
    isAllPassed,
}
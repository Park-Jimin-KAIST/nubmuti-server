// 필요한 모듈 import
const { PACKET_TYPE } = require('../socket/packetType');
const { deck } = require('../data');
const { startGame, endGame, readyGame, isGameOver } = require('../managers/gameManager');
const { room } = require('../managers/roomManager');
const { startRound, playCard, pass, nextTurn, endRound , isAllPassed} = require('../managers/roundManager');
const { assignRanksByRankCard, dealRankCards, setTurnOrder, dealCards, exchangeCards, shuffleDeck } = require('../managers/initManager');
const { sendToClient, broadcastToAll, parseMessage, sendError, sendEachClient, sendUpdateHand, sendUpdateHandAll } = require('../socket/websocketUtils');

/**
 * 라운드 시작 START_ROUND ~ EXCHANGE_INFO_2까지 시간 간격을 두고 자동으로 서버에서 시그널을 보내 UI 호출
 * @param {WebSocket.server} wss 
 */
function startGameSequence(wss) {
    // passCount를 전역으로 관리
    let passCount = 0;
    // 1. START_ROUND (1초 후)
    setTimeout(() => {
        const { message } = startRound();
        broadcastToAll(wss, PACKET_TYPE.START_ROUND, { message });

        // 2. FIRST_ROUND_RULES (2초 후)
        setTimeout(() => {
            broadcastToAll(wss, PACKET_TYPE.FIRST_ROUND_RULES, { message: '첫번째 라운드는 무작위로 분배된 카드의 랭크대로 순서가 정해집니다' });

            // 3. SHUFFLE_CARDS (2초 후)
            setTimeout(() => {
                broadcastToAll(wss, PACKET_TYPE.SHUFFLE_CARDS, { message: '카드를 섞는 중입니다' });

                // 4. DEAL_ONE_CARD (애니메이션 끝나면, 예: 1.5초 후)
                setTimeout(() => {
                    broadcastToAll(wss, PACKET_TYPE.DEAL_ONE_CARD, { message: '카드를 한장씩 분배합니다' });
                    const order = room.gameState.turn.order.map(nickname =>
                        room.participants.findIndex(p => p.nickname === nickname)
                      );
                    // broadcastToAll(wss, PACKET_TYPE.ALL_INFO, { 
                    //     nicknames: room.participants.map(p => p.nickname),
                    //     hands: room.participants.map(p => p.hand),
                    //     ranks: room.participants.map(p => p.rank),
                    //     order: order
                    // });
                   // 5. YOUR_CARD (애니메이션 끝나면, 예: 1.5초 후)
                    setTimeout(() => {
                        // 각 플레이어별 카드 정보 보내기
                        // 예시: dealRankCards() 결과를 각자에게
                        // participants.forEach(p => sendToClient(p.ws, PACKET_TYPE.YOUR_CARD, ...));
                        dealRankCards();
                        sendEachClient(room.participants, PACKET_TYPE.YOUR_CARD, (player) => ({
                            cardNumber: player.rankCardNumber,
                            cardName: player.rankCard,
                            message: `당신의 카드는 ${player.rankCard}입니다`
                        }));

                        // 6. YOUR_RANK (2초 후)
                        setTimeout(() => {
                            assignRanksByRankCard();
                            sendEachClient(room.participants, PACKET_TYPE.YOUR_RANK, (player) => ({
                                rank: player.rank,
                                message: `당신의 계급은 ${player.rank}입니다`
                            }));

                            setTimeout(() => {
                                setTurnOrder();
                                // 각 참가자에게 자신의 순서를 안내
                                sendEachClient(room.participants, PACKET_TYPE.YOUR_ORDER, (player) => {
                                    const order = room.gameState.turn.order.indexOf(player.nickname) + 1; // 1번부터 시작
                                    return {
                                        order,
                                        message: `당신의 순서는 ${order}번째 입니다`
                                    };
                                });
                            }, 3000)

                        }, 3000);

                    }, 1500);

                }, 1500);

            }, 2000);

        }, 2000);

    }, 2000);
}

function startRoundSequence(wss) {
    setTimeout(() => {
        // 순서 변경: 먼저 ALL_INFO, 그 다음 ROUND_STARTED
        setTimeout(() => { 
            broadcastToAll(wss, PACKET_TYPE.NEXT_PAGE, { success: true });
            setTimeout(()=>{
                sendEachClient(room.participants, PACKET_TYPE.ROUND_STARTED, (player) => ({
                    success: true,
                    message: '라운드가 시작되었습니다',
                    nickname: player.nickname
                }));
                broadcastToAll(wss, PACKET_TYPE.ALL_INFO, { 
                    nicknames: room.participants.map(p => p.nickname),
                    hands: room.participants.map(p => p.hand),
                    ranks: room.participants.map(p => p.rank),
                    order: room.gameState.turn.order.map(nickname =>
                        room.participants.findIndex(p => p.nickname === nickname)
                )
                });
            },2000);
            setTimeout(() => {
                dealCards(shuffleDeck(deck.cards));
                broadcastToAll(wss, PACKET_TYPE.DEAL_CARDS, { message: '카드를 분배합니다' });
                sendUpdateHandAll(room.participants);
                setTimeout(() => {
                    broadcastToAll(wss, PACKET_TYPE.EXCHANGE_INFO, { message: '넙죽이와 이광형은 버릴 카드를 선택하세요' });
                    setTimeout(() => {
                        sendEachClient(room.participants, PACKET_TYPE.EXCHANGE_INFO_2, (player) => ({
                            nubjukOrLkh: player.rank === '넙죽이' || player.rank === '이광형'
                        }));
                    }, 2000);
                }, 2000);
            }, 2000);
        }, 2000);
    }, 2000);
}

/**
 * 라운드 관련 이벤트 처리
 * @param {WebSocket} ws 
 * @param {WebSocket.Server} wss 
 */
function handleRoundEvents(ws, wss) {
    ws.on('message', (msg) => {
        const parsed = parseMessage(msg);
        if (!parsed || parsed.success === false) {
            sendError(ws, '메시지 파싱 오류', parsed?.error);
            return;
        }
        const { signal, data } = parsed;
        console.log("signal", signal)
        switch (signal) {
            case PACKET_TYPE.START_GAME:
                const startResult = startGame(ws);
                broadcastToAll(wss, PACKET_TYPE.START_GAME, startResult);
                if (startResult.success) {
                    startGameSequence(wss); // 시퀀스 시작!
                }
                break;
            
            // case PACKET_TYPE.NEW_ROUND:
            //     startGameSequence(wss);
            //     break;

            case PACKET_TYPE.ROUND_STARTED:
                const player = room.participants.find(p => p.ws === ws);
                player.isReady = true;
                if (room.participants.every(p => p.isReady)) {
                    startRoundSequence(wss);
                }
                break;

            case PACKET_TYPE.THROW_SUBMIT: {
                // data: { cards: [...] }
                const player = room.participants.find(p => p.ws === ws);
                if (!player) {
                    sendError(ws, '플레이어 정보를 찾을 수 없습니다.');
                    break;
                }

                // 제출 카드 유효성 검사
                if (player.rank === '넙죽이' && (!data.cards || data.cards.length !== 2)) {
                    sendToClient(ws, PACKET_TYPE.SHOW_MESSAGE, { success: false, message: '넙죽이는 반드시 2장의 카드를 선택해야 합니다.' });
                    break;
                }
                if (player.rank === '이광형' && (!data.cards || data.cards.length !== 1)) {
                    sendToClient(ws, PACKET_TYPE.SHOW_MESSAGE, { success: false, message: '이광형은 반드시 1장의 카드를 선택해야 합니다.' });
                    break;
                }

                // 제출 카드 저장
                player.submittedCards = data.cards;

                // 모든 제출이 끝났는지 확인 (넙죽이, 이광형만 체크)
                const nubjuki = room.participants.find(p => p.rank === '넙죽이');
                const lkh = room.participants.find(p => p.rank === '이광형');
                if (!nubjuki?.submittedCards || !lkh?.submittedCards) {
                    // 아직 제출 안 한 사람이 있으면 대기
                    break;
                }

                // 꼴찌(대학원생)와 그 다음 꼴찌(연차초과자) 찾기
                const grad = room.participants.find(p => p.rank === '대학원생');
                const overYear = room.participants.find(p => p.rank === '연차초과자');

                // 대학원생의 가장 낮은 카드 2장
                const gradBest = grad.hand.slice().sort((a, b) => a - b).slice(0, 2);
                // 연차초과자의 가장 낮은 카드 1장
                const overYearBest = overYear.hand.slice().sort((a, b) => a - b)[0];

                // 넙죽이와 대학원생 카드 교환
                // 넙죽이 제출 카드 제거
                nubjuki.submittedCards.forEach(card => {
                    const idx = nubjuki.hand.indexOf(card);
                    if (idx !== -1) nubjuki.hand.splice(idx, 1);
                });
                // 대학원생 카드 제거
                gradBest.forEach(card => {
                    const idx = grad.hand.indexOf(card);
                    if (idx !== -1) grad.hand.splice(idx, 1);
                });
                // 서로 교환
                nubjuki.hand.push(...gradBest);
                grad.hand.push(...nubjuki.submittedCards);

                // 이광형과 연차초과자 카드 교환
                // 이광형 제출 카드 제거
                lkh.submittedCards.forEach(card => {
                    const idx = lkh.hand.indexOf(card);
                    if (idx !== -1) lkh.hand.splice(idx, 1);
                });
                // 연차초과자 카드 제거
                const overIdx = overYear.hand.indexOf(overYearBest);
                if (overIdx !== -1) overYear.hand.splice(overIdx, 1);

                // 서로 교환
                lkh.hand.push(overYearBest);
                overYear.hand.push(...lkh.submittedCards);

                // 제출 카드 정보 초기화
                nubjuki.submittedCards = null;
                lkh.submittedCards = null;

                // 교환 완료 시그널 등 추가
                broadcastToAll(wss, PACKET_TYPE.EXCHANGE_DONE, { message: '카드 교환이 완료되었습니다. 첫번째 플레이어는 카드를 제출해주세요' });
                console.log(room.gameState.turn.currentPlayer);
                sendToClient(room.participants.find(p => p.nickname === room.gameState.turn.currentPlayer).ws, PACKET_TYPE.YOUR_TURN, { message: '당신의 턴입니다' });
                sendUpdateHandAll(room.participants);
                break;
            }

            case PACKET_TYPE.PLAY_CARD:
                const currentPlayer = room.participants.find(p => p.nickname === room.gameState.turn.currentPlayer);
                const playResult = playCard(ws, data.cards);
                console.log("Sent Signal to next player")
                console.log(currentPlayer.nickname);
                if (playResult.success) {
                    sendToClient(ws, PACKET_TYPE.INVALID_CARD, { success: true, message: playResult.message });
                } else {
                    sendToClient(ws, PACKET_TYPE.INVALID_CARD, { success: false, message: playResult.message });
                    break;
                }
                console.log("data.cards", data.cards);
                passCount = 0;
                sendUpdateHandAll(room.participants);
                // 마지막으로 push된 cards 정보를 가져옵니다.
                // 네, 가능합니다. request를 보낸 사람(ws) 빼고 나머지 모든 참가자에게만 보내려면 아래처럼 하면 됩니다.
                room.participants.forEach(p => {
                    if (p.ws !== ws) {
                        sendToClient(p.ws, PACKET_TYPE.PILE_UPDATE, { playerId: room.gameState.turn.currentPlayer, cards: data.cards });
                    }
                });
                //broadcastToAll(wss, PACKET_TYPE.PILE_UPDATE, { playerId: room.gameState.turn.currentPlayer, cards: data.cards });
               if (!room.gameState.turn.currentPlayer) {
                    if (room.gameState.turn.currentPlayer.hand.length === 0) {
                        const { nickname, message } = excludeFinishedPlayer(ws);
                        broadcastToAll(wss, PACKET_TYPE.DONE_ROUND, { message: `${nickname}님이 라운드를 끝냈습니다!` });
                        if (room.participants.length === 1) {
                            endRound();
                            if (isGameOver()) {
                                endGame();
                                broadcastToAll(wss, PACKET_TYPE.END_GAME, { message: '게임이 종료되었습니다' });
                            } else {
                                broadcastToAll(wss, PACKET_TYPE.END_ROUND, { message: `${room.gameState.round}라운드를 끝냈습니다` });
                            }
                        }
                    }
                }
                sendToClient(ws, PACKET_TYPE.END_TURN, { isTurnOver: true });
                broadcastToAll(wss, PACKET_TYPE.ALL_INFO, { 
                    nicknames: room.participants.map(p => p.nickname),
                    hands: room.participants.map(p => p.hand),
                    ranks: room.participants.map(p => p.rank),
                    order: room.gameState.turn.order.map(nickname =>
                        room.participants.findIndex(p => p.nickname === nickname)
                    )
                });
                sendToClient(ws, PACKET_TYPE.UPDATE_HAND, { hand: currentPlayer.hand });
                console.log("room.gameState.turn.currentPlayer", room.gameState.turn.currentPlayer);
                // 아니요, room.gameState.turn.currentPlayer가 nickname(string)일 경우 .ws를 붙이면 undefined가 나옵니다.
                // 만약 currentPlayer가 string(nickname)이라면, 해당 nickname을 가진 참가자 객체를 찾아서 .ws를 사용해야 합니다.
                // 예시:
                // const nextPlayerWs1 = currentPlayerObj ? currentPlayerObj.ws : undefined;
                // //const nextPlayerWs1 = room.gameState.turn.currentPlayer.ws;
                // sendToClient(nextPlayerWs1, PACKET_TYPE.YOUR_TURN, { message: '당신의 턴입니다' });
                // // 모든 Client에게 현재 누구의 턴인지 보내줌
                const currentPlayer2 = room.gameState.turn.currentPlayer;
                room.participants.forEach(p => {
                    if (p.nickname !== currentPlayer) { // 또는 p.id !== currentPlayer.id, p.ws !== currentPlayer.ws 등 상황에 맞게
                        sendToClient(p.ws, PACKET_TYPE.CURRENT_TURN, { 
                            nickname: currentPlayer
                        });
                    }
                });
                sendToClient(room.participants.find(p => p.nickname === currentPlayer2).ws, PACKET_TYPE.YOUR_TURN, { message: '당신의 턴입니다' });
                break;

            case PACKET_TYPE.PASS:
                broadcastToAll(wss, PACKET_TYPE.HAS_PASSED, { message: `${room.participants.find(p => p.ws === ws).nickname} 패스` });
                pass(ws);
                nextTurn();
                
                broadcastToAll(wss, PACKET_TYPE.ALL_INFO, { 
                    nicknames: room.participants.map(p => p.nickname),
                    hands: room.participants.map(p => p.hand),
                    ranks: room.participants.map(p => p.rank),
                    order: room.gameState.turn.order.map(nickname =>
                        room.participants.findIndex(p => p.nickname === nickname)
                    )
                });
                passCount++;
                //const nextPlayerWs2 = room.gameState.turn.currentPlayer.ws;
                const currentPlayerObj2 = room.participants.find(p => p.nickname === room.gameState.turn.currentPlayer);
                const nextPlayerWs2 = currentPlayerObj2 ? currentPlayerObj2.ws : undefined;
                console.log("passCount", passCount);
                if (passCount === room.participants.length - 1) {
                    sendToClient(nextPlayerWs2, PACKET_TYPE.YOUR_TURN, { message: '당신의 턴입니다' });
                    broadcastToAll(wss, PACKET_TYPE.ALL_PASSED, { message: '모두 패스했습니다.' });
                    broadcastToAll(wss, PACKET_TYPE.CURRENT_TURN, { 
                        nickname: room.gameState.turn.currentPlayer
                    });
                } else {
                    sendToClient(nextPlayerWs2, PACKET_TYPE.YOUR_TURN, { message: '당신의 턴입니다' });
                    broadcastToAll(wss, PACKET_TYPE.CURRENT_TURN, { 
                        nickname: room.gameState.turn.currentPlayer
                    });
                }
                break;

        }
    });
}

module.exports = {
    handleRoundEvents,
};
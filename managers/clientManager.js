// clientId -> clientInfo
const clients = new Map();

/**
 * @typedef {Object} clientInfo
 * @property {string} clientId         // 소켓 연결 고유 ID
 * @property {WebSocket} socket        // WebSocket 객체
 * @property {number} connectedAt      // 최초 연결 시각 (timestamp)
 * @property {number} lastActivity     // 마지막 활동 시각 (timestamp)
 * @property {boolean} isAlive         // ping/pong 등으로 연결 상태 체크
 * @property {Object|null} player      // Player 객체 (게임 참가 시)
 * @property {string|null} roomId      // 현재 속한 방 ID
 * @property {string} nickname         // 닉네임 (로그인/회원가입 시)
 * @property {Object} auth             // 인증 관련 정보
 * @property {boolean} auth.isAuthenticated // 인증 여부
 * @property {string|null} auth.token  // 인증 토큰
 */
const clientInfo = {
    cliendId: '',
    socket: null,
    connectedAt: Date.now(),
    lastActivity: Date.now(),
    isAlive: true,
    player: null,
    roomId: null,
    nickname: '',
    auth: {
        isAuthenticated: false,
        token: null
    }
};

function addClient(clientId, socket) {
    clients.set(clientId, {
        clientId,
        socket,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
        isAlive: true,
        player: null,
        roomId: null,
        nickname: '',
        auth: {
            isAuthenticated: false,
            token: null
        }
    });
}

function removeClient(clientId) {
    clients.delete(clientId);
}

function getClientInfo(clientId) {
    return clients.get(clientId);
}

function updateClientInfo(clientId, updates) {
    const info = clients.get(clientId);
    if (info) {
        Object.assign(info, updates);
        info.lastActivity = Date.now();
    }
}

function getAllClients() {
    return Array.from(clients.values());
}

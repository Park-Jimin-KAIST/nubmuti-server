// socket/event.js

const PACKET_TYPE = { 
    // Ping
    PING: 1,
    PONG: 2,
  
    // Room
    ENTER_ROOM: 1001,
    LEAVE_ROOM: 1002,
    GET_ROOM_INFO: 1003,
    CREATE_ROOM: 1004,
    READY_GAME: 1011,
  
    // Game
    START_GAME: 1010,
    END_GAME: 3000,

    // Round
    START_ROUND: 1020,
    END_ROUND: 1021,
    PLAY_CARD: 1022,
    PASS: 1023,
    END_TURN: 1024,  
    DONE_ROUND: 1025,

    // Exeption
    INVALID_CARD: 1030,
    OUT_OF_TURN: 1031,
    RETRY_CARD: 1032,

    // Auth
    LOGIN: 4001,
    CREATE_ACCOUNT: 4000,
  
    // Server Push (or duplicated response)
    PLAYER_COUNT_CHANGED: 1005,
  };
  
  module.exports = {
    PACKET_TYPE,
  };
  
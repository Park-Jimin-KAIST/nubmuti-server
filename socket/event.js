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
    YOUR_TURN: 1022,
    PLAY_CARD: 1023,
    PASS: 1024,
    ALL_PASSED: 1025,
    END_TURN: 1026,  
    DONE_ROUND: 1027,

    // Exeption
    INVALID_CARD: 1030,
    OUT_OF_TURN: 1031,
    RETRY_CARD: 1032,
    CANT_ENTER_ROOM: 1033,

    // Auth
    LOGIN: 4001,
    CREATE_ACCOUNT: 4000,
  
    // Server Push (or duplicated response)
    PLAYER_COUNT_CHANGED: 1005,
  };
  
  module.exports = {
    PACKET_TYPE,
  };
  
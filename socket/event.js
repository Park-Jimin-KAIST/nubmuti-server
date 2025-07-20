// socket/event.js

const PACKET_TYPE = { 
    // Ping
    PING: 1,
    PONG: 2,
  
    // Room
    ENTER_ROOM: 1001, //입장하기 버튼, 닉네임 입력란
    LEAVE_ROOM: 1002, // 뒤로 가기 버튼
    GET_ROOM_INFO: 1003, // 방 정보(현재 참가 인원수) 나타내는 UI
    CREATE_ROOM: 1004,
    YOU_ARE_HOST: 1005, // 방장 - 게임 시작하기 버튼이 있는 UI
    READY_GAME: 1011, // 시작하기 버튼이 활성화된 UI
    PLAYER_COUNT_CHANGED: 1012, // 참가자 수 업데이트
  
    // Game
    START_GAME: 1010, // 게임 UI로 넘어감
    END_GAME: 3000, // 완전히 종료됐을 때 필요한 UI

    // Round
    START_ROUND: 1020, // Round1 등등 알아서 구현 ^^
    END_ROUND: 1021, // round 변수 변하면 모든 클라이언트한테 시그널 보내서 round 올라간 UI
    YOUR_TURN: 1022, // 내 턴임을 알 수 있는 UI
    PLAY_CARD: 1023, // 제출 버튼
    PASS: 1024, // 패스 버튼
    ALL_PASSED: 1025, // 모두 패스했을 때 알려주는 UI
    END_TURN: 1026, // 이 시그널 받고 YOUR_TURN UI 비활성화
    DONE_ROUND: 1027, // 특정 참가자가 카드를 다 내거나, 꼴찌가 됐을 때 알려주는 UI

    // Exeption
    INVALID_CARD: 1030, // 카드 숫자가 안 맞을 때, 카드 개수가 안 맞을 때, 카드 제출이 성공했을 때 UI
    OUT_OF_TURN: 1031, //
    RETRY_CARD: 1032,
    CANT_ENTER_ROOM: 1033,

    // // Auth
    // LOGIN: 4001,
    // CREATE_ACCOUNT: 4000,
  };
  
  module.exports = {
    PACKET_TYPE,
  };
  
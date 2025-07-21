// socket/event.js

const PACKET_TYPE = { 
    // Ping
    PING: 1,
    PONG: 2,
  
    // Room
    ENTER_ROOM: 1001, //입장하기 버튼, 닉네임 입력란
    LEAVE_ROOM: 1002, // 뒤로 가기 버튼
    CREATE_ROOM: 1004,
    YOU_ARE_HOST: 1005, // 방장 - 게임 시작하기 버튼이 있는 UI
    READY_GAME: 1006, // 시작하기 버튼이 활성화된 UI
    PLAYER_COUNT_CHANGED: 1007, // 참가자 수 업데이트
  
    // Game
    START_GAME: 1010, // 게임 UI로 넘어감
    END_GAME: 3000, // 완전히 종료됐을 때 필요한 UI

    // Round
    NEW_ROUND: 1019, // 새로운 라운드 시작
    START_ROUND: 1020, // Round1 등등 알아서 구현 ^^
    END_ROUND: 1021, // round 변수 변하면 모든 클라이언트한테 시그널 보내서 round 올라간 UI
    FIRST_ROUND_RULES: 1022, // 1라운드 규칙 알려주는 UI "첫번째 라운드는 무작위로 분배된 카11드의 랭크대로 순서가 정해집니다"
    SHUFFLE_CARDS: 1023, // 카드 섞는 UI
    DEAL_ONE_CARD: 1024, // 카드를 한장만 나눠주는 애니메이션
    UPDATE_HAND: 1025, // 카드 분배 안내 "카드를 분배합니다"
    YOUR_CARD: 1026, // 무작위로 나에게 분배된 카드를 나타내는 UI "당신의 카드는 이광형입니다"
    YOUR_RANK: 1103, // 내 계급 안내 "$room.gameState.round번째 라운드 당신의 계급은 이광형입니다"
    YOUR_ORDER: 1104, // 내 순서 안내 "순서는 2번째입니다"
    ROUND_STARTED: 1105, // 라운드 시작 안내 "1라운드가 시작되었습니다"
    DEAL_CARDS: 1106, // 카드 분배 안내 "카드를 분배합니다"
    EXCHANGE_PHASE: 1107, // 카드 교환 단계 안내 "카드 교환 단계입니다"
    EXCHANGE_INFO: 1108, // "넙죽이와 이광형은 버릴 카드를 선택하세요"
    EXCHANGE_INFO_2: 1109, // 넙죽이와 이광형 클라이언트에게 버릴 카드를 선택하는 UI 띄워주기
    THROW_SUBMIT: 1110, // 버릴 카드 제출 버튼1
    EXCHANGE_DONE: 1111, // "카드 교환이 완료되었습니다"
    YOUR_TURN: 1112, // 내 턴임을 알 수 있는 UI "당신의 턴입니다"
    PLAY_CARD: 1113, // 제출 버튼
    PASS: 1114, // 패스 버튼
    ALL_PASSED: 1115, // 모두 패스했을 때 알려주는 UI
    END_TURN: 1116, // 이 시그널 받고 YOUR_TURN UI 비활성화
    DONE_ROUND: 1028, // 특정 참가자가 카드를 다 내거나, 꼴찌가 됐을 때 알려주는 UI

    // Exeption
    INVALID_CARD: 1030, // 카드 숫자가 안 맞을 때, 카드 개수가 안 맞을 때, 카드 제출이 성공했을 때 UI
    OUT_OF_TURN: 1031, // 현재 턴이 아닐 때 알려주는 UI
    RETRY_CARD: 1032, // 카드 제출 실패 시 다시 제출 버튼 활성화
    CANT_ENTER_ROOM: 1033, // 방 입장 실패 시 알려주는 UI

    // // Auth
    // LOGIN: 4001,
    // CREATE_ACCOUNT: 4000,
  };
  
  module.exports = {
    PACKET_TYPE,
  };
  
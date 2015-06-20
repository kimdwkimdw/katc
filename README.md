# 육군훈련소의 부대 배치를 알려드립니다.

## Usage

```sh
node main.js
```

실행전에 (`config.js`, `channel_config.js`) 두 파일을 .example파일을 참고하여 만들어주세요.

## Configuration

- config.js
    - `startDate`: 입영일자
    - `birthDay`: 생년월일 (YYMMDD)
    - `name`: 이름

- channel_config.js
    - CHANNEL_NAME: 채널 이름
    - `send`: 해당 채널에 실제로 보낼때 사용되게 되는 함수.
    
    
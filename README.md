# Iptime기기의 RestAPI 지원 모듈

Iptime에서 따로 제공해주지 않는 API를 제공해주기 위하여 구현하였음. 현재 제공해주는 기능은 포트포워딩을 삭제, 수정, 추가를 해주는 기능만 있습니다. 현재 기능은 Restful 형식으로 제공해 주고 있습니다.

## 설치 방법

### 도커를 이용한 설치
```sh
$ docker run -d -p {host port}:3000 aoikazto/iptime-n104t
```

### Git을 이용한 설치
```sh
$ git clone https://github.com/asw-dod/iptime-N104T.git
$ cd iptime-N104T
$ npm run start
```

## 지원 IPTIME 기기

- N104T, 펌웨어 : 9.58, 2015년 4월 16일 (목)
- 추가 확인이 된다면 추가 함.

## 지원 기능

- 포트포워딩
  -  추가
  -  수정
  -  삭제
  -  일괄 삭제
  -  일괄 추가

## 옵션 

> .env 파일에서 수정이 가능함.

- GatewayIP 주소
  - 예) http://192.168.0.1
- RestAPI 서버의 접근 포트
  - 예) 3000
  - 접근 방식 : 127.0.0.1:3000

## 지원 하는 명령어

모든 통신에는 Authorization이 따로 존재 하지 않음.

```txt
GET/ http://localhost:3000/port-forward
GET/ http://localhost:3000/port-forward/{id}

POST/ http://localhost:3000/port-forward

PUT/ http://localhost:3000/port-forward/{id}

DELETE/ http://localhost:3000/port-forward
DELETE/ http://localhost:3000/port-forward/{id}
```

### GET 메소드 
> 전체 응답
```json
{
	"max": 32,
	"count": 26,
	"data": [{
		"id": 151323137,
		"text": {
			"name": "ipsec",
			"sourcePort": "500-500",
			"protocol": "udp",
			"ip": "192.168.42.130",
			"destPort": "500"
		}
	}]
}
```

> 개별 응답
```json
{
	"result": {
		"name": "ipsec",
		"sourcePort": "500-500",
		"protocol": "udp",
		"ip": "192.168.42.130",
		"destPort": "500"
	}
}
```

### POST 메소드의 Body
> 요청
```json
[{
		"name": "test",
		"sourcePort": "4333-4334",
		"protocol": "tcp",
		"ip": "192.168.42.4",
		"destPort": 4443
	}
]
```

> 응답 
```json
{
	"result": [{
		"id": 151323163,
		"text": {
			"name": "test",
			"sourcePort": "4333-4334",
			"protocol": "tcp",
			"ip": "192.168.42.4",
			"destPort": "4443"
		}
	}]
}
```


### PUT 메소드의 Body

> 요청
```json
{
	"name": "test3",
	"sourcePort": "4333-4334",
	"protocol": "udp",
	"ip": "192.168.42.4",
	"destPort": "4444"
}
```

> 응답
```json
{
	"result": {
		"id": 151323163,
		"text": {
			"name": "test3",
			"sourcePort": "4333-4334",
			"protocol": "udp",
			"ip": "192.168.42.4",
			"destPort": "4444"
		}
	}
}
```

### DELETE 메소드의 Body
> 요청 : 데이터를 여러개 보내는 경우
```json 
{
	"data": [151323164, 151323163]
}
```

> 요청 : 1개만 지우는 경우
```sh
$ 없음
```

> 응답
```sh
$ 삭제 후 GET과 같음
{
	"result": [{
		"id": 151323137,
		"text": {
			"name": "ipsec",
			"sourcePort": "500-500",
			"protocol": "udp",
			"ip": "192.168.42.130",
			"destPort": "500"
		}
	}]
}
```

## TODO:

- 수정, 추가 요청이 온다면 그때 진행 함. [요청 페이지](https://github.com/asw-dod/iptime-N104T/issues/new)


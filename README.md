# Waveform 멀티트랙 오디오 편집기

브라우저 안에서 오디오를 가져오고 편집하는 React, TypeScript, Vite 기반 멀티트랙 편집기입니다. 오디오 처리와 프로젝트 저장은 기기 안에서 이루어지며 백엔드 서버를 사용하지 않습니다.

## 로컬에서 실행하기

Node.js와 npm이 설치된 환경에서 프로젝트 폴더를 열고 아래 명령을 실행합니다.

```sh
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 여세요. pnpm을 사용하는 경우 `pnpm install`과 `pnpm dev`를 실행할 수 있습니다. `index.html`을 파일로 직접 열지 마세요. React 앱은 개발 서버 또는 배포된 웹사이트에서 실행해야 합니다.

## GitHub Pages에 배포하기

`main` 브랜치에 변경 사항을 올리면 GitHub Actions가 패키지를 설치하고 테스트와 빌드를 수행한 뒤 `dist` 폴더를 GitHub Pages에 배포합니다. 저장소 설정의 **Settings → Pages → Build and deployment → GitHub Actions**를 선택하세요.

## 편집 기능

- 여러 오디오 파일 가져오기와 드래그 앤 드롭
- WaveSurfer.js 기반 파형 표시
- 트랙 추가/삭제, 음량 조절, 음소거와 솔로
- 클립 선택, 트랙 간 이동, 0.1초 단위 클립 이동과 시작/끝 자르기
- 재생 위치에서 클립 나누기, 선택 클립 삭제
- 동기화된 다중 트랙 재생, 일시 정지, 정지, 처음으로 이동
- 트랙 위치, 음량, 클립 게인, 페이드와 음소거/솔로를 반영한 WAV 믹스 내보내기
- IndexedDB 자동 저장, 저장된 프로젝트 다시 열기, 새로고침 후 최근 프로젝트 복구
- 실행 취소/다시 실행 및 Ctrl/Cmd+S, Ctrl/Cmd+Z, Space, Delete 단축키
- 휴대폰에서의 파일 가져오기, 트랙 확인, 기본 클립 조작, 재생과 저장 지원

가져온 원본 파일은 브라우저의 IndexedDB에 보관합니다. 사이트의 브라우저 데이터를 지우거나 다른 브라우저/기기로 옮기면 저장한 프로젝트와 파일도 함께 사라질 수 있습니다. 중요한 파일은 원본을 별도로 보관하세요.

## 검사 명령

- `npm test`: 타임라인 계산과 WAV 인코더 테스트
- `npm run typecheck`: TypeScript 검사
- `npm run build`: TypeScript 검사와 배포용 빌드

## 구성

- `src/audio`: Web Audio 재생 엔진, 파일 분석, 오프라인 믹스 및 WAV 인코딩
- `src/storage`: IndexedDB 프로젝트 및 원본 오디오 저장소
- `src/store`: Zustand 기반 편집 상태와 실행 취소/다시 실행
- `src/timeline`: 타임라인 시간·위치 계산
- `src/components`: 헤더, 트랙 패널, 파형 클립, 타임라인, 재생 컨트롤

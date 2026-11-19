# WW3

three.js로 만든 단일 HTML 현대전 FPS. 통일 한국 vs 중·러 연합군.

## 빌드

```bash
npm install          # three.js (애드온을 HTML 안에 넣기 위해 필요)
python3 build.py     # → dist/WW3.html
```

`dist/WW3.html` 파일 하나만 있으면 브라우저에서 바로 실행돼요. three.js 본체는 CDN(jsDelivr)에서 불러와요.

## 구조

작업은 `src/` 안에서 기능·미션별 파일로 하고, `build.py`가 `src/manifest.txt` 순서대로 이어 붙여 HTML 한 개로 만들어요.
모든 파일은 같은 스크립트 범위를 공유해요(모듈 import 없음). 그래서 **파일 순서가 곧 로드 순서**예요.
새 파일을 만들면 `manifest.txt`에 꼭 추가하세요. 빠진 `.js` 파일은 빌드할 때 경고가 떠요.

| 폴더 | 내용 |
|---|---|
| `src/engine/` | 렌더러·후처리, 조명·하늘, 텍스처·재질, 게임 상태·충돌, 파티클, 지형, 오디오 |
| `src/entities/` | 예광탄, 병사 메시, 병사 AI(Actor), 차량 물리(Vehicle), 투사체·폭발, 월드 도우미 |
| `src/models/` | 전차·장갑차, 전투기, 차륜형, 헬기, 함정, ACV, 강습상륙함, 수송기(Il-76), 무궁화호 |
| `src/world/` | 공용 소품(`props.js`), 서울 맵(`seoul/`: 한강·노선·한강대로·랜드마크·도시 조립·헬기 탑승·서울역·63빌딩) |
| `src/game/` | 무기·플레이어, 튜토리얼, 뷰모델, 입력, 사격·피해, HUD, 스크립트 API, 미션 런타임·뉴스, 분대 대화·전투 감독, 메뉴, 메인 루프, 작전 지도 |
| `src/missions/` | `act1/` 프롤로그·미션 1~5, `act2/` 미션 6~8, `act3/` 미션 9~14·에필로그, `sample.js` 그래픽 샘플 |
| `src/boot.js` | 시작 |
| `src/shell.html` | HTML 껍데기(메뉴·HUD 마크업, CSS) |

각 미션 파일에는 그 미션의 맵을 짓는 함수가 `defMission(...)` 앞에 같이 들어 있어요. `00-shared*.js`는 그 막(act)에서 함께 쓰는 함수예요.
`missions/act2/m7-systems.js`는 미션 7의 전투 연출(편대 비행, 공수 강하, 서울역 폭격, 공병, 조명탄 등)이에요.

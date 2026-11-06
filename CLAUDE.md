# 더치페이 Dutch Pay

## 프로젝트 개요
모바일·데스크탑 반응형 더치페이 정산 앱. `index.html` 중심으로 구성된 PWA.
Dropbox 연동으로 데이터 백업. 소유자(조상현)가 혼자 사용하며 친구들에게 링크를 공유.

## 라이브 URL / 저장소
- **라이브:** https://sh4sh-ux.github.io/dutch-pay/
- **GitHub:** https://github.com/sh4sh-ux/dutch-pay (HTTPS)
- **브랜치:** main (PR → squash merge)

## 파일 구조
```
index.html            — 메인 앱 (전체 로직 포함)
category-icons-1~4.js — 카테고리 SVG 16종 (index.html이 직접 로드)
category-grid.css/.js — 카테고리 선택 그리드
test.html             — 계산 로직 테스트 (index.html을 iframe으로 불러 실제 함수 검사, http로 열 것)
history.html          — Dropbox OAuth 콜백 리다이렉터
CLAUDE.md             — 이 파일 (세션 컨텍스트용, 최근 변경이력만 유지)
CHANGELOG.md          — 전체 버전 변경이력 보관 (자동 로드 안 됨 — 크레딧 절약)
.gitignore            — .claude/ 제외
sw.js                 — 서비스워커 (PWA, CACHE_NAME과 APP_VERSION 항상 동기화)
manifest.webmanifest  — PWA 매니페스트
favicon.png / icons/  — 아이콘
```

## 현재 버전
**v7.43** (2026-11-06) — 작업 브랜치

## 버전 히스토리 요약
| 버전 | 주요 변경 |
|------|-----------|
| v7.43 | **모바일 기록 보관함 헤더를 공유탭과 픽셀 일치(버전/제목/구분선 높이)+검색창·카드하단 대비 개선+동기화 실패 사유 표시**(사용자: v7.42에도 버전표시·제목·구분선 높이 다르고, 검색창 색이 배경과 구분 안 되고, 카드 밑(이미지/수정/삭제) 영역도 배경과 구분 안 되고, 동기화 실패 계속) — 실측으로 공유탭 `.mob-header`(eyebrow top18·title top55·divider 104) vs 기록 `.hist-page-nav`(eyebrow20·title54·divider101) 2~3px 어긋남 확인 → 기록 nav 패딩 `padTop max(20→18px)`·`row-gap 17→20`·`padBottom 18→21`로 **eyebrow top18=18·title top55=55·24px·divider 104/105 완전 일치**. (2) 검색창 `.hist-dr-sinp` `background:var(--fill2)`(#F8F8FA≈배경#F7F7F8)·테두리없음 → `var(--card)`흰색+`1px var(--sep2)` 테두리로 또렷하게(패딩 9→8로 높이 유지). (3) 카드 하단 `.rc-foot` `background:var(--fill2)`(배경과 비슷) → `var(--card)`로 카드와 통일(상단 border만으로 구분). (4) 동기화 실패 헤더 메시지를 `_syncErrShort()`로 **사유별 표시**(429=요청 제한·507=저장공간 가득·Failed to fetch=네트워크 오류·그외=동기화 실패), 토스트는 기존 상세 유지. 표시 전용·계산 무관. 헤드리스: 공유 vs 기록 eyebrow/title/divider 일치, 검색 bg=흰색·테두리 있음, rc-foot=흰색, 계산 170/170 |
| v7.42 | **영수증 이미지 뷰어의 X·줌 버튼을 화면 고정으로(영수증마다/확대 때 위치 변동·깜빡임 해소)**(사용자: 이미지 줌버튼·X가 모바일에서 고정된 자리여야 하는데 영수증마다 제각각이고, 확대/축소하면 줌버튼이 나타났다 사라졌다 함) — 원인 2가지: (1) `.rcpt-viewer-close`(X)가 `.rcpt-viewer-inner`(이미지 크기에 맞춰진 박스) 기준 `top:-46px`이라 영수증 비율마다 그 박스 위치가 달라져 X가 제각각 이동. (2) `_bindImgZoom`의 컨트롤 자동숨김(v7.12, 1.5초 무동작 시 `ov.classList.add('ui-hidden')`)이 확대/축소 때 깜빡임 유발. **해결**: (1) `_showReceiptViewer` 마크업에서 X 버튼을 `.rcpt-viewer-inner` **밖(= 고정 오버레이 `.rcpt-viewer` 직속)**으로 빼고 CSS를 `position:absolute;top:max(12px,safe);right:max(12px,safe);44×44`(보관 기록 뷰어 `.history-image-viewer-close`와 동일 규격)로 → **항상 화면 오른쪽 위 고정**. 480px 음수 top 오버라이드 제거. (2) `_bindImgZoom`의 `hideUI()`를 **no-op**, `showUI()`는 timer 없이 → 줌·닫기 컨트롤 **항상 표시**. 줌 컨트롤(`.imgzoom-ctl`)은 이미 `ov` 직속이라 하단중앙 고정. `.history-image-viewer`도 같은 `_bindImgZoom` 사용이라 함께 적용(닫기 버튼은 이미 고정이었음). 표시 전용·계산 무관. 헤드리스: 와이드(1200×400)·길쭉(400×1600) 둘 다 X top=12·right=12 동일, 줌 하단중앙 고정, 2.25배 확대+1.8초 후에도 opacity 1(안 사라짐), 계산 170/170 |
| v7.41 | **모바일 기록 보관함을 진짜 다른 탭처럼 — 슬라이드 제거(페이드)+헤더 2줄 구조·높이·제목위치 완전 일치+중복 건수 제거+버튼 우측정렬**(사용자: v7.40에도 기록만 "위에서 올라오는 것처럼" 느껴지고, 구분선 높이·제목/부제목 위치 다르고, 전체상세저장 우측정렬 안 됨, 상단 33건은 하단 "○○회 모임"과 중복 — "무슨 기준으로 같다고") — 근본원인은 기록만 별도 드로어(`.hist-page`)가 `translateY(100vh)→0` **슬라이드로 떠오르는** 구조(다른 탭은 고정 셸에서 본문만 교체). 완전 탭화는 `_buildHistoryInnerHtml`에 검색·전체상세저장이 없어 리스크 커서, 모바일 드로어를 **다른 탭처럼 보이도록** 정밀 수정: (1) **슬라이드 제거** — `@media(max-width:700px)`에서 `transform:translateY`→`transform:none;opacity:0/1;transition:opacity .16s`(데스크탑 페이드 방식과 동일)로 떠오름 없앰. (2) **헤더 2×2 그리드** — `.hist-page-nav{display:grid;grid-template-areas:'eyebrow sync' 'title action'}`, `nav-row`·`head-right`를 `display:contents`로 펼쳐 **eyebrow(DUTCH PAY v7.41)+동기화상태 / 제목(기록 보관함 24px)+전체상세저장(우측정렬)**을 다른 탭 `.mob-header`와 동일 2줄·동일 패딩으로. 헤드리스 실측: 제목 top=55(입력탭과 동일)·left=20·24px, 헤더높이 102≈104, 버튼 우측끝 370. (3) 상단 `.hist-cnt-badge`(33건) **모바일 display:none**(하단 '○○회 모임'과 중복). **데스크탑(144px 헤더·눈썹"보관함"·`.right` 패널 정확 일치)은 불변**(min-width:701 별도 블록, `display:contents`·그리드는 모바일 전용). 표시 전용·계산 무관, 계산 170/170 |
| v7.40 | **모바일 기록 보관함 헤더를 다른 탭과 통일(어색함 해소)**(사용자: 기록보관함만 헤더가 다르고 탭 눌렀을 때 기록만 어색함 — 스크린샷 5장으로 입력·정산·공유·수금은 모두 `.mob-header`(DUTCH PAY eyebrow+좌측 "더치페이"+우측 총지출) 공유하는데 기록만 가운데정렬 "기록 보관함"·브랜드 없음) — 모바일 `.hist-page-nav`(기록보관함 드로어 헤더)만 **다른 탭 헤더 톤으로 재스타일**: 마크업에 모바일 전용 `.hist-mob-eyebrow`(`DUTCH PAY` + `#histVerM` 버전) 추가(기본 `display:none`, 부팅 시 `histVerM`=APP_VERSION 채움), `@media(max-width:700px)`에서 nav=`.mob-header`와 같은 패딩(`max(20px,safe+12) 20px 10px`)·`nav-row`를 flex-wrap으로 **eyebrow(상단 전체폭)+제목(좌측 24px/700)+건수(우측 `histDrCnt` "33건")**, 기존 가운데정렬(`justify-content:center`)·절대배치 제목(17px) 제거. `.hist-head-right`(동기화표시+전체상세저장) 패딩만 20px로. **데스크탑 헤더(144px·눈썹"보관함"+좌측제목)는 불변**(`.hist-mob-eyebrow`는 데스크탑서 숨김, 기존 `.hist-page-eye` 유지). 표시 전용·계산 무관. 헤드리스(390px): eyebrow "DUTCH PAY v7.40"·제목 좌측 left=20·24px·건수 33건, 계산 170/170 |
| v7.39 | **설정 패널을 밋밋한 리스트→영수증앱처럼 카드형으로 다듬고, 모바일 성공 토스트 위치·시간 수정**(사용자: 설정이 영수앱에 비해 너무 성의 없어 보임 / 모바일 녹색창 위치가 애매하고 너무 오래 노출) — (1) **설정 패널 카드화**: `_setPanelHtml()`를 **그룹 세로 리스트**(v7.38)에서 **제목+설명이 있는 카드 묶음**(`.set-card`)으로 재구성. ①**내 정보** 카드=이름 필드(`.set-field`, 탭→setMyName)+안내문구, ②**화면 테마** 카드=**3단 세그먼트**(`.set-seg` 시스템/라이트/다크, `dutchpay_dark_mode` 미설정=시스템·`'light'`·`'dark'` 매핑, `_settingsAction`에 `theme:system|light|dark` 분기 추가→`localStorage` set/remove 후 `_applyDarkMode`·refresh, 토스트 없음), ③**Dropbox 백업** 카드=연결 상태 점(● 연결됨+계정명 / 연결 안 됨)+설명+버튼 묶음(`.set-btn` primary 지금 동기화·연결하기, danger 연결 해제), ④**기록 보관함**·⑤**데이터 내보내기**·⑥**초기화** 카드=아이콘+제목+`›` 리스트 행(`.set-row`). `.set-body` 배경 `--fill2`+카드 `--card`+테두리로 영수증앱 톤. 액션 로직(`_settingsAction`)·드로어 배치(`_placeRightDrawer`)·열기/닫기는 v7.38 그대로. (2) **모바일 토스트**: `.toast-container`가 상단(`top:safe+12px`)이라 모바일 헤더 제목과 겹쳤음 → `@media(max-width:700px)`에서 **하단 탭바 위**(`top:auto;bottom:72px+safe+14px`, 아래서 위로 슬라이드)로 이동. (3) **자동복구 토스트** `잠금 원본으로 기록을 자동 복구했어요` 지속시간 `4000→1800ms`. 표시 전용·계산 무관. 헤드리스: 데스크탑 setDr rect=.right 완전 일치·카드 6·세그먼트 3(시스템 활성), 모바일 390×772·탭바 보임·토스트 top=663(헤더 아래), 계산 170/170 |
| v7.38 | **설정(⋯)을 떠다니는 팝업→기록보관함처럼 오른쪽 패널 드로어로(A안)**(사용자: 영수증앱·NARO처럼 설정을 오른쪽 패널에, 더치페이만 창으로 떠서 어색) — 기존 `showDataMenu`는 작은 플로팅 `.data-pop`이었음. 기록보관함 드로어(`.hist-page`) 방식을 **재사용**: `_histPlaceDesktop`을 `_placeRightDrawer(dr)`로 일반화하고, `#setDr`(class `hist-page set-page`)를 lazy 생성해 **데스크탑=`.right` 패널 영역에 정확히 배치**(rect 완전 일치)·**모바일=하단 탭바 보이는 탭형**(v7.33/35 규칙 상속). 내용은 `_setPanelHtml()`가 **그룹 세로 리스트**(Dropbox / 기록 / 데이터 백업 / 설정 / 초기화 / 버전·잠금) 생성, `_settingsAction(action)`이 기존 액션 로직(dbxAction·openHistory·saveHistory·fixHistory·setCouples·exportCsv·export·setMyName·toggleDark·resetCurrent·reset·lockOwner·unlockTap) 재사용(네비성은 close 후 실행, 다크/이름/dbx상태는 refresh로 패널 갱신). 열기: 데스크탑 레일 ⚙️→`toggleSetDrawer`, 모바일 제목 롱프레스·`_ownerAreaClick`→`openSetDrawer`. 닫기: ESC·바깥 클릭(캡처, 레일/제목 제외)·⚙️ 토글·(모바일)하단 탭. `showDataMenu`는 함수 유지(미사용 폴백). 표시/흐름 전용·계산 무관. 헤드리스: 데스크탑 setDr rect=.right 완전 일치·11행, 모바일 390×772·탭바 보임·에러 0, 계산 170/170 |
| v7.37 | **동기화 429 요청제한 재발 방지 — 잠금 원본을 한 동기화당 최대 5개만 업로드(요청 분산)**(진단 결과 확정: v7.36 메시지가 "Dropbox 요청이 잠시 제한됐어요"=**429**, 저장공간은 3TB 중 133.8GB로 여유 충분) — 근본 원인은 코드 버그·저장공간이 아니라 **매 동기화마다 잠금 원본 33개를 쏟아부어 Dropbox 요청제한(429)에 걸린 것**. 원격 manifest가 비어 매번 33개 전부 changed로 잡히는 악순환(폭풍→429→manifest 업로드 실패→manifest 비어 다음에도 33개). → `_syncFixedArchives`에서 `changed`를 **`CAP=5`로 잘라 `batch`만** 동시 3개씩 업로드, manifest는 **'원격에 이미 있거나 이번에 올린'(`uploadedIds`)** 것만 담아 나머지는 다음 동기화에 이어서. 한 동기화 요청수가 history 1 + 원본 ≤5 + 목록 2 ≈ 8개로 줄어 429 재유발 안 함. 기존 429가 풀린 뒤부터는 매 동기화가 가벼워 초록 유지, 33개는 여러 동기화에 걸쳐 분산 백업. `failedIds`→`uploadedIds`/`pending`으로 정리. **데이터·계산 무관**. 헤드리스: 일부 실패 시 manifest에 성공분만·비-throw, 계산 170/170 |
| v7.36 | **동기화 업로드 실패 시 Dropbox 원인(코드/저장공간 가득 등)을 메시지에 표시 — 진단**(사용자: v7.35에서도 "기록 보관함 업로드에 실패했어요" 계속, 롤백해야 하나) — history 업로드를 history-우선으로 단독 처리(v7.35)했는데도 실패 → `_dbxUpload`가 **false 반환**(Dropbox 서버가 거부). 다운로드는 되는데 업로드만 지속 실패 = **저장공간 가득(507)·요청제한(429)·경로(400)** 등 서버측 사유인데, 기존 메시지가 "실패"라 구분 불가였음. → `_dbxUpload`에 `_dbxLastUploadStatus`(res.status)·`_dbxLastUploadBody`(실패 응답 본문 300자) 기록 추가, `hSyncDropbox`의 history 업로드 실패 분기가 **507/over_quota/insufficient_space → "Dropbox 저장공간 가득"**, **429 → "요청 제한, 잠시 후"**, **400 → 경로 오류+본문**, 그 외 → "(코드 N)"으로 안내. console.warn에도 status/body 남김. **코드 동작 변경 없음**(메시지만). 계산 170/170 |
| v7.35 | **동기화 '기록 보관함 업로드 실패' 해소(history 우선) + v7.33 모바일 드로어 닫힘 빼꼼 버그 수정**(사용자: v7.34서 에러가 "기록 보관함 업로드에 실패했어요"로 바뀜 / 모바일 하단 탭 사라지고 "기록 보관함"만 보임) — **(1) 동기화 순서**: `hSyncDropbox`가 `Promise.all([_syncFixedArchives, history다운로드])`로 **잠금 원본 33개 업로드 폭풍을 history 업로드와 동시에** 돌려 Dropbox 속도제한에 걸리고 바로 뒤 history 업로드가 막혔음 → **history(진짜 기록) 다운로드·병합·업로드를 단독으로 먼저** 수행해 초록 확보(타임아웃 8→12초), **`_syncFixedArchives`(백업)는 그 뒤 `try{await}catch` best-effort**로 이동. **(2) 모바일 드로어 빼꼼**: v7.33에서 모바일 `.hist-page{bottom:72px}`를 줬는데 닫힘 상태 `transform:translateY(100%)`가 높이(100vh−72px)만큼만 내려가 **헤더("기록 보관함") 72px가 화면 하단에 남아 탭바를 덮었음** → `@media(max-width:700px)`에 `.hist-page{transform:translateY(100vh)}`(+`.open{translateY(0)}`)로 닫힘 시 완전히 화면 밖. 헤드리스(390px): 닫힘 시 드로어 top=844(화면밖)·탭바 보임, 열림 시 390×772·탭바 보임. **데이터·계산 무관**. 계산 170/170 |
| v7.34 | **동기화 '잠금 삭제 목록/목록 업로드 실패' 고착 근본 해소 — 잠금 원본 백업 레이어를 완전 비치명적으로**(사용자: v7.33에서도 데스크탑·모바일 둘 다 "동기화 실패: 잠금 삭제 목록 업로드 실패" 계속) — v7.32는 잠금 원본(33개) 업로드만 나눠 고쳤고, 그 뒤 **삭제목록(`dbxFixedDeletedFile`)·목록(`dbxFixedFile`) 업로드가 실패하면 여전히 `throw`**해 `hSyncDropbox`의 `Promise.all`이 reject→**메인 기록(history) 업로드까지 막혀** 빨간 실패로 고착. 잠금 원본은 **교차기기 복원용 추가 백업 레이어**(로컬 기록·history 파일과 별개)라 이게 메인 동기화를 막으면 안 됨. → `_syncFixedArchives`에서 (1) 삭제목록·목록 업로드 실패 시 `throw`→`console.warn`(비치명적, 못 올린 건 다음 동기화 재시도), (2) `create_folder_v2`·`_verifyAndRepairFixedHistory`도 try/catch로 감쌈. 이제 백업 레이어가 어떤 이유로 실패해도 `_syncFixedArchives`가 정상 반환→history 업로드 진행→**동기화 초록**. (hSyncDropbox의 history 업로드 자체 실패는 기존대로 '기록 보관함 업로드 실패'로 알림 유지 — 그건 실제 데이터라 치명적.) 반환값은 hSyncDropbox가 `const [,raw]`로 무시하므로 영향 없음. **데이터·계산 무관**. 계산 170/170 |
| v7.33 | **모바일 기록보관함을 전체화면 '창'→하단 탭이 보이는 '탭'으로**(사용자: 모바일에서 기록보관함이 아직 창처럼 떠 보임, 다른 탭처럼 헤더도 수정) — 원인: 모바일 `.hist-page` 드로어가 `inset:0;z-index:300`으로 하단 탭바(`.mob-tabs` z90)를 완전히 덮고 `< 더치페이` 뒤로가기 헤더만 있어 '앱 위에 띄운 창'처럼 느껴짐. 게다가 `mSetTab`(모바일 하단 탭 클릭)이 `closeHistDrawer()`를 안 해 탭바가 보여도 안 닫힘. → (1) `@media(max-width:700px)`에서 `.hist-page{bottom:calc(72px + safe-area)}`로 드로어가 하단 탭바 위까지만 차지(탭바 노출, z-index 변경 없이 영역 분리). (2) 모바일 `.hist-back-btn{display:none}`+`.hist-page-nav-row{justify-content:center}`로 뒤로가기 제거(제목 중앙 고정). (3) `mSetTab`에 `if(_histDrawerOpen)closeHistDrawer()` 추가 → 하단 탭 누르면 드로어 닫고 그 탭으로. 기록 탭은 `_syncShellNav('history')`로 이미 활성 표시. 데스크탑(오른쪽 패널 통합)·계산 무관. 헤드리스(390px): 드로어 rect 390×772(하단 72px 탭바)·뒤로가기 없음·하단 내비 기록 활성·카드 미잘림 확인, 계산 170/170 |
| v7.32 | **잠금 원본 동기화 반복 실패 수정 — 다건 업로드를 동시 3개씩·재시도·부분 성공 허용으로**(사용자: 재연결 후 "동기화 실패: 잠금 원본/삭제 목록 업로드 실패"가 계속, 실패 지점이 매번 바뀜) — 원인: `_syncFixedArchives`가 잠긴(🔒) 기록 원본들을 `Promise.all`로 **한꺼번에 병렬 업로드**(각 8초)하고 하나라도 `!ok`면 throw. 재연결 직후엔 원격 manifest가 비어 **모든 잠금 원본(여기선 33건)이 changed**라 33+목록 파일이 동시에 쏟아져 Dropbox가 과부하로 거부 → 매번 다른 파일이 timeout → 실패 지점이 바뀜. 게다가 `_syncFixedArchives`가 throw하면 `hSyncDropbox`의 `Promise.all`이 reject돼 **그 뒤 기록(history) 업로드까지 막혀** 전체가 빨간 실패로 고착. **해결**: (1) 원본 업로드를 **동시 3개 풀(worker)·각 2회 재시도·타임아웃 8→15초**로 나눠 올림. (2) manifest(`dbxFixedFile`)를 전체 `merged`가 아니라 **실제로 올라간(또는 이미 원격에 있던) 원본만**(`manifestOut`) 담아, 못 올린 건 다음 동기화에서 다시 `changed`로 잡혀 **이어서 재시도**(기존엔 manifest에 전부 넣어 실패분이 영영 재시도 안 되는 잠재 버그도 해소). (3) 개별 원본 실패는 **throw하지 않음**(console.warn만) → 삭제목록·manifest만 성공하면 `_syncFixedArchives`가 정상 반환해 history 업로드가 진행되고 동기화가 초록으로 끝남. 삭제목록·manifest 업로드만 각 2회 재시도 후에도 실패하면 기존대로 hard error. **데이터·계산 무관**(잠금 원본은 교차기기 복원용 추가 레이어, 로컬 기록·history 파일과 별개). 계산 170/170 |
| v7.31 | **Dropbox 재연결 먹통 수정 — ⋯ 메뉴에서 바로 뜨는 재연결 입력 상자 추가**(사용자: 연결 해제 후 재연결 버튼 눌러도 반응이 전혀 없음) — 원인: 연결 안 됨 상태에서 ⋯ 메뉴 `Dropbox 연결/설정`을 누르면 `_hDbxConnectDirect()`가 저장된 App Key로 **조용히 리다이렉트**만 시도했는데, App Key가 비어 있으면 브라우저 `prompt()`에 의존(차단되면 아무 반응 없음)하고, 재입력 UI(`_renderHDbxPanel`/`#hDbxPanel`)는 **기록 보관함 드로어에는 없어서**(인라인 history 탭 전용) 접근 불가 → 눌러도 아무것도 안 뜨고 에러도 안 보임. **해결**: `showDbxConnect()` 모달(couple-ov/ couple-modal 재사용) 추가 — 연결 안 됨이면 **App Key 입력칸(저장값 자동 채움)+연결하기+Redirect URI 안내**, 연결됨이면 지금 동기화·연결 해제·닫기. ⋯ 메뉴 `dbxAction`의 미연결 분기를 `_hDbxConnectDirect()`→`showDbxConnect()`로 교체(연결됨 분기=즉시 동기화는 유지). `_dbxConnectFromModal()`가 키 검증(빈값 토스트)·App key 변경 시 옛 토큰 폐기(v5.13 로직 재사용)·PKCE verifier 생성(try/catch로 실패 시 토스트)·`dropbox.com/oauth2/authorize` 이동, 복귀는 기존 `hDbxHandleCallback`(line 6064 로드 시 실행) 그대로. 표시/흐름 전용·계산 무관, 헤드리스: 모달 표시·키 프리필·연결하기 리다이렉트 확인, 계산 170/170 |
| v7.30 | **커플 개별 금액 클러스터를 왼쪽으로 이동(오른쪽 합산 금액과의 여백 확대)**(사용자 요청) — v7.28 클러스터와 합산 총액 사이 간격 `clusterRight=amtX-amW-30`→`-60`으로, 클러스터 전체를 왼쪽으로 30px 당겨 오른쪽 총액(433,666원)과의 여백을 넉넉하게. 표시 전용, 계산 170/170 |
| v7.29 | **커플 개별 금액 클러스터 세로 간격·굵기 조정**(사용자 요청) — v7.28 인라인 2줄 클러스터(김영석/이종현)의 (1) 두 줄 세로 간격을 `ry±15`→`±18`로 조금 넓히고, (2) 글자를 `22px/500`→**`22px/400`**(지출 내역 참석자 줄 `setFont(22,400)`·`C.muted`와 동일 굵기·색)으로. 색(C.muted)은 이미 동일했음. 표시 전용, 계산 170/170 |
| v7.28 | **커플 합산 개별 금액 표시를 서브라인(v7.27)에서 인라인 2줄 클러스터로 변경**(사용자 목업 제시) — v7.27은 행을 140px로 키우고 합산 아래에 `김영석 ○원 · 이종현 ○원` 서브라인을 뒀으나, 사용자가 더 깔끔한 안 제시: 행 높이는 기존(TXN_ROW_H 108) 유지하고 **합산 총액 바로 왼쪽에 개별 금액을 2줄**(이름 좌·금액 우측정렬)로 배치. → `COUPLE_ROW_H`(140) 제거해 coupleCardH를 TXN_ROW_H로 복원, 커플 행은 `drawTxnRow`(이름+합산 총액 blue) 그린 뒤 두 금액이 다르면 합산 금액 왼쪽(`clusterRight=amtX-amW-30`)에 `parts` 2줄을 23px/500 회색(C.muted)으로 그림(금액 우측정렬·이름 좌측, ry±15). 헤드리스: 커플 카드 한 줄 높이·합산 433,666 왼쪽에 김영석 228,833/이종현 204,833 클러스터 확인. 표시 전용, 계산 170/170 |

> 📁 **오래된 버전(v7.27 이하) 변경 이력은 [`CHANGELOG.md`](CHANGELOG.md)에 보관되어 있습니다.** (크레딧 절약을 위해 최근 16개만 여기 유지 — 전체 기록은 손실 없음)

## 탭 구조
- 탭바: **입력 / 정산 / 공유 / 기록 / 수금** (기록·수금은 `_ownerUnlocked` 시에만 표시)
- **기록** nav 버튼은 `goToHistory()`로 기록 보관함 드로어를 엶(탭 전환 아님). ⋯ 메뉴 진입도 유지
- 친구들에게는 입력·정산·공유만 보임. `_ownerUnlocked`는 5탭 또는 내 이름=조상현(OWNER_NAME) 시 자동

## ⋯ 메뉴 항목 순서 (소유자 잠금 해제 시)
1. Dropbox 연결/동기화
2. (연결됨) 📥 옛 위치에서 가져오기 — v5.14
3. (연결됨) 🗂 이미지 파일명 일괄 변경
4. (연결됨) ☁ Dropbox 연결 해제
5. 📋 기록 보관함
6. 📌 기록 보관함에 저장
7. 💑 공유 이미지 커플 설정
8. (구분선)
9. CSV 저장
10. 전체 JSON 백업
11. (구분선)
12. 내 이름 설정
13. 다크 모드 토글
14. (구분선)
15. ↺ 이번 정산 초기화
16. 전체 초기화
17. 버전 표시 (탭 5번 → 잠금 해제 / 🔒 잠금)

## 핵심 설계 원칙
- 친구들에게 보이는 UI는 단순하게: 입력·정산·공유만
- 기록/저장/백업/Dropbox는 소유자 전용 → ⋯ 메뉴 안에만
- 저장 버튼 없음 = 의도적 설계 (onchange/oninput 즉시 자동저장)
- **계산은 생명 — 회귀 테스트 필수:** 정산·분담·한턱·수금·수취 등 **금액을 계산·집계·표시하는 코드를 건드리면 반드시 `test.html`에 그 케이스를 추가하고 전체 통과를 확인한 뒤 배포한다.** test.html은 index.html을 iframe으로 불러 실제 함수를 호출하므로(computeShares·calcTxns·_resultBreakdownHtml 등) 로직 복사본이 갈라지지 않는다. 특히 **라벨과 금액이 반드시 일치**해야 한다 — 'X 쏨'이면 금액도 X가 쏜 것만(집계 대상을 `payer===그 사람`으로 좁혔는지 확인). 헤드리스 실행: 리포 루트를 http로 띄우고 test.html 로드해 PASS/FAIL 확인.

## 레이아웃/디자인 규칙 (반드시 지킬 것)
- **리스트 콘텐츠 인셋:** 리스트 행의 글자·값은 항상 구분선(행 폭 전체 직선) **안쪽**으로 들어가야 하며, 좌우에 여백(가로 ~14px)을 둔다. 콘텐츠가 카드/구분선 가장자리에 붙지 않게 한다. (수금 인원 목록 `.pm-mtable .pm-month-person-row{padding:9px 14px}` 참고)
- **구분선(중요·표 공통 규칙):** 행 사이 구분선은 1px 직선, **머리글·모든 행이 완전히 동일한 좌우 인셋(약 14px 여분)** 으로 정렬한다. 글자는 그 구분선 안쪽(패딩 14px 더). 한 표 안에서 머리글만 짧고 행만 카드 끝까지 나가는 식의 불일치 금지 — 원인은 대개 행에만 걸린 음수 마진(`.pm-name-tap{margin:0 -6px}` 등)이므로 `.pm-mtable` 문맥에서 `margin:0` 으로 눌러 머리글과 같은 폭으로 맞춘다. 마지막 행은 구분선 없음.
- **인원 목록은 열 머리글 정렬 테이블:** 머리글 `참여자 · 횟수 | 차액 | 청구금액 | 상태`(`.pm-mhead`)를 목록 상단에 두고, **고정 폭 4열 그리드**(minmax(0,1fr) 58/90/36)로 머리글과 모든 행이 같은 세로선에 정렬한다. 정렬 방향: 참여자·횟수=좌(**회 숫자는 이름 바로 옆 인라인**, 이름과 붙어 표시), 차액·청구금액=우측(원 기준), **상태=가운데**. 값 사이 간격은 **화면 폭에 따라 gap만 조절**(모바일 8px, PC 20px). 결제는 이름 아래 서브라인, 한턱/참석 배지는 차액~상태 3열(grid-column 2/-1)에 걸쳐 우측정렬. **횟수를 독립 가운데 열로 멀리 빼지 말 것**(사용자: "횟수는 이름 가까이 우측에").
- **통계 카드 일관성:** 월별 통계·이름 검색 요약 등 통계 표시는 동일 규격(`pm-month-stats-row`/`pm-mstat`, 라벨 청구·수령·미수 / 결제·지출·쏜, 금액 12.5px, 셀 세로 구분선 `--sep2` 글자 높이 인셋, 미수 '없음'은 회색 `.mut`)을 재사용한다.
- **소유자 행 횟수:** 내 이름(_myName) 행에도 다른 인원과 동일하게 '회'(정산 참여 횟수)를 표시한다.
- **앱 내 뒤로가기:** 브라우저·안드로이드 back은 앱을 벗어나지 않고 이전 단계로(오버레이 닫기 → 이름 검색 해제 → 직전 탭). 한 단계마다 그 시점에 `history.pushState` 1개를 쌓고(클릭/입력 캡처의 `detect`), back에서는 stack을 1개 pop해 그 단계만 되돌린다(1:1). **popstate 핸들러 안에서는 절대 pushState 하지 않는다** — 안드로이드에서 '홈으로 갔다가 이전 화면으로' 이중 전환(깜빡임)이 생긴다(v5.84).

## 주요 함수
| 함수 | 역할 |
|------|------|
| `computeShares()` | float 누적 → global Math.floor → 최대잔여법 (결제자 우선) |
| `calcTxns(paid, owes)` | 결제자별 채무 직접 정산, float 누적 → Math.floor |
| `renderResultView()` | 정산 탭 (정산 결과 + 지출 내역) |
| `renderSettleView()` | 공유 탭 (총액 hero + 송금 + 지출 내역 + 공유 버튼) |
| `renderHistoryView()` | 기록 보관함 (⋯ 메뉴로만 접근) |
| `renderPaymentView()` | 수금 탭 (입금 관리, _myName 기준 필터) |
| `generateSettleCanvas()` | 공유 이미지 생성 — 커플 설정 시 송금 카드 2개로 분리 |
| `generateHistoryCanvas(rec)` | Dropbox 저장 이미지 생성 |
| `showDataMenu()` | ⋯ 팝업 메뉴 |
| `showCoupleSettings()` | 커플 설정 다이얼로그 |
| `_txnRowsHtml(txns)` | 송금 행 HTML — Option B 색상 구분선 |
| `_pmMonthlyHtml(allRecs)` | 월별 통계 렌더링 |

## 이미지 생성 주요 상수 (generateSettleCanvas)
- W=1080, PAD=42
- TOTAL_CARD_H=245, TXN_ROW_H=108, ITEM_ROW_H=152, EMPTY_CARD_H=132
- 커플 설정 시: 일반 송금 카드 + 커플 합산 카드 (SECTION_GAP=56 간격)
- 총액: 68px 700 / 구분선: y+147 / 인당평균: y+198

## 이미지 생성 주요 상수 (generateHistoryCanvas)
- W=1080, TOTAL_CARD_H=230, ITEM_ROW_H=152, TXN_ROW_H=96
- txns: _myName 기준 필터 (내가 받을 금액만)
- validItems: 전체 (총액 일치를 위해 필터 없음)

## localStorage 키 목록
| 키 | 내용 |
|----|------|
| `dutchpay_v1` | 메인 데이터 `{version:3, groups, currentGroupId, deletedGroups}` (`STORAGE_KEY`) |
| `dutchpay_history` | 기록 보관함 배열 (`HISTORY_KEY`) |
| `dutchpay_hist_deleted` | 삭제된 기록 id — 동기화 시 되살아나지 않게 (`HISTORY_DEL_KEY`) |
| `dutchpay_autobackups` | 자동 백업 슬롯 (`AUTO_BACKUP_KEY`) |
| `dutchpay_sync_hashes` | 그룹별 동기화 해시 (`SYNC_HASHES_KEY`) |
| `dutchpay_my_name` | 소유자 이름 (조상현) — 수금 필터 기준 |
| `dutchpay_couple` | 커플 이름 배열 `["김영석","이종현"]` — 공유 이미지 합산 |
| `dutchpay_owner_unlocked` | ⋯ 메뉴 잠금 해제 여부 |
| `dutchpay_dark_mode` | 다크 모드 설정 |
| `dutchpay_dbx_token` | Dropbox access token |
| `dutchpay_dbx_refresh` | Dropbox refresh token — App key 바뀌면 함께 폐기 (v5.13) |
| `dutchpay_dbx_appkey` | Dropbox App key |
| `dutchpay_dbx_account` | Dropbox 계정 표시용 |
| `dutchpay_dbx_lastsync` / `_main` | 마지막 동기화 시각 |
| `dutchpay_dbx_migrated` | `'1'`이면 새 폴더로 이전 완료 (`DBX_MIGRATED`) |
| `dutchpay_dbx_appkey_changed` | App key가 바뀜 — 옛 폴더 복사 건너뜀 (`DBX_KEYCHANGED`, v5.12) |
| `receipt_db_dutchpay_transfer_v1` | 영수증 DB 전송 봉투 (일회성, 가져온 뒤 삭제) |
| `h_dbx_verifier` | Dropbox OAuth PKCE verifier (콜백 후 삭제) |

## Dropbox 저장 위치 (v5.11~)
```js
const DBX_ROOT     = '/07_Apps/더치페이(Dutch-Pay)';   // 현재
const DBX_OLD_ROOT = '/01_Personal/Dutch-Pay';         // 옛 위치
let   DBX_DIR = localStorage.getItem(DBX_MIGRATED)==='1' ? DBX_ROOT : DBX_OLD_ROOT;
dbxMainFile() → DBX_DIR + '/dutch-pay_data.json'
dbxHistFile() → DBX_DIR + '/dutch-pay_history.json'
```
- `dbxResolveRoot()`가 부팅 때 한 번 옛 폴더를 `copy_v2`로 통째 복사. **원본은 지우지 않고**,
  복사 실패 시 옛 위치로 계속 동작하다 다음 실행에 재시도 → 어떤 경우에도 데이터 유실 없음
- App key가 바뀌면 저장 공간 자체가 달라지므로 옛 폴더 복사를 건너뛴다 (v5.12).
  동명의 화석 폴더를 끌어와 옛 데이터가 현재 데이터를 덮는 사고 방지
- 폴더명에 한글이 있어 `_dbxDownload`의 `Dropbox-API-Arg` 헤더도 ASCII 이스케이프 필요
- 자동 이전이 건너뛰어진 경우 ⋯ 메뉴 **📥 옛 위치에서 가져오기**로 수동 복구 (v5.14).
  덮어쓰지 않고 병합 — 같은 id는 `updatedAt` 최신 우선, 옛 원본은 보존

## 그룹 데이터 구조
```js
groups = [{
  id, name, nameAuto, createdAt, updatedAt,
  data: {
    people[], items[], idc,
    settleDateStart, settleDateEnd,
    itemSort, itemSearch,
    payments: { "from|to": { done, amount, timestamp, account } }
  }
}]
// item(지출)에 receiptText(품목 텍스트 상세표) 외에 receiptUrl 추가 (v5.52)
//   receiptUrl: 외부 https 이미지 링크 또는 첨부 사진 data URI (선택, 표시 전용, 계산 무관)
// couples는 dutchpay_couple (localStorage 전역)에 저장 — 그룹별 아님
```

## Dropbox 동기화 페이로드
```js
{
  version: 2,
  groups, currentGroupId, deletedGroups,
  coupleNames: _coupleNames,  // v4.20+
  syncedAt
}
```

## 반올림 처리 원칙 (v4.15~)
- `computeShares()`: float 누적 → global `Math.floor` → 최대잔여법(결제자 우선)
- `calcTxns()`: float 누적 → `Math.floor` (두 함수 일관성 유지)
- `Math.round` 사용 금지 (금액 계산 시)

## 색상 구분선 (Option B, v4.x~)
- 모든 수취인 그룹 시작에 3px 수평 구분선
- 내 수취 그룹(_myName)을 날짜/계산 순서와 무관하게 항상 먼저 배치
- 조상현 (_myName) → `--blue` / 그 외 → `--txn-amber`
- 적용: `_txnRowsHtml()`, `generateSettleCanvas()` 송금 카드

## 작업 규칙
- 버전은 변경마다 **v4.X+1**로 올림 (v1.X 형식 사용 금지)
- 코드 변경 후 BUILD_TIME도 업데이트 (`2026-MM-DD HH:MM`)
- sw.js의 CACHE_NAME도 항상 APP_VERSION과 동기화
- 커밋은 변경된 파일만 명시적으로 추가 (git add -A 사용 금지)
- PR → squash merge (main은 squash merge 방식)
- push 전 `git fetch origin main && git rebase origin/main` (충돌 시 `--skip`)
- 충돌로 force push 필요 시: `git push -f origin <branch>`

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
**v7.32** (2026-11-06) — 작업 브랜치

## 버전 히스토리 요약
| 버전 | 주요 변경 |
|------|-----------|
| v7.33 | **모바일 기록보관함을 전체화면 '창'→하단 탭이 보이는 '탭'으로**(사용자: 모바일에서 기록보관함이 아직 창처럼 떠 보임, 다른 탭처럼 헤더도 수정) — 원인: 모바일 `.hist-page` 드로어가 `inset:0;z-index:300`으로 하단 탭바(`.mob-tabs` z90)를 완전히 덮고 `< 더치페이` 뒤로가기 헤더만 있어 '앱 위에 띄운 창'처럼 느껴짐. 게다가 `mSetTab`(모바일 하단 탭 클릭)이 `closeHistDrawer()`를 안 해 탭바가 보여도 안 닫힘. → (1) `@media(max-width:700px)`에서 `.hist-page{bottom:calc(72px + safe-area)}`로 드로어가 하단 탭바 위까지만 차지(탭바 노출, z-index 변경 없이 영역 분리). (2) 모바일 `.hist-back-btn{display:none}`+`.hist-page-nav-row{justify-content:center}`로 뒤로가기 제거(제목 중앙 고정). (3) `mSetTab`에 `if(_histDrawerOpen)closeHistDrawer()` 추가 → 하단 탭 누르면 드로어 닫고 그 탭으로. 기록 탭은 `_syncShellNav('history')`로 이미 활성 표시. 데스크탑(오른쪽 패널 통합)·계산 무관. 헤드리스(390px): 드로어 rect 390×772(하단 72px 탭바)·뒤로가기 없음·하단 내비 기록 활성·카드 미잘림 확인, 계산 170/170 |
| v7.32 | **잠금 원본 동기화 반복 실패 수정 — 다건 업로드를 동시 3개씩·재시도·부분 성공 허용으로**(사용자: 재연결 후 "동기화 실패: 잠금 원본/삭제 목록 업로드 실패"가 계속, 실패 지점이 매번 바뀜) — 원인: `_syncFixedArchives`가 잠긴(🔒) 기록 원본들을 `Promise.all`로 **한꺼번에 병렬 업로드**(각 8초)하고 하나라도 `!ok`면 throw. 재연결 직후엔 원격 manifest가 비어 **모든 잠금 원본(여기선 33건)이 changed**라 33+목록 파일이 동시에 쏟아져 Dropbox가 과부하로 거부 → 매번 다른 파일이 timeout → 실패 지점이 바뀜. 게다가 `_syncFixedArchives`가 throw하면 `hSyncDropbox`의 `Promise.all`이 reject돼 **그 뒤 기록(history) 업로드까지 막혀** 전체가 빨간 실패로 고착. **해결**: (1) 원본 업로드를 **동시 3개 풀(worker)·각 2회 재시도·타임아웃 8→15초**로 나눠 올림. (2) manifest(`dbxFixedFile`)를 전체 `merged`가 아니라 **실제로 올라간(또는 이미 원격에 있던) 원본만**(`manifestOut`) 담아, 못 올린 건 다음 동기화에서 다시 `changed`로 잡혀 **이어서 재시도**(기존엔 manifest에 전부 넣어 실패분이 영영 재시도 안 되는 잠재 버그도 해소). (3) 개별 원본 실패는 **throw하지 않음**(console.warn만) → 삭제목록·manifest만 성공하면 `_syncFixedArchives`가 정상 반환해 history 업로드가 진행되고 동기화가 초록으로 끝남. 삭제목록·manifest 업로드만 각 2회 재시도 후에도 실패하면 기존대로 hard error. **데이터·계산 무관**(잠금 원본은 교차기기 복원용 추가 레이어, 로컬 기록·history 파일과 별개). 계산 170/170 |
| v7.31 | **Dropbox 재연결 먹통 수정 — ⋯ 메뉴에서 바로 뜨는 재연결 입력 상자 추가**(사용자: 연결 해제 후 재연결 버튼 눌러도 반응이 전혀 없음) — 원인: 연결 안 됨 상태에서 ⋯ 메뉴 `Dropbox 연결/설정`을 누르면 `_hDbxConnectDirect()`가 저장된 App Key로 **조용히 리다이렉트**만 시도했는데, App Key가 비어 있으면 브라우저 `prompt()`에 의존(차단되면 아무 반응 없음)하고, 재입력 UI(`_renderHDbxPanel`/`#hDbxPanel`)는 **기록 보관함 드로어에는 없어서**(인라인 history 탭 전용) 접근 불가 → 눌러도 아무것도 안 뜨고 에러도 안 보임. **해결**: `showDbxConnect()` 모달(couple-ov/ couple-modal 재사용) 추가 — 연결 안 됨이면 **App Key 입력칸(저장값 자동 채움)+연결하기+Redirect URI 안내**, 연결됨이면 지금 동기화·연결 해제·닫기. ⋯ 메뉴 `dbxAction`의 미연결 분기를 `_hDbxConnectDirect()`→`showDbxConnect()`로 교체(연결됨 분기=즉시 동기화는 유지). `_dbxConnectFromModal()`가 키 검증(빈값 토스트)·App key 변경 시 옛 토큰 폐기(v5.13 로직 재사용)·PKCE verifier 생성(try/catch로 실패 시 토스트)·`dropbox.com/oauth2/authorize` 이동, 복귀는 기존 `hDbxHandleCallback`(line 6064 로드 시 실행) 그대로. 표시/흐름 전용·계산 무관, 헤드리스: 모달 표시·키 프리필·연결하기 리다이렉트 확인, 계산 170/170 |
| v7.30 | **커플 개별 금액 클러스터를 왼쪽으로 이동(오른쪽 합산 금액과의 여백 확대)**(사용자 요청) — v7.28 클러스터와 합산 총액 사이 간격 `clusterRight=amtX-amW-30`→`-60`으로, 클러스터 전체를 왼쪽으로 30px 당겨 오른쪽 총액(433,666원)과의 여백을 넉넉하게. 표시 전용, 계산 170/170 |
| v7.29 | **커플 개별 금액 클러스터 세로 간격·굵기 조정**(사용자 요청) — v7.28 인라인 2줄 클러스터(김영석/이종현)의 (1) 두 줄 세로 간격을 `ry±15`→`±18`로 조금 넓히고, (2) 글자를 `22px/500`→**`22px/400`**(지출 내역 참석자 줄 `setFont(22,400)`·`C.muted`와 동일 굵기·색)으로. 색(C.muted)은 이미 동일했음. 표시 전용, 계산 170/170 |
| v7.28 | **커플 합산 개별 금액 표시를 서브라인(v7.27)에서 인라인 2줄 클러스터로 변경**(사용자 목업 제시) — v7.27은 행을 140px로 키우고 합산 아래에 `김영석 ○원 · 이종현 ○원` 서브라인을 뒀으나, 사용자가 더 깔끔한 안 제시: 행 높이는 기존(TXN_ROW_H 108) 유지하고 **합산 총액 바로 왼쪽에 개별 금액을 2줄**(이름 좌·금액 우측정렬)로 배치. → `COUPLE_ROW_H`(140) 제거해 coupleCardH를 TXN_ROW_H로 복원, 커플 행은 `drawTxnRow`(이름+합산 총액 blue) 그린 뒤 두 금액이 다르면 합산 금액 왼쪽(`clusterRight=amtX-amW-30`)에 `parts` 2줄을 23px/500 회색(C.muted)으로 그림(금액 우측정렬·이름 좌측, ry±15). 헤드리스: 커플 카드 한 줄 높이·합산 433,666 왼쪽에 김영석 228,833/이종현 204,833 클러스터 확인. 표시 전용, 계산 170/170 |
| v7.27 | **정산 이미지 커플 합산 카드에 개별 금액 서브라인 추가**(사용자 요청: 부부 합산인데 한 명이 술 안 마셔 금액이 다를 때 각자 얼마인지 보이게) — 커플 합산 카드(예: 김영석·이종현 → 조상현)는 합산 총액만 보여줘 둘 중 한 명이 술 제외 등으로 덜 내도 구분이 안 됐음. `_groupCoupleShareTxns`가 반환하는 `coupleTxnRows`에 `parts:[{name,amt},{name,amt}]`(합산 전 개별 송금액, 이미 계산돼 있던 값) 추가. `generateSettleCanvas` 커플 카드에서 **두 개별 금액이 다를 때만** 행 높이를 140(기존 TXN_ROW_H 108)으로 키우고 합산 총액(blue, drawTxnRow) 아래에 `김영석 228,833원 · 이종현 204,833원` 서브라인(C.muted 24px)을 그림(`_coupleBreak`·`COUPLE_ROW_H`). 두 금액이 같으면 기존처럼 한 줄. **이미지 전용**(커플 합산은 generateSettleCanvas에서만 쓰이고 화면 `_txnRowsHtml`엔 없음). parts는 기존 개별 txn 금액이라 계산(computeShares/calcTxns) 무관. 헤드리스: 술 제외 시나리오로 커플 228,833/204,833·합산 433,666·서브라인 표시 확인. 표시 전용, 계산 170/170 |
| v7.26 | **정산 이미지 커플 합산 카드 위 여백 축소 + 안내문구 굵기를 사인오프와 통일**(사용자 요청 2건) — (1) `generateSettleCanvas`에서 커플 합산 송금 카드(김영석·이종현 → 조상현) 위 간격이 일반 섹션 간격 `SECTION_GAP`(56)이라 과했음 → 별도 `COUPLE_GAP=24` 상수를 도입해 커플 섹션 높이 계산(`coupleSection`)·배치(`y+=COUPLE_GAP`) 둘 다 24로 줄여 송금 카드에 더 붙임. (2) `차액은 결제자에게 우선 부담돼요` 안내문구가 `C.muted`(#8E8E93)로 사인오프 `Let's split it.`과 색은 같았지만 **굵기 300**이라 더 옅어 보였음 → `setFont(20,300)`→`setFont(20,400)`으로 사인오프(400)와 동일 톤. 헤드리스 렌더로 커플 카드가 송금 카드에 붙고 안내문구·사인오프 회색 톤 일치 확인. 표시 전용·계산 무관, 계산 170/170 |
| v7.25 | **생성 이미지 화살표 색을 한 톤 옅게**(사용자 요청) — 화살표 색 `#7C818B`→**`#969BA4`**(v7.22 연회색 #B4B8C0과 v7.23 짙은 #7C818B의 중간). 밑변 10·머리 24·선 2px는 유지. 세 곳(`generateSettleCanvas` 송금·`generateHistoryCanvas` 청구·입금) 공통. 표시 전용·계산 무관, 계산 170/170 |
| v7.24 | **생성 이미지 화살표 밑변 12→10으로 축소**(사용자: 12/10/8 비교 후 10 선택) — v7.23 화살표 밑변 반높이 `AH` 6→**5**(base 12→10px, 머리 길이 24·선 2px·색 `#7C818B`는 유지, length:base=24:10으로 더 뾰족). 세 곳(`generateSettleCanvas` 송금·`generateHistoryCanvas` 청구·입금) 공통. 표시 전용·계산 무관, 계산 170/170 |
| v7.23 | **생성 이미지 from→to 화살표를 긴 테이퍼 삼각형 머리 + 얇은 선 + 더 짙은 회색으로**(사용자 참고 이미지: 긴 스피어헤드·얇은 선·짙게) — v7.22의 화살표(머리 짧고 뭉툭: `headW=AH*1.8≈16`·선 2.5px·`#B4B8C0` 연회색)를 세 곳(`generateSettleCanvas` 송금 `drawTxnRow`·`generateHistoryCanvas` 청구·입금) 공통으로: 머리 길이 `headW` 16→**24**(길게)·밑변 반높이 `AH` 9→**6**(base 12px, length:base=2:1 테이퍼)·선 `lineWidth` 2.5→**2**(얇게)·색 `#B4B8C0`→**`#7C818B`**(짙은 중간 회색). `AL=36` 유지라 to 이름 위치·레이아웃 불변. 청구/송금 금액 파랑(v7.22)·입금 금액 검정은 그대로. 헤드리스 렌더로 긴 삼각형 머리·얇은 선·짙은 회색·이름 검정 확인. 표시 전용·계산 무관, 계산 170/170 |
| v7.22 | **친구에게 보내는 생성 이미지: from→to 화살표를 회색, 청구/송금 금액을 파랑으로**(사용자 요청, 시안 비교 후 파랑 선택) — 정산 공유 이미지(`generateSettleCanvas` 송금 행 `drawTxnRow`)·기록 이미지(`generateHistoryCanvas` 청구 내역 행)의 **금액을 `C.text`(검정)→`C.blue`(#4355E8)**, 세 곳 from→to 행(송금·청구·입금)의 **화살표(선+머리) `C.text`→`#B4B8C0`(회색)**. 받는 사람 이름이 화살표 머리의 fillStyle(회색)을 이어받지 않도록 송금 행에 `ctx.fillStyle=C.text` 복원 추가(청구·입금은 이미 to 이름 전에 C.text 재지정). **입금 내역 금액은 검정 유지**(청구/송금만 파랑), 총액·지출 금액·배지·푸터 무변경. Dropbox 보관용 상세(`generateFullDetailCanvases`)는 친구 전송 대상 아니고 송금/청구 행이 없어 제외. 헤드리스 렌더로 청구/송금 금액 파랑·화살표 회색·이름 검정·입금 금액 검정 확인. 표시 전용·계산 무관, 계산 170/170 |
| v7.21 | **수금 입금 내역 금액 정렬 방향 정정 — 요약 카드는 원위치 두고 입금 내역 금액·화살표를 위(입금 현황)로 당김**(사용자: 위 숫자들과 같은 위치로 정렬, 866원이 더 오른쪽) — v7.20은 입금 현황 요약(396)을 입금 내역(400) 쪽으로 옮겨 맞췄으나, 사용자 의도는 반대(위 숫자=기준 유지, 아래 866원을 위로). 게다가 v7.20은 요약 데스크탑 인셋만 14로 바꿔 데스크탑에선 요약 14 vs 입금내역 22로 오히려 더 벌어졌음. → (1) `.pay-summary-row` 패딩을 `8px 14px`→`8px 18px`로 **원위치 복원**(396). (2) `.pm-card .txn-row.expandable` 오른쪽 패딩만 18px로: 모바일 `14px 14px`→`14px 18px 14px 14px`, 데스크탑 `14px 22px`→`14px 18px 14px 22px` — **왼쪽 내용(아이콘·이름)은 그대로**, 금액(`.txn-amt` justify-self:end)·화살표(`.txn-chev`)만 왼쪽으로 4px 당겨 396에 정렬. 헤드리스 실측: 요약 금액(222,000·111,134·-110,866)·입금 내역 행 금액(111,000)·화살표 모두 우측 끝 396 일치. 구분선 인셋(16px) 유지. 표시 전용·계산 무관, 계산 170/170 |
| v7.20 | **수금 입금 현황 요약 카드 금액 우측 끝을 입금 내역 행 금액·화살표와 정렬(4px 어긋남 수정)**(사용자 스크린샷: 빨간 세로선으로 윗 카드 금액과 아랫 카드 금액 우측 끝 불일치 지적) — 수금 '이번 정산'의 **입금 현황** 요약 카드(`.pay-summary-row` 총 청구액·총 실수령액·순 차액)는 좌우 패딩 **18px**라 금액 우측 끝이 396px, **입금 내역** 행(`.txn-row` 패딩 14px)의 금액·`▼`는 400px로 끝나 두 카드 금액이 4px 어긋났음(윗 카드가 안쪽). 두 카드 외곽은 414로 동일하므로 패딩 차이가 원인. → `.pay-summary-row` 패딩을 `8px 18px`→`8px 14px`로 바꿔 입금 내역 행과 **좌우 인셋 통일**(금액 우측 끝 둘 다 400, 라벨 좌측도 14px로 일치). 헤드리스 실측: 요약 금액(222,000·111,134·-110,866)·입금 내역 행 금액(111,000)·화살표 모두 우측 끝 400 일치. 구분선 인셋(16px border-image)은 기존 유지. 표시 전용·계산 무관, 계산 170/170 |
| v7.19 | **수금 입금 내역 행 화살표를 최상위 계층대로 채워진 `▼`로 되돌리고 모든 카드헤더 `▼` 크기를 11px로 통일**(사용자: 크기도 다르니까 ㅠㅠ / AskUserQuestion 응답 "최상위 — 채워진 ▼") — v7.18이 수금 입금 내역 행(`.txn-chev`)을 **하위 윤곽선 SVG 셰브론**으로 바꿨으나, 사용자 의도는 이 행도 기록보관함 카드헤더와 **같은 최상위 계층**(채워진 삼각형)이었음. 두 스크린샷(기록보관함 리스트 채워진 `▼` vs 수금 입금 내역 캐시된 `▾`)에서 **크기도 달라** 보였던 것이 핵심 불만. → (1) `.txn-chev` 마크업을 윤곽선 SVG(`M6 9l6 6 6-6`)에서 **채워진 글리프 `▼`**로 되돌리고, CSS에서 `svg{11×11}` 규칙 제거·`font-size:11px;line-height:1` 부여. (2) **최상위 `▼` 크기 통일**: `.pm-record-chev`(수금 전체기록 카드헤더) 10→11px, `.pm-allrec-chev`(수금 전체기록 리스트 카드) 9→11px, `.rc-chevron`(기록보관함 카드헤더)는 이미 11px, `.txn-chev` 11px — 네 최상위 카드헤더/행 화살표가 모두 `▼` 11px로 동일. **하위 계층**(지출내역 상세 행 `.rc-chev` 8곳)은 **윤곽선 SVG `∨` 유지**(v7.18대로), 정렬 캐럿 `.hist-sort-arr`(`▾`)은 드롭다운 인디케이터라 제외. 헤드리스: 수금 행 `▼`(filled)·카드헤더들 11px 동일·지출 상세 행 svg(outline) 공존. 표시 전용·계산 무관, 계산 170/170 |
| v7.18 | **화살표 계층 구분 확정: 카드헤더=채워진 `▼`, 하위 펼침=윤곽선 SVG 셰브론**(사용자 스크린샷 설명으로 의도 확정) — 사용자: 기록보관함 **최상위 카드헤더는 채워진 삼각형**, 펼쳤을 때 **하위 메뉴(지출내역 행·수금 입금 행)는 안 채워진 삼각형(윤곽선)**, 윤곽선은 **이전 버전 크기(11px SVG)**. → v7.15/v7.17에서 채웠던 행 화살표(`.rc-chev` 8곳·`.txn-chev` 1곳)를 **윤곽선 SVG 셰브론**(`M6 9l6 6 6-6` stroke 2.4, 11×11 in 18×18)으로 되돌림, CSS `svg{11×11}` 복원·`font-size` 제거. **카드헤더**(`.rc-chevron`·`.pm-record-chev`·`.pm-allrec-chev` `▼/▲`)는 채워진 채 유지. 위치(둘째 줄 우측·금액 정렬 v7.15/16)는 유지. 정렬 캐럿(`.hist-sort-arr ▾`) 제외. 헤드리스: 카드헤더 `▼`(filled)·행 svg(outline) 공존, 영수증 있는 행만 `∨`, 계산 170/170. 표시 전용·계산 무관 |
| v7.17 | **행 펼침 화살표 글리프를 `▾`→`▼`로 키워 카드헤더·옛 셰브론과 크기 통일**(사용자: 크기도 기록보관함처럼 동일하게) — v7.15의 `▾`(U+25BE)는 11px에서 잉크 6×6px로, 카드헤더 `▼`(`.rc-chevron`·`.pm-record-chev`·`.pm-allrec-chev`, U+25BC 11px=9×10px)·옛 SVG 셰브론보다 작아 "통일감" 어긋남(사용자가 본 기록보관함은 옛 SVG 캐시라 더 커 보였음). → 행 화살표(`.rc-chev` 8곳·`.txn-chev` 1곳)의 `▾`를 **`▼`(11px, 잉크 9px)**로 치환해 앱의 모든 아래 화살표를 동일 글리프·크기로. 기록보관함 정렬 캐럿(`.hist-sort-arr` `▾`)은 드롭다운 인디케이터라 제외. 헤드리스: 수금/기록보관함 행 화살표 `▼`·메타 미충돌(데스크탑 17px·모바일 9px 여유)·금액과 우측 정렬 유지. 표시 전용·계산 무관, 계산 170/170 |

> 📁 **오래된 버전(v7.16 이하) 변경 이력은 [`CHANGELOG.md`](CHANGELOG.md)에 보관되어 있습니다.** (크레딧 절약을 위해 최근 16개만 여기 유지 — 전체 기록은 손실 없음)

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

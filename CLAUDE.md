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
**v8.03** (2026-11-17) — 작업 브랜치

## 버전 히스토리 요약
| 버전 | 주요 변경 |
|------|-----------|
| v8.03 | **설정 '내 정보 → 내 이름'을 영수증 앱처럼 인라인 입력칸으로 변경**(사용자: 내 이름 부분이 이상하다 / 영수증 앱처럼 하는 게 보기 편하다) — 기존엔 `.set-field` 한 줄 버튼(오른쪽 `조상현 ›` 화살표) → 누르면 **`prompt()` 브라우저 기본 팝업**으로 편집이라 앱 디자인과 이질적이고 화살표(`›`)가 '다른 화면 이동'으로 오인됨. → `_setPanelHtml`의 nameCard를 **라벨 "내 이름" + 전체폭 입력칸(`.set-inp`)**으로 교체(설명 문구는 영수증 앱처럼 상단으로), `onchange="updateMyName(this.value)"`로 직접 편집. 신설 `updateMyName(val)`는 `setMyName`(⋯ 메뉴)의 **저장·잠금해제 로직을 그대로 보존**(trim→localStorage→`_ownerUnlocked` 재계산(`_myName===OWNER_NAME` 자동해제)→toast→`renderAll`+`_refreshSetDrawer`) + **no-op 가드**(값 동일 시 renderAll·토스트 안 함). `onchange`(blur/Enter)라 타이핑 중 renderAll로 포커스 끊기지 않음. 설정 패널은 `_setPanelHtml` 단일 함수라 데스크탑·모바일 공용(한 곳만 수정). ⋯ 메뉴의 `setMyName`(prompt)은 그대로 유지. **헤드리스 측정 검증**: 입력칸 값=조상현·화살표 제거·라벨 "내 이름"·이름변경→localStorage 반영·재렌더 시 입력칸 갱신·빈값 해제·no-op 가드·소유자명 복원·콘솔 에러 0. 표시 전용·계산 무관, 계산 **196 통과**. |
| v8.02 | **상세 이미지 ①한턱 내역 밑 닫는 구분선 추가(입금 내역처럼 bookend) + ②푸터 하단 여백을 섹션 수와 무관하게 고정**(사용자: 한턱 내역 밑에도 입금 내역처럼 구분선이 있어야 / Let's split it. 밑 여유분이 너무 크다·두번째 사진(한턱만) 여유분이 딱 좋다 / 절대 추측 말 것) — **①** `generateFullDetailCanvases` 한턱 내역은 뒤에 입금 내역이 올 때 마지막 행 밑에 닫는 구분선이 없어 입금 내역과 비대칭이던 것 → 한턱 rows 후 `txnRows.length`면 **2px `#dedee3` 닫는 구분선** 추가(입금 내역 닫는 구분선과 동일, 공통규칙 v7.98). **②** **근본원인**: 캔버스 높이 `H`의 `treatH`·`txnH` 예약에 각각 `+28` 꼬리가 붙어, 한턱+입금 **둘 다** 있으면 `28+28+60=116px`로 하단 여백이 커지고(푸터 57/58), 한턱만이면 `28+60=88px`(푸터 43/44)이라 **섹션 수에 따라 여백이 달라짐**. → 꼬리를 빼고 `bottomPad=(treatH||txnH)?(28+FOOTER):FOOTER`로 **섹션 유무·개수 무관 닫는구분선 밑 88px 고정**. 헤드리스 **픽셀 측정**으로 확정: 한턱만/한턱+입금 **둘 다 닫는구분선→푸터 43px·푸터→바닥 44.5px로 완전 동일**(수정 전 한턱+입금은 57/58). 푸터 중앙배치 공식(`footerY=round((y+H)/2)+3`)은 그대로 — 블록이 88로 고정되니 자동으로 43/44. 표시 전용·계산 무관, 계산 **196 통과**. |
| v8.01 | **기록 보관함 검색에 상세내역(영수증 품목 `receiptText`) 포함**(사용자: 상세내역에 족발이 있는 곳도 있는데 검색이 안 된다 / 검색 범위 확인 요청) — **원인**: `_filterHistoryRecords`의 `textMatch`가 그룹명·**항목명(`items[].name`)**만 검사하고 **영수증 상세 품목(`receiptText`)은 검색 대상이 아니었음** → 항목명은 '저녁식사'인데 그 영수증 품목표에만 '족발'이 있으면 안 잡힘. → `textMatch`에 `it.receiptText` 검사 추가(항목명 OR 영수증품목). 기존 **0원 항목 제외 규칙(v7.74) 동일 유지**(카드 비표시 항목이 검색에만 걸리지 않게). 사람검색 우선(`isPersonQuery`)·날짜검색은 무변경. 검색 결과가 정산상태 집계에도 쓰여 **test 필수** — TC27에 3케이스 추가(족발=영수증품목만 매칭·막국수 매칭·0원 항목 품목은 제외) → 전체 **196 통과**. |
| v8.00 | **정산 이미지 커플 합산 카드에서 두 사람 금액이 같아도 각자 금액을 항상 표시**(사용자: 이왕이면 같을 때도 나타내주면 이해가 쉽지 않을까 / 같아도 항상 보여줘) — v7.27에 추가된 커플 개별 금액 서브라인(`김영석 30,000 / 이종현 20,000`)이 `generateSettleCanvas`에서 **`parts[0].amt!==parts[1].amt`(두 금액이 다를 때만)** 조건으로 게이팅돼, 두 사람이 똑같은 금액(예: 260,193/260,193)이면 숨겨졌던 것 → 조건을 **`parts.length===2`(두 명이면 항상)**로 완화. 커플 breakdown은 정산 이미지 1곳에만 존재(화면·다른 이미지엔 없음). 헤드리스로 동일금액(260,193/260,193) 케이스 렌더해 합계 왼쪽에 겹침 없이 표시 확인. 표시 전용·계산 무관(이미 계산된 parts 금액을 보이기만 함), 계산 **193 통과**. |
| v7.99 | **①상세 이미지 섹션 제목(입금 내역·한턱 내역)이 왼쪽으로 치우쳐 보이던 것 — 콘텐츠 인셋 x=44로 통일 + 규칙 명문화**(사용자: 입금/한턱 내역 제목이 왜 왼쪽에 치우쳐 있냐 / 이런 것도 규칙화해야) — 섹션 제목이 `x=30`(페이지 헤더 레벨)인데 그 아래 행·항목 제목·품목명·합계는 전부 `x=44`(콘텐츠 인셋)이라 제목만 14px 왼쪽으로 튀어나옴 → 섹션 제목 `x=30→44`. **가로 인셋 공통 규칙**(구분선·카드 28~692, 콘텐츠 좌 44·우 676, 페이지 헤더만 30/690)을 CLAUDE.md 레이아웃 규칙에 명문화. **②집 컴퓨터에서만 기록 보관함 헤더(동기화·전체상세저장)가 밑의 정산상태 버튼보다 오른쪽으로 치우쳐 보이던 것**(사용자: 회사 컴퓨터에선 정상인데 집 컴퓨터에선 오른쪽 패널 헤더가 오른쪽 정렬이 안 맞음) — **근본원인**: `.hist-head-right`(동기화+전체상세저장)는 **고정 헤더(`.hist-page-nav`) 안**이라 스크롤바 영향을 안 받는데(`right:34px` 고정), 밑의 정산상태 버튼은 **스크롤 영역(`#histDrBody`) 안**이라 집 컴퓨터의 **클래식 스크롤바(~15px)**가 본문 폭을 줄여 버튼이 왼쪽으로 15px 밀림 → 헤더만 오른쪽에 남아 어긋남. 회사 컴퓨터는 오버레이 스크롤바(폭 0)라 정상. → `_syncHistHeadInset()` 신설(`#histDrBody.offsetWidth-clientWidth`=실제 스크롤바 폭을 `--hist-sbw`로), `.hist-head-right{right:calc(34px + var(--hist-sbw,0px))}`로 스크롤바 폭만큼 헤더를 왼쪽으로 당겨 버튼과 정렬. 드로어 갱신·창 리사이즈 시 재측정. 헤드리스로 DOM 구조(헤더=본문 밖·버튼=본문 안) 확인(클래식 스크롤바는 헤드리스서 재현 불가). 표시 전용·계산 무관, 계산 **193 통과**. |
| v7.98 | **①상세 이미지에 "한턱 내역" 섹션 추가**(사용자: 상세내역에 한턱도 나와야 하는 거 아닌가 — 항목별 🎉한턱 쏨 배지는 있었지만 결제자별 합 섹션 없었음) — `generateFullDetailCanvases` 하단에 입금 내역 위로 **한턱 내역**(결제자별 isTreat 합) 섹션 추가. 화면 `_treatBreakdownHtml`과 동일: 이름 + `🎉 한턱` 배지(`#FFF1E0`/`#E8710A`) + 금액. `treatRows`·`treatH`를 H 계산·페이지 높이에 포함, 한턱→입금 순서, 닫는 구분선·중앙 푸터는 마지막 섹션 기준 공유(`drewBottom`). 헤드리스로 한턱 2행 렌더 확인. **②화면 한턱/입금 내역 마지막 행이 위로 솟아 보이던 것**(사용자: 두번째 줄 내용이 구분선 기준 중앙정렬 안 되고 위로 솟음) — `.rc-txns{padding:0 0 4px}`의 아래 4px 때문에 마지막 행 아래 여백(11+4)이 위(11)보다 커서 내용이 위로 올라가던 것 → `padding:0`으로 위아래 11px 균등. **③구분선 두께 공통 규칙 정립·적용**(사용자: 구분선은 공통 규칙을 가져야 한다 / 품목명 밑 1.5, 세부 1, 합계 밑 2) — 상세 이미지 모든 구분선을 3단 규칙으로: 섹션 제목·품목명 밑 1.5px, 세부·행 사이 1px, **합계 위**(마지막 품목 행↔합계)·섹션 닫는 2px(합계 밑엔 선 없음 — 사용자 정정). 품목명 밑 1→1.5, 합계 위 1→2, 섹션 닫는 1.5→2. CLAUDE.md 레이아웃 규칙에 명문화. 표시 전용·계산 무관, 계산 **193 통과**. |
| v7.97 | **①화면 화살표 가로선(stroke)이 공유 이미지보다 2배 굵던 것 수정**(사용자: 화면 송금/입금 화살표 가로선이 너무 굵다 — 공유 이미지와 비교) — `svgArrow`·`svgArrowH` `stroke-width 2→1.2`. 공유 이미지 송금 화살표(`drawTxnRow`)의 `stroke/AL=2/36=0.056` 비율에 맞춤(기존 `2/20=0.10`=2배 굵음). 헤드리스로 기준(상세 이미지 행) 대비 선 두께 일치 확인. **②기록보관함 이미지 뷰어 정산/상세 토글이 두 번 터치해야 먹던 문제**(사용자: 줌 UI 비활성 시 첫 탭은 줌만 깨우고 토글은 두번째 탭) — `viewHistoryImage`에서 토글·저장·닫기 버튼을 줌 오버레이(`_bindImgZoom`) 포인터 처리와 분리: `isolate(el,fn)` 헬퍼로 `pointerdown` 전파 차단 + `pointerup`에서 직접 동작(한 번에). 표시 전용·계산 무관, 계산 **193 통과**. (※화면 화살표 크기 20/24px·색 #969BA4·가늘고 긴 삼각형은 v7.96에서 확정) |
| v7.96 | **상세 이미지에서 항목이 많을 때(페이지를 거의 채울 때) 하단 입금 내역·푸터가 바닥에 뭉개지던 버그 수정**(사용자: 8개 항목 실제 데이터에서 "1/1" 단일 페이지인데 "Let's split it"이 위 내용과 여유 없이 바닥에 붙음 — 내 시안은 1개 항목이라 못 잡음) — **근본원인**: `generateFullDetailCanvases`의 캔버스 높이가 `H=Math.max(620,Math.min(MAX_H,pg.used+txnH+FOOTER))`라, 항목(pg.used)이 페이지를 거의 채운 상태에서 입금 내역 블록(txnH)을 더하면 `MAX_H(3300)`를 넘겨 **H가 3300에 clamp → 입금 내역·닫는구분선·푸터가 캔버스 밖으로 밀려 바닥에 뭉개짐**. (입금 블록은 페이지 나눔 계산에 안 들어가서 발생.) → **`Math.min(MAX_H,...)` 상한 제거** → H가 `pg.used+txnH+FOOTER`만큼 늘어나(최대 ~3492) 한 페이지로 유지되면서 입금 내역·푸터가 정상 여백(v7.95 닫는구분선+중앙정렬)으로 자리잡음. 헤드리스 8항목 실데이터로 pages=1·푸터 여백 정상 확인. **+ 상세 이미지 입금 내역 화살표를 공유(정산)이미지 송금 화살표와 동일 모양으로**(사용자: 화살표가 일반 화살표가 아니다 / 공유 이미지처럼 — 상세 `drawArrow`가 빈 쉐브론(첫 수정) 또는 뭉툭 삼각형(두번째 시도)이라 공유의 **가늘고 긴 삼각형**과 달랐음) — 공유 `drawTxnRow` 화살표 비율(`AL=36:headW=24:AH=5`, `#969BA4`, W=1080)을 그대로 축소 적용: `drawArrow`를 `AL=20,headW=13,AH=2.8`(선7+가늘고 긴 삼각형13, ±2.8)로. **+ "전부 똑같이": 화면용 SVG 화살표 `svgArrow`(16px)·`svgArrowH`(13px, 수금·기록보관함 입금 내역)도 뭉툭 삼각형(`M13 6 L22 12 L13 18`, 9폭 ±6)에서 동일 비율(`M8.5 9.2 L22 12 L8.5 14.8`, line x2=9, 13.5폭 ±2.8)로 교체** → 캔버스(공유·상세·기록 이미지)·화면 전 화살표가 같은 모양. 헤드리스 확대 비교로 3종 동일 확인. 표시 전용·계산 무관, 계산 **193 통과**. |
| v7.95 | **상세 이미지 입금 내역에 닫는 구분선 추가 + 푸터("Let's split it. · Dropbox 보관용")를 구분선↔바닥 정중앙에**(사용자: 이영환(마지막 행) 밑에도 구분선 / 구분선 밑 Let's split it 기준으로 위·아래 여백 동일 / 측정이냐 추측이냐·여분 과함 지적 — 3~5번째 지적) — **헤드리스 픽셀 밴드 측정**으로 정산(`generateHistoryCanvas`) 여백과 직접 비교(추측 아님). ①`generateFullDetailCanvases` 입금 내역 **마지막 행 아래 닫는 구분선** 추가(섹션 상단과 동일 `#dedee3`/1.5 — 입금 블록을 위아래로 bookend). ②푸터를 그 **닫는 구분선과 캔버스 바닥의 정중앙**에 배치(`footerY=round((y+H)/2)+3`) — 측정 위74·아래77 device px로 균등. `FOOTER` 58→60으로 하단 여백 확보. 표시 전용·계산 무관, 계산 **193 통과**. |
| v7.94 | **①기록보관함 이미지 뷰어에 정산/상세 토글 — 상세내역 이미지도 보고 Dropbox 저장**(사용자: 기록보관함에서 상세내역 이미지를 볼 수 있고 드롭박스에 저장도 가능하게 / 이미지에서 정산내역·상세내역을 선택해서 보게) — `viewHistoryImage(id)` 재작성: 상단 중앙에 `정산`/`상세` 토글(`.history-image-viewer-seg`, 저장 버튼은 그 아래 top 62/84px로 내려 겹침 방지). 정산은 기존 `generateHistoryCanvas`, 상세는 `generateFullDetailCanvases`(다페이지)를 `_stackCanvases`로 한 장으로 이어붙여 lazy 생성 후 `img.src` 교체. `☁️ 드롭박스 저장`은 보는 모드에 따라 `saveHistRecToDropbox`(정산)/신설 `saveHistRecDetailToDropbox`(상세, `dbxDetailDir()` 상세내역 폴더에 업로드) 호출. `closeHistoryImageViewer`는 생성한 object URL 전부(`_objUrls`) 해제. 헤드리스(430px DSF2): 토글 전환·활성표시·저장버튼 top 62·겹침 없음·에러 없음 확인. **②모바일 영수증 링크 검정 깜빡임 수정**(사용자: 모바일에서 영수증이 검정으로 나타났다 파랑으로 바뀜) — `.rcpt-photo-link:hover`/`.rc-foot-link:hover`(`color:var(--label)` 검정)가 **터치 기기에서 탭 후 들러붙어** 검정으로 보이던 것 → 두 hover 규칙을 `@media(hover:hover)`로 감싸 마우스 기기에서만 적용. **③상세 이미지 입금 내역을 한 줄로**(사용자: 입금 정보를 배지 오른쪽으로 해서 한 줄로) — `generateFullDetailCanvases` 입금 내역 행에서 입금정보(실수령·은행·일시)를 아래 줄(y+60, 74px 행)에서 **배지 오른쪽 같은 줄**로 이동, 모든 행 52px 통일. 금액(우측 고정)과 안 겹치게 `mMax=(676-금액폭-14)-배지끝`으로 폭 계산해 자름(샘플 데이터는 전체 표시). `txnH` 높이 예약도 52px로. **(상세 이미지 하단 입금정보↔푸터 겹침은 v7.92에서 이미 수정됨 — 현재 코드 렌더로 재확인, 사용자가 본 겹침은 배포 전 캐시 화면.)** 표시 전용·계산 무관, 계산 **193 통과**. |
| v7.85 | **영수증 사진이 사라진 문제 — 재발 방지(병합) + 복구 도구**(사용자: 11/12 기록만 영수증 있고 나머지 다 없음) — **근본원인**: 동기화 병합 `_computeHistoryMerge`가 같은 id면 `savedAt` 최신본으로 **통째 교체(LWW)**라, Dropbox에 '영수증 참조(`receiptUrl`=`idb:키`) 빠진 더 최신 버전'이 있으면 로컬(사진 있던 것)을 덮어써 링크가 사라짐(11/12만 로컬이 최신이라 생존). v7.84의 기록보관함 당겨서 새로고침=reload가 부팅 동기화를 돌려 방아쇠였을 가능성. **①재발 방지**: `_computeHistoryMerge`를 '최신본을 쓰되 receiptUrl·상세는 둘 중 있는 쪽 보존'(`_mergeHistoryReceiptDetails(...,{preserveUrl:true})`)으로 — 앞으로 LWW가 사진 링크를 안 지움. **②복구 도구**(설정→Dropbox 카드 '영수증 사진 복구', `recoverReceipts`/`_recoverReceiptRefs`): Dropbox가 보관한 `dutch-pay_history.json` **이전 버전들**(`files/list_revisions`+`rev:` 다운로드)에서 (기록id·항목id로) **빈 receiptUrl만** 되살림(사진파일·IDB 안 건드림=비파괴). 잠긴 기록은 표시가 봉인 아카이브에서 나오므로 **아카이브 payload도 채워 재봉인**(`_fixedGuard`·sha256 재계산·`_saveFixedArchives`·`_syncFixedArchives`). dry-run으로 복구 개수 보여주고 confirm 후 적용+업로드(변경 기록 savedAt 갱신해 병합서 이기게). 헤드리스: 라이브 기록 복원·savedAt갱신·미변경 불변 검증(아카이브 경로는 lexical 캐시라 하네스 주입 불가 — 재봉인 헬퍼 자체 유효성 확인). 계산 **190 통과**. |
| v7.84 | **모바일 기록보관함에서 당겨서 새로고침이 먹통이던 것 — 다른 탭과 동일하게(당기면 reload) 통일**(사용자: 다른 탭 헤더는 당기면 새로고침되는데 기록보관함만 먹통) — **원인**: 전역 PTR(당겨서 `location.reload()`)의 BLOCK 목록에 `#histDr.open`·`.hist-page.open`이 있어 드로어 열리면 차단, 대신 드로어 전용 `_bindHistPTR`(Dropbox 동기화만, 인디케이터도 모바일서 안 보임)만 동작. → ①BLOCK에서 드로어 선택자 제거(이미지뷰어·시트·모달 등 나머지는 유지), ②`_ptrTop()` 신설 — 드로어 열려 있으면 `#histDrBody.scrollTop`, 아니면 `window.scrollY` 기준으로 '맨 위일 때만' 발동(목록 스크롤 중엔 발동 안 함), ③`_bindHistPTR()` 호출 제거(전역 PTR로 통일, reload가 부팅 시 Dropbox 동기화까지 포함), ④`.ptr-ind` z-index 95→350(드로어 z-index 300 위로, 스피너 보이게). 터치 제스처라 헤드리스 검증 불가(콘솔 에러 없음·드로어 정상만 확인), 계산 무관 **190 통과**. **+ 한턱 합계·"모두 정산 완료 ✓" 행 제거**(사용자: 의미 없음) — `_treatBreakdownHtml`에서 `rc-treat-sum`(합계) 삭제(사람별 한턱만 유지), 카드 no-txn 분기(`toggleAllRecCard`·`_buildRecordCardHtml`)에서 `rc-no-txn` 제거. test TC28 합계 검증 제거. |
| v7.83 | **카드 다듬기 후속 5종**(사용자 지적) — ①**기록보관함 한턱·입금내역 위 구분선 2줄→1줄**: `_buildRecordCardHtml`은 지출 행 셸이 flat이라 마지막 지출행 `border-bottom`(선1)+`rc-section-sep`(선2)로 2줄이던 것 → 입금내역 title의 `rc-section-sep` 제거, `_treatBreakdownHtml(r,withSep=false)` 추가(지출행 border가 이미 구분선). _renderCard(수금, 지출행이 `pm-rec-items` last-child라 border없음)·toggleAllRecCard(지출없음)는 sep 유지. ②**데스크탑 뷰어 드롭박스 저장 버튼** `top 16→36px`(`@media min-width:701`). ③**이번정산/전체기록 세그(`.pm-seg-row`)** 트랙 `--fill2→--fill`+`border` 추가, 활성 `box-shadow .16`로 구분 선명. ④**모바일 기록보관함 검색바**: 검색창 `flex 110→80`, 최신순·정산상태 `flex:0 0 92px`로 가로 동일, 최신순 화살표 svg `20×24`(2배). ⑤**최신순 화살표를 ▾글자→SVG 쉐브론**(카드 펼침 화살표처럼, 데스크탑 `14×17` 세로 길게, open시 180° 회전). 표시 전용·계산 무관, 계산 **190 통과**(한턱 TC28 유지). |
| v7.82 | **카드 다듬기 7종(그림자·잠김테두리·구분선 간격·상세배경·한턱내역·검색바·뷰어저장)**(사용자 지적) — ①**전체기록 아코디언 그림자**: 펼침 상세 `.pm-allrec-detail`에 `box-shadow` 추가(상단만 있던 그림자가 아래까지, record-card와 동일). ②**잠김 버튼 테두리**: `.rc-fix-btn.fixed`가 `border-color:transparent`라 혼자 테두리 없던 것 → `1px solid #aadcbb`(초록). ③**구분선 간격**: `.rc-item-row`·`.rc-txn-row` `padding 8px→11px`(여유 + 모든 곳 동일), 3line 절대배치 `top/bottom 8→11`. ④**상세 회색배경 옅게·통일**: `.pay-panel`·`.rc-receipt-wrap`·`.rc-txn-edit-panel`·`.pm-hist-edit-panel` `var(--fill)#F3F3F5→var(--detail-bg)#FAFAFA`. ⑤**한턱 내역**(신규 `_treatBreakdownHtml(r)`): 받을 돈 없는(모두 정산 완료) 카드에서 결제자별 한턱(isTreat) 합 + **한턱 합계**(amber)를 입금내역처럼 표시 — `toggleAllRecCard`·`_buildRecordCardHtml` no-txn 분기에 적용. ⑥**검색바**: 기록보관함 검색창 `flex-basis 180→110`, 최신순·정산상태 버튼 `padding 12→16/18`, 화살표 `10→14px`(모바일서 점으로 보이던 것). ⑦**입금내역 위 구분선 복원**: 신규 `.rc-section-sep`(상단 inset 1px)을 세 카드 입금내역 제목에 적용(지출 뒤 올 때). ⑧**뷰어 드롭박스저장 버튼**을 하단→상단중앙(하단 줌 알약과 겹침 해결). test **TC28 3케이스**(결제자별 한턱 집계·빈값·0/음수 제외) → 전체 **190 통과**(한턱 집계라 test). |
| v7.81 | **세 카드(기록보관함·수금 이름검색·수금 전체기록) foot 완전 통일 — 공용 `_cardFootHtml`**(사용자: 수금 카드를 기록보관함에 맞춰 통일 / 펼침 배경색·저장시간·구분선·버튼 동일하게 / 버튼 순서 잠금→이미지→수정→삭제 / 전부 박스·등폭 / 데스크탑=이모지+글자, 모바일=글자만 한 줄) — **공용 `_cardFootHtml(r)`** 신설(저장시각·N명 + 🔒잠금|잠김·🧾이미지·✏️수정·🗑삭제)해 `_buildRecordCardHtml`·`_renderCard`·`toggleAllRecCard` 세 곳이 동일 사용. 버튼 `.rc-foot-btns`: 전부 박스(색 유지: 잠금 노랑/잠김 초록/이미지·수정 파랑/삭제 빨강)·`min-width:60px` 등폭. **데스크탑** 저장시간+이모지+글자 한 줄, **모바일(≤700px)** 저장시간·이모지 숨기고 `flex:1` 글자버튼이 한 줄 꽉 채움(`.rc-btn-ico`/`.rc-btn-lbl` 토글). 전체기록 펼침 배경 `--detail-bg`→`--card`(흰색), 입금내역 `.rc-section-title`+`.rc-txns`로 기록보관함과 동일. 수금 삭제도 `deleteHistoryRecord`로 통일. 표시 전용·계산 무관, 계산 **187 통과**. |
| v7.80 | **이름 검색 카드(`_renderCard`)에도 "입금 내역" 섹션 추가 — 여러 명 기록의 입금자별 상세**(사용자: 전체기록뿐 아니라 이름으로 검색했을 때 여러 명일 경우에도 입금상세내역이 있어야) — `_renderCard` 펼침 바디에 **입금 내역 섹션**(그 기록의 `txns`(to=나) 입금자별 행 `이름 → 나` + 배지(실수령·은행·일시 metaText 인라인) + 금액, 탭하면 `toggleRcTxnPanel`로 상세 전개) 추가. 모호했던 **단일 `실수령액` 줄·foot 은행·시각 제거**(입금 내역이 입금자별로 대체) → foot는 `N명 + 수정`으로 간결. 지출 내역 + 입금 내역 둘 다 표시. 실제 렌더로 신유철 검색 카드에 입금 내역(신유철·이영환) 확인. 표시 전용·계산 무관, 계산 **187 통과**. |
| v7.79 | **전체기록 펼침 하단 관리 버튼을 큰 버튼→작은 텍스트로(기록보관함 foot와 통일)**(사용자: v7.78 펼친 카드의 큼직한 이미지저장/잠김/수정/삭제 버튼이 지저분 — "뭘 한거야?") — `toggleAllRecCard`의 `actions`를 `.rc-owner-actions`/`.rc-owner-btn`(flex:1 큰 버튼)에서 **기록보관함 카드 foot와 동일한 `.rc-foot`+`.rc-load-btn`/`.rc-del-btn`(작은 텍스트)**로 교체. 받을 돈 없는 기록은 "모두 정산 완료 ✓"+작은 버튼, 받을 돈 있는 기록은 입금 내역+작은 버튼. (받을 돈 없음=다른 사람이 결제해 나한테 들어올 입금이 없는 기록은 정상적으로 "완료"로 표시.) 표시 전용·계산 무관, 계산 **187 통과**. |
| v7.78 | **전체기록 목록 카드 통일 + 입금 내역 인라인(누구 입금인지 명확하게)**(사용자: ①입금관리 전체기록 목록도 기록보관함 카드처럼 ②다인원 기록에서 foot "토스뱅크·시각"이 누구 입금인지 모호 → 참석자별 입금 상세 인라인) — **①전체기록 카드**: `pm-allrec-card`를 통일 셸(`.rc-*`)로(날짜 풀표기 + `rc-name` + `rc-people` + 상태배지 금액 왼쪽 `rc-amt-line`). 확장 상세가 형제로 붙는 아코디언이라 `.pm-allrec-card`/`.pm-allrec-chev` 훅 유지(`toggleAllRecCard` 무변경). **②입금 내역 인라인**: `toggleAllRecCard` 펼침에 **"입금 내역 · 탭하면 실수령·금융기관·일시" 제목** 추가 + 입금자별 행(`이름 → 나` + 배지(실수령·은행·일시 metaText 인라인) + 금액), 탭하면 `toggleRcTxnPanel`로 그 사람 상세 패널(실수령액·입금일시·계좌·메모) 인라인 전개. **③person 카드(`_renderCard`) foot**: 단일 `은행·시각`이 모호 → **입금자 이름 prefix**(`${from} · 토스뱅크 · 시각`). 팝업 대신 인라인 채택. 실제 렌더 캡처로 전체기록 펼침(입금 내역+탭 상세) 확인. 표시 전용·계산 무관, 계산 **187 통과**. |
| v7.77 | **수금 카드 — 참석도 금액 자리에 `0원`(회색) + 금액줄 배열을 한턱→상태배지→금액 순으로**(사용자: 참석의 경우 0원 왼쪽에 참석 배지 / 금액·한턱 같이 있을 때 한턱(주황)→입금완료(녹색)→금액(검정, 오른쪽 끝) 순) — `_renderCard`에서 참여자(참석·한턱) 카드의 `amtHtml`을 빈값→`<div class="rc-total rc-total-zero">0원</div>`(`.rc-total-zero{color:--label3}` 회색)로, `.rc-amt-line` 내부 순서를 `badgeHtml→amtHtml→treatLineHtml`에서 **`treatLineHtml→badgeHtml→amtHtml`**로 변경(flex-end라 좌→우: 한턱→상태→금액). 한턱 문구는 "한턱 X원" 유지(사용자 '쏨' 미채택). 실제 `_pmHistResultsHtml()` 렌더 캡처로 3케이스(txn+한턱 / 순수 참석 0원 / 참석+한턱 0원) 확인. 표시 전용·계산 무관, 계산 **187 통과**. |
| v7.76 | **수금 탭 카드를 기록보관함 카드(`.record-card`/`.rc-*`)와 동일 모양으로 통일**(사용자: 입금관리 카드도 기록보관함처럼 통일시켜줬으면. 흉내 말고 실제 코드 재사용 요청) — `_renderCard`의 반환 HTML을 **기록 카드 셸을 그대로 재사용**하도록 재작성: 날짜 풀표기(`2026년 10월 6일`), 제목 `.rc-name`(15/700), 참여자 `.rc-people`, **배지를 금액 왼쪽 한 줄(`.rc-amt-line`)**, 금액 `.rc-total`(18px), 하단 항상보이는 `.rc-foot`(입금정보=수단·시각 또는 `N명` + ✏️수정 버튼), 지출내역은 `.rc-body`로 펼침. **토글·수정패널이 쓰는 훅은 그대로 유지**(`.pm-record-card`/`.pm-record-chev`/`.pm-rec-detail` 클래스를 새 구조에 병기) → `togglePmRecCard`·`toggleHistRecordPanel` 무변경. `_paymentBadgeHtml(...,{badgeOnly})` 옵션 추가(기본 false=기존 호출 불변, 수금 금액줄은 badgeOnly=true로 배지만). 실제 데이터로 `_pmHistResultsHtml()` 렌더 캡처해 기록 카드와 동일 확인. 표시 전용·계산 무관, 계산 **187 통과**. |
| v7.75 | **기록보관함 정산상태를 수금 탭과 일치 — 퉁(waived)을 중립 처리 + 퉁 금액 배지 표시**(사용자: 신유철 정산상태가 수금 탭은 +1,084원 초과인데 기록보관함은 +218원 초과로 866원 차이 — 866원 퉁친 것 때문. 통일하되 퉁도 표시되면 좋겠다) — **근본원인**: 앱 전체는 v7.06부터 '퉁=완전 중립'(청구·수령·미수 모든 집계 제외, line 3217)인데 **`_personSettleDelta`만 waived 체크가 빠져** 퉁 866을 '미납 부족(−866)'으로 깎음(1,084−866=218). → `_personSettleDelta` 루프에 **`if(pm.waived)continue;`**(퉁 집계 제외, 수금과 동일) → 기록보관함도 **+1,084**로 일치. **+ 표시**: `_personSettleWaived(r,person,owner)` 헬퍼 신설(검색한 사람→나 송금 중 퉁 금액 합), 카드 금액줄(`.rc-amt-line`)·요약(`.hmn-stat-settle`)에 회색 **`🤝 N원 퉁`** 배지 추가(초과/부족/완납 배지와 병기 가능, `.waived{--fill2/--label2}`=수금 퉁 배지와 동일 색). 헤드리스 검증: 2기록(퉁866+초과입금)→totalDelta=1084·totalWaived=866, 11/3카드 delta=null·waived=866. test TC26에 퉁 3케이스 추가(퉁→delta null·waived 금액 반환·혼합) → 전체 **187 통과**. 금액 집계라 test 필수. |
| v7.74 | **기록 검색 오염 수정 — 참여자가 아닌데 검색에 뜨던 모임 제외(0원 숨은 항목 + 사람 이름 우선)**(사용자: 신유철로 검색했더니 7/30 모임이 뜨는데 "참여자 어디에도 신유철 없다/카드를 전부 뒤져도 없다") — **근본원인 2가지**: ①카드는 `rcItems=(r.items).filter(+it.amount!==0)`로 **0원 항목을 숨기는데** `_filterHistoryRecords`는 **0원 항목까지 항목명을 검사** → 그 모임에 '신유철' 이름의 **0원 항목**이 숨어 있어 카드엔 안 보이고 검색엔 걸림(=사용자가 눈으로 못 찾은 이유). ②검색창이 상호명·참여자·날짜를 OR로 찾아 **사람 이름이 항목명/상호명에만 들어가도** 매칭. → `_filterHistoryRecords`를 **personMatch(참여자·송금당사자·결제자·분담멤버)/textMatch(그룹명·항목명)/dateMatch**로 분리: **(a) textMatch는 0원 아닌 항목만**(카드와 일치), **(b) 검색어가 어느 기록의 참여자이기도 하면(`isPersonQuery`) 사람 검색으로 간주해 textMatch만 걸린 불참 모임 제외**. groupName은 부팅마다 `_migrateHistoryGroupNames`로 `people.join`이라 오염원 아님. test **TC27 6케이스**(신유철→참여 모임만·0원항목 비매칭·전북상회 상호명 유지·조상현 양쪽·이정환 b만·날짜검색) + 스테일 스파→뷰티 테스트 수정 → 전체 **184 통과**. 검색 결과가 정산상태 집계(총지출·합계)에도 쓰여 금액 영향 → test 필수. |
| v7.73 | **정산상태를 '순수하게 내가 받을/받은 돈'만으로 확정(유철 결제건·제3자 제외) + 정산상태 버튼 파란 포커스 링 제거**(사용자: v7.72 net이 이 데이터엔 제3자 없어 원래와 동일(+123,668)하게 나옴 → "내가 신유철에게 줄 돈은 빼고 순수하게 내가 받은 금액만 배지로". + 버튼 파란 테두리 뭐냐) — `_personSettleDelta`를 **신유철→나(owner) 송금만** 집계(`실제−계획`, 미납=음수 '부족'·더받음=양수 '초과')로 확정. 내가 줄 돈(나→신유철, 유철 결제)·제3자 거래는 집계 제외→그런 송금만 있는 기록은 배지 null. (A안↔net 왕복 후 사용자 재확인으로 '내가 받을 돈만' 확정.) test TC26 8케이스(미납/완납/일부/더받음+초과/유철결제 제외/제3자 제외/혼합 −20000/owner미설정)→178 통과. **파란 테두리**: `.hist-settle-btn`에 포커스 스타일이 없어 브라우저 기본 파란 `:focus` 링이 뜨던 것 → `:focus{outline:none}`+`:focus-visible{2px var(--sep2)}`로 클릭 시 제거·키보드만 은은한 회색(정렬 버튼도 동일). 헤드리스: 요약 '221,300 부족'·유철결제 배지 없음·버튼 outline 회색. 금액 집계라 test 필수. | — 제3자 거래 제외, 유철 결제건은 '내가 줄 돈'으로 상계**(사용자: 신유철 정산상태 +123,668 초과에 유철 결제건이 섞임 → 처음엔 "제외"라 해서 A안(그 건 빼기)으로 했으나, 사용자: "유철이 결제한 건은 내가 신유철에게 보낸걸로 처리하는 것" → 빼지 말고 **차감 netting**이 맞음) — **근본원인**: `_personSettleDelta`가 신유철이 낀 모든 송금(from/to 아무나)을 더하고, 입금 체크는 '내가 받을 돈'만 추적해 유철 결제건(나→신유철)이 왜곡. → `_personSettleDelta(r,person,owner=_myName)`를 **조상현↔신유철 거래만**(제3자 제외) **양방향 상계**로: 신유철→나는 `실제−계획`(미납=음수 '부족'), 나→신유철(유철 결제)은 `계획−실제`(양수 '초과'=내가 줄 돈). 테스트용 owner 인자 추가. **test.html TC26 8케이스**(미납/완납/일부납/유철결제 +초과/제3자 제외/순정산 −70000/혼합 +55000/owner미설정)→ 전체 178 통과. **A안→net으로 정정**(사용자 지시). 금액 집계라 test 필수. |
| v7.71 | **기록 보관함 '정산상태' 배지가 떠도 카드·구분선 높이 불변 — 배지를 금액 왼쪽 같은 줄로**(사용자: 정산상태 켜면 ①요약(모임/○○지출/총지출) 구분선 높이가 달라짐 ②일자 카드에서 배지가 금액 아래라 카드가 높아짐. 배지를 금액 왼쪽에 두면 높이 동일하지 않냐) — **①요약**: `.hmn-stat-settle`의 `margin-top:3px` 제거(+`line-height:1`) → 배지 유무로 행 높이 안 변함. **②일자 카드**: `.rc-right`가 `flex-direction:column`이라 배지가 금액 아래로 쌓여 카드가 높아지던 걸, 금액+배지를 **`.rc-amt-line`(flex 한 줄, 배지=왼쪽)**로 묶음. `.rc-settle-badge` `margin-top:1px` 제거·`line-height:1`. 헤드리스 실측: 정산상태 끔/켬 모두 요약행 `[43,43,42]`·카드 head `[85,85,85]`로 **완전 동일**. 표시 전용·계산 무관, 계산 170/170. |
| v7.70 | **카테고리 뷰티(연꽃) 아이콘 크기를 다른 카테고리와 동일하게 + 두께 보정**(사용자: v7.69 연꽃이 다른 아이콘보다 약간 작음 / 크기 키우면 두께는 얇게) — `svgSpa`(연꽃)의 내부 그룹 transform `scale(0.78)`→**`scale(1)`**로 다른 카테고리 아이콘과 같은 크기로, 커진 만큼 `stroke-width 1.6→1.0`으로 얇게 보정. 실제 선택창(headless DSF3) 캡처로 골프·운동 등과 크기·두께 일치 확인 후 사용자 승인 받고 배포. 표시 전용·계산 무관, 계산 170/170. |
| v7.69 | **영수증 앱(receipt-db) 실제 코드로 통일 — 줌 알약 + 카테고리 뷰티(연꽃)**(사용자: "영수증앱 코드 그대로 쓰면 되잖아" → receipt-db 저장소를 세션에 붙여 실제 소스 확보) — **①줌 알약**: 영수증 앱 `.lightbox-zoom` CSS를 그대로 이식(`background:rgba(28,28,30,.78)`+`box-shadow:0 0 0 1px rgba(255,255,255,.28)` 흰링, 버튼 `min-width:44px;height:40px;font-size:20px;font-weight:500;line-height:1;flex center`, `%`는 `min-width:60px;font-size:13px`, `−`·`+`는 **글자**). v7.65~68 반복 어긋남의 원인은 내가 임의로 크기(24~46px)를 키운 것 — 영수증 앱의 **검증된 값**(40/20/500)을 그대로 쓰니 데스크탑서도 정렬됨. **②카테고리 스파→뷰티**: `svgSpa`를 영수증 앱 `beauty-line.svg`(연꽃 라인, `stroke=currentColor`)로 교체, 라벨 `스파`→`뷰티`, 자동분류에 뷰티·헤어·미용실·네일·왁싱·에스테틱·바버 추가(저장 key는 'spa' 유지=데이터 호환). 헤드리스: 줌 `−ㅤ203%ㅤ+` 한 줄 정렬·연꽃 '뷰티' 렌더 확인. 표시 전용·계산 무관, 계산 170/170. |
| v7.68 | **줌 알약 `−`·`+`를 글자 대신 SVG 아이콘으로 — 데스크탑/기기 무관 완전 수직정렬**(사용자: v7.67에도 데스크탑에서 `−`·`+`가 `600%`보다 아래로 내려감, "정렬 정렬 정렬") — 원인: `−`(U+2212)·`+` **글자의 세로 위치가 폰트/플랫폼마다 달라** flex 중앙정렬로도 %와 안 맞음(iOS뿐 아니라 데스크탑 Chrome도). → `_bindImgZoom`의 out/in 버튼 내용을 **SVG path 아이콘**(`M5 12h14` / `M12 5v14M5 12h14`, `stroke:#fff`·width 2.2·22px)으로 교체 → viewBox가 기하학적 중앙이라 폰트와 무관하게 `%`(텍스트)와 **같은 줄 완전 정렬**. 클릭 핸들러는 `closest('button')`+`dataset.z`라 SVG 자식이어도 정상. %만 텍스트 유지. 헤드리스: `−ㅤ203%ㅤ+` 한 줄 완전 정렬 확인. DOM 미세변경(버튼 안 글자→svg)·로직 불변. 표시 전용·계산 무관, 계산 170/170. |
| v7.67 | **이미지 뷰어 줌 알약을 영수증 앱 레퍼런스와 동일하게 확정 — `−  %  +` 한 줄 수직정렬 + 진한 회색 반투명**(사용자: v7.66에서 −가 %·+보다 낮게 어긋남/한 줄 정렬 필요, 투명도 조정. "영수증앱 코드 그대로 쓰면 되잖아" — 영수증앱은 별개 저장소라 소스 없어 스크린샷 기준으로 1:1 매칭) — `.imgzoom-ctl`을 `height:46px`+`align-items:stretch`, 버튼도 전부 `height:46px`+`display:flex;align-items:center`로 통일해 −·%·+가 **같은 줄에 수직중앙 정렬**(기존엔 line-height/glyph 차로 −가 내려감). 배경 `rgba(48,48,52,.55)`+blur4px(뷰어 백드롭 `rgba(0,0,0,.82)` 위라 레퍼런스처럼 진회색), 그림자 없음, 흰색 글자. 헤드리스로 글자 배경 위에 띄워 `−ㅤ203%ㅤ+` 한 줄 정렬·진회색 알약 육안 확인(레퍼런스와 일치). DOM·로직 불변, CSS만. 표시 전용·계산 무관, 계산 170/170. |
| v7.66 | **이미지 뷰어 줌 알약을 회색 반투명 바탕+흰색 글자로, 그림자 제거**(사용자: v7.65의 흰색 알약에서 투명도가 사라졌다 / 그림자 불필요 / 회색 투명 바탕에 흰색 −+% 로) — `.imgzoom-ctl` 배경을 `#fff`→**`rgba(60,60,67,.45)`+backdrop-blur(8px)**, `box-shadow` 제거, 버튼 글자 전부 흰색(`−`·`+`·`100%`), hover/active 음영도 흰색 계열(`rgba(255,255,255,.14/.24)`)로. DOM·로직 불변, CSS만. `.rcpt-viewer`·`.history-image-viewer` 공통. 표시 전용·계산 무관, 계산 170/170. |
| v7.65 | **영수증 이미지 뷰어 줌 컨트롤을 영수증 앱과 동일한 하단 중앙 흰색 알약으로 통일**(사용자: 영수증앱의 확대표기가 좋다 — 통일감있게 같은 스타일로. + 별건: v7.64 배포가 GitHub Pages 일시 인프라 오류 "Fetching artifact metadata failed"로 실패해 라이브가 v7.63에 멈춰 있던 것 발견 → 워크플로 재실행으로 v7.64 배포 성공. "버전 그대로"는 캐시 아니라 배포 실패였음) — 기존 `.imgzoom-ctl`은 반투명 검정 버튼 3개(gap 6px)였는데, 영수증 앱처럼 **하나의 흰색 알약**(`background:#fff`·`border-radius:999px`·그림자·padding 4px)으로 묶고 버튼은 투명·검정텍스트(`−`/`100%`/`+`, −·+ 25px·원래크기 15px 회색·tabular-nums)로 변경. hover/active 음영. DOM(3버튼)·`_bindImgZoom` 로직 불변, CSS만. `.rcpt-viewer`·`.history-image-viewer` 공통. 헤드리스: ctl bg #fff·radius 999px·48px·3버튼·'100%' 확인. 표시 전용·계산 무관, 계산 170/170. |
| v7.64 | **기기 간 삭제가 전파 안 되고 중복이 생기던 문제 — 삭제 톰스톤을 id뿐 아니라 '내용 지문'으로도(LWW)**(사용자: 모바일에서 삭제했는데 데스크탑 기록보관함엔 남아있고, 반대도, 중복도 가끔) — 근본원인: 삭제는 `_saveDelId(id)`로 **id 톰스톤**만 만들고 동기화 병합(`hSyncDropbox`)도 **id로만** 기록을 버리는데, 같은 정산이 기기마다 **다른 id**(옛 랜덤 id·sourceGroupId 없는 기록·다기기 저장)면 한쪽 삭제가 다른 쪽 기록 id와 안 맞아 **삭제 미전파 + 재업로드로 중복**. → **삭제 지문 톰스톤 `dutchpay_hist_deleted_fp` = {내용지문:삭제시각} 맵** 신설(`_histFingerprint` = 날짜·참여자·항목 기준). `deleteHistoryRecord`가 비잠금 삭제 시 `_saveDelFp(record)` 기록, 동기화 업로드 payload에 `deletedFps` 포함, 병합을 `_computeHistoryMerge`로 분리해 **id 톰스톤 OR 지문 톰스톤(삭제시각 이후 재저장분 제외=LWW)**에 걸리면 버림(잠금 기록은 `!_isHistoryFixed`로 보호). `saveToHistory`는 저장 시 해당 지문·id 톰스톤을 해제해 **동일 정산 재생성 정상**(삭제시각보다 나중 저장분은 생존). 헤드리스 4케이스: ①다른id 삭제전파(bbb drop) ②삭제후 재생성 생존+톰스톤해제 ③삭제없음 양기기 동일정산→saveHistory의 `_dedupHistoryDetailed`가 1개로 병합 ④삭제시각 이전분 삭제. 계산 170/170. **데이터 민감(삭제·동기화)이라 LWW로 재생성 손실 0 검증.** |
| v7.63 | **저장공간 부족(빨간 에러)로 기록 저장이 계속 실패하던 문제 — 저장 실패 시 영수증 사진을 IndexedDB로 이전 후 재시도(사진 보존)**(사용자: v7.62 재시도에도 "수정 내용 저장" 누르면 빨간 "브라우저 저장공간이 부족해 기록 저장에 실패했어요" 그대로) — v7.62는 레거시 자동백업만 비웠는데 그건 이미 비어 있었고, **진짜 용량 원인은 localStorage에 인라인으로 박힌 영수증 사진(base64 data URI)**. 부팅 마이그레이션(`_migrateReceiptsToIdb`)이 있지만 **이미 꽉 찬 상태에선 옮긴 결과를 저장하다 실패(try/catch가 삼킴)해 data URI가 그대로 남아** 매 저장이 실패. → `saveHistory`의 쿼터 복구를 **실질 복구로 교체**: ①레거시백업 제거 후 재시도 → 그래도 실패면 ②`_recoverStorageThenSaveHistory`가 `_migrateReceiptsToIdb`(라이브·그룹·기록)+`_offloadRecordImages`(저장할 배열 자체)로 **모든 인라인 사진을 IDB로 이전(사진은 IDB에 보존, LS엔 `idb:` 참조만)** 후 재저장. 데이터 손실 0(사진 IDB 보존·업로드 큐 등록). 그래도 부족하면 "오래된 기록/사진을 지워 공간을 비워주세요" 안내. 헤드리스: 인라인 사진 든 기록+강제 QuotaError→사진 IDB 보존·LS에 data URI 0·저장 성공 확인. 잠금 원본(fixed) 페이로드는 무결성 해시(sha256) 때문에 건드리지 않음. 계산 170/170. |
| v7.62 | **카테고리 선택 팝업이 억지로 스크롤되던 버그 수정 + 저장공간 초과 시 비파괴적 재시도**(사용자: v7.61로 잠김 버튼은 초록 '잠김'으로 정상 확인됨 ✓. 새 지적 2건 — ①카테고리(16종) 선택창이 왜 스크롤되냐 ②상단 빨간 "브라우저 저장공간이 부족해 기록 저장에 실패했어요"가 뭐냐) — **①카테고리 스크롤**: `category-grid.js`의 팝업은 `position:fixed`로 `body`에 붙어 anchor의 overflow 조상(스크롤 영역)에 전혀 안 잘리는데, `visibleBounds()`가 **그 overflow 조상들로 가용 높이를 재제한**해 2줄(8×2=16) 그리드가 '안 들어간다'고 오판 → `maxHeight`+`overflow:auto`로 clamp돼 스크롤. → `visibleBounds()`를 **뷰포트 기준으로만**(margin~innerHeight-margin) 단순화 → 그리드가 아래로 펼쳐지며 16개 전부 노출·스크롤 제거. 헤드리스(1400px): `overflowY:visible`·optCount16·clipped=false·openDir down. **②빨간 에러**: `saveHistory`의 `localStorage.setItem(HISTORY_KEY)`가 QuotaExceededError로 실패(기록에 영수증 사진 등이 쌓여 용량 초과). 저장이 실패 중이라 중요. → `saveHistory`에 **비파괴적 재시도** 추가: 쿼터 초과 시 `_freeLocalStorageOnce()`로 **레거시 localStorage 자동백업만 제거**(실제 복구본은 IndexedDB에 있어 정산·기록·이미지 손실 0) 후 1회 재시도. 근본 용량정리(기록 인라인 이미지의 IDB 이전)는 기기 실제 저장내용 확인 후 별도 진행 예정. 계산 170/170. |
| v7.61 | **잠금 후 '잠김' 버튼이 '잠금'으로 되돌아가던 문제 — 잠김 판정을 깨지기 쉬운 전체 서명 대신 검증된 `_histFingerprint`로 교체(근본 해결)**(사용자: v7.60(payments 제외)에도 데스크탑에서 여전히 노란 '🔓 잠금', 게다가 이 데이터엔 입금 자체가 없음 — payments 말고 다른 필드가 서명을 깨고 있었음) — v7.59/60은 서명에서 필드를 하나씩(톰스톤→payments) 빼는 식이라 **또 다른 부수 필드(멤버 순서·receiptText·coupleNames·id 등)가 다르면 계속 노랑으로 복귀**. → 버튼 잠김 판정을 `_historyContentSignature`(모든 필드 비교)에서 **앱 전역이 '같은 정산인가'에 쓰는 `_histFingerprint`(날짜·참여자·항목 이름/금액/결제자/멤버-정렬만)로 교체**. 이 지문은 입금·커플·영수증텍스트·멤버순서·id를 전부 무시하므로 그런 값이 달라져도 '잠김' 유지, **실제 항목/금액/결제자/참여자를 수정했을 때만 '잠금'으로 전환**(재잠금 유도 보존). `_historyLockMatches(r)=_histFingerprint(r)===_currentHistoryFingerprint()`, 버튼 3곳(정산결과·저장행·`_fixCurrentHistory`)에 적용. 중복제거·`_currentHistoryRecord` 매칭·`_sameHistoryContent`는 기존 full 서명 그대로. 헤드리스: 저장+잠금→잠김 / **멤버순서·영수증·입금·커플 동시 drift→잠김 유지**(기존엔 노랑) / 금액 수정→'잠금' 복귀. 계산 170/170. **데이터 민감(잠금)이라 재현+정상케이스 검증.** |
| v7.60 | **잠금 후 '잠김' 버튼이 입금(수금) 체크만 해도 '잠금'으로 되돌아가던 진짜 원인 — 잠김 판정 서명에 `payments`가 포함돼 있던 버그**(사용자: v7.59에도 데스크탑에서 잠금 눌러 "잠금 완료"/"이미 잠긴 기록이에요" 토스트는 뜨는데 정산결과·수금 버튼 둘 다 노란 '🔓 잠금' 그대로) — **재현 성공**: 저장+잠금 직후엔 '잠김'(green)인데, 수금 탭에서 입금 1건 체크해 live `payments`가 바뀌면 `_historyContentSignature`(잠긴 스냅샷)과 `_currentContentSignature`(현재)의 **payments 필드가 달라져 서명 불일치 → 버튼이 '잠금'(yellow)으로 복귀**. 기록은 실제로 잠겨 있어 클릭 시 "이미 잠긴 기록이에요"가 뜸(두 판정 불일치의 증거). 입금은 잠금 후에도 계속 바뀌는 운영 데이터이고 앱도 "잠긴 기록의 입금 현황을 갱신했어요"로 자동 반영하므로, **잠김 여부 판정에 payments를 넣은 것 자체가 모순**. → **payments를 뺀 전용 잠금서명 `_lockIdentitySig`/`_currentLockIdentitySig`/`_historyLockMatches`(날짜·참여자·total·items·커플만)** 신설, 버튼 판정 3곳(정산결과 line 3631·공유/저장행 line 5852·`_fixCurrentHistory` line 5871)만 이걸로 교체. 중복제거·`_sameHistoryContent`·`_currentHistoryRecord` 매칭은 full 서명 그대로(동작 불변). 헤드리스: 저장+잠금→잠김 / 입금 체크→**잠김 유지**(기존엔 잠금으로 복귀) / 항목 금액 수정→'잠금'으로 올바르게 복귀(재잠금 유도 보존). 계산 170/170. **데이터 민감(잠금)이라 재현+정상케이스 둘 다 검증.** |
| v7.59 | **잠금 후 '잠김'으로 안 바뀌는 진짜 원인 — 재잠금 시 잠금 톰스톤(`_fixed_deleted`)이 새 잠금을 버리던 버그**(사용자: v7.58에도 데스크탑에서 잠금 눌러 "잠금 완료" 토스트는 뜨는데 정산결과·기록카드 버튼 둘 다 노란 '🔓 잠금' 그대로) — **재현 성공**: 기록 id가 `dutchpay_fixed_deleted_v1`(잠금 삭제 톰스톤)에 있으면 `_saveFixedArchives`가 `!deleted.has(recordId)` 필터로 **새 잠금 엔트리를 조용히 버림** → `_isHistoryFixed` false → "잠금 완료" 토스트는 떠도 버튼은 '잠금' 유지(fixedCache 빔). 톰스톤은 과거에 그 기록을 **잠금해제(수정용)·삭제**할 때 추가됨 → 같은 기록을 다시 잠그면 재잠금이 버려짐. → **`fixHistoryRecord`가 저장 전에 `_unmarkFixedDeletedId(id)`로 톰스톤 제거**(재잠금이 과거 삭제표식보다 우선) + **`_syncFixedArchives`도 로컬에서 (다시)잠근 기록을 remote 톰스톤 병합분에서 제외·정리**(동기화가 재잠금을 되돌리지 않게). 헤드리스: 톰스톤에 든 기록 잠금 전 isFixed=false·버튼'잠금'(재현)→수정 후 isFixed=true·버튼'잠김'·톰스톤 비워짐. 일반 잠금 정상 유지, 계산 170/170. **데이터 민감(잠금)이라 재현+정상케이스 둘 다 검증.** |
| v7.58 | **잠금(🔒) 후 버튼이 '잠금'→'잠김'으로 안 바뀌던 문제 — 드로어 표시 중인데 `_histDrawerOpen` 플래그가 false인 경우 처리**(사용자: 데스크탑에서 잠금 눌러 "잠금 완료" 토스트는 떴는데 버튼 아이콘이 노란 '🔓 잠금' 그대로) — `_refreshHistoryLockSurfaces()`가 `if(_histDrawerOpen)_refreshHistDrawer();else renderAll(true)` 구조인데, **`renderAll`은 기록 드로어 카드(`#histDrContent`)를 다시 그리지 않음**. 데스크탑에서 탭 전환 등으로 드로어는 화면에 떠 있는데(`#histDr.open`) `_histDrawerOpen`만 false가 된 상황이면 잠금 후 `renderAll` 분기를 타 카드가 안 갱신돼 버튼이 그대로. → **드로어가 실제로 보이면(`#histDr`에 `.open` 클래스) 플래그와 무관하게 `_refreshHistDrawer()` 호출**하도록 조건 확장(`_histDrawerOpen||dr.classList.contains('open')`). 헤드리스: 플래그=false+드로어open 상태에서 `fixHistoryRecord`→버튼 '잠김/rc-fix-btn fixed'로 갱신 확인(기존엔 '잠금' 유지). 단일/Dropbox연결/중복 기록 케이스는 기존에도 정상. 표시 전용·계산 무관, 계산 170/170 |

> 📁 **오래된 버전(v7.35 이하) 변경 이력은 [`CHANGELOG.md`](CHANGELOG.md)에 보관되어 있습니다.** (크레딧 절약을 위해 최근 16개만 여기 유지 — 전체 기록은 손실 없음)

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
- **컨트롤 높이 통일(v7.46):** 한 줄에 나란히 놓이는 입력창·버튼·칩(검색창+정렬+정산상태 등)은 **반드시 같은 높이**로 맞춘다 — 모바일 36px, 데스크탑 36px. `box-sizing:border-box`+명시적 `height`로 고정(패딩·테두리·폰트 차이로 자연 높이가 어긋나는 것 방지). 특히 `type=search` 입력창은 자연 높이가 pill 버튼보다 커지기 쉬우니 주의.
- **드로어 헤더=다른 탭 헤더와 동일 규격(v7.40~46):** 기록 보관함·설정 등 오른쪽 패널/드로어의 모바일 헤더는 공용 `.mob-header`와 **구분선 위치(bottom 104)·eyebrow top(18)·제목 top(55)·24px**를 픽셀 단위로 맞춘다. 바꾸면 헤드리스로 shell vs 드로어 두 값을 실측해 일치 확인. **반드시 사용자 실기기 폭(430px)으로 측정**(390px로 재면 2~6px 차이를 놓침, v7.49). 구분선 위치뿐 아니라 **구분선→첫 콘텐츠 간격(16px)**도 맞출 것.
- **데스크탑 드로어 헤더 우측 정렬=스크롤바 폭 보정(v7.99):** 고정 헤더(`.hist-page-nav`)의 우측 버튼(`.hist-head-right`)과, 스크롤 본문(`#histDrBody`) 안의 콘텐츠(정산상태 버튼 등)는 **오른쪽 세로선이 맞아야** 한다. 본문엔 클래식 스크롤바(Windows 등)가 있으면 폭(~15px)만큼 콘텐츠가 왼쪽으로 밀리는데 고정 헤더는 안 밀려 **스크롤바 쓰는 기기에서만 헤더가 오른쪽으로 치우쳐 보인다**(오버레이 스크롤바 Mac은 정상). → `_syncHistHeadInset()`가 `offsetWidth-clientWidth`로 실제 스크롤바 폭을 재 `--hist-sbw`에 넣고, 헤더 우측 버튼 `right:calc(기본값 + var(--hist-sbw))`로 보정한다. **기기마다 스크롤바 유무가 다르니 집/회사 등 환경차 버그는 스크롤바를 의심**할 것.
- **상세 이미지 페이지 나눔 규칙(`generateFullDetailCanvases`, v7.96 확정):**
  - **세그먼트 단위:** 지출 항목 1개 = 세그먼트 1개. 한 항목의 영수증 품목이 `MAX_ROWS(38)`줄을 넘을 때만 그 항목을 38줄 단위로 쪼개고 `(계속)`·`다음 페이지에 계속`을 표기한다. **그 외에는 항목을 절대 중간에 자르지 않는다.**
  - **나눔 기준:** 세그먼트를 위에서부터 쌓다가, 다음 세그먼트를 더하면 페이지 높이가 **`MAX_H - FOOTER = 3300 - 60 = 3240px`를 넘는 순간** 그 세그먼트부터 **새 페이지**로 넘긴다(항목 경계에서만 나뉨).
  - **페이지 상수:** `HEADER=154, ROW=48, CARD_GAP=14, FOOTER=60, MAX_ROWS=38, MAX_H=3300`. 항목 세그먼트 높이 `h = 104(제목)+14(gap)+44(열머리글)+rows*48 + (마지막조각?72:36) + 22`.
  - **헤더·푸터 반복:** 각 페이지마다 헤더(제목 `상세내역`·총액·날짜[범위]·`N / M` 페이지번호)와 자체 푸터(`Let's split it. · Dropbox 보관용`)를 그린다. 날짜 범위(`YYYY.MM.DD ~ YYYY.MM.DD`)도 모든 페이지에 표기.
  - **한턱/입금 내역 블록:** 마지막 페이지에만 붙인다. 캔버스 높이 `H`는 `Math.max(620, pg.used+treatH+txnH+bottomPad)`로 **MAX_H 상한을 두지 않는다**(v7.96) — 항목이 페이지를 거의 채운 상태에서 한턱·입금 블록을 더해도 잘리지 않고 그만큼 페이지가 늘어나 내역·닫는구분선·푸터가 바닥에 뭉개지지 않는다. (하단 블록은 페이지 나눔 계산에 들어가지 않으므로 반드시 상한을 열어 둬야 함.) `treatH`/`txnH`는 각 섹션 실제 높이(`16+44+rows*52`, 꼬리 `+28` 없음), `bottomPad=(treatH||txnH)?(28+FOOTER):FOOTER`로 하단 여백 88px 고정(v8.02 — 아래 "섹션 닫는 구분선·푸터 하단 여백" 참조).
  - **섹션 닫는 구분선·푸터 하단 여백(v8.02 확정):** 한턱 내역·입금 내역 각 섹션은 마지막 행 밑에 **2px `#dedee3` 닫는 구분선**으로 bookend한다(한턱→입금 순서면 한턱 밑에도 추가). 푸터(`Let's split it. · Dropbox 보관용`)는 **마지막 섹션의 닫는 구분선과 바닥의 정중앙**(`footerY=round((y+H)/2)+3`)에 둔다. **단, 하단 블록(닫는구분선~바닥)은 섹션 유무·개수와 무관하게 항상 88px로 고정**해야 한다 — `treatH`/`txnH`는 꼬리 `+28` 없이 실제 높이만, `bottomPad=(treatH||txnH)?(28+FOOTER):FOOTER`. (과거 버그: 꼬리 `+28`이 한턱·입금 둘 다 있을 때 중복돼 여백이 116px로 커짐.) 측정값: 닫는구분선→푸터 43px·푸터→바닥 44.5px.
  - **뷰어·저장:** `viewHistoryImage` 상세 모드와 Dropbox 저장은 여러 페이지를 `_stackCanvases`로 세로로 이어 붙여 한 장으로 보여주고/저장한다.
  - **주의:** 페이지 나눔·여백은 **1개 항목만으로 검증하면 꽉 찬 페이지 버그를 못 잡는다** — 반드시 페이지를 넘기는 다항목(≥10개) 실데이터로 헤드리스 렌더해 `pages` 수·경계(항목 단위)·마지막 페이지 푸터 여백을 확인한다.
- **구분선 두께 공통 규칙(상세 이미지, v7.98 확정 — 모든 섹션 동일 적용):**
  - **섹션 제목·열머리글 밑 구분선 = `1.5px` `#dedee3`** (품목명 밑, 입금 내역·한턱 내역 제목 밑)
  - **세부내역·행 사이 구분선 = `1px` `#ececf0`** (품목 행 사이, 입금·한턱 행 사이)
  - **합계 위·섹션 닫는 구분선 = `2px` `#dedee3`** (마지막 품목 행↔합계 사이=합계 위, 입금/한턱 마지막 섹션 닫는 구분선. 합계 밑엔 선 없음)
  - 페이지 최상단 헤더(상세내역/총액/날짜) 밑 구분선도 `2px`(최상위 구분).
  - 새 섹션·표를 추가할 때 반드시 이 3단 두께를 따른다(제목=1.5 / 행=1 / 합계·닫음=2).
- **상세 이미지 가로 인셋 공통 규칙(`generateFullDetailCanvases`, v7.98 확정):**
  - **구분선·카드 배경**: `x=28 ~ x=692` (전체 콘텐츠 폭)
  - **모든 콘텐츠 텍스트 좌측 = `x=44`** (인셋 16): 항목 제목·품목명·세부 행·합계·**섹션 제목(입금 내역·한턱 내역)**·섹션 행 전부. 섹션 제목을 `x=30`에 두지 말 것(행보다 왼쪽으로 튀어나옴).
  - **우측정렬 콘텐츠 = `x=676`** (우 인셋 16): 금액 등.
  - **페이지 헤더(상세내역·총액·날짜·N/M)만 `x=30`/`x=690`**(문서 제목 레벨, 콘텐츠와 구분).
  - 새 섹션·행을 추가할 때 좌=44, 우=676을 반드시 따른다.
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
| `dutchpay_hist_deleted_fp` | 삭제된 기록의 내용 지문→삭제시각 맵 — 기기마다 id 달라도 삭제 전파(LWW) (`HISTORY_DEL_FP_KEY`, v7.64) |
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

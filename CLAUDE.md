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
**v7.64** (2026-11-13) — 작업 브랜치

## 버전 히스토리 요약
| 버전 | 주요 변경 |
|------|-----------|
| v7.64 | **기기 간 삭제가 전파 안 되고 중복이 생기던 문제 — 삭제 톰스톤을 id뿐 아니라 '내용 지문'으로도(LWW)**(사용자: 모바일에서 삭제했는데 데스크탑 기록보관함엔 남아있고, 반대도, 중복도 가끔) — 근본원인: 삭제는 `_saveDelId(id)`로 **id 톰스톤**만 만들고 동기화 병합(`hSyncDropbox`)도 **id로만** 기록을 버리는데, 같은 정산이 기기마다 **다른 id**(옛 랜덤 id·sourceGroupId 없는 기록·다기기 저장)면 한쪽 삭제가 다른 쪽 기록 id와 안 맞아 **삭제 미전파 + 재업로드로 중복**. → **삭제 지문 톰스톤 `dutchpay_hist_deleted_fp` = {내용지문:삭제시각} 맵** 신설(`_histFingerprint` = 날짜·참여자·항목 기준). `deleteHistoryRecord`가 비잠금 삭제 시 `_saveDelFp(record)` 기록, 동기화 업로드 payload에 `deletedFps` 포함, 병합을 `_computeHistoryMerge`로 분리해 **id 톰스톤 OR 지문 톰스톤(삭제시각 이후 재저장분 제외=LWW)**에 걸리면 버림(잠금 기록은 `!_isHistoryFixed`로 보호). `saveToHistory`는 저장 시 해당 지문·id 톰스톤을 해제해 **동일 정산 재생성 정상**(삭제시각보다 나중 저장분은 생존). 헤드리스 4케이스: ①다른id 삭제전파(bbb drop) ②삭제후 재생성 생존+톰스톤해제 ③삭제없음 양기기 동일정산→saveHistory의 `_dedupHistoryDetailed`가 1개로 병합 ④삭제시각 이전분 삭제. 계산 170/170. **데이터 민감(삭제·동기화)이라 LWW로 재생성 손실 0 검증.** |
| v7.63 | **저장공간 부족(빨간 에러)로 기록 저장이 계속 실패하던 문제 — 저장 실패 시 영수증 사진을 IndexedDB로 이전 후 재시도(사진 보존)**(사용자: v7.62 재시도에도 "수정 내용 저장" 누르면 빨간 "브라우저 저장공간이 부족해 기록 저장에 실패했어요" 그대로) — v7.62는 레거시 자동백업만 비웠는데 그건 이미 비어 있었고, **진짜 용량 원인은 localStorage에 인라인으로 박힌 영수증 사진(base64 data URI)**. 부팅 마이그레이션(`_migrateReceiptsToIdb`)이 있지만 **이미 꽉 찬 상태에선 옮긴 결과를 저장하다 실패(try/catch가 삼킴)해 data URI가 그대로 남아** 매 저장이 실패. → `saveHistory`의 쿼터 복구를 **실질 복구로 교체**: ①레거시백업 제거 후 재시도 → 그래도 실패면 ②`_recoverStorageThenSaveHistory`가 `_migrateReceiptsToIdb`(라이브·그룹·기록)+`_offloadRecordImages`(저장할 배열 자체)로 **모든 인라인 사진을 IDB로 이전(사진은 IDB에 보존, LS엔 `idb:` 참조만)** 후 재저장. 데이터 손실 0(사진 IDB 보존·업로드 큐 등록). 그래도 부족하면 "오래된 기록/사진을 지워 공간을 비워주세요" 안내. 헤드리스: 인라인 사진 든 기록+강제 QuotaError→사진 IDB 보존·LS에 data URI 0·저장 성공 확인. 잠금 원본(fixed) 페이로드는 무결성 해시(sha256) 때문에 건드리지 않음. 계산 170/170. |
| v7.62 | **카테고리 선택 팝업이 억지로 스크롤되던 버그 수정 + 저장공간 초과 시 비파괴적 재시도**(사용자: v7.61로 잠김 버튼은 초록 '잠김'으로 정상 확인됨 ✓. 새 지적 2건 — ①카테고리(16종) 선택창이 왜 스크롤되냐 ②상단 빨간 "브라우저 저장공간이 부족해 기록 저장에 실패했어요"가 뭐냐) — **①카테고리 스크롤**: `category-grid.js`의 팝업은 `position:fixed`로 `body`에 붙어 anchor의 overflow 조상(스크롤 영역)에 전혀 안 잘리는데, `visibleBounds()`가 **그 overflow 조상들로 가용 높이를 재제한**해 2줄(8×2=16) 그리드가 '안 들어간다'고 오판 → `maxHeight`+`overflow:auto`로 clamp돼 스크롤. → `visibleBounds()`를 **뷰포트 기준으로만**(margin~innerHeight-margin) 단순화 → 그리드가 아래로 펼쳐지며 16개 전부 노출·스크롤 제거. 헤드리스(1400px): `overflowY:visible`·optCount16·clipped=false·openDir down. **②빨간 에러**: `saveHistory`의 `localStorage.setItem(HISTORY_KEY)`가 QuotaExceededError로 실패(기록에 영수증 사진 등이 쌓여 용량 초과). 저장이 실패 중이라 중요. → `saveHistory`에 **비파괴적 재시도** 추가: 쿼터 초과 시 `_freeLocalStorageOnce()`로 **레거시 localStorage 자동백업만 제거**(실제 복구본은 IndexedDB에 있어 정산·기록·이미지 손실 0) 후 1회 재시도. 근본 용량정리(기록 인라인 이미지의 IDB 이전)는 기기 실제 저장내용 확인 후 별도 진행 예정. 계산 170/170. |
| v7.61 | **잠금 후 '잠김' 버튼이 '잠금'으로 되돌아가던 문제 — 잠김 판정을 깨지기 쉬운 전체 서명 대신 검증된 `_histFingerprint`로 교체(근본 해결)**(사용자: v7.60(payments 제외)에도 데스크탑에서 여전히 노란 '🔓 잠금', 게다가 이 데이터엔 입금 자체가 없음 — payments 말고 다른 필드가 서명을 깨고 있었음) — v7.59/60은 서명에서 필드를 하나씩(톰스톤→payments) 빼는 식이라 **또 다른 부수 필드(멤버 순서·receiptText·coupleNames·id 등)가 다르면 계속 노랑으로 복귀**. → 버튼 잠김 판정을 `_historyContentSignature`(모든 필드 비교)에서 **앱 전역이 '같은 정산인가'에 쓰는 `_histFingerprint`(날짜·참여자·항목 이름/금액/결제자/멤버-정렬만)로 교체**. 이 지문은 입금·커플·영수증텍스트·멤버순서·id를 전부 무시하므로 그런 값이 달라져도 '잠김' 유지, **실제 항목/금액/결제자/참여자를 수정했을 때만 '잠금'으로 전환**(재잠금 유도 보존). `_historyLockMatches(r)=_histFingerprint(r)===_currentHistoryFingerprint()`, 버튼 3곳(정산결과·저장행·`_fixCurrentHistory`)에 적용. 중복제거·`_currentHistoryRecord` 매칭·`_sameHistoryContent`는 기존 full 서명 그대로. 헤드리스: 저장+잠금→잠김 / **멤버순서·영수증·입금·커플 동시 drift→잠김 유지**(기존엔 노랑) / 금액 수정→'잠금' 복귀. 계산 170/170. **데이터 민감(잠금)이라 재현+정상케이스 검증.** |
| v7.60 | **잠금 후 '잠김' 버튼이 입금(수금) 체크만 해도 '잠금'으로 되돌아가던 진짜 원인 — 잠김 판정 서명에 `payments`가 포함돼 있던 버그**(사용자: v7.59에도 데스크탑에서 잠금 눌러 "잠금 완료"/"이미 잠긴 기록이에요" 토스트는 뜨는데 정산결과·수금 버튼 둘 다 노란 '🔓 잠금' 그대로) — **재현 성공**: 저장+잠금 직후엔 '잠김'(green)인데, 수금 탭에서 입금 1건 체크해 live `payments`가 바뀌면 `_historyContentSignature`(잠긴 스냅샷)과 `_currentContentSignature`(현재)의 **payments 필드가 달라져 서명 불일치 → 버튼이 '잠금'(yellow)으로 복귀**. 기록은 실제로 잠겨 있어 클릭 시 "이미 잠긴 기록이에요"가 뜸(두 판정 불일치의 증거). 입금은 잠금 후에도 계속 바뀌는 운영 데이터이고 앱도 "잠긴 기록의 입금 현황을 갱신했어요"로 자동 반영하므로, **잠김 여부 판정에 payments를 넣은 것 자체가 모순**. → **payments를 뺀 전용 잠금서명 `_lockIdentitySig`/`_currentLockIdentitySig`/`_historyLockMatches`(날짜·참여자·total·items·커플만)** 신설, 버튼 판정 3곳(정산결과 line 3631·공유/저장행 line 5852·`_fixCurrentHistory` line 5871)만 이걸로 교체. 중복제거·`_sameHistoryContent`·`_currentHistoryRecord` 매칭은 full 서명 그대로(동작 불변). 헤드리스: 저장+잠금→잠김 / 입금 체크→**잠김 유지**(기존엔 잠금으로 복귀) / 항목 금액 수정→'잠금'으로 올바르게 복귀(재잠금 유도 보존). 계산 170/170. **데이터 민감(잠금)이라 재현+정상케이스 둘 다 검증.** |
| v7.59 | **잠금 후 '잠김'으로 안 바뀌는 진짜 원인 — 재잠금 시 잠금 톰스톤(`_fixed_deleted`)이 새 잠금을 버리던 버그**(사용자: v7.58에도 데스크탑에서 잠금 눌러 "잠금 완료" 토스트는 뜨는데 정산결과·기록카드 버튼 둘 다 노란 '🔓 잠금' 그대로) — **재현 성공**: 기록 id가 `dutchpay_fixed_deleted_v1`(잠금 삭제 톰스톤)에 있으면 `_saveFixedArchives`가 `!deleted.has(recordId)` 필터로 **새 잠금 엔트리를 조용히 버림** → `_isHistoryFixed` false → "잠금 완료" 토스트는 떠도 버튼은 '잠금' 유지(fixedCache 빔). 톰스톤은 과거에 그 기록을 **잠금해제(수정용)·삭제**할 때 추가됨 → 같은 기록을 다시 잠그면 재잠금이 버려짐. → **`fixHistoryRecord`가 저장 전에 `_unmarkFixedDeletedId(id)`로 톰스톤 제거**(재잠금이 과거 삭제표식보다 우선) + **`_syncFixedArchives`도 로컬에서 (다시)잠근 기록을 remote 톰스톤 병합분에서 제외·정리**(동기화가 재잠금을 되돌리지 않게). 헤드리스: 톰스톤에 든 기록 잠금 전 isFixed=false·버튼'잠금'(재현)→수정 후 isFixed=true·버튼'잠김'·톰스톤 비워짐. 일반 잠금 정상 유지, 계산 170/170. **데이터 민감(잠금)이라 재현+정상케이스 둘 다 검증.** |
| v7.58 | **잠금(🔒) 후 버튼이 '잠금'→'잠김'으로 안 바뀌던 문제 — 드로어 표시 중인데 `_histDrawerOpen` 플래그가 false인 경우 처리**(사용자: 데스크탑에서 잠금 눌러 "잠금 완료" 토스트는 떴는데 버튼 아이콘이 노란 '🔓 잠금' 그대로) — `_refreshHistoryLockSurfaces()`가 `if(_histDrawerOpen)_refreshHistDrawer();else renderAll(true)` 구조인데, **`renderAll`은 기록 드로어 카드(`#histDrContent`)를 다시 그리지 않음**. 데스크탑에서 탭 전환 등으로 드로어는 화면에 떠 있는데(`#histDr.open`) `_histDrawerOpen`만 false가 된 상황이면 잠금 후 `renderAll` 분기를 타 카드가 안 갱신돼 버튼이 그대로. → **드로어가 실제로 보이면(`#histDr`에 `.open` 클래스) 플래그와 무관하게 `_refreshHistDrawer()` 호출**하도록 조건 확장(`_histDrawerOpen||dr.classList.contains('open')`). 헤드리스: 플래그=false+드로어open 상태에서 `fixHistoryRecord`→버튼 '잠김/rc-fix-btn fixed'로 갱신 확인(기존엔 '잠금' 유지). 단일/Dropbox연결/중복 기록 케이스는 기존에도 정상. 표시 전용·계산 무관, 계산 170/170 |
| v7.57 | **데스크탑 기록보관함 — 왼쪽 날짜칸과 오른쪽 검색창의 '시작 높이(top)' 정렬**(사용자: 두 박스 크기(높이)는 같은데 **시작되는 세로 위치가 다름**, 빨간선으로 표시 — "시작되는 높이를 얘기하는 거야") — 실측: 두 패널 콘텐츠 영역은 **같은 y(헤더 구분선 175)에서 시작**하는데, 왼쪽 `.left-controls`는 `padding-top:18px`(날짜칸 top 193)이고 오른쪽 검색줄 `.hist-page .hist-dr-sinp-wrap`는 `padding-top:14px`(검색창 top 189)라 **4px 어긋남**(검색창이 4px 위). → 데스크탑 검색줄 패딩 `14px→18px`로 왼쪽과 통일 → **날짜칸 top 193 == 검색창 top 193** 정렬. 박스 높이는 둘 다 36px로 이미 동일(v7.55). 데스크탑 전용(min-width:701)·모바일 불변. 헤드리스(1500px): dateBox top 193 == search top 193. 표시 전용·계산 무관, 계산 170/170 |
| v7.56 | **모바일 전체상세저장 버튼을 헤더로 이동(데스크탑과 동일)+데스크탑 검색창 고정 해제**(사용자: "데스크탑은 전체상세저장이 헤더에 있고 모바일은 헤더 밑에 있어 어색—모바일도 헤더로 옮겨라" / "검색창만 혼자 고정되면 어쩌자는 거냐, 아예 스크롤되게 하던가") — (1) v7.55에서 본문으로 뺐던 `전체 상세 저장`을 **모바일 헤더 `.hist-mob-shell` 제목줄(`.mob-title-row`) 우측으로 복귀**해 데스크탑 헤더 배치와 일치. 단 버튼(31px)만으론 제목줄 높이가 40px(다른 탭 총지출)보다 낮아 구분선이 다시 어긋나므로, **`.mob-total-stack`(총 기록·건수)을 `visibility:hidden;width:0` 스페이서(`.hist-shell-spacer`)로 유지**해 40px 높이는 그대로 확보(= 같은 요소라 기기 무관 동일 렌더). 버튼은 `margin-left:auto`로 우측정렬·세로중앙. `.hist-mob-actions`(본문 버튼) 제거. (2) 데스크탑 `.hist-dr-sinp-wrap` `position:sticky`→**`static`**로 검색줄이 기록과 함께 스크롤(혼자 고정 안 됨). 헤드리스(safe=0·59): `.hist-mob-shell` divider == `.mob-header` divider **0.000px** 유지, 모바일 헤더에 버튼 표시, 데스크탑 검색 position static·헤더 버튼 유지·설정 드로어 불변. 표시 전용·계산 무관, 계산 170/170 |
| v7.55 | **모바일 기록 헤더를 흉내가 아니라 다른 탭과 '같은 `.mob-header`'로 교체 — 헤더 밑 구분선 실기기 불일치 근본 해결**(사용자: v7.54(4→2px)에도 모바일에서 아직 다름, "복붙하듯 같은 헤더 쓰면 되잖아, 왜 기록만 다르냐" — 정확한 지적) — 근본원인: 입력·정산·공유·수금은 **공용 `.mob-header`** 하나를 쓰는데 기록만 `.hist-page-nav` **그리드로 새로 그려 흉내** → 그리드 track 높이 vs 블록 높이가 기기마다 다르게 라운딩돼 픽셀 맞추기로는 0 불가(헤드리스 0, 실기기 2px). → **모바일 기록 드로어에 진짜 `.mob-header`(`.hist-mob-shell`)를 그대로 삽입**: eyebrow(DUTCH PAY+버전)+동기화상태 / 제목(기록 보관함)+**`.mob-total-stack`(총 기록·N건)**. 다른 탭의 '총 지출' 자리에 같은 `.mob-total-stack` 요소를 써서 **같은 콘텐츠 높이 → 구분선 위치가 구조적으로 동일**(line-height:normal이어도 같은 요소라 기기별로 똑같이 렌더). `#histDr`에 한해 기존 그리드 nav는 `display:none`(데스크탑·설정 드로어는 각자 DOM/CSS라 불변). `전체 상세 저장`은 본문 상단으로 이동(`.hist-mob-actions`). `.js-hist-cnt`에 `#mTotal`과 동일 17px 부여(안 하면 5px 차). sync/버전/건수는 class로 양쪽 동시 갱신(`_updateHSyncInfo`·`_setBulkDetailProgress`·부팅·건수). 헤드리스(safe=0·59): `.hist-mob-shell` divider == `.mob-header` divider **0.000px**. 데스크탑 기록·설정 드로어 불변 확인. **(+ 데스크탑 왼쪽 날짜칸 `.dp-txt`을 `height:36px`+flex 중앙정렬로 고쳐 오른쪽 검색창(36px)과 높이 완전 일치 — 기존 padding 기반 natural 36.19px라 미세하게 달랐음. 모든 탭 날짜칸 36px 통일.)** 표시 전용·계산 무관, 계산 170/170 |
| v7.54 | **헤더 밑 구분선이 기록탭만 다른 실기기(iOS) 문제 해결 — 눈썹 line-height를 결정적 값으로 고정**(사용자: 입력·정산·공유·수금탭 헤더 밑 선과 기록탭 헤더 밑 선이 **실기기에서** 다르다고 반복, 빨간선 그은 스샷 다수. 헤드리스로는 계속 0px로 측정돼 원인을 놓침) — **근본원인**: `.mob-header`(4개탭)의 눈썹 `.mob-eyebrow-row`는 `line-height:normal`(플랫폼 의존)인데 기록 헤더 `.hist-mob-eyebrow`는 명시적 `line-height:1.25`. 헤드리스 'normal'은 11px에서 14.75px지만 **iOS Safari의 'normal'은 더 짧게(≈13px) 렌더** → 공유 헤더가 iOS에서 ~1~2px 더 짧아져 구분선이 기록보다 위로 올라감(사용자 실측: 공유 divider 473 vs 기록 477, 4device≈1.3px). 헤드리스는 normal=14.75라 우연히 일치해 못 잡았음. → `.mob-eyebrow-row`에 **`line-height:1.25` 추가**(기록 눈썹과 동일·결정적)로 플랫폼 무관 동일 렌더, 눈썹 1px 줄어든 만큼 `.mob-title-row` 상단 마진 `10→11px`로 보정해 divider 위치 유지. 헤드리스(safe=0·59 양쪽): 공유·기록 divider 완전 일치(103.75=103.75, 156.75=156.75)·눈썹 top 71·제목 top 108.16 동일. **교훈: `line-height:normal`은 iOS≠Chromium이라 픽셀 정렬엔 명시적 line-height 필수.** 표시 전용·계산 무관, 계산 170/170 |
| v7.53 | **기록 카드 내부 구분선을 공유 카드와 동일한 16px 인셋으로 — "구분선이 서로 다르다" 진짜 원인 해소**(사용자: v7.52 뒤에도 공유↔기록 나란히 스샷으로 "구분선이 서로 다르잖아") — 컴퓨티드 스타일 실측으로 확정: 공유 지출내역 행(`.txn-row`)의 구분선은 line 1273 공용 규칙으로 **`border-image` 그라데이션 = 좌우 16px 인셋**(카드 가장자리에 안 닿는 짧은 선)인데, 기록 카드 내부 구분선(`.rc-foot`·`.rc-body`의 `border-top`)만 그 목록에 빠져 **`border-image:none` = 카드 폭 가득(edge-to-edge)**. 같은 `var(--sep)` 1px이어도 **한쪽은 짧은 인셋 선·한쪽은 꽉 찬 선**이라 길이가 달라 "구분선이 다르다"로 보였음. → line 1273 인셋 규칙 셀렉터에 **`.rc-foot,.rc-body` 추가** → 기록 구분선도 공유와 동일한 16px 인셋 그라데이션. 헤드리스(430px): `.txn-row`·`.rc-foot`·`.rc-body` 셋 다 border-image gradient·slice 1 동일. 표시 전용·계산 무관, 계산 170/170 |
| v7.52 | **기록 보관함 카드 스타일을 다른 탭 카드와 통일(테두리→그림자) — "구분선 차이" 해소**(사용자: 카드 폭 외에 "구분선도 확실히 다르다") — 실측 확정: 공유 지출내역(`.txn-card`)·수금 기록(`.pm-record-card`)은 **테두리 없음+그림자**인데 기록 보관함(`.record-card`)만 **1px 테두리+그림자 없음**으로 혼자 윤곽선 스타일. 그 테두리(윤곽선)가 "구분선 차이"로 보였음. → `.record-card`를 `border:1px solid var(--sep)` 제거하고 **`box-shadow`(.txn-card와 동일한 `0 1px 2px .05, 0 5px 14px .08`)** 추가 → 공유·수금 카드와 동일한 떠있는 스타일. 내부 구분선(`.rc-foot` border-top)은 유지·카드폭(398)·좌우16px 동일. `.record-list` gap:10px이 간격 담당(margin 불필요). 헤드리스(430px): 공유/기록 카드 border 0·동일 shadow·폭 398·footLeft 16. 표시 전용·계산 무관, 계산 170/170 |
| v7.51 | **기록 카드 가로 너비를 다른 탭 카드와 일치(16px) — v7.47 20px 되돌림**(사용자: "구분선이 다르다 + 카드 가로 너비도 다르다" — 높이가 아니라 **카드 폭**이 핵심이었음) — 실측(430px): 공유 카드 좌우 16px·폭 **398** vs 기록 카드 좌우 20px·폭 **390** = **8px 더 좁음**. 원인은 v7.47에서 검색창을 제목(20px)에 맞추려 `.hist-dr-body`를 20px로 바꾼 것 → 카드가 공유 카드(16px)보다 좁아짐. **v7.47 override 제거**해 base 16px 사용 → 기록 카드 폭 398=공유 398, 좌우 16px 동일. 제목은 20px·콘텐츠(검색·카드)는 16px(모든 탭 `.mob-header`20/`.mob-body`16 공통 구조라 정상). 헤드리스(430px): 카드 공유16/기록16·폭 398=398, 구분선 104=104, 콘텐츠 시작 120=120. 표시 전용·계산 무관, 계산 170/170 |
| v7.50 | **같은 정산 잠금 중복을 입금 상태가 달라도 합치도록(v7.48 미해결분 해소)**(사용자: v7.49에도 442,600 잠금 기록 2개 그대로 — v7.48은 '완전 동일할 때만' 합쳐서, 입금 상태가 조금 다른 중복은 안 합쳐졌음) — `_dedupHistoryDetailed`의 잠금 중복 가드를 `_sameHistoryContent`(입금까지 완전 동일)에서 **`_histFingerprint`(날짜·참여자·항목) 비교**로 변경: **지문이 같으면 '같은 정산'이라 입금 상태만 달라도 `_mergeHistoryDuplicate`가 payments를 합집합(union)해 하나로 합침**(양쪽 입금 내역 전부 보존·진 쪽 id 툼스톤), **지문이 다르면(항목 편집한 다른 버전) 둘 다 보존**. 시작 시 자동 정리되고 되돌리기 제공. 헤드리스 검증: ①같은지문·입금다름 잠금2개→1개+payments 합집합(키 2개 다 유지) ②항목다른 잠금2개→2개 보존 ③완전동일→1개·에러0, 계산 170/170. **데이터 민감 — union이라 입금 손실 0.** |
| v7.49 | **기록 헤더 구분선·검색창 시작 높이를 다른 탭과 완전 일치(사용자 폰 실측 430px)**(사용자: 모바일에서 구분선 높이·검색창 시작 높이가 다른 탭과 다르다고 여러 번, "육안으로 보임" — 그동안 390px로 테스트해 2~6px 차이를 놓침. **사용자 스크린샷 1290×2796(=논리 430px @3x)을 직접 픽셀 측정**해 원인 확정) — 430px 실측 결과 2가지: (1) 빨간 동기화에러 텍스트(`.hist-head-sync`)가 line-height 미지정이라 15px로 eyebrow(14px)보다 1px 커서 **구분선 105 vs 공유 104**. → `.hist-head-sync{line-height:1.25}`로 eyebrow와 동일 → 구분선 104=104. (2) `.hist-dr-sinp-wrap` 상단 패딩 10px이라 **검색창이 구분선 10px 아래** 시작(공유 본문은 16px 아래) = 6px 차이. → `@media(max-width:700px)`에서 `.hist-dr-sinp-wrap{padding-top:16px}`로 공유 본문 상단여백(mob-body 16px)과 일치 → 검색창 top 120=공유 콘텐츠 top 120. 헤드리스(430px): 구분선 공유104=기록104, 콘텐츠시작 공유120=기록120. **교훈: 드로어 헤더 정렬 검증은 반드시 사용자 실기기 폭(430px)으로.** 표시 전용·계산 무관, 계산 170/170 |

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

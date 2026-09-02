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
CLAUDE.md             — 이 파일 (세션 컨텍스트용)
.gitignore            — .claude/ 제외
sw.js                 — 서비스워커 (PWA, CACHE_NAME과 APP_VERSION 항상 동기화)
manifest.webmanifest  — PWA 매니페스트
favicon.png / icons/  — 아이콘
```

## 현재 버전
**v5.49** (2026-09-02) — 작업 브랜치

## 버전 히스토리 요약
| 버전 | 주요 변경 |
|------|-----------|
| v5.49 | 화면 표시 버전이 v5.45에 멈춰 있던 문제 수정(APP_VERSION↔CACHE_NAME 어긋남) + 어긋남을 잡는 테스트 추가, 잔여 .deploy-* 27개와 일회성 워크플로 3개 삭제 |
| v5.48 | 오탐 테스트를 실제 렌더 기준으로 교체(46건 전부 통과), 잔여 배포 트리거 파일 3개 삭제, 보조 파일명에서 버전 접미사 제거 — 대신 sw.js install이 cache:"reload"로 항상 새로 받아 캐시 무효화를 보장 |
| v5.47 | 미사용 category-icons.js 삭제(실제 소스는 category-icons-v5.28-1~4.js, 16개 아이콘이 전부 갈라져 있었음), sw.js의 죽은 enhanceHtmlResponse 제거 — 129줄 → 84줄 |
| v5.46 | 서비스워커 activate의 client.navigate 제거 — waitUntil 안에서 창을 재이동시키면 그 HTML 요청을 아직 활성화 못 끝낸 SW가 처리해야 해 교착. 버전 올릴 때마다 첫 로드가 멈추던 원인 |
| v5.25 | 사용자 제공 SVG 16종으로 카테고리 아이콘 교체, 경조·의료 선택 및 자동분류 추가. 도형은 원본을 유지하고 앱 테마 색상만 적용 |
| v5.24 | 정산 화면·공유 이미지 송금 그룹을 날짜/계산 순서와 무관하게 내 수취 그룹(파란선) 우선, 다른 수취 그룹(주황선) 순으로 고정. 커플 합산 송금도 같은 수취인 그룹 안에 포함 |
| v5.23 | 상태표시줄의 배경색뿐 아니라 `color-scheme`도 첫 페인트 전에 저장된 테마와 동기화 — 안드로이드·삼성 브라우저 PWA가 시스템 아이콘 명암을 반대 테마로 잡는 경우 방지 |
| v5.22 | viewport-fit=cover 제거 — 앱이 상태표시줄 아래까지 그리면 배경은 앱이, 아이콘 색은 브라우저가 정해 밝기가 비슷해지면 글자가 묻힌다. 상태표시줄을 브라우저에 넘겨 배경·아이콘을 한 쌍으로 결정 |
| v5.21 | theme-color 기준을 --bg에서 --card(헤더 바탕)로 변경 — 상태표시줄 띠만 다른 색이라 경계가 드러나던 문제. 라이트 차이 0, 다크 3 |
| v5.20 | 다크 모드 상태표시줄이 여전히 안 보이던 문제 — theme-color를 스크립트 끝이 아니라 head에서 첫 페인트 전에 확정. 다크 모드 로드 시 밝은 화면 깜빡임도 함께 해소 |
| v5.19 | 안드로이드 PWA 상태표시줄(시계·와이파이·배터리)이 안 보이던 문제 — meta theme-color(#000000)와 manifest theme_color(#f4f4f6)가 모순. 실제 배경 --bg와 항상 동기화하도록 변경 |
| v5.18 | 공유 푸터 구분선 어긋남 실제 원인 수정 — `기록보관함 저장됨` 배지가 붙으면 내용이 커지는데 min-height로는 못 줄여 우측이 4px 높았다. height로 고정 + 세로 패딩 0 |
| v5.17 | 공유 푸터 높이를 ResizeObserver로 좌측 합계 푸터에 계속 맞춤 — Dropbox 동기화 줄이 나중에 붙으면 구분선이 어긋나던 문제 수정 |
| v5.16 | 데스크탑 공유 푸터를 스크롤 영역 밖 .right-foot으로 분리 — 프레임 바닥에 붙이고 좌측 합계 구분선과 정렬(높이 동기화), 푸터 아래로 지출 내역이 비치던 27px 틈 제거 |
| v5.15 | 공유 탭 이미지 공유 버튼을 하단 고정 — 데스크탑은 우측 패널 하단 opaque sticky footer, 모바일은 탭바 위 fixed footer + 본문 하단 여백 확보 |
| v5.14 | ⋯ 메뉴에 '옛 위치에서 가져오기' 추가 — 자동 이전이 건너뛰어져도 앱 안에서 복구. 덮어쓰지 않고 병합(같은 id는 updatedAt 최신 우선), 옛 원본은 보존 |
| v5.13 | App key를 바꾸면 옛 access·refresh token도 함께 폐기 — refresh token은 발급한 client_id에만 유효해, 남겨두면 '연결됨'으로 오인하고 401만 반복 |
| v5.12 | App key 변경 직후에는 옛 폴더를 복사하지 않음 — 키가 바뀌면 저장 공간 자체가 달라져 동명 폴더가 이 앱 데이터가 아닐 수 있음(화석 폴더를 끌어오는 문제 방지) |
| v5.11 | Dropbox 저장 위치를 `/07_Apps/더치페이(Dutch-Pay)/`로 이동 — 앱 전체 폴더 통합. 옛 폴더는 복사만 하고 지우지 않으며, 복사 실패 시 옛 위치로 계속 동작(유실 없음). 한글 폴더명 때문에 다운로드 헤더도 ASCII 이스케이프 |
| v5.10 | 모바일 당겨서 새로고침 추가 — 임계값 70px, 시트·드로어·모달 열림 시 비활성, PWA에 없는 브라우저 기본 동작 대체 |
| v5.09 | 모바일 헤더를 압축 없이 103px 그대로 고정 (v5.08의 compact 방식 철회) |
| v5.08 | 모바일 헤더 고정 — .mob-tabs를 .mob-header 밖으로 이동(backdrop-filter가 fixed 자식 기준 박스를 만드는 문제) |
| v5.07 | test.html이 로직 복사본 대신 index.html을 iframe으로 불러 실제 함수를 검사하도록 전환 — 회귀 테스트 추가(환불·한턱·영수증 합계), 23건 → 40건 |
| v5.06 | 영수증 상세표 합계가 음수·0일 때 줄 자체가 사라지던 표시 오류 수정 (total>0 조건 제거), 음수 합계는 빨강 표시 |
| v5.05 | 환불(음수 지출) 정산 시 반대 방향 송금이 누락되던 오류 수정 — calcTxns 상계를 부호 있는 순액 방식으로 변경 |
| v5.04 | 참여자 추가 버튼을 --label(글자색) 대신 --blue로 (다크 모드 흰 블록 문제 해소), 레일 라벨 z-index 80→400으로 올려 설정 팝오버·기록 보관함에 가리지 않게 |
| v5.03 | 레일 라벨을 반투명 검정 72%+블러로 변경, 일자 입력칸과 겹치지 않게 왼쪽으로 당김, 로고는 말풍선 없이 홈 이동만 |
| v5.02 | 영수증 DB 전송 파라미터(`?from`·`batch`) 가져오기 후 주소창 정리, 네비 레일 아이콘 툴팁 추가 (호버·포커스·클릭 1.2초) |
| v5.01 | 좌측 헤더 브랜드 줄을 영수증 DB `.app-eye-row` 구조로 통일 — 버전 배지 패딩·투명 테두리로 행 높이 18px 확보, 제목 Y=53px 일치 (헤드리스 실측 검증) |
| v5.00 | 헤더 내부 요소를 영수증 DB와 픽셀 단위로 통일 — 레일 로고·버튼(12px 라운드·호버·포커스), 좌측 브랜드/버전 배지·제목 여백, 우측 3줄(눈썹 12px/500/.7px, 제목 여백 0, 서브 mt5px/lh1.5) |
| v4.99 | 데스크탑 헤더 구분선 높이 126px→144px(영수증 DB `.main-top`과 동일), 네비 레일 배경 `--nav-bg` 토큰 신설(#F1F2F6 / 다크 #0D0E11) |
| v4.98 | 영수증 상세표 음수 금액 빨강(`--red`) 표시, 합계 라벨 본문색·700 굵기·합계 금액 14px로 영수증 DB와 일치 |
| v4.97 | 영수증 상세표를 영수증 DB `.detail-items-panel .items-table`와 완전 동일 규격으로 통일 (행 높이·열 너비·폰트·색상·금액 굵기·모바일 780px), body에 `-webkit-font-smoothing:antialiased` 추가 |
| v4.94 | 영수증 상세표 1차 규격 맞춤 (v4.97에서 전면 재정리) |
| v4.93 | Receipt DB 다중 전송을 일회성 묶음으로 원자 병합해 마지막 건만 남는 오류 수정 |
| v4.92 | 데스크탑 외곽 프레임 실측 폭을 영수증 DB와 동일한 1484px로 보정 |
| v4.91 | 공유 이미지 커플 합산 시 합산 대상이 아닌 추가 송금이 누락되는 오류 수정 |
| v4.90 | 영수증 DB 기준 데스크탑 셸 규격 통일, 지출 편집 폼 카드·2열 정렬과 필드 간격 개선 |
| v4.89 | 수금·교통 아이콘 교체, 모바일 이미지 공유 지원 검사와 미리보기 재시도 경로 추가 |
| v4.88 | 설정 메뉴를 네비게이션 오른쪽에 배치, 새 지출 버튼 동작 수정, 로고·지출 목록 시각 체계 정돈 |
| v4.87 | 공통 앱 셸에서 누락된 데스크탑 수금 탭 아이콘 복원 |
| v4.86 | 데스크탑 앱 프레임을 영수증 DB와 같은 최대 1540px·최소 높이 780px 기준으로 확장 |
| v4.85 | 데스크탑 설정 아이콘 통일, 설정 팝오버 화면 내 배치, 날짜·참여자 영역과 지출 목록 스크롤 분리 |
| v4.84 | 영수증 DB와 연결되는 공통 앱 셸 1차 적용 — 데스크탑 아이콘 레일, 모바일 하단 네비게이션, 공통 제목 계층 |
| v4.83 | 기록 보관함 rc-foot 안드로이드 레이아웃 수정 |
| v4.82 | 아이콘 라벨 밥집 → 외식 |
| v4.81 | 월별 통계 "결제"·"쏜 금액" 셀 클릭 → 결제·한턱 내역 모달; _pmShowTreatItems 추가 |
| v4.80 | 버그수정: uid 충돌·빈 상태 패딩; Dead CSS 5개·_togglePayerDetail 제거; CLAUDE.md 갱신 |
| v4.79 | 송금완료/입금완료 레이블 — toggleAllRecCard·renderHistoryView 추가 수정 |
| v4.78 | 한턱 참석 카드 "한턱 X원" 배지 통합; 송금완료 레이블 1차 수정 |
| v4.77 | 모바일 모달 하단 safe-area 여백 추가 |
| v4.76 | 데스크탑 모달 최대폭·헤더 간격 개선 |
| v4.75 | 결제 모달 rc-item-row 스타일로 재설계 (아이콘+영수증 펼침) |
| v4.74 | _pmShowPayerItems 참석자 버그 수정 (rec.name→it.members) |
| v4.73 | 수금 탭 결제 모달 반응형 (모바일=바텀시트, 데스크탑=센터 다이얼로그) |
| v4.72 | 이름 자간 .08em; 횟수·결제 배지 간격 확장 |
| v4.71 | 인물 카드 금액순/만남순/이름순 정렬 기능 추가 |
| v4.70 | v4.69 롤백 — translateY 핵 복원 (v4.68 상태) |
| v4.69 | translateY 핵 제거 시도, row-gap:0→6px (롤백됨) |
| v4.68 | 데스크탑 월별 통계 inset을 모바일과 맞춤 |
| v4.67 | 모바일 월별 통계 금액 spacing 균형 조정 |
| v4.66 | 모바일 월별 통계 status spacing 조임 |
| v4.65 | 모바일 월별 통계 행 정렬 개선 |
| v4.64 | 데스크탑 한턱 금액 우측 정렬 |
| v4.63 | 데스크탑 월별 통계 행 typography 개선 |
| v4.62 | 데스크탑 월별 통계를 모바일과 맞춤 |
| v4.61 | 데스크탑 날짜 컨트롤을 모바일과 맞춤 |
| v4.60 | 데스크탑 월별 통계 행 정렬 적용 |
| v4.59 | 월별 통계 금액·상태 겹침 버그 수정 |
| v4.58 | 월별 통계 인원 이름·상태 정렬 개선 |
| v4.57 | 월별 통계 카드 내부 spacing 완화 |
| v4.56 | 월별 통계 UI 전면 재디자인 (데스크탑 large card) |
| v4.55 | 공유 탭 × 버튼 정렬 |
| v4.54 | 공유 탭 기간 gap 조임 |
| v4.53 | 공유 탭 기간 날짜 컨트롤 복원 |
| v4.52 | 공유 탭 기간 날짜 행 구조 수정 |
| v4.50~v4.51 | 기간 날짜 행 spacing 조임 |
| v4.49 | 기간 날짜 행 spacing 조임 |
| v4.48 | 공유 탭 기간 기호 SVG로 교체, grid minmax(0,1fr) 60px, 모바일 translateY 보정 |
| v4.47 | 기간 날짜 spacing 조임 |
| v4.46 | 기간 UI spacing·wave 크기 조정 |
| v4.45 | 기간 버튼을 날짜 필드와 같은 줄 정렬 |
| v4.44 | 모바일 기간 기호 광학 중앙 정렬 |
| v4.43 | 기간 컨트롤 열 폭·기호 중앙 정렬 |
| v4.42 | 기간 기호 중앙 정렬 |
| v4.41 | 공유 탭 기간 날짜 .share-date-line 래퍼 제거 |
| v4.40 | 공유 탭 기간 날짜 Grid 방식, 기호 통일, + 기간 버튼 같은 줄 |
| v4.38 | 공유 탭 기간 기호 position:absolute 완전 재설계 |
| v4.37 | 공유 탭 기간 기호 세로 중앙 정렬 근본 수정 |
| v4.35~v4.36 | 공유 탭 기간 기호 수직 정렬 + 수금 쏜 금액 orange 색상 |
| v4.34 | 한턱 혜택 금액 오렌지 색상 적용 |
| v4.33 | 기간 날짜 ~ × 기호 수직 중앙 정렬 |
| v4.32 | 공유 탭 기간 날짜 레이아웃 grid→flex |
| v4.30~v4.31 | UI/UX 개선 6종 + 만남순 레이블 |
| v4.29 | 인물 카드 이름·횟수 좌우 여백 조정 |
| v4.28 | 수금 탭 인물 요약 카드에 만난 횟수 표시 |
| v4.27 | Dropbox 자동저장 제3자 수취 거래 제외 버그 수정 |
| v4.26 | 수금 탭 전체기록 제3자 수취 미수 집계 버그 수정 |
| v4.25 | 제3자 수취 송금 행 미입금→미확인 표시 |
| v4.24 | 기록보관함 검색에 상호명(groupName) 포함 |
| v4.23 | 계좌 드롭다운에 현금 옵션 추가 |
| v4.22 | 기록보관함 불러오기 시 커플 설정 자동 복원 |
| v4.20 | 코드 리뷰 버그 4건: 마이그레이션·Dropbox coupleNames·드롭다운 UX·sw.js 버전 동기화 |
| v4.19 | 커플 설정 전역화 — dutchpay_couple localStorage (_myName과 동일 방식) |
| v4.18 | 커플 카드 위 "송금" 레이블 제거 |
| v4.17 | 커플 카드 레이블 숫자(①②) 제거 |
| v4.16 | 공유 이미지 커플 합산 카드 — ⋯ 메뉴 "커플 설정"으로 지정 시 송금 카드 두 개로 분리 |
| v4.15 | calcTxns 반올림 버그 근본 수정 — float 누적 후 Math.floor (computeShares와 일관성) |
| v4.14 | calcTxns Math.floor 첫 시도 (v4.15에서 재수정) |
| v4.08~v4.13 | 수금(입금관리) _myName 필터: 이번 정산·전체기록·월별통계·기록카드 배지·historyCanvas 6곳 적용 |
| v3.74~v3.85 | 한턱/참석 기록 수금탭·월별통계 표시, 수금 탭 기간 필터, 이름 검색 그룹핑, 한턱 색상 정제 |
| v3.61~v3.73 | 수금 탭 월별 통계 추가 — 목록/월별 토글, 청구·수령·미수·인원별 합계, 내 이름 서브스탯, 정렬 |
| v1.26 | 기록보관함 getElementById→querySelectorAll 전면 교체 |

## 탭 구조
- 탭바: **입력 / 정산 / 공유 / 수금** (수금은 `display:none` — _ownerUnlocked 시 접근 가능)
- **기록 탭**도 `display:none` — ⋯ 메뉴 "기록 보관함 열기"로만 접근
- 친구들에게는 입력·정산·공유만 보임

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

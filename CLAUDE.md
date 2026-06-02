# 더치페이 Dutch Pay

## 프로젝트 개요
모바일·데스크탑 반응형 더치페이 정산 앱. 단일 HTML 파일(`index.html`)로 구성된 PWA.
Dropbox 연동으로 데이터 백업. 소유자(조상현)가 혼자 사용하며 친구들에게 링크를 공유.

## 파일 구조
```
index.html   — 메인 앱 (전체 로직 포함)
history.html — Dropbox OAuth 콜백 리다이렉터 (index.html로 포워딩만 함)
```

## 현재 버전
**v1.17** (2026-06-03)

## 탭 구조
- 데스크탑: 입력 / 내역 / 공유 (기록 탭은 숨김 — 내부 기능은 유지)
- 모바일: 동일
- **기록 탭은 ⋯ 메뉴를 통해서만 접근** (친구들에게 보이지 않도록)

## ⋯ 메뉴 항목
Dropbox 연결/동기화 → 기록 보관함 열기 → 기록 보관함에 저장 → (구분선) → CSV 저장 → 전체 JSON 백업 → JSON 불러오기 → (구분선) → 전체 초기화

## 핵심 설계 원칙
- 친구들에게 보이는 UI는 단순하게: 입력·내역·공유만
- 기록/저장/백업은 소유자 전용 (⋯ 메뉴)
- Dropbox는 소유자 혼자 사용 → 연결 UI도 ⋯ 메뉴 안에만
- 공유 탭의 "지출 내역"은 내역 탭과 동일한 detail-row 스타일 (아이콘·품명·결제자·참석자·금액)

## 주요 렌더링 함수
- `renderResultView()` — 내역 탭 (정산 결과 + 지출 내역)
- `renderSettleView()` — 공유 탭 (총 지출금액 hero + 송금 + 지출 내역 + 공유 버튼)
- `renderHistoryView()` — 기록 보관함 (⋯ 메뉴로만 접근)
- `generateSettleCanvas()` — 공유 이미지 생성 (Canvas API)
- `showDataMenu()` — ⋯ 팝업 메뉴

## 이미지 생성 주요 상수 (generateSettleCanvas)
- W=1080, PAD=42
- TOTAL_CARD_H=230 (총 지출금액 카드)
- TXN_ROW_H=108 (송금 행)
- ITEM_ROW_H=136 (지출 항목 행)
- 총액: 68px 700 단일 문자열 (숫자+"원" 분리 없음)
- 품명: 30px 700, y=ry-16 / 결제자·참석자: 24px 400, y=ry+20

## 그룹 데이터 구조
```js
groups = [{
  id, name, nameAuto,
  data: { people[], items[], idc, settleDateStart, settleDateEnd, itemSort, itemSearch }
}]
```
localStorage key: `dutchpay_v2`

## 작업 규칙
- **실행 전 반드시 생각/계획을 먼저 말하고 확인 후 진행**
- 버전은 변경마다 v1.X+1로 올림
- 코드 변경 후 BUILD_TIME도 업데이트

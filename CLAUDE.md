# 더치페이 Dutch Pay

## 프로젝트 개요
모바일·데스크탑 반응형 더치페이 정산 앱. 단일 HTML 파일(`index.html`)로 구성된 PWA.
Dropbox 연동으로 데이터 백업. 소유자(조상현)가 혼자 사용하며 친구들에게 링크를 공유.

## 라이브 URL / 저장소
- **라이브:** https://sh4sh-ux.github.io/dutch-pay/
- **GitHub:** git@github.com:sh4sh-ux/dutch-pay.git (SSH)
- **로컬:** `/Users/sanghyeon/Claude/Dutch Pay/`
- **브랜치:** main

## 파일 구조
```
index.html            — 메인 앱 (전체 로직 포함)
history.html          — Dropbox OAuth 콜백 리다이렉터
CLAUDE.md             — 이 파일 (세션 컨텍스트용)
.gitignore            — .claude/ 제외
sw.js                 — 서비스워커 (PWA)
manifest.webmanifest  — PWA 매니페스트
favicon.png / icons/  — 아이콘
```

## 현재 버전
**v1.18** (2026-06-03) — 커밋 6361bab, main 브랜치 푸시 완료

## 버전 히스토리 요약
| 버전 | 주요 변경 |
|------|-----------|
| v1.18 | 공유 탭 UI↔이미지 일관성 통일, 이미지 지출 항목 간격·정렬 개선 |
| v1.17 | 기록 탭 탭바에서 숨김, 기록 저장 버튼 → ⋯ 메뉴로 이동 |
| v1.16 | 공유 탭 지출 내역 구조 개선, 총 지출금액 hero 축소, 이미지 원 이질감 해소 |

## 탭 구조
- 탭바: **입력 / 내역 / 공유** (기록 탭은 `display:none` — 내부 기능 유지)
- **기록 탭**은 ⋯ 메뉴를 통해서만 접근 (친구들에게 보이지 않도록)

## ⋯ 메뉴 항목 순서
Dropbox 연결/동기화 → 기록 보관함 열기 → **기록 보관함에 저장** → (구분선) → CSV 저장 → 전체 JSON 백업 → JSON 불러오기 → (구분선) → 전체 초기화

## 핵심 설계 원칙
- 친구들에게 보이는 UI는 단순하게: 입력·내역·공유만
- 기록/저장/백업/Dropbox는 소유자 전용 → ⋯ 메뉴 안에만
- 공유 탭의 "지출 내역"은 내역 탭과 동일한 detail-row 스타일
  (아이콘 · 품명 · 결제자·참석자 서브텍스트 · 금액)

## 주요 렌더링 함수
| 함수 | 역할 |
|------|------|
| `renderResultView()` | 내역 탭 (정산 결과 + 지출 내역) |
| `renderSettleView()` | 공유 탭 (총액 hero + 송금 + 지출 내역 + 공유 버튼) |
| `renderHistoryView()` | 기록 보관함 (⋯ 메뉴로만 접근) |
| `generateSettleCanvas()` | 공유 이미지 생성 (Canvas API) |
| `showDataMenu()` | ⋯ 팝업 메뉴 |

## 이미지 생성 주요 상수 (generateSettleCanvas)
- W=1080, PAD=42
- TOTAL_CARD_H=230 (총 지출금액 카드)
- TXN_ROW_H=108 (송금 행)
- ITEM_ROW_H=152 (지출 항목 행 — 여백 확보)
- 총액: 68px 700 단일 문자열 (숫자+"원" 분리 없음)
- 품명: 30px 700, y=ry-22 / 결제자·참석자: 24px 400, y=ry+26
- 금액: 34px 700, y=ry+2 (텍스트 블록 수직 중앙)

## 공유 탭 settle-hero 구조 (v1.18~)
```
<div class="pay-section-title">총 지출금액</div>
<div class="settle-hero">
  <div class="sh-num">117,900<span class="sh-unit">원</span></div>
  <div class="sh-divider"></div>
  <div class="sh-sub">총 N명 · 인당 평균 X원</div>
</div>
```
→ UI와 이미지가 동일한 구조/정보를 표시

## 그룹 데이터 구조
```js
groups = [{
  id, name, nameAuto,
  data: { people[], items[], idc, settleDateStart, settleDateEnd, itemSort, itemSearch }
}]
// localStorage key: 'dutchpay_v2'
```

## Git 작업 방법
```bash
cd /Users/sanghyeon/Claude/Dutch\ Pay
git add index.html        # 변경된 파일만 명시적으로 추가
git commit -m "vX.XX: ..."
git push origin main      # SSH 인증 사용
```

## 작업 규칙
- **실행 전 반드시 생각/계획을 먼저 말하고 확인 후 진행**
- 버전은 변경마다 v1.X+1로 올림
- 코드 변경 후 BUILD_TIME도 업데이트 (`2026-MM-DD HH:MM`)
- 커밋은 변경된 파일만 명시적으로 추가 (git add -A 사용 금지)

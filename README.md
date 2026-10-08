# 🥗 MealCart AI
> **AI 기반 주간 가족 식단표 & 스마트 장보기 카트 플래너 (Zero-Waste 식생활 솔루션)**

![MealCart AI](https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 핵심 기능 (Key Features)

1. **냉장고 재고 우선 소진 (Zero-Waste Engine)**
   - 보유한 재료(예: 애호박, 두부, 대파 등)를 우선 소진하도록 주간 식단을 자동 편성합니다.
   - 묶음 식재료 분할 사용(Cycle System) 및 맞춤 신선 보관 꿀팁을 제공합니다.

2. **유연한 주간 캘린더 & 일정 스왑 (Interactive Calendar)**
   - **드래그 앤 드롭(Drag & Drop):** 요일 간 식단 카드를 손쉽게 맞교환(Swap)할 수 있습니다.
   - **1-클릭 [내일로 미루기 ⏩]:** 오늘 조리하지 못한 메뉴를 다음 날로 손쉽게 연기합니다.

3. **'오늘의 요리' 비주얼 레시피 & 인앱 타이머 (Visual Recipe Guide)**
   - 동사 중심의 마이크로 스텝 가이드 ("1단계: 깍둑썰기", "2단계: 중불 3분 볶기")
   - 단계별 실시간 카운트다운 타이머 & 종료 알림음 지원
   - 대체 양념 가이드 제공

4. **스마트 장보기 카트 & 쿠팡 원클릭 딥링크 (Smart Cart & Commerce)**
   - 7일 치 필요 재료 총합 - 냉장고 재고 = **최종 순수 장보기 품목 자동 산출**
   - 각 품목별 쿠팡 실시간 검색 딥링크(`[쿠팡 검색 🔗]`) 연동
   - 마트 장보기용 실시간 체크박스 및 공유 기능

---

## 🛠️ 기술 스택 (Tech Stack)

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti
* **AI Engine:** Google Gemini 1.5 Flash (`@google/generative-ai` Structured JSON Schema)
* **Backend / Database:** Supabase (`@supabase/supabase-js`)

---

## 🚀 시작하기 (Getting Started)

### 1. 레포지토리 클론 및 의존성 설치
```bash
git clone https://github.com/whoau0/popo_01.git
cd popo_01
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env.local`을 생성하고 본인의 API 키를 입력합니다:
```bash
cp .env.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

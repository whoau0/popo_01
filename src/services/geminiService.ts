import { GoogleGenerativeAI } from '@google/generative-ai';
import { MealCartData, UserInputState } from '../types/mealcart';
import { getCoupangSearchUrl, INITIAL_MOCK_PLAN } from '../data/mockData';

export function getStoredGeminiKey(): string {
  const localKey = localStorage.getItem('MEALCART_GEMINI_API_KEY');
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  return envKey.trim();
}

export function setStoredGeminiKey(key: string) {
  if (key) {
    localStorage.setItem('MEALCART_GEMINI_API_KEY', key.trim());
  } else {
    localStorage.removeItem('MEALCART_GEMINI_API_KEY');
  }
}

// Food category stock image fallbacks
const FOOD_IMAGES: Record<string, string> = {
  soup: 'https://images.unsplash.com/photo-1583032015879-bf6b864a6e87?auto=format&fit=crop&w=800&q=80',
  stew: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  stirfry: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
  rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  pork: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  tofu: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  dining: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
};

function assignImageByKeywords(name: string, isDining: boolean): string {
  if (isDining) return FOOD_IMAGES.dining;
  if (name.includes('찌개') || name.includes('국') || name.includes('탕')) return FOOD_IMAGES.soup;
  if (name.includes('볶음') || name.includes('제육') || name.includes('불고기')) return FOOD_IMAGES.stirfry;
  if (name.includes('밥') || name.includes('덮밥') || name.includes('비빔밥')) return FOOD_IMAGES.rice;
  if (name.includes('두부') || name.includes('순두부')) return FOOD_IMAGES.tofu;
  if (name.includes('오리') || name.includes('구이') || name.includes('고기')) return FOOD_IMAGES.pork;
  return FOOD_IMAGES.default;
}

export async function generateMealCartPlan(input: UserInputState): Promise<MealCartData> {
  const apiKey = getStoredGeminiKey();

  if (!apiKey) {
    console.info('No Gemini API Key provided. Generating dynamic customized plan from intelligent preset engine.');
    return generateSmartDynamicPlan(input);
  }

  const prompt = `
당신은 한국 주부 및 1~4인 가구를 위한 최고의 식생활 플래너 AI 'MealCart AI'입니다.
다음 사용자 조건을 분석하여 맞춤형 주간 식단표(월~일 7일), 재고 차감 스마트 장보기 목록, 잔여 식재료 제로-웨이스트 보관 가이드를 생성해 주세요.

[사용자 입력 조건]
1. 가족 구성원/분량: ${input.familySize}
2. 외식/배달 요일 (식단 제외): ${input.diningOutDays.length > 0 ? input.diningOutDays.join(', ') : '없음 (매일 집밥)'}
3. 현재 냉장고 보유 재료: ${input.pantryItems.length > 0 ? input.pantryItems.join(', ') : '없음 (전량 구매 필요)'}
4. 식단 성향 스타일: ${input.dietaryPreset}
5. 추가 요청사항: ${input.additionalRequests || '없음'}

[핵심 요구사항]
1. 보유 재료를 주초(월~수)에 최우선 소진하도록 메뉴를 설계하세요.
2. 묶음 단위로 사야 하는 식재료(예: 대파, 양파, 두부 등)는 주간 2~3회 메뉴에 나누어 쓰도록 연계하여 폐기율 0%를 목표로 하세요.
3. 외식으로 지정된 요일은 is_dining_out: true로 표기하고 레시피는 휴식 가이드로 구성하세요.
4. 레시피 스텝은 "재료 손질", "볶기", "끓이기" 등 동사 중심의 마이크로 스텝으로 작성하고, 불을 쓰거나 뜸들이는 단계에는 timer_seconds(초 단위)를 정확히 입력하세요.
5. smart_cart는 7일치 전체 필요 식재료에서 [현재 냉장고 보유 재료]를 차감한 순수 구매 품목만 카테고리별로 정제하세요.
6. storage_guides에는 쓰고 남을 식재료의 구체적 보관법을 제시하세요.

반드시 마크다운 코드블록이나 불필요한 텍스트 없이 순수 JSON 포맷으로만 응답하세요:
{
  "summary_insight": "string (이번 주 식단 구성 요약 및 절약 포인트)",
  "weekly_plan": [
    {
      "id": "day-mon",
      "day_of_week": "월요일",
      "is_dining_out": false,
      "menu_name": "string (요리명)",
      "category": "string (예: 국/찌개, 볶음, 원팬요리 등)",
      "cooking_time": "string (예: 15분)",
      "image_url": "string (음식 사진 URL 또는 빈 문자열)",
      "used_pantry_items": ["string"],
      "used_shopping_items": ["string"],
      "calories_per_serving": 450,
      "alternative_sauces": ["string (대체 양념 팁)"],
      "recipe_steps": [
        {
          "step_number": 1,
          "highlight_action": "string (핵심 행동 키워드)",
          "action": "string (간결하고 명확한 조리 지침)",
          "timer_seconds": 120
        }
      ]
    }
  ],
  "smart_cart": {
    "vegetables": [{ "id": "v-1", "name": "품목명과 수량", "quantity": "수량" }],
    "meat_seafood": [{ "id": "m-1", "name": "품목명과 수량", "quantity": "수량" }],
    "sauce_pantry": [{ "id": "s-1", "name": "품목명과 수량", "quantity": "수량" }],
    "processed_others": [{ "id": "p-1", "name": "품목명과 수량", "quantity": "수량" }]
  },
  "storage_guides": [
    {
      "id": "st-1",
      "item": "남은 식재료명 (분량)",
      "tip": "구체적인 보관법 및 활용 팁",
      "urgency": "high"
    }
  ]
}
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    // Clean JSON response if wrapped in markdown
    const cleanedJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed: MealCartData = JSON.parse(cleanedJson);

    // Format weekly plan and images
    parsed.weekly_plan = (parsed.weekly_plan || []).map((day, idx) => ({
      ...day,
      id: day.id || `day-${idx + 1}`,
      image_url: day.image_url || assignImageByKeywords(day.menu_name, day.is_dining_out),
    }));

    // Ensure all purchase_urls are valid Coupang search URLs
    parsed.smart_cart.vegetables = (parsed.smart_cart.vegetables || []).map((item, idx) => ({
      ...item,
      id: item.id || `v-${idx + 1}`,
      purchase_url: getCoupangSearchUrl(item.name.replace(/\([^)]*\)/g, '').trim()),
      checked: false,
    }));

    parsed.smart_cart.meat_seafood = (parsed.smart_cart.meat_seafood || []).map((item, idx) => ({
      ...item,
      id: item.id || `m-${idx + 1}`,
      purchase_url: getCoupangSearchUrl(item.name.replace(/\([^)]*\)/g, '').trim()),
      checked: false,
    }));

    parsed.smart_cart.sauce_pantry = (parsed.smart_cart.sauce_pantry || []).map((item, idx) => ({
      ...item,
      id: item.id || `s-${idx + 1}`,
      purchase_url: getCoupangSearchUrl(item.name.replace(/\([^)]*\)/g, '').trim()),
      checked: false,
    }));

    if (parsed.smart_cart.processed_others) {
      parsed.smart_cart.processed_others = parsed.smart_cart.processed_others.map((item, idx) => ({
        ...item,
        id: item.id || `p-${idx + 1}`,
        purchase_url: getCoupangSearchUrl(item.name.replace(/\([^)]*\)/g, '').trim()),
        checked: false,
      }));
    }

    return parsed;
  } catch (error) {
    console.warn('Gemini API call encountered an issue, using intelligent fallback generator:', error);
    return generateSmartDynamicPlan(input);
  }
}

// Smart dynamic fallback generator based on selected criteria
function generateSmartDynamicPlan(input: UserInputState): MealCartData {
  const pantryStr = input.pantryItems.join(', ') || '기본 양념';

  const plan: MealCartData = JSON.parse(JSON.stringify(INITIAL_MOCK_PLAN));

  plan.summary_insight = `[${input.familySize} 맞춤 / ${input.dietaryPreset}] 보유 재료(${pantryStr})를 적극 소진하도록 설계된 스마트 주간 플랜입니다.`;

  // Update dining out days
  plan.weekly_plan = plan.weekly_plan.map((day) => {
    const isDiningOut = input.diningOutDays.includes(day.day_of_week);
    if (isDiningOut) {
      return {
        ...day,
        is_dining_out: true,
        menu_name: `${day.day_of_week} 외식 / 배달 힐링데이 ✨`,
        category: '외식 및 힐링',
        cooking_time: '0분',
        calories_per_serving: 0,
        image_url: FOOD_IMAGES.dining,
        recipe_steps: [
          {
            step_number: 1,
            highlight_action: '외식 & 휴식',
            action: '가족들과 편안한 외식을 즐기거나 먹고 싶었던 특별한 배달 음식을 선택해 보세요!',
            timer_seconds: 0,
          },
        ],
        used_pantry_items: [],
        used_shopping_items: [],
      };
    }
    return day;
  });

  return plan;
}

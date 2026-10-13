import { GoogleGenerativeAI } from '@google/generative-ai';
import { MealCartData, UserInputState, DayOfWeek, MealPlanDay } from '../types/mealcart';
import { getCoupangSearchUrl } from '../data/mockData';

export function getStoredGeminiKey(): string {
  const localKey = localStorage.getItem('MEALCART_GEMINI_API_KEY');
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  return envKey.trim();
}

export function setStoredGeminiKey(key: string) {
  if (key && key.trim()) {
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
  curry: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
  noodle: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  chicken: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
  beef: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  egg: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
};

export function assignImageByKeywords(name: string, isDining: boolean): string {
  if (isDining) return FOOD_IMAGES.dining;
  const n = name.toLowerCase();
  if (n.includes('카레')) return FOOD_IMAGES.curry;
  if (n.includes('찌개') || n.includes('국') || n.includes('탕')) return FOOD_IMAGES.soup;
  if (n.includes('볶음') || n.includes('제육') || n.includes('불고기') || n.includes('두루치기')) return FOOD_IMAGES.stirfry;
  if (n.includes('밥') || n.includes('덮밥') || n.includes('비빔밥') || n.includes('볶음밥')) return FOOD_IMAGES.rice;
  if (n.includes('면') || n.includes('우동') || n.includes('파스타') || n.includes('국수')) return FOOD_IMAGES.noodle;
  if (n.includes('두부') || n.includes('순두부')) return FOOD_IMAGES.tofu;
  if (n.includes('닭') || n.includes('치킨')) return FOOD_IMAGES.chicken;
  if (n.includes('오리') || n.includes('돼지') || n.includes('삼겹')) return FOOD_IMAGES.pork;
  if (n.includes('소고기') || n.includes('차돌')) return FOOD_IMAGES.beef;
  if (n.includes('계란') || n.includes('달걀') || n.includes('전')) return FOOD_IMAGES.egg;
  if (n.includes('샐러드') || n.includes('다이어트')) return FOOD_IMAGES.salad;
  return FOOD_IMAGES.default;
}

// Candidate models for graceful failover
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
];

export async function generateMealCartPlan(input: UserInputState): Promise<MealCartData & { engine?: string }> {
  const apiKey = getStoredGeminiKey();

  if (!apiKey) {
    console.info('No Gemini API Key provided. Generating dynamic customized plan from intelligent preset engine.');
    const dynamicPlan = generateSmartDynamicPlan(input);
    return { ...dynamicPlan, engine: '로컬 스마트 엔진' };
  }

  const prompt = `
당신은 한국 주부 및 1~4인 가구를 위한 최고의 식생활 플래너 AI 'MealCart AI'입니다.
다음 사용자 조건을 철저히 분석하여 맞춤형 주간 식단표(월~일 7일), 재고 차감 스마트 장보기 목록, 잔여 식재료 제로-웨이스트 보관 가이드를 생성해 주세요.

[사용자 입력 조건]
1. 가족 구성원/분량: ${input.familySize}
2. 외식/배달 요일 (식단 제외): ${input.diningOutDays.length > 0 ? input.diningOutDays.join(', ') : '없음 (매일 집밥)'}
3. 현재 냉장고 보유 재료: ${input.pantryItems.length > 0 ? input.pantryItems.join(', ') : '없음 (전량 구매 필요)'}
4. 식단 성향 스타일: ${input.dietaryPreset}
5. 추가 요청사항: ${input.additionalRequests || '없음'}

[핵심 요구사항]
1. [현재 냉장고 보유 재료]를 최우선으로 적극 활용하여 주초(월~수)부터 메뉴를 구성하세요. 입력된 보유 재료가 실제 요리명과 used_pantry_items에 반드시 적극 등장해야 합니다!
2. 묶음 단위로 사야 하는 식재료(예: 대파, 양파, 두부 등)는 주간 2~3회 메뉴에 나누어 쓰도록 연계하여 폐기율 0%를 목표로 하세요.
3. 외식으로 지정된 요일은 is_dining_out: true로 표기하고 레시피는 외식/배달 힐링 가이드로 구성하세요.
4. 레시피 스텝은 "재료 손질", "볶기", "끓이기" 등 동사 중심의 마이크로 스텝으로 작성하고, 불을 쓰거나 뜸들이는 단계에는 timer_seconds(초 단위)를 정확히 입력하세요.
5. smart_cart는 7일치 전체 필요 식재료에서 [현재 냉장고 보유 재료]를 차감한 순수 구매 품목만 카테고리별로 정제하세요.
6. storage_guides에는 쓰고 남을 식재료의 구체적 보관법을 제시하세요.

반드시 마크다운 코드블록이나 잡담 없이 순수 JSON 포맷으로만 응답하세요:
{
  "summary_insight": "string (이번 주 식단 구성 요약 및 재료 소진 전략)",
  "weekly_plan": [
    {
      "id": "day-mon",
      "day_of_week": "월요일",
      "is_dining_out": false,
      "menu_name": "string (요리명)",
      "category": "string (예: 국/찌개, 볶음, 원팬요리 등)",
      "cooking_time": "15분",
      "image_url": "",
      "used_pantry_items": ["string (활용한 보유재료)"],
      "used_shopping_items": ["string (추가 필요 재료)"],
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
    "vegetables": [{ "id": "v-1", "name": "품목명", "quantity": "수량" }],
    "meat_seafood": [{ "id": "m-1", "name": "품목명", "quantity": "수량" }],
    "sauce_pantry": [{ "id": "s-1", "name": "품목명", "quantity": "수량" }],
    "processed_others": [{ "id": "p-1", "name": "품목명", "quantity": "수량" }]
  },
  "storage_guides": [
    {
      "id": "st-1",
      "item": "남은 식재료명 (분량)",
      "tip": "구체적인 보관법 및 활용 팁",
      "urgency": "high | medium | low"
    }
  ]
}
`;

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  // Try candidate models in order of stability
  for (const modelName of CANDIDATE_MODELS) {
    try {
      console.log(`[MealCart AI] Generating meal plan with ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error(`Empty response from ${modelName}`);
      }

      // Clean JSON response if wrapped in markdown
      const cleanedJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed: MealCartData = JSON.parse(cleanedJson);

      // Validate weekly_plan existence
      if (!parsed.weekly_plan || parsed.weekly_plan.length === 0) {
        throw new Error('weekly_plan array missing in model response');
      }

      // Format weekly plan and images
      parsed.weekly_plan = parsed.weekly_plan.map((day, idx) => ({
        ...day,
        id: day.id || `day-${idx + 1}`,
        image_url: day.image_url || assignImageByKeywords(day.menu_name, day.is_dining_out),
      }));

      // Ensure all purchase_urls are valid Coupang search URLs
      parsed.smart_cart = parsed.smart_cart || { vegetables: [], meat_seafood: [], sauce_pantry: [] };
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

      parsed.storage_guides = (parsed.storage_guides || []).map((guide, idx) => ({
        ...guide,
        id: guide.id || `st-${idx + 1}`,
      }));

      console.log(`[MealCart AI] Successfully generated with ${modelName}!`);
      return { ...parsed, engine: `Gemini AI (${modelName})` };
    } catch (err: any) {
      console.warn(`[MealCart AI] Failed with ${modelName}:`, err?.message || err);
      lastError = err;
    }
  }

  // If all candidate models failed or were unavailable, fall back to smart dynamic generator
  console.warn('[MealCart AI] All AI models failed, using intelligent fallback engine:', lastError?.message);
  const fallbackPlan = generateSmartDynamicPlan(input);
  return { ...fallbackPlan, engine: '지능형 스마트 엔진 (로컬 맞춤)' };
}

// -------------------------------------------------------------
// Intelligent dynamic fallback generator
// Generates completely customized meals based on input pantry items!
// -------------------------------------------------------------
export function generateSmartDynamicPlan(input: UserInputState): MealCartData {
  const days: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  const pantryList = input.pantryItems.map(p => p.trim()).filter(Boolean);
  const pantryStr = pantryList.join(', ') || '기본 식재료';

  // Extract raw ingredient names without quantities for recipe matching
  const cleanItems = pantryList.map(item => item.replace(/[0-9\/]+[개모대알캔봉팩단gmlkgTts숟갈g]+.*$/gi, '').trim());

  // Meal templates based on ingredients
  const generatedDays: MealPlanDay[] = days.map((day, idx) => {
    const isDiningOut = input.diningOutDays.includes(day);
    const dayId = `day-${['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][idx]}`;

    if (isDiningOut) {
      return {
        id: dayId,
        day_of_week: day,
        is_dining_out: true,
        menu_name: `${day} 외식 / 배달 힐링데이 ✨`,
        category: '외식 & 휴식',
        cooking_time: '0분',
        image_url: FOOD_IMAGES.dining,
        used_pantry_items: [],
        used_shopping_items: [],
        calories_per_serving: 0,
        alternative_sauces: [],
        recipe_steps: [
          {
            step_number: 1,
            highlight_action: '외식 & 힐링',
            action: '가족들과 편안한 외식을 즐기거나 맛있는 배달 음식을 선택해 피로를 풀어보세요!',
            timer_seconds: 0,
          },
        ],
      };
    }

    // Assign recipes by picking user's pantry items
    const pantryForDay: string[] = [];
    const shoppingForDay: string[] = [];
    let menuName = '';
    let category = '';
    let cookingTime = '15분';
    let calories = 430;
    let steps: any[] = [];
    let tips: string[] = [];

    const primaryPantry = pantryList[idx % Math.max(1, pantryList.length)] || '계란 2알';
    const secondaryPantry = pantryList[(idx + 1) % Math.max(1, pantryList.length)] || '대파';

    pantryForDay.push(primaryPantry);
    if (pantryList.length > 1 && idx % 2 === 0) {
      pantryForDay.push(secondaryPantry);
    }

    // Generate menu title tailored to input
    const p1 = cleanItems[idx % Math.max(1, cleanItems.length)] || '신선 채소';
    const p2 = cleanItems[(idx + 1) % Math.max(1, cleanItems.length)] || '양념';

    if (p1.includes('카레') || p2.includes('카레')) {
      menuName = `향긋한 원팬 야채 카레라이스 (${p1} 활용)`;
      category = '원팬/초간단 요리';
      cookingTime = '15분';
      shoppingForDay.push('카레용 돼지고기 200g');
      steps = [
        { step_number: 1, highlight_action: '재료 손질', action: `${p1}와 채소를 깍둑썰기합니다.`, timer_seconds: 0 },
        { step_number: 2, highlight_action: '재료 볶기', action: '달군 팬에 고기와 채소를 중불에서 3분간 달달 볶습니다.', timer_seconds: 180 },
        { step_number: 3, highlight_action: '카레 끓이기', action: '물 450ml를 붓고 카레가루를 풀어 7분간 끓여 완성합니다.', timer_seconds: 420 },
      ];
      tips = ['버터 1조각을 넣으면 일본식 깊은 풍미가 살아납니다.', '사과잼이나 꿀 0.5T 추가 추천'];
    } else if (p1.includes('두부') || p2.includes('두부')) {
      menuName = `구수한 애호박 두부 된장찌개 & 두부조림`;
      category = '국/찌개 & 든든한 밥상';
      cookingTime = '15분';
      shoppingForDay.push('찌개용 차돌박이 200g');
      steps = [
        { step_number: 1, highlight_action: '두부 손질', action: `${p1}를 먹기 좋은 한 입 크기로 썹니다.`, timer_seconds: 0 },
        { step_number: 2, highlight_action: '육수 내기', action: '냄비에 물 500ml와 된장 2T를 풀고 센 불로 끓입니다.', timer_seconds: 180 },
        { step_number: 3, highlight_action: '보글보글 끓이기', action: '두부와 채소를 넣고 중약불에서 7분간 끓여 완성합니다.', timer_seconds: 420 },
      ];
      tips = ['된장이 부족할 땐 쌈장 1T를 섞으면 감칠맛 폭발', '청양고추 반 개로 칼칼함 추가'];
    } else if (p1.includes('감자') || p2.includes('감자')) {
      menuName = `바삭 고소한 감자채전 & 맑은 계란국`;
      category = '가정식 별미 반찬';
      cookingTime = '12분';
      shoppingForDay.push('부침가루 1봉');
      steps = [
        { step_number: 1, highlight_action: '감자 채썰기', action: '감자를 곱게 채썰어 전분기를 가볍게 털어냅니다.', timer_seconds: 0 },
        { step_number: 2, highlight_action: '노릇하게 굽기', action: '팬에 기름을 넉넉히 두르고 중약불에서 4분간 바삭하게 부칩니다.', timer_seconds: 240 },
        { step_number: 3, highlight_action: '뒤집기', action: '뒤집어서 반대편도 3분간 노릇하게 구워냅니다.', timer_seconds: 180 },
      ];
      tips = ['소금 한 꼬집과 후추로 밑간하면 완벽한 간', '피자치즈를 얹으면 퓨전 안주로 변신'];
    } else if (p1.includes('고기') || p1.includes('제육') || p1.includes('삼겹')) {
      menuName = `매콤 달콤 파기름 ${p1} 볶음 & 쌈채소`;
      category = '볶음 요리';
      cookingTime = '18분';
      shoppingForDay.push('모둠 쌈채소 1팩');
      steps = [
        { step_number: 1, highlight_action: '고기 양념', action: '고기에 간장, 고추장, 다진마늘을 넣고 조물조물 버무립니다.', timer_seconds: 300 },
        { step_number: 2, highlight_action: '센불 볶기', action: '팬을 달궈 센 불에서 4분간 고기를 빠르게 볶아냅니다.', timer_seconds: 240 },
        { step_number: 3, highlight_action: '파기름 마무리', action: '대파와 양파를 넣고 2분간 더 볶아 불맛을 입힙니다.', timer_seconds: 120 },
      ];
      tips = ['올리고당 1T로 윤기와 단맛 잡기', '맛술 대신 소주 약간으로 잡내 제거'];
    } else {
      const presets: Record<string, string> = {
        '0': `감칠맛 가득 ${p1} 야채 볶음밥`,
        '1': `칼칼하고 든든한 ${p1} 짜글이 찌개`,
        '2': `영양 듬뿍 ${p1} 계란 덮밥`,
        '3': `고소한 들기름 ${p1} 나물 비빔밥`,
        '4': `주말 냉장고 털이 ${p1} 모둠 전`,
      };
      menuName = presets[(idx % 5).toString()] || `${p1} 웰빙 정식`;
      category = input.dietaryPreset;
      cookingTime = '15분';
      shoppingForDay.push('필수 부재료 1종');
      steps = [
        { step_number: 1, highlight_action: '재료 손질', action: `${p1}와 부재료를 먹기 좋게 손질합니다.`, timer_seconds: 0 },
        { step_number: 2, highlight_action: '볶기 및 조리', action: '팬에 식용유를 두르고 중불에서 3분간 볶아 익힙니다.', timer_seconds: 180 },
        { step_number: 3, highlight_action: '양념 조리기', action: '간장과 참기름을 두르고 약불에서 2분간 뜸을 들이며 완성합니다.', timer_seconds: 120 },
      ];
      tips = ['굴소스 1T를 더하면 전문점 감칠맛 완성', '참기름은 불을 끄고 마지막에 둘러야 향이 유지됩니다.'];
    }

    return {
      id: dayId,
      day_of_week: day,
      is_dining_out: false,
      menu_name: menuName,
      category: category,
      cooking_time: cookingTime,
      image_url: assignImageByKeywords(menuName, false),
      used_pantry_items: pantryForDay,
      used_shopping_items: shoppingForDay,
      calories_per_serving: calories,
      alternative_sauces: tips,
      recipe_steps: steps,
    };
  });

  // Calculate shopping cart items that complement the pantry
  const dynamicCart = {
    vegetables: [
      { id: 'v-1', name: '양파 1망 (소)', quantity: '3~4입', purchase_url: getCoupangSearchUrl('양파'), checked: false },
      { id: 'v-2', name: '대파 1단', quantity: '1단', purchase_url: getCoupangSearchUrl('대파'), checked: false },
      { id: 'v-3', name: '신선 모둠 쌈채소', quantity: '1팩', purchase_url: getCoupangSearchUrl('쌈채소'), checked: false },
    ].filter(item => !pantryList.some(p => p.includes(item.name.split(' ')[0]))),
    meat_seafood: [
      { id: 'm-1', name: '국내산 돼지고기 (찌개/볶음용)', quantity: '400g', purchase_url: getCoupangSearchUrl('돼지고기 앞다리살'), checked: false },
      { id: 'm-2', name: '차돌박이 또는 소고기 국거리', quantity: '300g', purchase_url: getCoupangSearchUrl('차돌박이'), checked: false },
    ],
    sauce_pantry: [
      { id: 's-1', name: '국산 콩 두부 1모', quantity: '1모 (300g)', purchase_url: getCoupangSearchUrl('두부'), checked: false },
      { id: 's-2', name: '찌개용 재래식 된장', quantity: '1통', purchase_url: getCoupangSearchUrl('된장'), checked: false },
    ].filter(item => !pantryList.some(p => p.includes(item.name.split(' ')[0]))),
  };

  // Generate dynamic storage guides based on user's actual pantry
  const dynamicStorage = pantryList.slice(0, 3).map((item, idx) => {
    const raw = cleanItems[idx] || item;
    let tip = `${raw}은(는) 세척 후 물기를 제거하고 밀폐용기에 키친타월을 깔아 냉장 보관하면 최대 1주일간 신선합니다.`;
    if (raw.includes('대파')) {
      tip = '대파는 송송 썰어 밀폐용기에 담아 냉동 보관하면 국/찌개에 한 달간 간편히 사용할 수 있습니다.';
    } else if (raw.includes('두부')) {
      tip = '남은 두부는 생수를 자작하게 붓고 소금 한 꼬집을 넣어 냉장 보관하고 매일 물을 갈아주세요.';
    } else if (raw.includes('감자')) {
      tip = '감자는 냉장고 대신 서늘하고 그늘진 상온에 사과 1알과 함께 두면 싹이 나지 않습니다.';
    } else if (raw.includes('카레')) {
      tip = '남은 카레가루는 지퍼백에 밀봉하여 서늘하고 건조한 실온이나 냉동실에 보관하세요.';
    }
    return {
      id: `st-${idx + 1}`,
      item: `남은 ${item}`,
      tip: tip,
      urgency: (idx === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
    };
  });

  return {
    summary_insight: `[${input.familySize} 맞춤 / ${input.dietaryPreset}] 입력하신 보유 재료 [${pantryStr}]을(를) 최우선 소진하도록 맞춤 설계된 주간 식단표입니다!`,
    weekly_plan: generatedDays,
    smart_cart: dynamicCart,
    storage_guides: dynamicStorage.length > 0 ? dynamicStorage : [
      {
        id: 'st-1',
        item: '자투리 채소 모둠',
        tip: '잘게 다져 지퍼백에 냉동해두면 일요일 볶음밥이나 계란말이에 100% 알뜰 소진할 수 있습니다.',
        urgency: 'medium',
      },
    ],
  };
}

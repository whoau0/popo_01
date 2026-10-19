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

// Food category stock image fallbacks with verified high quality Unsplash photos
export const FOOD_IMAGES: Record<string, string> = {
  kimchiStew: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80',
  soup: 'https://images.unsplash.com/photo-1583032015879-bf6b864a6e87?auto=format&fit=crop&w=600&q=80',
  stew: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80',
  stirfry: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
  rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
  pork: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  tofu: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  dining: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  curry: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
  noodle: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  chicken: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80',
  beef: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  egg: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  pancake: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
};

export function assignImageByKeywords(name: string, isDining: boolean): string {
  if (isDining) return FOOD_IMAGES.dining;
  const n = (name || '').toLowerCase();
  if (n.includes('김치찌개') || n.includes('김치 찌개') || (n.includes('김치') && n.includes('찌개'))) return FOOD_IMAGES.kimchiStew;
  if (n.includes('카레')) return FOOD_IMAGES.curry;
  if (n.includes('김치전') || n.includes('파전') || n.includes('감자전') || n.includes('부침개') || n.includes(' 전') || n.includes('동그랑땡')) return FOOD_IMAGES.pancake;
  if (n.includes('찌개') || n.includes('국') || n.includes('탕')) return FOOD_IMAGES.soup;
  if (n.includes('볶음밥') || n.includes('덮밥') || n.includes('비빔밥') || n.includes('밥')) return FOOD_IMAGES.rice;
  if (n.includes('제육') || n.includes('불고기') || n.includes('볶음') || n.includes('두루치기')) return FOOD_IMAGES.stirfry;
  if (n.includes('두부') || n.includes('순두부')) return FOOD_IMAGES.tofu;
  if (n.includes('닭') || n.includes('치킨')) return FOOD_IMAGES.chicken;
  if (n.includes('오리') || n.includes('돼지') || n.includes('삼겹')) return FOOD_IMAGES.pork;
  if (n.includes('소고기') || n.includes('차돌') || n.includes('소갈비')) return FOOD_IMAGES.beef;
  if (n.includes('계란') || n.includes('달걀')) return FOOD_IMAGES.egg;
  if (n.includes('면') || n.includes('우동') || n.includes('파스타') || n.includes('국수') || n.includes('라면')) return FOOD_IMAGES.noodle;
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

[가정집 기본 보유 전제 조건]
- 간장, 고추장, 된장, 쌈장, 고춧가루, 다진마늘, 설탕, 올리고당, 소금, 후추, 참기름, 들기름, 식용유, 맛술, 굴소스, 식초 등 한국 가정의 기본 조미료와 소스류는 냉장고와 양념장에 이미 100% 구비되어 있다고 전제하세요.
- 따라서 양념이 없다는 이유로 단순 '볶음밥'이나 '야채볶음' 위주로 식단을 좁히지 마세요!

[핵심 요구사항 - 맛 검증 황금비율 양념장 & 초보자도 완벽히 따라하는 상세 레시피]
1. 단순 볶음밥, 비빔밥, 덮밥류는 주간 7일 중 최대 1회로 제한하고, 정통 및 퓨전 한국 가정식의 '풍성한 일품 메인 요리'를 요일별로 다채롭게 기획하세요.
2. [맛 검증 황금비율 양념장 (golden_ratio_sauce)]:
   - 모든 요리마다 백종원, 류수영, 알토란 등 한국 최고 요리 연구가들이 검증한 정확한 계량 스푼 단위(T/t, 큰술, 작은술, ml, g)의 황금비율 배합표를 반드시 작성하세요.
   - 고추장, 간장, 고춧가루, 설탕, 다진마늘, 맛술, 참기름, 굴소스 등의 구체적 계량과 '배합 및 숙성 비법(mixing_tip)', '맛의 킥/비법 한 끗(taste_kick)'을 반드시 포함하세요.
3. [실패 없는 정밀 단계별 레시피 (recipe_steps)]:
   - 절대 3~4단계로 간략히 줄이지 말고, 요리 초보자도 100% 식당 맛을 낼 수 있도록 최소 5~7단계 이상의 상세한 조리 과정을 작성하세요.
   - 각 단계마다 불 조절(heat_level: '강불' | '중불' | '약불' | '잔열/뜸')을 명시하세요.
   - 시각적 완료 기준(예: "대파가 갈색빛이 돌며 향이 날 때까지", "고기 핏기가 가시고 겉면이 노릇해질 때까지")을 action에 상세히 서술하세요.
   - 각 단계마다 요리의 실패를 막는 셰프의 비법(tip)을 구체적으로 기재하세요.
4. 조리 방식(찌개/국/탕, 조림, 찜, 구이, 볶음/두루치기, 전/부침 등)이 요일마다 겹치지 않고 다양하게 순환되도록 영양과 식탁의 풍성함을 보장하세요.
5. [현재 냉장고 보유 재료]를 최우선으로 적극 활용하되, 묶음 단위 구매 재료는 주간 2~3회 나누어 써서 폐기율 0%를 달성하세요.
6. smart_cart: 기본 소스류(간장, 소금, 설탕, 참기름 등)는 이미 집에 있으므로 절대 카트에 넣지 말고, 순수 구매가 필요한 신선 정육/수산, 채소, 메인 부재료만 카테고리별로 정제하세요.
7. storage_guides: 쓰고 남을 식재료의 구체적 보관법을 제시하세요.

반드시 마크다운 코드블록이나 잡담 없이 순수 JSON 포맷으로만 응답하세요:
{
  "summary_insight": "string (이번 주 식단 구성 요약 및 재료 소진 전략)",
  "weekly_plan": [
    {
      "id": "day-mon",
      "day_of_week": "월요일",
      "is_dining_out": false,
      "menu_name": "string (요리명)",
      "category": "string (예: 국/찌개, 볶음, 찜/조림, 일품요리 등)",
      "cooking_time": "18분",
      "image_url": "",
      "used_pantry_items": ["string (활용한 보유재료)"],
      "used_shopping_items": ["string (추가 필요 재료)"],
      "calories_per_serving": 450,
      "golden_ratio_sauce": {
        "sauce_name": "string (예: 백종원식 불맛 제육 황금 양념장 배합표)",
        "ingredients": [
          { "name": "진간장", "amount": "2큰술 (30ml)" },
          { "name": "고춧가루", "amount": "2큰술 (20g)" },
          { "name": "고추장", "amount": "2큰술 (35g)" },
          { "name": "황설탕", "amount": "1.5큰술 (18g)" },
          { "name": "다진 마늘", "amount": "1.5큰술 (20g)" }
        ],
        "mixing_tip": "string (배합 및 숙성 비법)",
        "taste_kick": "string (맛의 킥/비법 한 끗)"
      },
      "alternative_sauces": ["string (대체 양념 팁)"],
      "recipe_steps": [
        {
          "step_number": 1,
          "highlight_action": "string (핵심 행동 키워드)",
          "heat_level": "강불 | 중불 | 약불 | 잔열/뜸",
          "action": "string (정밀하고 상세한 조리 지침)",
          "tip": "string (실패 방지 팁)",
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

      // Format weekly plan and images - always guarantee valid high quality image
      parsed.weekly_plan = parsed.weekly_plan.map((day, idx) => ({
        ...day,
        id: day.id || `day-${idx + 1}`,
        image_url: assignImageByKeywords(day.menu_name, day.is_dining_out),
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
    let goldenSauce: any = undefined;

    const primaryPantry = pantryList[idx % Math.max(1, pantryList.length)] || '계란 2알';
    const secondaryPantry = pantryList[(idx + 1) % Math.max(1, pantryList.length)] || '대파';

    pantryForDay.push(primaryPantry);
    if (pantryList.length > 1 && idx % 2 === 0) {
      pantryForDay.push(secondaryPantry);
    }

    // Check ingredients category
    const allPantryText = pantryList.join(' ').toLowerCase();
    const isPork = allPantryText.includes('돼지') || allPantryText.includes('삼겹') || allPantryText.includes('목살') || allPantryText.includes('제육') || allPantryText.includes('앞다리') || allPantryText.includes('대패');
    const isBeef = allPantryText.includes('소고기') || allPantryText.includes('차돌') || allPantryText.includes('불고기') || allPantryText.includes('우삼겹') || allPantryText.includes('한우');
    const isChicken = allPantryText.includes('닭') || allPantryText.includes('치킨');

    // Rich main dish recipes tailored to ingredients with verified golden sauces & detailed steps
    if (isPork) {
      const porkDishes = [
        {
          name: '매콤 불맛 파기름 제육볶음 & 모둠 쌈채소',
          category: '볶음/일품 요리',
          time: '20분',
          cal: 520,
          shop: ['모둠 쌈채소 1팩'],
          sauce: {
            sauce_name: '류수영·백종원식 불맛 제육 황금 양념장',
            ingredients: [
              { name: '고추장', amount: '2큰술 (35g)' },
              { name: '진간장', amount: '2큰술 (30ml)' },
              { name: '고춧가루', amount: '2큰술 (20g)' },
              { name: '황설탕', amount: '1.5큰술 (18g)' },
              { name: '다진 마늘', amount: '1.5큰술 (20g)' },
              { name: '맛술', amount: '2큰술 (30ml)' },
              { name: '올리고당', amount: '1큰술 (15g)' },
              { name: '참기름 & 후추', amount: '참기름 1T, 후추 3톡' },
            ],
            mixing_tip: '양념을 볼에 미리 섞어 설탕을 녹인 뒤 10분간 숙성하면 고춧가루가 불어 색감이 곱고 고기에 착 밀착됩니다.',
            taste_kick: '맛의 킥: 고기를 볶기 전 설탕 1큰술을 고기에 먼저 버무려두면 연육 작용으로 고기가 훨씬 부드러워집니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '설탕 연육 재우기', heat_level: '잔열/뜸', action: '돼지고기를 한입 크기로 썰어 키친타월로 핏물을 닦고 설탕 1큰술과 맛술 1큰술을 버무려 5분간 둡니다.', tip: '설탕이 먼저 침투해야 단맛이 겉돌지 않고 육질이 부드러워집니다.', timer_seconds: 300 },
            { step_number: 2, highlight_action: '황금 양념 버무리기', heat_level: '잔열/뜸', action: '준비된 황금 양념장을 고기에 붓고 손으로 조물조물 주물러 5분간 간이 배게 합니다.', tip: '손끝으로 꾹꾹 눌러 치대주면 고기 속까지 양념이 스며듭니다.', timer_seconds: 300 },
            { step_number: 3, highlight_action: '파기름 내기', heat_level: '중불', action: '팬에 식용유 2큰술을 두르고 송송 썬 대파를 넣어 중불에서 2분간 노릇해질 때까지 파기름을 냅니다.', tip: '차가운 기름과 파를 함께 넣고 가열해야 파향이 풍부하게 우러납니다.', timer_seconds: 120 },
            { step_number: 4, highlight_action: '센불 불맛 볶기', heat_level: '강불', action: '불을 센 불로 올리고 양념 고기를 펼쳐 올립니다. 1분간 지진 뒤 빠르게 4분간 뒤집어가며 볶습니다.', tip: '센 불을 유지해야 물이 흥건해지지 않고 불맛이 살아납니다.', timer_seconds: 300 },
            { step_number: 5, highlight_action: '양파 투하 & 마무리', heat_level: '강불', action: '채 썬 양파를 넣고 2분간 아삭하게 볶은 뒤 불을 끄고 참기름과 통깨를 둘러 쌈채소와 곁들입니다.', tip: '참기름은 불을 끈 뒤 넣어야 고소한 향미가 보존됩니다.', timer_seconds: 120 },
          ],
          tips: ['불을 끄고 잔열에서 참기름을 둘러주세요.', '쌈채소에 편마늘과 쌈장을 곁들이면 최고입니다.'],
        },
        {
          name: '부드럽고 촉촉한 수육(보쌈) & 마늘 쌈장',
          category: '찜/삶기 요리',
          time: '30분',
          cal: 560,
          shop: ['통마늘 1봉', '알배기 배추 1통'],
          sauce: {
            sauce_name: '잡내 제로 한방 된장 수육 육수 & 마늘 쌈장',
            ingredients: [
              { name: '재래식 된장', amount: '2큰술 (30g)' },
              { name: '맛술 또는 소주', amount: '3큰술 (45ml)' },
              { name: '통마늘', amount: '8~10알' },
              { name: '커피가루 (잡내 비법)', amount: '0.5작은술' },
              { name: '통후추', amount: '10알' },
              { name: '마늘 쌈장', amount: '쌈장 3T, 다진마늘 1T, 참기름 1T' },
            ],
            mixing_tip: '수육 삶는 물에 된장과 함께 커피가루 반 작은술을 넣으면 돼지고기 특유의 누린내가 100% 잡히고 먹음직스러운 갈색빛이 돕니다.',
            taste_kick: '맛의 킥: 다 삶은 고기를 건져 바로 썰지 말고 랩이나 뚜껑을 덮어 5분간 레스팅하면 육즙이 고기 전체로 퍼져 촉촉함이 유지됩니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '수육 육수 끓이기', heat_level: '강불', action: '냄비에 물 1.2L와 된장 2T, 맛술 3T, 대파 1대, 통마늘 8알, 커피가루 0.5t를 넣고 센 불로 팔팔 끓입니다.', tip: '육수가 끓어오를 때 고기를 넣어야 겉면 단백질이 응고되어 육즙이 빠져나가지 않습니다.', timer_seconds: 240 },
            { step_number: 2, highlight_action: '고기 투하 & 삶기', heat_level: '중불', action: '육수가 끓으면 돼지고기 덩어리를 넣고 뚜껑을 덮어 중약불에서 25분간 뭉근하게 삶습니다.', tip: '젓가락으로 가장 두꺼운 부분을 찔렀을 때 핏물이 나오지 않고 맑은 물이 나오면 다 익은 것입니다.', timer_seconds: 1500 },
            { step_number: 3, highlight_action: '육즙 가두는 레스팅', heat_level: '잔열/뜸', action: '다 익은 고기를 꺼내 도마 위에 올리고 5분간 한 김 식히며 육즙을 안정화시킵니다.', tip: '뜨거울 때 바로 썰면 살이 부서지고 육즙이 다 흘러나오므로 잠시 기다립니다.', timer_seconds: 300 },
            { step_number: 4, highlight_action: '먹기 좋게 썰기', heat_level: '잔열/뜸', action: '칼을 비스듬히 눕혀 0.8cm 두께로 정갈하게 썰어 알배기 배추, 마늘 쌈장과 함께 담아냅니다.', tip: '결 반대 방향으로 썰어야 씹는 식감이 연하고 부드럽습니다.', timer_seconds: 0 },
          ],
          tips: ['새우젓 1T에 참기름과 고춧가루를 섞은 새우젓 양념장을 곁들이세요.'],
        },
        {
          name: '깊은 감칠맛 묵은지 돼지고기 김치찜',
          category: '찜/조림 요리',
          time: '25분',
          cal: 480,
          shop: ['두부 1모'],
          sauce: {
            sauce_name: '묵은지 신맛 중화 깊은맛 김치찜 양념',
            ingredients: [
              { name: '고춧가루', amount: '2큰술 (20g)' },
              { name: '국간장', amount: '1큰술 (15ml)' },
              { name: '황설탕 (신맛 중화)', amount: '1큰술 (12g)' },
              { name: '다진 마늘', amount: '1.5큰술 (20g)' },
              { name: '맛술', amount: '1큰술 (15ml)' },
              { name: '들기름 (풍미)', amount: '1.5큰술 (20ml)' },
            ],
            mixing_tip: '김치찜의 핵심은 설탕 1큰술과 들기름입니다. 묵은지의 아린 신맛을 설탕이 부드럽게 감싸고 들기름이 김치를 야들야들하게 만들어줍니다.',
            taste_kick: '맛의 킥: 쌀뜨물 500ml를 붓고 뚜껑을 덮어 끓이다가 마지막 5분간 두부를 얹어 조리면 두부에 깊은 김치 육수가 쏙 배어듭니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '냄비 바닥 세팅', heat_level: '잔열/뜸', action: '냄비 바닥에 들기름 1큰술을 두르고 큼직하게 썬 돼지고기를 깐 뒤 묵은지 반 포기로 고기를 포근히 감싸듯 올립니다.', tip: '고기가 바닥에 닿아야 타지 않고 김치 이불을 덮어 육즙이 위아래로 순환합니다.', timer_seconds: 0 },
            { step_number: 2, highlight_action: '양념 육수 붓기', heat_level: '강불', action: '쌀뜨물 500ml에 고춧가루 2T, 국간장 1T, 설탕 1T, 다진마늘 1.5T를 섞은 양념 육수를 붓고 센 불로 끓입니다.', tip: '김칫국물 3큰술을 함께 넣어주면 따로 육수를 내지 않아도 감칠맛이 진해집니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '약불 뭉근히 찜하기', heat_level: '중약불', action: '끓어오르면 뚜껑을 덮고 중약불로 줄여 18분간 김치가 나른하고 투명해질 때까지 푹 조립니다.', tip: '중간에 뚜껑을 자주 열지 않아야 찜기 내부의 증기가 고기를 부드럽게 익혀줍니다.', timer_seconds: 1080 },
            { step_number: 4, highlight_action: '두부 투하 & 완성', heat_level: '약불', action: '두부를 도톰하게 썰어 냄비 가장자리에 둘러 넣고 국물을 끼얹어가며 4분간 더 졸여 완성합니다.', tip: '길게 찢은 묵은지에 두부와 고기를 싸서 드시면 밥도둑입니다.', timer_seconds: 240 },
          ],
          tips: ['남은 국물에 밥과 김가루, 참기름을 넣고 볶아드세요.'],
        },
      ];
      const d = porkDishes[idx % porkDishes.length];
      menuName = d.name;
      category = d.category;
      cookingTime = d.time;
      calories = d.cal;
      shoppingForDay.push(...d.shop);
      steps = d.steps;
      tips = d.tips;
      goldenSauce = d.sauce;
    } else if (isBeef) {
      const beefDishes = [
        {
          name: '달콤 짭조름한 궁중 소불고기 버섯전골',
          category: '전골/일품 요리',
          time: '20분',
          cal: 510,
          shop: ['모둠 버섯 1팩', '대파 1단'],
          sauce: {
            sauce_name: '궁중 전통 소불고기 비법 간장 소스',
            ingredients: [
              { name: '진간장 (양조간장)', amount: '4큰술 (60ml)' },
              { name: '배음료(갈배) 또는 맛술', amount: '3큰술 (45ml)' },
              { name: '황설탕', amount: '1.5큰술 (18g)' },
              { name: '다진 마늘', amount: '1.5큰술 (20g)' },
              { name: '참기름', amount: '1.5큰술 (20ml)' },
              { name: '후춧가루', amount: '3톡' },
            ],
            mixing_tip: '배음료를 간장에 섞어 고기를 재우면 배의 천연 연육 성분이 소고기를 극도로 부드럽게 만들고 깊은 단맛을 냅니다.',
            taste_kick: '맛의 킥: 전골 육수 400ml에 참치액 0.5큰술을 더하면 전문점 샤브샤브 전골처럼 깊은 감칠맛이 완성됩니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '소불고기 양념 재우기', heat_level: '잔열/뜸', action: '소고기에 진간장 4T, 배음료 3T, 설탕 1.5T, 다진마늘 1.5T, 참기름 1.5T를 넣고 조물조물 버무려 10분간 재웁니다.', tip: '소고기는 핏물을 키친타월로 먼저 눌러 닦아내야 잡내가 없습니다.', timer_seconds: 600 },
            { step_number: 2, highlight_action: '전골 냄비 버섯 세팅', heat_level: '잔열/뜸', action: '전골 냄비 가운데에 양념 소고기를 올리고 둘레에 팽이버섯, 표고버섯, 대파, 양파를 보기 좋게 둘러 담습니다.', tip: '채소를 색감별로 둘러 담으면 손님 대접용으로 손색없는 정갈한 비주얼이 됩니다.', timer_seconds: 0 },
            { step_number: 3, highlight_action: '육수 붓고 끓이기', heat_level: '강불', action: '물 400ml에 참치액 0.5T를 섞은 육수를 냄비 가장자리에 조심스럽게 붓고 센 불로 끓입니다.', tip: '가운데 고기 위에 직접 붓지 말고 가장자리에 부어야 고기 양념이 씻겨 나가지 않습니다.', timer_seconds: 180 },
            { step_number: 4, highlight_action: '소고기 익히기 & 완성', heat_level: '중불', action: '국물이 끓어오르면 젓가락으로 뭉친 소고기를 살살 풀어주며 중불에서 5분간 익혀냅니다.', tip: '소고기는 오래 끓이면 질겨지므로 핏기가 가시고 익자마자 건져 드시는 것이 가장 부드럽습니다.', timer_seconds: 300 },
          ],
          tips: ['당면을 미지근한 물에 30분 불려두었다가 함께 넣으면 최고입니다.'],
        },
        {
          name: '차돌박이 애호박 된장찌개 & 계란말이',
          category: '국/찌개 & 밥상',
          time: '15분',
          cal: 440,
          shop: ['두부 1모', '애호박 1개'],
          sauce: {
            sauce_name: '백종원식 차돌 된장찌개 비법 배합표',
            ingredients: [
              { name: '재래식 된장', amount: '2큰술 (30g)' },
              { name: '시판 쌈장 (비법)', amount: '0.5큰술 (8g)' },
              { name: '고춧가루', amount: '1큰술 (10g)' },
              { name: '다진 마늘', amount: '1큰술 (15g)' },
              { name: '국간장', amount: '0.5큰술 (7ml)' },
            ],
            mixing_tip: '된장과 쌈장을 4:1로 섞으면 식당 된장찌개 특유의 입에 착 감기는 감칠맛이 살아납니다.',
            taste_kick: '맛의 킥: 쌀뜨물 500ml를 사용하고 끓을 때 설탕 1/3작은술을 넣으면 떫은맛이 사라집니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '차돌박이 소기름 내기', heat_level: '중불', action: '달군 뚝배기에 기름 없이 차돌박이를 넣고 중불에서 2분간 볶아 고소한 소기름을 충분히 뽑아냅니다.', tip: '차돌 기름으로 채소를 볶아야 국물에 진한 풍미가 뱁니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '파 고추기름 내기', heat_level: '약불', action: '나온 소기름에 대파와 고춧가루 1큰술을 넣고 약불에서 1분간 살살 볶아 붉은 고추기름을 냅니다.', tip: '고춧가루가 타지 않게 약불을 유지하세요.', timer_seconds: 60 },
            { step_number: 3, highlight_action: '쌀뜨물 & 양념 풀기', heat_level: '강불', action: '쌀뜨물 500ml를 붓고 된장 2T, 쌈장 0.5T, 다진마늘 1T를 거름망에 풀어 넣고 센 불로 끓입니다.', tip: '거름망을 쓰면 콩 찌꺼기 없이 맑고 개운합니다.', timer_seconds: 180 },
            { step_number: 4, highlight_action: '애호박·두부 조리기', heat_level: '중불', action: '끓어오르면 썰어둔 애호박, 두부를 넣고 중불로 줄여 5분간 보글보글 끓여 완성합니다.', tip: '거품을 걷어내면 텁텁하지 않고 담백합니다.', timer_seconds: 300 },
          ],
          tips: ['청양고추 1개를 송송 썰어 넣으면 칼칼함이 배가됩니다.'],
        },
      ];
      const d = beefDishes[idx % beefDishes.length];
      menuName = d.name;
      category = d.category;
      cookingTime = d.time;
      calories = d.cal;
      shoppingForDay.push(...d.shop);
      steps = d.steps;
      tips = d.tips;
      goldenSauce = d.sauce;
    } else if (isChicken) {
      const chickenDishes = [
        {
          name: '매콤 칼칼한 밥도둑 닭볶음탕',
          category: '조림/탕 요리',
          time: '25분',
          cal: 520,
          shop: ['감자 2개', '당근 1개'],
          sauce: {
            sauce_name: '정통 황금비율 닭볶음탕 양념장',
            ingredients: [
              { name: '고추장', amount: '2큰술 (35g)' },
              { name: '고춧가루', amount: '3큰술 (30g)' },
              { name: '진간장', amount: '4큰술 (60ml)' },
              { name: '설탕', amount: '2큰술 (24g)' },
              { name: '다진 마늘', amount: '2큰술 (30g)' },
              { name: '맛술', amount: '2큰술 (30ml)' },
              { name: '후춧가루', amount: '3톡' },
            ],
            mixing_tip: '닭볶음탕은 단맛(설탕)을 처음에 닭과 함께 넣어 끓여야 고기 속까지 간이 배고 닭고기 잡내가 날아갑니다.',
            taste_kick: '맛의 킥: 감자를 큼직하게 썰어 국물과 함께 으깨어 밥에 비벼 먹는 것이 최고의 포인트입니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '닭고기 데치기', heat_level: '강불', action: '끓는 물에 닭고기를 2분간 가볍게 데쳐 불순물과 핏물을 찬물에 깨끗이 씻어냅니다.', tip: '데쳐내야 닭 잡내와 기름기가 말끔히 제거됩니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '설탕 먼저 끓이기', heat_level: '강불', action: '냄비에 손질된 닭과 물 500ml, 설탕 2큰술을 넣고 센 불에서 끓어오를 때까지 3분간 먼저 끓입니다.', tip: '설탕 분자가 먼저 닭고기 살을 연하게 해줍니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '황금 양념장 & 감자 투하', heat_level: '강불', action: '준비된 양념장(고추장, 고춧가루, 간장, 마늘, 맛술)과 큼직하게 썬 감자, 당근을 넣고 센 불로 끓입니다.', tip: '감자를 너무 작게 썰면 국물이 탁해지니 큼직하게 썰어주세요.', timer_seconds: 180 },
            { step_number: 4, highlight_action: '중약불 푹 조리기', heat_level: '중약불', action: '뚜껑을 비스듬히 덮고 중약불에서 15분간 국물이 걸쭉하고 진해질 때까지 푹 조려 완성합니다.', tip: '바닥이 눋지 않도록 중간에 주걱으로 바닥을 한두 번 긁어줍니다.', timer_seconds: 900 },
          ],
          tips: ['남은 국물에 김가루와 참기름을 넣고 볶음밥을 만들어 드세요.'],
        },
      ];
      const d = chickenDishes[idx % chickenDishes.length];
      menuName = d.name;
      category = d.category;
      cookingTime = d.time;
      calories = d.cal;
      shoppingForDay.push(...d.shop);
      steps = d.steps;
      tips = d.tips;
      goldenSauce = d.sauce;
    } else {
      // General rich home-cooked meal spectrum (stews, roasts, pancakes, curries)
      const generalDishes = [
        {
          name: '구수한 차돌 애호박 된장찌개 & 계란말이',
          category: '국/찌개 & 밥상',
          time: '15분',
          cal: 430,
          shop: ['차돌박이 200g', '애호박 1개'],
          sauce: {
            sauce_name: '백종원식 차돌 된장찌개 비법 배합표',
            ingredients: [
              { name: '재래식 된장', amount: '2큰술 (30g)' },
              { name: '시판 쌈장 (감칠맛)', amount: '0.5큰술 (8g)' },
              { name: '고춧가루', amount: '1큰술 (10g)' },
              { name: '다진 마늘', amount: '1큰술 (15g)' },
            ],
            mixing_tip: '된장과 쌈장을 섞어 고춧가루와 함께 개어두면 텁텁하지 않고 시원합니다.',
            taste_kick: '맛의 킥: 쌀뜨물 500ml를 사용하면 국물이 뽀얗고 구수해집니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '차돌박이 볶기', heat_level: '중불', action: '뚝배기에 차돌박이를 넣고 중불에서 2분간 볶아 기름을 냅니다.', tip: '차돌 기름에 고춧가루를 볶아 고추기름을 내면 훨씬 맛있습니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '된장 육수 풀기', heat_level: '강불', action: '쌀뜨물 500ml에 된장과 쌈장, 마늘을 풀고 센 불로 끓입니다.', tip: '된장 찌꺼기를 걸러내면 국물이 깔끔합니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '채소 넣고 끓이기', heat_level: '중불', action: '애호박과 두부를 깍둑썰어 넣고 중불에서 6분간 보글보글 끓여냅니다.', tip: '포슬포슬한 계란말이와 곁들여 풍성하게 상을 차립니다.', timer_seconds: 360 },
          ],
          tips: ['쌈장 0.5T를 더하면 고깃집 된장찌개 맛이 납니다.'],
        },
        {
          name: '향긋하고 진한 일본식 야채 비프 카레라이스',
          category: '일품 요리',
          time: '18분',
          cal: 490,
          shop: ['카레용 소고기 200g', '양파 1망'],
          sauce: {
            sauce_name: '버터 양파 캐러멜라이징 & 골든 카레 배합',
            ingredients: [
              { name: '고형 또는 분말 카레', amount: '4조각 (100g)' },
              { name: '버터', amount: '1조각 (15g)' },
              { name: '케첩 (산미 밸런스)', amount: '1큰술 (15g)' },
              { name: '진간장', amount: '0.5큰술 (7ml)' },
            ],
            mixing_tip: '양파를 버터에 갈색이 될 때까지 오래 볶아 캐러멜라이징하는 것이 전문점 카레 깊은 단맛의 90%를 결정합니다.',
            taste_kick: '맛의 킥: 케첩 1큰술과 간장 반 큰술을 카레에 더하면 풍미가 훨씬 깊어집니다.',
          },
          steps: [
            { step_number: 1, highlight_action: '양파 캐러멜라이징', heat_level: '중약불', action: '팬에 버터를 녹이고 채 썬 양파를 중약불에서 갈색빛이 돌 때까지 4분간 볶아 달콤한 향을 냅니다.', tip: '타지 않게 중약불에서 은근히 볶아 단맛을 뽑아냅니다.', timer_seconds: 240 },
            { step_number: 2, highlight_action: '고기 & 채소 볶기', heat_level: '중불', action: '소고기와 깍둑썬 감자, 당근을 넣고 겉면이 익을 때까지 3분간 더 볶습니다.', tip: '소고기 표면을 먼저 시어링해야 육즙이 보존됩니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '물 붓고 카레 풀기', heat_level: '약불', action: '물 500ml를 붓고 끓으면 불을 약불로 줄이고 카레를 잘 풀어 7분간 뭉근하게 끓여냅니다.', tip: '불을 끄거나 아주 약한 불에서 카레를 풀어야 덩어리지지 않습니다.', timer_seconds: 420 },
          ],
          tips: ['다크 초콜릿 1조각이나 케첩 1T를 넣으면 깊은 풍미가 완성됩니다.'],
        },
      ];
      const d = generalDishes[idx % generalDishes.length];
      menuName = d.name;
      category = d.category;
      cookingTime = d.time;
      calories = d.cal;
      shoppingForDay.push(...d.shop);
      steps = d.steps;
      tips = d.tips;
      goldenSauce = d.sauce;
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
      golden_ratio_sauce: goldenSauce,
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

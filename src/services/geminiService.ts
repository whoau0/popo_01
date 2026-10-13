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

[핵심 요구사항 - 메뉴 다양성 및 풍성한 일품 요리 보장]
1. 단순 볶음밥, 비빔밥, 덮밥류는 주간 7일 중 최대 1회로 제한하고, 정통 및 퓨전 한국 가정식의 '풍성한 일품 메인 요리'를 요일별로 다채롭게 기획하세요.
2. 조리 방식(찌개/국/탕, 조림, 찜, 구이, 볶음/두루치기, 전/부침 등)이 요일마다 겹치지 않고 다양하게 순환되도록 영양과 식탁의 풍성함을 보장하세요.
3. 식재료별 다채로운 메인 요리 예시:
   * 돼지고기: 매콤 불맛 제육볶음, 촉촉하고 부드러운 수육(보쌈) & 쌈채소, 묵은지 돼지고기 김치찜, 달콤 짭조름한 간장 돼지불고기, 감자 돼지고기 고추장 짜글이, 등갈비/돼지갈비조림 등
   * 소고기: 차돌박이 애호박 된장찌개, 궁중 소불고기 버섯전골, 소고기 뭇국, 찹스테이크, 밀푀유나베 등
   * 닭고기: 매콤 칼칼한 닭볶음탕, 안동식 간장 찜닭 & 당면, 춘천식 매콤 닭갈비 등
   * 해물/생선: 해물 순두부찌개, 매콤 오징어볶음, 고등어 무조림 등
   * 채소/두부: 감자채전, 매콤 감자조림, 두부 두루치기, 애호박 새우젓 찌개 등
4. [현재 냉장고 보유 재료]를 최우선으로 적극 활용하되, 묶음 단위 구매 재료는 주간 2~3회 나누어 써서 폐기율 0%를 달성하세요.
5. smart_cart: 기본 소스류(간장, 소금, 설탕, 참기름 등)는 이미 집에 있으므로 절대 카트에 넣지 말고, 순수 구매가 필요한 신선 정육/수산, 채소, 메인 부재료만 카테고리별로 정제하세요.
6. storage_guides: 쓰고 남을 식재료의 구체적 보관법을 제시하세요.

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
    const isPotato = allPantryText.includes('감자');
    const isTofu = allPantryText.includes('두부') || allPantryText.includes('순두부');
    const isCurry = allPantryText.includes('카레');

    // Rich main dish recipes tailored to ingredients without falling back to plain fried rice
    if (isPork) {
      const porkDishes = [
        {
          name: '매콤 불맛 파기름 제육볶음 & 모둠 쌈채소',
          category: '볶음/일품 요리',
          time: '18분',
          cal: 520,
          shop: ['모둠 쌈채소 1팩'],
          steps: [
            { step_number: 1, highlight_action: '고기 양념', action: '돼지고기에 고추장 2T, 진간장 1.5T, 고춧가루 1T, 다진마늘 1T, 설탕 1T를 넣고 조물조물 재웁니다.', timer_seconds: 300 },
            { step_number: 2, highlight_action: '파기름 내기', action: '팬에 식용유를 두르고 송송 썬 대파를 중약불에서 2분간 볶아 향긋한 파기름을 만듭니다.', timer_seconds: 120 },
            { step_number: 3, highlight_action: '센불 볶기', action: '양념한 고기를 넣고 센 불에서 5분간 빠르게 볶아 불맛을 입혀 완성합니다.', timer_seconds: 300 },
          ],
          tips: ['불 끄기 직전 참기름 1T와 통깨를 뿌리면 고소함 극대화', '쌈채소와 마늘 쌈장을 곁들이세요.'],
        },
        {
          name: '부드럽고 촉촉한 수육(보쌈) & 마늘 쌈장',
          category: '찜/삶기 요리',
          time: '30분',
          cal: 560,
          shop: ['통마늘 1봉', '알배기 배추 1통'],
          steps: [
            { step_number: 1, highlight_action: '고기 삶기', action: '냄비에 물 1L, 된장 1.5T, 대파 1대, 통마늘, 맛술 2T를 넣고 끓어오르면 돼지고기를 넣습니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '중약불 뜸들이기', action: '뚜껑을 덮고 중약불에서 25분간 속까지 부드럽게 푹 삶아냅니다.', timer_seconds: 1500 },
            { step_number: 3, highlight_action: '썰어 담기', action: '고기를 꺼내 한 김 식힌 뒤 0.8cm 두께로 정갈하게 썰어 알배기 배추와 냅니다.', timer_seconds: 0 },
          ],
          tips: ['된장과 커피가루 약간을 넣으면 잡내가 완벽히 제거됩니다.', '새우젓에 참기름을 섞어 곁들이면 최고!'],
        },
        {
          name: '깊은 감칠맛 묵은지 돼지고기 김치찜',
          category: '찜/조림 요리',
          time: '25분',
          cal: 480,
          shop: ['두부 1모'],
          steps: [
            { step_number: 1, highlight_action: '냄비 세팅', action: '냄비 바닥에 돼지고기를 깔고 잘 익은 김치 반 포기로 고기를 감싸듯 얹습니다.', timer_seconds: 0 },
            { step_number: 2, highlight_action: '양념 육수 붓기', action: '물 500ml, 고춧가루 1T, 다진마늘 1T, 설탕 0.5T, 간장 1T를 섞은 육수를 붓습니다.', timer_seconds: 120 },
            { step_number: 3, highlight_action: '자작하게 졸이기', action: '뚜껑을 닫고 중약불에서 20분간 김치가 나른해질 때까지 푹 조려 완성합니다.', timer_seconds: 1200 },
          ],
          tips: ['설탕 0.5T가 묵은지의 신맛을 부드럽게 잡아줍니다.', '남은 국물에 밥을 비벼 먹으면 밥도둑!'],
        },
        {
          name: '달콤 짭조름한 간장 돼지불고기 & 아삭 파채',
          category: '구이/조림 요리',
          time: '15분',
          cal: 490,
          shop: ['양파 1개', '모둠 버섯 1팩'],
          steps: [
            { step_number: 1, highlight_action: '간장 양념 버무리기', action: '진간장 3T, 설탕 1.5T, 맛술 1T, 다진마늘 1T, 후추를 섞어 돼지고기를 버무립니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '센불에 굽기', action: '달군 팬에 양념 고기와 양파를 넣고 센 불에서 수분이 날아가도록 4분간 볶습니다.', timer_seconds: 240 },
            { step_number: 3, highlight_action: '파채 올리기', action: '고기가 노릇하게 익으면 불을 끄고 신선한 대파채를 얹어 잔열로 버무립니다.', timer_seconds: 60 },
          ],
          tips: ['올리고당 1T로 반질반질한 윤기를 더하세요.', '버섯을 함께 넣으면 식감이 풍부해집니다.'],
        },
        {
          name: '얼큰 칼칼한 고추장 돼지고기 감자 짜글이',
          category: '찌개/조림 요리',
          time: '18분',
          cal: 460,
          shop: ['감자 2개'],
          steps: [
            { step_number: 1, highlight_action: '재료 썰기', action: '돼지고기와 감자, 양파를 큼직한 큐브 모양으로 깍둑썰기합니다.', timer_seconds: 0 },
            { step_number: 2, highlight_action: '고기 볶기', action: '냄비에 기름을 두르고 고기와 고추장 1.5T, 된장 0.5T를 중불에 2분간 볶습니다.', timer_seconds: 120 },
            { step_number: 3, highlight_action: '자작하게 끓이기', action: '물 400ml와 감자를 넣고 감자가 포슬하게 익을 때까지 10분간 끓여 완성합니다.', timer_seconds: 600 },
          ],
          tips: ['국물이 자작할 때 밥 위에 얹어 슥슥 비벼 드세요.', '청양고추 1개를 송송 썰어 넣으면 더욱 칼칼합니다.'],
        },
        {
          name: '바삭 고소한 돼지고기 김치전 & 맑은 순두부탕',
          category: '전/별미 요리',
          time: '15분',
          cal: 430,
          shop: ['부침가루 1봉', '순두부 1봉'],
          steps: [
            { step_number: 1, highlight_action: '반죽 만들기', action: '잘게 썬 돼지고기와 신김치, 부침가루 1.5컵, 차가운 물 1컵을 섞어 반죽합니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '바삭하게 부치기', action: '기름을 넉넉히 두른 팬에 반죽을 얇게 펴고 중약불에서 앞뒤로 4분씩 바삭하게 부칩니다.', timer_seconds: 240 },
            { step_number: 3, highlight_action: '순두부 곁들이기', action: '다른 냄비에 물 300ml와 순두부를 넣고 국간장으로 간하여 3분간 맑게 끓입니다.', timer_seconds: 180 },
          ],
          tips: ['얼음물로 반죽하면 튀김처럼 바삭한 식감이 살아납니다.', '초간장(간장 1T + 식초 0.5T)에 콕 찍어드세요.'],
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
    } else if (isBeef) {
      const beefDishes = [
        {
          name: '달콤 짭조름한 궁중 소불고기 버섯전골',
          category: '전골/일품 요리',
          time: '20분',
          cal: 510,
          shop: ['모둠 버섯 1팩', '대파 1단'],
          steps: [
            { step_number: 1, highlight_action: '소불고기 양념', action: '소고기에 진간장 3T, 설탕 1.5T, 다진마늘 1T, 참기름 1T, 배즙(또는 맛술)을 재웁니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '전골 냄비 담기', action: '전골 냄비에 양념 소고기와 버섯, 양파, 대파를 둘러 담고 물 400ml를 붓습니다.', timer_seconds: 120 },
            { step_number: 3, highlight_action: '보글보글 끓이기', action: '센 불로 끓이다가 끓어오르면 중약불에서 7분간 끓여 깊은 국물 맛을 냅니다.', timer_seconds: 420 },
          ],
          tips: ['당면을 미리 불려두었다가 함께 넣으면 최고의 별미', '참소스나 와사비 간장에 찍어드세요.'],
        },
        {
          name: '차돌박이 애호박 된장찌개 & 계란말이',
          category: '국/찌개 & 밥상',
          time: '15분',
          cal: 440,
          shop: ['두부 1모', '애호박 1개'],
          steps: [
            { step_number: 1, highlight_action: '차돌박이 볶기', action: '냄비에 차돌박이를 넣고 중불에서 핏기가 가실 때까지 2분간 볶아 기름을 냅니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '된장 육수 풀기', action: '물 500ml를 붓고 재래식 된장 2T를 푼 뒤 센 불에서 팔팔 끓입니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '채소 넣고 끓이기', action: '애호박과 두부를 깍둑썰어 넣고 중약불에서 6분간 끓여 완성합니다.', timer_seconds: 360 },
          ],
          tips: ['쌈장 0.5T를 섞으면 고깃집 된장찌개 맛이 납니다.', '청양고추로 칼칼함을 조절하세요.'],
        },
        {
          name: '소고기 찹스테이크 & 알록달록 구운 채소',
          category: '양식/일품 요리',
          time: '15분',
          cal: 530,
          shop: ['파프리카 1개', '양파 1개'],
          steps: [
            { step_number: 1, highlight_action: '고기 밑간', action: '소고기를 깍둑썰기하고 소금, 후추, 올리브유를 둘러 5분간 밑간합니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '센불 시어링', action: '달군 팬에 버터 1조각을 녹이고 소고기를 센 불에서 3분간 노릇하게 굽습니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '소스 졸이기', action: '채소와 돈까스소스 2T, 굴소스 1T, 케첩 1T를 넣고 중불에서 2분간 빠르게 볶아냅니다.', timer_seconds: 120 },
          ],
          tips: ['고기를 너무 오래 익히지 않아야 육즙이 촉촉합니다.', '홀그레인 머스터드와 함께 드세요.'],
        },
        {
          name: '맑고 깊은 소고기 뭇국 & 감자채전',
          category: '국/찌개 요리',
          time: '20분',
          cal: 420,
          shop: ['무 1/3개', '부침가루 1봉'],
          steps: [
            { step_number: 1, highlight_action: '참기름에 볶기', action: '냄비에 참기름 1T를 두르고 소고기와 나박썬 무를 중불에서 3분간 달달 볶습니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '푹 끓이기', action: '물 700ml를 붓고 끓어오르면 거품을 걷어내며 중약불에서 12분간 푹 끓입니다.', timer_seconds: 720 },
            { step_number: 3, highlight_action: '간 맞추기', action: '국간장 1.5T와 다진마늘 0.5T, 대파를 넣고 2분간 더 끓여 마무리합니다.', timer_seconds: 120 },
          ],
          tips: ['소고기와 무를 충분히 볶아야 국물이 뽀얗고 깊어집니다.', '후추를 톡톡 뿌려 드세요.'],
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
    } else if (isChicken) {
      const chickenDishes = [
        {
          name: '매콤 칼칼한 밥도둑 닭볶음탕',
          category: '조림/탕 요리',
          time: '25분',
          cal: 520,
          shop: ['감자 2개', '당근 1개'],
          steps: [
            { step_number: 1, highlight_action: '닭 데치기', action: '끓는 물에 닭고기를 2분간 가볍게 데쳐 불순물을 씻어냅니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '양념장 붓기', action: '고추장 2T, 고춧가루 2T, 진간장 3T, 설탕 1.5T, 마늘 1.5T와 물 500ml를 붓습니다.', timer_seconds: 120 },
            { step_number: 3, highlight_action: '푹 조리기', action: '감자와 당근을 넣고 뚜껑을 덮어 중약불에서 18분간 국물이 걸쭉해지도록 조립니다.', timer_seconds: 1080 },
          ],
          tips: ['설탕을 양념 초반에 넣어야 단맛이 고기에 쏙 뱁니다.', '남은 국물에 볶음밥은 필수!'],
        },
        {
          name: '달콤 짭조름한 안동식 간장 찜닭 & 당면',
          category: '조림/일품 요리',
          time: '22분',
          cal: 510,
          shop: ['납작당면 1봉', '양파 1개'],
          steps: [
            { step_number: 1, highlight_action: '간장 소스 만들기', action: '진간장 4T, 굴소스 1T, 올리고당 2T, 다진마늘 1T, 맛술 2T를 섞어 소스를 준비합니다.', timer_seconds: 120 },
            { step_number: 2, highlight_action: '닭고기 조리기', action: '냄비에 닭과 물 400ml, 소스를 붓고 센 불에서 끓이다 중불로 12분간 조립니다.', timer_seconds: 720 },
            { step_number: 3, highlight_action: '당면 넣기', action: '불려둔 당면과 채소를 넣고 국물이 자작해질 때까지 5분간 더 끓여 완성합니다.', timer_seconds: 300 },
          ],
          tips: ['건고추(베트남고추) 2개를 넣으면 칼칼한 전문점 맛 완성', '당면은 미지근한 물에 30분 불려두세요.'],
        },
        {
          name: '춘천식 매콤 닭갈비 & 향긋한 깻잎 쌈',
          category: '볶음 요리',
          time: '18분',
          cal: 480,
          shop: ['양배추 1/4통', '깻잎 2묶음'],
          steps: [
            { step_number: 1, highlight_action: '닭고기 양념', action: '닭고기를 한 입 크기로 썰고 고추장 2T, 간장 1.5T, 고춧가루 1.5T, 설탕 1T에 재웁니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '팬에 볶기', action: '팬에 기름을 두르고 양념 닭과 양배추, 고구마를 넣어 중불에서 7분간 볶습니다.', timer_seconds: 420 },
            { step_number: 3, highlight_action: '깻잎 얹기', action: '불을 끄고 깻잎을 큼직하게 찢어 넣고 참기름을 둘러 향을 입힙니다.', timer_seconds: 60 },
          ],
          tips: ['카레가루 0.5T를 양념에 섞으면 풍미가 확 살아납니다.', '피자치즈를 솔솔 뿌려도 좋습니다.'],
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
    } else {
      // General rich home-cooked meal spectrum (stews, roasts, pancakes, curries)
      const generalDishes = [
        {
          name: '구수한 차돌 애호박 된장찌개 & 계란말이',
          category: '국/찌개 & 밥상',
          time: '15분',
          cal: 430,
          shop: ['차돌박이 200g', '애호박 1개'],
          steps: [
            { step_number: 1, highlight_action: '재료 손질', action: '애호박과 두부를 1.5cm 큐브로 깍둑썰기하고 대파를 송송 썹니다.', timer_seconds: 0 },
            { step_number: 2, highlight_action: '육수 끓이기', action: '물 500ml에 된장 2T를 풀고 차돌박이를 넣어 센 불로 끓입니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '채소 넣고 완성', action: '애호박, 두부, 대파를 넣고 중약불에서 7분간 보글보글 끓여냅니다.', timer_seconds: 420 },
          ],
          tips: ['쌈장 0.5T를 더하면 고깃집 된장찌개 맛이 납니다.'],
        },
        {
          name: '바삭 고소한 감자채전 & 맑은 순두부 계란국',
          category: '별미/전 요리',
          time: '15분',
          cal: 410,
          shop: ['부침가루 1봉', '순두부 1봉'],
          steps: [
            { step_number: 1, highlight_action: '감자 채썰기', action: '감자를 가늘게 채썰어 전분기를 가볍게 털고 소금 한 꼬집으로 밑간합니다.', timer_seconds: 0 },
            { step_number: 2, highlight_action: '노릇하게 굽기', action: '팬에 식용유를 넉넉히 두르고 감자채를 넓게 펴서 중불로 4분간 바삭하게 부칩니다.', timer_seconds: 240 },
            { step_number: 3, highlight_action: '뒤집기', action: '뒤집어서 반대편도 3분간 노릇노릇하게 구워 완성합니다.', timer_seconds: 180 },
          ],
          tips: ['피자치즈를 토핑하면 퓨전 브런치 감자전으로 변신!'],
        },
        {
          name: '향긋하고 진한 일본식 야채 비프 카레라이스',
          category: '일품 요리',
          time: '18분',
          cal: 490,
          shop: ['카레용 소고기 200g', '양파 1망'],
          steps: [
            { step_number: 1, highlight_action: '양파 캐러멜라이징', action: '팬에 버터를 녹이고 채썬 양파를 갈색빛이 돌 때까지 4분간 볶아 단맛을 냅니다.', timer_seconds: 240 },
            { step_number: 2, highlight_action: '고기 채소 볶기', action: '소고기와 감자, 당근을 넣고 겉면이 익을 때까지 3분간 더 볶습니다.', timer_seconds: 180 },
            { step_number: 3, highlight_action: '카레 끓이기', action: '물 500ml를 붓고 카레가루를 풀어 약불에서 7분간 뭉근하게 끓여냅니다.', timer_seconds: 420 },
          ],
          tips: ['다크 초콜릿 1조각이나 케첩 1T를 넣으면 깊은 풍미 완성'],
        },
        {
          name: '자작하고 매콤한 두부 두루치기 (조림)',
          category: '조림/반찬 요리',
          time: '15분',
          cal: 390,
          shop: ['두부 1모', '대파 1단'],
          steps: [
            { step_number: 1, highlight_action: '두부 부치기', action: '두부를 도톰하게 썰어 들기름을 두른 팬에 앞뒤로 노릇하게 3분간 굽습니다.', timer_seconds: 180 },
            { step_number: 2, highlight_action: '양념장 붓기', action: '간장 2T, 고춧가루 1.5T, 다진마늘 1T, 설탕 0.5T, 물 150ml를 섞어 붓습니다.', timer_seconds: 60 },
            { step_number: 3, highlight_action: '자작하게 조리기', action: '대파와 양파를 얹고 약불에서 국물이 자작해질 때까지 5분간 조려 완성합니다.', timer_seconds: 300 },
          ],
          tips: ['들기름에 부쳐내면 두부의 고소함이 배가됩니다.'],
        },
        {
          name: '불맛 가득 해물 순두부 짜글이',
          category: '국/찌개 요리',
          time: '15분',
          cal: 420,
          shop: ['냉동 해물믹스 1봉', '순두부 1봉'],
          steps: [
            { step_number: 1, highlight_action: '고추기름 내기', action: '냄비에 식용유 2T, 고춧가루 1.5T, 다진마늘을 넣고 약불에서 1분간 볶습니다.', timer_seconds: 60 },
            { step_number: 2, highlight_action: '해물 볶기', action: '해물믹스와 송송 썬 대파를 넣고 센 불에서 2분간 빠르게 볶습니다.', timer_seconds: 120 },
            { step_number: 3, highlight_action: '순두부 조리기', action: '물 200ml와 순두부를 넣고 숟가락으로 큼직하게 으깨며 5분간 끓여 완성합니다.', timer_seconds: 300 },
          ],
          tips: ['마지막에 계란 1알을 톡 깨뜨려 잔열로 익혀 드세요.'],
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

import { MealCartData } from '../types/mealcart';

export function getCoupangSearchUrl(keyword: string): string {
  return `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(keyword)}`;
}

export const INITIAL_MOCK_PLAN: MealCartData = {
  summary_insight: "보유하신 [애호박, 두부, 대파, 계란]을 주초에 집중 소진하고, 대파 1단은 3개 요리에 나누어 사용하여 잔여 쓰레기를 0g으로 설계했습니다.",
  weekly_plan: [
    {
      id: "day-mon",
      day_of_week: "월요일",
      is_dining_out: false,
      menu_name: "차돌박이 애호박 된장찌개 & 계란말이",
      category: "국/찌개 & 든든한 한식",
      cooking_time: "15분",
      image_url: "https://images.unsplash.com/photo-1583032015879-bf6b864a6e87?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: ["두부 1/2모", "애호박 1/2개", "대파 1/3대", "계란 3알"],
      used_shopping_items: ["차돌박이 250g", "찌개용 된장"],
      calories_per_serving: 420,
      alternative_sauces: [
        "된장이 부족할 때: 쌈장 1T + 고춧가루 0.5T 조합 추천",
        "다진마늘 대체: 마늘가루 0.5t 또는 편마늘 2알"
      ],
      recipe_steps: [
        {
          step_number: 1,
          action: "애호박과 두부를 1.5cm 큐브 크기로 깍둑썰기하고, 대파는 어슷썰기합니다.",
          timer_seconds: 0,
          highlight_action: "재료 손질"
        },
        {
          step_number: 2,
          action: "냄비에 차돌박이를 넣고 중불에서 핏기가 가실 때까지 2분간 볶아 고소한 기름을 냅니다.",
          timer_seconds: 120,
          highlight_action: "고기 볶기"
        },
        {
          step_number: 3,
          action: "물 500ml를 붓고 된장 2T를 푼 뒤 센 불로 끓입니다.",
          timer_seconds: 180,
          highlight_action: "육수 끓이기"
        },
        {
          step_number: 4,
          action: "국물이 끓어오르면 썰어둔 애호박, 두부, 대파를 넣고 중약불에서 7분간 보글보글 끓여 완성합니다.",
          timer_seconds: 420,
          highlight_action: "완성 끓이기"
        }
      ]
    },
    {
      id: "day-tue",
      day_of_week: "화요일",
      is_dining_out: false,
      menu_name: "매콤 달콤 파기름 제육볶음 & 쌈채소",
      category: "볶음 요리",
      cooking_time: "20분",
      image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: ["대파 1/3대", "양파 1/2개", "다진마늘 1T"],
      used_shopping_items: ["돼지고기 앞다리살 400g", "모둠 쌈채소 1팩"],
      calories_per_serving: 510,
      alternative_sauces: [
        "고추장이 없을 때: 고춧가루 2T + 간장 2T + 올리고당 1.5T",
        "맛술 대체: 미림 1T 또는 소주 1T + 설탕 약간"
      ],
      recipe_steps: [
        {
          step_number: 1,
          action: "돼지고기 앞다리살을 먹기 좋은 크기로 썰고 고추장 2T, 진간장 1T, 설탕 1T, 다진마늘에 10분간 재워둡니다.",
          timer_seconds: 600,
          highlight_action: "고기 양념 재우기"
        },
        {
          step_number: 2,
          action: "팬에 식용유를 두르고 송송 썬 대파를 볶아 은은한 파기름을 냅니다.",
          timer_seconds: 120,
          highlight_action: "파기름 내기"
        },
        {
          step_number: 3,
          action: "양념한 고기를 넣고 센 불에서 5분간 육즙을 가두며 빠르게 볶아냅니다.",
          timer_seconds: 300,
          highlight_action: "센불 볶기"
        },
        {
          step_number: 4,
          action: "양파를 넣고 2분간 더 볶은 뒤 통깨를 뿌려 쌈채소와 함께 냅니다.",
          timer_seconds: 120,
          highlight_action: "마무리"
        }
      ]
    },
    {
      id: "day-wed",
      day_of_week: "수요일",
      is_dining_out: true,
      menu_name: "수요 힐링 외식 / 배달 데이 🍕",
      category: "외식 및 배달",
      cooking_time: "0분",
      image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: [],
      used_shopping_items: [],
      calories_per_serving: 0,
      alternative_sauces: [],
      recipe_steps: [
        {
          step_number: 1,
          action: "주중 피로를 풀고 가족과 함께 즐거운 외식 또는 좋아하는 배달 메뉴를 즐기세요!",
          timer_seconds: 0,
          highlight_action: "외식 데이"
        }
      ]
    },
    {
      id: "day-thu",
      day_of_week: "목요일",
      is_dining_out: false,
      menu_name: "애호박 명란 새우젓 볶음 & 맑은 순두부 계란국",
      category: "초간단 저염 반찬 & 탕",
      cooking_time: "15분",
      image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: ["애호박 1/2개 (보관분)", "계란 2알", "대파 약간"],
      used_shopping_items: ["순두부 1봉", "새우젓 또는 저염 명란"],
      calories_per_serving: 320,
      alternative_sauces: [
        "새우젓 대체: 액젓(멸치/까나리) 0.5T + 소금 한 꼬집",
        "순두부 양념간장: 양조간장 1T + 참기름 0.5T + 고춧가루 약간"
      ],
      recipe_steps: [
        {
          step_number: 1,
          action: "남은 애호박 반 개를 반달썰기하고, 순두부는 큼직하게 썰어둡니다.",
          timer_seconds: 0,
          highlight_action: "재료 썰기"
        },
        {
          step_number: 2,
          action: "팬에 들기름을 두르고 애호박과 새우젓 1t를 넣어 중불에서 3분간 나른해질 때까지 볶습니다.",
          timer_seconds: 180,
          highlight_action: "호박 볶기"
        },
        {
          step_number: 3,
          action: "다른 냄비에 물 400ml와 다시마를 넣고 끓이다 순두부와 계란을 풀어 3분간 끓입니다.",
          timer_seconds: 180,
          highlight_action: "순두부국 끓이기"
        }
      ]
    },
    {
      id: "day-fri",
      day_of_week: "금요일",
      is_dining_out: false,
      menu_name: "불맛 해물 순두부 짜글이 & 두부김치",
      category: "원팬 요리 & 불금 별미",
      cooking_time: "18분",
      image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: ["두부 1/2모 (남은 잔여분)", "대파 1/3대 (최종 소진)", "익은 김치 1공기"],
      used_shopping_items: ["냉동 해물믹스 200g"],
      calories_per_serving: 380,
      alternative_sauces: [
        "해물믹스 대체: 캔참치 1캔 또는 훈제오리 150g 활용 가능",
        "불맛 내기: 고춧가루를 기름에 먼저 볶아 고추기름 형성"
      ],
      recipe_steps: [
        {
          step_number: 1,
          action: "팬에 식용유 2T와 고춧가루 1.5T, 대파를 넣고 약불에서 1분간 볶아 매콤한 고추기름을 만듭니다.",
          timer_seconds: 60,
          highlight_action: "고추기름"
        },
        {
          step_number: 2,
          action: "신김치와 해물믹스를 넣고 3분간 볶아 감칠맛을 배가시킵니다.",
          timer_seconds: 180,
          highlight_action: "재료 볶기"
        },
        {
          step_number: 3,
          action: "물 250ml와 두부를 넣고 숟가락으로 으깨며 자작하게 5분간 조려 완성합니다.",
          timer_seconds: 300,
          highlight_action: "짜글이 조리기"
        }
      ]
    },
    {
      id: "day-sat",
      day_of_week: "토요일",
      is_dining_out: false,
      menu_name: "훈제오리 부추 볶음 & 무쌈 롤",
      category: "주말 특식",
      cooking_time: "15분",
      image_url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: ["양파 1/2개", "다진마늘 1t"],
      used_shopping_items: ["훈제오리 400g", "영양부추 1단", "쌈무 1팩"],
      calories_per_serving: 490,
      alternative_sauces: [
        "허니머스터드 소스: 머스터드 2T + 꿀 1T + 마요네즈 0.5T",
        "부추 무침 양념: 고춧가루 1T + 액젓 1T + 참기름 1T"
      ],
      recipe_steps: [
        {
          step_number: 1,
          action: "영양부추는 5cm 길이로 썰고 양파는 얇게 채썰어 준비합니다.",
          timer_seconds: 0,
          highlight_action: "채소 준비"
        },
        {
          step_number: 2,
          action: "달군 팬에 훈제오리를 굽다가 나오는 기름을 키친타월로 가볍게 닦아내며 4분간 노릇하게 굽습니다.",
          timer_seconds: 240,
          highlight_action: "오리 굽기"
        },
        {
          step_number: 3,
          action: "불을 끄고 잔열에서 부추와 양파를 넣고 가볍게 30초간 버무려 숨만 죽입니다.",
          timer_seconds: 30,
          highlight_action: "부추 버무리기"
        }
      ]
    },
    {
      id: "day-sun",
      day_of_week: "일요일",
      is_dining_out: false,
      menu_name: "주말 냉장고 털이 야채 계란 볶음밥 & 김치전",
      category: "Zero-Waste 클리어 요리",
      cooking_time: "15분",
      image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
      used_pantry_items: ["계란 2알", "남은 자투리 채소 전량", "찬밥 2공기"],
      used_shopping_items: [],
      calories_per_serving: 450,
      alternative_sauces: [
        "굴소스가 없을 때: 진간장 1T + 설탕 0.5t + 참기름 0.5T",
        "버터 1조각 추가 시 풍미 극대화"
      ],
      recipe_steps: [
        {
          step_number: 1,
          action: "한 주간 쓰고 남은 자투리 채소(양파, 대파, 버섯 등)를 잘게 다집니다.",
          timer_seconds: 0,
          highlight_action: "자투리 다지기"
        },
        {
          step_number: 2,
          action: "팬에 기름을 두르고 스크램블 에그를 만들어 잠시 덜어둡니다.",
          timer_seconds: 90,
          highlight_action: "계란 스크램블"
        },
        {
          step_number: 3,
          action: "다진 채소를 볶다가 찬밥과 굴소스 1T를 넣고 센 불에 3분간 고슬고슬하게 볶아 계란을 합칩니다.",
          timer_seconds: 180,
          highlight_action: "밥 볶기"
        }
      ]
    }
  ],
  smart_cart: {
    vegetables: [
      {
        id: "v-1",
        name: "모둠 쌈채소 1팩",
        quantity: "1팩 (약 200g)",
        purchase_url: getCoupangSearchUrl("모둠 쌈채소"),
        checked: false
      },
      {
        id: "v-2",
        name: "영양부추 1단",
        quantity: "1단",
        purchase_url: getCoupangSearchUrl("영양부추"),
        checked: false
      },
      {
        id: "v-3",
        name: "양파 1망 (소)",
        quantity: "1망 (3~4입)",
        purchase_url: getCoupangSearchUrl("양파"),
        checked: false
      }
    ],
    meat_seafood: [
      {
        id: "m-1",
        name: "차돌박이 (구이/찌개용)",
        quantity: "250g~300g",
        purchase_url: getCoupangSearchUrl("차돌박이"),
        checked: false
      },
      {
        id: "m-2",
        name: "국내산 돼지 앞다리살 (불고기용)",
        quantity: "400g",
        purchase_url: getCoupangSearchUrl("돼지고기 앞다리살 불고기용"),
        checked: false
      },
      {
        id: "m-3",
        name: "훈제오리 슬라이스",
        quantity: "400g 1팩",
        purchase_url: getCoupangSearchUrl("훈제오리 슬라이스"),
        checked: false
      },
      {
        id: "m-4",
        name: "냉동 해물믹스",
        quantity: "1봉 (약 400g)",
        purchase_url: getCoupangSearchUrl("냉동 해물믹스"),
        checked: false
      }
    ],
    sauce_pantry: [
      {
        id: "s-1",
        name: "순두부 1봉",
        quantity: "350g 1봉",
        purchase_url: getCoupangSearchUrl("순두부"),
        checked: false
      },
      {
        id: "s-2",
        name: "새우젓 또는 맛있는 쌈무",
        quantity: "1통",
        purchase_url: getCoupangSearchUrl("쌈무"),
        checked: false
      }
    ]
  },
  storage_guides: [
    {
      id: "st-1",
      item: "남은 애호박 (1/2개)",
      tip: "자른 단면에 랩을 밀착시켜 채소칸에 냉장 보관하고 목요일 전/볶음 요리에 100% 소진하세요.",
      urgency: "high"
    },
    {
      id: "st-2",
      item: "대파 1단 구매분",
      tip: "초록 잎과 흰 대를 분리하여 세척 후 물기를 완전히 제거하고, 송송 썰어 밀폐용기에 키친타월을 깔아 냉동 보관하면 한 달간 신선합니다.",
      urgency: "medium"
    },
    {
      id: "st-3",
      item: "남은 두부 (1/2모)",
      tip: "밀폐용기에 두부가 잠길 정도로 생수를 붓고 소금 반 티스푼을 넣은 후 뚜껑을 닫아 냉장 보관하면 3~4일간 신선도가 유지됩니다.",
      urgency: "high"
    }
  ]
};

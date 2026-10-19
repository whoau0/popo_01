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
      golden_ratio_sauce: {
        sauce_name: "백종원식 차돌 된장찌개 비법 배합표",
        ingredients: [
          { name: "재래식 집된장", amount: "2큰술 (30g)" },
          { name: "시판 쌈장 (감칠맛)", amount: "0.5큰술 (8g)" },
          { name: "고춧가루 (칼칼함)", amount: "1큰술 (10g)" },
          { name: "다진 마늘", amount: "1큰술 (15g)" },
          { name: "국간장 (간 맞추기)", amount: "0.5큰술 (7ml)" }
        ],
        mixing_tip: "된장과 쌈장을 4:1 비율로 섞고 고춧가루를 함께 미리 개어두면, 텁텁함 없이 고깃집 특유의 깊고 진한 감칠맛이 폭발합니다.",
        taste_kick: "맛의 킥: 맹물 대신 쌀뜨물 500ml를 붓고, 끓어오를 때 설탕 1/3작은술을 넣으면 된장의 떫고 쓴맛이 마법처럼 사라집니다."
      },
      alternative_sauces: [
        "된장이 부족할 때: 쌈장 1.5T + 고춧가루 0.5T로 대체 가능",
        "다진마늘 대체: 편마늘 3알 또는 마늘가루 0.5t"
      ],
      recipe_steps: [
        {
          step_number: 1,
          highlight_action: "재료 정밀 손질",
          heat_level: "잔열/뜸",
          action: "애호박과 두부는 1.5cm 정육면체 크기로 깍둑썰기하고, 대파와 청양고추는 0.5cm 두께로 어슷썰어 준비합니다.",
          tip: "두부는 키친타월에 올려 여분의 수분을 살짝 빼주면 찌개가 끓을 때 국물이 탁해지지 않습니다.",
          timer_seconds: 0
        },
        {
          step_number: 2,
          highlight_action: "차돌박이 소기름 내기",
          heat_level: "중불",
          action: "달군 뚝배기나 냄비에 식용유 없이 차돌박이를 넣고 중불에서 핏기가 가실 때까지 2분간 볶아 고소한 소기름을 충분히 냅니다.",
          tip: "차돌박이 자체에서 기름이 풍부하게 나오므로 식용유를 두르지 않아야 국물이 느끼하지 않고 고소합니다.",
          timer_seconds: 120
        },
        {
          step_number: 3,
          highlight_action: "파 고추기름 형성",
          heat_level: "약불",
          action: "나온 차돌 기름에 썰어둔 대파와 고춧가루 1큰술을 넣고 약불에서 1분간 살살 볶아 붉은 파 고추기름 향을 입힙니다.",
          tip: "고춧가루는 센 불에 닿으면 10초 만에 타고 쓴맛이 나므로 반드시 불을 약하게 낮추고 볶아주세요.",
          timer_seconds: 60
        },
        {
          step_number: 4,
          highlight_action: "쌀뜨물 & 황금 양념 풀기",
          heat_level: "강불",
          action: "쌀뜨물 500ml를 붓고 준비한 황금 양념장(된장 2T, 쌈장 0.5T, 다진마늘 1T)을 거름망에 살살 풀어 넣은 뒤 센 불로 팔팔 끓입니다.",
          tip: "거름망을 이용해 된장 콩 찌꺼기를 걸러주면 식당처럼 맑고 깔끔한 국물이 완성됩니다.",
          timer_seconds: 180
        },
        {
          step_number: 5,
          highlight_action: "애호박·두부 조리기",
          heat_level: "중불",
          action: "국물이 팔팔 끓어오르면 썰어둔 애호박과 두부를 넣고 중불로 줄여 5분간 재료 속까지 간이 푹 배도록 보글보글 끓입니다.",
          tip: "표면에 떠오르는 핏물 거품을 한두 번 숟가락으로 걷어내면 더욱 담백하고 개운한 맛이 납니다.",
          timer_seconds: 300
        },
        {
          step_number: 6,
          highlight_action: "마무리 향 & 계란말이 곁들이기",
          heat_level: "약불",
          action: "마지막으로 대파 푸른 잎과 청양고추를 넣고 약불에서 1분간 살짝 끓여 풍미를 올린 뒤 불을 끄고 포슬포슬한 계란말이와 함께 상에 올립니다.",
          tip: "된장은 오래 끓일수록 염도가 올라가므로 마지막 채소를 넣고 1분 내외로 끓인 뒤 불을 끄는 것이 가장 맛있습니다.",
          timer_seconds: 60
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
      golden_ratio_sauce: {
        sauce_name: "류수영·백종원식 불맛 제육 황금 양념장",
        ingredients: [
          { name: "고추장", amount: "2큰술 (35g)" },
          { name: "진간장 (양조간장)", amount: "2큰술 (30ml)" },
          { name: "고춧가루", amount: "2큰술 (20g)" },
          { name: "황설탕 (연육)", amount: "1.5큰술 (18g)" },
          { name: "다진 마늘", amount: "1.5큰술 (20g)" },
          { name: "맛술 (미림)", amount: "2큰술 (30ml)" },
          { name: "물엿 또는 올리고당", amount: "1큰술 (15g)" },
          { name: "참기름 & 후추", amount: "참기름 1큰술, 후추 3톡" }
        ],
        mixing_tip: "양념 재료를 볼에 한데 넣고 설탕이 완전히 녹을 때까지 저어준 뒤 10분간 상온 숙성하면 고춧가루가 불어 색감이 곱고 고기에 착 달라붙습니다.",
        taste_kick: "맛의 킥: 고기를 볶기 전 설탕 1큰술을 고기에 먼저 뿌려 조물조물 버무려두면 연육 작용으로 고기가 부드러워지고 양념이 쏙 뱁니다."
      },
      alternative_sauces: [
        "고추장이 없을 때: 고춧가루 2.5T + 간장 2.5T + 굴소스 0.5T 조합 추천",
        "맛술 대체: 소주 2T + 설탕 0.5t"
      ],
      recipe_steps: [
        {
          step_number: 1,
          highlight_action: "고기 핏물 제거 & 설탕 밑간",
          heat_level: "잔열/뜸",
          action: "돼지고기 앞다리살을 한입 크기로 썰어 키친타월로 핏물을 톡톡 닦아내고, 설탕 1큰술과 맛술 1큰술을 먼저 뿌려 5분간 버무려둡니다.",
          tip: "설탕 분자가 소금보다 크기 때문에 단맛을 먼저 침투시켜야 육질이 촉촉해지고 잡내가 잡힙니다.",
          timer_seconds: 300
        },
        {
          step_number: 2,
          highlight_action: "황금 양념 숙성 버무리기",
          heat_level: "잔열/뜸",
          action: "미리 개어둔 황금 양념장(고추장 2T, 진간장 2T, 고춧가루 2T, 다진마늘 1.5T, 올리고당 1T)을 고기에 넣고 손으로 주물러 5분간 재웁니다.",
          tip: "양념을 겉돌지 않게 손끝으로 꾹꾹 눌러가며 치대주면 고기 깊숙이 간이 배어듭니다.",
          timer_seconds: 300
        },
        {
          step_number: 3,
          highlight_action: "대파 기름 불맛 베이스",
          heat_level: "중불",
          action: "팬에 식용유 2큰술을 두르고 송송 썬 대파를 듬뿍 넣어 중불에서 2분간 대파 테두리가 노릇해질 때까지 파기름을 냅니다.",
          tip: "팬을 달구기 전에 차가운 기름과 대파를 함께 넣고 가열해야 파의 달콤한 향이 기름에 깊게 스며듭니다.",
          timer_seconds: 120
        },
        {
          step_number: 4,
          highlight_action: "센불 마이야르 볶기",
          heat_level: "강불",
          action: "불을 센 불로 최대한 올리고 양념한 고기를 팬에 넓게 펼칩니다. 바로 젓지 말고 1분간 지진 뒤 4분간 집게로 빠르게 뒤집으며 볶아냅니다.",
          tip: "처음에 바로 뒤적이면 육즙이 빠져나와 물이 생깁니다. 센 불에서 아랫면을 노릇하게 누룽지처럼 눌러주는 것이 불맛의 핵심입니다.",
          timer_seconds: 300
        },
        {
          step_number: 5,
          highlight_action: "양파 투하 & 아삭함 살리기",
          heat_level: "강불",
          action: "채 썬 양파와 남은 대파를 넣고 센 불을 유지하며 2분간 양파 숨이 살짝 죽을 때까지만 재빠르게 볶습니다.",
          tip: "양파를 너무 오래 볶으면 물이 흥건해지므로 살짝 투명해지자마자 불을 끄는 타이밍을 지키세요.",
          timer_seconds: 120
        },
        {
          step_number: 6,
          highlight_action: "불 끄고 참기름 코팅",
          heat_level: "잔열/뜸",
          action: "불을 완전히 끄고 참기름 1큰술과 통깨를 둘러 잔열로 가볍게 버무린 뒤, 깨끗이 씻은 쌈채소와 쌈장을 곁들여 풍성하게 상을 차립니다.",
          tip: "참기름은 열에 약하므로 반드시 불을 끈 상태에서 마지막에 둘러야 고소한 풍미가 극대화됩니다.",
          timer_seconds: 30
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
          highlight_action: "외식 & 힐링",
          action: "주중 피로를 풀고 가족과 함께 즐거운 외식 또는 좋아하는 배달 메뉴를 즐기세요!",
          timer_seconds: 0
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
      golden_ratio_sauce: {
        sauce_name: "들기름 새우젓 애호박 감칠맛 황금 배합",
        ingredients: [
          { name: "새우젓 (국물 포함)", amount: "1작은술 (5g)" },
          { name: "전통 들기름", amount: "1.5큰술 (20ml)" },
          { name: "다진 마늘", amount: "0.5큰술 (7g)" },
          { name: "국간장 (순두부국용)", amount: "1큰술 (15ml)" },
          { name: "멸치액젓 또는 참치액", amount: "0.5작은술 (3ml)" }
        ],
        mixing_tip: "애호박은 소금으로 간하는 것보다 새우젓으로 간을 해야 단맛과 시원한 감칠맛이 최고조로 올라갑니다.",
        taste_kick: "맛의 킥: 순두부국 국물에 참치액이나 멸치액젓 반 티스푼을 넣으면 조미료 없이도 깊은 식당 육수 맛이 완성됩니다."
      },
      alternative_sauces: [
        "새우젓 대체: 액젓(멸치/까나리) 0.5T + 소금 한 꼬집",
        "순두부 양념간장: 양조간장 1T + 참기름 0.5T + 고춧가루 약간"
      ],
      recipe_steps: [
        {
          step_number: 1,
          highlight_action: "애호박 도톰 반달썰기",
          heat_level: "잔열/뜸",
          action: "애호박은 0.5cm 두께로 도톰하게 반달썰기하고, 순두부는 2cm 간격으로 큼직하게 썰어둡니다.",
          tip: "호박을 너무 얇게 썰면 볶을 때 쉽게 뭉개지므로 적당한 두께감을 유지해주세요.",
          timer_seconds: 0
        },
        {
          step_number: 2,
          highlight_action: "들기름 마늘 향내기",
          heat_level: "중불",
          action: "팬에 들기름 1.5큰술과 다진마늘 0.5큰술을 넣고 중불에서 마늘 향이 은은하게 올라올 때까지 1분간 볶습니다.",
          tip: "들기름은 발연점이 낮으므로 센 불 대신 중불이나 중약불에서 조리해야 영양과 향이 보존됩니다.",
          timer_seconds: 60
        },
        {
          step_number: 3,
          highlight_action: "애호박 나른하게 볶기",
          heat_level: "중불",
          action: "썰어둔 애호박을 넣고 중불에서 2분간 기름 코팅을 입히며 볶다가 새우젓 1작은술을 넣고 고루 섞어줍니다.",
          tip: "새우젓 건더기를 칼등으로 가볍게 다져 넣으면 짠맛이 뭉치지 않고 고르게 퍼집니다.",
          timer_seconds: 120
        },
        {
          step_number: 4,
          highlight_action: "물 2큰술 뜸들이기",
          heat_level: "약불",
          action: "물 2큰술을 붓고 뚜껑을 덮은 뒤 약불에서 2분간 수증기로 호박 속까지 투명하고 촉촉하게 익혀 접시에 담습니다.",
          tip: "수분으로 뜸을 들이면 기름을 많이 쓰지 않고도 애호박이 촉촉하고 달콤하게 익습니다.",
          timer_seconds: 120
        },
        {
          step_number: 5,
          highlight_action: "순두부 맑은 육수 끓이기",
          heat_level: "강불",
          action: "냄비에 물 500ml와 다시마 1조각, 국간장 1큰술, 액젓 0.5작은술을 넣고 센 불로 끓입니다.",
          tip: "육수가 팔팔 끓어오르면 다시마를 건져내야 끈적이지 않고 맑고 개운합니다.",
          timer_seconds: 180
        },
        {
          step_number: 6,
          highlight_action: "순두부 투하 & 계란물 굳히기",
          heat_level: "중불",
          action: "순두부를 큼직하게 넣고, 푼 계란물을 둘러 부은 뒤 젓지 않고 1분간 몽글몽글 굳힌 후 대파와 후추로 마무리합니다.",
          tip: "계란물을 붓고 바로 저으면 국물이 탁해지니, 계란이 표면에서 스스로 익을 때까지 기다려주세요.",
          timer_seconds: 90
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
      golden_ratio_sauce: {
        sauce_name: "만능 불맛 순두부 고추기름 짜글이 양념표",
        ingredients: [
          { name: "고춧가루", amount: "2큰술 (20g)" },
          { name: "진간장", amount: "1.5큰술 (22ml)" },
          { name: "굴소스 (비법 감칠맛)", amount: "1큰술 (15g)" },
          { name: "식용유 (고추기름용)", amount: "2큰술 (30ml)" },
          { name: "다진 마늘", amount: "1큰술 (15g)" },
          { name: "설탕 (신맛 중화)", amount: "0.5작은술 (3g)" },
          { name: "후춧가루 & 참기름", amount: "후추 4톡, 참기름 0.5큰술" }
        ],
        mixing_tip: "식용유 2큰술과 고춧가루 2큰술, 다진마늘을 팬에서 약불로 볶아 즉석 고추기름을 낸 뒤 굴소스와 간장을 섞어주면 전문점 짬뽕 순두부 불맛이 납니다.",
        taste_kick: "맛의 킥: 굴소스 1큰술과 마지막에 후추를 넉넉히 톡톡 뿌려주면 해물의 비린내는 잡히고 얼큰한 감칠맛이 폭발합니다."
      },
      alternative_sauces: [
        "해물믹스 대체: 캔참치 1캔 또는 훈제오리 150g 활용 가능",
        "굴소스 대체: 진간장 1T + 다시다 0.5t"
      ],
      recipe_steps: [
        {
          step_number: 1,
          highlight_action: "두부 데치기 & 신김치 준비",
          heat_level: "잔열/뜸",
          action: "두부 1/2모는 끓는 물에 1분간 데쳐 부드러운 두부김치용으로 도톰하게 썰어두고, 신김치와 대파는 송송 썹니다.",
          tip: "두부를 따뜻한 물에 데쳐두면 탄력이 생겨 잘 부서지지 않고 온기가 유지됩니다.",
          timer_seconds: 60
        },
        {
          step_number: 2,
          highlight_action: "즉석 파 고추기름 내기",
          heat_level: "약불",
          action: "냄비에 식용유 2큰술, 다진마늘 1큰술, 대파, 고춧가루 2큰술을 넣고 약불에서 1분 30초간 타지 않게 저어가며 고추기름을 뽑아냅니다.",
          tip: "절대 불을 세게 하지 마세요! 약불에서 기름에 붉은색이 고르게 배어 나올 때까지 볶습니다.",
          timer_seconds: 90
        },
        {
          step_number: 3,
          highlight_action: "신김치 & 해물 달달 볶기",
          heat_level: "중불",
          action: "송송 썬 신김치와 해물믹스를 넣고 중불에서 3분간 볶아 해물의 수분을 날리고 김치에 매콤한 기름 코팅을 입힙니다.",
          tip: "신김치의 군내가 걱정된다면 설탕 반 작은술을 함께 넣어 볶아주면 신맛이 깔끔하게 잡힙니다.",
          timer_seconds: 180
        },
        {
          step_number: 4,
          highlight_action: "자작한 물 & 굴소스 투하",
          heat_level: "강불",
          action: "물 250ml(종이컵 1컵 반)를 붓고 굴소스 1큰술과 진간장 1.5큰술을 넣은 뒤 센 불로 팔팔 끓입니다.",
          tip: "짜글이는 국물이 흥건하지 않고 자작해야 맛있으므로 물 양을 꼭 지켜주세요.",
          timer_seconds: 180
        },
        {
          step_number: 5,
          highlight_action: "순두부 으깨기 & 농도 졸이기",
          heat_level: "중약불",
          action: "순두부를 통째로 넣고 주걱으로 큼직하게 툭툭 으깬 뒤, 중약불에서 5분간 국물이 걸쭉해질 때까지 푹 졸여줍니다.",
          tip: "순두부 자체에서 수분이 배어 나오므로 뚜껑을 열고 숟가락으로 국물을 끼얹어가며 졸여줍니다.",
          timer_seconds: 300
        },
        {
          step_number: 6,
          highlight_action: "계란 노른자 & 참기름 마무리",
          heat_level: "잔열/뜸",
          action: "국물이 진하게 졸아들면 계란 노른자 1알을 얹고 참기름 반 스푼, 후추를 뿌려 완성합니다. 데친 두부와 함께 곁들입니다.",
          tip: "따뜻한 두부 위에 매콤한 해물 순두부 짜글이를 얹어 먹으면 불금 최고의 별미입니다.",
          timer_seconds: 30
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
      golden_ratio_sauce: {
        sauce_name: "새콤달콤 허니머스터드 딥소스 & 즉석 부추 겉절이 양념",
        ingredients: [
          { name: "연머스터드 (또는 허니머스터드)", amount: "2큰술 (30g)" },
          { name: "꿀 또는 올리고당", amount: "1큰술 (15g)" },
          { name: "마요네즈 (부드러움)", amount: "1큰술 (15g)" },
          { name: "레몬즙 (또는 식초)", amount: "0.5작은술 (3ml)" },
          { name: "부추 겉절이용 고춧가루·액젓", amount: "고춧가루 1T, 멸치액젓 1T, 참기름 1T" }
        ],
        mixing_tip: "머스터드, 꿀, 마요네즈를 2:1:1로 배합하고 레몬즙을 살짝 더하면 훈제오리의 기름진 맛을 상큼하게 씻어주는 완벽한 디핑소스가 됩니다.",
        taste_kick: "맛의 킥: 훈제오리를 구울 때 편마늘 5~6알을 넣어 오리기름에 마늘을 튀기듯 함께 구우면 잡내 없이 고소한 감칠맛이 폭발합니다."
      },
      alternative_sauces: [
        "마요네즈가 없을 때: 머스터드 2T + 꿀 1.5T + 식초 0.5t",
        "연겨자 소스: 연겨자 1t + 간장 1T + 식초 1T + 설탕 1T"
      ],
      recipe_steps: [
        {
          step_number: 1,
          highlight_action: "부추 & 양파 아삭 손질",
          heat_level: "잔열/뜸",
          action: "영양부추는 5cm 길이로 썰고, 양파는 곱게 채썰어 찬물에 5분간 담가 매운기를 뺀 뒤 물기를 뺍니다.",
          tip: "양파를 찬물에 담가두면 아린 매운맛이 빠지고 식감이 한층 더 아삭아삭해집니다.",
          timer_seconds: 0
        },
        {
          step_number: 2,
          highlight_action: "황금 딥소스 조제",
          heat_level: "잔열/뜸",
          action: "작은 볼에 머스터드 2T, 꿀 1T, 마요네즈 1T, 레몬즙 0.5t를 골고루 섞어 개인용 찍먹 소스를 완성해 둡니다.",
          tip: "취향에 따라 통후추를 갈아 넣으면 풍미가 더욱 고급스러워집니다.",
          timer_seconds: 60
        },
        {
          step_number: 3,
          highlight_action: "오리 기름 빼며 노릇 굽기",
          heat_level: "중불",
          action: "마른 팬에 훈제오리와 편마늘을 겹치지 않게 올리고 중불에서 4분간 노릇하게 굽습니다. 나오는 기름은 키친타월로 닦아냅니다.",
          tip: "오리기름을 70% 정도 키친타월로 닦아내야 느끼하지 않고 겉바속촉 담백한 오리구이가 됩니다.",
          timer_seconds: 240
        },
        {
          step_number: 4,
          highlight_action: "양파 센불 볶아 단맛 내기",
          heat_level: "강불",
          action: "물기를 뺀 양파를 넣고 센 불에서 2분간 양파가 살짝 투명해질 때까지만 빠르게 볶아냅니다.",
          tip: "남아있는 은은한 오리 기름에 양파가 코팅되며 자연스러운 단맛이 극대화됩니다.",
          timer_seconds: 120
        },
        {
          step_number: 5,
          highlight_action: "불 끄고 부추 잔열 버무리기",
          heat_level: "잔열/뜸",
          action: "★가장 중요한 포인트! 반드시 불을 완전히 끈 뒤 썰어둔 부추를 넣고 잔열로 30초만 가볍게 뒤적여 숨을 죽입니다.",
          tip: "부추는 불 위에서 가열하면 질겨지고 물이 생깁니다. 불을 끄고 잔열로 버무려야 파릇파릇 아삭함이 살아있습니다.",
          timer_seconds: 30
        },
        {
          step_number: 6,
          highlight_action: "무쌈 롤링 & 플레이팅",
          heat_level: "잔열/뜸",
          action: "접시에 쌈무를 펴고 노릇한 훈제오리, 아삭한 부추와 양파를 올린 뒤 황금 딥소스를 곁들여 상큼하게 싸 먹습니다.",
          tip: "어른들의 깔끔한 저녁 식사는 물론 아이들도 채소를 맛있게 먹을 수 있는 주말 인기 만점 요리입니다.",
          timer_seconds: 0
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
      golden_ratio_sauce: {
        sauce_name: "중화풍 불맛 간장 굴소스 황금 배합표",
        ingredients: [
          { name: "프리미엄 굴소스", amount: "1큰술 (15g)" },
          { name: "진간장 (눌려 태우기용)", amount: "1큰술 (15ml)" },
          { name: "고소한 참기름", amount: "1큰술 (15ml)" },
          { name: "통깨 & 후추", amount: "통깨 1작은술, 후추 2톡" },
          { name: "바삭 김치전 반죽", amount: "부침가루 1컵, 찬물 1컵, 김칫국물 3T" }
        ],
        mixing_tip: "진간장을 밥 위에 직접 붓지 말고, 팬 가장자리의 빈 공간에 둘러 지글지글 끓여 불맛(간장 눌은 풍미)을 낸 뒤 밥과 섞어야 중국집 볶음밥 맛이 납니다.",
        taste_kick: "맛의 킥: 찬밥을 전자레인지에 30초만 돌려 미지근하게 풀고, 기름에 계란을 먼저 고슬고슬 볶아 덜어두는 것이 밥알이 떡지지 않는 비결입니다."
      },
      alternative_sauces: [
        "굴소스가 없을 때: 진간장 1T + 맛소금 2꼬집 + 참기름 1T",
        "버터 1조각 추가 시 서양식 계란 버터라이스 풍미"
      ],
      recipe_steps: [
        {
          step_number: 1,
          highlight_action: "자투리 채소 쫑쫑 다지기",
          heat_level: "잔열/뜸",
          action: "한 주간 쓰고 남은 자투리 채소(양파, 대파, 버섯, 당근 등)를 0.5cm 크기로 곱게 다져 볼에 모아둡니다.",
          tip: "크기를 균일하게 다져야 익는 속도가 같아지고 밥알과 조화롭게 씹힙니다.",
          timer_seconds: 0
        },
        {
          step_number: 2,
          highlight_action: "촉촉 스크램블 에그 만들기",
          heat_level: "중불",
          action: "팬에 식용유 1큰술을 두르고 계란 2알을 깨 넣은 뒤 중불에서 젓가락으로 빠르게 휘저어 80%만 익었을 때 그릇에 덜어둡니다.",
          tip: "계란을 100% 바싹 익히지 말고 촉촉할 때 덜어두어야 나중에 밥과 합쳤을 때 부드럽습니다.",
          timer_seconds: 90
        },
        {
          step_number: 3,
          highlight_action: "파기름 & 다진 채소 수분 날리기",
          heat_level: "중불",
          action: "팬에 식용유 1큰술을 더 두르고 다진 채소를 모두 넣어 센 불에서 2분 30초간 수분이 완전히 날아갈 때까지 볶습니다.",
          tip: "채소 수분을 바짝 날려주어야 볶음밥이 축축해지지 않고 밥알 하나하나가 고슬고슬 살아납니다.",
          timer_seconds: 150
        },
        {
          step_number: 4,
          highlight_action: "간장 눌리기 & 찬밥 쪼개기",
          heat_level: "강불",
          action: "채소를 한쪽으로 밀고 빈 공간에 진간장 1큰술을 둘러 지글지글 눌으면, 찬밥 2공기와 굴소스 1큰술을 넣고 주걱을 세워 밥알을 쪼개며 볶습니다.",
          tip: "주걱을 눕혀 누르면 밥이 떡지므로, 칼로 자르듯 주걱 날을 세워 밥알을 흩뜨려주세요.",
          timer_seconds: 180
        },
        {
          step_number: 5,
          highlight_action: "스크램블 합체 & 참기름 코팅",
          heat_level: "강불",
          action: "덜어둔 스크램블 에그를 넣고 센 불에서 1분간 빠르게 섞어준 뒤, 불을 끄고 참기름 1큰술과 후추, 통깨를 뿌려 고슬고슬하게 완성합니다.",
          tip: "밥알 하나하나에 계란과 파기름 굴소스가 코팅되어 고소함의 극치를 느낄 수 있습니다.",
          timer_seconds: 60
        },
        {
          step_number: 6,
          highlight_action: "바삭 김치전 곁들이기",
          heat_level: "중강불",
          action: "남은 김치 1공기에 부침가루와 찬물을 1:1로 섞고 김칫국물 3큰술을 넣어 팬에 얇게 편 뒤 앞뒤로 4분간 바삭하게 부쳐 곁들입니다.",
          tip: "반죽에 얼음물이나 탄산수를 쓰면 전집보다 바삭한 김치전이 완성됩니다.",
          timer_seconds: 240
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

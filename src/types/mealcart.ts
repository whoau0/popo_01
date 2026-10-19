export type DayOfWeek = '월요일' | '화요일' | '수요일' | '목요일' | '금요일' | '토요일' | '일요일';

export interface SauceIngredient {
  name: string;
  amount: string;
}

export interface GoldenRatioSauce {
  sauce_name: string;
  ingredients: SauceIngredient[];
  mixing_tip?: string;
  taste_kick?: string;
}

export interface RecipeStep {
  step_number: number;
  action: string;
  timer_seconds: number;
  tip?: string;
  highlight_action?: string;
  heat_level?: '강불' | '중강불' | '중불' | '중약불' | '약불' | '잔열/뜸';
}

export interface MealPlanDay {
  id: string;
  day_of_week: DayOfWeek;
  is_dining_out: boolean;
  menu_name: string;
  category?: string;
  cooking_time: string;
  image_url: string;
  used_pantry_items: string[];
  used_shopping_items: string[];
  recipe_steps: RecipeStep[];
  golden_ratio_sauce?: GoldenRatioSauce;
  alternative_sauces?: string[];
  calories_per_serving?: number;
}

export interface CartItem {
  id: string;
  name: string;
  quantity?: string;
  purchase_url: string;
  checked?: boolean;
}

export interface SmartCart {
  vegetables: CartItem[];
  meat_seafood: CartItem[];
  sauce_pantry: CartItem[];
  processed_others?: CartItem[];
}

export interface StorageGuide {
  id?: string;
  item: string;
  tip: string;
  urgency?: 'high' | 'medium' | 'low';
}

export interface MealCartData {
  weekly_plan: MealPlanDay[];
  smart_cart: SmartCart;
  storage_guides: StorageGuide[];
  summary_insight?: string;
}

export interface UserInputState {
  familySize: string; // "1인", "2인", "3~4인", "5인 이상"
  diningOutDays: DayOfWeek[];
  pantryItems: string[];
  dietaryPreset: string;
  additionalRequests: string;
}

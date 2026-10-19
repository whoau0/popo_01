import React, { useState, useEffect } from 'react';
import { MealCartData, UserInputState, SmartCart as SmartCartType } from './types/mealcart';
import { INITIAL_MOCK_PLAN } from './data/mockData';
import { generateMealCartPlan, getStoredGeminiKey } from './services/geminiService';
import { saveMealPlanToSupabase } from './services/supabaseClient';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { WeeklyCalendar } from './components/WeeklyCalendar';
import { VisualRecipe } from './components/VisualRecipe';
import { SmartCart } from './components/SmartCart';
import { ZeroWasteStorage } from './components/ZeroWasteStorage';
import { SettingsModal } from './components/SettingsModal';
import { ChefHat, ShoppingCart, Leaf, Sparkles, Cpu, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Analytics } from '@vercel/analytics/react';

export function App() {
  const [mealPlanData, setMealPlanData] = useState<MealCartData>(() => {
    const cached = localStorage.getItem('MEALCART_SAVED_PLAN');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed?.weekly_plan?.[0]?.golden_ratio_sauce) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached plan:', e);
      }
    }
    return INITIAL_MOCK_PLAN;
  });

  const [userInput, setUserInput] = useState<UserInputState>({
    familySize: '3~4인',
    diningOutDays: ['수요일'],
    pantryItems: ['애호박 1/2개', '두부 1/2모', '대파 1대', '계란 4알'],
    dietaryPreset: '한식 위주',
    additionalRequests: '',
  });

  const [selectedDayId, setSelectedDayId] = useState<string>('day-mon');
  const [activeTab, setActiveTab] = useState<'recipe' | 'cart' | 'storage'>('recipe');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(!!getStoredGeminiKey());
  const [engineInfo, setEngineInfo] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('MEALCART_SAVED_PLAN', JSON.stringify(mealPlanData));
  }, [mealPlanData]);

  const selectedDay = mealPlanData.weekly_plan.find((d) => d.id === selectedDayId) || mealPlanData.weekly_plan[0];

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const newPlan = await generateMealCartPlan(userInput);
      setMealPlanData(newPlan);

      const firstValidDay = newPlan.weekly_plan.find((d) => !d.is_dining_out) || newPlan.weekly_plan[0];
      if (firstValidDay) {
        setSelectedDayId(firstValidDay.id);
      }

      const engineName = (newPlan as any).engine || 'Gemini AI';
      setEngineInfo(engineName);

      setToastMessage(`🥑 [${userInput.pantryItems.slice(0, 3).join(', ')}] 재료를 반영한 식단표가 완성되었습니다!`);
      setTimeout(() => setToastMessage(null), 5000);

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });

      saveMealPlanToSupabase(newPlan, {
        familySize: userInput.familySize,
        preset: userInput.dietaryPreset,
      });
    } catch (err) {
      console.error('Failed to generate meal plan:', err);
      setToastMessage('⚠️ 식단 생성 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapDays = (sourceId: string, targetId: string) => {
    const sourceIndex = mealPlanData.weekly_plan.findIndex((d) => d.id === sourceId);
    const targetIndex = mealPlanData.weekly_plan.findIndex((d) => d.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedPlan = [...mealPlanData.weekly_plan];
    const sourceDay = updatedPlan[sourceIndex];
    const targetDay = updatedPlan[targetIndex];

    const newSource = {
      ...sourceDay,
      is_dining_out: targetDay.is_dining_out,
      menu_name: targetDay.menu_name,
      category: targetDay.category,
      cooking_time: targetDay.cooking_time,
      image_url: targetDay.image_url,
      used_pantry_items: targetDay.used_pantry_items,
      used_shopping_items: targetDay.used_shopping_items,
      recipe_steps: targetDay.recipe_steps,
      alternative_sauces: targetDay.alternative_sauces,
      calories_per_serving: targetDay.calories_per_serving,
    };

    const newTarget = {
      ...targetDay,
      is_dining_out: sourceDay.is_dining_out,
      menu_name: sourceDay.menu_name,
      category: sourceDay.category,
      cooking_time: sourceDay.cooking_time,
      image_url: sourceDay.image_url,
      used_pantry_items: sourceDay.used_pantry_items,
      used_shopping_items: sourceDay.used_shopping_items,
      recipe_steps: sourceDay.recipe_steps,
      alternative_sauces: sourceDay.alternative_sauces,
      calories_per_serving: sourceDay.calories_per_serving,
    };

    updatedPlan[sourceIndex] = newSource;
    updatedPlan[targetIndex] = newTarget;

    setMealPlanData({
      ...mealPlanData,
      weekly_plan: updatedPlan,
    });
  };

  const handlePostponeDay = (sourceId: string) => {
    const sourceIndex = mealPlanData.weekly_plan.findIndex((d) => d.id === sourceId);
    if (sourceIndex === -1 || sourceIndex >= mealPlanData.weekly_plan.length - 1) return;

    const targetId = mealPlanData.weekly_plan[sourceIndex + 1].id;
    handleSwapDays(sourceId, targetId);
    setSelectedDayId(targetId);
  };

  const handleToggleCartItem = (category: keyof SmartCartType, itemId: string) => {
    if (!mealPlanData.smart_cart[category]) return;

    const updatedCategory = mealPlanData.smart_cart[category]!.map((item) => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    setMealPlanData({
      ...mealPlanData,
      smart_cart: {
        ...mealPlanData.smart_cart,
        [category]: updatedCategory,
      },
    });
  };

  const handleResetPlan = () => {
    localStorage.removeItem('MEALCART_SAVED_PLAN');
    setMealPlanData(INITIAL_MOCK_PLAN);
    setSelectedDayId('day-mon');
    setEngineInfo('');
    setToastMessage('식단표가 초기 예시 데이터로 리셋되었습니다.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-cream text-forest flex flex-col relative font-sans w-full max-w-full overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-forest text-white text-xs sm:text-sm px-5 py-3.5 rounded-2xl border-2 border-forest shadow-solid-lg flex items-center gap-3 animate-in slide-in-from-top max-w-md">
          <CheckCircle2 className="w-5 h-5 text-lime shrink-0" />
          <span className="leading-snug font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetPlan={handleResetPlan}
        hasCustomKey={hasCustomKey}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-w-0">
        {/* Insight Banner inspired by Pinterest Fresh Food Hero */}
        {mealPlanData.summary_insight && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-forest text-white border-2 border-forest shadow-solid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-lime text-forest flex items-center justify-center font-bold text-2xl shrink-0 border-2 border-forest shadow-xs">
                🥑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-script text-coral text-base font-bold select-none">
                    Smart Dietary Insight
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-lime/20 text-lime text-[10px] font-black border border-lime/30">
                    100% 소진 설계
                  </span>
                </div>
                <p className="text-sm sm:text-base font-black leading-snug text-white mt-0.5">
                  {mealPlanData.summary_insight}
                </p>
                {engineInfo && (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-lime font-bold">
                    <Cpu className="w-3.5 h-3.5 text-lime" />
                    <span>생성 엔진: {engineInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Grid: Left (Input Panel) & Right (Weekly Calendar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
          {/* Left: Input Panel (4 Cols on Desktop) */}
          <div className="lg:col-span-4 w-full min-w-0">
            <InputPanel
              inputState={userInput}
              onChange={setUserInput}
              onSubmit={handleGeneratePlan}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Weekly Calendar (8 Cols on Desktop) */}
          <div className="lg:col-span-8 w-full min-w-0 max-w-full flex flex-col gap-6 overflow-hidden">
            <WeeklyCalendar
              weeklyPlan={mealPlanData.weekly_plan}
              selectedDayId={selectedDayId}
              onSelectDay={(id) => {
                setSelectedDayId(id);
                setActiveTab('recipe');
              }}
              onSwapDays={handleSwapDays}
              onPostponeDay={handlePostponeDay}
            />

            {/* Bottom Tab Navigation in Pinterest pill style */}
            <div className="bg-white rounded-2xl sm:rounded-full p-1 sm:p-1.5 border-2 border-forest shadow-solid-sm flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('recipe')}
                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === 'recipe'
                    ? 'bg-forest text-lime border-2 border-forest shadow-solid-sm'
                    : 'text-forest hover:bg-cream-soft'
                }`}
              >
                <ChefHat className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">오늘의 상세 레시피 ({selectedDay?.day_of_week})</span>
                <span className="sm:hidden">상세 레시피</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === 'cart'
                    ? 'bg-forest text-lime border-2 border-forest shadow-solid-sm'
                    : 'text-forest hover:bg-cream-soft'
                }`}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">스마트 장보기 카트</span>
                <span className="sm:hidden">장보기 카트</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('storage')}
                className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  activeTab === 'storage'
                    ? 'bg-forest text-lime border-2 border-forest shadow-solid-sm'
                    : 'text-forest hover:bg-cream-soft'
                }`}
              >
                <Leaf className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">제로-웨이스트 보관법</span>
                <span className="sm:hidden">보관법</span>
              </button>
            </div>

            {/* Active Tab View */}
            <div>
              {activeTab === 'recipe' && (
                <VisualRecipe
                  day={selectedDay}
                  familySize={userInput.familySize}
                />
              )}

              {activeTab === 'cart' && (
                <SmartCart
                  cart={mealPlanData.smart_cart}
                  onToggleItem={handleToggleCartItem}
                />
              )}

              {activeTab === 'storage' && (
                <ZeroWasteStorage
                  storageGuides={mealPlanData.storage_guides}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Marquee Sponsor/Brand Banner inspired by Pinterest footer */}
      <div className="mt-12 py-3 bg-lime border-y-2 border-forest overflow-hidden select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-forest font-black text-xs sm:text-sm tracking-wider uppercase text-center">
          <span>🥑 FRESH HEALTHY MEALS</span>
          <span>•</span>
          <span>♻️ 100% ZERO-WASTE</span>
          <span>•</span>
          <span>🛒 SMART SHOPPING DEDUPLICATION</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">✨ AI PERSONALISED</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-cream text-center text-xs text-sage font-medium">
        <p className="font-bold text-forest">MealCart AI</p>
        <p className="mt-1">냉장고 잔여 재료 기반 주간 가족 식단 & 스마트 장보기 솔루션.</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={() => setHasCustomKey(!!getStoredGeminiKey())}
      />

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
export default App;

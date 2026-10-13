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
import { ChefHat, ShoppingCart, Leaf, Sparkles, CheckCircle, Cpu, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [mealPlanData, setMealPlanData] = useState<MealCartData>(() => {
    const cached = localStorage.getItem('MEALCART_SAVED_PLAN');
    if (cached) {
      try {
        return JSON.parse(cached);
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

  // Save to LocalStorage whenever plan changes
  useEffect(() => {
    localStorage.setItem('MEALCART_SAVED_PLAN', JSON.stringify(mealPlanData));
  }, [mealPlanData]);

  // Selected Day Object
  const selectedDay = mealPlanData.weekly_plan.find((d) => d.id === selectedDayId) || mealPlanData.weekly_plan[0];

  // Handle Generate Plan
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const newPlan = await generateMealCartPlan(userInput);
      setMealPlanData(newPlan);

      // Select first cooking day or first day
      const firstValidDay = newPlan.weekly_plan.find((d) => !d.is_dining_out) || newPlan.weekly_plan[0];
      if (firstValidDay) {
        setSelectedDayId(firstValidDay.id);
      }

      const engineName = (newPlan as any).engine || 'Gemini AI';
      setEngineInfo(engineName);

      setToastMessage(`🎉 [${userInput.pantryItems.slice(0, 3).join(', ')}] 재료를 반영한 식단표가 생성되었습니다! (${engineName})`);
      setTimeout(() => setToastMessage(null), 5000);

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });

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

  // Swap Meals between two days
  const handleSwapDays = (sourceId: string, targetId: string) => {
    const sourceIndex = mealPlanData.weekly_plan.findIndex((d) => d.id === sourceId);
    const targetIndex = mealPlanData.weekly_plan.findIndex((d) => d.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updatedPlan = [...mealPlanData.weekly_plan];
    const sourceDay = updatedPlan[sourceIndex];
    const targetDay = updatedPlan[targetIndex];

    // Swap meal properties while preserving the day structure (day_of_week, id)
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

  // Postpone Meal to the Next Day
  const handlePostponeDay = (sourceId: string) => {
    const sourceIndex = mealPlanData.weekly_plan.findIndex((d) => d.id === sourceId);
    if (sourceIndex === -1 || sourceIndex >= mealPlanData.weekly_plan.length - 1) return;

    const targetId = mealPlanData.weekly_plan[sourceIndex + 1].id;
    handleSwapDays(sourceId, targetId);
    setSelectedDayId(targetId);
  };

  // Toggle Cart Item Checkbox
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
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top border border-slate-700 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetPlan={handleResetPlan}
        hasCustomKey={hasCustomKey}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Insight Banner */}
        {mealPlanData.summary_insight && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs text-white shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {mealPlanData.summary_insight}
                </p>
                {engineInfo && (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-100 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-amber-300" />
                    <span>생성 엔진: {engineInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top Grid: Left (Input Panel) & Right (Weekly Calendar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Panel (4 Cols on Desktop) */}
          <div className="lg:col-span-4">
            <InputPanel
              inputState={userInput}
              onChange={setUserInput}
              onSubmit={handleGeneratePlan}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Weekly Calendar (8 Cols on Desktop) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
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

            {/* Bottom Tab Navigation */}
            <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('recipe')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'recipe'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>🍳 오늘의 상세 레시피 ({selectedDay?.day_of_week})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'cart'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>🛒 스마트 장보기 카트</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('storage')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'storage'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Leaf className="w-4 h-4" />
                <span>💡 제로-웨이스트 보관법</span>
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

      {/* Footer */}
      <footer className="mt-12 py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© 2026 MealCart AI. 냉장고 잔여 재료 기반 주간 가족 식단 & 스마트 장보기 솔루션.</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={() => setHasCustomKey(!!getStoredGeminiKey())}
      />
    </div>
  );
}
export default App;

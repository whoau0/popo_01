import React from 'react';
import { Settings, RefreshCw, Utensils } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onResetPlan: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onResetPlan, hasCustomKey }) => {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b-2 border-forest/15 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-forest text-lime flex items-center justify-center shadow-solid-sm border-2 border-forest shrink-0">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-script text-coral text-xs sm:text-base font-bold tracking-wide -mb-0.5 select-none truncate">
                Fresh & Delicious
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-lime text-forest border border-forest shadow-xs">
                AI PERSONALISED
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-forest flex items-center shrink-0">
                MealCart<span className="text-coral ml-0.5">AI</span>
              </h1>
              <span className="text-xs text-sage font-medium hidden md:inline-block ml-2 border-l border-forest/20 pl-2 truncate">
                냉장고 재고 소진 & 주간 맞춤 식단 플래너
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetPlan}
            title="기본 식단표로 초기화"
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold text-forest bg-white hover:bg-cream-soft border-2 border-forest/20 rounded-full transition-all shadow-solid-sm active:translate-y-0.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sage" />
            <span className="hidden sm:inline">초기화</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black rounded-full transition-all border-2 border-forest shadow-solid-sm active:translate-y-0.5 cursor-pointer ${
              hasCustomKey
                ? 'bg-lime text-forest hover:bg-lime-hover'
                : 'bg-white text-forest hover:bg-cream-soft'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[11px] sm:text-xs">{hasCustomKey ? 'AI 연동 중' : 'AI 설정'}</span>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${hasCustomKey ? 'bg-coral' : 'bg-sage/40'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

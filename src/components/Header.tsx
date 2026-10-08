import React from 'react';
import { Sparkles, Settings, RefreshCw, Leaf, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onResetPlan: () => void;
  hasCustomKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onResetPlan, hasCustomKey }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                MealCart <span className="text-brand-600 font-extrabold">AI</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                Zero-Waste
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              냉장고 재고 기반 주간 식단표 & 스마트 장보기 카트 플래너
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onResetPlan}
            title="기본 식단표로 초기화"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>

          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              hasCustomKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{hasCustomKey ? 'Gemini AI 연동됨' : 'AI 키 설정'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

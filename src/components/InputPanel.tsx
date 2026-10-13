import React, { useState } from 'react';
import { UserInputState, DayOfWeek } from '../types/mealcart';
import { Users, Calendar, Plus, X, Sparkles, ChefHat, Tag, Utensils } from 'lucide-react';

interface InputPanelProps {
  inputState: UserInputState;
  onChange: (newState: UserInputState) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

const PRESETS = [
  { id: '한식 위주', label: '🍲 한식 위주', desc: '국/찌개와 든든한 밥상' },
  { id: '원팬/초간단 요리', label: '🍳 원팬/초간단', desc: '설거지 적고 15분 컷' },
  { id: '저탄수/다이어트', label: '🥗 저탄수/식단', desc: '고단백 저염 웰빙식' },
  { id: '아이용 순한맛', label: '👶 아이용 순한맛', desc: '안 맵고 영양 가득' },
  { id: '가성비/절약', label: '💰 가성비/절약', desc: '식비 최소화 집중' },
];

const QUICK_PANTRY_SUGGESTIONS = [
  '돼지고기 앞다리살', '삼겹살 300g', '소고기 200g', '닭고기 1팩', '감자 3개', '두부 1모', '대파 1대', '애호박 1개', '계란 4알', '양파 2개', '익은 김치'
];

export const InputPanel: React.FC<InputPanelProps> = ({
  inputState,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (tagToAdd?: string) => {
    const text = (tagToAdd || tagInput).trim();
    if (!text) return;
    if (!inputState.pantryItems.includes(text)) {
      onChange({
        ...inputState,
        pantryItems: [...inputState.pantryItems, text],
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    onChange({
      ...inputState,
      pantryItems: inputState.pantryItems.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const toggleDiningOutDay = (day: DayOfWeek) => {
    const exists = inputState.diningOutDays.includes(day);
    const updated = exists
      ? inputState.diningOutDays.filter((d) => d !== day)
      : [...inputState.diningOutDays, day];
    onChange({
      ...inputState,
      diningOutDays: updated,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
          <ChefHat className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">식단 조건 & 냉장고 재고</h2>
          <p className="text-xs text-slate-500">우리 가족 맞춤 식단 조건을 설정하세요</p>
        </div>
      </div>

      {/* 1. Family Size */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-brand-600" />
          가족 구성원 (분량 계산)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {['1인', '2인', '3~4인', '5인 이상'].map((size) => {
            const active = inputState.familySize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ ...inputState, familySize: size })}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all text-center ${
                  active
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/30'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dining Out / Delivery Days */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            외식 / 배달 요일 (식단 제외)
          </span>
          <span className="text-[11px] font-normal text-slate-400">다중 선택 가능</span>
        </label>
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = inputState.diningOutDays.includes(day);
            const shortName = day.substring(0, 1);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDiningOutDay(day)}
                title={`${day} 외식/배달`}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pantry Items Tag Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-600" />
            냉장고 보유 재료 (우선 소진)
          </label>
          <span className="text-[11px] text-brand-600 font-semibold">{inputState.pantryItems.length}개 보유</span>
        </div>
        <p className="text-[11px] bg-amber-50/80 text-amber-800 px-2.5 py-1.5 rounded-lg border border-amber-200/80 leading-relaxed flex items-center gap-1">
          <span>🧂</span>
          <span>간장, 고추장, 된장, 마늘, 참기름 등 기본 양념은 <strong>구비 전제</strong>로 풍성한 일품요리를 추천합니다.</span>
        </p>

        {/* Tag input box */}
        <div className="flex gap-1.5">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="예: 애호박 1/2개, 두부 1모 (입력 후 Enter)"
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </button>
        </div>

        {/* Selected Tags list */}
        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50/80 rounded-xl border border-slate-100">
          {inputState.pantryItems.length === 0 ? (
            <span className="text-xs text-slate-400 py-1 px-2 italic">보유 재료를 추가해 보세요</span>
          ) : (
            inputState.pantryItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-in fade-in"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="hover:text-emerald-950 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-1">
          <p className="text-[11px] text-slate-400 mb-1.5">자주 쓰는 재료 빠른 추가:</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_PANTRY_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddTag(sug)}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-md text-slate-600 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Dietary Presets */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-brand-600" />
          식단 성향 프리셋
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {PRESETS.map((preset) => {
            const active = inputState.dietaryPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ ...inputState, dietaryPreset: preset.id })}
                className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                  active
                    ? 'bg-brand-50/80 border-brand-500 text-brand-900 ring-1 ring-brand-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[11px] text-slate-500">{preset.desc}</div>
                </div>
                {active && <span className="w-2 h-2 rounded-full bg-brand-600"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Additional Requests */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          기타 요청사항 (선택)
        </label>
        <input
          type="text"
          value={inputState.additionalRequests}
          onChange={(e) => onChange({ ...inputState, additionalRequests: e.target.value })}
          placeholder="예: 금요일은 매운 안주 스타일로"
          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
        />
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-700 hover:to-emerald-600 text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-brand-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>AI 식단 생성 중...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>✨ 주간 식단표 생성하기</span>
          </>
        )}
      </button>
    </div>
  );
};

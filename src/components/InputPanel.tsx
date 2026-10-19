import React, { useState } from 'react';
import { UserInputState, DayOfWeek } from '../types/mealcart';
import { Users, Calendar, Plus, X, Sparkles, Tag, Utensils, Check } from 'lucide-react';

interface InputPanelProps {
  inputState: UserInputState;
  onChange: (newState: UserInputState) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];

const PRESETS = [
  { id: '한식 위주', label: '🍲 한식 위주', desc: '국/찌개와 든든한 일품 밥상' },
  { id: '원팬/초간단 요리', label: '🍳 원팬/초간단', desc: '설거지 적고 15분 컷 메인 요리' },
  { id: '저탄수/다이어트', label: '🥗 저탄수/식단', desc: '고단백 저염 웰빙식' },
  { id: '아이용 순한맛', label: '👶 아이용 순한맛', desc: '자극적이지 않고 영양 가득' },
  { id: '가성비/절약', label: '💰 가성비/절약', desc: '식비 최소화 및 재료 100% 소진' },
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
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-forest shadow-solid flex flex-col gap-4 sm:gap-5 w-full">
      {/* Header */}
      <div className="border-b-2 border-forest/15 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <span className="font-script text-coral text-base sm:text-lg font-bold -mb-1 select-none">
            Simple Customization
          </span>
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-forest text-lime text-[10px] font-black tracking-wider">
            STEP 01
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-forest tracking-tight">
          식단 조건 & 냉장고 재고
        </h2>
        <p className="text-xs text-sage mt-0.5">
          보유 재료를 입력하면 AI가 100% 알뜰 소진 식단을 설계합니다.
        </p>
      </div>

      {/* 1. Family Size */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-coral" />
          가족 구성원 (분량 계산)
        </label>
        <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
          {['1인', '2인', '3~4인', '5인 이상'].map((size) => {
            const active = inputState.familySize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ ...inputState, familySize: size })}
                className={`py-2 px-0.5 sm:px-1 text-[11px] sm:text-xs font-black rounded-xl border-2 transition-all text-center cursor-pointer ${
                  active
                    ? 'bg-forest text-lime border-forest shadow-solid-sm'
                    : 'bg-cream-soft text-forest border-forest/20 hover:border-forest/50'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dining Out / Delivery Days */}
      <div className="space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-coral" />
            외식 / 배달 요일 (식단 제외)
          </label>
          <span className="text-[10px] sm:text-[11px] text-sage font-medium">다중 선택</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = inputState.diningOutDays.includes(day);
            const shortName = day.substring(0, 1);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDiningOutDay(day)}
                title={`${day} 외식/배달 제외`}
                className={`py-2 text-[11px] sm:text-xs font-black rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-coral text-white border-forest shadow-solid-sm'
                    : 'bg-cream-soft text-forest border-forest/20 hover:border-forest/50'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pantry Items Tag Input */}
      <div className="space-y-2 sm:space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-coral" />
            냉장고 보유 재료 (우선 소진)
          </label>
          <span className="text-[11px] sm:text-xs font-black text-forest bg-lime px-2 py-0.5 rounded-full border border-forest">
            {inputState.pantryItems.length}개 보유
          </span>
        </div>

        {/* Basic seasoning notice */}
        <div className="text-[11px] bg-cream-soft text-forest p-2 sm:p-2.5 rounded-xl border border-forest/15 leading-relaxed flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm shrink-0">🧂</span>
          <span>간장·고추장·된장 등 기본 양념은 <strong>구비 전제</strong>로 일품 요리를 추천합니다.</span>
        </div>

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
            placeholder="예: 돼지고기 300g, 감자 2개 (Enter)"
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 text-xs bg-cream-soft border-2 border-forest/25 rounded-xl sm:rounded-2xl text-forest placeholder:text-sage/60 focus:outline-none focus:border-forest focus:bg-white transition-all font-medium"
          />
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="px-3 sm:px-4 py-2 sm:py-2.5 bg-forest hover:bg-forest-light text-lime font-black text-xs rounded-xl sm:rounded-2xl transition-all border-2 border-forest shadow-solid-sm flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </button>
        </div>

        {/* Selected Tags list */}
        <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 sm:p-2.5 bg-cream-soft rounded-xl sm:rounded-2xl border-2 border-forest/15">
          {inputState.pantryItems.length === 0 ? (
            <span className="text-xs text-sage py-1 px-1 sm:px-2 italic font-medium">보유 중인 주재료를 추가해 보세요</span>
          ) : (
            inputState.pantryItems.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-white text-forest border-2 border-forest shadow-xs"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(idx)}
                  className="hover:text-coral transition-colors p-0.5"
                >
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <p className="text-[11px] text-sage font-bold mb-1.5">자주 쓰는 식재료 빠른 추가:</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_PANTRY_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddTag(sug)}
                className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 bg-white hover:bg-lime/40 border border-forest/20 rounded-full text-forest font-semibold transition-all hover:border-forest cursor-pointer"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Dietary Presets */}
      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-coral" />
          식단 성향 프리셋
        </label>
        <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
          {PRESETS.map((preset) => {
            const active = inputState.dietaryPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChange({ ...inputState, dietaryPreset: preset.id })}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  active
                    ? 'bg-lime/25 border-forest shadow-solid-sm text-forest'
                    : 'bg-cream-soft border-forest/20 hover:border-forest/50 text-forest'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-black truncate">{preset.label}</div>
                  <div className="text-[10px] sm:text-[11px] text-sage font-medium truncate">{preset.desc}</div>
                </div>
                {active && (
                  <span className="w-5 h-5 rounded-full bg-forest text-lime flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Additional Requests */}
      <div className="space-y-1.5">
        <label className="text-xs font-black text-forest uppercase tracking-wider">
          기타 요청사항 (선택)
        </label>
        <input
          type="text"
          value={inputState.additionalRequests}
          onChange={(e) => onChange({ ...inputState, additionalRequests: e.target.value })}
          placeholder="예: 금요일은 매운 안주 스타일로"
          className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs bg-cream-soft border-2 border-forest/25 rounded-xl sm:rounded-2xl text-forest placeholder:text-sage/60 focus:outline-none focus:border-forest focus:bg-white font-medium"
        />
      </div>

      {/* Main Electric Lime Action Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full py-3.5 sm:py-4 px-4 sm:px-6 bg-lime hover:bg-lime-hover text-forest text-sm sm:text-base font-black rounded-full border-2 border-forest shadow-solid-lg transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wide"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-3 border-forest border-t-transparent rounded-full animate-spin" />
            <span>AI 식단 생성 중...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-forest" />
            <span>AI 맞춤 주간 식단표 생성하기</span>
          </>
        )}
      </button>
    </div>
  );
};

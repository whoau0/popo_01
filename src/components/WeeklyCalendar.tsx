import React, { useState } from 'react';
import { MealPlanDay } from '../types/mealcart';
import { Calendar, Clock, ArrowRightLeft, FastForward, Sparkles, Utensils } from 'lucide-react';
import { FOOD_IMAGES } from '../services/geminiService';

interface WeeklyCalendarProps {
  weeklyPlan: MealPlanDay[];
  selectedDayId: string;
  onSelectDay: (id: string) => void;
  onSwapDays: (sourceId: string, targetId: string) => void;
  onPostponeDay: (sourceId: string) => void;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  weeklyPlan,
  selectedDayId,
  onSelectDay,
  onSwapDays,
  onPostponeDay,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [swapModalDay, setSwapModalDay] = useState<MealPlanDay | null>(null);

  // Today indicator: first day or Monday by default
  const todayDay = weeklyPlan[0]?.day_of_week || '월요일';

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    if (sourceId && sourceId !== targetId) {
      onSwapDays(sourceId, targetId);
    }
    setDraggedId(null);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">주간 식단 캘린더 (월 ~ 일)</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">카드를 드래그하거나 버튼을 눌러 손쉽게 순서를 맞바꾸세요</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span> 냉장고 재고
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 장보기 재료
          </span>
        </div>
      </div>

      {/* 7-Days Grid Container with smooth horizontal scroll on narrow screens */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="grid grid-cols-7 gap-2.5 min-w-[770px]">
          {weeklyPlan.map((day, idx) => {
            const isSelected = selectedDayId === day.id;
            const isToday = day.day_of_week === todayDay;
            const shortDay = day.day_of_week.replace('요일', ''); // '월', '화', '수'
            const imageUrl = day.image_url || (day.is_dining_out ? FOOD_IMAGES.dining : FOOD_IMAGES.default);

            return (
              <div
                key={day.id}
                draggable
                onDragStart={(e) => handleDragStart(e, day.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.id)}
                onClick={() => onSelectDay(day.id)}
                className={`group relative rounded-2xl p-2.5 sm:p-3 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                  day.is_dining_out
                    ? isSelected
                      ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-amber-50/40 border-amber-200/90 hover:bg-amber-50/70 hover:border-amber-300'
                    : isSelected
                    ? 'bg-emerald-50/50 border-brand-500 shadow-md ring-2 ring-brand-500/20'
                    : 'bg-slate-50/70 border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  {/* Card Top Header: Day Name + Time */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 gap-1 h-7">
                    <div className="flex items-center gap-1 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          isToday
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {shortDay}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-brand-100 text-brand-800 whitespace-nowrap">
                          오늘
                        </span>
                      )}
                    </div>

                    {day.is_dining_out ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 whitespace-nowrap shrink-0">
                        외식
                      </span>
                    ) : day.cooking_time && day.cooking_time !== '0분' ? (
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-0.5 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{day.cooking_time}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Thumbnail Image (Always guaranteed valid, no broken image) */}
                  <div className="relative h-20 w-full mb-2 rounded-xl overflow-hidden bg-slate-200 shadow-inner shrink-0">
                    <img
                      src={imageUrl}
                      alt={day.menu_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = FOOD_IMAGES.default;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[10px] font-medium backdrop-blur-xs max-w-[80px] truncate">
                      {day.is_dining_out ? '외식/배달' : day.category || '가정식'}
                    </span>
                  </div>

                  {/* Menu Name (Fixed 2 lines height for perfect alignment) */}
                  <div className="h-9 mb-1.5 flex items-center">
                    <h3
                      className={`text-xs font-bold leading-snug line-clamp-2 ${
                        day.is_dining_out ? 'text-amber-900 font-extrabold' : 'text-slate-900'
                      }`}
                      title={day.menu_name}
                    >
                      {day.menu_name}
                    </h3>
                  </div>

                  {/* Ingredients Tags / Status (Fixed height for uniform card layout) */}
                  <div className="h-12 overflow-hidden flex flex-wrap gap-1 content-start mb-2">
                    {day.is_dining_out ? (
                      <span className="w-full text-center text-[10px] font-medium text-amber-700 bg-amber-100/70 py-1.5 px-1 rounded-md border border-amber-200/80 truncate">
                        가족 힐링 외식데이 ✨
                      </span>
                    ) : (
                      <>
                        {day.used_pantry_items?.slice(0, 2).map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-emerald-100/90 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 truncate max-w-full"
                            title={item}
                          >
                            {item}
                          </span>
                        ))}
                        {day.used_shopping_items?.slice(0, 1).map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-amber-100/90 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 truncate max-w-full"
                            title={item}
                          >
                            {item}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons (Always on the exact same row) */}
                <div className="pt-2 border-t border-slate-200/70 flex items-center gap-1 w-full shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwapModalDay(day);
                    }}
                    title="다른 요일과 식단 맞바꾸기"
                    className="flex-1 py-1 px-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors whitespace-nowrap"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-slate-500 shrink-0" />
                    <span>스왑</span>
                  </button>

                  {!day.is_dining_out && idx < weeklyPlan.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPostponeDay(day.id);
                      }}
                      title="이 메뉴를 내일로 미루기"
                      className="py-1 px-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg text-brand-700 font-bold text-[11px] flex items-center justify-center transition-colors whitespace-nowrap shrink-0"
                    >
                      <FastForward className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Swap Modal */}
      {swapModalDay && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-brand-600" />
                식단 요일 변경 (스왑)
              </h3>
              <button
                onClick={() => setSwapModalDay(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              <strong className="text-brand-700">[{swapModalDay.day_of_week}] {swapModalDay.menu_name}</strong> 메뉴를 어느 요일과 맞바꾸시겠습니까?
            </p>

            <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {weeklyPlan
                .filter((d) => d.id !== swapModalDay.id)
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSwapDays(swapModalDay.id, d.id);
                      setSwapModalDay(null);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-slate-800 mr-2 shrink-0">{d.day_of_week}</span>
                      <span className="text-slate-600 truncate">{d.menu_name}</span>
                    </div>
                    <span className="text-brand-600 font-bold text-[11px] shrink-0">선택 →</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

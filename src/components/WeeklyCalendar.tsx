import React, { useState } from 'react';
import { MealPlanDay } from '../types/mealcart';
import { Clock, ArrowRightLeft, FastForward, Calendar, Sparkles } from 'lucide-react';
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
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-forest shadow-solid flex flex-col gap-4 w-full min-w-0 max-w-full overflow-hidden">
      {/* Header inspired by Pinterest Fresh Food */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-forest/15">
        <div>
          <span className="font-script text-coral text-lg font-bold -mb-1 select-none">
            Weekly Schedule
          </span>
          <h2 className="text-xl font-black text-forest tracking-tight">
            주간 식단 캘린더 (월 ~ 일)
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-forest bg-cream-soft px-3 py-1.5 rounded-full border border-forest/20 shrink-0">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-forest"></span> 냉장고 재고
          </span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-coral"></span> 장보기 품목
          </span>
        </div>
      </div>

      {/* 7-Days Grid Container */}
      <div className="overflow-x-auto w-full max-w-full pt-2 pb-2 touch-pan-x">
        <div className="grid grid-cols-7 gap-2.5 min-w-[770px]">
          {weeklyPlan.map((day, idx) => {
            const isSelected = selectedDayId === day.id;
            const isToday = day.day_of_week === todayDay;
            const shortDay = day.day_of_week.replace('요일', '');
            const imageUrl = day.image_url || (day.is_dining_out ? FOOD_IMAGES.dining : FOOD_IMAGES.default);

            return (
              <div
                key={day.id}
                draggable
                onDragStart={(e) => handleDragStart(e, day.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day.id)}
                onClick={() => onSelectDay(day.id)}
                className={`group relative rounded-2xl p-2.5 border-2 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between select-none ${
                  day.is_dining_out
                    ? isSelected
                      ? 'bg-cream-soft border-forest ring-4 ring-coral/30 shadow-solid-sm'
                      : 'bg-cream-soft/60 border-forest/20 hover:border-forest/60 hover:bg-cream-soft hover:shadow-solid-sm'
                    : isSelected
                    ? 'bg-lime/20 border-forest ring-4 ring-lime/40 shadow-solid-sm'
                    : 'bg-white border-forest/20 hover:border-forest hover:bg-cream-soft/40 hover:shadow-solid-sm'
                }`}
              >
                <div>
                  {/* Card Top: Day badge + Time (Cleanly separated) */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-forest/15 gap-1 h-7">
                    <div className="flex items-center gap-1">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center shrink-0 border ${
                          isToday
                            ? 'bg-forest text-lime border-forest shadow-xs'
                            : 'bg-cream-soft text-forest border-forest/30'
                        }`}
                      >
                        {shortDay}
                      </span>
                    </div>

                    {day.is_dining_out ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-coral/15 text-coral border border-coral/30 whitespace-nowrap shrink-0">
                        외식
                      </span>
                    ) : day.cooking_time && day.cooking_time !== '0분' ? (
                      <span className="text-[11px] font-bold text-sage flex items-center gap-0.5 whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3 text-sage shrink-0" />
                        <span>{day.cooking_time}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative h-20 w-full mb-2 rounded-xl overflow-hidden bg-cream-soft border border-forest/20 shrink-0">
                    <img
                      src={imageUrl}
                      alt={day.menu_name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = FOOD_IMAGES.default;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent"></div>

                    {/* Today Badge as Top-Left Sticker */}
                    {isToday && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-coral text-white rounded-full text-[10px] font-black shadow-solid-sm tracking-wider flex items-center gap-1 z-10 border border-white/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        오늘
                      </span>
                    )}

                    {/* Category on Bottom-Right */}
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-forest text-lime rounded-full text-[10px] font-black max-w-[80px] truncate border border-lime/30 z-10">
                      {day.is_dining_out ? '외식/배달' : day.category || '가정식'}
                    </span>
                  </div>

                  {/* Menu Name */}
                  <div className="h-9 mb-1.5 flex items-center">
                    <h3
                      className="text-xs font-black leading-snug line-clamp-2 text-forest"
                      title={day.menu_name}
                    >
                      {day.menu_name}
                    </h3>
                  </div>

                  {/* Ingredients Tags */}
                  <div className="h-12 overflow-hidden flex flex-wrap gap-1 content-start mb-2">
                    {day.is_dining_out ? (
                      <span className="w-full text-center text-[10px] font-bold text-coral bg-coral/10 py-1 px-1 rounded-full border border-coral/25 truncate">
                        🍕 재충전 힐링 데이
                      </span>
                    ) : (
                      <>
                        {day.used_pantry_items?.slice(0, 2).map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold bg-cream-soft text-forest px-1.5 py-0.5 rounded-full border border-forest/20 truncate max-w-full"
                            title={item}
                          >
                            {item}
                          </span>
                        ))}
                        {day.used_shopping_items?.slice(0, 1).map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-black bg-coral/15 text-coral px-1.5 py-0.5 rounded-full border border-coral/30 truncate max-w-full"
                            title={item}
                          >
                            {item}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-2 border-t border-forest/15 flex items-center gap-1 w-full shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwapModalDay(day);
                    }}
                    title="다른 요일과 식단 맞바꾸기"
                    className="flex-1 py-1 px-1 bg-white hover:bg-lime border border-forest/25 rounded-full text-forest font-bold text-[11px] flex items-center justify-center gap-1 transition-all shadow-xs active:translate-y-0.5 whitespace-nowrap"
                  >
                    <ArrowRightLeft className="w-3 h-3 text-forest shrink-0" />
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
                      className="py-1 px-2 bg-white hover:bg-coral hover:text-white border border-forest/25 rounded-full text-forest font-black text-[11px] flex items-center justify-center transition-all shadow-xs active:translate-y-0.5 whitespace-nowrap shrink-0"
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
        <div className="fixed inset-0 z-50 bg-forest/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border-2 border-forest shadow-solid-lg">
            <div className="flex items-center justify-between pb-3 border-b-2 border-forest/15 mb-4">
              <div>
                <span className="font-script text-coral text-base font-bold select-none">
                  Schedule Reorder
                </span>
                <h3 className="text-base font-black text-forest">식단 요일 변경 (스왑)</h3>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalDay(null)}
                className="w-7 h-7 rounded-full bg-cream-soft text-forest hover:bg-coral hover:text-white text-sm font-black flex items-center justify-center border border-forest/20 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-forest font-medium mb-3">
              <strong className="text-coral">[{swapModalDay.day_of_week}] {swapModalDay.menu_name}</strong> 메뉴를 어느 요일과 맞바꾸시겠습니까?
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
              {weeklyPlan
                .filter((d) => d.id !== swapModalDay.id)
                .map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onSwapDays(swapModalDay.id, d.id);
                      setSwapModalDay(null);
                    }}
                    className="p-3 rounded-2xl border-2 border-forest/20 hover:border-forest hover:bg-lime/25 text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div className="truncate mr-2">
                      <span className="font-black text-forest mr-2 shrink-0">{d.day_of_week}</span>
                      <span className="text-sage truncate font-medium">{d.menu_name}</span>
                    </div>
                    <span className="text-forest font-black text-xs shrink-0 bg-lime px-2 py-0.5 rounded-full border border-forest">
                      선택 →
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { MealPlanDay } from '../types/mealcart';
import { ChefHat, Clock, Play, Pause, RotateCcw, AlertCircle, Sparkles, Check, Flame, Utensils } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VisualRecipeProps {
  day: MealPlanDay;
  familySize: string;
}

export const VisualRecipe: React.FC<VisualRecipeProps> = ({ day, familySize }) => {
  // Timer state keyed by step index
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play a simple synthesized pleasant audio chime using Web Audio API
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio playback not permitted or not supported', e);
    }
  };

  useEffect(() => {
    if (isTimerRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            playChimeSound();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, secondsLeft]);

  const startStepTimer = (stepIndex: number, duration: number) => {
    if (activeTimerStep === stepIndex && isTimerRunning) {
      setIsTimerRunning(false);
      return;
    }

    if (activeTimerStep === stepIndex && !isTimerRunning && secondsLeft > 0) {
      setIsTimerRunning(true);
      return;
    }

    setActiveTimerStep(stepIndex);
    setSecondsLeft(duration);
    setIsTimerRunning(true);
  };

  const resetTimer = (duration: number) => {
    setIsTimerRunning(false);
    setSecondsLeft(duration);
  };

  const toggleStepCompleted = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (day.is_dining_out) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 text-2xl shadow-inner">
          🍽️
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">{day.menu_name}</h3>
        <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
          오늘은 집밥 조리 대신 가족들과 맛있는 외식 또는 좋아하는 배달 음식을 즐기며 편안한 시간을 보내는 날입니다.
        </p>
        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
          주간 식비 & 조리 피로도 Zero 데이
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {/* Visual Recipe Hero Banner */}
      <div className="relative h-48 sm:h-56 w-full bg-slate-900">
        <img
          src={day.image_url}
          alt={day.menu_name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>

        {/* Hero Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500 text-white shadow-md flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            {day.day_of_week}의 추천 요리
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-xs border border-white/20">
            기준: {familySize}
          </span>
        </div>

        {/* Hero Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-300">{day.category || '가정식 한식'}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              조리 시간: {day.cooking_time}
            </span>
            {day.calories_per_serving && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  약 {day.calories_per_serving} kcal
                </span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">{day.menu_name}</h2>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Ingredients Used in this Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              냉장고 소진 재료:
            </span>
            <div className="flex flex-wrap gap-1">
              {day.used_pantry_items?.length ? (
                day.used_pantry_items.map((item, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">보유 재료 없음</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              장보기 구매 재료:
            </span>
            <div className="flex flex-wrap gap-1">
              {day.used_shopping_items?.length ? (
                day.used_shopping_items.map((item, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">추가 구매 재료 없음</span>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-Step Cooking Guide */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-brand-600" />
            단계별 비주얼 퀵-뷰 레시피 (Visual Steps)
          </h3>

          <div className="space-y-3">
            {day.recipe_steps.map((step, idx) => {
              const isTimerActive = activeTimerStep === idx;
              const hasTimer = step.timer_seconds > 0;
              const isChecked = !!completedSteps[step.step_number];

              return (
                <div
                  key={step.step_number}
                  className={`p-4 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : isTimerActive && isTimerRunning
                      ? 'bg-amber-50/70 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => toggleStepCompleted(step.step_number)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-white border-slate-300 hover:border-brand-500 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>

                      {/* Step details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                            STEP {step.step_number}
                          </span>
                          {step.highlight_action && (
                            <span className="text-xs font-bold text-slate-700">
                              [{step.highlight_action}]
                            </span>
                          )}
                        </div>
                        <p className={`text-sm text-slate-800 leading-relaxed ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {step.action}
                        </p>
                      </div>
                    </div>

                    {/* In-app Timer Widget */}
                    {hasTimer && (
                      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <button
                          type="button"
                          onClick={() => startStepTimer(idx, step.timer_seconds)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                            isTimerActive && isTimerRunning
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {isTimerActive && isTimerRunning ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>{formatTimer(secondsLeft)}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-brand-600" />
                              <span>{isTimerActive ? formatTimer(secondsLeft) : `${Math.floor(step.timer_seconds / 60)}분`}</span>
                            </>
                          )}
                        </button>

                        {isTimerActive && (
                          <button
                            type="button"
                            onClick={() => resetTimer(step.timer_seconds)}
                            className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> 리셋
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alternative Seasoning & Cooking Tips */}
        {day.alternative_sauces && day.alternative_sauces.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
            <h4 className="font-bold flex items-center gap-1.5 mb-2 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              스마트 대체 양념 & 조리 꿀팁
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-amber-800/90">
              {day.alternative_sauces.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

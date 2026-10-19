import React, { useState, useEffect, useRef } from 'react';
import { MealPlanDay } from '../types/mealcart';
import { ChefHat, Clock, Play, Pause, RotateCcw, AlertCircle, Check, Flame, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FOOD_IMAGES } from '../services/geminiService';

interface VisualRecipeProps {
  day: MealPlanDay;
  familySize: string;
}

export const VisualRecipe: React.FC<VisualRecipeProps> = ({ day, familySize }) => {
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [sauceCopied, setSauceCopied] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopySauce = () => {
    if (!day.golden_ratio_sauce) return;
    const s = day.golden_ratio_sauce;
    let text = `✨ [MealCart AI] ${day.menu_name}\n`;
    text += `🥄 ${s.sauce_name}\n\n`;
    text += `[황금 양념 비율 배합표]\n`;
    s.ingredients.forEach((ing) => {
      text += ` • ${ing.name}: ${ing.amount}\n`;
    });
    if (s.mixing_tip) text += `\n🥣 배합 비법: ${s.mixing_tip}\n`;
    if (s.taste_kick) text += `💡 맛의 킥: ${s.taste_kick}\n`;

    navigator.clipboard.writeText(text);
    setSauceCopied(true);
    setTimeout(() => setSauceCopied(false), 2000);
  };

  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3);

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
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border-2 border-forest shadow-solid text-center flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px]">
        <div className="w-16 h-16 rounded-full bg-cream-soft text-coral flex items-center justify-center mb-4 text-3xl border-2 border-forest shadow-solid-sm">
          🍕
        </div>
        <span className="font-script text-coral text-lg font-bold select-none">
          Relax & Enjoy
        </span>
        <h3 className="text-2xl font-black text-forest mb-2">{day.menu_name}</h3>
        <p className="text-sm text-sage max-w-md mb-6 leading-relaxed font-medium">
          오늘은 집밥 조리 대신 가족들과 맛있는 외식 또는 좋아하는 배달 음식을 즐기며 편안한 시간을 보내는 날입니다.
        </p>
        <span className="px-4 py-1.5 bg-lime text-forest text-xs font-black rounded-full border-2 border-forest shadow-solid-sm">
          조리 피로도 Zero 데이 ☕
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-forest shadow-solid overflow-hidden flex flex-col">
      {/* Hero Banner inspired by Pinterest Fresh Food */}
      <div className="relative h-56 sm:h-64 w-full bg-forest">
        <img
          src={day.image_url || FOOD_IMAGES.default}
          alt={day.menu_name}
          className="w-full h-full object-cover opacity-85"
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null;
            target.src = FOOD_IMAGES.default;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/40 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-lime text-forest border-2 border-forest shadow-solid-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            TODAY'S RECIPE
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-white text-forest border-2 border-forest shadow-solid-sm">
            기준: {familySize}
          </span>
        </div>

        {/* Hero Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
            <span className="font-black text-lime bg-forest/80 px-2 py-0.5 rounded-full border border-lime/30">
              {day.category || '가정식 한식'}
            </span>
            <span className="text-white/40">•</span>
            <span className="text-cream flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-lime" />
              조리 시간: {day.cooking_time}
            </span>
            {day.calories_per_serving && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-cream flex items-center gap-1 font-bold">
                  <Flame className="w-3.5 h-3.5 text-coral" />
                  약 {day.calories_per_serving} kcal
                </span>
              </>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {day.menu_name}
          </h2>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Ingredients Used in this Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-cream-soft rounded-2xl border-2 border-forest/15">
          <div>
            <span className="text-xs font-black text-forest flex items-center gap-1.5 mb-2 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-forest"></span>
              냉장고 소진 식재료:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {day.used_pantry_items?.length ? (
                day.used_pantry_items.map((item, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white text-forest font-bold border border-forest/20 shadow-xs">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-sage font-medium">보유 재료 없음</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-black text-forest flex items-center gap-1.5 mb-2 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-coral"></span>
              장보기 구매 식재료:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {day.used_shopping_items?.length ? (
                day.used_shopping_items.map((item, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-coral/15 text-coral font-black border border-coral/30 shadow-xs">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-xs text-sage font-medium">추가 구매 재료 없음</span>
              )}
            </div>
          </div>
        </div>

        {/* Golden Ratio Sauce Card - Chef Verified */}
        {day.golden_ratio_sauce && (
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-forest bg-cream-soft/85 shadow-solid-sm space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b-2 border-forest/15">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-script text-coral text-base font-bold select-none">
                    Chef's Secret Sauce
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-coral text-white border border-forest shadow-xs">
                    맛 검증 완료 💯
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-forest flex items-center gap-1.5 mt-0.5">
                  <span>🥄</span>
                  <span>{day.golden_ratio_sauce.sauce_name}</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopySauce}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-lime text-forest border border-forest text-xs font-black shadow-xs transition-all active:translate-y-0.5 cursor-pointer shrink-0"
              >
                {sauceCopied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
                    <span>양념 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-forest" />
                    <span>양념 배합 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* Ingredients ratio grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {day.golden_ratio_sauce.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-white border-2 border-forest/20 flex flex-col justify-between shadow-2xs hover:border-forest transition-colors"
                >
                  <span className="text-[11px] font-black text-forest truncate">{ing.name}</span>
                  <span className="text-xs font-black text-coral mt-1 bg-coral/10 px-2 py-0.5 rounded-md self-start border border-coral/20">
                    {ing.amount}
                  </span>
                </div>
              ))}
            </div>

            {/* Mixing tip & Taste kick */}
            <div className="space-y-2 pt-1 text-xs">
              {day.golden_ratio_sauce.mixing_tip && (
                <div className="p-3 rounded-xl bg-white/95 border border-forest/20 text-forest font-medium flex items-start gap-2 leading-relaxed">
                  <span className="shrink-0 text-base">🥣</span>
                  <div>
                    <strong className="text-forest font-black">배합 & 숙성 비법: </strong>
                    <span className="text-forest/90 font-semibold">{day.golden_ratio_sauce.mixing_tip}</span>
                  </div>
                </div>
              )}

              {day.golden_ratio_sauce.taste_kick && (
                <div className="p-3 rounded-xl bg-lime/30 border-2 border-forest text-forest font-medium flex items-start gap-2 leading-relaxed shadow-xs">
                  <span className="shrink-0 text-base">💡</span>
                  <div>
                    <strong className="text-forest font-black">셰프의 맛의 킥: </strong>
                    <span className="text-forest font-black">{day.golden_ratio_sauce.taste_kick}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step-by-Step Cooking Guide */}
        <div>
          <div className="border-b-2 border-forest/15 pb-3 mb-4">
            <span className="font-script text-coral text-lg font-bold select-none">
              Step by Step Cooking
            </span>
            <h3 className="text-lg font-black text-forest">
              단계별 비주얼 레시피 ({day.recipe_steps?.length || 0}단계)
            </h3>
          </div>

          <div className="space-y-3">
            {day.recipe_steps.map((step, idx) => {
              const isTimerActive = activeTimerStep === idx;
              const hasTimer = step.timer_seconds > 0;
              const isChecked = !!completedSteps[step.step_number];

              return (
                <div
                  key={step.step_number}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isChecked
                      ? 'bg-cream-soft/60 border-forest/15 opacity-60'
                      : isTimerActive && isTimerRunning
                      ? 'bg-white border-coral ring-4 ring-coral/25 shadow-solid-sm'
                      : 'bg-white border-forest/20 hover:border-forest/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => toggleStepCompleted(step.step_number)}
                        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                          isChecked
                            ? 'bg-forest border-forest text-lime'
                            : 'bg-white border-forest/40 hover:border-forest text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      {/* Step details */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                          <span className="text-[11px] font-black text-lime bg-forest px-2 py-0.5 rounded-full border border-forest">
                            STEP {step.step_number}
                          </span>
                          {step.heat_level && (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                              step.heat_level === '강불' || step.heat_level === '중강불'
                                ? 'bg-coral text-white border-forest'
                                : step.heat_level === '중불' || step.heat_level === '중약불'
                                ? 'bg-amber-100 text-forest border-forest/40'
                                : step.heat_level === '약불'
                                ? 'bg-blue-50 text-forest border-forest/40'
                                : 'bg-cream text-forest border-forest/30'
                            }`}>
                              <span>
                                {step.heat_level.includes('강') ? '🔥' : step.heat_level.includes('중') ? '♨️' : step.heat_level === '약불' ? '🕯️' : '🌱'}
                              </span>
                              <span>{step.heat_level}</span>
                            </span>
                          )}
                          {step.highlight_action && (
                            <span className="text-xs font-black text-coral">
                              [{step.highlight_action}]
                            </span>
                          )}
                        </div>
                        <p className={`text-xs sm:text-sm text-forest leading-relaxed font-semibold ${isChecked ? 'line-through text-sage' : ''}`}>
                          {step.action}
                        </p>

                        {/* Chef Tip */}
                        {step.tip && (
                          <div className="mt-2 p-2.5 rounded-xl bg-cream-soft border border-forest/15 text-[11px] text-forest/90 font-medium flex items-start gap-1.5 leading-relaxed">
                            <span className="text-coral shrink-0">💡</span>
                            <span><strong>실패 방지 팁: </strong>{step.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timer Widget */}
                    {hasTimer && (
                      <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                        <button
                          type="button"
                          onClick={() => startStepTimer(idx, step.timer_seconds)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all border-2 border-forest shadow-solid-sm active:translate-y-0.5 ${
                            isTimerActive && isTimerRunning
                              ? 'bg-coral text-white animate-pulse'
                              : 'bg-lime hover:bg-lime-hover text-forest'
                          }`}
                        >
                          {isTimerActive && isTimerRunning ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span className="font-mono">{formatTimer(secondsLeft)}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-forest" />
                              <span className="font-mono">{isTimerActive ? formatTimer(secondsLeft) : `${Math.floor(step.timer_seconds / 60)}분`}</span>
                            </>
                          )}
                        </button>

                        {isTimerActive && (
                          <button
                            type="button"
                            onClick={() => resetTimer(step.timer_seconds)}
                            className="text-[10px] text-sage hover:text-forest flex items-center gap-0.5 font-bold"
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
          <div className="p-4 rounded-2xl border-2 border-forest/20 bg-cream-soft text-xs text-forest">
            <h4 className="font-black flex items-center gap-1.5 mb-2 text-forest text-sm">
              <AlertCircle className="w-4 h-4 text-coral" />
              스마트 대체 양념 & 조리 꿀팁
            </h4>
            <ul className="space-y-1 pl-5 list-disc text-sage font-medium">
              {day.alternative_sauces.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

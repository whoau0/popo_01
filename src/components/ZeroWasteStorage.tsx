import React from 'react';
import { StorageGuide } from '../types/mealcart';
import { Leaf, ShieldCheck, Sparkles } from 'lucide-react';

interface ZeroWasteStorageProps {
  storageGuides: StorageGuide[];
}

export const ZeroWasteStorage: React.FC<ZeroWasteStorageProps> = ({ storageGuides }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-forest shadow-solid flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-forest/15">
        <div>
          <span className="font-script text-coral text-lg font-bold select-none">
            Zero Waste Initiative
          </span>
          <h2 className="text-xl font-black text-forest tracking-tight">
            잔여 식재료 제로(Zero-Waste) 보관소
          </h2>
          <p className="text-xs text-sage font-medium">한 번 산 식재료는 100% 알뜰 소진 및 신선 보관법 제공</p>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-black text-forest bg-lime px-3.5 py-1.5 rounded-full border-2 border-forest shadow-solid-sm self-start sm:self-auto">
          <span>♻️</span>
          <span>폐기율 0% 목표</span>
        </span>
      </div>

      {/* Zero Waste Workflow Illustration inspired by Pinterest */}
      <div className="p-5 rounded-2xl bg-forest text-white border-2 border-forest shadow-solid-sm flex flex-col sm:flex-row items-center gap-4 text-xs">
        <div className="w-12 h-12 rounded-2xl bg-lime text-forest flex items-center justify-center font-bold text-2xl shrink-0 border-2 border-forest shadow-xs">
          ♻️
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-lime text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-lime" />
            식재료 순환 소진 맵핑 (Cycle System)
          </h4>
          <p className="text-cream-soft/90 leading-relaxed text-xs font-medium">
            묶음으로 구매한 대파나 양파, 두부 등은 주간 식단표 내 2~3회 연속 분할 투입되며, 쓰고 남은 잔여 분량은 최적의 보관법을 적용하여 신선도를 끝까지 유지합니다.
          </p>
        </div>
      </div>

      {/* Storage Tip Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5 border-b-2 border-forest/15 pb-2">
          <ShieldCheck className="w-4 h-4 text-coral" />
          이번 주 남는 식재료 맞춤 보관 솔루션
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {storageGuides.map((guide, idx) => {
            const isHigh = guide.urgency === 'high';
            return (
              <div
                key={guide.id || idx}
                className="p-4 rounded-2xl border-2 border-forest/20 bg-cream-soft hover:border-forest transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-forest flex items-center gap-2">
                      <span className="w-2 h-2 bg-forest rounded-full" />
                      {guide.item}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        isHigh
                          ? 'bg-coral text-white border-forest shadow-xs'
                          : 'bg-lime text-forest border-forest shadow-xs'
                      }`}
                    >
                      {isHigh ? '3일 내 빠른 소진 권장' : '장기 냉동 보관 가능'}
                    </span>
                  </div>
                  <p className="text-xs text-forest/90 leading-relaxed font-medium">
                    {guide.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

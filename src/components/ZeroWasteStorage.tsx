import React from 'react';
import { StorageGuide } from '../types/mealcart';
import { Leaf, ShieldCheck, Clock, CheckCircle2, TrendingDown, Sparkles } from 'lucide-react';

interface ZeroWasteStorageProps {
  storageGuides: StorageGuide[];
}

export const ZeroWasteStorage: React.FC<ZeroWasteStorageProps> = ({ storageGuides }) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">잔여 식재료 제로(Zero-Waste) 보관소</h2>
            <p className="text-xs text-slate-500">한 번 산 식재료는 100% 알뜰 소진 및 신선 보관법 제공</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <TrendingDown className="w-3.5 h-3.5" />
          폐기율 0% 목표
        </span>
      </div>

      {/* Zero Waste Workflow Illustration */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-brand-50 border border-emerald-100 flex flex-col sm:flex-row items-center gap-4 text-xs text-emerald-950">
        <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
          ♻️
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-emerald-900">식재료 순환 소진 맵핑 (Cycle System)</h4>
          <p className="text-emerald-800/90 leading-relaxed text-[11px]">
            묶음으로 구매한 대파나 양파, 두부 등은 주간 식단표 내 2~3회 연속 분할 투입되며, 쓰고 남은 잔여 분량은 최적의 보관법을 적용하여 신선도를 끝까지 유지합니다.
          </p>
        </div>
      </div>

      {/* Storage Tip Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          이번 주 남는 식재료 맞춤 보관 솔루션
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {storageGuides.map((guide, idx) => {
            const isHigh = guide.urgency === 'high';
            return (
              <div
                key={guide.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {guide.item}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isHigh ? '3일 내 빠른 소진 권장' : '장기 냉동 보관 가능'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
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

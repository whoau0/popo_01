import React, { useState } from 'react';
import { SmartCart as SmartCartType, CartItem } from '../types/mealcart';
import { ShoppingCart, ExternalLink, Check, Copy, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartCartProps {
  cart: SmartCartType;
  onToggleItem: (category: keyof SmartCartType, itemId: string) => void;
}

export const SmartCart: React.FC<SmartCartProps> = ({ cart, onToggleItem }) => {
  const [copied, setCopied] = useState(false);

  // Calculate total and checked items
  const allItems: { item: CartItem; category: keyof SmartCartType }[] = [];
  (['vegetables', 'meat_seafood', 'sauce_pantry', 'processed_others'] as (keyof SmartCartType)[]).forEach((cat) => {
    if (cart[cat]) {
      cart[cat]!.forEach((item) => allItems.push({ item, category: cat }));
    }
  });

  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) => i.item.checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleToggle = (category: keyof SmartCartType, itemId: string, isCheckedNow: boolean) => {
    onToggleItem(category, itemId);
    if (!isCheckedNow && checkedCount + 1 === totalCount) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleCopyList = () => {
    let text = '🛒 [MealCart AI] 이번 주 스마트 장보기 목록\n\n';

    if (cart.vegetables?.length) {
      text += '🥦 신선 채소/과일:\n';
      cart.vegetables.forEach((item) => (text += ` - [${item.checked ? 'V' : ' '}] ${item.name} (${item.quantity || ''})\n`));
    }
    if (cart.meat_seafood?.length) {
      text += '\n🥩 정육/수산:\n';
      cart.meat_seafood.forEach((item) => (text += ` - [${item.checked ? 'V' : ' '}] ${item.name} (${item.quantity || ''})\n`));
    }
    if (cart.sauce_pantry?.length) {
      text += '\n🥫 양념/소스/가공:\n';
      cart.sauce_pantry.forEach((item) => (text += ` - [${item.checked ? 'V' : ' '}] ${item.name} (${item.quantity || ''})\n`));
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCategory = (
    title: string,
    icon: string,
    categoryKey: keyof SmartCartType,
    items?: CartItem[]
  ) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
          <span>{icon}</span>
          <span>{title}</span>
          <span className="text-[11px] font-normal text-slate-400">({items.length})</span>
        </h4>

        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = !!item.checked;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                    : 'bg-white border-slate-200/90 hover:border-brand-300 shadow-xs'
                }`}
              >
                {/* Item label & Checkbox */}
                <div
                  onClick={() => handleToggle(categoryKey, item.id, isChecked)}
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      isChecked
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'bg-white border-slate-300 hover:border-brand-500'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span className="text-[11px] text-slate-400 ml-2">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                </div>

                {/* Coupang Deep Link */}
                <a
                  href={item.purchase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200 rounded-lg transition-colors"
                  title="쿠팡에서 바로 검색 및 구매"
                >
                  <span>쿠팡 검색</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col gap-6">
      {/* Header & Progress */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">스마트 장보기 카트</h2>
              <p className="text-xs text-slate-500">냉장고 재고를 차감한 순수 필요 품목</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyList}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-brand-700">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>목록 복사</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>장보기 완료율 ({checkedCount}/{totalCount})</span>
            <span className="text-brand-600 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Categorized Lists */}
      <div className="space-y-6">
        {renderCategory('신선 채소 / 과일', '🥦', 'vegetables', cart.vegetables)}
        {renderCategory('정육 / 수산물', '🥩', 'meat_seafood', cart.meat_seafood)}
        {renderCategory('양념 / 소스 / 부재료', '🥫', 'sauce_pantry', cart.sauce_pantry)}
        {renderCategory('가공식품 및 기타', '🍞', 'processed_others', cart.processed_others)}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { SmartCart as SmartCartType, CartItem } from '../types/mealcart';
import { ShoppingCart, ExternalLink, Check, Copy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartCartProps {
  cart: SmartCartType;
  onToggleItem: (category: keyof SmartCartType, itemId: string) => void;
}

export const SmartCart: React.FC<SmartCartProps> = ({ cart, onToggleItem }) => {
  const [copied, setCopied] = useState(false);

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
        <div className="flex items-center justify-between border-b-2 border-forest/15 pb-2">
          <h4 className="text-xs font-black text-forest flex items-center gap-2 uppercase tracking-wider">
            <span>{icon}</span>
            <span>{title}</span>
            <span className="text-[11px] font-bold text-sage">({items.length})</span>
          </h4>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isChecked = !!item.checked;
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isChecked
                    ? 'bg-cream-soft/50 border-forest/10 opacity-55'
                    : 'bg-white border-forest/20 hover:border-forest shadow-xs'
                }`}
              >
                {/* Item label & Checkbox */}
                <div
                  onClick={() => handleToggle(categoryKey, item.id, isChecked)}
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                      isChecked
                        ? 'bg-forest border-forest text-lime'
                        : 'bg-white border-forest/40 hover:border-forest'
                    }`}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className={`text-xs font-black ${isChecked ? 'line-through text-sage' : 'text-forest'}`}>
                      {item.name}
                    </span>
                    {item.quantity && (
                      <span className="text-[11px] text-sage ml-2 font-medium">
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
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-[11px] font-black text-coral bg-coral/10 hover:bg-coral hover:text-white border-2 border-coral/30 rounded-full transition-all shadow-xs"
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
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-forest shadow-solid flex flex-col gap-6">
      {/* Header & Progress */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-forest/15 mb-4">
          <div>
            <span className="font-script text-coral text-lg font-bold select-none">
              Smart Deduplication
            </span>
            <h2 className="text-xl font-black text-forest tracking-tight">스마트 장보기 카트</h2>
            <p className="text-xs text-sage font-medium">냉장고 재고를 차감한 순수 필요 품목만 자동 분류</p>
          </div>

          <button
            type="button"
            onClick={handleCopyList}
            className="flex items-center gap-1.5 px-4 py-2 bg-lime hover:bg-lime-hover text-forest text-xs font-black rounded-full border-2 border-forest shadow-solid-sm active:translate-y-0.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>목록 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>장보기 목록 복사</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-cream-soft p-4 rounded-2xl border-2 border-forest/15">
          <div className="flex items-center justify-between text-xs font-black text-forest mb-2">
            <span className="uppercase tracking-wider text-sage font-bold">장보기 완료율 ({checkedCount}/{totalCount})</span>
            <span className="text-forest font-black text-sm bg-lime px-2 py-0.5 rounded-full border border-forest">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 border-2 border-forest/20 overflow-hidden">
            <div
              className="bg-lime h-full rounded-full transition-all duration-300 border-r border-forest"
              style={{ width: `${progressPercent}%` }}
            />
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

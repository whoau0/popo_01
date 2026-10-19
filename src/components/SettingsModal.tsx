import React, { useState } from 'react';
import { getStoredGeminiKey, setStoredGeminiKey } from '../services/geminiService';
import { Settings, Key, Check, ExternalLink, Database, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState(getStoredGeminiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredGeminiKey());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredGeminiKey(apiKey);
    setSavedSuccess(true);
    onKeySaved();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-forest shadow-solid-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-forest/15 mb-4">
          <div>
            <span className="font-script text-coral text-base font-bold select-none">
              System Configuration
            </span>
            <h3 className="text-lg font-black text-forest">환경 설정 & API 연동</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-soft text-forest hover:bg-coral hover:text-white flex items-center justify-center border border-forest/20 transition-all font-black"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-black text-forest uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Key className="w-3.5 h-3.5 text-coral" />
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI Studio에서 발급받은 API 키를 입력하세요"
              className="w-full px-4 py-2.5 text-xs bg-cream-soft text-forest border-2 border-forest/25 rounded-2xl focus:outline-none focus:border-forest focus:bg-white font-mono"
            />
            <p className="text-[11px] text-sage mt-1.5 flex items-center justify-between font-medium">
              <span>* 브라우저 로컬 저장소에 안전하게 보관됩니다.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral underline font-black hover:text-coral-hover flex items-center gap-0.5"
              >
                무료 키 발급 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>

          {/* Supabase Status Section */}
          <div className="p-4 rounded-2xl bg-cream-soft border-2 border-forest/15 space-y-1.5 text-xs">
            <div className="font-black text-forest flex items-center gap-1.5">
              <Database className="w-4 h-4 text-forest" />
              Supabase 클라우드 데이터베이스
            </div>
            <p className="text-[11px] text-sage font-medium">
              프로젝트: <span className="font-mono text-forest font-black">branch-sales</span> (연동 완료)
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-forest font-bold pt-1">
              <Check className="w-3.5 h-3.5 text-coral stroke-[3]" />
              자동 동기화 및 오프라인 로컬 캐시 활성화됨
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-cream-soft text-forest text-xs font-black rounded-full border-2 border-forest shadow-solid-sm transition-all"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 bg-lime hover:bg-lime-hover text-forest text-xs font-black rounded-full border-2 border-forest shadow-solid-sm active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>저장 완료!</span>
              </>
            ) : (
              <span>설정 저장</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

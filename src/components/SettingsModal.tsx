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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">환경 설정 & API 연동</h3>
              <p className="text-xs text-slate-500">Gemini AI 및 백엔드 설정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini API Key Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Key className="w-3.5 h-3.5 text-brand-600" />
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI Studio에서 발급받은 API 키를 입력하세요"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>* 브라우저 로컬 저장소에 안전하게 보관됩니다.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 font-bold hover:underline flex items-center gap-0.5"
              >
                무료 키 발급 <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>

          {/* Supabase Status Section */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Supabase 클라우드 데이터베이스
            </div>
            <p className="text-[11px] text-slate-500">
              프로젝트: <span className="font-mono text-slate-700 font-bold">branch-sales</span> (연동 완료)
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold pt-1">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              자동 동기화 및 오프라인 로컬 캐시 활성화됨
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-1.5"
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

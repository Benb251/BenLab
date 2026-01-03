import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Save, Sliders, Database,
  Download, Upload, Trash2,
  Volume2, VolumeX, Terminal,
  Cpu, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ASPECT_RATIOS } from '@/constants';
import { useSettingsStore } from '@/store/settingsStore';
import { useTranslation } from '@/lib/translations';

interface SettingsModalProps {
  onClose: () => void;
  gallerySize: number;
  onExport: () => void;
  onImport: (file: File) => void;
  onPurge: () => void;
}

type TabId = 'defaults' | 'storage';

const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  gallerySize,
  onExport,
  onImport,
  onPurge
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('defaults');

  // Store
  const {
    language, setLanguage,
    negativePrompt, setNegativePrompt,
    defaultRatio, setDefaultRatio,
    soundEnabled, setSoundEnabled
  } = useSettingsStore();

  const t = useTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 font-sans text-zinc-200">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#000000]/90 backdrop-blur-md"
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
      </motion.div>

      {/* Main Window */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-4xl h-[650px] bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex overflow-hidden rounded-[2px]"
      >

        {/* --- SIDEBAR --- */}
        <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col relative z-20">
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
            <h2 className="font-['Oswald'] text-lg font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-100">
              <Cpu className="w-5 h-5 text-orange-500 animate-pulse" />
              {t('settings.title')}
            </h2>
            <p className="text-[9px] font-mono text-zinc-500 mt-1">{t('settings.subtitle')}</p>
          </div>

          <div className="flex-1 py-6 px-3 space-y-2">
            {[
              { id: 'defaults', label: t('settings.tab.defaults'), icon: Sliders },
              { id: 'storage', label: t('settings.tab.storage'), icon: Database },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 rounded-[2px] border",
                  activeTab === tab.id
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
                )}
              >
                <tab.icon className={cn("w-4 h-4", activeTab === tab.id && "text-orange-500")} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Footer Status */}
          <div className="p-4 border-t border-zinc-800 text-[9px] font-mono text-zinc-600 flex justify-between">
            <span>MEM: {Math.floor(gallerySize * 0.5)} MB</span>
            <span>UP: 99.9%</span>
          </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="flex-1 bg-[#09090b] relative flex flex-col">

          {/* Decorative Top Line */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors z-50 hover:bg-white/5 rounded-[2px]"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
            <AnimatePresence mode="wait">

              {/* 1. DEFAULTS TAB */}
              {activeTab === 'defaults' && (
                <motion.div
                  key="defaults"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <header>
                    <h3 className="font-['Oswald'] text-2xl text-white uppercase tracking-widest flex items-center gap-3">
                      <Sliders className="w-6 h-6 text-zinc-500" /> {t('settings.def.params')}
                    </h3>
                    <div className="h-1 w-12 bg-orange-500 mt-4" />
                  </header>

                  <div className="space-y-8">
                    {/* Language Selector */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <Globe className="w-3 h-3" /> {t('settings.def.language')}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLanguage('en')}
                          className={cn(
                            "px-4 py-2 text-[10px] font-mono font-bold uppercase border transition-all",
                            language === 'en'
                              ? "bg-orange-500 text-black border-orange-500"
                              : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                          )}
                        >
                          ENGLISH
                        </button>
                        <button
                          onClick={() => setLanguage('vi')}
                          className={cn(
                            "px-4 py-2 text-[10px] font-mono font-bold uppercase border transition-all",
                            language === 'vi'
                              ? "bg-orange-500 text-black border-orange-500"
                              : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                          )}
                        >
                          TIẾNG VIỆT
                        </button>
                      </div>
                    </div>

                    {/* Negative Prompt */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        <Terminal className="w-3 h-3" /> {t('settings.def.negPrompt')}
                      </label>
                      <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        placeholder="blurred, distorted, low quality, ugly, watermark..."
                        className="w-full h-32 bg-black border border-zinc-700 p-4 font-mono text-xs text-zinc-300 focus:outline-none focus:border-orange-500 transition-colors resize-none placeholder:text-zinc-700 leading-relaxed"
                      />
                      <p className="text-[9px] font-mono text-zinc-600">
                        {t('settings.def.negPromptDesc')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Default Ratio */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {t('settings.def.ratio')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {ASPECT_RATIOS.slice(0, 4).map(r => (
                            <button
                              key={r.id}
                              onClick={() => setDefaultRatio(r.id)}
                              className={cn(
                                "px-3 py-2 text-[10px] font-mono font-bold uppercase border transition-all",
                                defaultRatio === r.id
                                  ? "bg-orange-500 text-black border-orange-500"
                                  : "bg-zinc-900 text-zinc-500 border-zinc-700 hover:border-zinc-500"
                              )}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sound Toggle */}
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                          {t('settings.def.audio')}
                        </label>
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 border transition-all w-full md:w-auto",
                            soundEnabled
                              ? "bg-zinc-800 border-zinc-600 text-white"
                              : "bg-black border-zinc-800 text-zinc-600"
                          )}
                        >
                          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          <span className="text-[10px] font-mono uppercase tracking-wider">
                            {soundEnabled ? t('settings.def.sfxOn') : t('settings.def.sfxOff')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 2. STORAGE TAB */}
              {activeTab === 'storage' && (
                <motion.div
                  key="storage"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <header>
                    <h3 className="font-['Oswald'] text-2xl text-white uppercase tracking-widest flex items-center gap-3">
                      <Database className="w-6 h-6 text-zinc-500" /> {t('settings.store.vault')}
                    </h3>
                    <div className="h-1 w-12 bg-orange-500 mt-4" />
                  </header>

                  <div className="space-y-8">
                    {/* Storage Meter */}
                    <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-[2px] space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t('settings.store.usage')}</span>
                        <span className="font-mono text-xl text-white">{gallerySize} <span className="text-xs text-zinc-600">{t('settings.store.records')}</span></span>
                      </div>
                      {/* Mock Progress Bar */}
                      <div className="h-2 w-full bg-zinc-950 border border-zinc-800 relative overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((gallerySize / 100) * 100, 100)}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className="absolute inset-y-0 left-0 bg-orange-500"
                        />
                        {/* Stripes */}
                        <div className="absolute inset-0 opacity-20"
                          style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '10px 10px' }}
                        />
                      </div>
                      <p className="text-[9px] font-mono text-zinc-600 text-right">
                        {t('settings.store.est')}: ~{(gallerySize * 0.5).toFixed(1)} MB
                      </p>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button
                        onClick={onExport}
                        className="p-6 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-600 transition-all group flex flex-col items-center gap-3"
                      >
                        <Download className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                        <div className="text-center">
                          <div className="font-['Oswald'] text-sm text-zinc-200 uppercase tracking-wide">{t('settings.store.backup')}</div>
                          <div className="text-[9px] font-mono text-zinc-600 mt-1">{t('settings.store.export')}</div>
                        </div>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-6 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-600 transition-all group flex flex-col items-center gap-3 relative"
                      >
                        <Upload className="w-6 h-6 text-zinc-500 group-hover:text-white transition-colors" />
                        <div className="text-center">
                          <div className="font-['Oswald'] text-sm text-zinc-200 uppercase tracking-wide">{t('settings.store.restore')}</div>
                          <div className="text-[9px] font-mono text-zinc-600 mt-1">{t('settings.store.import')}</div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/json"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(t('settings.store.purgeConfirm'))) {
                            onPurge();
                          }
                        }}
                        className="p-6 border border-red-900/30 bg-red-950/5 hover:bg-red-900/20 hover:border-red-500/50 transition-all group flex flex-col items-center gap-3"
                      >
                        <Trash2 className="w-6 h-6 text-red-800 group-hover:text-red-500 transition-colors" />
                        <div className="text-center">
                          <div className="font-['Oswald'] text-sm text-red-900 group-hover:text-red-500 uppercase tracking-wide transition-colors">{t('settings.store.purge')}</div>
                          <div className="text-[9px] font-mono text-red-900/50 group-hover:text-red-500/50 mt-1">{t('settings.store.delete')}</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-6 border-t border-zinc-800 bg-[#0a0a0c] flex justify-end items-center gap-4 relative z-20">
            <button
              onClick={onClose}
              className="text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
            >
              {t('settings.cancel')}
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-zinc-200 font-['Oswald'] text-sm font-bold uppercase tracking-widest transition-colors"
            >
              <Save className="w-3 h-3" />
              {t('settings.save')}
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default SettingsModal;
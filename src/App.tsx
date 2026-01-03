import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import Hero from '@/layouts/Hero';
import { ScrollIndicator, WindowTitleBar } from '@/components/ui';
import SettingsModal from '@/layouts/SettingsModal';
import { getHistory, saveImage, clearHistory } from '@/lib/db';

const App: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [galleryCount, setGalleryCount] = useState(0);

  // Refresh stats when settings open
  useEffect(() => {
    if (isSettingsOpen) {
      getHistory()
        .then(h => setGalleryCount(h.length))
        .catch(e => console.error("Failed to refresh gallery count:", e));
    }
  }, [isSettingsOpen]);

  // Export DB to JSON File
  const handleExport = async () => {
    try {
      const data = await getHistory();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `benlab_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export Failed", e);
      alert("System Error: Export Failed");
    }
  };

  // Import DB from JSON File
  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        if (Array.isArray(data)) {
          let count = 0;
          for (const item of data) {
            if (item.id && item.url) {
              await saveImage(item);
              count++;
            }
          }
          alert(`SUCCESS: Restored ${count} records to Vault.`);
          getHistory().then(h => setGalleryCount(h.length));
        } else {
          throw new Error("Invalid Format");
        }
      } catch (err) {
        console.error("Import Failed", err);
        alert("System Error: Invalid Backup File");
      }
    };
    reader.readAsText(file);
  };

  const handlePurge = async () => {
    await clearHistory();
    setGalleryCount(0);
    alert("SYSTEM PURGED: Vault is empty.");
  };

  return (
    <main className="w-full min-h-screen bg-[#050505] text-[#EAEAEA] overflow-hidden selection:bg-white selection:text-black relative flex flex-col">
      {/* Title Bar at the very top as a block element */}
      <WindowTitleBar />

      {/* --- GLOBAL SETTINGS BUTTON --- */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-12 right-6 z-[900] group flex items-center justify-center w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md rounded-[2px] hover:bg-white hover:border-white transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
        title="System Configuration"
      >
        <Settings className="w-5 h-5 text-white/70 group-hover:text-black group-hover:rotate-90 transition-all duration-700 ease-out" />

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30 group-hover:border-black/50 transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30 group-hover:border-black/50 transition-colors" />
      </motion.button>

      {/* --- MAIN CONTENT SCROLL AREA --- */}
      <div className="flex-1 overflow-y-auto relative scrollbar-hide">
        <Hero />
        <ScrollIndicator />
      </div>

      {/* --- GLOBAL MODALS --- */}
      <AnimatePresence mode="wait">
        {isSettingsOpen && (
          <SettingsModal
            key="settings-modal"
            onClose={() => setIsSettingsOpen(false)}
            gallerySize={galleryCount}
            onExport={handleExport}
            onImport={handleImport}
            onPurge={handlePurge}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default App;
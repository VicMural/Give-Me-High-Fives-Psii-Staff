'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useProjectStore, ACADEMIC_CATEGORIES, getCategoryStyles } from '@/lib/store';

export default function AddFolderModal({ onClose }: { onClose: () => void }) {
  const store = useProjectStore();

  const [title, setTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleFinish = () => {
    if (!title.trim()) return;
    store.addFolder(title, selectedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/10 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100"
      >
        <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">New Folder</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 ml-0.5">Project Name</label>
            <input 
              type="text" 
              placeholder="E.g. Senior Capstone"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm p-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400 font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 ml-0.5">Academic Competencies</label>
            <div className="flex flex-wrap gap-1.5">
              {ACADEMIC_CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                const styles = getCategoryStyles(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    style={isSelected 
                      ? { backgroundColor: styles.bg, color: styles.text, borderColor: styles.bg } 
                      : { backgroundColor: styles.bg, color: styles.text, filter: 'saturate(30%) opacity(60%)' }
                    }
                    className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border border-transparent ${
                      isSelected 
                        ? 'shadow-sm' 
                        : 'hover:filter-none hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button 
              disabled={!title.trim()}
              onClick={handleFinish}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Check size={14} />
              Create Folder
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

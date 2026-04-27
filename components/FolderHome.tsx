'use client';

import React, { useState } from 'react';
import { Plus, LayoutGrid, Folder as FolderIcon, X } from 'lucide-react';
import { useProjectStore, ACADEMIC_CATEGORIES, getCategoryStyles } from '@/lib/store';
import AddFolderModal from '@/components/AddFolderModal';

const TABS = ["All", ...ACADEMIC_CATEGORIES];

export default function FolderHome() {
  const store = useProjectStore();
  const [activeTab, setActiveTab] = useState("All");
  const [isAdding, setIsAdding] = useState(false);

  const filteredFolders = store.folders
    .filter(f => activeTab === "All" || f.categories.includes(activeTab))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header and Tabs */}
      <div className="pt-6 px-6 pb-4 border-b border-gray-100 flex flex-col gap-4 shrink-0 z-10 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="font-medium tracking-tight text-xl text-gray-900">
            Give Me High Fives Psii Staff
          </h1>
          <button 
            onClick={() => store.setView('all')}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg font-normal text-sm transition-colors border border-gray-200"
          >
            <LayoutGrid size={16} />
            General Workspace
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 pb-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab;
            const styles = tab !== "All" ? getCategoryStyles(tab) : { bg: '#111827', text: '#ffffff' };
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={isActive 
                  ? { backgroundColor: styles.bg, color: styles.text, borderColor: styles.bg } 
                  : { backgroundColor: styles.bg, color: styles.text, filter: 'saturate(30%) opacity(60%)' }
                }
                className={`px-3 py-1.5 rounded-full font-medium text-xs transition-all border ${
                  isActive 
                    ? 'shadow-sm border-transparent' 
                    : 'border-transparent hover:filter-none hover:opacity-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#FAFAFA]">
        {filteredFolders.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <FolderIcon size={48} className="mb-4 opacity-50" strokeWidth={1.5} />
            <p className="text-lg font-medium text-gray-500">No project folders found.</p>
            <p className="text-sm">Click the plus button to create your first folder.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFolders.map(folder => {
              const nodeCount = store.nodes.filter(n => n.data.projectId === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => store.setView('project', folder.id)}
                  className="bg-white border border-gray-200 p-4 rounded-2xl aspect-square flex flex-col items-start justify-between text-left hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-full">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3 text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                      <FolderIcon size={20} />
                    </div>
                    <h3 className="font-medium text-base text-gray-900 mb-1 line-clamp-2 leading-tight">
                      {folder.title}
                    </h3>
                  </div>

                  <div className="w-full space-y-2">
                    {folder.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {folder.categories.map((cat, i) => {
                          const styles = getCategoryStyles(cat);
                          return (
                            <span 
                              key={i} 
                              style={{ backgroundColor: styles.bg, color: styles.text }}
                              className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded shadow-sm truncate max-w-full"
                            >
                              {cat}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="text-[11px] text-gray-400 font-normal pt-2 border-t border-gray-100 w-full">
                      {nodeCount} {nodeCount === 1 ? 'Node' : 'Nodes'} • {new Date(folder.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="absolute bottom-8 right-8 z-40 w-16 h-16 bg-gray-900 text-white rounded-full shadow-lg shadow-gray-300 flex items-center justify-center hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 group"
        aria-label="Add new project folder"
      >
        <Plus size={32} className="transition-transform group-hover:rotate-90 duration-300" />
      </button>

      {isAdding && <AddFolderModal onClose={() => setIsAdding(false)} />}
    </div>
  );
}

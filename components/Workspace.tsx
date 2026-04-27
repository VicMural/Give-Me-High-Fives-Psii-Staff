'use client';

import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import { ArrowLeft, Plus } from 'lucide-react';
import InquiryNode from '@/components/InquiryNode';
import AddNodeWizard from '@/components/AddNodeWizard';
import AddFolderModal from '@/components/AddFolderModal';
import { useProjectStore, getCategoryStyles } from '@/lib/store';

export default function Workspace() {
  const store = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);

  const nodeTypes = useMemo(() => ({ inquiry: InquiryNode }), []);

  // Filter nodes and edges if we are in a specific project view
  const nodes = useMemo(() => {
    if (store.view === 'all') return store.nodes;
    return store.nodes.filter(n => n.data.projectId === store.currentProjectId);
  }, [store.nodes, store.view, store.currentProjectId]);

  const edges = useMemo(() => {
    if (store.view === 'all') return store.edges;
    // Keep edges where both source and target are in the current nodes list
    return store.edges.filter(e => 
      nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target)
    );
  }, [store.edges, nodes, store.view]);

  const currentFolder = store.currentProjectId 
    ? store.folders.find(f => f.id === store.currentProjectId)
    : null;

  const [isAddingFolder, setIsAddingFolder] = useState(false);

  return (
    <div className="w-full h-full relative bg-[#FAFAFA]">
      <div className="absolute top-6 left-6 z-40 flex items-center gap-4">
        <button 
          onClick={() => store.setView('home')}
          className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:-translate-x-1 transition-all"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-gray-200 pointer-events-auto flex items-center gap-4">
          <h1 className="font-medium tracking-tight text-lg text-gray-900">
            {store.view === 'all' ? 'General Workspace' : currentFolder?.title || 'Project'}
          </h1>
          {currentFolder && currentFolder.categories.length > 0 && (
            <div className="hidden md:flex gap-1.5 pl-4 border-l border-gray-200">
              {currentFolder.categories.map(cat => {
                const styles = getCategoryStyles(cat);
                return (
                  <span 
                    key={cat} 
                    style={{ backgroundColor: styles.bg, color: styles.text }}
                    className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap"
                  >
                    {cat}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={store.onNodesChange} // This applies directly to global store. xyflow uses ID merging, so it's safe.
        onEdgesChange={store.onEdgesChange}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        fitView
        fitViewOptions={{ padding: 1, maxZoom: 0.4, minZoom: 0.1 }}
        className="bg-[#FAFAFA]"
      >
        <Controls 
          className="!bg-white !border-gray-200 !shadow-sm !rounded-lg overflow-hidden [&>button]:!border-b-gray-100 [&>button:hover]:!bg-gray-50" 
          position="bottom-left" 
        />
      </ReactFlow>

      {store.view === 'project' && store.currentProjectId && (
        <button
          onClick={() => setIsAdding(true)}
          className="absolute bottom-8 right-8 z-40 w-16 h-16 bg-gray-900 text-white rounded-full shadow-lg shadow-gray-300 flex items-center justify-center hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0 group pointer-events-auto cursor-pointer"
          aria-label="Add new inquiry"
        >
          <Plus size={32} className="transition-transform group-hover:rotate-90 duration-300" />
        </button>
      )}

      {store.view === 'all' && (
        <div className="absolute bottom-8 right-8 z-40 group flex flex-col items-center">
          <div className="flex flex-col items-center gap-2 mb-4 translate-y-4 opacity-0 scale-95 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
            <button onClick={() => setIsAddingFolder(true)} className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-xl shadow-md text-sm font-semibold hover:bg-gray-50 whitespace-nowrap hover:-translate-y-0.5 transition-transform">
              Add Project
            </button>
            <button onClick={() => setIsAdding(true)} className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-xl shadow-md text-sm font-semibold hover:bg-gray-50 whitespace-nowrap hover:-translate-y-0.5 transition-transform">
              Add Node
            </button>
          </div>
          <button
            className="w-16 h-16 bg-gray-900 text-white rounded-full shadow-lg shadow-gray-300 flex items-center justify-center group-hover:bg-gray-800 transition-all duration-200 pointer-events-auto shadow-[0_4px_24px_rgba(0,0,0,0.15)]"
          >
            <Plus size={32} className="transition-transform group-hover:rotate-45 duration-300" />
          </button>
        </div>
      )}

      {isAdding && (
        <AddNodeWizard projectId={store.currentProjectId || undefined} onClose={() => setIsAdding(false)} />
      )}
      
      {isAddingFolder && (
        <AddFolderModal onClose={() => setIsAddingFolder(false)} />
      )}
    </div>
  );
}

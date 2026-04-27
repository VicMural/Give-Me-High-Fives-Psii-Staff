'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowDownUp, Image as ImageIcon, Music, Video, Paperclip, ChevronRight, Search } from 'lucide-react';
import { useProjectStore, InquiryNode } from '@/lib/store';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'sXpGFDGpz0Dv1VDnziMB2n3Wbdv0vCeb');

export default function AddNodeWizard({ projectId, onClose }: { projectId?: string; onClose: () => void }) {
  const store = useProjectStore();
  
  // Build hierarchy
  const [hierarchyTopDown, setHierarchyTopDown] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || (store.folders[0]?.id || ''));

  const hierarchicalNodes = React.useMemo(() => {
    const nodes = store.nodes.filter(n => n.data.projectId === selectedProjectId);
    const edges = store.edges;
    
    const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
    const sorted: Array<InquiryNode & { depth: number }> = [];
    const visited = new Set<string>();

    const traverse = (node: InquiryNode, depth: number) => {
       if (visited.has(node.id)) return;
       visited.add(node.id);
       sorted.push({ ...node, depth });
       const childrenEdges = edges.filter(e => e.source === node.id);
       const children = childrenEdges.map(e => nodes.find(n => n.id === e.target)).filter(Boolean) as InquiryNode[];
       children.forEach(c => traverse(c, depth + 1));
    };

    rootNodes.forEach(r => traverse(r, 0));
    
    // Add any unconnected nodes just in case
    nodes.filter(n => !visited.has(n.id)).forEach(n => traverse(n, 0));

    if (!hierarchyTopDown) {
      return [...sorted].reverse();
    }
    return sorted;
  }, [store.nodes, store.edges, selectedProjectId, hierarchyTopDown]);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [parentIdState, setParentIdState] = useState<string | null>(null);
  const [inquiryDepth, setInquiryDepth] = useState('');
  const [artifact, setArtifact] = useState<{ type: 'image' | 'audio' | 'video' | 'gif'; name: string; url?: string } | undefined>();
  
  const [isSearchingGif, setIsSearchingGif] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const [debouncedGifSearch, setDebouncedGifSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'image' | 'audio' | 'video' | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedGifSearch(gifSearchTerm), 500);
    return () => clearTimeout(t);
  }, [gifSearchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadType) {
      const url = URL.createObjectURL(file);
      setArtifact({ type: uploadType, name: file.name, url });
    }
  };

  const handleUploadClick = (type: 'image' | 'audio' | 'video' | 'gif') => {
    if (type === 'gif') {
      setIsSearchingGif(true);
      return;
    }
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/png, image/jpeg, image/webp, image/svg+xml' :
                                   type === 'audio' ? 'audio/mpeg, audio/wav' :
                                   'video/mp4';
      fileInputRef.current.click();
    }
  };

  // Determine actual parentId based on current state and valid nodes
  const parentId = React.useMemo(() => {
    if (hierarchicalNodes.length === 0) return null;
    if (parentIdState && hierarchicalNodes.some(n => n.id === parentIdState)) {
      return parentIdState;
    }
    return hierarchyTopDown ? hierarchicalNodes[0].id : hierarchicalNodes[hierarchicalNodes.length - 1].id;
  }, [parentIdState, hierarchicalNodes, hierarchyTopDown]);

  const setParentId = (id: string | null) => setParentIdState(id);

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || !selectedProjectId) return;
    setStep(2);
  };

  const handleFinish = () => {
    store.addNode({
      title,
      inquiryDepth,
      projectId: selectedProjectId,
      artifact
    }, parentId);
    onClose();
  };

  const artifactButtons = [
    { type: 'image' as const, label: 'Image', icon: ImageIcon, desc: 'png, jpg, webp, svg' },
    { type: 'audio' as const, label: 'Audio', icon: Music, desc: 'mp3, wav' },
    { type: 'video' as const, label: 'Video', icon: Video, desc: 'mp4' },
    { type: 'gif' as const, label: 'GIF', icon: Paperclip, desc: 'giphy' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/10 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 flex flex-col"
      >
        <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-900">Add Node</h2>
            <div className="flex gap-1 items-center ml-2">
              <div className={`h-1 w-6 rounded-full transition-colors ${step >= 1 ? 'bg-gray-900' : 'bg-gray-200'}`} />
              <div className={`h-1 w-6 rounded-full transition-colors ${step >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="relative overflow-hidden w-full h-[400px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleNext} 
                className="absolute inset-0 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin"
              >
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 ml-0.5">Question / Title</label>
                  <input 
                    type="text" 
                    placeholder="E.g. What defines a sustainable ecosystem?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-sm p-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 ml-0.5">Details (Optional)</label>
                  <input 
                    type="text"
                    value={inquiryDepth}
                    onChange={(e) => setInquiryDepth(e.target.value)}
                    placeholder="Short note or deeper context..."
                    className="w-full text-xs p-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                  {!projectId && (
                    <div className="mb-2 shrink-0">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 ml-0.5">Project</label>
                      <select 
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full text-xs p-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 outline-none"
                      >
                        <option value="" disabled>Select a project</option>
                        {store.folders.map(f => (
                          <option key={f.id} value={f.id}>{f.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex justify-between items-center px-0.5 shrink-0">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400">Connect to Parent Node</label>
                    <button 
                      type="button" 
                      onClick={() => setHierarchyTopDown(!hierarchyTopDown)}
                      className="text-[10px] uppercase font-bold tracking-wider text-gray-500 hover:text-gray-900 flex items-center gap-1"
                    >
                      <ArrowDownUp size={10} />
                      {hierarchyTopDown ? 'Top First' : 'Bottom First'}
                    </button>
                  </div>
                  <div className="overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {hierarchicalNodes.length > 0 ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setParentId(null)}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
                            parentId === null ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-xs font-medium truncate w-full">Make Root Node</div>
                        </button>
                        {hierarchicalNodes.map(node => (
                          <button 
                            key={node.id}
                            type="button"
                            onClick={() => setParentId(node.id)}
                            className={`w-full flex items-center p-2 rounded-lg text-left transition-all ${
                              parentId === node.id ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <div className="w-full flex items-center gap-2 overflow-hidden">
                              {node.depth > 0 && <span className="text-gray-300 font-mono text-[10px] shrink-0">{'—'.repeat(node.depth)}</span>}
                              <div className="text-xs font-medium truncate w-full">{node.data.title}</div>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-1">No existing nodes. This will be the root node.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 mt-auto shrink-0 border-t border-gray-50">
                  <button 
                    type="submit"
                    disabled={!title.trim() || !selectedProjectId}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin bg-white"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                {isSearchingGif ? (
                  <div className="flex flex-col h-full bg-white z-10 w-full relative">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Search Giphy..."
                          value={gifSearchTerm}
                          onChange={(e) => setGifSearchTerm(e.target.value)}
                          className="w-full text-xs pl-8 p-2.5 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-gray-200 outline-none"
                          autoFocus
                        />
                      </div>
                      <button onClick={() => setIsSearchingGif(false)} className="text-gray-400 hover:text-gray-900 px-2">Cancel</button>
                    </div>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin">
                      <Grid
                        key={debouncedGifSearch}
                        width={352}
                        columns={2}
                        fetchGifs={(offset: number) => debouncedGifSearch ? gf.search(debouncedGifSearch, { offset, limit: 10 }) : gf.trending({ offset, limit: 10 })}
                        onGifClick={(gif, e) => {
                          e.preventDefault();
                          setArtifact({ type: 'gif', name: gif.title || 'GIF', url: gif.images.fixed_height.url });
                          setIsSearchingGif(false);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1.5 ml-0.5">Attach Artifact (Optional)</h3>
                      <p className="text-xs text-gray-500 mb-4 px-0.5">Link a file or media to this node for deeper context.</p>

                      <div className="grid grid-cols-2 gap-3">
                        {artifactButtons.map((btn) => {
                          const Icon = btn.icon;
                          const isSelected = artifact?.type === btn.type;
                          return (
                            <button
                              key={btn.type}
                              type="button"
                              onClick={() => handleUploadClick(btn.type)}
                              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                                isSelected 
                                  ? 'border-gray-900 bg-gray-900 text-white shadow-md' 
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon size={24} className={isSelected ? 'text-white' : 'text-gray-400'} />
                              <div>
                                <div className="text-xs font-medium">{btn.label}</div>
                                <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>{btn.desc}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {artifact && (
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip size={14} className="text-gray-500 shrink-0" />
                            <span className="text-xs font-medium text-gray-700 truncate">{artifact.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setArtifact(undefined)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 mt-auto border-t border-gray-50 shrink-0">
                      <button 
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-gray-500 hover:text-gray-900 text-xs font-medium px-2 py-1 transition-colors"
                      >
                        Back
                      </button>
                      <button 
                        type="button"
                        onClick={handleFinish}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800 transition-all shadow-sm"
                      >
                        <Check size={14} />
                        Place Node
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

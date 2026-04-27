'use client';

import React from 'react';
import '@xyflow/react/dist/style.css';

import { useProjectStore } from '@/lib/store';
import FolderHome from '@/components/FolderHome';
import Workspace from '@/components/Workspace';

export default function Home() {
  const view = useProjectStore(state => state.view);

  return (
    <main className="w-screen h-screen bg-white text-gray-900 font-sans overflow-hidden transition-colors selection:bg-gray-200">
      {view === 'home' ? <FolderHome /> : <Workspace />}
    </main>
  );
}

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Image as ImageIcon, Music, Video, Paperclip } from 'lucide-react';
import { InquiryData, useProjectStore } from '@/lib/store';

export default function InquiryNode({ data }: { data: InquiryData }) {
  const getArtifactIcon = () => {
    switch(data.artifact?.type) {
      case 'image': return <ImageIcon size={12} />;
      case 'audio': return <Music size={12} />;
      case 'video': return <Video size={12} />;
      case 'gif': return <Paperclip size={12} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-4 w-[240px] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-shadow font-sans relative group">
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-gray-300 !border-white !border-2" />
      
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm leading-snug text-gray-900 pr-4">{data.title}</h3>
        
        {data.artifact && (
          <div className="absolute top-4 right-4 text-gray-400 bg-gray-50 p-1 rounded-md border border-gray-100" title={data.artifact.name}>
            {getArtifactIcon()}
          </div>
        )}
        
        {data.artifact?.url && (data.artifact.type === 'image' || data.artifact.type === 'gif') && (
          <div className="mt-1 rounded-md overflow-hidden bg-gray-50 border border-gray-100">
            <img src={data.artifact.url} alt={data.artifact.name} className="w-full h-auto max-h-32 object-cover" />
          </div>
        )}

        {data.artifact?.url && data.artifact.type === 'audio' && (
          <div className="mt-1 rounded-md bg-gray-50 p-2 border border-gray-100">
            <audio src={data.artifact.url} controls className="w-full h-6" />
          </div>
        )}

        {data.artifact?.url && data.artifact.type === 'video' && (
          <div className="mt-1 rounded-md overflow-hidden border border-gray-100 bg-black">
            <video src={data.artifact.url} controls className="w-full max-h-32 object-cover" />
          </div>
        )}
        
        {data.inquiryDepth && (
          <div className="mt-1 bg-gray-50 rounded-md p-2.5 text-[11px] leading-relaxed text-gray-700 border-l-2 border-gray-300">
            {data.inquiryDepth}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-gray-300 !border-white !border-2" />
    </div>
  );
}

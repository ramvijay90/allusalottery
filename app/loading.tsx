import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-[#f59e0b] animate-spin"></div>
        
        {/* Inner Logo Circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center text-[#f59e0b] font-black text-sm shadow-lg">
            L
          </div>
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-6 flex flex-col items-center">
        <span className="text-[10px] font-black text-[#0f172a] uppercase tracking-[0.4em] animate-pulse">
          Loading
        </span>
        <div className="mt-2 flex gap-1">
          <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

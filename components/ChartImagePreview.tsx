'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Eye, ExternalLink, Share2 } from 'lucide-react';

interface ChartImagePreviewProps {
  imageSrc: string;
  altText: string;
  title: string;
  downloadFileName?: string;
}

export default function ChartImagePreview({
  imageSrc,
  altText,
  title,
  downloadFileName = 'lottery-chart-2026.png',
}: ChartImagePreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    try {
      const downloadUrl = `/api/download?url=${encodeURIComponent(imageSrc)}&name=${encodeURIComponent(downloadFileName)}`;
      window.location.href = downloadUrl;
    } catch (e) {
      console.error('Download failed:', e);
      window.open(imageSrc, '_blank');
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://allusalottery.com';
    const text = encodeURIComponent(`Check out the verified ${title} results & charts: ${pageUrl}`);
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const whatsappUrl = isMobile 
      ? `whatsapp://send?text=${text}`
      : `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center justify-center my-8 w-full max-w-4xl mx-auto">
      {/* High-Impact Visual Image Card */}
      <div className="relative group overflow-hidden rounded-3xl shadow-2xl border border-slate-100 bg-[#0f172a] w-full aspect-[1200/630]">
        <img
          src={imageSrc}
          alt={altText}
          title={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="eager"
          width={1200}
          height={630}
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
          <div className="text-white">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b] block mb-1">
              Verified 2026 Chart Card
            </span>
            <div className="text-sm font-bold text-slate-200">{title}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
              title="Share on WhatsApp"
            >
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <button
              onClick={() => window.open(imageSrc, '_blank')}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-[#0f172a] text-xs font-black uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Full View</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-[#0f172a] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/30"
            >
              <Download size={14} />
              <span>{downloading ? 'Saving...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Action Bar for Touch Screens */}
      <div className="flex sm:hidden items-center justify-between w-full mt-3 px-1 gap-2">
        <button
          onClick={handleWhatsAppShare}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Share2 size={14} />
          <span>WhatsApp</span>
        </button>
        <button
          onClick={() => window.open(imageSrc, '_blank')}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-200"
        >
          <Eye size={14} />
          <span>View</span>
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 py-2 px-3 rounded-xl bg-[#f59e0b] text-[#0f172a] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <Download size={14} />
          <span>{downloading ? 'Saving...' : 'Download'}</span>
        </button>
      </div>
    </div>
  );
}

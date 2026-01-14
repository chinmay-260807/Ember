
import React, { useState } from 'react';

export type AmbientType = 'none' | 'rain' | 'wind' | 'chimes';

interface AmbientSoundControlProps {
  current: AmbientType;
  onChange: (type: AmbientType) => void;
}

const AmbientSoundControl: React.FC<AmbientSoundControlProps> = ({ current, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options: { id: AmbientType; label: string; icon: React.ReactNode }[] = [
    { id: 'none', label: 'Silence', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6.75h3l3.32-3.32a.75.75 0 0 1 1.28.53v15.08a.75.75 0 0 1-1.28.53l-3.32-3.32h-3a.75.75 0 0 1-.75-.75V6.75a.75.75 0 0 1 .75-.75Z" />
      </svg>
    )},
    { id: 'rain', label: 'Rain', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.75m0 16.5V21m6.364-14.364-.53.53m-11.668 11.668-.53.53M21 12h-.75M3.75 12H3m14.864 6.364-.53-.53M6.136 6.136-.53-.53" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 0-7.5h-.75a6.75 6.75 0 1 0-13.5 0v.75c0 .323.033.639.098.944A4.5 4.5 0 0 0 2.25 15Z" />
      </svg>
    )},
    { id: 'wind', label: 'Wind', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    )},
    { id: 'chimes', label: 'Chimes', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    )},
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all duration-500 ease-out flex items-center space-x-1 relative z-50 ${isOpen ? 'bg-[#4a4e69]/5 shadow-inner' : ''} ${current !== 'none' ? 'text-[#e5989b] bg-[#e5989b]/5' : 'text-[#9a8c98] hover:text-[#4a4e69] hover:bg-[#4a4e69]/5'}`}
        title="Ambient Sounds"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className={`transition-transform duration-700 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>
        {current !== 'none' && !isOpen && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#e5989b] rounded-full animate-pulse shadow-[0_0_8px_#e5989b]"></span>
        )}
      </button>

      {/* Backdrop for closing */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-700 ease-in-out ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Animated Dropdown Menu */}
      <div className={`
        absolute right-0 top-full mt-3 w-44 bg-white/95 backdrop-blur-md rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#f2e9e4] p-2 z-50
        transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) origin-top-right
        ${isOpen 
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
          : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}
      `}>
        <div className="text-[9px] uppercase tracking-[0.3em] text-[#9a8c98] px-4 py-3 border-b border-[#f2e9e4]/50 mb-1 opacity-50 font-medium">
          Atmosphere
        </div>
        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-[11px] tracking-wide transition-all duration-300
                ${current === opt.id 
                  ? 'bg-[#4a4e69] text-white shadow-lg shadow-[#4a4e69]/20' 
                  : 'text-[#4a4e69]/70 hover:bg-[#fdfcfb] hover:text-[#4a4e69]'}
              `}
            >
              <span className={`transition-transform duration-500 ${current === opt.id ? 'scale-110' : 'scale-100 opacity-60'}`}>
                {opt.icon}
              </span>
              <span className="font-light">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AmbientSoundControl;

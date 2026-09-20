import React from 'react';

export default function SectionLabel({ children, className = '' }) {
  return (
    <div className={`text-[11px] font-semibold tracking-[0.2em] uppercase text-[#00C7D4] mb-3 select-none flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

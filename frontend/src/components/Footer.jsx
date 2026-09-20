import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-[#141C24] bg-[#050709] py-12 px-6 md:px-12 text-sm text-[#7E8B9B]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-bold tracking-[0.15em] text-xs text-white uppercase font-sans">
            ADAPT
          </span>
          <p className="text-xs text-[#64748B]">
            Adaptive learning, built around you.
          </p>
        </div>

        <div className="text-xs text-[#475569]">
          © 2026 ADAPT
        </div>
      </div>
    </footer>
  );
}

import React, { useEffect, useState } from 'react';

export default function ProgressBar({
  label,
  value, // number from 0 to 100
  animated = true,
  className = '',
}) {
  const [currentWidth, setCurrentWidth] = useState(animated ? 0 : value);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentWidth(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, animated]);

  // High values (>= 70) use cyan, lower values use muted blue-gray
  const isHigh = value >= 60;
  const barColor = isHigh ? 'bg-[#00C7D4]' : 'bg-[#475569]';
  const textColor = isHigh ? 'text-[#00C7D4]' : 'text-[#7E8B9B]';

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-xl">
        <span className="text-[#F3F4F6] font-medium">{label}</span>
        <span className={`font-mono text-sm font-semibold ${textColor}`}>
          {Math.round(value)}%
        </span>
      </div>

      <div className="w-full h-2 bg-[#141C24] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${Math.min(Math.max(currentWidth, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

import { useState } from 'react';

export function HamburgerMenu() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      className="absolute top-6 right-6 z-10 p-2 transition-all duration-300 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        filter: isHovered ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))' : 'none'
      }}
      aria-label="Menu"
    >
      <div className="flex flex-col gap-[6px] w-7">
        <span 
          className="h-[1.5px] bg-white transition-all duration-300 ease-out"
          style={{
            transform: isHovered ? 'scaleX(0.85)' : 'scaleX(1)',
            transformOrigin: 'right'
          }}
        />
        <span 
          className="h-[1.5px] bg-white transition-all duration-300 ease-out"
        />
        <span 
          className="h-[1.5px] bg-white transition-all duration-300 ease-out"
          style={{
            transform: isHovered ? 'scaleX(0.85)' : 'scaleX(1)',
            transformOrigin: 'right'
          }}
        />
      </div>
    </button>
  );
}

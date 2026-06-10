import { CafeHomePage } from './CafeHomePage';

export function MobilePhonePreview() {
  return (
    <div className="relative">
      {/* Phone Frame */}
      <div 
        className="relative bg-black rounded-[3rem] p-3 shadow-2xl"
        style={{ width: '375px', height: '812px' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
          <CafeHomePage />
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
      </div>
      
      {/* Phone Shadow */}
      <div 
        className="absolute inset-0 -z-10 blur-3xl opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, transparent 70%)'
        }}
      />
    </div>
  );
}

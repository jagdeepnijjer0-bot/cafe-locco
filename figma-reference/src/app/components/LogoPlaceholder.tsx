export function LogoPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div 
        className="relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ease-out hover:scale-105"
        style={{
          background: 'linear-gradient(135deg, rgba(200, 200, 200, 0.15) 0%, rgba(150, 150, 150, 0.12) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Inner glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)'
          }}
        />
        
        <span 
          className="relative z-10 tracking-[0.2em] transition-all duration-500"
          style={{
            color: 'rgba(255, 255, 255, 0.4)',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          LOGO
        </span>
      </div>
    </div>
  );
}

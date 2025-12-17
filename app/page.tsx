import { DeFiApp } from "@/components/defi-app"

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden w-full">
      {/* Arc Network inspired animated background - Solana style */}
      <div className="fixed inset-0 -z-10">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1729] to-[#1a2332]" />
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(at 20% 30%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
                radial-gradient(at 80% 70%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
                radial-gradient(at 10% 80%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
                radial-gradient(at 90% 20%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)
              `,
              animation: 'meshMove 20s ease-in-out infinite alternate'
            } as React.CSSProperties}
          />
        </div>
        
        {/* Animated gradient orbs - Solana style */}
        <div 
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#3b82f6]/20 rounded-full blur-[120px]"
          style={{ animation: 'float 15s ease-in-out infinite' } as React.CSSProperties}
        />
        <div 
          className="absolute bottom-0 right-1/4 w-[1000px] h-[1000px] bg-[#06b6d4]/20 rounded-full blur-[140px]"
          style={{ animation: 'float 20s ease-in-out infinite reverse' } as React.CSSProperties}
        />
        <div 
          className="absolute bottom-1/3 left-0 w-[700px] h-[700px] bg-[#3b82f6]/10 rounded-full blur-[130px]"
          style={{ animation: 'float 22s ease-in-out infinite reverse', animationDelay: '4s' } as React.CSSProperties}
        />
        
        {/* Grid pattern overlay - more subtle */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            animation: 'gridMove 30s linear infinite'
          } as React.CSSProperties}
        />
        
        
        {/* Animated gradient lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <defs>
            <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path 
            d="M0,0 Q500,300 1000,600 T2000,1200" 
            stroke="url(#lineGradient1)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="1000"
            style={{ animation: 'pathMove 25s ease-in-out infinite' } as React.CSSProperties}
          />
          <path 
            d="M1000,0 Q500,400 0,800 T-1000,1600" 
            stroke="url(#lineGradient2)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="1000"
            style={{ animation: 'pathMove 30s ease-in-out infinite reverse' } as React.CSSProperties}
          />
        </svg>
        
      </div>
      
      <DeFiApp />
    </main>
  )
}

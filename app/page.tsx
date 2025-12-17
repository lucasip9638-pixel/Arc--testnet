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
          className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#8b5cf6]/15 rounded-full blur-[100px]"
          style={{ animation: 'float 18s ease-in-out infinite', animationDelay: '2s' } as React.CSSProperties}
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
        
        {/* Animated particles/dots - Solana style */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 4 + 2
            const left = Math.random() * 100
            const top = Math.random() * 100
            const duration = Math.random() * 3 + 2
            const delay = Math.random() * 2
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white/5"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `${top}%`,
                  animation: `twinkle ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`
                } as React.CSSProperties}
              />
            )
          })}
        </div>
        
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
        
        {/* Arc Network decorative element - right side (lozano style) - Beautiful flowing design */}
        <div className="absolute top-0 right-0 w-[50%] h-full opacity-15 pointer-events-none overflow-hidden">
          <svg 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-[140%]"
            viewBox="0 0 1400 1800" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMid slice"
          >
            <defs>
              <linearGradient id="arcDecorative1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="25%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="arcDecorative2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="30%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.25" />
                <stop offset="90%" stopColor="#06b6d4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="arcDecorative3" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
              </linearGradient>
              <radialGradient id="arcRadial1" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="80%" stopColor="#8b5cf6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="arcRadial2" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            
            {/* Large flowing curves - Main decorative waves */}
            <path 
              d="M1400,0 C1200,250 1100,600 950,900 C800,1200 650,1450 450,1550 C250,1650 50,1700 0,1800 L1400,1800 Z" 
              fill="url(#arcDecorative1)"
              style={{ animation: 'arcFlow1 30s ease-in-out infinite alternate' } as React.CSSProperties}
            />
            <path 
              d="M1400,0 C1300,350 1200,700 1050,1000 C900,1300 750,1500 550,1600 C350,1700 150,1750 0,1800 L1400,1800 Z" 
              fill="url(#arcDecorative2)"
              style={{ animation: 'arcFlow2 35s ease-in-out infinite alternate' } as React.CSSProperties}
            />
            
            {/* Additional flowing layers for depth */}
            <path 
              d="M1400,150 C1250,400 1150,750 1000,1050 C850,1350 700,1550 500,1650 C300,1720 100,1770 0,1800 L1400,1800 Z" 
              fill="url(#arcDecorative3)"
              style={{ animation: 'arcFlow3 40s ease-in-out infinite alternate' } as React.CSSProperties}
            />
            
            {/* Decorative circles/lozano pattern - Beautiful glowing orbs */}
            <circle cx="1150" cy="350" r="220" fill="url(#arcRadial1)" opacity="0.4" style={{ animation: 'arcPulse 8s ease-in-out infinite' } as React.CSSProperties} />
            <circle cx="1250" cy="750" r="180" fill="url(#arcRadial2)" opacity="0.35" style={{ animation: 'arcPulse 10s ease-in-out infinite', animationDelay: '2s' } as React.CSSProperties} />
            <circle cx="1200" cy="1150" r="200" fill="url(#arcRadial1)" opacity="0.3" style={{ animation: 'arcPulse 12s ease-in-out infinite', animationDelay: '4s' } as React.CSSProperties} />
            <circle cx="1300" cy="1450" r="160" fill="url(#arcRadial2)" opacity="0.25" style={{ animation: 'arcPulse 14s ease-in-out infinite', animationDelay: '1s' } as React.CSSProperties} />
            
            {/* Additional subtle flowing lines */}
            <path 
              d="M1400,0 Q1200,400 1000,800 Q800,1200 600,1500 Q400,1700 200,1800" 
              stroke="url(#arcDecorative1)" 
              strokeWidth="3" 
              fill="none"
              opacity="0.3"
              style={{ animation: 'arcLineMove 25s ease-in-out infinite' } as React.CSSProperties}
            />
            <path 
              d="M1400,200 Q1250,600 1100,1000 Q950,1400 750,1650 Q550,1750 350,1800" 
              stroke="url(#arcDecorative2)" 
              strokeWidth="2.5" 
              fill="none"
              opacity="0.25"
              style={{ animation: 'arcLineMove 30s ease-in-out infinite reverse' } as React.CSSProperties}
            />
          </svg>
        </div>
      </div>
      
      <DeFiApp />
    </main>
  )
}

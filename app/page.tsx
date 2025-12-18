import { DeFiApp } from "@/components/defi-app"

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-x-hidden w-full">
      {/* Static background - no animations */}
      <div className="fixed inset-0 -z-10">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f1729] to-[#1a2332]" />
      </div>
      
      <DeFiApp />
    </main>
  )
}

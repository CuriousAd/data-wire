import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { PreviewPanel } from './PreviewPanel';
import { FeatureCards } from './FeatureCards';

export function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(165deg, #f2ece5 0%, #eee9e1 25%, #e9e4dc 45%, #e3e6de 70%, #dae2d9 100%)',
    }}>
      {/* Subtle ambient warm glow bottom-left */}
      <div
        className="absolute -bottom-40 -left-40 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(228,195,165,0.35) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />
      {/* Subtle ambient green glow bottom-right */}
      <div
        className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(180,210,188,0.35) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="max-w-[1320px] mx-auto px-10 pt-8 pb-20">
          <div className="flex gap-10 items-start">
            {/* Left column ≈58% */}
            <div className="flex-[3] min-w-0">
              <HeroSection />
            </div>

            {/* Right column ≈42% */}
            <div className="flex-[2.2] space-y-5 pt-8">
              <PreviewPanel />
              <FeatureCards />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

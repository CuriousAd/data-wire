import { InputCard } from './InputCard';

export function HeroSection() {
  return (
    <div className="pt-12 space-y-7">
      {/* Top pills */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase border border-[#1a3c2e] text-[#1a3c2e] bg-[#dfeee6]">
          DataWire Analysis Engine
        </span>
        <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase border border-[#d4cfca] text-[#6b6b6b]">
          Text-First
        </span>
        <span className="px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.14em] uppercase border border-[#d4cfca] text-[#6b6b6b]">
          Optional Attachments
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="font-serif text-[3.8rem] font-bold leading-[1.06] tracking-[-0.015em] text-[#1a1a1a] max-w-[540px]">
        Converse With Data Like Never Before.
      </h1>

      {/* Subtitle */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#1a3c2e]">
          AI Chat for Structured Data Analysis
        </p>
        <p className="text-[#6b6b6b] text-[14.5px] leading-relaxed max-w-[500px]">
          Upload a CSV and let the system handle{' '}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#dfeee6] text-[#1a3c2e] text-[12px] font-medium mx-0.5">
            parsing → analysis → insights
          </span>{' '}
          as one continuous workflow.
        </p>
      </div>

      {/* Input Card */}
      <InputCard />
    </div>
  );
}

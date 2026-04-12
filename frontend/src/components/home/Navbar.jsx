export function Navbar() {
  return (
    <div className="flex justify-center pt-5 px-6">
      <nav className="flex items-center justify-between w-full max-w-[780px] px-7 py-3 rounded-full bg-white/60 border border-[#ddd8d2] backdrop-blur-sm">
        <span className="text-[#1a1a1a] font-semibold tracking-[0.18em] text-[14px] uppercase">
          DATAWIRE
        </span>
        <div className="flex items-center">
          <a
            href="https://github.com/CuriousAd/data-wire"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b6b6b] text-[14px] hover:text-[#1a1a1a] transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>
    </div>
  );
}

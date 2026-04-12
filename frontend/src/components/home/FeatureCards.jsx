const FEATURES = [
  {
    title: 'Text-first',
    description:
      'Start with a question, then decide whether supporting files are necessary without losing the speed of chat.',
  },
  {
    title: 'Multi-agent',
    description:
      'Run graph building, simulation, and reporting behind the scenes while keeping the user inside a single conversation.',
  },
  {
    title: 'Result cards',
    description:
      'Drop a structured result card below each answer with a summary, report entry point, and follow-up path.',
  },
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-3 gap-3.5">
      {FEATURES.map((feature, i) => (
        <div
          key={i}
          className="bg-white/75 rounded-[20px] p-5 border border-[#e0dbd5]"
        >
          <h3 className="font-serif text-[21px] font-bold text-[#1a1a1a] mb-3 leading-[1.15]">
            {feature.title}
          </h3>
          <p className="text-[12px] text-[#7a7a7a] leading-[1.65]">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}

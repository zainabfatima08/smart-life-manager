export function AnimatedBackground() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(99,102,241,0.20),transparent_28%),radial-gradient(circle_at_78%_10%,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_50%_92%,rgba(251,146,60,0.20),transparent_32%),linear-gradient(135deg,#fffaf0_0%,#eef4ff_48%,#f8fbf7_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[54rem] w-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
    </div>
  );
}
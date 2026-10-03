export function CircuitBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-70" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="edukids-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="rgba(0,188,235,0.16)" strokeWidth="1" />
            <circle cx="0" cy="0" r="2.2" fill="rgba(0,188,235,0.55)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#edukids-grid)" />
        <path
          d="M40 120 H220 V240 H380 V80 H560"
          fill="none"
          stroke="rgba(255,170,103,0.35)"
          strokeWidth="1.5"
        />
        <path
          d="M80 420 H300 V300 H520 V460"
          fill="none"
          stroke="rgba(0,188,235,0.4)"
          strokeWidth="1.5"
        />
        <circle cx="220" cy="240" r="4" fill="#00BCEB" />
        <circle cx="380" cy="80" r="4" fill="#FFAA67" />
        <circle cx="300" cy="300" r="4" fill="#FFC800" />
      </svg>
      <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-brand-coral/15 blur-3xl" />
    </div>
  );
}

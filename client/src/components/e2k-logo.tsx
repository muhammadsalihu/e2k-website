interface E2kLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon";
}

const sizes = {
  sm: { icon: 32, text: 16, sub: 6 },
  md: { icon: 48, text: 22, sub: 8 },
  lg: { icon: 64, text: 30, sub: 10 },
  xl: { icon: 96, text: 44, sub: 13 },
};

export function E2kLogo({ className = "", size = "md", variant = "full" }: E2kLogoProps) {
  const s = sizes[size];
  const iconSize = s.icon;

  if (variant === "icon") {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="E2k Tech Ventures"
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="100%" stopColor="#050D1A" />
          </radialGradient>
          <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C8FF" />
            <stop offset="100%" stopColor="#00E5A0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#bgGrad)" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="url(#cyanGrad)" strokeWidth="1.5" opacity="0.6" />
        <NeuralIconPaths />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-label="E2k Tech Ventures">
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`bgGrad-${size}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0A1628" />
            <stop offset="100%" stopColor="#050D1A" />
          </radialGradient>
          <linearGradient id={`cyanGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C8FF" />
            <stop offset="100%" stopColor="#00E5A0" />
          </linearGradient>
          <linearGradient id={`cyanGrad2-${size}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00E5A0" />
            <stop offset="100%" stopColor="#00C8FF" />
          </linearGradient>
          <filter id={`glow-${size}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="32" cy="32" r="30" fill={`url(#bgGrad-${size})`} />
        <circle cx="32" cy="32" r="30" fill="none" stroke={`url(#cyanGrad-${size})`} strokeWidth="1.5" opacity="0.5" />
        <NeuralIconPaths gradId={`cyanGrad-${size}`} gradId2={`cyanGrad2-${size}`} glowId={`glow-${size}`} />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          style={{ fontSize: s.text, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}
          className="font-black tracking-tight"
        >
          <span
            style={{
              background: "linear-gradient(90deg, #00C8FF 0%, #00E5A0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            E2K
          </span>
        </span>
        <span
          style={{ fontSize: s.sub, letterSpacing: "0.18em", fontWeight: 600, lineHeight: 1.4, marginTop: 1 }}
          className="text-muted-foreground uppercase font-mono"
        >
          TECH VENTURES
        </span>
      </div>
    </div>
  );
}

function NeuralIconPaths({
  gradId = "cyanGrad",
  gradId2 = "cyanGrad2",
  glowId = "glow",
}: {
  gradId?: string;
  gradId2?: string;
  glowId?: string;
}) {
  const stroke = `url(#${gradId})`;
  const stroke2 = `url(#${gradId2})`;

  return (
    <g filter={`url(#${glowId})`}>
      {/* Neural network nodes */}
      {/* Center node */}
      <circle cx="32" cy="32" r="4" fill={stroke} opacity="0.95" />

      {/* Ring 1 nodes */}
      <circle cx="32" cy="18" r="2.5" fill={stroke} opacity="0.85" />
      <circle cx="44" cy="25" r="2.5" fill={stroke2} opacity="0.85" />
      <circle cx="44" cy="39" r="2.5" fill={stroke} opacity="0.85" />
      <circle cx="32" cy="46" r="2.5" fill={stroke2} opacity="0.85" />
      <circle cx="20" cy="39" r="2.5" fill={stroke} opacity="0.85" />
      <circle cx="20" cy="25" r="2.5" fill={stroke2} opacity="0.85" />

      {/* Ring 2 nodes (outer) */}
      <circle cx="32" cy="10" r="1.8" fill={stroke} opacity="0.55" />
      <circle cx="51" cy="21" r="1.8" fill={stroke2} opacity="0.55" />
      <circle cx="51" cy="43" r="1.8" fill={stroke} opacity="0.55" />
      <circle cx="32" cy="54" r="1.8" fill={stroke2} opacity="0.55" />
      <circle cx="13" cy="43" r="1.8" fill={stroke} opacity="0.55" />
      <circle cx="13" cy="21" r="1.8" fill={stroke2} opacity="0.55" />

      {/* Connections: center to ring 1 */}
      <line x1="32" y1="32" x2="32" y2="18" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="32" x2="44" y2="25" stroke={stroke2} strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="32" x2="44" y2="39" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="32" x2="32" y2="46" stroke={stroke2} strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="32" x2="20" y2="39" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="32" x2="20" y2="25" stroke={stroke2} strokeWidth="1" opacity="0.6" />

      {/* Connections: ring 1 to ring 2 */}
      <line x1="32" y1="18" x2="32" y2="10" stroke={stroke} strokeWidth="0.8" opacity="0.35" />
      <line x1="44" y1="25" x2="51" y2="21" stroke={stroke2} strokeWidth="0.8" opacity="0.35" />
      <line x1="44" y1="39" x2="51" y2="43" stroke={stroke} strokeWidth="0.8" opacity="0.35" />
      <line x1="32" y1="46" x2="32" y2="54" stroke={stroke2} strokeWidth="0.8" opacity="0.35" />
      <line x1="20" y1="39" x2="13" y2="43" stroke={stroke} strokeWidth="0.8" opacity="0.35" />
      <line x1="20" y1="25" x2="13" y2="21" stroke={stroke2} strokeWidth="0.8" opacity="0.35" />

      {/* Ring 1 hexagon connections */}
      <line x1="32" y1="18" x2="44" y2="25" stroke={stroke} strokeWidth="0.7" opacity="0.25" />
      <line x1="44" y1="25" x2="44" y2="39" stroke={stroke2} strokeWidth="0.7" opacity="0.25" />
      <line x1="44" y1="39" x2="32" y2="46" stroke={stroke} strokeWidth="0.7" opacity="0.25" />
      <line x1="32" y1="46" x2="20" y2="39" stroke={stroke2} strokeWidth="0.7" opacity="0.25" />
      <line x1="20" y1="39" x2="20" y2="25" stroke={stroke} strokeWidth="0.7" opacity="0.25" />
      <line x1="20" y1="25" x2="32" y2="18" stroke={stroke2} strokeWidth="0.7" opacity="0.25" />
    </g>
  );
}

export function E2kFaviconSvg() {
  return `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0A1628"/>
        <stop offset="100%" stop-color="#050D1A"/>
      </radialGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#bg)"/>
    <circle cx="32" cy="32" r="4" fill="#00C8FF"/>
    <circle cx="32" cy="18" r="2.5" fill="#00C8FF" opacity="0.9"/>
    <circle cx="44" cy="25" r="2.5" fill="#00E5A0" opacity="0.9"/>
    <circle cx="44" cy="39" r="2.5" fill="#00C8FF" opacity="0.9"/>
    <circle cx="32" cy="46" r="2.5" fill="#00E5A0" opacity="0.9"/>
    <circle cx="20" cy="39" r="2.5" fill="#00C8FF" opacity="0.9"/>
    <circle cx="20" cy="25" r="2.5" fill="#00E5A0" opacity="0.9"/>
    <line x1="32" y1="32" x2="32" y2="18" stroke="#00C8FF" stroke-width="1" opacity="0.7"/>
    <line x1="32" y1="32" x2="44" y2="25" stroke="#00E5A0" stroke-width="1" opacity="0.7"/>
    <line x1="32" y1="32" x2="44" y2="39" stroke="#00C8FF" stroke-width="1" opacity="0.7"/>
    <line x1="32" y1="32" x2="32" y2="46" stroke="#00E5A0" stroke-width="1" opacity="0.7"/>
    <line x1="32" y1="32" x2="20" y2="39" stroke="#00C8FF" stroke-width="1" opacity="0.7"/>
    <line x1="32" y1="32" x2="20" y2="25" stroke="#00E5A0" stroke-width="1" opacity="0.7"/>
  </svg>`;
}

import clsx from "clsx";

/** Avanço de cada letra a 128px (Space Grotesk Bold). */
const ADVANCE = 96;

type SignatureProps = {
  text: string;
  /** Atraso do traço, em segundos. */
  delay?: number;
  className?: string;
};

/**
 * O rabisco "ANA" do canto: contorno branco de 1px, tremido como giz (turbulência +
 * deslocamento, em duas passadas) e desenhado letra por letra na entrada.
 * Só CSS, então continua sendo um componente de servidor.
 */
export function Signature({ text, delay = 0, className }: SignatureProps) {
  const letters = [...text];

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${letters.length * ADVANCE + 8} 163`}
      className={clsx("pointer-events-none overflow-visible select-none", className)}
    >
      <defs>
        <filter id="chalk-a" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="chalk-b" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" seed="23" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="G" yChannelSelector="R" />
        </filter>
      </defs>
      <g fill="none" stroke="#fff" strokeLinejoin="round" strokeDasharray={800} className="font-sans text-[128px] font-bold">
        {letters.map((letter, i) => (
          <g key={i}>
            <text
              x={i * ADVANCE}
              y={124}
              strokeWidth={1.3}
              filter="url(#chalk-a)"
              className="animate-draw motion-reduce:animate-none"
              style={{ animationDelay: `${delay + i * 0.22}s` }}
            >
              {letter}
            </text>
            <text
              x={i * ADVANCE + 1.5}
              y={125.5}
              strokeWidth={0.8}
              opacity={0.6}
              filter="url(#chalk-b)"
              className="animate-draw motion-reduce:animate-none"
              style={{ animationDelay: `${delay + i * 0.22 + 0.18}s` }}
            >
              {letter}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

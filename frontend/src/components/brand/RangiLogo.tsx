import { WORDMARK } from "./logo-paths";
import styles from "./rangi-logo.module.css";

const THEMES = {
  dark: { text: "#FBF6EA", dot: "#F5A623", halo: "#F5A623" },
  light: { text: "#0A2E26", dot: "#EF8D08", halo: "#F5A623" },
  "mono-white": { text: "#FFFFFF", dot: "#FFFFFF", halo: null },
  "mono-black": { text: "#0B0B0B", dot: "#0B0B0B", halo: null },
} as const;
// Static (progress-less) halo opacity per variant/theme, matched to the
// generator's own static SVGs: wordmarkSVG uses COLORS[theme].haloOp
// (0.2/0.28), iconSVG uses ICON[theme].haloOp (0.25/0.3) — they differ
// intentionally, so this must stay keyed by variant.
const HALO_BASE = {
  wordmark: { dark: 0.2, light: 0.28 },
  icon: { dark: 0.25, light: 0.3 },
} as const;

export interface RangiLogoProps {
  variant: "wordmark" | "icon";
  theme: keyof typeof THEMES;
  progress?: number;
  animated?: boolean;
  title?: string;
  className?: string;
}

function dotState(variant: "wordmark" | "icon", theme: keyof typeof THEMES, progress?: number) {
  const isMono = theme.startsWith("mono");
  if (progress === undefined) {
    return {
      rMul: 1,
      dotOp: 1,
      haloOp: isMono ? 0 : HALO_BASE[variant][theme as "dark" | "light"],
      haloMul: 1,
    };
  }
  const p = Math.max(0, Math.min(1, progress));
  if (p === 0) return { rMul: 1, dotOp: 0.35, haloOp: 0, haloMul: 1 };
  return { rMul: 1 + 0.6 * p, dotOp: 1, haloOp: isMono ? 0 : 0.06 + 0.3 * p, haloMul: 1 + p };
}

export function RangiLogo({
  variant,
  theme,
  progress,
  animated = true,
  title = "Rangi",
  className,
}: RangiLogoProps) {
  const c = THEMES[theme];
  const s = dotState(variant, theme, progress);
  const cls = [animated ? styles.breath : "", className ?? ""].join(" ").trim();
  const brightness = progress === undefined ? 1 : Math.max(0, Math.min(1, progress));
  const svgStyle = { ["--breath-scale" as string]: (1 + 0.06 * brightness).toFixed(4) };

  if (variant === "icon") {
    const bg = theme === "dark" ? "#0A2E26" : theme === "light" ? "#FBF6EA" : null;
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label={title} className={cls} style={svgStyle}>
        <title>{title}</title>
        {bg && <rect width="48" height="48" rx="11" fill={bg} />}
        {s.haloOp > 0 && (
          <circle
            data-part="halo"
            cx="24"
            cy="21"
            r={9 * s.haloMul}
            fill={c.halo!}
            opacity={+s.haloOp.toFixed(3)}
          />
        )}
        <circle
          data-part="dot"
          cx="24"
          cy="21"
          r={+(5 * s.rMul).toFixed(2)}
          fill={c.dot}
          opacity={s.dotOp}
        />
        <rect x="20.7" y="30" width="6.6" height="9" rx="3.3" fill={c.text} />
      </svg>
    );
  }

  const W = WORDMARK;
  return (
    <svg
      viewBox={`0 0 ${W.width} ${W.height}`}
      role="img"
      aria-label={title}
      className={cls}
      style={svgStyle}
    >
      <title>{title}</title>
      {s.haloOp > 0 && (
        <circle
          data-part="halo"
          cx={W.i.dotCx}
          cy={W.i.dotCy}
          r={+(W.i.haloR * s.haloMul).toFixed(2)}
          fill={c.halo!}
          opacity={+s.haloOp.toFixed(3)}
        />
      )}
      <circle
        data-part="dot"
        cx={W.i.dotCx}
        cy={W.i.dotCy}
        r={+(W.i.dotR * s.rMul).toFixed(2)}
        fill={c.dot}
        opacity={s.dotOp}
      />
      <rect
        x={W.i.stemX}
        y={W.i.stemY}
        width={W.i.stemW}
        height={W.i.stemH}
        rx={W.i.rx}
        fill={c.text}
      />
      {W.glyphs.map((g, idx) => (
        <g
          key={idx}
          transform={`translate(${W.padX + g.tx} ${W.baseline + g.ty}) scale(${W.glyphScale} ${-W.glyphScale})`}
        >
          <path d={g.d} fill={c.text} />
        </g>
      ))}
    </svg>
  );
}

"use client";
import { useEffect, useState } from "react";
import { WORDMARK } from "./logo-paths";
import styles from "./rangi-splash.module.css";

const THEMES = {
  dark: { text: "#FBF6EA", dot: "#F5A623", halo: "#F5A623", wing: "#84DEBE" },
  light: { text: "#0A2E26", dot: "#EF8D08", halo: "#F5A623", wing: "#0E7A5A" },
} as const;
const DURATION_S = 2.2;

export interface RangiSplashProps {
  theme: keyof typeof THEMES;
  title?: string;
  className?: string;
  animate?: boolean;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function RangiSplash({
  theme,
  title = "Rangi",
  className,
  animate = true,
}: RangiSplashProps) {
  const c = THEMES[theme];
  const W = WORDMARK;
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Đường bay: vào từ ngoài khung trái-dưới, cong lên, KẾT THÚC đúng (dotCx, dotCy).
  const flightD = `M ${-0.3 * W.width} ${W.height * 1.15} Q ${W.width * 0.35} ${-W.height * 0.35}, ${W.i.dotCx} ${W.i.dotCy}`;
  const dur = `${DURATION_S}s`;

  // SSR/first paint luôn tĩnh (tránh mismatch hydrate); chỉ nâng cấp sang
  // nhánh động sau khi mount, khi caller cho phép và không reduced-motion.
  if (!animate || reduced || !mounted) {
    // Tĩnh hoàn toàn — cùng markup wordmark, không animation.
    return (
      <svg
        viewBox={`0 0 ${W.width} ${W.height}`}
        role="img"
        aria-label={title}
        className={className}
      >
        <title>{title}</title>
        <circle cx={W.i.dotCx} cy={W.i.dotCy} r={W.i.haloR} fill={c.halo} opacity={0.28} />
        <circle cx={W.i.dotCx} cy={W.i.dotCy} r={W.i.dotR} fill={c.dot} />
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

  return (
    <svg
      viewBox={`0 0 ${W.width} ${W.height}`}
      role="img"
      aria-label={title}
      className={[styles.splash, className ?? ""].join(" ").trim()}
      style={{ ["--splash-dur" as string]: dur }}
    >
      <title>{title}</title>
      <path
        id="splash-flight"
        d={flightD}
        fill="none"
        stroke={c.halo}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 7"
        className={styles.trail}
      />
      {/* wordmark hiện dần */}
      <g className={styles.reveal}>
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
      </g>
      {/* chấm + quầng thật: bật ở cuối */}
      <g className={styles.land}>
        <circle cx={W.i.dotCx} cy={W.i.dotCy} r={W.i.haloR} fill={c.halo} opacity={0.28} />
        <circle cx={W.i.dotCx} cy={W.i.dotCy} r={W.i.dotR} fill={c.dot} />
      </g>
      {/* đom đóm rút gọn bay theo path rồi đứng im (freeze) đúng tại chấm */}
      <g className={styles.flier}>
        <g>
          <ellipse cx="0" cy="0" rx={W.i.dotR * 0.7} ry={W.i.dotR * 0.9} fill={c.dot} />
          <ellipse
            cx={-W.i.dotR * 0.9}
            cy={-W.i.dotR * 0.5}
            rx={W.i.dotR * 0.45}
            ry={W.i.dotR * 0.95}
            fill={c.wing}
            opacity="0.7"
            transform={`rotate(-30 ${-W.i.dotR * 0.9} ${-W.i.dotR * 0.5})`}
          />
          <ellipse
            cx={W.i.dotR * 0.9}
            cy={-W.i.dotR * 0.5}
            rx={W.i.dotR * 0.45}
            ry={W.i.dotR * 0.95}
            fill={c.wing}
            opacity="0.7"
            transform={`rotate(30 ${W.i.dotR * 0.9} ${-W.i.dotR * 0.5})`}
          />
          <animateMotion
            dur={dur}
            fill="freeze"
            calcMode="spline"
            keySplines="0.3 0 0.2 1"
            keyTimes="0;1"
            keyPoints="0;1"
            path={flightD}
          />
        </g>
      </g>
    </svg>
  );
}

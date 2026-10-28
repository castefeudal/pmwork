/**
 * Shared drawing vocabulary for the Operational Atlas language, plus the two
 * helpers that client islands are allowed to import. Diagram bodies live in
 * sibling modules so an interactive island never drags the whole library into
 * its bundle.
 */

/** Every visual is served from the local export, under `/` or `/pmwork`. */
export const atlasAsset = (relative: string) =>
  `${process.env.NEXT_PUBLIC_PMWORK_BASE_PATH ?? ""}/visuals/${relative}`;

export const hair = "var(--atlas-hair)";
export const faint = "var(--atlas-faint)";
export const strong = "var(--atlas-strong)";
export const route = "var(--atlas-route)";
export const point = "var(--atlas-point)";
export const danger = "var(--semantic-danger)";
export const warning = "var(--semantic-warning)";
export const success = "var(--semantic-success)";

export function Rail({ x, y1, y2, ticks = 9 }: { x: number; y1: number; y2: number; ticks?: number }) {
  const step = (y2 - y1) / (ticks - 1);
  return (
    <g stroke={hair} strokeWidth="1">
      <line x1={x} y1={y1} x2={x} y2={y2} />
      {Array.from({ length: ticks }, (_, i) => (
        <line key={i} x1={x} y1={y1 + step * i} x2={x + (i % 2 ? 3 : 6)} y2={y1 + step * i} />
      ))}
    </g>
  );
}

export function Node({ cx, cy, tone = route, r = 3.4 }: { cx: number; cy: number; tone?: string; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tone} />
      <circle cx={cx} cy={cy} r={r + 3.5} fill="none" stroke={tone} strokeOpacity=".45" />
    </g>
  );
}

/** Crosshair triangulation point — the mark for a decision that must be taken. */
export function ControlPoint({ cx, cy, tone = point, size = 9 }: { cx: number; cy: number; tone?: string; size?: number }) {
  return (
    <g stroke={tone} strokeWidth="1.2" fill="none">
      <circle cx={cx} cy={cy} r={size * 0.5} />
      <circle cx={cx} cy={cy} r={size * 0.19} fill={tone} stroke="none" />
      <line x1={cx - size} y1={cy} x2={cx - size * 0.72} y2={cy} />
      <line x1={cx + size * 0.72} y1={cy} x2={cx + size} y2={cy} />
      <line x1={cx} y1={cy - size} x2={cx} y2={cy - size * 0.72} />
      <line x1={cx} y1={cy + size * 0.72} x2={cx} y2={cy + size} />
    </g>
  );
}

export function Arrow({ d, tone = route }: { d: string; tone?: string }) {
  return (
    <g fill="none" stroke={tone} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} markerEnd="url(#atlas-head)" />
    </g>
  );
}

export function Defs() {
  return (
    <defs>
      <marker id="atlas-head" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={route} />
      </marker>
      <marker id="atlas-head-faint" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" fill={hair} />
      </marker>
    </defs>
  );
}

/** Corner registration marks that frame a live product surface as an atlas plate. */
const markCorners = [
  ["tl", "M1 8 V1 H8"],
  ["tr", "M8 1 H15 V8"],
  ["br", "M15 8 V15 H8"],
  ["bl", "M8 15 H1 V8"],
] as const;

export function PlateMarks() {
  return (
    <span className="atlas-plate-marks" aria-hidden="true">
      {markCorners.map(([corner, d]) => (
        <svg key={corner} className={`atlas-mark atlas-mark-${corner}`} viewBox="0 0 16 16" focusable="false">
          <path d={d} stroke={point} strokeWidth="1" fill="none" />
        </svg>
      ))}
    </span>
  );
}

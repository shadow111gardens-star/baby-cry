/**
 * The baby. Pure SVG — every mood is driven by CSS via the ancestor's
 * `data-state="sleeping" | "crying"` attribute, so the whole scene
 * (palette, motion, tears, Zzz's) morphs without re-rendering.
 */
export default function Baby() {
  return (
    <svg
      viewBox="0 0 520 520"
      className="baby-svg h-auto w-full"
      role="img"
      aria-label="A baby that sleeps while funded and cries when the money runs out"
    >
      <defs>
        <radialGradient id="skin" cx="50%" cy="36%" r="72%">
          <stop offset="0%" stopColor="#ffefe0" />
          <stop offset="100%" stopColor="#ffc69e" />
        </radialGradient>
        <linearGradient id="blanket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--blan-a)" }} />
          <stop offset="100%" style={{ stopColor: "var(--blan-b)" }} />
        </linearGradient>
        <radialGradient id="puddle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="474" rx="160" ry="20" fill="url(#puddle)" />

      <g className="rig">
        {/* swaddle pod */}
        <path
          d="M92 336 C92 262 168 236 260 236 C352 236 428 262 428 336 C428 424 356 466 260 466 C164 466 92 424 92 336 Z"
          fill="url(#blanket)"
        />
        <path
          d="M150 272 Q260 332 370 272"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M132 384 Q260 434 388 378"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 12"
        />
        <circle cx="260" cy="330" r="14" fill="var(--blan-b)" />
        <path d="M260 330 Q232 344 224 370" fill="none" stroke="var(--blan-b)" strokeWidth="9" strokeLinecap="round" />
        <path d="M260 330 Q288 344 296 370" fill="none" stroke="var(--blan-b)" strokeWidth="9" strokeLinecap="round" />

        {/* tiny hands resting on the blanket */}
        <circle cx="170" cy="372" r="17" fill="url(#skin)" />
        <circle cx="350" cy="372" r="17" fill="url(#skin)" />

        <g className="head">
          {/* ears */}
          <circle cx="144" cy="214" r="24" fill="url(#skin)" />
          <circle cx="144" cy="214" r="11" fill="#f7b98d" />
          <circle cx="376" cy="214" r="24" fill="url(#skin)" />
          <circle cx="376" cy="214" r="11" fill="#f7b98d" />

          {/* face */}
          <circle cx="260" cy="208" r="118" fill="url(#skin)" />

          {/* hair curl */}
          <path
            d="M258 102 C252 74 276 62 292 72 C306 81 302 102 286 104 C276 106 270 98 276 92"
            fill="none"
            stroke="#6b4226"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M302 86 q16 -6 20 10" fill="none" stroke="#6b4226" strokeWidth="6" strokeLinecap="round" />

          {/* sleeping eyes */}
          <g className="sleep-only" stroke="#4d2b18" strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M166 222 Q202 238 238 222" />
            <path d="M282 222 Q318 238 354 222" />
          </g>

          {/* crying eyes — squeezed shut */}
          <g className="cry-only" stroke="#4d2b18" strokeLinecap="round" fill="none">
            <g strokeWidth="8">
              <path d="M170 230 Q202 206 234 230" />
              <path d="M286 230 Q318 206 350 230" />
            </g>
            <g strokeWidth="7">
              <path d="M170 178 L226 190" />
              <path d="M350 178 L294 190" />
            </g>
          </g>

          {/* tears */}
          <g className="cry-only" fill="#a8d6ff">
            <path className="tear t1" d="M178 246 q8 12 0 21 q-8 -9 0 -21 z" />
            <path className="tear t2" d="M342 246 q8 12 0 21 q-8 -9 0 -21 z" />
          </g>

          {/* nose */}
          <path d="M254 248 q7 8 15 0" fill="none" stroke="#dd9f77" strokeWidth="5" strokeLinecap="round" />

          {/* blush */}
          <ellipse className="blush" cx="196" cy="262" rx="17" ry="10" fill="#ff8f7d" opacity="0.55" />
          <ellipse className="blush" cx="324" cy="262" rx="17" ry="10" fill="#ff8f7d" opacity="0.55" />

          {/* sleeping mouth + drool bubble */}
          <g className="sleep-only">
            <ellipse cx="268" cy="296" rx="13" ry="17" fill="#6e3527" />
            <circle className="drool" cx="290" cy="314" r="7" fill="#bfe0ff" opacity="0.9" />
          </g>

          {/* wailing mouth */}
          <g className="cry-only">
            <g className="mouth-cry">
              <ellipse cx="260" cy="300" rx="38" ry="40" fill="#74222a" />
              <ellipse cx="260" cy="318" rx="20" ry="12" fill="#e56b72" />
            </g>
          </g>

          {/* agitation marks while crying */}
          <g className="cry-only" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round">
            <path className="shake-line" d="M112 150 L94 136" />
            <path className="shake-line l2" d="M112 196 L92 198" />
            <path className="shake-line l2" d="M408 150 L426 136" />
            <path className="shake-line" d="M408 196 L428 198" />
          </g>
        </g>

        {/* sparkles while sleeping */}
        <g className="sleep-only" fill="var(--z)">
          <path className="sparkle s1" transform="translate(128,124)" d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" />
          <path className="sparkle s2" transform="translate(398,100) scale(0.8)" d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" />
        </g>

        {/* floating Zzz's */}
        <g className="sleep-only">
          <text className="zzz z1" x="336" y="170" fontSize="30">z</text>
          <text className="zzz z2" x="368" y="134" fontSize="42">z</text>
          <text className="zzz z3" x="404" y="92" fontSize="56">z</text>
        </g>
      </g>
    </svg>
  );
}

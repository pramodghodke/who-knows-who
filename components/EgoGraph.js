"use client";

// The one deliberately illustrative element in the UI: draws the selected
// person as a hub node with their direct KNOWS connections around them,
// exactly as the graph database sees it. This is the same shape as the
// Cypher query below it — nodes and edges, not rows.
export default function EgoGraph({ center, friends }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const ringRadius = 118;
  const shown = friends.slice(0, 10);
  const extra = friends.length - shown.length;

  const points = shown.map((f, i) => {
    const angle = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...f,
      x: cx + ringRadius * Math.cos(angle),
      y: cy + ringRadius * Math.sin(angle),
    };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" className="max-w-[320px]">
      {points.map((p) => (
        <line
          key={`line-${p.id}`}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="#232833"
          strokeWidth="1.5"
        />
      ))}

      {points.map((p) => (
        <g key={p.id}>
          <circle cx={p.x} cy={p.y} r="17" fill="#181C24" stroke="#2E3542" strokeWidth="1" />
          <clipPath id={`clip-${p.id}`}>
            <circle cx={p.x} cy={p.y} r="16" />
          </clipPath>
          <image
            href={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
              p.avatarSeed || p.name
            )}&backgroundColor=181c24`}
            x={p.x - 16}
            y={p.y - 16}
            width="32"
            height="32"
            clipPath={`url(#clip-${p.id})`}
          />
        </g>
      ))}

      {extra > 0 && (
        <text
          x={cx}
          y={size - 6}
          textAnchor="middle"
          className="fill-mist-400"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          +{extra} more connection{extra === 1 ? "" : "s"}
        </text>
      )}

      {/* center hub */}
      <circle cx={cx} cy={cy} r="24" fill="#0B0D11" stroke="#5EEAD4" strokeWidth="2" />
      <clipPath id="clip-center">
        <circle cx={cx} cy={cy} r="22" />
      </clipPath>
      <image
        href={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
          center.avatarSeed || center.name
        )}&backgroundColor=0b0d11`}
        x={cx - 22}
        y={cy - 22}
        width="44"
        height="44"
        clipPath="url(#clip-center)"
      />
    </svg>
  );
}

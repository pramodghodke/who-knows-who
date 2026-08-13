export default function Avatar({ seed, size = 44, ring = false }) {
  const src = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=181c24`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`rounded-full bg-ink-800 ${ring ? "ring-2 ring-signal/60" : ""}`}
      style={{ width: size, height: size }}
    />
  );
}

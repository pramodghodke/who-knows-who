import Link from "next/link";
import Avatar from "./Avatar";

export default function ConnectionsList({ friends }) {
  if (friends.length === 0) {
    return <p className="text-sm text-mist-400">No direct connections yet.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {friends.map((f) => (
        <li key={f.id}>
          <Link
            href={`/person/${f.id}`}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-ink-800 transition-colors group"
          >
            <Avatar seed={f.avatarSeed || f.name} size={30} />
            <span className="text-sm text-mist-200 group-hover:text-signal transition-colors">
              {f.name}
            </span>
            <span className="text-xs text-mist-400 ml-auto">{f.location}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

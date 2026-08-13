import Link from "next/link";
import Avatar from "./Avatar";

export default function PersonCard({ person }) {
  return (
    <Link
      href={`/person/${person.id}`}
      className="group flex items-center gap-3 p-4 rounded-xl border border-ink-700 bg-ink-900 hover:border-signal/50 hover:bg-ink-800 transition-colors"
    >
      <Avatar seed={person.avatarSeed || person.name} size={40} />
      <div className="min-w-0">
        <p className="font-medium text-mist-100 truncate group-hover:text-signal transition-colors">
          {person.name}
        </p>
        <p className="text-xs text-mist-400 truncate">{person.location}</p>
      </div>
    </Link>
  );
}

import Link from "next/link";
import Avatar from "./Avatar";
import { EmptyState } from "./States";

export default function RecommendationsList({ recommendations }) {
  if (recommendations.length === 0) {
    return (
      <EmptyState
        title="No recommendations yet."
        hint="This person doesn't share any mutual friends with anyone outside their direct circle."
      />
    );
  }

  const maxMutual = Math.max(...recommendations.map((r) => r.mutualCount), 1);

  return (
    <ul className="space-y-2">
      {recommendations.map((rec) => (
        <li
          key={rec.person.id}
          className="p-3 rounded-xl border border-ink-700 bg-ink-900 hover:border-signal/40 transition-colors"
        >
          <Link href={`/person/${rec.person.id}`} className="flex items-center gap-3 group">
            <Avatar seed={rec.person.avatarSeed || rec.person.name} size={38} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-mist-100 group-hover:text-signal transition-colors truncate">
                {rec.person.name}
              </p>
              <p className="text-xs text-mist-400 truncate">{rec.person.location}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-signal text-sm">{rec.mutualCount}</p>
              <p className="text-[10px] text-mist-400 uppercase tracking-wide">mutual</p>
            </div>
          </Link>

          <div className="mt-2 h-1 rounded-full bg-ink-700 overflow-hidden">
            <div
              className="h-full bg-signal/70"
              style={{ width: `${(rec.mutualCount / maxMutual) * 100}%` }}
            />
          </div>

          <p className="text-xs text-mist-400 mt-2">
            via{" "}
            {rec.mutualFriends
              .slice(0, 3)
              .map((f) => f.name)
              .join(", ")}
            {rec.mutualFriends.length > 3 ? ` +${rec.mutualFriends.length - 3} more` : ""}
          </p>

          {rec.sharedInterests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {rec.sharedInterests.map((interest) => (
                <span
                  key={interest}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber/10 text-amber border border-amber/20"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

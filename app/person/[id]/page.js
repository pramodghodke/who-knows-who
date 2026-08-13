"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import EgoGraph from "@/components/EgoGraph";
import ConnectionsList from "@/components/ConnectionsList";
import RecommendationsList from "@/components/RecommendationsList";
import { LoadingState, EmptyState, ErrorState } from "@/components/States";

export default function PersonPage() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null); // { person, friends, interests }
  const [profileError, setProfileError] = useState(null);

  const [recommendations, setRecommendations] = useState(null);
  const [recError, setRecError] = useState(null);

  const [everyone, setEveryone] = useState([]); // for the "how are we connected" picker
  const [targetId, setTargetId] = useState("");
  const [pathResult, setPathResult] = useState(null); // { path, degrees, connected }
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState(null);

  async function loadProfile() {
    setProfileError(null);
    setProfile(null);
    try {
      const res = await fetch(`/api/people/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load this person.");
      setProfile(data);
    } catch (err) {
      setProfileError(err.message);
    }
  }

  async function loadRecommendations() {
    setRecError(null);
    setRecommendations(null);
    try {
      const res = await fetch(`/api/people/${id}/recommendations`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load recommendations.");
      setRecommendations(data.recommendations);
    } catch (err) {
      setRecError(err.message);
    }
  }

  async function loadEveryone() {
    try {
      const res = await fetch("/api/people");
      const data = await res.json();
      if (res.ok) setEveryone(data.people);
    } catch {
      // Non-critical for the page — the path picker just stays empty.
    }
  }

  useEffect(() => {
    if (!id) return;
    loadProfile();
    loadRecommendations();
    loadEveryone();
    setPathResult(null);
    setTargetId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const pickerOptions = useMemo(
    () => everyone.filter((p) => p.id !== id).sort((a, b) => a.name.localeCompare(b.name)),
    [everyone, id]
  );

  async function findPath(e) {
    e.preventDefault();
    if (!targetId) return;
    setPathLoading(true);
    setPathError(null);
    setPathResult(null);
    try {
      const res = await fetch(`/api/people/${id}/path/${targetId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to find a path.");
      setPathResult(data);
    } catch (err) {
      setPathError(err.message);
    } finally {
      setPathLoading(false);
    }
  }

  if (profileError) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <ErrorState message={profileError} onRetry={loadProfile} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <LoadingState label="Loading profile..." />
      </div>
    );
  }

  const { person, friends, interests } = profile;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-xs font-mono text-mist-400 hover:text-signal transition-colors"
      >
        ← back to everyone
      </Link>

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <Avatar seed={person.avatarSeed || person.name} size={64} ring />
        <div className="min-w-0">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-mist-100 tracking-tight">
            {person.name}
          </h1>
          <p className="text-sm text-mist-400 mt-0.5">{person.location}</p>
          {person.bio && <p className="text-mist-300 mt-2 max-w-xl">{person.bio}</p>}
          {interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-signal/10 text-signal border border-signal/20"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ego graph + connections + recommendations */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-sm font-semibold text-mist-200 uppercase tracking-wide mb-4">
            Direct connections ({friends.length})
          </h2>
          <div className="flex justify-center mb-6">
            <EgoGraph center={person} friends={friends} />
          </div>
          <ConnectionsList friends={friends} />
        </section>

        <section>
          <h2 className="font-display text-sm font-semibold text-mist-200 uppercase tracking-wide mb-4">
            People {person.name.split(" ")[0]} may know
          </h2>
          {recError && <ErrorState message={recError} onRetry={loadRecommendations} />}
          {!recError && recommendations === null && (
            <LoadingState label="Finding mutual connections..." />
          )}
          {!recError && recommendations !== null && (
            <RecommendationsList recommendations={recommendations} />
          )}
        </section>
      </div>

      {/* How are we connected? */}
      <section className="mt-12 border-t border-ink-700 pt-8">
        <h2 className="font-display text-sm font-semibold text-mist-200 uppercase tracking-wide mb-1">
          How is {person.name.split(" ")[0]} connected to someone else?
        </h2>
        <p className="text-xs text-mist-400 mb-4">
          Traces the shortest chain of connections between two people — a multi-hop
          graph traversal, not a lookup.
        </p>

        <form onSubmit={findPath} className="flex flex-wrap items-center gap-3">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="bg-ink-900 border border-ink-700 rounded-xl px-3 py-2 text-sm text-mist-100 outline-none focus:border-signal/60 transition-colors"
          >
            <option value="">Choose a person...</option>
            {pickerOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.location}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!targetId || pathLoading}
            className="text-sm font-medium px-4 py-2 rounded-xl bg-signal/90 text-ink-950 hover:bg-signal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {pathLoading ? "Tracing..." : "Find path"}
          </button>
        </form>

        {pathError && (
          <div className="mt-4">
            <ErrorState message={pathError} />
          </div>
        )}

        {pathResult && pathResult.connected === false && (
          <div className="mt-4">
            <EmptyState
              title="No path found within 6 hops."
              hint="They may belong to entirely separate parts of the network."
            />
          </div>
        )}

        {pathResult && pathResult.connected && (
          <div className="mt-6">
            <p className="text-xs font-mono text-signal mb-3">
              {pathResult.degrees} degree{pathResult.degrees === 1 ? "" : "s"} of separation
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {pathResult.path.map((node, i) => (
                <div key={node.id} className="flex items-center gap-2">
                  <Link
                    href={`/person/${node.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-ink-700 bg-ink-900 hover:border-signal/50 transition-colors"
                  >
                    <Avatar seed={node.avatarSeed || node.name} size={22} />
                    <span className="text-sm text-mist-200">{node.name}</span>
                  </Link>
                  {i < pathResult.path.length - 1 && (
                    <span className="text-mist-400 text-sm">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

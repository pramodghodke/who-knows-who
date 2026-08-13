"use client";

import { useEffect, useMemo, useState } from "react";
import PersonCard from "@/components/PersonCard";
import { LoadingState, EmptyState, ErrorState } from "@/components/States";

export default function HomePage() {
  const [people, setPeople] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  async function load() {
    setError(null);
    setPeople(null);
    try {
      const res = await fetch("/api/people");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load people.");
      setPeople(data.people);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!people) return [];
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }, [people, query]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <section className="mb-10">
        <p className="text-xs font-mono text-signal mb-3">people ↔ mutual friends ↔ people</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-mist-100 tracking-tight max-w-2xl">
          Find out who you should already know.
        </h1>
        <p className="text-mist-300 mt-3 max-w-xl">
          Pick anyone in the network to see their connections, who they're likely
          to know next, and how they're linked to anyone else — all traced
          through a graph, not a spreadsheet.
        </p>
      </section>

      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or city..."
          className="w-full sm:w-96 bg-ink-900 border border-ink-700 rounded-xl px-4 py-2.5 text-sm text-mist-100 placeholder:text-mist-400 focus:border-signal/60 outline-none transition-colors"
        />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && people === null && <LoadingState label="Loading the network..." />}
      {!error && people !== null && filtered.length === 0 && (
        <EmptyState
          title="No one matches that search."
          hint="Try a different name or city."
        />
      )}

      {!error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}
    </div>
  );
}

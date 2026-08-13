import "./globals.css";

export const metadata = {
  title: "Who Knows Who — a social graph explorer",
  description:
    "Explore a social network as a graph: mutual friends, people you may know, and how any two people are connected.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-ink-950 text-mist-100 min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-ink-700">
            <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 group">
                <NodeMark />
                <span className="font-display text-lg font-semibold tracking-tight text-mist-100">
                  who knows who
                </span>
              </a>
              <span className="hidden sm:inline text-xs font-mono text-mist-400">
                graph db · CognoDB
              </span>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-ink-700">
            <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-mist-400 font-mono">
              Built on a graph database — nodes are people, edges are how they know each other.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

function NodeMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="5" y1="17" x2="11" y2="5" stroke="#5EEAD4" strokeWidth="1.4" />
      <line x1="11" y1="5" x2="17" y2="17" stroke="#5EEAD4" strokeWidth="1.4" />
      <line x1="5" y1="17" x2="17" y2="17" stroke="#2E3542" strokeWidth="1.4" />
      <circle cx="11" cy="5" r="3" fill="#5EEAD4" />
      <circle cx="5" cy="17" r="3" fill="#F5A623" />
      <circle cx="17" cy="17" r="3" fill="#F5A623" />
    </svg>
  );
}

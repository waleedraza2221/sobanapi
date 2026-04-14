"use client";
import { useState } from "react";

export default function TestPage() {
  const [query, setQuery] = useState("software developer");
  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState<Record<string, unknown>[] | null>(null);
  const [transformed, setTransformed] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setError(null);
    setRaw(null);
    setTransformed(null);

    try {
      // Call the debug endpoint that returns raw + transformed data
      const res = await fetch("/api/test-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setRaw(data.raw);
      setTransformed(data.transformed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">BrightData API Test</h1>
      <p className="text-gray-400 mb-6 text-sm">
        This page triggers a real BrightData search and shows the raw API
        response so we can verify the field mapping. Delete this page after
        debugging.
      </p>

      <div className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search query…"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
        />
        <button
          onClick={runTest}
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-2 rounded-lg font-medium"
        >
          {loading ? "Searching…" : "Test Search"}
        </button>
      </div>

      {loading && (
        <div className="text-yellow-400 mb-4">
          ⏳ Waiting for BrightData (can take up to 90s)…
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-red-400">Error</h3>
          <pre className="text-sm mt-1 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {raw && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-yellow-400">
            Raw BrightData Response ({Array.isArray(raw) ? raw.length : 0}{" "}
            items)
          </h2>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs overflow-auto max-h-[500px] whitespace-pre-wrap">
            {JSON.stringify(raw, null, 2)}
          </pre>
        </div>
      )}

      {transformed && (
        <div>
          <h2 className="text-lg font-semibold mb-2 text-green-400">
            Transformed Leads ({Array.isArray(transformed) ? transformed.length : 0}{" "}
            items)
          </h2>
          <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-xs overflow-auto max-h-[500px] whitespace-pre-wrap">
            {JSON.stringify(transformed, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

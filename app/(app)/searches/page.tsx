"use client";
import Link from "next/link";
import { mockRecentSearches } from "@/lib/mock-data";
import { Search, MapPin, Briefcase, Clock, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";

export default function RecentSearchesPage() {
  const [searches, setSearches] = useState(mockRecentSearches);

  function removeSearch(id: string) {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Recent Searches</h1>
        <p className="text-gray-500 mt-1">Quickly re-run or review your past searches.</p>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
          <Search size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-700">No recent searches</p>
          <Link href="/search" className="text-sm text-blue-600 hover:underline mt-2 block">
            Start a new search →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {searches.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition-shadow group"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Search size={13} className="text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate">{s.query}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {s.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {s.location}
                      </span>
                    )}
                    {s.industry && (
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} /> {s.industry}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatDate(s.searchedAt)}
                    </span>
                  </div>

                  {/* Filter badges */}
                  {s.filters && Object.keys(s.filters).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Object.entries(s.filters).map(([key, val]) => (
                        <span
                          key={key}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full"
                        >
                          {key}: {String(val)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <div className="text-right mr-2">
                    <div className="text-sm font-semibold text-gray-900">{s.resultCount}</div>
                    <div className="text-xs text-gray-400">results</div>
                  </div>
                  <Link
                    href={`/search?q=${encodeURIComponent(s.query)}&location=${encodeURIComponent(s.location)}`}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    <RefreshCw size={12} /> Re-run
                  </Link>
                  <button
                    onClick={() => removeSearch(s.id)}
                    className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockLeads } from "@/lib/mock-data";
import LeadCard from "@/components/LeadCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

const industries = ["All Industries", "SaaS", "FinTech", "E-Commerce", "Healthcare", "EdTech", "Marketing", "Real Estate"];
const experienceLevels = ["Any", "Entry Level", "Mid Level", "Senior", "Director", "VP", "C-Suite"];
const companySizes = ["Any", "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

type Filters = {
  query: string;
  location: string;
  industry: string;
  experience: string;
  companySize: string;
  remote: boolean;
  hasEmail: boolean;
};

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading search...</div>}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const params = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    query: params.get("q") ?? "",
    location: params.get("location") ?? "",
    industry: "All Industries",
    experience: "Any",
    companySize: "Any",
    remote: false,
    hasEmail: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState(!!params.get("q"));
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function set(key: keyof Filters, val: string | boolean) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setSearched(true);
  }

  function handleSave(id: string) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const results = useMemo(() => {
    if (!searched) return [];
    return mockLeads.filter((lead) => {
      const q = filters.query.toLowerCase();
      if (
        q &&
        !lead.name.toLowerCase().includes(q) &&
        !lead.title.toLowerCase().includes(q) &&
        !lead.company.toLowerCase().includes(q) &&
        !lead.industry.toLowerCase().includes(q)
      )
        return false;
      if (filters.location && !lead.location.toLowerCase().includes(filters.location.toLowerCase()))
        return false;
      if (filters.industry !== "All Industries" && lead.industry !== filters.industry)
        return false;
      if (filters.experience !== "Any" && lead.experience !== filters.experience)
        return false;
      if (filters.hasEmail && !lead.email) return false;
      return true;
    });
  }, [searched, filters]);

  const activeFilterCount = [
    filters.industry !== "All Industries",
    filters.experience !== "Any",
    filters.companySize !== "Any",
    filters.remote,
    filters.hasEmail,
  ].filter(Boolean).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Leads</h1>
        <p className="text-gray-500 mt-1">Find professionals by role, company, location, and more.</p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl border border-gray-200 p-5 mb-5"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => set("query", e.target.value)}
              placeholder="Role, title, company, or keyword…"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div className="relative sm:w-52">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Location (city, country…)"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => set("industry", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {industries.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Experience</label>
              <select
                value={filters.experience}
                onChange={(e) => set("experience", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {experienceLevels.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Company Size</label>
              <select
                value={filters.companySize}
                onChange={(e) => set("companySize", e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {companySizes.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3 pt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.remote}
                  onChange={(e) => set("remote", e.target.checked)}
                  className="rounded accent-blue-600"
                />
                Remote only
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasEmail}
                  onChange={(e) => set("hasEmail", e.target.checked)}
                  className="rounded accent-blue-600"
                />
                Has email
              </label>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      industry: "All Industries",
                      experience: "Any",
                      companySize: "Any",
                      remote: false,
                      hasEmail: false,
                    }))
                  }
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
                >
                  <X size={13} /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Results */}
      {!searched && (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Run a search to find leads</p>
          <p className="text-sm mt-1">Try "CEO in SaaS" or "Marketing Director"</p>
        </div>
      )}

      {searched && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{results.length}</span> results found
              {filters.query && (
                <> for <span className="font-medium text-gray-700">"{filters.query}"</span></>
              )}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 font-medium">No leads match your filters</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search query or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onSave={handleSave}
                  onAddToList={() => {}}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

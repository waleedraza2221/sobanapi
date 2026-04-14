"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import LeadCard from "@/components/LeadCard";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";

const industries = ["All Industries", "SaaS", "FinTech", "E-Commerce", "Healthcare", "EdTech", "Marketing", "Real Estate", "Consulting", "Legal", "Manufacturing", "Logistics", "Media", "Non-Profit", "Government"];
const experienceLevels = ["Any", "Entry Level", "Mid Level", "Senior", "Director", "VP", "C-Suite"];
const companySizes = ["Any", "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const countries = ["Any", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", "Pakistan", "UAE", "Singapore", "Netherlands", "Sweden", "Brazil", "South Africa"];
const connectionDegrees = ["Any", "1st", "2nd", "3rd+"];

type Filters = {
  query: string;
  location: string;
  country: string;
  industry: string;
  experience: string;
  companySize: string;
  jobTitle: string;
  company: string;
  connectionDegree: string;
  remote: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  openToWork: boolean;
};

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  linkedinUrl: string;
  email?: string;
  phone?: string;
  companySize?: string;
  experience?: string;
}

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
    country: "Any",
    industry: "All Industries",
    experience: "Any",
    companySize: "Any",
    jobTitle: "",
    company: "",
    connectionDegree: "Any",
    remote: false,
    hasEmail: false,
    hasPhone: false,
    openToWork: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Lead[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function set(key: keyof Filters, val: string | boolean) {
    setFilters((f) => ({ ...f, [key]: val }));
  }

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!filters.query.trim()) return;
    setLoading(true);
    setSearchError("");
    setSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: filters.query,
          location: filters.location,
          country: filters.country === "Any" ? "" : filters.country,
          industry: filters.industry === "All Industries" ? "" : filters.industry,
          experience: filters.experience === "Any" ? "" : filters.experience,
          companySize: filters.companySize === "Any" ? "" : filters.companySize,
          jobTitle: filters.jobTitle,
          company: filters.company,
          connectionDegree: filters.connectionDegree === "Any" ? "" : filters.connectionDegree,
          hasEmail: filters.hasEmail,
          hasPhone: filters.hasPhone,
          openToWork: filters.openToWork,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error ?? "Search failed. Please try again.");
        setResults([]);
      } else {
        setResults(data.leads ?? []);
      }
    } catch {
      setSearchError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(lead: Lead) {
    if (savedIds.has(lead.id)) return;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    if (res.ok) {
      setSavedIds((prev) => new Set(prev).add(lead.id));
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Failed to save lead");
    }
  }
  const activeFilterCount = [
    filters.industry !== "All Industries",
    filters.experience !== "Any",
    filters.companySize !== "Any",
    filters.country !== "Any",
    filters.jobTitle !== "",
    filters.company !== "",
    filters.connectionDegree !== "Any",
    filters.remote,
    filters.hasEmail,
    filters.hasPhone,
    filters.openToWork,
  ].filter(Boolean).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Search Leads</h1>
        <p className="text-gray-500 mt-1">Search by full name (e.g. <span className="font-medium text-gray-700">Elon Musk</span>) or keyword (e.g. <span className="font-medium text-gray-700">CEO SaaS New York</span>). Use filters to narrow results.</p>
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
              placeholder="Full name (John Doe) or keywords (CEO fintech London)…"
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
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Job Title <span className="text-blue-500 font-normal">(applied to search)</span></label>
                <input
                  type="text"
                  value={filters.jobTitle}
                  onChange={(e) => set("jobTitle", e.target.value)}
                  placeholder="e.g. CTO, Software Engineer…"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Company <span className="text-blue-500 font-normal">(applied to search)</span></label>
                <input
                  type="text"
                  value={filters.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="e.g. Google, Stripe…"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => set("country", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {countries.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Industry <span className="text-gray-400 font-normal">(filters results)</span></label>
                <select
                  value={filters.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {industries.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Connection</label>
                <select
                  value={filters.connectionDegree}
                  onChange={(e) => set("connectionDegree", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {connectionDegrees.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              {/* Checkboxes */}
              <div className="flex flex-col gap-2 pt-5">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.remote} onChange={(e) => set("remote", e.target.checked)} className="rounded accent-blue-600" />
                  Remote only
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.hasEmail} onChange={(e) => set("hasEmail", e.target.checked)} className="rounded accent-blue-600" />
                  Has email
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.hasPhone} onChange={(e) => set("hasPhone", e.target.checked)} className="rounded accent-blue-600" />
                  Has phone
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.openToWork} onChange={(e) => set("openToWork", e.target.checked)} className="rounded accent-blue-600" />
                  Open to work
                </label>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <div className="flex items-center pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      country: "Any",
                      industry: "All Industries",
                      experience: "Any",
                      companySize: "Any",
                      jobTitle: "",
                      company: "",
                      connectionDegree: "Any",
                      remote: false,
                      hasEmail: false,
                      hasPhone: false,
                      openToWork: false,
                    }))
                  }
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
                >
                  <X size={13} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-20">
          <Loader2 size={40} className="mx-auto mb-3 text-blue-500 animate-spin" />
          <p className="text-lg font-medium text-gray-700">Searching LinkedIn profiles…</p>
          <p className="text-sm text-gray-400 mt-1">This may take up to 30 seconds via BrightData.</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Run a search to find leads</p>
          <div className="text-sm mt-2 space-y-1">
            <p><span className="font-medium text-gray-600">Name search:</span> "Elon Musk", "Satya Nadella"</p>
            <p><span className="font-medium text-gray-600">Keyword search:</span> "CEO SaaS", "software engineer Google"</p>
            <p><span className="font-medium text-gray-600">With filters:</span> Add Job Title, Company, or Location for better results</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {searched && !loading && searchError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium">{searchError}</p>
          <p className="text-red-500 text-sm mt-1">Please check your BrightData credentials or try again.</p>
        </div>
      )}

      {searched && !loading && !searchError && (
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
              <p className="text-gray-500 font-medium">No leads found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different name or keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onSave={() => handleSave(lead)}
                  onAddToList={() => {}}
                  saved={savedIds.has(lead.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

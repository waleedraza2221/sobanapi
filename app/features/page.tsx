import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Search,
  BookmarkCheck,
  History,
  LayoutDashboard,
  Download,
  Filter,
  Globe,
  Mail,
  Phone,
  Users,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: Search,
    color: "bg-blue-100 text-blue-600",
    title: "Smart LinkedIn Search",
    desc: "Search millions of real LinkedIn profiles by job title, niche, location, industry, company size, and experience level. Live data powered by BrightData.",
  },
  {
    icon: Filter,
    color: "bg-purple-100 text-purple-600",
    title: "Advanced Filters",
    desc: "Narrow down results with precision. Filter by seniority, company size, remote status, email presence, and industry — all in one search.",
  },
  {
    icon: BookmarkCheck,
    color: "bg-green-100 text-green-600",
    title: "Save Contacts",
    desc: "Save any lead with a single click. Retrieve their email, phone, company, and LinkedIn URL whenever you need them.",
  },
  {
    icon: Users,
    color: "bg-orange-100 text-orange-600",
    title: "Lead Lists",
    desc: "Organise saved contacts into named lists. Build targeted prospect lists per campaign, region, or industry.",
  },
  {
    icon: History,
    color: "bg-pink-100 text-pink-600",
    title: "Search History",
    desc: "Every search is saved. Re-run any past search with one click. Review what worked and refine your outreach.",
  },
  {
    icon: LayoutDashboard,
    color: "bg-indigo-100 text-indigo-600",
    title: "Usage Dashboard",
    desc: "See your monthly search usage, saved leads count, and lists activity — all from one clean dashboard overview.",
  },
  {
    icon: Mail,
    color: "bg-red-100 text-red-600",
    title: "Email Discovery",
    desc: "Many profiles include verified email addresses, giving you a direct line to prospects beyond LinkedIn.",
  },
  {
    icon: Phone,
    color: "bg-yellow-100 text-yellow-600",
    title: "Phone Numbers",
    desc: "Access phone numbers when available in the LinkedIn profile data — useful for direct outreach and calling campaigns.",
  },
  {
    icon: Download,
    color: "bg-teal-100 text-teal-600",
    title: "CSV Export",
    desc: "Export any lead list to CSV in one click. Import directly into HubSpot, Salesforce, Notion, or any CRM.",
  },
  {
    icon: Globe,
    color: "bg-cyan-100 text-cyan-600",
    title: "Global Coverage",
    desc: "Search across 180+ countries and regions. Find prospects in any city, country, or timezone.",
  },
  {
    icon: Zap,
    color: "bg-amber-100 text-amber-600",
    title: "Fast Results",
    desc: "Get LinkedIn profile results in seconds via our BrightData pipeline. No waiting, no manual scraping.",
  },
  {
    icon: Shield,
    color: "bg-slate-100 text-slate-600",
    title: "Secure & Private",
    desc: "Your data is encrypted and stored in Supabase. We never share your searches or saved contacts with third parties.",
  },
];

const stats = [
  { value: "2M+", label: "Searchable profiles" },
  { value: "180+", label: "Countries" },
  { value: "50+", label: "Industries" },
  { value: "<30s", label: "Average search time" },
];

const useCases = [
  {
    role: "Sales Teams",
    icon: "💼",
    desc: "Build targeted prospect lists by industry and title. Find decision-makers before cold outreach.",
  },
  {
    role: "Recruiters",
    icon: "🎯",
    desc: "Discover candidates by role, location, and experience. Save profiles to lists per job opening.",
  },
  {
    role: "Founders",
    icon: "🚀",
    desc: "Find your first customers. Search by niche and location. Reach out to early adopters directly.",
  },
  {
    role: "Agencies",
    icon: "📊",
    desc: "Build lead lists for multiple clients. Export to CSV and import into any CRM or outreach tool.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <span className="inline-block text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-6 uppercase">
          Everything you need
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
          Powerful features for{" "}
          <span className="text-blue-600">serious prospectors</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          LeadHunter combines live LinkedIn data with powerful filtering, saving, and exporting tools —
          so you can find the right people and take action fast.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Start for Free <ChevronRight size={16} />
        </Link>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-bold text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">All features</h2>
          <p className="text-gray-500">Everything built in — no add-ons required.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md hover:border-blue-100 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-gray-50 border-t border-gray-100 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Who is it for?</h2>
            <p className="text-gray-500">LeadHunter works for any outbound team.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((u) => (
              <div key={u.role} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <div className="text-4xl mb-4">{u.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{u.role}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
              Powered by BrightData
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-5 mb-4">
              Real LinkedIn data, delivered in seconds
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              We use BrightData&apos;s LinkedIn Dataset API to retrieve live profile data — not outdated databases.
              Every search hits fresh data so you always get accurate results.
            </p>
            <ul className="space-y-3">
              {[
                "Live data from LinkedIn profiles",
                "Up-to-date job titles and companies",
                "Real emails and phone numbers",
                "Results in under 30 seconds",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
            <div className="space-y-4">
              {[
                { label: "Data Freshness", value: "Updated daily", color: "bg-green-500" },
                { label: "Profile Coverage", value: "2M+ profiles", color: "bg-blue-500" },
                { label: "Email Match Rate", value: "~60% of results", color: "bg-purple-500" },
                { label: "Search Speed", value: "< 30 seconds", color: "bg-orange-500" },
              ].map((row) => (
                <div key={row.label} className="bg-white rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-2 h-8 rounded-full ${row.color}`} />
                  <div>
                    <p className="text-xs text-gray-500">{row.label}</p>
                    <p className="font-semibold text-gray-900">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next customer?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Start with 5 free searches. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} LeadHunter. All rights reserved.</p>
      </footer>
    </div>
  );
}

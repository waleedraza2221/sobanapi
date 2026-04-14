import Navbar from "@/components/Navbar";
import Link from "next/link";
import { plans } from "@/lib/mock-data";

const features = [
  { icon: "Search", title: "Smart Lead Search", desc: "Search by niche, location, company size, experience level and more using live LinkedIn data." },
  { icon: "List", title: "Lead Lists", desc: "Organize leads into lists. Build targeted prospect lists for any campaign or industry." },
  { icon: "Clock", title: "Search History", desc: "Re-run any past search instantly. Save your best searches and get alerted on new results." },
  { icon: "Dashboard", title: "Usage Dashboard", desc: "Track your search usage, saved leads and list activity from one clean dashboard." },
  { icon: "Export", title: "CSV Export", desc: "Export any lead list to CSV. Connect to CRMs like HubSpot or Salesforce." },
  { icon: "Bell", title: "Saved Search Alerts", desc: "Get notified by email when new leads match your saved search criteria." },
];

const stats = [
  { value: "2M+", label: "Searchable profiles" },
  { value: "50+", label: "Industries covered" },
  { value: "180+", label: "Countries & regions" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-12 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20 text-center">
        <span className="inline-block text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-6 uppercase">
          Powered by LinkedIn Data
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Find your next customer{" "}
          <span className="text-blue-600">in any niche & location</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-8 sm:mb-10 max-w-2xl mx-auto">
          LeadHunter helps you discover qualified buyers, decision-makers, and professionals.
          Search by industry, location, and role. Save leads. Close deals.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm text-center"
          >
            Start for Free
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors text-center"
          >
            See a Demo Search
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required. Free plan available.</p>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 md:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to generate leads
          </h2>
          <p className="text-gray-500 text-lg">From search to export, all in one place.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-sm mb-4">
                {f.icon.slice(0, 2)}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-500 text-base sm:text-lg">Start free. Upgrade when you need more searches.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 ${
                plan.highlight
                  ? "bg-blue-600 text-white ring-2 ring-blue-500 shadow-lg"
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold bg-white/20 text-white px-2 py-1 rounded-full mb-3 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <div className={`text-3xl font-bold mb-4 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.price === -1 ? "Custom" : plan.price === 0 ? "Free" : `$${plan.price}`}
                {plan.price > 0 && plan.price !== -1 && (
                  <span className={`text-sm font-normal ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>
                    /mo
                  </span>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.slice(0, 3).map((feat) => (
                  <li
                    key={feat}
                    className={`text-sm flex gap-2 ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}
                  >
                    <span className={plan.highlight ? "text-white" : "text-blue-600"}>+</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center mt-8">
          <Link href="/pricing" className="text-blue-600 hover:underline text-sm font-medium">
            View full pricing details
          </Link>
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 md:py-24 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to find your next customer?</h2>
        <p className="text-gray-500 mb-8">
          Join thousands of sales teams using LeadHunter to grow their pipeline.
        </p>
        <Link
          href="/auth/register"
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-sm"
        >
          Get Started - It is Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>2026 LeadHunter. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
            <Link href="/auth/login" className="hover:text-gray-600">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { plans } from "@/lib/mock-data";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose your plan</h1>
          <p className="text-xl text-gray-500">Start free. Scale when you&apos;re ready.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-7 flex flex-col ${
                plan.highlight
                  ? "bg-blue-600 text-white ring-2 ring-blue-500 shadow-xl scale-105"
                  : "bg-white border border-gray-200 hover:shadow-md transition-shadow"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full mb-4 inline-block w-fit">
                  ★ Most Popular
                </span>
              )}
              <h3 className={`font-bold text-xl mb-2 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <div className={`text-4xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.price === -1 ? "Custom" : plan.price === 0 ? "$0" : `$${plan.price}`}
                {plan.price >= 0 && plan.price !== -1 && (
                  <span className={`text-base font-normal ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>
                    /mo
                  </span>
                )}
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>
                {plan.searches === -1 ? "Unlimited searches" : `${plan.searches} searches/month`}
              </p>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`text-sm flex gap-2.5 ${plan.highlight ? "text-blue-50" : "text-gray-600"}`}>
                    <span className={`font-bold shrink-0 ${plan.highlight ? "text-white" : "text-blue-600"}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === "enterprise" ? "mailto:sales@leadhunter.io" : "/auth/register"}
                className={`block text-center font-semibold py-3 rounded-xl transition-colors ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "border-2 border-gray-200 text-gray-800 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "What counts as a search?",
                a: "Each time you run a new search query on the Search page, it counts as one search. Re-running a saved search also counts as one.",
              },
              {
                q: "Can I export leads to CSV?",
                a: "Yes! All plans include CSV export. Pro and Enterprise plans also support direct CRM integrations.",
              },
              {
                q: "How often is the data updated?",
                a: "Our LinkedIn data is refreshed continuously. Most profiles are updated within 30 days.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. You can cancel your subscription at any time. Your plan stays active until the end of the billing period.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

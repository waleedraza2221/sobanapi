import { PLAN_CONFIG } from "@/lib/plans";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Check, X, CreditCard, Building2 } from "lucide-react";

const planOrder = ["free", "starter", "pro", "enterprise"] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-5 uppercase">
            Pricing
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-500">Monthly subscriptions. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 items-start">
          {planOrder.map((key) => {
            const plan = PLAN_CONFIG[key];
            return (
              <div
                key={key}
                className={`rounded-2xl p-7 flex flex-col relative ${
                  plan.highlight
                    ? "bg-blue-600 text-white ring-2 ring-blue-500 shadow-xl xl:-mt-3"
                    : "bg-white border border-gray-200 hover:shadow-md transition-shadow"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-blue-500 text-white px-4 py-1 rounded-full whitespace-nowrap border-2 border-white">
                    Most Popular
                  </span>
                )}
                <div className="mb-5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block mb-3 ${plan.highlight ? "bg-white/20 text-white" : plan.badge}`}>
                    {plan.label}
                  </span>
                  <p className={`text-sm ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>{plan.description}</p>
                </div>
                <div className="mb-6">
                  <div className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                    {plan.price === -1 ? "Custom" : plan.price === 0 ? "Free" : `$${plan.price}`}
                    {plan.price > 0 && (
                      <span className={`text-base font-normal ml-1 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>/ mo</span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 font-medium ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>
                    {plan.searches} searches / month
                  </p>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2.5 ${plan.highlight ? "text-blue-50" : "text-gray-600"}`}>
                      <Check size={14} className={`shrink-0 mt-0.5 ${plan.highlight ? "text-white" : "text-blue-500"}`} />
                      {f}
                    </li>
                  ))}
                  {plan.restrictions.map((r) => (
                    <li key={r} className={`text-sm flex items-start gap-2.5 ${plan.highlight ? "text-blue-200/60" : "text-gray-400"}`}>
                      <X size={14} className="shrink-0 mt-0.5 text-gray-300" />
                      {r}
                    </li>
                  ))}
                </ul>
                {key === "enterprise" ? (
                  <a href="mailto:hello@leadhunter.io" className="block text-center font-semibold py-3 rounded-xl text-sm border border-gray-200 text-gray-700 hover:bg-gray-50">
                    Contact Sales
                  </a>
                ) : key === "free" ? (
                  <Link href="/auth/register" className="block text-center font-semibold py-3 rounded-xl text-sm bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100">
                    {plan.cta}
                  </Link>
                ) : (
                  <Link
                    href={`/billing?plan=${key}`}
                    className={`block text-center font-semibold py-3 rounded-xl text-sm ${plan.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mb-16">
          Already have an account?{" "}
          <Link href="/billing" className="text-blue-600 hover:underline font-medium">Manage your plan →</Link>
        </p>

        {/* Payment methods */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How payments work</h2>
          <p className="text-gray-500 text-center mb-8">
            We accept local Pakistani payment methods. Pay, upload your receipt, and admin activates your plan within a few hours.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <CreditCard size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">JazzCash</h3>
                  <p className="text-xs text-gray-400">Mobile wallet</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Send the plan amount to our JazzCash account. Upload the payment screenshot and your transaction ID — we&apos;ll activate your plan within a few hours.
              </p>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Building2 size={20} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Bank Transfer</h3>
                  <p className="text-xs text-gray-400">HBL / any local bank</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Transfer to our HBL account. Upload proof of payment and we&apos;ll verify and activate your plan manually. PKR equivalent at current rate.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-16 text-center">
          <p className="text-sm text-blue-700 font-medium">
            All paid plans include a <span className="font-bold">monthly reset</span> of your search counter. Unused searches do not roll over.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: "What counts as a search?", a: "Each new search query on the Search page costs 1 search credit. Re-running a saved search also counts as one." },
              { q: "What is included in Free?", a: "5 searches per month with full LinkedIn profile results. Contact saving and search history require a paid plan." },
              { q: "How do I pay in PKR?", a: "Select your plan and go to Billing. Choose JazzCash or Bank Transfer, send the payment, upload the screenshot with your transaction ID, and we will activate your plan within a few hours." },
              { q: "How does the wallet balance work?", a: "Admins can load balance into your account wallet. Your wallet balance can be used to cover subscription renewals." },
              { q: "Who can have an Enterprise plan?", a: "Enterprise plans are assigned by an administrator. Contact our sales team or your account admin to get set up." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel at any time. Your plan stays active until the end of the current billing period." },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} LeadHunter. All rights reserved.</p>
      </footer>
    </div>
  );
}

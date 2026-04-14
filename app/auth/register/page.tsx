"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { plans } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      setStep(1);
      return;
    }
    // Auto sign-in after sign-up (if email confirm is disabled)
    await supabase.auth.signInWithPassword({ email, password });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-blue-600 font-bold text-2xl">
            LeadHunter
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm">Start finding leads in minutes</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  s <= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className="w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <h2 className="font-semibold text-gray-900 mb-4">Your details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
              >
                Continue →
              </button>
            </form>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-4">Choose your plan</h2>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-3 mb-6">
                {plans.filter((p) => p.id !== "enterprise").map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${
                      selectedPlan === plan.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          {plan.name}
                          {plan.highlight && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Popular</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{plan.features[0]}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account…" : selectedPlan === "free" ? "Start Free" : "Start Free Trial"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">No credit card required for free plan</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

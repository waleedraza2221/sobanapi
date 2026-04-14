"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PLAN_CONFIG } from "@/lib/plans";
import { Check, Clock, AlertTriangle, ChevronRight, Upload, CreditCard, Building2, X } from "lucide-react";

type PlanKey = "free" | "starter" | "pro" | "enterprise";
type PaymentMethod = "jazzcash" | "bank";

interface Profile {
  plan: PlanKey;
  plan_expires_at: string | null;
  wallet_balance: number;
  searches_used: number;
}

interface Payment {
  id: string;
  plan: string;
  amount: number;
  method: string;
  transaction_ref: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

const planOrder: PlanKey[] = ["free", "starter", "pro", "enterprise"];

const JAZZCASH_ACCOUNT = "0300-1234567";
const JAZZCASH_NAME = "LeadHunter";
const BANK_DETAILS = {
  bank: "HBL (Habib Bank Limited)",
  account: "0001-2345678-01",
  title: "LeadHunter Solutions",
  iban: "PK36 HABB 0000 1234 5678 0101",
};

function getPlanStatus(profile: Profile) {
  if (!profile.plan_expires_at || profile.plan === "free") return "active";
  const expiry = new Date(profile.plan_expires_at);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 5) return "expiring";
  return "active";
}

function formatExpiry(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });
}

function BillingPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(
    (searchParams.get("plan") as PlanKey) || null
  );

  // Payment form
  const [method, setMethod] = useState<PaymentMethod>("jazzcash");
  const [transactionRef, setTransactionRef] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const [{ data: prof }, { data: pays }] = await Promise.all([
        supabase.from("profiles").select("plan, plan_expires_at, wallet_balance, searches_used").eq("id", user.id).single(),
        supabase.from("payments").select("*").eq("user_id", user.id).order("submitted_at", { ascending: false }),
      ]);

      if (prof) setProfile(prof as Profile);
      if (pays) setPayments(pays as Payment[]);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setSubmitError("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setSubmitError("Image must be under 5 MB."); return; }
    setScreenshot(file);
    setSubmitError(null);
    const reader = new FileReader();
    reader.onloadend = () => setScreenshotPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan || selectedPlan === "free" || selectedPlan === "enterprise") return;
    if (!screenshot) { setSubmitError("Please upload a payment screenshot."); return; }
    if (!transactionRef.trim()) { setSubmitError("Please enter your transaction reference / ID."); return; }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload screenshot to Supabase Storage
      const ext = screenshot.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, screenshot, { contentType: screenshot.type });

      if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);

      // Store the file path (not public URL) — signed URLs generated server-side
      const res = await fetch("/api/billing/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          amount: selectedPlanConfig!.price,
          method,
          screenshot_url: fileName, // store path, not public URL
          transaction_ref: transactionRef.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");

      setSubmitSuccess(true);
      setSelectedPlan(null);
      setTransactionRef("");
      setScreenshot(null);
      setScreenshotPreview(null);

      // Refresh payments
      const { data: pays } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });
      if (pays) setPayments(pays as Payment[]);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const status = getPlanStatus(profile);
  const expiry = formatExpiry(profile.plan_expires_at);
  const currentPlanConfig = PLAN_CONFIG[profile.plan];
  const selectedPlanConfig = selectedPlan ? PLAN_CONFIG[selectedPlan] : null;
  const showPaymentForm = selectedPlan && selectedPlan !== "free" && selectedPlan !== "enterprise";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plan</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and payment history.</p>
      </div>

      {/* Success banner */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <Check size={18} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Payment submitted!</p>
            <p className="text-green-700 text-sm mt-0.5">
              Your payment is under review. We&apos;ll activate your plan within a few hours.
            </p>
          </div>
          <button onClick={() => setSubmitSuccess(false)} className="ml-auto text-green-400 hover:text-green-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Current plan status */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Current Plan</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`font-bold text-2xl text-gray-900`}>{currentPlanConfig.label}</span>
              {status === "active" && profile.plan !== "free" && (
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={11} /> Active
                </span>
              )}
              {status === "expiring" && (
                <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock size={11} /> Expiring soon
                </span>
              )}
              {status === "expired" && (
                <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <AlertTriangle size={11} /> Expired
                </span>
              )}
            </div>
            {expiry && (
              <p className={`text-sm ${status === "expired" ? "text-red-500" : status === "expiring" ? "text-yellow-600" : "text-gray-500"}`}>
                {status === "expired" ? "Expired on" : "Renews / expires"}: {expiry}
              </p>
            )}
            {profile.plan === "free" && (
              <p className="text-sm text-gray-400">No expiry — free plan</p>
            )}
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{profile.searches_used}</p>
              <p className="text-xs text-gray-400">Searches used</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">${profile.wallet_balance?.toFixed(2) ?? "0.00"}</p>
              <p className="text-xs text-gray-400">Wallet balance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Upgrade or Change Plan</h2>
        <p className="text-sm text-gray-400 mb-5">Select a plan to renew or upgrade your subscription.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {planOrder.map((key) => {
            const plan = PLAN_CONFIG[key];
            const isCurrent = key === profile.plan;
            const isSelected = key === selectedPlan;
            const isDisabled = key === "free" || key === "enterprise";
            return (
              <button
                key={key}
                disabled={isDisabled}
                onClick={() => !isDisabled && setSelectedPlan(key)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : isCurrent
                    ? "border-green-300 bg-green-50"
                    : isDisabled
                    ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                    {plan.label}
                  </span>
                  {isCurrent && <span className="text-xs text-green-600 font-medium">Current</span>}
                  {isSelected && !isCurrent && <Check size={14} className="text-blue-500" />}
                </div>
                <p className={`text-lg font-bold ${isSelected ? "text-blue-600" : "text-gray-800"}`}>
                  {plan.price === 0 ? "Free" : plan.price === -1 ? "Custom" : `$${plan.price}/mo`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{plan.searches} searches/mo</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment form */}
      {showPaymentForm && selectedPlanConfig && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1">
            Pay for {selectedPlanConfig.label} Plan — ${selectedPlanConfig.price}/mo
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Choose a payment method, complete the transfer, then submit your receipt below.
          </p>

          {/* Method selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setMethod("jazzcash")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${method === "jazzcash" ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-red-500" />
                <span className="font-semibold text-sm text-gray-900">JazzCash</span>
                {method === "jazzcash" && <Check size={13} className="text-red-500 ml-auto" />}
              </div>
              <p className="text-xs text-gray-400">Mobile wallet payment</p>
            </button>
            <button
              type="button"
              onClick={() => setMethod("bank")}
              className={`p-4 rounded-xl border-2 text-left transition-all ${method === "bank" ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={16} className="text-green-600" />
                <span className="font-semibold text-sm text-gray-900">Bank Transfer</span>
                {method === "bank" && <Check size={13} className="text-green-600 ml-auto" />}
              </div>
              <p className="text-xs text-gray-400">HBL bank transfer</p>
            </button>
          </div>

          {/* Payment instructions */}
          {method === "jazzcash" ? (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-red-700 mb-2">JazzCash Transfer Instructions</p>
              <ol className="text-sm text-red-600 space-y-1 list-decimal list-inside">
                <li>Open your JazzCash app</li>
                <li>
                  Send <span className="font-bold">PKR equivalent of ${selectedPlanConfig.price}</span> to{" "}
                  <span className="font-bold font-mono">{JAZZCASH_ACCOUNT}</span> ({JAZZCASH_NAME})
                </li>
                <li>Note down your Transaction ID from the confirmation screen</li>
                <li>Take a screenshot of the confirmation</li>
              </ol>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-green-700 mb-2">Bank Transfer Instructions</p>
              <div className="text-sm text-green-700 space-y-1">
                <p><span className="font-medium">Bank:</span> {BANK_DETAILS.bank}</p>
                <p><span className="font-medium">Account Title:</span> {BANK_DETAILS.title}</p>
                <p><span className="font-medium">Account No:</span> <span className="font-mono">{BANK_DETAILS.account}</span></p>
                <p><span className="font-medium">IBAN:</span> <span className="font-mono">{BANK_DETAILS.iban}</span></p>
                <p className="pt-1">
                  Transfer <span className="font-bold">PKR equivalent of ${selectedPlanConfig.price}</span>. Note your transaction reference number.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Transaction Reference / ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. TXN123456789"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Payment Screenshot <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all"
              >
                {screenshotPreview ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={screenshotPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                    <p className="text-xs text-gray-400">{screenshot?.name} — Click to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={24} className="mx-auto text-gray-300" />
                    <p className="text-sm text-gray-500">Click to upload screenshot</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5 MB</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Payment for Review <ChevronRight size={16} />
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Your plan will be activated within a few hours of submission review.
            </p>
          </form>
        </div>
      )}

      {/* Payment history */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CreditCard size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No payments yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-100 rounded-xl p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm capitalize">{payment.plan} Plan</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">${payment.amount}/mo</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500 capitalize">{payment.method === "jazzcash" ? "JazzCash" : "Bank Transfer"}</span>
                  </div>
                  {payment.transaction_ref && (
                    <p className="text-xs text-gray-400 font-mono">Ref: {payment.transaction_ref}</p>
                  )}
                  {payment.admin_note && (
                    <p className="text-xs text-gray-500 mt-1 italic">{payment.admin_note}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(payment.submitted_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    payment.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : payment.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {payment.status === "approved" ? "Approved" : payment.status === "rejected" ? "Rejected" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading billing…</div>}>
      <BillingPageInner />
    </Suspense>
  );
}

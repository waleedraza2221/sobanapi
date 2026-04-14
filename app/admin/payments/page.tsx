"use client";
import { useState, useEffect, useCallback } from "react";
import { CreditCard, Check, X, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface Payment {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  method: string;
  screenshot_url: string;
  screenshot_signed_url: string | null;
  transaction_ref: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  profiles: {
    name: string | null;
    email: string;
    plan: string;
    plan_expires_at: string | null;
  } | null;
}

type FilterKey = "all" | "pending" | "approved" | "rejected";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<FilterKey>("pending");
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? `HTTP ${res.status}`);
      setPayments(d.payments ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function reviewPayment(paymentId: string, action: "approved" | "rejected") {
    setReviewLoading(paymentId + action);
    setReviewError(null);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          action,
          note: reviewNote[paymentId] || null,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? `HTTP ${res.status}`);
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: action,
                admin_note: reviewNote[paymentId] || null,
                reviewed_at: new Date().toISOString(),
              }
            : p
        )
      );
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setReviewLoading(null);
    }
  }

  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const filteredPayments = payments.filter(
    (p) => paymentFilter === "all" || p.status === paymentFilter
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {loading ? "Loading..." : `${payments.length} total`}
            {!loading && pendingCount > 0 && (
              <span className="text-yellow-600 font-medium ml-1">
                · {pendingCount} pending
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadPayments}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={loadPayments} className="text-xs font-medium text-red-600 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Review action error */}
      {reviewError && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{reviewError}</p>
          <button onClick={() => setReviewError(null)} className="text-xs text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["pending", "all", "approved", "rejected"] as FilterKey[]).map((f) => (
          <button
            key={f}
            onClick={() => setPaymentFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              paymentFilter === f
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
            {f === "pending" && pendingCount > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full ${
                  paymentFilter === "pending"
                    ? "bg-white/20 text-white"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-xl animate-pulse border border-gray-200"
            />
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <CreditCard size={32} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-400 text-sm">
            No {paymentFilter !== "all" ? paymentFilter : ""} payments found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Payment info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {payment.profiles?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {payment.profiles?.email}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        payment.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : payment.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap mb-2">
                    <span className="capitalize font-medium">{payment.plan} Plan</span>
                    <span className="text-gray-300">·</span>
                    <span>${payment.amount}/mo</span>
                    <span className="text-gray-300">·</span>
                    <span className="capitalize">
                      {payment.method === "jazzcash" ? "JazzCash" : "Bank Transfer"}
                    </span>
                    {payment.transaction_ref && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="font-mono text-xs">
                          Ref: {payment.transaction_ref}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Submitted:{" "}
                    {new Date(payment.submitted_at).toLocaleString("en-PK", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {payment.reviewed_at &&
                      ` · Reviewed: ${new Date(payment.reviewed_at).toLocaleString(
                        "en-PK",
                        { dateStyle: "medium", timeStyle: "short" }
                      )}`}
                  </p>
                  {payment.admin_note && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Note: {payment.admin_note}
                    </p>
                  )}
                </div>

                {/* Screenshot + actions */}
                <div className="flex flex-col gap-3 lg:items-end">
                  <button
                    onClick={() =>
                      setScreenshotModal(
                        payment.screenshot_signed_url ?? payment.screenshot_url
                      )
                    }
                    disabled={!payment.screenshot_signed_url}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ExternalLink size={12} /> View Screenshot
                  </button>

                  {payment.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Admin note (optional)"
                        value={reviewNote[payment.id] ?? ""}
                        onChange={(e) =>
                          setReviewNote((prev) => ({
                            ...prev,
                            [payment.id]: e.target.value,
                          }))
                        }
                        className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => reviewPayment(payment.id, "approved")}
                          disabled={reviewLoading === payment.id + "approved"}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                        >
                          <Check size={12} />
                          {reviewLoading === payment.id + "approved" ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => reviewPayment(payment.id, "rejected")}
                          disabled={reviewLoading === payment.id + "rejected"}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
                        >
                          <X size={12} />
                          {reviewLoading === payment.id + "rejected" ? "..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot Modal */}
      {screenshotModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setScreenshotModal(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setScreenshotModal(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-100 z-10"
            >
              <X size={16} className="text-gray-600" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotModal}
              alt="Payment screenshot"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

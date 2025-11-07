"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import BackButton from "@/components/ui/BackButton";

interface PayoutInstruction {
  id: string;
  amount_pence: number;
  eligible_on: string;
  status: 'PENDING' | 'QUEUED' | 'SENT' | 'FAILED' | 'REVERSED';
  created_at: string;
  lesson?: {
    start_time: string;
    end_time: string;
    price_pence: number;
  };
}

interface EarningsData {
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  pendingEarnings: number;
  completedLessons: number;
  pendingLessons: number;
  upcomingPayouts: PayoutInstruction[];
  payoutHistory: PayoutInstruction[];
}

export default function InstructorEarningsPage() {
  const sb = createSupabaseBrowser();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');
  const [stripeAccountStatus, setStripeAccountStatus] = useState<'required' | 'pending' | 'verified'>('required');
  const [stripeAccountLoading, setStripeAccountLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
    checkStripeAccount();
  }, [timeframe]);

  async function checkStripeAccount() {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        setStripeAccountLoading(false);
        return;
      }

      const { data: account } = await sb
        .from("stripe_connect_accounts")
        .select("id, charges_enabled, payouts_enabled, details_submitted")
        .eq("instructor_id", user.id)
        .maybeSingle();

      if (!account) {
        setStripeAccountStatus('required');
      } else if ((account as any).charges_enabled && (account as any).payouts_enabled && (account as any).details_submitted) {
        setStripeAccountStatus('verified');
      } else {
        setStripeAccountStatus('pending');
      }
    } catch (e) {
      console.error("Failed to check Stripe account:", e);
      setStripeAccountStatus('required');
    } finally {
      setStripeAccountLoading(false);
    }
  }

  async function handleConnectStripe() {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;

      // If verified, get login link to Stripe dashboard
      if (stripeAccountStatus === 'verified') {
        const response = await fetch("/api/stripe-connect/account", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructorId: user.id,
          }),
        });

        const data = await response.json();
        if (data.loginUrl) {
          window.location.href = data.loginUrl;
        } else {
          alert("Failed to access Stripe dashboard. Please try again.");
        }
      } else {
        // Otherwise, start onboarding
        const response = await fetch("/api/stripe-connect/account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instructorId: user.id,
            returnUrl: window.location.href,
            refreshUrl: window.location.href,
          }),
        });

        const data = await response.json();
        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
        }
      }
    } catch (e) {
      console.error("Failed to connect Stripe:", e);
      alert("Failed to connect Stripe account. Please try again.");
    }
  }

  async function loadEarnings() {
    try {
      setLoading(true);
      const { data: { user } } = await sb.auth.getUser();
      if (!user) {
        setError("Please sign in to view earnings");
        setLoading(false);
        return;
      }
      setUserId(user.id);

      // Calculate date ranges
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);

      // Fetch completed lessons with earnings
      const { data: completedLessons, error: lessonsError } = await sb
        .from("lessons")
        .select("id, price_pence, completed_at, start_time, end_time")
        .eq("instructor_id", user.id)
        .eq("status", "completed")
        .not("completed_at", "is", null);

      if (lessonsError) {
        console.error("Lessons query error:", lessonsError);
        throw lessonsError;
      }

      // Fetch pending lessons (confirmed but not completed)
      const { data: pendingLessons, error: pendingError } = await sb
        .from("bookings")
        .select("id, price, status")
        .eq("instructor_id", user.id)
        .in("status", ["confirmed", "pending"]);

      if (pendingError) {
        console.error("Pending lessons query error:", pendingError);
      }

      // Fetch payout instructions
      const { data: payoutInstructions, error: payoutError } = await sb
        .from("payout_instructions")
        .select(`
          id,
          amount_pence,
          eligible_on,
          status,
          created_at,
          lesson:lesson_id(
            start_time,
            end_time,
            price_pence
          )
        `)
        .eq("instructor_id", user.id)
        .order("eligible_on", { ascending: false })
        .limit(50);

      if (payoutError) {
        console.error("Payout instructions query error:", payoutError);
      }

      // Calculate earnings
      const allCompletedLessons = (completedLessons || []) as Array<{
        price_pence: number;
        completed_at: string;
      }>;

      const weeklyCompleted = allCompletedLessons.filter(lesson => {
        const completedDate = new Date(lesson.completed_at);
        return completedDate >= weekStart;
      });

      const monthlyCompleted = allCompletedLessons.filter(lesson => {
        const completedDate = new Date(lesson.completed_at);
        return completedDate >= monthStart;
      });

      const weeklyEarnings = weeklyCompleted.reduce((sum, lesson) => sum + lesson.price_pence, 0) / 100;
      const monthlyEarnings = monthlyCompleted.reduce((sum, lesson) => sum + lesson.price_pence, 0) / 100;
      const totalEarnings = allCompletedLessons.reduce((sum, lesson) => sum + lesson.price_pence, 0) / 100;
      
      const pendingEarnings = (pendingLessons || []).reduce((sum: number, booking: { price: number }) => sum + (booking.price || 0), 0);

      // Process payout instructions
      const allPayouts = (payoutInstructions || []) as Array<PayoutInstruction>;
      const upcomingPayouts = allPayouts.filter(p => 
        p.status === 'PENDING' || p.status === 'QUEUED'
      );
      const payoutHistory = allPayouts.filter(p => 
        p.status === 'SENT' || p.status === 'FAILED' || p.status === 'REVERSED'
      );

      setEarnings({
        weeklyEarnings,
        monthlyEarnings,
        totalEarnings,
        pendingEarnings,
        completedLessons: allCompletedLessons.length,
        pendingLessons: (pendingLessons || []).length,
        upcomingPayouts: upcomingPayouts.slice(0, 10),
        payoutHistory: payoutHistory.slice(0, 20),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load earnings");
      console.error("Failed to load earnings:", e);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "SENT":
        return "bg-green-100 text-green-800";
      case "PENDING":
      case "QUEUED":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REVERSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function formatPaymentStatus(status: string): string {
    switch (status) {
      case "SENT":
        return "Complete";
      case "PENDING":
      case "QUEUED":
        return "Pending";
      case "FAILED":
        return "Failed";
      case "REVERSED":
        return "Reversed";
      default:
        return status;
    }
  }

  function getMonthAbbreviation(): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[new Date().getMonth()];
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  if (error || !earnings) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load earnings"}</p>
          <button
            onClick={() => loadEarnings()}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentEarnings = timeframe === 'week' ? earnings.weeklyEarnings : earnings.monthlyEarnings;
  const target = 3000; // £3,000 monthly target
  const progressPercentage = Math.min((currentEarnings / target) * 100, 100);

  const getMoneyStackImage = () => {
    const earningsRatio = currentEarnings / target;
    if (earningsRatio >= 0.8) return "Money%20x6.png";
    if (earningsRatio >= 0.4) return "Money%20x4.png";
    return "Money%20x2.png";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Payments Section */}
      {!stripeAccountLoading && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Stripe Account Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  stripeAccountStatus === 'required' ? 'bg-red-100 text-red-800' :
                  stripeAccountStatus === 'pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {stripeAccountStatus === 'required' ? 'Required' :
                   stripeAccountStatus === 'pending' ? 'Pending Verification' :
                   'Verified'}
                </span>
              </div>
            </div>
            {stripeAccountStatus !== 'verified' && (
              <div className={`border rounded-lg p-4 mb-4 ${
                stripeAccountStatus === 'required' ? 'bg-red-50 border-red-200' :
                'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    stripeAccountStatus === 'required' ? 'bg-red-500' : 'bg-orange-500'
                  }`}>
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {stripeAccountStatus === 'required' 
                        ? 'Set up your Stripe account to start receiving payments.'
                        : 'Your Stripe account is being verified. This may take a few days.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleConnectStripe}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {stripeAccountStatus === 'verified' ? 'Go to Stripe' : 'Connect with Stripe'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <BackButton href="/instructor" />
            <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">Earnings</h1>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeframe === 'week'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeframe === 'month'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Current Period Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-medium text-gray-700">
                  {timeframe === 'week' ? 'Earned this week' : `Earned in ${getMonthAbbreviation()}`}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-gray-900">
                  £{currentEarnings.toFixed(0)}
                </p>
                <div className="relative">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeDasharray="100, 100"
                      strokeDashoffset={100 - progressPercentage}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={`https://bvlilxbhipbworirvzcl.supabase.co/storage/v1/object/public/Icons/${getMoneyStackImage()}`}
                      alt="Money stack" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* All Time Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">All Time Earnings</h3>
              <p className="text-lg font-bold text-gray-900">
                £{earnings.totalEarnings.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Booked Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Booked Earnings</h3>
              <p className="text-lg text-gray-600">
                £{earnings.pendingEarnings.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Pending Payout */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Pending Payout</h3>
              <p className="text-lg text-yellow-600">
                £{((earnings.upcomingPayouts || []).reduce((sum, payout) => sum + payout.amount_pence, 0) / 100).toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Payout History</h2>
          {earnings.payoutHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400">💳</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No payout history yet</h3>
              <p className="text-gray-600">
                Completed lessons will appear here after payout processing
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date of payment</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.payoutHistory.map((payout) => (
                    <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatDate(payout.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(payout.amount_pence)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {formatPaymentStatus(payout.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { 
  auth, 
  subscribeToOrders, 
  updateOrderStatus, 
  updateOrderPaymentStatus,
  updateLivePrices, 
  subscribeToLivePrices,
  updateBulkDiscounts,
  subscribeToReviews,
  deleteFirebaseReview
} from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogOut,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Truck,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  DollarSign,
  ShoppingCart,
  Calendar,
  X,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});

function AdminPanel() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Authentication states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    setAuthError(null);
    setResetSent(false);
    if (!email.trim()) {
      setAuthError("Please enter your corporate email address first to send the reset link.");
      return;
    }
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Failed to send reset email.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Live Rates controller states
  const [mandiRate, setMandiRate] = useState(210);
  const [priceTrend, setPriceTrend] = useState<"up" | "down" | "flat">("flat");
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [priceSuccess, setPriceSuccess] = useState(false);

  // Bulk discounts states
  const [tier1Dis, setTier1Dis] = useState(10);
  const [tier2Dis, setTier2Dis] = useState(15);
  const [tier3Dis, setTier3Dis] = useState(25);
  const [tier4Dis, setTier4Dis] = useState(35);
  const [tier5Dis, setTier5Dis] = useState(45);
  const [updatingDiscounts, setUpdatingDiscounts] = useState(false);
  const [discountSuccess, setDiscountSuccess] = useState(false);

  // Live Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Live Orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"All" | "New" | "Preparing" | "Delivered" | "Cancelled">("All");
  const [typeFilter, setTypeFilter] = useState<"All" | "delivery" | "pickup">("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to live rates to populate initial state in inputs
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToLivePrices((config) => {
      if (config) {
        setMandiRate(config.mandiRate);
        setPriceTrend(config.trend);
        if (config.tier1Discount !== undefined) setTier1Dis(config.tier1Discount);
        if (config.tier2Discount !== undefined) setTier2Dis(config.tier2Discount);
        if (config.tier3Discount !== undefined) setTier3Dis(config.tier3Discount);
        if (config.tier4Discount !== undefined) setTier4Dis(config.tier4Discount);
        if (config.tier5Discount !== undefined) setTier5Dis(config.tier5Discount);
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to orders in realtime once authorized
  useEffect(() => {
    if (!user) return;
    setOrdersLoading(true);
    const unsubscribe = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
      setOrdersLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to reviews in realtime once authorized
  useEffect(() => {
    if (!user) return;
    setReviewsLoading(true);
    const unsubscribe = subscribeToReviews((liveReviews) => {
      setReviews(liveReviews);
      setReviewsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    // Enforce email domain requirement
    if (!email.toLowerCase().endsWith("@freshlyyours.com") && !email.toLowerCase().includes("@freshlyyours")) {
      setAuthError("Access Denied: Only @freshlyyours.com corporate emails are permitted.");
      return;
    }

    setAuthLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        setAuthSuccess("Account created successfully! Welcome to Freshly Yours Admin.");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setAuthSuccess("Logged in successfully.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setAuthError("Email address is already registered.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setAuthError("Invalid credentials. Please check your email and password.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password must be at least 6 characters.");
      } else {
        setAuthError(err.message || "An authentication error occurred.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPrices(true);
    setPriceSuccess(false);
    const success = await updateLivePrices(mandiRate, priceTrend);
    setUpdatingPrices(false);
    if (success) {
      setPriceSuccess(true);
      setTimeout(() => setPriceSuccess(false), 3000);
    } else {
      alert("Failed to update daily rates. Please check database permissions.");
    }
  };

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    const success = await updateOrderStatus(orderId, nextStatus);
    if (!success) {
      alert("Failed to update order status.");
    }
  };

  const handlePaymentStatusChange = async (orderId: string, nextPaymentStatus: string) => {
    const success = await updateOrderPaymentStatus(orderId, nextPaymentStatus);
    if (!success) {
      alert("Failed to update order payment status.");
    }
  };

  const handleUpdateDiscounts = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingDiscounts(true);
    setDiscountSuccess(false);
    const success = await updateBulkDiscounts({
      tier1Discount: tier1Dis,
      tier2Discount: tier2Dis,
      tier3Discount: tier3Dis,
      tier4Discount: tier4Dis,
      tier5Discount: tier5Dis,
    });
    setUpdatingDiscounts(false);
    if (success) {
      setDiscountSuccess(true);
      setTimeout(() => setDiscountSuccess(false), 3000);
    } else {
      alert("Failed to update bulk discounts.");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    const success = await deleteFirebaseReview(reviewId);
    if (!success) {
      alert("Failed to delete review.");
    }
  };

  // Calculations for Admin Stats Panel
  const stats = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== "Cancelled" && o.status !== "Delivered");
    const totalSales = orders
      .filter(o => o.status === "Delivered")
      .reduce((acc, o) => acc + (o.grandTotal || 0), 0);
    
    return {
      totalRevenue: totalSales,
      totalOrders: orders.length,
      pendingPickups: activeOrders.filter(o => o.deliveryMethod === "pickup").length,
      activeDeliveries: activeOrders.filter(o => o.deliveryMethod === "delivery").length,
    };
  }, [orders]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        dateStr: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        rawDate: d,
        Sales: 0,
        Orders: 0
      };
    }).reverse();

    orders.forEach((o) => {
      if (o.status === "Delivered" && o.createdAt?.seconds) {
        const orderDate = new Date(o.createdAt.seconds * 1000);
        const match = days.find((day) => 
          day.rawDate.getDate() === orderDate.getDate() &&
          day.rawDate.getMonth() === orderDate.getMonth() &&
          day.rawDate.getFullYear() === orderDate.getFullYear()
        );
        if (match) {
          match.Sales += o.grandTotal || 0;
          match.Orders += 1;
        }
      }
    });

    return days;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === "All" ? true : o.status === statusFilter;
      const matchType = typeFilter === "All" ? true : o.deliveryMethod === typeFilter;
      
      const searchStr = `${o.customerName} ${o.customerPhone} ${o.id || ""}`.toLowerCase();
      const matchSearch = searchTerm.trim() === "" ? true : searchStr.includes(searchTerm.toLowerCase());

      return matchStatus && matchType && matchSearch;
    });
  }, [orders, statusFilter, typeFilter, searchTerm]);

  // Loading view
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <span className="text-sm font-semibold tracking-wider text-slate-500">Authorizing Portal...</span>
        </div>
      </div>
    );
  }

  const isAdmin = user && user.email && (user.email.toLowerCase().endsWith("@freshlyyours.com") || user.email.toLowerCase().includes("@freshlyyours"));

  // ACCESS DENIED SCREEN FOR GUESTS / CLIENTS ON ADMIN PATH
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-5">
          <div className="size-12 rounded-2xl bg-red-50 border border-red-150 flex items-center justify-center text-red-500 font-bold text-xl shadow-sm mx-auto">
            🚫
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your account ({user.email}) does not have administrative privileges. Only @freshlyyours.com corporate accounts are permitted.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSignOut}
              className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-750 text-white text-xs font-bold transition cursor-pointer"
            >
              Sign Out
            </button>
            <a
              href="/"
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center flex items-center justify-center"
            >
              Go to Shop
            </a>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN / SIGNUP SCREEN
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl relative overflow-hidden animate-fadeIn">
          {/* Card Accent */}
          <div className="absolute -top-12 -left-12 size-40 bg-primary/5 blur-3xl rounded-full" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-md mb-3">
              🏠
            </div>
            <h1 className="font-display text-2xl font-black tracking-wider text-slate-900">
              FRESHLY YOURS
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-widest mt-1">
              ADMIN CONTROL CENTER
            </p>
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-6">
            {isSignUp ? "Register Admin Account" : "Sign In to Portal"}
          </h2>

          {authError && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-150 p-4 text-xs text-red-650 font-semibold flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-700 font-semibold flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-700 font-semibold flex items-start gap-2">
              <CheckCircle className="size-4 shrink-0 mt-0.5" />
              <span>Password reset link sent to your email!</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@freshlyyours.com"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-950 focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition font-sans"
                />
                <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-1">
                Must be a valid corporate @freshlyyours.com email address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm text-slate-950 focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition font-sans"
                />
                <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-650"
                >
                  {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              {!isSignUp && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-semibold text-primary hover:underline hover:text-red-750 bg-transparent cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-white text-sm font-bold shadow-md hover:brightness-105 transition duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-2"
            >
              {authLoading ? "Verifying..." : isSignUp ? "Create Account" : "Access Console"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className="text-xs font-semibold text-primary hover:underline hover:text-red-755 bg-transparent cursor-pointer"
            >
              {isSignUp ? "Already have an account? Log In" : "Need to register? Sign Up here"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED-IN ADMIN CONSOLE
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      
      {/* Admin Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold">
              👑
            </div>
            <div>
              <h1 className="font-display text-lg font-black tracking-wide text-slate-900 leading-none">
                Freshly Yours Admin
              </h1>
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest mt-1 block">
                Logged in as: {user.email}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition"
            >
              🛒 View Shop
            </a>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-red-650 hover:text-red-750 transition cursor-pointer"
            >
              <LogOut className="size-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8 animate-fadeIn">
        
        {/* STATS OVERVIEW SECTION */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingCart}
            title="Total Orders"
            value={stats.totalOrders}
            desc="All recorded orders in system"
            color="text-indigo-650"
            bg="bg-indigo-50"
          />
          <StatCard
            icon={DollarSign}
            title="Total Sales"
            value={`₹${stats.totalRevenue}`}
            desc="Sum of all completed orders"
            color="text-emerald-650"
            bg="bg-emerald-50"
          />
          <StatCard
            icon={Truck}
            title="Active Deliveries"
            value={stats.activeDeliveries}
            desc="Delivery orders preparing/new"
            color="text-amber-650"
            bg="bg-amber-50"
          />
          <StatCard
            icon={Clock}
            title="Pending Pickups"
            value={stats.pendingPickups}
            desc="Self-pickup orders not yet collected"
            color="text-teal-650"
            bg="bg-teal-50"
          />
        </section>

        {/* PRICING CONTROL SECTION & CONTROLS */}
        <section className="grid lg:grid-cols-3 gap-8">
          
          {/* DAILY RATES CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-slate-300">
              <Sparkles className="size-24" />
            </div>
            
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <CoinsIcon className="size-5 text-amber-500" /> Government Live Pricing Setup
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Adjusting this rate immediately updates all prices (Tender, Standard, Nattu Kodi breeds) on the home screen in realtime.
              </p>
            </div>

            <form onSubmit={handleUpdatePrices} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Base Government Rate (₹ / kg)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  max={400}
                  value={mandiRate}
                  onChange={(e) => setMandiRate(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Market Price Trend
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceTrend("up")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      priceTrend === "up"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <TrendingUp className="size-3.5" /> Up
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceTrend("down")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      priceTrend === "down"
                        ? "border-rose-600 bg-rose-50 text-rose-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <TrendingDown className="size-3.5" /> Down
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceTrend("flat")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                      priceTrend === "flat"
                        ? "border-slate-500 bg-slate-100 text-slate-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    Stable
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPrices}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-red-750 text-white text-xs font-bold tracking-wider transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-2"
              >
                {updatingPrices ? "Publishing Rates..." : "Publish Rates Live"}
              </button>

              {priceSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 text-center font-bold animate-fadeIn">
                  ✓ Daily mandi rates updated successfully!
                </div>
              )}
            </form>
          </div>

          {/* WEEKLY SALES ANALYTICS CARD */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    Weekly Sales & Order Analytics
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Visual representation of daily completed sales revenue and orders count.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse-dot" /> Live sync
                </div>
              </div>

              {/* Chart container */}
              <div className="h-48 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="dateStr" 
                      stroke="#94a3b8" 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#1e293b'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Sales" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#salesGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE ORDER MONITOR SECTION */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900">
                Live Order Monitor
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-blue-500" />
                  <strong>New</strong>: Immediate response required
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <strong>Preparing</strong>: In kitchen / cutting
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <strong>Delivered</strong>: Fulfill & close
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customer..."
                  className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary max-w-[180px]"
                />
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400" />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-primary"
              >
                <option value="All">All Types</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Self-Pickup</option>
              </select>

              <div className="flex rounded-lg bg-slate-50 p-1 border border-slate-200">
                {(["All", "New", "Preparing", "Delivered", "Cancelled"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition cursor-pointer ${
                      statusFilter === s
                        ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          {ordersLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-450 gap-2">
              <RefreshCw className="size-6 animate-spin text-primary" />
              <span className="text-xs">Querying database...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              No orders found matching the filter options.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Client Details</th>
                    <th className="py-3 px-4">Breeds & Custom Cuts</th>
                    <th className="py-3 px-4">Pricing splits</th>
                    <th className="py-3 px-4">Method & Paid status</th>
                    <th className="py-3 px-4">Order Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* ID / Timestamp */}
                      <td className="py-4 px-4 font-mono font-bold tracking-wider text-slate-700">
                        <span className="block text-primary text-[10px]">{o.id?.slice(0, 8).toUpperCase()}</span>
                        <span className="text-[9px] text-slate-450 font-normal">
                          {o.createdAt?.seconds 
                            ? new Date(o.createdAt.seconds * 1000).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, month: "short", day: "numeric" })
                            : "Just Now"}
                        </span>
                      </td>

                      {/* Client Details */}
                      <td className="py-4 px-4 font-sans space-y-1">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <User className="size-3.5 text-slate-400" /> {o.customerName}
                        </div>
                        <div className="text-slate-600 flex items-center gap-1 font-mono">
                          <Phone className="size-3 text-slate-400" /> {o.customerPhone}
                        </div>
                        {o.deliveryMethod === "delivery" ? (
                          <div className="text-[10px] text-slate-500 max-w-[160px] truncate" title={o.deliveryAddress}>
                            <MapPin className="size-3 text-slate-400 inline mr-0.5" /> {o.deliveryAddress}
                          </div>
                        ) : (
                          <div className="text-[10px] text-teal-600 font-medium">
                            🏪 Pickup scheduled @ {o.pickupTime || "Standard"}
                          </div>
                        )}
                      </td>

                      {/* Breeds & Cuts */}
                      <td className="py-4 px-4 text-slate-800">
                        <ul className="space-y-1">
                          {o.items?.map((item: any, idx: number) => {
                            const breedLabel = item.breed === "small" ? "China Broiler" : item.breed === "big" ? "Pedha Broiler" : "Nattu Kodi";
                            const styleLabel = item.style === "live" ? "Live" : item.style === "skin" ? "Skin-On" : "Skinless";
                            return (
                              <li key={idx} className="leading-snug">
                                <span className="font-semibold text-slate-900">{item.qty} {item.unit}</span> x {item.name} 
                                <span className="block text-[9.5px] text-slate-450 italic">
                                  ({breedLabel} • {styleLabel})
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </td>

                      {/* Prices Splits */}
                      <td className="py-4 px-4 font-mono">
                        <div className="text-slate-500">Sub: ₹{o.subtotal}</div>
                        {o.discount > 0 && <div className="text-emerald-600 font-medium">Disc: -₹{o.discount}</div>}
                        <div className="font-bold text-slate-900 mt-0.5">Total: ₹{o.grandTotal}</div>
                      </td>

                      {/* Payment splits */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold uppercase text-[9px] tracking-wider text-slate-450">
                            {o.paymentMethod} Payment
                          </span>
                          
                          {/* Payment status badge (interactive) */}
                          <select
                            value={o.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(o.id, e.target.value)}
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold w-fit border focus:outline-none cursor-pointer transition ${
                              o.paymentStatus === "Paid" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : o.paymentStatus === "Advance Paid" 
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            <option value="Pending" className="bg-white text-slate-800">Pending</option>
                            <option value="Advance Paid" className="bg-white text-slate-800">Advance Paid</option>
                            <option value="Paid" className="bg-white text-slate-800">Paid</option>
                          </select>
                        </div>
                        
                        <div className="text-[10px] font-mono text-slate-400 leading-tight pt-0.5">
                          <div>Adv Online: ₹{o.advancePaid}</div>
                          <div>Cash Due: ₹{o.balanceDue}</div>
                        </div>
                      </td>

                      {/* Order Status Pill */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === "New" 
                            ? "bg-blue-50 text-blue-700 border border-blue-200" 
                            : o.status === "Preparing" 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : o.status === "Delivered" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          <span className={`size-1.5 rounded-full ${
                            o.status === "New" ? "bg-blue-500" : o.status === "Preparing" ? "bg-amber-500" : o.status === "Delivered" ? "bg-emerald-500" : "bg-rose-500"
                          }`} />
                          {o.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {o.status === "New" && (
                            <button
                              onClick={() => handleStatusChange(o.id, "Preparing")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm"
                            >
                              Accept Order
                            </button>
                          )}
                          
                          {o.status === "Preparing" && (
                            <button
                              onClick={() => handleStatusChange(o.id, "Delivered")}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {o.status !== "Delivered" && o.status !== "Cancelled" && (
                            <button
                              onClick={() => handleStatusChange(o.id, "Cancelled")}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* DISCOUNTS & REVIEWS MANAGEMENT SECTION */}
        <section className="grid lg:grid-cols-2 gap-8">
          
          {/* BULK DISCOUNTS CONFIGURATION */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <DollarSign className="size-5 text-emerald-650" /> Wholesale Discounts & Tiers
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Modify the saving discounts for each of the 5 wholesale tiers. These values update the bulk orders calculator in real-time.
              </p>

              <form onSubmit={handleUpdateDiscounts} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Tier 1: 15-30kg (₹ / kg)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={tier1Dis}
                      onChange={(e) => setTier1Dis(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Tier 2: 30-50kg (₹ / kg)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={tier2Dis}
                      onChange={(e) => setTier2Dis(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Tier 3: 50-80kg (₹ / kg)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={tier3Dis}
                      onChange={(e) => setTier3Dis(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                      Tier 4: 80-120kg (₹ / kg)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={tier4Dis}
                      onChange={(e) => setTier4Dis(Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">
                    Tier 5: 120kg & Above (₹ / kg)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={tier5Dis}
                    onChange={(e) => setTier5Dis(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 font-mono focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingDiscounts}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wider transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-2 shadow-sm"
                >
                  {updatingDiscounts ? "Updating Tiers..." : "Publish Discounts Live"}
                </button>

                {discountSuccess && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-700 text-center font-bold animate-fadeIn">
                    ✓ Bulk order discounts updated successfully!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* CUSTOMER REVIEWS MODERATION */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                <Sparkles className="size-5 text-indigo-650" /> Customer Testimonials Moderation
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                View submitted user reviews and testimonials. Delete inappropriate content to keep the public feed high quality.
              </p>

              <div className="max-h-[350px] overflow-y-auto space-y-3.5 pr-2.5 border-t border-slate-100 pt-4">
                {reviewsLoading ? (
                  <div className="py-10 flex flex-col items-center justify-center text-slate-500 gap-1.5">
                    <RefreshCw className="size-5 animate-spin text-primary" />
                    <span className="text-xs">Fetching reviews...</span>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs">
                    No reviews in database.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start gap-4 hover:border-slate-200 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-xs">{rev.name}</span>
                          <span className="flex text-amber-500 text-[10px]">
                            {"★".repeat(rev.rating)}
                            {"☆".repeat(5 - rev.rating)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal italic">
                          "{rev.text}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-[10px] text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition font-bold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

// Stats Card helper component
function StatCard({
  icon: Icon,
  title,
  value,
  desc,
  color,
  bg,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  desc: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-start gap-4 hover:shadow-md transition">
      <div className={`size-12 rounded-2xl ${bg} ${color} grid place-items-center shrink-0`}>
        <Icon className="size-6" />
      </div>
      <div>
        <div className="text-xs text-slate-500 font-semibold">{title}</div>
        <div className="text-2xl font-black text-slate-900 mt-1 leading-tight">{value}</div>
        <div className="text-[10px] text-slate-400 mt-1 leading-snug">{desc}</div>
      </div>
    </div>
  );
}

// Icons overrides for inline helper (workaround for Lucide Coins vs Coin conflict)
function CoinsIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <circle cx="18" cy="18" r="4"/>
      <path d="M12 18a6 6 0 0 0-6-6"/>
    </svg>
  );
}

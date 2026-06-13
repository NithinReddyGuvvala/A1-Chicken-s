import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { 
  fetchFirebaseReviews, 
  saveFirebaseReview, 
  subscribeToLivePrices, 
  saveFirestoreOrder,
  subscribeToUserOrders,
  auth,
  OrderDetails,
  fetchUserAddresses,
  saveUserAddress,
  updateUserAddresses
} from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Star,
  ChevronDown,
  Search,
  Flame,
  ShieldCheck,
  Truck,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Award,
  Leaf,
  X,
  Menu,
  Gift,
  Globe,
  ArrowLeft,
  CreditCard,
  QrCode,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  Store,
  CheckCircle2,
} from "lucide-react";
import heroImg from "@/assets/hero-chicken.png";
import curryImg from "@/assets/curry-cut.jpg";
import bonelessImg from "@/assets/boneless.jpg";
import wingsImg from "@/assets/wings.jpg";
import legsImg from "@/assets/legs.jpg";
import wholeImg from "@/assets/whole.jpg";
import nattuImg from "@/assets/nattu-kodi.png";
import liveImg from "@/assets/live-chicken.png";
import liveNattuImg from "@/assets/live-nattu.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A1 Chicken's — Fresh Chicken, Daily Prices, WhatsApp Order" },
      {
        name: "description",
        content:
          "Live chicken stock, daily government rates, with/without cutting prices and instant WhatsApp ordering.",
      },
      { property: "og:title", content: "A1 Chicken's — Fresh Chicken Delivered Daily" },
      { property: "og:description", content: "Live stock, daily prices, WhatsApp ordering." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

// ---------- Mock data (swap with backend later) ----------
const SHOP = {
  name: "A1 Chicken's",
  tagline: "Fresh Chicken Delivered Daily",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  address: "A1 Chicken Center, Gampalagudem",
  hours: "6:30 AM – 9:30 PM, Daily",
};

const PRICES = {
  government: 210,
  withoutCutting: 220,
  withCutting: 240,
  trend: "up" as "up" | "down" | "flat",
  updatedAt: "Today, 8:00 AM",
};

type Stock = "available" | "limited" | "out";
type Product = {
  id: string;
  name: string;
  breed?: string;
  style?: "live" | "skin" | "skinless";
  cat: string;
  price: number;
  unit: string;
  img: string;
  stock: Stock;
  desc: string;
};

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Live Chicken",
    cat: "Live",
    price: 180,
    unit: "kg",
    img: wholeImg,
    stock: "available",
    desc: "Farm-fresh live bird, weighed in front of you.",
  },
  {
    id: "p2",
    name: "Skinless Whole",
    cat: "Whole",
    price: 220,
    unit: "kg",
    img: wholeImg,
    stock: "available",
    desc: "Clean dressed bird, ready to cook.",
  },
  {
    id: "p3",
    name: "Curry Cut",
    cat: "With Cutting",
    price: 240,
    unit: "kg",
    img: curryImg,
    stock: "available",
    desc: "Traditional medium pieces for curries.",
  },
  {
    id: "p4",
    name: "Small Cut",
    cat: "With Cutting",
    price: 250,
    unit: "kg",
    img: curryImg,
    stock: "available",
    desc: "Bite-sized pieces, perfect for biryani.",
  },
  {
    id: "p5",
    name: "Boneless Breast",
    cat: "Boneless",
    price: 360,
    unit: "kg",
    img: bonelessImg,
    stock: "available",
    desc: "Lean fillets, hand-trimmed.",
  },
  {
    id: "p6",
    name: "Thigh Fillet",
    cat: "Boneless",
    price: 340,
    unit: "kg",
    img: bonelessImg,
    stock: "limited",
    desc: "Juicy boneless thigh, ideal for grills.",
  },
  {
    id: "p7",
    name: "Chicken Wings",
    cat: "Special",
    price: 260,
    unit: "kg",
    img: wingsImg,
    stock: "limited",
    desc: "Whole wings, drum + flat.",
  },
  {
    id: "p8",
    name: "Chicken Legs",
    cat: "Special",
    price: 230,
    unit: "kg",
    img: legsImg,
    stock: "available",
    desc: "Plump drumsticks, skin-on.",
  },
  {
    id: "p9",
    name: "Liver",
    cat: "Special",
    price: 160,
    unit: "kg",
    img: curryImg,
    stock: "out",
    desc: "Fresh liver, cleaned and ready.",
  },
];

const CATEGORIES = ["All", "Tender Broiler", "Standard Broiler", "Nattu Kodi", "Special & Extras"];

const OFFERS = [
  { title: "Buy 2 kg, Save ₹20", sub: "On all curry-cut orders today", tag: "Daily" },
  { title: "Sunday Special", sub: "Free home delivery above ₹500", tag: "Weekly" },
  { title: "Festival Combo", sub: "1 kg curry-cut + 500g wings — ₹320", tag: "Combo" },
];

const REVIEWS = [
  { name: "Anita Sharma", rating: 5, text: "Always fresh, weighed honestly. My go-to for years." },
  { name: "Rahul Verma", rating: 5, text: "Cutting is neat and delivery is super quick." },
  { name: "Priya Nair", rating: 4, text: "Good prices, especially the Sunday offer." },
];

const FAQS = [
  {
    q: "Is the chicken fresh daily?",
    a: "Yes — we receive new stock every morning at 6 AM. Nothing is sold from the previous day.",
  },
  {
    q: "Do you provide cutting?",
    a: "Absolutely. Choose curry cut, small cut or boneless trimming at no extra charge above ₹240/kg.",
  },
  {
    q: "Do you deliver to home?",
    a: "Free delivery within 5 km on orders above ₹500. Standard delivery charge ₹30 otherwise.",
  },
  {
    q: "What are today's rates?",
    a: "See the live price card above — updated every morning by 8 AM as per government mandi rates.",
  },
  {
    q: "How often are prices updated?",
    a: "Once daily, with the wholesale mandi update. Festival days may see two updates.",
  },
];

// ---------- helpers ----------
const stockMeta: Record<Stock, { label: string; cls: string; dot: string }> = {
  available: {
    label: "Available",
    cls: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
  },
  limited: {
    label: "Limited",
    cls: "bg-warning/15 text-warning-foreground border-warning/40",
    dot: "bg-warning",
  },
  out: {
    label: "Out of stock",
    cls: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
};

function waLink(message: string) {
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}

const getProductTranslatedDesc = (id: string, desc: string, lang: "en" | "hi" | "te") => {
  if (lang === "en") return desc;
  if (lang === "hi") {
    if (id.includes("live")) return "खेत से ताजा जीवित पक्षी, आपके सामने तौला गया।";
    if (id.includes("skin-whole")) return "त्वचा (स्किन) के साथ पूरा साफ किया गया चिकन।";
    if (id.includes("skin-normal")) return "त्वचा के साथ पारंपरिक मध्यम टुकड़े, करी के लिए उत्तम।";
    if (id.includes("skin-small")) return "त्वचा के साथ छोटे टुकड़े, फ्राई या सूखी डिश के लिए आदर्श।";
    if (id.includes("skin-dum")) return "दम बिरयानी के लिए त्वचा के साथ गहरे कटे हुए बड़े ड्रमस्टिक्स और जांघ।";
    if (id.includes("skin-legs")) return "त्वचा के साथ साफ साबुत ड्रमस्टिक्स, रसीले और कोमल।";
    if (id.includes("skin-wings")) return "त्वचा के साथ साबुत चिकन विंग्स, स्नैक्स के लिए सही।";
    if (id.includes("skinless-whole")) return "बिना त्वचा के पूरा साफ किया गया चिकन।";
    if (id.includes("skinless-normal")) return "बिना त्वचा के पारंपरिक मध्यम टुकड़े, पकाने के लिए तैयार।";
    if (id.includes("skinless-small")) return "बिना त्वचा के छोटे टुकड़े, त्वरित पकाने या बिरयानी के लिए आदर्श।";
    if (id.includes("skinless-dum")) return "बिना त्वचा के दम बिरयानी के लिए बड़े ड्रमस्टिक्स और जांघ।";
    if (id.includes("skinless-legs")) return "बिना त्वचा के साफ साबुत ड्रमस्टिक्स, कोमल और स्वादिष्ट।";
    if (id.includes("skinless-wings")) return "बिना त्वचा के चिकन विंग्स।";
    if (id.includes("skinless-boneless")) return "चर्बी रहित कोमल बोनलेस ब्रेस्ट फिलेट।";
    if (id.includes("skinless-thigh")) return "रसीले बोनलेस थाई टुकड़े, टिक्का और ग्रिल के लिए आदर्श।";
  }
  if (lang === "te") {
    if (id.includes("live")) return "ఫామ్-తాజా లైవ్ కోడి, మీ ముందే బరువు వేయబడుతుంది.";
    if (id.includes("skin-whole")) return "స్కిన్ కలిగి ఉన్న పూర్తి చికెన్ డ్రెస్సింగ్.";
    if (id.includes("skin-normal")) return "స్కిన్ కలిగిన సాంప్రదాయ మధ్యస్థ ముక్కలు, కూరలకు సరిపోతాయి.";
    if (id.includes("skin-small")) return "స్కిన్ కలిగిన చిన్న ముక్కలు, ఫ్రైస్ లేదా డ్రై డిష్‌లకు అనుకూలం.";
    if (id.includes("skin-dum")) return "దమ్ బిర్యానీ కోసం స్కిన్ కలిగిన లెగ్ & థై ముక్కలు.";
    if (id.includes("skin-legs")) return "స్కిన్ కలిగిన శుభ్రమైన లెగ్ పీసెస్, జ్యుసిగా మరియు మెత్తగా ఉంటాయి.";
    if (id.includes("skin-wings")) return "స్కిన్ కలిగిన చికెన్ రెక్కలు, స్నాక్స్ కోసం అనుకూలం.";
    if (id.includes("skinless-whole")) return "స్కిన్ లేని శుభ్రమైన పూర్తి చికెన్ డ్రెస్సింగ్.";
    if (id.includes("skinless-normal")) return "స్కిన్ లేని సాంప్రదాయ కరి కట్ ముక్కలు, వండడానికి సిద్ధం.";
    if (id.includes("skinless-small")) return "స్కిన్ లేని చిన్న ముక్కలు, త్వరగా ఉడకడానికి లేదా బిర్యానీకి అనుకూలం.";
    if (id.includes("skinless-dum")) return "బిర్యానీ కోసం సిద్ధం చేసిన స్కిన్ లేని లెగ్ & థై ముక్కలు.";
    if (id.includes("skinless-legs")) return "స్కిన్ లేని శుభ్రమైన లెగ్ పీసెస్, మెత్తటివి.";
    if (id.includes("skinless-wings")) return "స్కిన్ లేని చికెన్ రెక్కలు.";
    if (id.includes("skinless-boneless")) return "కొవ్వు లేని బోన్‌లెస్ చికెన్ బ్రెస్ట్ ముక్కలు.";
    if (id.includes("skinless-thigh")) return "రుచికరమైన బోన్‌లెస్ థై ముక్కలు, టిక్కా & గ్రిల్స్‌కు అనుకూలం.";
  }
  return desc;
};

// ---------- Brand Custom Icons ----------
function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.988 3.3 1.472 5.36 1.473 5.384 0 9.768-4.386 9.77-9.775.002-2.61-1.014-5.064-2.865-6.916C16.99 2.083 14.537.82 11.99.817 6.604.817 2.221 5.2 2.218 10.582c-.001 2.005.524 3.96 1.52 5.679L2.73 19.822l3.917-1.028zm11.036-7.859c-.3-.15-1.774-.875-2.031-.969-.258-.094-.446-.14-.633.14-.187.281-.722.906-.886 1.094-.163.188-.327.21-.627.06-.3-.15-1.266-.467-2.41-1.487-.89-.793-1.49-1.77-1.665-2.07-.175-.3-.019-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.633-1.526-.867-2.09-.228-.549-.46-.474-.633-.483-.164-.008-.352-.01-.54-.01-.188 0-.492.07-.75.35-.258.281-.984.961-.984 2.344 0 1.382 1.006 2.716 1.148 2.903.14.188 1.98 3.024 4.797 4.237.67.289 1.194.462 1.602.592.673.214 1.285.184 1.769.112.54-.08 1.774-.726 2.024-1.4.25-.675.25-1.253.175-1.4-.075-.149-.27-.24-.57-.39z" />
    </svg>
  );
}

// ---------- Translations Dictionary ----------
const TRANSLATIONS = {
  en: {
    pricing: "Pricing",
    shop: "Shop",
    bulk: "Bulk Orders",
    offers: "Offers",
    contact: "Contact",
    cart: "Cart",
    call: "Call",
    callNow: "Call Now",
    whatsappOrder: "WhatsApp Order",
    viewPrices: "View Today's Prices",
    trustedBy: "Trusted by 5,000+ families",
    fresh: "100% Fresh",
    hygienic: "Hygienic",
    fastDelivery: "Fast Delivery",
    govtApproved: "Govt. Approved",
    liveTime: "Live Time",
    tenderBroiler: "China Broiler",
    standardBroiler: "Pedha Broiler",
    nattuKodi: "Nattu Kodi",
    governmentRate: "Government Rate",
    withoutCutting: "Without Cutting",
    withCutting: "With Cutting",
    updatedAt: "Last Updated at",
    livePricesTitle: "Today's Live Chicken Prices",
    liveMandiRates: "Live Government Rates",
    pricesTrendingUp: "Prices trending up",
    pricesDecreased: "Prices decreased!",
    pricesStable: "Prices stable in the market.",
    liveUpdatesGuaranteed: "Live updates guaranteed.",
    catalogEyebrow: "Our Catalog",
    catalogTitle: "Pick Your Breed & Cut",
    catalogSub: "First select a breed, then pick your custom cutting preference.",
    step1Title: "Step 1: Choose Chicken Breed",
    selectedBadge: "Selected",
    mostPopular: "Most Popular",
    bestValue: "Best Value",
    premiumTaste: "Premium Taste",
    liveBaseRate: "Live Base Rate",
    step2Title: "Step 2: Choose Cutting Option for",
    searchPlaceholder: "Search cutting option...",
    skinlessTab: "✨ Skinless",
    withSkinTab: "🥩 With Skin",
    taglineDescription: "Fresh • Daily • Honest",
    changeLanguage: "Change Language",
    todaysBroilerLabel: "Today's China Broiler",
    freeDeliveryBadgeTitle: "FREE",
    freeDeliveryBadgeSub: "Delivery > ₹500",
    loadingText: "Loading...",
    heroWhatsAppPrefill: "Hello! I'd like to place an order.",
    contactWhatsAppPrefill: "Hello!",
    liveChickenTab: "🐔 Live Chicken",
    selectQuantity: "Select Quantity",
    qtyLabel: "Quantity",
    totalLabel: "Total",
    addToCart: "Add to Cart",
    addBtn: "Add",
    noCutsFound: "No cutting options match your search.",
    dealsEyebrow: "Today's Deals",
    dealsTitle: "Daily Offers",
    dealsSub: "Hand-picked combos for our regulars.",
    dailyTag: "Daily",
    weeklyTag: "Weekly",
    comboTag: "Combo",
    buy2kgSave20Title: "Buy 2 kg, Save ₹20",
    buy2kgSave20Sub: "On all curry-cut orders today",
    sundaySpecialTitle: "Sunday Special",
    sundaySpecialSub: "Free home delivery above ₹500",
    festivalComboTitle: "Festival Combo",
    festivalComboSub: "1 kg curry-cut + 500g wings — ₹320",
    offerActive: "Offer Active",
    freeDeliveryActive: "Free Delivery Active",
    addMoreToQualify: "Add more to qualify",
    spendMoreForFree: "Spend ₹500 for Free Delivery",
    add2kgBtn: "Add 2 kg Curry Cut",
    addComboBtn: "Add Festival Combo",
    viewInCart: "View Cart",
    bulkEyebrow: "Wholesale & Catering",
    bulkTitle: "Bulk Orders for Functions & Restaurants",
    bulkSub: "Get unmatched discounts on bulk purchases with early-morning priority delivery",
    wholesalePricingTitle: "Wholesale Pricing Tiers",
    wholesalePricingDesc: "We supply fresh, hygienically cut chicken to top hotels, restaurants, party halls, and home functions. Check out our volume discounts below:",
    tier1Range: "15 kg – 30 kg",
    tier1Discount: "Save ₹10 / kg",
    tier1Desc: "Best for family gatherings & small functions",
    tier2Range: "30 kg – 50 kg",
    tier2Discount: "Save ₹15 / kg",
    tier2Desc: "Ideal for caterers & wedding celebrations",
    tier3Range: "50 kg – 80 kg",
    tier3Discount: "Save ₹25 / kg",
    tier3Desc: "Special pricing for wholesale supplies",
    tier4Range: "80 kg – 120 kg",
    tier4Discount: "Save ₹35 / kg",
    tier4Desc: "Ideal for hotels and large events",
    tier5Range: "120 kg & Above",
    tier5Discount: "Save ₹45 / kg",
    tier5Desc: "Maximum discount for daily restaurant partners",
    priorityDeliveryText: "Priority early morning delivery (Starts 6:30 AM)",
    customCutsText: "Custom cuts based on your recipes (Biryani, Tandoori, etc.)",
    halalText: "100% halal, FSSAI quality checked, temperature controlled",
    estimatorTitle: "Interactive Bulk Estimator",
    estimatorSub: "Calculate wholesale prices in real time based on today's government chicken rates.",
    estimSelectType: "1. Select Chicken Type",
    estimChooseCut: "2. Choose Cutting Preference",
    estimEnterQty: "3. Enter Quantity (kg)",
    retailPrice: "Retail Base Price",
    bulkDiscountApplied: "Bulk Discount Applied",
    noDiscountText: "No discount (Min. 15 kg required)",
    netWholesaleRate: "Net Wholesale Rate",
    estWholesaleTotal: "Estimated Wholesale Total:",
    estSavingsText: "Estimated Savings:",
    inquireBulkWaBtn: "Inquire Bulk Discount on WhatsApp",
    reviewsEyebrow: "Customer Love",
    reviewsTitle: "What our regulars say",
    faqEyebrow: "FAQ",
    faqTitle: "Frequently Asked",
    contactEyebrow: "Visit / Call",
    contactTitle: "Get in touch",
    addressLabel: "Address",
    callLabel: "Call",
    whatsappLabel: "WhatsApp",
    businessHoursLabel: "Business Hours",
    callNowBtn: "Call Now",
    directionsBtn: "Directions",
    yourCartTitle: "Your Cart",
    cartEmpty: "Cart is empty.",
    homeDeliveryLabel: "Home Delivery",
    selfPickupLabel: "Self-Pickup",
    subtotalLabel: "Subtotal",
    offersDiscountLabel: "Offers Discount",
    deliveryChargesLabel: "Delivery Charges",
    totalAmountLabel: "Total Amount",
    onlineAdvanceRequiredLabel: "Online Advance Required:",
    cashOnDeliveryLabel: "Cash on Delivery:",
    cashOnSiteLabel: "Cash On-Site to Pay:",
    placeOrderWaBtn: "Place Order on WhatsApp",
    estimatedCollectionTimeLabel: "Estimated Collection Time",
    estimatedCollectionInstruction: "Our butchers will start cutting immediately. Please collect your fresh order in 20-30 minutes (around {time}).",
    deliveryFeeInstruction: "A flat delivery fee of ₹5 is added to your order.",
    advancePaidOnlineLabel: "Advance online payment:",
    payRestCashOnsiteLabel: "Pay rest cash on-site",
    payRestCashOnDeliveryLabel: "Pay rest cash on delivery",
    appliedOffersLabel: "Applied Offers",
    curryCutOfferSuccess: "Curry Cut offer requirements met! (Saved ₹20 for every 2 kg)",
    comboOfferSuccess: "Capped combo price applied!",
    deliveryOfferSuccess: "Free home delivery applied!",
    heroTitle: "Fresh Chicken Delivered Daily",
    heroSubtitle: "Live mandi rates, transparent weighing, hygienic cutting and 30-minute delivery — straight from A1 Chicken's.",
    tenderBroilerCardTitle: "China Broiler (Tender)",
    tenderBroilerCardDesc: "Tender & soft meat, weight < 1.5kg",
    standardBroilerCardTitle: "Pedha Broiler (Standard)",
    standardBroilerCardDesc: "Standard full grown bird, weight > 2.5kg",
    nattuKodiCardTitle: "Nattu Kodi (Country)",
    nattuKodiCardDesc: "Traditional organic free-range Desi breed",
    liveUpdatedFeed: "Live updated feed",
    writeReviewTitle: "Write a Review",
    reviewNamePlaceholder: "Your Name",
    reviewTextPlaceholder: "Share your experience with us...",
    submitReviewBtn: "Submit Review",
    reviewRatingLabel: "Rating",
    reviewSuccessMsg: "Thank you! Your review has been added to our testimonials.",
    checkoutDetailsHeader: "Checkout Details",
    customerNameLabel: "Full Name",
    customerPhoneLabel: "WhatsApp Phone Number",
    deliveryAddressLabel: "Complete Delivery Address",
    paymentMethodHeader: "Select Payment Option",
    payOnlineOption: "Pay Full Amount Online",
    codOption: "Cash on Delivery (COD)",
    payAdvanceOption: "Pay Advance Online (₹10)",
    upiLabel: "UPI (Google Pay, PhonePe, Paytm)",
    cardLabel: "Credit / Debit Card",
    qrLabel: "Scan QR Code to Pay",
    placeOrderBtn: "Place Order",
    orderSuccessTitle: "Order Placed Successfully!",
    orderSuccessMessage: "Your order has been recorded. Our team will prepare it shortly.",
    orderIdLabel: "Order ID",
    backToShop: "Back to Shop",
    paymentSimHeader: "Simulated Secure Payment Gateway",
    cardNumLabel: "16-Digit Card Number",
    cardExpiryLabel: "Expiry Date (MM/YY)",
    cardCvvLabel: "CVV (3 Digits)",
    upiIdLabel: "UPI ID (e.g. name@okhdfc)",
    qrScanInstruction: "Scan this QR code using any UPI App (GPay, PhonePe, Paytm) to complete payment.",
    simulatedPayBtn: "Complete Secure Payment",
    pickupTimeLabel: "Estimated Pickup Time",
    deliveryDetailsHeader: "Delivery Information",
    pickupDetailsHeader: "Self-Pickup Details",
    cardPlaceholder: "4111 2222 3333 4444",
    cardExpiryPlaceholder: "12/28",
    cardCvvPlaceholder: "123",
    reviewsNav: "Reviews",
    loginNav: "Login",
    signupNav: "Sign Up",
    signOutNav: "Sign Out",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    nameLabel: "Your Name",
    googleSignIn: "Continue with Google",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signInTitle: "Sign In",
    signUpTitle: "Create Account",
    pwdLengthError: "Password must be at least 6 characters.",
    authErrorDefault: "Authentication failed. Please check your credentials.",
    trackOrdersNav: "Track Orders",
    orderHistoryTitle: "Order History & Live Tracking",
    noOrdersText: "You have not placed any orders yet.",
    orderPlacedStep: "Order Placed",
    preparingStep: "Preparing",
    outForDeliveryStep: "Out for Delivery",
    deliveredStep: "Delivered",
    orderPlacedStepDesc: "We have received your order and will confirm it shortly.",
    preparingStepDesc: "Our professional butchers are cutting and packing your order hygienically.",
    outForDeliveryStepDesc: "Scooter driver is heading to your address with your fresh chicken.",
    deliveredStepDesc: "Order has been delivered. Enjoy your fresh purchase!",
    liveTrackingTitle: "Live Delivery Scooter Tracker",
    cancelledStatus: "Cancelled",
    pickupCollectStep: "Ready for Pickup",
    pickupCollectStepDesc: "Your fresh chicken is ready! Please collect it from our shop.",
    orderStatusLabel: "Status",
    liveTrackingLabel: "Live Tracker",
    adminPanel: "Admin Panel",
    adminBannerMessage: "You are logged in as Admin ({email}).",
    openAdminDashboard: "Open Admin Dashboard",
    forgotPassword: "Forgot Password?",
    resetEmailSent: "Password reset link sent to your email!",
  },
  hi: {
    pricing: "कीमतें",
    shop: "दुकान",
    bulk: "थोक ऑर्डर",
    offers: "ऑफ़र्स",
    contact: "संपर्क",
    cart: "कार्ट",
    call: "कॉल",
    callNow: "अभी कॉल करें",
    whatsappOrder: "व्हाट्सएप ऑर्डर",
    viewPrices: "आज की दरें देखें",
    trustedBy: "5,000+ परिवारों का भरोसा",
    fresh: "100% ताजा",
    hygienic: "हाइजीनिक",
    fastDelivery: "तेज़ डिलीवरी",
    govtApproved: "सरकारी स्वीकृत",
    liveTime: "लाइव समय",
    tenderBroiler: "चाइना ब्रॉयलर",
    standardBroiler: "पेड़ा ब्रॉयलर",
    nattuKodi: "नाटू कोड़ी",
    governmentRate: "सरकारी दर",
    withoutCutting: "बिना कटिंग के",
    withCutting: "कटिंग के साथ",
    updatedAt: "अंतिम अपडेट",
    livePricesTitle: "आज के लाइव चिकन की कीमतें",
    liveMandiRates: "लाइव सरकारी दरें",
    pricesTrendingUp: "कीमतें बढ़ रही हैं",
    pricesDecreased: "कीमतें कम हो गईं!",
    pricesStable: "बाजार में कीमतें स्थिर हैं।",
    liveUpdatesGuaranteed: "लाइव अपडेट की गारंटी।",
    catalogEyebrow: "हमारा कैटलॉग",
    catalogTitle: "अपनी नस्ल और कट चुनें",
    catalogSub: "पहले चिकन की नस्ल चुनें, फिर अपनी पसंद की कटिंग चुनें।",
    step1Title: "चरण 1: चिकन की नस्ल चुनें",
    selectedBadge: "चयनित",
    mostPopular: "सबसे लोकप्रिय",
    bestValue: "सर्वश्रेष्ठ मूल्य",
    premiumTaste: "प्रीमियम स्वाद",
    liveBaseRate: "लाइव बेस रेट",
    step2Title: "चरण 2: कटिंग का विकल्प चुनें -",
    searchPlaceholder: "कटिंग विकल्प खोजें...",
    skinlessTab: "✨ बिना स्किन के",
    withSkinTab: "🥩 स्किन के साथ",
    liveChickenTab: "🐔 जीवित चिकन",
    taglineDescription: "ताजा • दैनिक • ईमानदार",
    changeLanguage: "भाषा बदलें",
    todaysBroilerLabel: "आज का चाइना ब्रॉयलर",
    freeDeliveryBadgeTitle: "मुफ्त",
    freeDeliveryBadgeSub: "₹500 से अधिक डिलीवरी",
    loadingText: "लोड हो रहा है...",
    heroWhatsAppPrefill: "नमस्ते! मैं ऑर्डर देना चाहता हूँ।",
    contactWhatsAppPrefill: "नमस्ते!",
    selectQuantity: "मात्रा चुनें",
    qtyLabel: "मात्रा",
    totalLabel: "कुल",
    addToCart: "कार्ट में जोड़ें",
    addBtn: "जोड़ें",
    noCutsFound: "कोई भी कटिंग विकल्प आपकी खोज से मेल नहीं खाता।",
    dealsEyebrow: "आज के सौदे",
    dealsTitle: "दैनिक ऑफ़र",
    dealsSub: "हमारे नियमित ग्राहकों के लिए चुनिंदा कॉम्बो।",
    dailyTag: "दैनिक",
    weeklyTag: "साप्ताहिक",
    comboTag: "कॉम्बो",
    buy2kgSave20Title: "2 किलो खरीदें, ₹20 बचाएं",
    buy2kgSave20Sub: "आज सभी करी-कट ऑर्डर पर लागू",
    sundaySpecialTitle: "रविवार स्पेशल",
    sundaySpecialSub: "₹500 से ऊपर मुफ्त होम डिलीवरी",
    festivalComboTitle: "फेस्टिवल कॉम्बो",
    festivalComboSub: "1 किलो करी-कट + 500 ग्राम विंग्स — ₹320",
    offerActive: "ऑफ़र सक्रिय",
    freeDeliveryActive: "मुफ्त डिलीवरी सक्रिय",
    addMoreToQualify: "योग्य होने के लिए और जोड़ें",
    spendMoreForFree: "मुफ़्त डिलीवरी के लिए ₹500 खर्च करें",
    add2kgBtn: "2 किलो करी कट जोड़ें",
    addComboBtn: "फेस्टिवल कॉम्बो जोड़ें",
    viewInCart: "कार्ट देखें",
    bulkEyebrow: "थोक और खान-पान",
    bulkTitle: "शादियों और रेस्टोरेंट के लिए थोक ऑर्डर",
    bulkSub: "सुबह जल्दी प्राथमिकता डिलीवरी के साथ थोक खरीद पर बेजोड़ छूट प्राप्त करें",
    wholesalePricingTitle: "थोक मूल्य निर्धारण श्रेणियां",
    wholesalePricingDesc: "हम शीर्ष होटलों, रेस्तरां, पार्टी हॉलों और घरेलू कार्यक्रमों में ताज़ा, स्वच्छता से कटे हुए चिकन की आपूर्ति करते हैं। नीचे हमारी थोक छूट देखें:",
    tier1Range: "15 किलो – 30 किलो",
    tier1Discount: "बचत ₹10 / किलो",
    tier1Desc: "पारिवारिक समारोहों और छोटे कार्यक्रमों के लिए सर्वोत्तम",
    tier2Range: "30 किलो – 50 किलो",
    tier2Discount: "बचत ₹15 / किलो",
    tier2Desc: "केटरर्स और शादी के समारोहों के लिए आदर्श",
    tier3Range: "50 किलो – 80 किलो",
    tier3Discount: "बचत ₹25 / किलो",
    tier3Desc: "थोक आपूर्ति के लिए विशेष दर",
    tier4Range: "80 किलो – 120 किलो",
    tier4Discount: "बचत ₹35 / किलो",
    tier4Desc: "होटलों और बड़े कार्यक्रमों के लिए आदर्श",
    tier5Range: "120 किलो और अधिक",
    tier5Discount: "बचत ₹45 / किलो",
    tier5Desc: "दैनिक रेस्तरां भागीदारों के लिए अधिकतम छूट",
    priorityDeliveryText: "प्राथमिकता सुबह की डिलीवरी (सुबह 6:30 बजे से शुरू)",
    customCutsText: "आपके व्यंजनों के आधार पर कस्टम कट (बिरयानी, तंदूरी, आदि)",
    halalText: "100% हलाल, FSSAI गुणवत्ता जांच, तापमान नियंत्रित",
    estimatorTitle: "इंटरएक्टिव थोक कैलकुलेटर",
    estimatorSub: "आज की सरकारी चिकन दरों के आधार पर वास्तविक समय में थोक कीमतों की गणना करें।",
    estimSelectType: "1. चिकन का प्रकार चुनें",
    estimChooseCut: "2. कटिंग प्राथमिकता चुनें",
    estimEnterQty: "3. मात्रा दर्ज करें (किलोग्राम)",
    retailPrice: "खुदरा बेस मूल्य",
    bulkDiscountApplied: "लागू थोक छूट",
    noDiscountText: "कोई छूट नहीं (न्यूनतम 15 किलो आवश्यक)",
    netWholesaleRate: "नेट थोक दर",
    estWholesaleTotal: "अनुमानित थोक कुल मूल्य:",
    estSavingsText: "अनुमानित बचत:",
    inquireBulkWaBtn: "व्हाट्सएप पर थोक छूट की पूछताछ करें",
    reviewsEyebrow: "ग्राहकों का प्यार",
    reviewsTitle: "हमारे नियमित ग्राहक क्या कहते हैं",
    faqEyebrow: "अक्सर पूछे जाने वाले सवाल",
    faqTitle: "सामान्य प्रश्न",
    contactEyebrow: "विजिट / कॉल",
    contactTitle: "संपर्क में रहें",
    addressLabel: "पता",
    callLabel: "कॉल करें",
    whatsappLabel: "व्हाट्सएप",
    businessHoursLabel: "कारोबारी घंटे",
    callNowBtn: "अभी कॉल करें",
    directionsBtn: "दिशा-निर्देश",
    yourCartTitle: "आपकी कार्ट",
    cartEmpty: "कार्ट खाली है।",
    homeDeliveryLabel: "होम डिलीवरी",
    selfPickupLabel: "स्वयं दुकान से लें",
    subtotalLabel: "कुल उत्पाद मूल्य (Subtotal)",
    offersDiscountLabel: "ऑफ़र छूट",
    deliveryChargesLabel: "डिलीवरी शुल्क",
    totalAmountLabel: "कुल राशि",
    onlineAdvanceRequiredLabel: "ऑनलाइन अग्रिम भुगतान:",
    cashOnDeliveryLabel: "डिलीवरी पर नकद:",
    cashOnSiteLabel: "दुकान पर नकद भुगतान:",
    placeOrderWaBtn: "व्हाट्सएप पर ऑर्डर भेजें",
    estimatedCollectionTimeLabel: "संग्रह का अनुमानित समय",
    estimatedCollectionInstruction: "हमारे कसाई तुरंत काटना शुरू कर देंगे। कृपया 20-30 मिनट में (लगभग {time} बजे) अपना ताजा ऑर्डर लें।",
    deliveryFeeInstruction: "आपके ऑर्डर में ₹5 का फ्लैट डिलीवरी शुल्क जोड़ा गया है।",
    advancePaidOnlineLabel: "ऑनलाइन अग्रिम भुगतान:",
    payRestCashOnsiteLabel: "शेष राशि दुकान पर नकद दें",
    payRestCashOnDeliveryLabel: "शेष राशि डिलीवरी पर नकद दें",
    appliedOffersLabel: "लागू किए गए ऑफ़र",
    curryCutOfferSuccess: "करी कट ऑफ़र आवश्यकता पूरी हुई! (हर 2 किलो पर ₹20 की बचत)",
    comboOfferSuccess: "कॉम्बो विशेष रियायती मूल्य लागू!",
    deliveryOfferSuccess: "निःशुल्क होम डिलीवरी लागू!",
    heroTitle: "ताजा चिकन हर दिन डेलिवर",
    heroSubtitle: "लाइव मंडी दरें, पारदर्शी वजन, हाइजीनिक कटिंग और 30 मिनट में डिलीवरी — सीधे A1 Chicken's से।",
    tenderBroilerCardTitle: "चाइना ब्रॉयलर (छोटा)",
    tenderBroilerCardDesc: "नरम और कोमल मांस, वजन < 1.5 किलोग्राम",
    standardBroilerCardTitle: "पेड़ा ब्रॉयलर (बड़ा)",
    standardBroilerCardDesc: "मानक पूर्ण विकसित चिकन, वजन > 2.5 किलोग्राम",
    nattuKodiCardTitle: "नाटू कोड़ी (देशी)",
    nattuKodiCardDesc: "पारंपरिक जैविक फ्री-रेंज देशी नस्ल",
    liveUpdatedFeed: "लाइव अपडेट फीड",
    writeReviewTitle: "समीक्षा लिखें",
    reviewNamePlaceholder: "आपका नाम",
    reviewTextPlaceholder: "हमारे साथ अपना अनुभव साझा करें...",
    submitReviewBtn: "समीक्षा सबमिट करें",
    reviewRatingLabel: "रेटिंग",
    reviewSuccessMsg: "धन्यवाद! आपकी समीक्षा को हमारे प्रशंसापत्र में जोड़ दिया गया है।",
    checkoutDetailsHeader: "चेकआउट विवरण",
    customerNameLabel: "पूरा नाम",
    customerPhoneLabel: "व्हाट्सएप फोन नंबर",
    deliveryAddressLabel: "डिलीवरी का पूरा पता",
    paymentMethodHeader: "भुगतान विकल्प चुनें",
    payOnlineOption: "पूरा भुगतान ऑनलाइन करें",
    codOption: "डिलीवरी पर नकद (COD)",
    payAdvanceOption: "ऑनलाइन अग्रिम भुगतान (₹10)",
    upiLabel: "UPI (GPay, PhonePe, Paytm)",
    cardLabel: "क्रेडिट / डेबिट कार्ड",
    qrLabel: "भुगतान के लिए क्यूआर कोड स्कैन करें",
    placeOrderBtn: "ऑर्डर सबमिट करें",
    orderSuccessTitle: "ऑर्डर सफलतापूर्वक प्राप्त हुआ!",
    orderSuccessMessage: "आपका ऑर्डर दर्ज कर लिया गया है। हमारी टीम इसे जल्द ही तैयार करेगी।",
    orderIdLabel: "ऑर्डर आईडी",
    backToShop: "दुकान पर वापस जाएं",
    paymentSimHeader: "सिम्युलेटेड सुरक्षित भुगतान गेटवे",
    cardNumLabel: "16-अंकीय कार्ड नंबर",
    cardExpiryLabel: "समाप्ति तिथि (MM/YY)",
    cardCvvLabel: "CVV (3 अंक)",
    upiIdLabel: "UPI आईडी (जैसे name@okhdfc)",
    qrScanInstruction: "भुगतान पूरा करने के लिए किसी भी UPI ऐप (GPay, PhonePe, Paytm) का उपयोग करके नीचे दिए गए क्यूआर कोड को स्कैन करें।",
    simulatedPayBtn: "सुरक्षित भुगतान पूरा करें",
    pickupTimeLabel: "संग्रह का अनुमानित समय",
    deliveryDetailsHeader: "डिलीवरी की जानकारी",
    pickupDetailsHeader: "स्वयं लेने का विवरण",
    cardPlaceholder: "4111 2222 3333 4444",
    cardExpiryPlaceholder: "12/28",
    cardCvvPlaceholder: "123",
    reviewsNav: "समीक्षाएं",
    loginNav: "लॉगिन",
    signupNav: "साइन अप",
    signOutNav: "लॉग आउट",
    emailLabel: "ईमेल पता",
    passwordLabel: "पासवर्ड",
    nameLabel: "आपका नाम",
    googleSignIn: "गूगल के साथ जारी रखें",
    dontHaveAccount: "खाता नहीं है?",
    alreadyHaveAccount: "पहले से खाता है?",
    signInTitle: "लॉगिन करें",
    signUpTitle: "खाता बनाएं",
    pwdLengthError: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
    authErrorDefault: "प्रमाणीकरण विफल रहा। कृपया अपने क्रेडेंशियल्स की जांच करें।",
    trackOrdersNav: "ऑर्डर ट्रैक करें",
    orderHistoryTitle: "ऑर्डर इतिहास और लाइव ट्रैकिंग",
    noOrdersText: "आपने अभी तक कोई ऑर्डर नहीं दिया है।",
    orderPlacedStep: "ऑर्डर दिया गया",
    preparingStep: "तैयार किया जा रहा है",
    outForDeliveryStep: "डिलीवरी के लिए बाहर",
    deliveredStep: "डिलिवर हो गया",
    orderPlacedStepDesc: "हमें आपका ऑर्डर मिल गया है और जल्द ही इसकी पुष्टि करेंगे।",
    preparingStepDesc: "हमारे पेशेवर कसाई आपके ऑर्डर को स्वच्छता से काट रहे हैं और पैक कर रहे हैं।",
    outForDeliveryStepDesc: "स्कूटर ड्राइवर आपके ताज़ा चिकन के साथ आपके पते पर आ रहा है।",
    deliveredStepDesc: "ऑर्डर डिलीवर कर दिया गया है। अपनी ताज़ा खरीद का आनंद लें!",
    liveTrackingTitle: "लाइव डिलीवरी स्कूटर ट्रैकर",
    cancelledStatus: "रद्द किया गया",
    pickupCollectStep: "पिकअप के लिए तैयार",
    pickupCollectStepDesc: "आपका ताज़ा चिकन तैयार है! कृपया इसे हमारी दुकान से ले लें।",
    orderStatusLabel: "स्थिति",
    liveTrackingLabel: "लाइव ट्रैकर",
    adminPanel: "एडमिन पैनल",
    adminBannerMessage: "आप एडमिन ({email}) के रूप में लॉग इन हैं।",
    openAdminDashboard: "एडमिन डैशबोर्ड खोलें",
    forgotPassword: "पासवर्ड भूल गए?",
    resetEmailSent: "पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया है!",
  },
  te: {
    pricing: "ధరలు",
    shop: "షాప్",
    bulk: "బల్క్ ఆర్డర్లు",
    offers: "ఆఫర్లు",
    contact: "సంప్రదించండి",
    cart: "కార్ట్",
    call: "కాల్",
    callNow: "ఇప్పుడే కాల్ చేయండి",
    whatsappOrder: "వాట్సాప్ ఆర్డర్",
    viewPrices: "ఈరోజు ధరలు చూడండి",
    trustedBy: "5,000+ కుటుంబాల నమ్మకం",
    fresh: "100% తాజాది",
    hygienic: "పరిశుభ్రమైనది",
    fastDelivery: "వేగవంతమైన డెలివరీ",
    govtApproved: "ప్రభుత్వ ఆమోదిత",
    liveTime: "లైవ్ సమయం",
    tenderBroiler: "చిన్న బ్రాయిలర్",
    standardBroiler: "పెద్ద బ్రాయిలర్",
    nattuKodi: "నాటు కోడి",
    governmentRate: "ప్రభుత్వ ధర",
    withoutCutting: "కటింగ్ లేకుండా",
    withCutting: "కటింగ్‌తో",
    updatedAt: "చివరి అప్‌డేట్",
    livePricesTitle: "ఈరోజు లైవ్ చికెన్ ధరలు",
    liveMandiRates: "లైవ్ ప్రభుత్వ ధరలు",
    pricesTrendingUp: "ధరలు పెరుగుతున్నాయి",
    pricesDecreased: "ధరలు తగ్గాయి!",
    pricesStable: "మార్కెట్‌లో ధరలు స్థిరంగా ఉన్నాయి.",
    liveUpdatesGuaranteed: "లైవ్ అప్‌డేట్స్ లభిస్తాయి.",
    catalogEyebrow: "మా క్యాటలాగ్",
    catalogTitle: "చికెన్ రకం & కటింగ్ ఎంచుకోండి",
    catalogSub: "మొదట చికెన్ రకాన్ని ఎంచుకోండి, ఆపై మీ కటింగ్ విధానాన్ని ఎంచుకోండి.",
    step1Title: "దశ 1: చికెన్ రకాన్ని ఎంచుకోండి",
    selectedBadge: "ఎంపిక చేయబడింది",
    mostPopular: "అత్యంత ప్రజాదరణ పొందినది",
    bestValue: "ఉత్తమ విలువ",
    premiumTaste: "ప్రీమియం రుచి",
    liveBaseRate: "లైవ్ బేస్ ధర",
    step2Title: "దశ 2: కటింగ్ విధానాన్ని ఎంచుకోండి -",
    searchPlaceholder: "కటింగ్ విధానాలను వెతకండి...",
    skinlessTab: "✨ స్కిన్ లేకుండా",
    withSkinTab: "🥩 స్కిన్‌తో",
    liveChickenTab: "🐔 లైవ్ చికెన్",
    taglineDescription: "తాజా • రోజువారీ • నిజాయితీ",
    changeLanguage: "భాష మార్చండి",
    todaysBroilerLabel: "ఈరోజు చిన్న బ్రాయిలర్",
    freeDeliveryBadgeTitle: "ఉచితం",
    freeDeliveryBadgeSub: "₹500 పైన డెలివరీ",
    loadingText: "లోడ్ అవుతోంది...",
    heroWhatsAppPrefill: "నమస్తే! నేను ఆర్డర్ చేయాలనుకుంటున్నాను.",
    contactWhatsAppPrefill: "నమస్తే!",
    selectQuantity: "పరిమాణాన్ని ఎంచుకోండి",
    qtyLabel: "పరిమాణం",
    totalLabel: "మొత్తం",
    addToCart: "కార్ట్‌కు జోడించు",
    addBtn: "జోడించు",
    noCutsFound: "కటింగ్ విధానాలు ఏవీ మీ శోధనకు సరిపోలలేదు.",
    dealsEyebrow: "ఈరోజు ఆఫర్లు",
    dealsTitle: "డైలీ ఆఫర్స్",
    dealsSub: "మా రెగ్యులర్ కస్టమర్ల కోసం ప్రత్యేక కాంబోలు.",
    dailyTag: "డైలీ",
    weeklyTag: "వీక్లీ",
    comboTag: "కాంబో",
    buy2kgSave20Title: "2 కిలోలు కొనండి, ₹20 ఆదా చేయండి",
    buy2kgSave20Sub: "ఈరోజు అన్ని కర్రీ-కట్ ఆర్డర్లపై వర్తిస్తుంది",
    sundaySpecialTitle: "ఆదివారం స్పెషల్",
    sundaySpecialSub: "₹500 పైన ఉచిత హోమ్ డెలివరీ",
    festivalComboTitle: "ఫెస్టివల్ కాంబో",
    festivalComboSub: "1 కిలో కర్రీ-కట్ + 500 గ్రాముల వింగ్స్ — ₹320",
    offerActive: "ఆఫర్ యాక్టివ్",
    freeDeliveryActive: "ఉచిత డెలివరీ యాక్టివ్",
    addMoreToQualify: "అర్హత పొందడానికి మరికొన్ని జోడించండి",
    spendMoreForFree: "ఉచిత డెలివరీ కోసం ₹500 షాపింగ్ చేయండి",
    add2kgBtn: "2 కిలోల కర్రీ కట్ జోడించు",
    addComboBtn: "ఫెస్టివల్ కాంబో జోడించు",
    viewInCart: "కార్ట్ చూడండి",
    bulkEyebrow: "హోల్‌సేల్ & క్యాటరింగ్",
    bulkTitle: "ఫంక్షన్లు & రెస్టారెంట్ల కొరకు బల్క్ ఆర్డర్లు",
    bulkSub: "ఉదయాన్నే వేగవంతమైన డెలివరీతో పాటు బల్క్ కొనుగోలుపై భారీ డిస్కౌంట్లు పొందండి",
    wholesalePricingTitle: "హోల్‌సేల్ ధరల శ్రేణి",
    wholesalePricingDesc: "మేము ప్రముఖ హోటళ్లు, రెస్టారెంట్లు, పార్టీ హాళ్లు మరియు గృహ శుభకార్యాలకు తాజా, పరిశుభ్రమైన చికెన్ సరఫరా చేస్తాము. మా డిస్కౌంట్లను క్రింద చూడండి:",
    tier1Range: "15 కిలోలు – 30 కిలోలు",
    tier1Discount: "కిలోపై ₹10 ఆదా",
    tier1Desc: "చిన్న ఫంక్షన్లు మరియు కుటుంబ వేడుకల కొరకు ఉత్తమమైనది",
    tier2Range: "30 కిలోలు – 50 కిలోలు",
    tier2Discount: "కిలోపై ₹15 ఆదా",
    tier2Desc: "క్యాటరర్లు మరియు వివాహ శుభకార్యాలకు సరైనది",
    tier3Range: "50 కిలోలు – 80 కిలోలు",
    tier3Discount: "కిలోపై ₹25 ఆదా",
    tier3Desc: "హోల్‌సేల్ సరఫరా కొరకు ప్రత్యేక ధరలు",
    tier4Range: "80 కిలోలు – 120 కిలోలు",
    tier4Discount: "కిలోపై ₹35 ఆదా",
    tier4Desc: "హోటళ్ళు మరియు పెద్ద ఈవెంట్‌ల కొరకు సరైనది",
    tier5Range: "120 కిలోలు & అంతకంటే ఎక్కువ",
    tier5Discount: "కిలోపై ₹45 ఆదా",
    tier5Desc: "రెస్టారెంట్ భాగస్వాములకు గరిష్ట డిస్కౌంట్",
    priorityDeliveryText: "ఉదయాన్నే ప్రాధాన్యత డెలివరీ (ఉదయం 6:30 నుండి ప్రారంభం)",
    customCutsText: "మీ వంటకాలకు తగినట్లుగా కస్టమ్ కట్స్ (బిర్యానీ, తందూరి, మొదలైనవి)",
    halalText: "100% హలాల్, FSSAI క్వాలిటీ చెక్, నియంత్రిత ఉష్ణోగ్రత",
    estimatorTitle: "ఇంటరాక్టివ్ బల్క్ కాలిక్యులేటర్",
    estimatorSub: "ఈరోజు ప్రభుత్వ చికెన్ ధరల ఆధారంగా హోల్‌సేల్ ధరను లెక్కించండి.",
    estimSelectType: "1. చికెన్ రకాన్ని ఎంచుకోండి",
    estimChooseCut: "2. కటింగ్ విధానాన్ని ఎంచుకోండి",
    estimEnterQty: "3. పరిమాణాన్ని నమోదు చేయండి (కిలోలు)",
    retailPrice: "సాధారణ ధర",
    bulkDiscountApplied: "Apply ఐన హోల్‌సేల్ డిస్కౌంట్",
    noDiscountText: "డిస్కౌంట్ లేదు (కనీసం 15 కిలోలు అవసరం)",
    netWholesaleRate: "నెట్ హోల్‌సేల్ ధర",
    estWholesaleTotal: "అంచనా వేసిన హోల్‌సేల్ మొత్తం:",
    estSavingsText: "అంచనా వేసిన పొదుపు:",
    inquireBulkWaBtn: "బల్క్ డిస్కౌంట్ కొరకు వాట్సాప్‌లో సంప్రదించండి",
    reviewsEyebrow: "కస్టమర్ల అభిప్రాయాలు",
    reviewsTitle: "మా కస్టమర్లు ఏమంటున్నారంటే",
    faqEyebrow: "తరచుగా అడిగే ప్రశ్నలు",
    faqTitle: "ప్రశ్నలు & సమాధానాలు",
    contactEyebrow: "కాల్ / విజిట్",
    contactTitle: "మమ్మల్ని సంప్రదించండి",
    addressLabel: "చిరునామా",
    callLabel: "కాల్ చేయండి",
    whatsappLabel: "వాట్సాప్",
    businessHoursLabel: "పనివేళలు",
    callNowBtn: "ఇప్పుడే కాల్ చేయండి",
    directionsBtn: "మార్గదర్శకాలు (Directions)",
    yourCartTitle: "మీ కార్ట్",
    cartEmpty: "కార్ట్ ఖాళీగా ఉంది.",
    homeDeliveryLabel: "హోమ్ డెలివరీ",
    selfPickupLabel: "స్వయంగా తీసుకోండి",
    subtotalLabel: "సబ్ టోటల్",
    offersDiscountLabel: "ఆఫర్ల డిస్కౌంట్",
    deliveryChargesLabel: "డెలివరీ ఛార్జీలు",
    totalAmountLabel: "మొత్తం ధర",
    onlineAdvanceRequiredLabel: "ఆన్‌లైన్ అడ్వాన్స్ చెల్లింపు:",
    cashOnDeliveryLabel: "డెలివరీ సమయంలో నగదు:",
    cashOnSiteLabel: "షాప్ వద్ద నగదు చెల్లింపు:",
    placeOrderWaBtn: "వాట్సాప్‌లో ఆర్డర్ చేయండి",
    estimatedCollectionTimeLabel: "సేకరణ సమయం అంచనా",
    estimatedCollectionInstruction: "మా కసాయిలు వెంటనే కటింగ్ ప్రారంభిస్తారు. దయచేసి 20-30 నిమిషాలలో (సుమారు {time} గంటలకు) మీ తాజా ఆర్డర్‌ను సేకరించండి.",
    deliveryFeeInstruction: "మీ ఆర్డర్‌కు ₹5 డెలివరీ రుసుము జోడించబడింది.",
    advancePaidOnlineLabel: "ఆన్‌లైన్ అడ్వాన్స్ చెల్లింపు:",
    payRestCashOnsiteLabel: "మిగిలిన నగదు షాప్ వద్ద చెల్లించండి",
    payRestCashOnDeliveryLabel: "మిగిలిన నగదు డెలివరీ సమయంలో చెల్లించండి",
    appliedOffersLabel: "వర్తించిన ఆఫర్లు",
    curryCutOfferSuccess: "కర్రీ కట్ ఆఫర్ అర్హత సాధించారు! (ప్రతి 2 కిలోలపై ₹20 ఆదా)",
    comboOfferSuccess: "కాంబో ధర వర్తించబడింది!",
    deliveryOfferSuccess: "ఉచిత హోమ్ డెలివరీ వర్తింపజేయబడింది!",
    heroTitle: "తాజా చికెన్ ప్రతిరోజూ డెలివరీ",
    heroSubtitle: "లైవ్ మండి ధరలు, నిజాయితీ గల బరువు, పరిశుభ్రమైన కటింగ్ మరియు 30 నిమిషాల డెలివరీ — నేరుగా A1 Chicken's నుండి.",
    tenderBroilerCardTitle: "చిన్న బ్రాయిలర్ (China Broiler)",
    tenderBroilerCardDesc: "మెత్తటి మరియు రుచికరమైన మాంసం, బరువు < 1.5 కిలోలు",
    standardBroilerCardTitle: "పెద్ద బ్రాయిలర్ (Pedha Broiler)",
    standardBroilerCardDesc: "పూర్తిగా పెరిగిన చికెన్, బరువు > 2.5 కిలోలు",
    nattuKodiCardTitle: "నాటు కోడి (కంట్రీ)",
    nattuKodiCardDesc: "సాంప్రదాయ సేంద్రీయ ఫ్రీ-రెంజ్ దేశీ జాతి",
    liveUpdatedFeed: "లైవ్ అప్‌డేట్ ఫీడ్",
    writeReviewTitle: "రివ్యూ రాయండి",
    reviewNamePlaceholder: "మీ పేరు",
    reviewTextPlaceholder: "మాతో మీ అనుభవాన్ని పంచుకోండి...",
    submitReviewBtn: "రివ్యూ సమర్పించండి",
    reviewRatingLabel: "రేటింగ్",
    reviewSuccessMsg: "ధన్యవాదాలు! మీ రివ్యూ మా రివ్యూలలో జోడించబడింది.",
    checkoutDetailsHeader: "చెక్అవుట్ వివరాలు",
    customerNameLabel: "పూర్తి పేరు",
    customerPhoneLabel: "వాట్సాప్ ఫోన్ నంబర్",
    deliveryAddressLabel: "పూర్తి డెలివరీ చిరునామా",
    paymentMethodHeader: "చెల్లింపు విధానాన్ని ఎంచుకోండి",
    payOnlineOption: "మొత్తం ఆన్‌లైన్‌లో చెల్లించండి",
    codOption: "క్యాష్ ఆన్ డెలివరీ (COD)",
    payAdvanceOption: "ఆన్‌లైన్ అడ్వాన్స్ చెల్లింపు (₹10)",
    upiLabel: "UPI (GPay, PhonePe, Paytm)",
    cardLabel: "క్రెడిట్ / డెబిట్ కార్డ్",
    qrLabel: "చెల్లింపు కోసం QR కోడ్‌ను స్కాన్ చేయండి",
    placeOrderBtn: "ఆర్డర్ చేయండి",
    orderSuccessTitle: "ఆర్డర్ విజయవంతంగా పూర్తయింది!",
    orderSuccessMessage: "మీ ఆర్డర్ సిస్టమ్‌లో నమోదైంది. మా సిబ్బంది త్వరలోనే సిద్ధం చేస్తారు.",
    orderIdLabel: "ఆర్డర్ ఐడి",
    backToShop: "షాప్‌కు తిరిగి వెళ్ళండి",
    paymentSimHeader: "సురక్షిత చెల్లింపు గేట్‌వే",
    cardNumLabel: "16-అంకెల కార్డ్ నంబర్",
    cardExpiryLabel: "ఎక్స్‌పైరీ తేదీ (MM/YY)",
    cardCvvLabel: "CVV (3 అంకెలు)",
    upiIdLabel: "UPI ఐడి (ఉదా: name@okhdfc)",
    qrScanInstruction: "చెల్లింపు పూర్తి చేయడానికి ఏదైనా UPI యాప్ (GPay, PhonePe, Paytm) ద్వారా క్రింది QR కోడ్‌ను స్కాన్ చేయండి.",
    simulatedPayBtn: "సురక్షిత చెల్లింపును పూర్తి చేయండి",
    pickupTimeLabel: "సేకరణ సమయం అంచనా",
    deliveryDetailsHeader: "డెలివరీ సమాచారం",
    pickupDetailsHeader: "స్వయంగా తీసుకునే వివరాలు",
    cardPlaceholder: "4111 2222 3333 4444",
    cardExpiryPlaceholder: "12/28",
    cardCvvPlaceholder: "123",
    reviewsNav: "సమీక్షలు",
    loginNav: "లాగిన్",
    signupNav: "సైన్ అప్",
    signOutNav: "లాగ్ అవుట్",
    emailLabel: "ఈమెయిల్ చిరునామా",
    passwordLabel: "పాస్‌వర్డ్",
    nameLabel: "మీ పేరు",
    googleSignIn: "గూగుల్‌తో లాగిన్ అవ్వండి",
    dontHaveAccount: "ఖాతా లేదా?",
    alreadyHaveAccount: "ఇప్పటికే ఖాతా ఉందా?",
    signInTitle: "లాగిన్ చేయండి",
    signUpTitle: "ఖాతా సృష్టించండి",
    pwdLengthError: "పాస్ వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.",
    authErrorDefault: "లాగిన్ విఫలమైంది. దయచేసి వివరాలను సరిచూసుకోండి.",
    trackOrdersNav: "ఆర్డర్‌లను ట్రాక్ చేయండి",
    orderHistoryTitle: "ఆర్డర్ హిస్టరీ & లైవ్ ట్రాకింగ్",
    noOrdersText: "మీరు ఇంకా ఎలాంటి ఆర్డర్లు చేయలేదు.",
    orderPlacedStep: "ఆర్డర్ చేయబడింది",
    preparingStep: "సిద్ధం చేస్తున్నారు",
    outForDeliveryStep: "డెలివరీకి బయలుదేరింది",
    deliveredStep: "డెలివరీ చేయబడింది",
    orderPlacedStepDesc: "మీ ఆర్డర్ మాకు అందింది, త్వరలోనే నిర్ధారిస్తాము.",
    preparingStepDesc: "మా ప్రొఫెషనల్ కసాయిలు మీ చికెన్‌ను పరిశుభ్రంగా కట్ చేసి ప్యాక్ చేస్తున్నారు.",
    outForDeliveryStepDesc: "డెలివరీ డ్రైవర్ మీ తాజా చికెన్‌తో మీ చిరునామాకు వస్తున్నారు.",
    deliveredStepDesc: "ఆర్డర్ డెలివరీ చేయబడింది. మీ తాజా చికెన్‌ను ఆస్వాదించండి!",
    liveTrackingTitle: "లైవ్ డెలివరీ స్కూటర్ ట్రాకర్",
    cancelledStatus: "రద్దు చేయబడింది",
    pickupCollectStep: "పికప్‌కు సిద్ధంగా ఉంది",
    pickupCollectStepDesc: "మీ తాజా చికెన్ సిద్ధంగా ఉంది! దయచేసి మా షాప్ నుండి సేకరించండి.",
    orderStatusLabel: "స్థితి",
    liveTrackingLabel: "లైవ్ ట్రాకర్",
    adminPanel: "అడ్మిన్ ప్యానెల్",
    adminBannerMessage: "మీరు అడ్మిన్ ({email}) లాగిన్ లో ఉన్నారు.",
    openAdminDashboard: "అడ్మిన్ డ్యాష్‌బోర్డ్ తెరవండి",
    forgotPassword: "పాస్ వర్డ్ మర్చిపోయారా?",
    resetEmailSent: "పాస్‌వర్డ్ రీసెట్ లింక్ మీ ఈమెయిల్‌కు పంపబడింది!",
  },
};

const FAQ_TRANSLATIONS = {
  en: [
    { q: "Is the chicken fresh daily?", a: "Yes — we receive new stock every morning at 6 AM. Nothing is sold from the previous day." },
    { q: "Do you provide cutting?", a: "Absolutely. Choose curry cut, small cut or boneless trimming at no extra charge above ₹240/kg." },
    { q: "Do you deliver to home?", a: "Free delivery within 5 km on orders above ₹500. Standard delivery charge ₹30 otherwise." },
    { q: "What are today's rates?", a: "See the live price card above — updated every morning by 8 AM as per government mandi rates." },
    { q: "How often are prices updated?", a: "Once daily, with the wholesale mandi update. Festival days may see two updates." }
  ],
  hi: [
    { q: "क्या चिकन रोजाना ताजा होता है?", a: "हां — हमें हर सुबह 6 बजे नया स्टॉक मिलता है। पिछले दिन का कुछ भी नहीं बेचा जाता है।" },
    { q: "क्या आप कटिंग प्रदान करते हैं?", a: "बिल्कुल। ₹240/किलोग्राम से अधिक पर बिना किसी अतिरिक्त शुल्क के करी कट, छोटा कट या बोनलेस ट्रिमिंग चुनें।" },
    { q: "क्या आप होम डिलीवरी करते हैं?", a: "₹500 से अधिक के ऑर्डर पर 5 किमी के भीतर मुफ्त डिलीवरी। अन्यथा मानक डिलीवरी शुल्क ₹30 है।" },
    { q: "आज की दरें क्या हैं?", a: "ऊपर लाइव मूल्य कार्ड देखें — सरकारी मंडी दरों के अनुसार हर सुबह 8 बजे तक अपडेट किया जाता है।" },
    { q: "कीमतें कितनी बार अपडेट की जाती हैं?", a: "थोक मंडी अपडेट के साथ रोजाना एक बार। त्योहारों के दिनों में दो अपडेट हो सकते हैं।" }
  ],
  te: [
    { q: "చికెన్ ప్రతిరోజూ తాజాదేనా?", a: "అవును — ప్రతిరోజూ ఉదయం 6 గంటలకు కొత్త స్టాక్ వస్తుంది. నిన్నటిది ఏదీ విక్రయించబడదు." },
    { q: "మీరు కటింగ్ చేసి ఇస్తారా?", a: "ఖచ్చితంగా. ₹240/కిలో కంటే ఎక్కువ ధర ఉన్న కట్స్‌కు కర్రీ కట్, చిన్న ముక్కలు లేదా బోన్‌లెస్ ట్రిమ్మింగ్ ఎటువంటి అదనపు ఛార్జీలు లేకుండా ఎంచుకోండి." },
    { q: "మీరు ఇంటికి డెలివరీ చేస్తారా?", a: "₹500 పైన ఉన్న ఆర్డర్‌లపై 5 కిమీ పరిధిలో ఉచిత డెలివరీ. లేకపోతే సాధారణ డెలివరీ ఛార్జ్ ₹30 వర్తిస్తుంది." },
    { q: "ఈరోజు ధరలు ఎంత?", a: "పైన ఉన్న లైవ్ ధరల కార్డును చూడండి — ప్రతిరోజూ ఉదయం 8 గంటలకు ప్రభుత్వ మండి ధరల ప్రకారం అప్‌డేట్ చేయబడుతుంది." },
    { q: "ధరలు ఎంత తరచుగా అప్‌డేట్ అవుతాయి?", a: "రోజుకు ఒకసారి, హోల్‌సేల్ మండి అప్‌డేట్‌తో పాటు. పండుగ రోజుల్లో రెండు సార్లు అప్‌డేట్ కావచ్చు." }
  ]
};

const REVIEWS_TRANSLATIONS = {
  en: [
    { name: "Anita Sharma", rating: 5, text: "Always fresh, weighed honestly. My go-to for years." },
    { name: "Rahul Verma", rating: 5, text: "Cutting is neat and delivery is super quick." },
    { name: "Priya Nair", rating: 4, text: "Good prices, especially the Sunday offer." }
  ],
  hi: [
    { name: "अनीता शर्मा", rating: 5, text: "हमेशा ताजा, ईमानदारी से तौला गया। सालों से मेरी पसंदीदा दुकान।" },
    { name: "राहुल वर्मा", rating: 5, text: "कटिंग बहुत साफ है और डिलीवरी बहुत तेज है।" },
    { name: "प्रिया नायर", rating: 4, text: "अच्छी दरें, खासकर रविवार का विशेष ऑफर।" }
  ],
  te: [
    { name: "అనిత శర్మ", rating: 5, text: "ఎల్లప్పుడూ తాజాది, నిజాయితీ గల బరువు. చాలా సంవత్సరాలుగా నా మొదటి ఎంపిక." },
    { name: "రాహుల్ వర్మ", rating: 5, text: "కటింగ్ చాలా శుభ్రంగా ఉంటుంది మరియు డెలివరీ చాలా వేగంగా ఉంటుంది." },
    { name: "ప్రియా నాయర్", rating: 4, text: "మంచి ధరలు, ముఖ్యంగా ఆదివారం నాటి ఉచిత డెలివరీ ఆఫర్ బాగుంది." }
  ]
};

const getProductTranslatedName = (name: string, lang: "en" | "hi" | "te") => {
  if (lang === "hi") {
    if (name.includes("Live Chicken")) return "जीवित चिकन (साबुत)";
    if (name.includes("Whole Dressed")) return "साबुत ड्रेसिंग चिकन";
    if (name.includes("Normal Cut (Curry Cut)")) return "नॉर्मल कट (करी कट)";
    if (name.includes("Small Pieces")) return "छोटे टुकड़े (फ्राई/बिरयानी)";
    if (name.includes("Dum Piece Cutting")) return "दम बिरयानी कटिंग पीस";
    if (name.includes("Leg Pieces (Drumsticks)")) return "लेग पीस (ड्रमस्टिक्स)";
    if (name.includes("Wings Cutting")) return "चिकन विंग्स";
    if (name.includes("Boneless Breast Fillet")) return "बोनलेस ब्रेस्ट फिलेट";
    if (name.includes("Thigh Fillet (Boneless)")) return "थाई फिलेट (बोनलेस)";
  }
  if (lang === "te") {
    if (name.includes("Live Chicken")) return "లైవ్ చికెన్ (కటింగ్ లేకుండా)";
    if (name.includes("Whole Dressed")) return "పూర్తి చికెన్ డ్రెస్సింగ్";
    if (name.includes("Normal Cut (Curry Cut)")) return "నార్మల్ కట్ (కరి కట్)";
    if (name.includes("Small Pieces")) return "చిన్న ముక్కలు (ఫ్రై/బిర్యానీ)";
    if (name.includes("Dum Piece Cutting")) return "దమ్ బిర్యానీ కటింగ్ పీసెస్";
    if (name.includes("Leg Pieces (Drumsticks)")) return "లెగ్ పీసెస్ (డ్రమ్‌స్టిక్స్)";
    if (name.includes("Wings Cutting")) return "చికెన్ రెక్కలు (వింగ్స్)";
    if (name.includes("Boneless Breast Fillet")) return "బోన్‌లెస్ బ్రెస్ట్ ఫిలెట్";
    if (name.includes("Thigh Fillet (Boneless)")) return "బోన్‌లెస్ థై ఫిలెట్";
  }
  return name;
};

const getBreedTranslatedName = (breed: string, lang: "en" | "hi" | "te") => {
  if (lang === "hi") {
    if (breed.toLowerCase() === "small") return "चाइना ब्रॉयलर";
    if (breed.toLowerCase() === "big") return "पेड़ा ब्रॉयलर";
    if (breed.toLowerCase() === "nattu") return "नाटू कोड़ी";
  }
  if (lang === "te") {
    if (breed.toLowerCase() === "small") return "చిన్న బ్రాయిలర్";
    if (breed.toLowerCase() === "big") return "పెద్ద బ్రాయిలర్";
    if (breed.toLowerCase() === "nattu") return "నాటు కోడి";
  }
  return breed === "small" ? "China Broiler" : breed === "big" ? "Pedha Broiler" : "Nattu Kodi";
};

// ---------- Components ----------
function PriceBanner({
  livePrices,
  lang,
}: {
  livePrices: {
    tender: { government: number; withoutCutting: number; withCutting: number };
    standard: { government: number; withoutCutting: number; withCutting: number };
    nattuKodi: { government: number; withoutCutting: number; withCutting: number };
  };
  lang: "en" | "hi" | "te";
}) {
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden border-b border-primary/30 py-1.5">
      <div className="flex items-center gap-3 text-[13px] md:text-sm font-semibold whitespace-nowrap animate-marquee w-max">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="flex items-center gap-4 px-6">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              {t.tenderBroiler}: <b className="text-accent">₹{livePrices.tender.withoutCutting}/kg</b>
            </span>
            <span className="opacity-70">•</span>
            <span>
              {t.standardBroiler}:{" "}
              <b className="text-accent">₹{livePrices.standard.withoutCutting}/kg</b>
            </span>
            <span className="opacity-70">•</span>
            <span>
              {t.nattuKodi}:{" "}
              <b className="text-accent">₹{livePrices.nattuKodi.withoutCutting}/kg</b>
            </span>
            <span className="opacity-70">•</span>
            <span className="inline-flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-xs">
              <span className="size-1.5 rounded-full bg-accent animate-ping" />
              {t.liveTime}: {liveTime || t.loadingText}
            </span>
            <span className="opacity-70">•</span>
            <span>
              {t.call}: <b>{SHOP.phone}</b>
            </span>
            <span className="opacity-70">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Header({
  cartCount,
  onOpenCart,
  lang,
  setLang,
  user,
  onAuthClick,
  onSignOut,
  onTrackOrdersClick,
}: {
  cartCount: number;
  onOpenCart: () => void;
  lang: "en" | "hi" | "te";
  setLang: (lang: "en" | "hi" | "te") => void;
  user: FirebaseUser | null;
  onAuthClick: () => void;
  onSignOut: () => void;
  onTrackOrdersClick: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on desktop screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass border-b border-foreground/5">
      <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
        {/* Left Corner: Logo */}
        <a
          href="#top"
          className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02] shrink-0"
        >
          <div className="size-12 grid place-items-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.45_0.2_27)] text-primary-foreground shadow-soft ring-2 ring-primary/20">
            <Flame className="size-6 animate-pulse" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-2xl md:text-3xl tracking-wide font-extrabold text-foreground group-hover:text-primary transition-colors">
              {SHOP.name}
            </div>
            <div className="text-[12px] text-muted-foreground tracking-wider font-medium">
              {t.taglineDescription}
            </div>
          </div>
        </a>

        {/* Middle Navigation with increased font size and slide underline effect */}
        <nav className="hidden md:flex items-center gap-12 text-[19px] font-bold text-muted-foreground tracking-wide">
          <a
            href="#prices"
            className="hover:text-primary transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {t.pricing}
          </a>
          <a
            href="#products"
            className="hover:text-primary transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {t.shop}
          </a>
          <a
            href="#bulk"
            className="hover:text-primary transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {t.bulk}
          </a>
          <a
            href="#offers"
            className="hover:text-primary transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {t.offers}
          </a>
          <a
            href="#reviews"
            className="hover:text-primary transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {t.reviewsNav}
          </a>
          <a
            href="#contact"
            className="hover:text-primary transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            {t.contact}
          </a>
        </nav>

        {/* Right Corner Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector Dropdown (Desktop only in header) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-accent px-3.5 py-2.5 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.05] shadow-sm active:scale-95"
            >
              <Globe className="size-4 text-primary" />
              <span className="uppercase font-bold text-xs">{lang}</span>
              <ChevronDown className={`size-3 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-card border border-foreground/10 p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {(["en", "hi", "te"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setLangDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl transition hover:bg-secondary text-foreground"
                  >
                    {l === "en" ? "English" : l === "hi" ? "हिन्दी" : "తెలుగు"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Info / Dropdown (Desktop only in header) */}
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-accent px-3.5 py-2.5 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.05] shadow-sm active:scale-95"
              >
                <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                  {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : user.email?.substring(0, 1).toUpperCase() || "U"}
                </div>
                <span className="hidden lg:inline max-w-[90px] truncate text-xs font-bold">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <ChevronDown className={`size-3 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-card border border-foreground/10 p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3.5 py-2 border-b border-foreground/5 text-[11px] text-muted-foreground truncate font-medium">
                    {user.email}
                  </div>
                  {user.email && (user.email.toLowerCase().endsWith("@freshlyyours.com") || user.email.toLowerCase().includes("@freshlyyours")) && (
                    <a
                      href="/admin"
                      className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl hover:bg-secondary text-foreground transition mt-1 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="size-3.5 text-primary" />
                      <span>{t.adminPanel}</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      onTrackOrdersClick();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl hover:bg-secondary text-foreground transition mt-1 flex items-center gap-2 cursor-pointer"
                  >
                    <Clock className="size-3.5 text-primary" />
                    <span>{t.trackOrdersNav}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSignOut();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl text-destructive hover:bg-destructive/10 transition mt-1 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>{t.signOutNav}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-accent px-3.5 py-2.5 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.05] shadow-sm active:scale-95 cursor-pointer"
            >
              <User className="size-4 text-primary" />
              <span className="hidden sm:inline font-bold text-xs">{t.loginNav}</span>
            </button>
          )}

          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 rounded-full bg-secondary hover:bg-accent px-4 py-2.5 text-[15px] font-semibold text-foreground transition-all duration-300 hover:scale-[1.05] shadow-sm active:scale-95"
          >
            <ShoppingCart className="size-5 text-primary" />
            <span className="hidden sm:inline">{t.cart}</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 size-5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold animate-bounce">
                {cartCount}
              </span>
            )}
          </button>



          {/* Hamburger Menu Icon for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden size-10 grid place-items-center rounded-xl bg-secondary hover:bg-accent text-foreground transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-foreground/5 bg-background/95 backdrop-blur-lg animate-in slide-in-from-top duration-300 max-h-[calc(100dvh-80px)] overflow-y-auto">
          <div className="px-4 py-4 flex flex-col gap-2.5 text-sm font-semibold text-muted-foreground">
            <a
              href="#prices"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1.5 px-3 hover:bg-secondary rounded-xl"
            >
              {t.pricing}
            </a>
            <a
              href="#products"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1.5 px-3 hover:bg-secondary rounded-xl"
            >
              {t.shop}
            </a>
            <a
              href="#bulk"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1.5 px-3 hover:bg-secondary rounded-xl"
            >
              {t.bulk}
            </a>
            <a
              href="#offers"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1.5 px-3 hover:bg-secondary rounded-xl"
            >
              {t.offers}
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1.5 px-3 hover:bg-secondary rounded-xl"
            >
              {t.reviewsNav}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1.5 px-3 hover:bg-secondary rounded-xl"
            >
              {t.contact}
            </a>

            {/* Language Selector in Mobile Menu */}
            <div className="border-t border-foreground/5 pt-4">
              <div className="text-xs font-bold text-muted-foreground uppercase px-3 mb-2">{t.changeLanguage}</div>
              <div className="flex gap-2 px-3">
                {(["en", "hi", "te"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 text-center py-2.5 text-xs font-bold rounded-xl border transition ${
                      lang === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-foreground/5 text-muted-foreground"
                    }`}
                  >
                    {l === "en" ? "English" : l === "hi" ? "हिन्दी" : "తెలుగు"}
                  </button>
                ))}
              </div>
            </div>

            {user ? (
              <div className="border-t border-foreground/5 pt-4">
                <div className="flex items-center gap-3 px-3 mb-3">
                  <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-sm">
                    {user.displayName ? user.displayName.substring(0, 1).toUpperCase() : user.email?.substring(0, 1).toUpperCase() || "U"}
                  </div>
                  <div className="leading-tight truncate">
                    <div className="text-sm font-bold text-foreground">
                      {user.displayName || user.email?.split("@")[0]}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                {user.email && (user.email.toLowerCase().endsWith("@freshlyyours.com") || user.email.toLowerCase().includes("@freshlyyours")) && (
                  <a
                    href="/admin"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 hover:bg-secondary text-foreground text-sm font-bold rounded-xl transition border border-foreground/10 cursor-pointer mb-2"
                  >
                    <ShieldCheck className="size-4 text-primary" />
                    <span>{t.adminPanel}</span>
                  </a>
                )}
                <button
                  onClick={() => {
                    onTrackOrdersClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 hover:bg-secondary text-foreground text-sm font-bold rounded-xl transition border border-foreground/10 cursor-pointer mb-2"
                >
                  <Clock className="size-4 text-primary" />
                  <span>{t.trackOrdersNav}</span>
                </button>
                <button
                  onClick={() => {
                    onSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 hover:bg-destructive/10 text-destructive text-sm font-bold rounded-xl transition border border-destructive/10 cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>{t.signOutNav}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onAuthClick();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-card py-3 text-sm font-bold shadow-sm text-foreground active:scale-95 transition cursor-pointer"
              >
                <User className="size-4 text-primary" /> {t.loginNav} / {t.signupNav}
              </button>
            )}


          </div>
        </div>
      )}
    </header>
  );
}

function Hero({
  livePrices,
  lang,
}: {
  livePrices: {
    tender: { government: number; withoutCutting: number; withCutting: number };
    standard: { government: number; withoutCutting: number; withCutting: number };
    nattuKodi: { government: number; withoutCutting: number; withCutting: number };
  };
  lang: "en" | "hi" | "te";
}) {
  const t = TRANSLATIONS[lang];
  return (
    <section id="top" className="relative overflow-hidden w-full">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_20%,color-mix(in_oklab,var(--accent)_30%,transparent),transparent_70%),radial-gradient(40%_40%_at_10%_80%,color-mix(in_oklab,var(--primary)_15%,transparent),transparent_70%)]" />
      <div className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto pt-10 pb-16 md:pt-16 md:pb-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> {t.trustedBy}
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-7xl text-balance leading-[0.95]">
            {lang === "en" ? (
              <>
                Fresh <span className="text-primary">Chicken</span> Delivered{" "}
                <span className="text-primary">Daily</span>
              </>
            ) : (
              t.heroTitle
            )}
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg text-balance">
            {t.heroSubtitle}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft hover:translate-y-[-1px] transition"
            >
              <Phone className="size-4" /> {t.callNow}
            </a>
            <a
              href={waLink(t.heroWhatsAppPrefill)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-semibold text-white hover:translate-y-[-1px] transition"
            >
              <WhatsAppIcon className="size-4 fill-white" /> {t.whatsappOrder}
            </a>
            <a
              href="#prices"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-5 py-3 text-sm font-semibold hover:bg-accent transition"
            >
              {t.viewPrices}
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { icon: Leaf, t: t.fresh },
              { icon: ShieldCheck, t: t.hygienic },
              { icon: Truck, t: t.fastDelivery },
              { icon: Award, t: t.govtApproved },
            ].map((f) => (
              <div
                key={f.t}
                className="flex items-center gap-2 rounded-xl border border-foreground/5 bg-card p-3 shadow-sm"
              >
                <f.icon className="size-4 text-primary" />{" "}
                <span className="font-medium">{f.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden shadow-soft ring-1 ring-foreground/5">
            <img
              src={heroImg}
              alt="Fresh chicken cuts"
              className="size-full object-cover"
              width={1600}
              height={1200}
            />
          </div>
          <div className="absolute -bottom-5 -left-5 glass rounded-2xl p-4 shadow-soft hidden sm:block">
            <div className="text-xs text-muted-foreground">{t.todaysBroilerLabel}</div>
            <div className="font-display text-3xl text-primary">
              ₹{livePrices.tender.withoutCutting}
              <span className="text-sm text-muted-foreground">/kg</span>
            </div>
            <div className="text-[11px] text-success flex items-center gap-1 mt-1">
              <span className="size-1.5 rounded-full bg-success animate-ping inline-block mr-1" />
              {t.liveUpdatedFeed}
            </div>
          </div>
          <div className="absolute -top-4 -right-4 rounded-2xl bg-accent text-accent-foreground px-4 py-3 shadow-soft rotate-3">
            <div className="font-display text-2xl leading-tight">{t.freeDeliveryBadgeTitle}</div>
            <div className="text-[11px] font-semibold">{t.freeDeliveryBadgeSub}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceRow({
  label,
  value,
  type,
  priceFlash,
  isPremium,
}: {
  label: string;
  value: number;
  type: "muted" | "normal" | "primary";
  priceFlash: "up" | "down" | null;
  isPremium?: boolean;
}) {
  let flashClass = "";
  if (priceFlash === "up") {
    flashClass = "text-red-600 scale-105 font-bold";
  } else if (priceFlash === "down") {
    flashClass = "text-green-600 scale-105 font-bold";
  }

  const bgCls =
    type === "primary"
      ? isPremium
        ? "bg-primary text-primary-foreground font-semibold"
        : "bg-primary/90 text-primary-foreground font-semibold"
      : type === "muted"
        ? "bg-secondary text-secondary-foreground"
        : "bg-foreground/5 text-foreground";

  return (
    <div
      className={`flex items-center justify-between rounded-2xl p-3.5 transition-all duration-300 ${bgCls}`}
    >
      <span className="text-xs font-semibold uppercase tracking-wider opacity-85">{label}</span>
      <span className={`font-display text-2xl transition-all duration-300 ${flashClass}`}>
        ₹{value}
        <span className="text-xs font-sans opacity-75">/kg</span>
      </span>
    </div>
  );
}

function PriceCard({
  livePrices,
  trend,
  priceFlash,
  lang,
}: {
  livePrices: {
    tender: { government: number; withoutCutting: number; withCutting: number };
    standard: { government: number; withoutCutting: number; withCutting: number };
    nattuKodi: { government: number; withoutCutting: number; withCutting: number };
  };
  trend: "up" | "down" | "flat";
  priceFlash: "up" | "down" | null;
  lang: "en" | "hi" | "te";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const [lastUpdated, setLastUpdated] = useState("");
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const now = new Date();
    setLastUpdated(
      now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    );
  }, [livePrices.tender.government]);

  return (
    <section
      id="prices"
      className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto py-16"
    >
      <SectionHeading
        eyebrow={t.pricing}
        title={t.livePricesTitle}
        sub={`${t.liveMandiRates} • ${t.updatedAt} ${lastUpdated || "8:00 AM"}`}
      />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Tender Broiler (Small) */}
        <div className="rounded-3xl border border-foreground/5 bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-xl tracking-wide leading-tight">{t.tenderBroilerCardTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.tenderBroilerCardDesc}</p>
            </div>
            <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
              {t.mostPopular}
            </span>
          </div>
          <div className="space-y-3">
            <PriceRow
              label={t.governmentRate}
              value={livePrices.tender.government}
              type="muted"
              priceFlash={priceFlash}
            />
            <PriceRow
              label={t.withoutCutting}
              value={livePrices.tender.withoutCutting}
              type="normal"
              priceFlash={priceFlash}
            />
            <PriceRow
              label={t.withCutting}
              value={livePrices.tender.withCutting}
              type="primary"
              priceFlash={priceFlash}
            />
          </div>
        </div>

        {/* Card 2: Standard Broiler (Large) */}
        <div className="rounded-3xl border border-foreground/5 bg-card p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-xl tracking-wide leading-tight">{t.standardBroilerCardTitle}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.standardBroilerCardDesc}
              </p>
            </div>
            <span className="rounded-full bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
              {t.bestValue}
            </span>
          </div>
          <div className="space-y-3">
            <PriceRow
              label={t.governmentRate}
              value={livePrices.standard.government}
              type="muted"
              priceFlash={priceFlash}
            />
            <PriceRow
              label={t.withoutCutting}
              value={livePrices.standard.withoutCutting}
              type="normal"
              priceFlash={priceFlash}
            />
            <PriceRow
              label={t.withCutting}
              value={livePrices.standard.withCutting}
              type="primary"
              priceFlash={priceFlash}
            />
          </div>
        </div>

        {/* Card 3: Nattu Kodi (Country Chicken) */}
        <div className="rounded-3xl border border-foreground/5 bg-card p-6 shadow-soft space-y-4 ring-2 ring-primary/20">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-display text-xl tracking-wide text-primary leading-tight">
                {t.nattuKodiCardTitle}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t.nattuKodiCardDesc}
              </p>
            </div>
            <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
              {t.premiumTaste}
            </span>
          </div>
          <div className="space-y-3">
            <PriceRow
              label={t.governmentRate}
              value={livePrices.nattuKodi.government}
              type="muted"
              priceFlash={priceFlash}
              isPremium
            />
            <PriceRow
              label={t.withoutCutting}
              value={livePrices.nattuKodi.withoutCutting}
              type="normal"
              priceFlash={priceFlash}
              isPremium
            />
            <PriceRow
              label={t.withCutting}
              value={livePrices.nattuKodi.withCutting}
              type="primary"
              priceFlash={priceFlash}
              isPremium
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <TrendIcon
          className={`size-4 ${trend === "up" ? "text-success animate-pulse" : trend === "down" ? "text-red-500 animate-bounce" : "text-muted-foreground"}`}
        />
        {trend === "up"
          ? t.pricesTrendingUp
          : trend === "down"
            ? t.pricesDecreased
            : t.pricesStable}{" "}
        — {t.liveUpdatesGuaranteed}
      </div>
    </section>
  );
}

function StockBoard() {
  const items: { name: string; stock: Stock }[] = [
    { name: "Live Chicken", stock: "available" },
    { name: "Skinless Chicken", stock: "available" },
    { name: "Curry Cut", stock: "available" },
    { name: "Boneless", stock: "available" },
    { name: "Chicken Wings", stock: "limited" },
    { name: "Chicken Legs", stock: "available" },
    { name: "Liver", stock: "out" },
    { name: "Gizzard", stock: "limited" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <SectionHeading
        eyebrow="Live Inventory"
        title="Today's Stock"
        sub="Updated in real time by our shop floor."
      />
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((it) => {
          const m = stockMeta[it.stock];
          return (
            <div
              key={it.name}
              className="flex items-center justify-between rounded-2xl border border-foreground/5 bg-card p-4 shadow-sm"
            >
              <span className="font-medium">{it.name}</span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${m.cls}`}
              >
                <span className={`size-1.5 rounded-full ${m.dot} animate-pulse-dot`} />
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

type CartItem = { product: Product; qty: number };

function Products({
  products,
  priceFlash,
  onAdd,
  lang,
}: {
  products: Product[];
  priceFlash: "up" | "down" | null;
  onAdd: (p: Product, qty: number) => void;
  lang: "en" | "hi" | "te";
}) {
  const [selectedBreed, setSelectedBreed] = useState<"small" | "big" | "nattu">("small");
  const [selectedStyle, setSelectedStyle] = useState<"live" | "skin" | "skinless">("skinless");
  const [q, setQ] = useState("");
  const [cardWeights, setCardWeights] = useState<Record<string, number>>({});
  const t = TRANSLATIONS[lang];

  const basePrices = useMemo(() => {
    const smallLive = products.find((p) => p.id === "small-live")?.price || 180;
    const bigLive = products.find((p) => p.id === "big-live")?.price || 165;
    const nattuLive = products.find((p) => p.id === "nattu-live")?.price || 340;
    return { small: smallLive, big: bigLive, nattu: nattuLive };
  }, [products]);

  const filteredCuts = useMemo(() => {
    return products.filter(
      (p) =>
        p.breed === selectedBreed &&
        p.style === selectedStyle &&
        getProductTranslatedName(p.name, lang).toLowerCase().includes(q.toLowerCase()),
    );
  }, [products, selectedBreed, selectedStyle, q, lang]);

  let flashClass = "";
  if (priceFlash === "up") {
    flashClass = "text-red-600 scale-105 font-bold";
  } else if (priceFlash === "down") {
    flashClass = "text-green-600 scale-105 font-bold";
  }

  const breedOptions = [
    {
      id: "small" as const,
      name: t.tenderBroilerCardTitle,
      sub: t.tenderBroilerCardDesc,
      weightDesc: lang === "hi" ? "वजन < 1.5 किलोग्राम प्रति पक्षी" : lang === "te" ? "పక్షి బరువు < 1.5 కిలోలు" : "Weight < 1.5 kg per bird",
      liveRate: basePrices.small,
      img: liveImg,
      badge: t.mostPopular,
    },
    {
      id: "big" as const,
      name: t.standardBroilerCardTitle,
      sub: t.standardBroilerCardDesc,
      weightDesc: lang === "hi" ? "वजन > 2.5 किलोग्राम प्रति पक्षी" : lang === "te" ? "పక్షి బరువు > 2.5 కిలోలు" : "Weight > 2.5 kg per bird",
      liveRate: basePrices.big,
      img: liveImg,
      badge: t.bestValue,
    },
    {
      id: "nattu" as const,
      name: t.nattuKodiCardTitle,
      sub: t.nattuKodiCardDesc,
      weightDesc: lang === "hi" ? "पारंपरिक देशी नस्ल" : lang === "te" ? "సాంప్రదాయ దేశీ జాతి" : "Traditional Desi breed",
      liveRate: basePrices.nattu,
      img: liveNattuImg,
      badge: t.premiumTaste,
    },
  ];

  const breedLabels = {
    small: t.tenderBroilerCardTitle,
    big: t.standardBroilerCardTitle,
    nattu: t.nattuKodiCardTitle,
  };

  return (
    <section id="products" className="bg-secondary/50 border-y border-foreground/5 py-16 w-full">
      <div className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto">
        <SectionHeading
          eyebrow={t.catalogEyebrow}
          title={t.catalogTitle}
          sub={t.catalogSub}
        />

        {/* Step 1: Select Chicken Breed (3 Options) */}
        <div className="mt-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-widest text-primary text-center mb-8 leading-snug">
            {t.step1Title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full mx-auto">
            {breedOptions.map((breed) => {
              const isSelected = selectedBreed === breed.id;
              return (
                <button
                  key={breed.id}
                  type="button"
                  onClick={() => {
                    setSelectedBreed(breed.id);
                    setQ("");
                  }}
                  className={`group text-left relative flex flex-col justify-between rounded-3xl bg-card border overflow-hidden p-8 transition-all duration-300 shadow-sm hover:shadow-soft active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? "border-primary ring-4 ring-primary bg-primary/[0.02]"
                      : "border-foreground/5 hover:border-primary/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-6 right-6 bg-primary text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                      {t.selectedBadge}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div className="flex items-center gap-5">
                      <div className="size-20 rounded-2xl overflow-hidden shrink-0 bg-secondary shadow-sm">
                        <img src={breed.img} alt={breed.name} className="size-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest block">
                          {breed.badge}
                        </span>
                        <h4 className="font-display text-2xl md:text-3xl tracking-wide font-black mt-1 text-foreground leading-tight">
                          {breed.name}
                        </h4>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {breed.sub}
                      </p>
                      <span className="inline-block mt-3 text-sm font-bold bg-secondary px-3 py-1.5 rounded-full text-foreground/80">
                        {breed.weightDesc}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-5 flex justify-between items-center w-full">
                    <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                      {t.liveBaseRate}:
                    </span>
                    <span
                      className={`font-display text-3xl md:text-4xl text-primary transition-all duration-300 ${isSelected ? flashClass : ""}`}
                    >
                      ₹{breed.liveRate}
                      <span className="text-xs font-sans font-normal text-muted-foreground">
                        /kg
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Cutting Style */}
        <div className="mt-16 border-t border-foreground/5 pt-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.15em] text-primary leading-snug">
                {t.step2Title}
              </h3>
              <h4 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground mt-2 leading-tight">
                {breedLabels[selectedBreed]}
              </h4>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-full border border-foreground/10 bg-card pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Style Selector Tabs (Skinless, Skin, Live) */}
          <div className="w-full max-w-5xl mx-auto mb-8 px-4 sm:px-6">
            <div className="grid grid-cols-3 w-full rounded-2xl bg-secondary p-1.5 border border-foreground/5 shadow-inner">
              {[
                { id: "skinless" as const, label: t.skinlessTab },
                { id: "skin" as const, label: t.withSkinTab },
                { id: "live" as const, label: t.liveChickenTab },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`w-full py-3.5 px-1 sm:px-4 rounded-xl text-xs sm:text-sm md:text-base font-black transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 sm:gap-2 text-center select-none ${
                    selectedStyle === style.id
                      ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {selectedStyle === "live" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCuts.map((p) => {
                const weight = cardWeights[p.id] !== undefined ? cardWeights[p.id] : 1;
                const translatedName = getProductTranslatedName(p.name, lang);
                const translatedDesc = getProductTranslatedDesc(p.id, p.desc, lang);
                const waMessage = lang === "hi"
                  ? `नमस्ते A1 Chicken's, मैं ऑर्डर करना चाहता हूँ:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} किलो) — ₹${Math.round(p.price * weight)}`
                  : lang === "te"
                    ? `హలో A1 Chicken's, నేను ఆర్డర్ చేయాలనుకుంటున్నాను:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} కిలోలు) — ₹${Math.round(p.price * weight)}`
                    : `Hello, I want to order from A1 Chicken's:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} kg) — ₹${Math.round(p.price * weight)}`;
                
                return (
                  <article
                    key={p.id}
                    className="group flex flex-col justify-between rounded-3xl bg-card border border-foreground/5 overflow-hidden shadow-sm hover:shadow-soft transition-all duration-300"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-secondary relative">
                      <img
                        src={p.img}
                        alt={translatedName}
                        loading="lazy"
                        className="size-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                        {breedLabels[p.breed as "small" | "big" | "nattu"]}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <h3 className="font-sans text-lg sm:text-xl font-semibold text-foreground leading-snug">
                          {translatedName}
                        </h3>
                        <p className="text-sm text-foreground/80 leading-relaxed">{translatedDesc}</p>
                      </div>

                      {/* Quantity weight selector directly on card */}
                      <div className="flex items-center justify-between bg-secondary/80 rounded-2xl p-2 mt-4 border border-foreground/5">
                        <span className="text-xs font-semibold text-foreground/75 pl-2">
                          {t.qtyLabel}:
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setCardWeights((prev) => ({
                                ...prev,
                                [p.id]: Math.max(0.5, Number(((prev[p.id] || 1) - 0.5).toFixed(1))),
                              }))
                            }
                            className="size-8 rounded-xl bg-card border hover:bg-secondary flex items-center justify-center font-bold text-foreground transition active:scale-90"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-14 text-center text-sm font-bold text-foreground">
                            {weight} kg
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setCardWeights((prev) => ({
                                ...prev,
                                [p.id]: Number(((prev[p.id] || 1) + 0.5).toFixed(1)),
                              }))
                            }
                            className="size-8 rounded-xl bg-card border hover:bg-secondary flex items-center justify-center font-bold text-foreground transition active:scale-90"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-none">
                            {t.totalLabel} ({weight} kg):
                          </span>
                          <div
                            className={`font-display text-3xl text-primary mt-1 transition-all duration-300 ${flashClass}`}
                          >
                            ₹{Math.round(p.price * weight)}
                            <span className="text-xs font-sans font-normal text-foreground/70 ml-1">
                              (₹{p.price}/kg)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={waLink(waMessage)}
                            target="_blank"
                            rel="noreferrer"
                            className="grid place-items-center size-10 rounded-full bg-whatsapp text-white hover:opacity-90 transition shadow-sm"
                            aria-label="Order on WhatsApp"
                          >
                            <WhatsAppIcon className="size-4 fill-white" />
                          </a>
                          <button
                            disabled={p.stock === "out"}
                            onClick={() => onAdd(p, weight)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 h-10 text-xs font-semibold disabled:opacity-40 hover:opacity-90 transition shadow-sm active:scale-95"
                          >
                            <Plus className="size-4" /> {t.addBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 w-full max-w-full mx-auto">
              {filteredCuts.map((p) => {
                const isLegs = p.id.includes("legs");
                const defaultQty = isLegs ? 4 : 1;
                const weight = cardWeights[p.id] !== undefined ? cardWeights[p.id] : defaultQty;

                const calcPrice = isLegs
                  ? Math.round(p.price * weight * 0.15)
                  : Math.round(p.price * weight);

                const unitLabel = isLegs ? (weight === 1 ? (lang === "hi" ? "पीस" : lang === "te" ? "పీస్" : "piece") : (lang === "hi" ? "पीस" : lang === "te" ? "పీస్" : "pieces")) : "kg";
                const weightLabel = isLegs ? (lang === "hi" ? `~ ${(weight * 0.15).toFixed(2)} किलो` : lang === "te" ? `~ ${(weight * 0.15).toFixed(2)} కిలోలు` : `~ ${(weight * 0.15).toFixed(2)} kg`) : "";
                
                const translatedName = getProductTranslatedName(p.name, lang);
                const translatedDesc = getProductTranslatedDesc(p.id, p.desc, lang);

                const textMsg = isLegs
                  ? (lang === "hi"
                      ? `नमस्ते A1 Chicken's, मैं ऑर्डर करना चाहता हूँ:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} पीस, ~${(weight * 0.15).toFixed(2)} किलो) — ₹${calcPrice}`
                      : lang === "te"
                        ? `హలో A1 Chicken's, నేను ఆర్డర్ చేయాలనుకుంటున్నాను:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} పీసెస్, ~${(weight * 0.15).toFixed(2)} కిలోలు) — ₹${calcPrice}`
                        : `Hello, I want to order from A1 Chicken's:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} pieces, ~${(weight * 0.15).toFixed(2)} kg) — ₹${calcPrice}`)
                  : (lang === "hi"
                      ? `नमस्ते A1 Chicken's, मैं ऑर्डर करना चाहता हूँ:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} किलो) — ₹${calcPrice}`
                      : lang === "te"
                        ? `హలో A1 Chicken's, నేను ఆర్డర్ చేయాలనుకుంటున్నాను:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} కిలోలు) — ₹${calcPrice}`
                        : `Hello, I want to order from A1 Chicken's:\n• ${getBreedTranslatedName(p.breed || "", lang)} - ${translatedName} (${weight} kg) — ₹${calcPrice}`);

                return (
                  <article
                    key={p.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-3xl bg-card border border-foreground/5 p-4 sm:p-6 shadow-sm hover:shadow-soft transition-all duration-300 gap-4 sm:gap-6"
                  >
                    {/* Left: Details */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-base sm:text-lg font-semibold text-foreground leading-snug">
                          {translatedName}
                        </h3>
                        {p.stock === "limited" && (
                          <span className="bg-warning/15 text-warning-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-warning/20">
                            {lang === "hi" ? "सीमित स्टॉक" : lang === "te" ? "పరిమిత స్టాక్" : "Limited"}
                          </span>
                        )}
                        {p.stock === "out" && (
                          <span className="bg-destructive/15 text-destructive text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-destructive/20">
                            {lang === "hi" ? "स्टॉक में नहीं" : lang === "te" ? "స్టాక్ లేదు" : "Out of Stock"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 max-w-xl leading-relaxed">
                        {translatedDesc}
                      </p>
                      <span className="inline-block text-sm font-extrabold text-primary">
                        {lang === "hi" ? "दर:" : lang === "te" ? "ధర:" : "Rate:"} ₹{p.price}/kg
                      </span>
                    </div>

                    {/* Middle: Stepper */}
                    <div className="flex flex-col items-center gap-1 bg-secondary/60 rounded-2xl p-2 border border-foreground/5 w-full sm:w-auto sm:min-w-[170px]">
                      <span className="text-xs font-semibold text-foreground/75 uppercase tracking-wider">
                        {t.selectQuantity}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setCardWeights((prev) => {
                              const current = prev[p.id] !== undefined ? prev[p.id] : defaultQty;
                              const next = isLegs
                                ? Math.max(1, current - 1)
                                : Math.max(0.5, Number((current - 0.5).toFixed(1)));
                              return { ...prev, [p.id]: next };
                            })
                          }
                          className="size-8 rounded-xl bg-card border hover:bg-secondary flex items-center justify-center font-bold text-foreground transition active:scale-90"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <div className="w-20 text-center flex flex-col justify-center">
                          <span className="text-sm font-bold text-foreground leading-none">
                            {weight} {isLegs ? (lang === "hi" ? "पीस" : lang === "te" ? "పీస్" : "pcs") : "kg"}
                          </span>
                          {isLegs && (
                            <span className="text-xs font-normal text-foreground/70 mt-0.5">
                              {weightLabel}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCardWeights((prev) => {
                              const current = prev[p.id] !== undefined ? prev[p.id] : defaultQty;
                              const next = isLegs
                                ? current + 1
                                : Number((current + 0.5).toFixed(1));
                              return { ...prev, [p.id]: next };
                            })
                          }
                          className="size-8 rounded-xl bg-card border hover:bg-secondary flex items-center justify-center font-bold text-foreground transition active:scale-90"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Right: Calculations & CTA */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block leading-none">
                          {t.totalLabel}
                        </span>
                        <div
                          className={`font-display text-3xl text-primary mt-1 transition-all duration-300 ${flashClass}`}
                        >
                          ₹{calcPrice}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={waLink(textMsg)}
                          target="_blank"
                          rel="noreferrer"
                          className="grid place-items-center size-10 rounded-full bg-whatsapp text-white hover:opacity-90 transition shadow-sm"
                          aria-label="Order on WhatsApp"
                        >
                          <WhatsAppIcon className="size-4 fill-white" />
                        </a>
                        <button
                          disabled={p.stock === "out"}
                          onClick={() => onAdd(p, weight)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-5 h-10 text-xs font-bold disabled:opacity-40 hover:opacity-90 transition shadow-sm active:scale-95"
                        >
                          <Plus className="size-4" /> {t.addToCart}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filteredCuts.length === 0 && (
            <p className="text-center text-muted-foreground mt-12 py-8 bg-card rounded-3xl border border-dashed border-foreground/10 animate-fade-in">
              {t.noCutsFound}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function BulkOrders({
  livePrices,
  lang,
  bulkDiscounts,
}: {
  livePrices: {
    tender: { government: number; withoutCutting: number; withCutting: number };
    standard: { government: number; withoutCutting: number; withCutting: number };
    nattuKodi: { government: number; withoutCutting: number; withCutting: number };
  };
  lang: "en" | "hi" | "te";
  bulkDiscounts: {
    tier1Discount: number;
    tier2Discount: number;
    tier3Discount: number;
    tier4Discount: number;
    tier5Discount: number;
  };
}) {
  const [qty, setQty] = useState(25);
  const [chickenType, setChickenType] = useState<"tender" | "standard" | "nattuKodi">("tender");
  const [cutOption, setCutOption] = useState<"withoutCutting" | "withCutting">("withoutCutting");
  const t = TRANSLATIONS[lang];

  const baseRetail = livePrices[chickenType][cutOption];

  let discountPerKg = 0;
  if (qty >= 15 && qty < 30) {
    discountPerKg = bulkDiscounts.tier1Discount;
  } else if (qty >= 30 && qty < 50) {
    discountPerKg = bulkDiscounts.tier2Discount;
  } else if (qty >= 50 && qty < 80) {
    discountPerKg = bulkDiscounts.tier3Discount;
  } else if (qty >= 80 && qty < 120) {
    discountPerKg = bulkDiscounts.tier4Discount;
  } else if (qty >= 120) {
    discountPerKg = bulkDiscounts.tier5Discount;
  }

  const wholesalePrice = baseRetail - discountPerKg;
  const retailTotal = baseRetail * qty;
  const wholesaleTotal = wholesalePrice * qty;
  const savings = retailTotal - wholesaleTotal;

  const typeLabels = {
    tender: t.tenderBroilerCardTitle,
    standard: t.standardBroilerCardTitle,
    nattuKodi: t.nattuKodiCardTitle,
  };

  const cutLabels = {
    withoutCutting: t.withoutCutting,
    withCutting: t.withCutting,
  };

  const bulkMsg = lang === "hi"
    ? `नमस्ते A1 Chicken's, मैं शादी/रेस्टोरेंट के लिए थोक ऑर्डर (Bulk Order) की पूछताछ करना चाहता हूँ:\n` +
      `• उत्पाद: ${typeLabels[chickenType]} (${cutLabels[cutOption]})\n` +
      `• मात्रा: ${qty} किलोग्राम\n` +
      `• खुदरा दर: ₹${baseRetail}/किलोग्राम\n` +
      `• थोक छूट लागू: -₹${discountPerKg}/किलोग्राम\n` +
      `• अंतिम थोक दर: ₹${wholesalePrice}/किलोग्राम\n` +
      `• अनुमानित कुल: ₹${wholesaleTotal}\n` +
      `• अनुमानित बचत: ₹${savings}\n\n` +
      `कृपया डिलीवरी समय और थोक कोड की पुष्टि करें। धन्यवाद!`
    : lang === "te"
      ? `హలో A1 Chicken's, నేను ఫంక్షన్/రెస్టారెంట్ కొరకు బల్క్ ఆర్డర్ (Bulk Order) గురించి సంప్రదించాలనుకుంటున్నాను:\n` +
        `• ఉత్పత్తి: ${typeLabels[chickenType]} (${cutLabels[cutOption]})\n` +
        `• పరిమాణం: ${qty} కిలోలు\n` +
        `• సాధారణ రిటైల్ ధర: ₹${baseRetail}/కిలో\n` +
        `• హోల్‌సేల్ డిస్కౌంట్ వర్తించినది: -₹${discountPerKg}/కిలో\n` +
        `• నెట్ హోల్‌సేల్ ధర: ₹${wholesalePrice}/కిలో\n` +
        `• అంచనా వేసిన మొత్తం: ₹${wholesaleTotal}\n` +
        `• అంచనా వేసిన పొదుపు: ₹${savings}\n\n` +
        `దయచేసి డెలివరీ సమయం మరియు డిస్కౌంట్ కోడ్‌ను నిర్ధారించండి. ధన్యవాదాలు!`
      : `Hello A1 Chicken's, I want to inquire about a Bulk Order for a function/restaurant:\n` +
        `• Product: ${typeLabels[chickenType]} (${cutLabels[cutOption]})\n` +
        `• Quantity: ${qty} kg\n` +
        `• Live Retail Rate: ₹${baseRetail}/kg\n` +
        `• Wholesale Discount Applied: -₹${discountPerKg}/kg\n` +
        `• Final Wholesale Rate: ₹${wholesalePrice}/kg\n` +
        `• Estimated Total: ₹${wholesaleTotal}\n` +
        `• Estimated Savings: ₹${savings}\n\n` +
        `Please confirm the delivery slot and discount code. Thank you!`;

  return (
    <section id="bulk" className="bg-secondary/35 border-y border-foreground/5 py-24 w-full">
      <div className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto">
        <SectionHeading
          eyebrow={t.bulkEyebrow}
          title={t.bulkTitle}
          sub={t.bulkSub}
        />

        <div className="mt-12 grid lg:grid-cols-12 gap-12 items-start">
          {/* Left: Wholesale Pricing Tiers */}
          <div className="lg:col-span-5 space-y-8">
            <div className="rounded-3xl border border-foreground/5 bg-card p-8 shadow-sm space-y-6">
              <h3 className="font-display text-3xl uppercase tracking-wider text-primary leading-tight">
                {t.wholesalePricingTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.wholesalePricingDesc}
              </p>

              <div className="space-y-4">
                {[
                  {
                    range: t.tier1Range,
                    discount: lang === "hi" 
                      ? `बचत ₹${bulkDiscounts.tier1Discount} / किलो` 
                      : lang === "te" 
                        ? `కిలోపై ₹${bulkDiscounts.tier1Discount} ఆదా` 
                        : `Save ₹${bulkDiscounts.tier1Discount} / kg`,
                    desc: t.tier1Desc,
                  },
                  {
                    range: t.tier2Range,
                    discount: lang === "hi" 
                      ? `बचत ₹${bulkDiscounts.tier2Discount} / किलो` 
                      : lang === "te" 
                        ? `కిలోపై ₹${bulkDiscounts.tier2Discount} ఆదా` 
                        : `Save ₹${bulkDiscounts.tier2Discount} / kg`,
                    desc: t.tier2Desc,
                  },
                  {
                    range: t.tier3Range,
                    discount: lang === "hi" 
                      ? `बचत ₹${bulkDiscounts.tier3Discount} / किलो` 
                      : lang === "te" 
                        ? `కిలోపై ₹${bulkDiscounts.tier3Discount} ఆదా` 
                        : `Save ₹${bulkDiscounts.tier3Discount} / kg`,
                    desc: t.tier3Desc,
                  },
                  {
                    range: t.tier4Range,
                    discount: lang === "hi" 
                      ? `बचत ₹${bulkDiscounts.tier4Discount} / किलो` 
                      : lang === "te" 
                        ? `కిలోపై ₹${bulkDiscounts.tier4Discount} ఆదా` 
                        : `Save ₹${bulkDiscounts.tier4Discount} / kg`,
                    desc: t.tier4Desc,
                  },
                  {
                    range: t.tier5Range,
                    discount: lang === "hi" 
                      ? `बचत ₹${bulkDiscounts.tier5Discount} / किलो` 
                      : lang === "te" 
                        ? `కిలోపై ₹${bulkDiscounts.tier5Discount} ఆదా` 
                        : `Save ₹${bulkDiscounts.tier5Discount} / kg`,
                    desc: t.tier5Desc,
                  },
                ].map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4.5 rounded-2xl bg-secondary/65 border border-foreground/5"
                  >
                    <div>
                      <div className="font-bold text-base text-foreground">{tier.range}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{tier.desc}</div>
                    </div>
                    <span className="font-display text-2xl text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-xl whitespace-nowrap">
                      {tier.discount}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                  <Truck className="size-5 text-primary shrink-0" />
                  <span>{t.priorityDeliveryText}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                  <Award className="size-5 text-primary shrink-0" />
                  <span>{t.customCutsText}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                  <ShieldCheck className="size-5 text-primary shrink-0" />
                  <span>{t.halalText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Live Estimator */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-primary/10 bg-card p-8 lg:p-10 shadow-soft space-y-8 relative overflow-hidden ring-4 ring-primary/5">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs uppercase font-bold tracking-widest px-4 py-1.5 rounded-bl-3xl">
                {lang === "hi" ? "लाइव कैलकुलेटर" : lang === "te" ? "లైవ్ కాలిక్యులేటర్" : "Live Estimator"}
              </div>

              <div>
                <h3 className="font-display text-3xl tracking-wide md:text-4xl leading-tight">
                  {t.estimatorTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {t.estimatorSub}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
                  {t.estimSelectType}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { value: "tender", label: t.tenderBroiler },
                      { value: "standard", label: t.standardBroiler },
                      { value: "nattuKodi", label: t.nattuKodi },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setChickenType(item.value)}
                      className={`rounded-2xl py-4 text-xs font-bold border transition ${
                        chickenType === item.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-secondary/80 border-foreground/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">
                  {t.estimChooseCut}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "withoutCutting", label: t.withoutCutting },
                      { value: "withCutting", label: lang === "hi" ? "कटिंग के साथ (करी / कस्टम)" : lang === "te" ? "కటింగ్‌తో (కూర / కస్టమ్)" : "With Cutting (Curry / Custom)" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCutOption(item.value)}
                      className={`rounded-2xl py-4 text-xs font-bold border transition ${
                        cutOption === item.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary hover:bg-secondary/80 border-foreground/5"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t.estimEnterQty}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 text-center font-display text-2xl rounded-2xl border border-foreground/10 bg-secondary py-2 outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <span className="text-sm font-bold text-muted-foreground">kg</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 py-2">
                  <input
                    type="range"
                    min="5"
                    max="250"
                    step="5"
                    value={qty > 250 ? 250 : qty}
                    onChange={(e) => setQty(parseInt(e.target.value))}
                    className="flex-1 accent-primary h-2.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {lang === "hi" ? "सीमा: 5 किग्रा – 250 किग्रा+" : lang === "te" ? "శ్రేణి: 5 కిలోలు – 250 కిలోలు+" : "Range: 5kg – 250kg+"}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-secondary/80 border border-foreground/5 p-5 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                  <span>{t.retailPrice}:</span>
                  <span className="text-foreground">₹{baseRetail} / kg</span>
                </div>

                {qty < 15 ? (
                  <div className="flex justify-between items-center text-sm font-bold text-warning">
                    <span>{t.bulkDiscountApplied}:</span>
                    <span>{t.noDiscountText}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm font-bold text-success">
                    <span>{t.bulkDiscountApplied}:</span>
                    <span>-₹{discountPerKg} / kg</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-bold text-foreground border-b pb-3">
                  <span>{t.netWholesaleRate}:</span>
                  <span className="text-primary text-base font-extrabold">
                    ₹{wholesalePrice} / kg
                  </span>
                </div>

                <div className="flex justify-between items-end pt-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t.estWholesaleTotal}
                    </div>
                    {savings > 0 && (
                      <div className="text-xs font-bold text-success mt-1 text-emerald-600">
                        {lang === "hi" ? `★ आप रिटेल से ₹${savings} बचा रहे हैं!` : lang === "te" ? `★ మీరు రిటైల్ కంటే ₹${savings} ఆదా చేస్తున్నారు!` : `★ You save ₹${savings} off retail!`}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-display text-5xl font-extrabold text-primary leading-none">
                      ₹{wholesaleTotal}
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={waLink(bulkMsg)}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-whatsapp text-white py-4.5 font-bold shadow-soft hover:opacity-95 transition"
              >
                <WhatsAppIcon className="size-5 fill-white" /> {t.inquireBulkWaBtn}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Offers({
  cart,
  onAdd,
  products,
  onOpenCart,
  lang,
}: {
  cart: CartItem[];
  onAdd: (p: Product, qty: number) => void;
  products: Product[];
  onOpenCart: () => void;
  lang: "en" | "hi" | "te";
}) {
  const t = TRANSLATIONS[lang];
  const subtotal = cart.reduce(
    (s, i) =>
      s +
      (i.product.id.includes("legs") ? i.product.price * i.qty * 0.15 : i.product.price * i.qty),
    0,
  );

  // 1. Buy 2 kg, Save ₹20 on curry cut (scalable loop: ₹20 for every 2 kg)
  const curryCutItems = cart.filter(
    (i) =>
      i.product.name.toLowerCase().includes("curry cut") ||
      i.product.name.toLowerCase().includes("normal cut"),
  );
  const curryCutQty = curryCutItems.reduce((s, i) => s + i.qty, 0);
  const isCurryCutApplied = curryCutQty >= 2;
  const curryCutDiscount = Math.floor(curryCutQty / 2) * 20;

  // 2. Sunday Special: Free delivery above 500
  const isFreeDeliveryApplied = subtotal >= 500;

  // 3. Festival Combo: 1 kg curry-cut + 500g wings — ₹320
  const hasCurryCut1Kg = cart.some(
    (i) =>
      (i.product.name.toLowerCase().includes("curry cut") ||
        i.product.name.toLowerCase().includes("normal cut")) &&
      i.qty >= 1,
  );
  const hasWings500g = cart.some((i) => i.product.name.toLowerCase().includes("wings") && i.qty >= 0.5);
  const isComboApplied = hasCurryCut1Kg && hasWings500g;

  // Function to handle auto-add for Offer 1: Buy 2 kg Curry Cut
  const addCurryCutOffer = () => {
    const targetProduct = products.find((p) => p.id === "small-skinless-normal");
    if (targetProduct) {
      const diff = Math.max(0.5, 2 - curryCutQty);
      onAdd(targetProduct, diff);
    }
  };

  // Function to handle auto-add for Offer 3: Festival Combo
  const addFestivalCombo = () => {
    const curryCutProduct = products.find((p) => p.id === "small-skinless-normal");
    const wingsProduct = products.find((p) => p.id === "small-skinless-wings");

    if (curryCutProduct) {
      const currentCc = cart.find(
        (i) =>
          i.product.name.toLowerCase().includes("curry cut") ||
          i.product.name.toLowerCase().includes("normal cut"),
      );
      const diff = currentCc ? Math.max(0, 1 - currentCc.qty) : 1;
      if (diff > 0) {
        onAdd(curryCutProduct, diff);
      }
    }
    if (wingsProduct) {
      const currentWings = cart.find((i) => i.product.name.toLowerCase().includes("wings"));
      const diff = currentWings ? Math.max(0, 0.5 - currentWings.qty) : 0.5;
      if (diff > 0) {
        onAdd(wingsProduct, diff);
      }
    }
  };

  return (
    <section
      id="offers"
      className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto py-16"
    >
      <SectionHeading
        eyebrow={t.dealsEyebrow}
        title={t.dealsTitle}
        sub={t.dealsSub}
      />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Offer 1: Buy 2 kg, Save ₹20 */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.45_0.2_27)] text-primary-foreground p-6 shadow-soft flex flex-col justify-between min-h-[240px]">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-2xl group-hover:bg-accent/50 transition" />
          <div>
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {t.dailyTag}
            </span>
            <h3 className="mt-4 font-display text-3xl leading-tight">{t.buy2kgSave20Title}</h3>
            <p className="mt-2 text-sm opacity-90">{t.buy2kgSave20Sub}</p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            {isCurryCutApplied ? (
              <button
                type="button"
                onClick={onOpenCart}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-emerald-600 transition cursor-pointer animate-pulse"
              >
                🎉 {t.offerActive} (-₹{curryCutDiscount})! {t.viewInCart}
              </button>
            ) : (
              <button
                type="button"
                onClick={addCurryCutOffer}
                className="inline-flex items-center gap-1.5 rounded-full bg-background text-foreground px-4 py-2 text-xs font-semibold hover:bg-accent transition shadow-sm cursor-pointer"
              >
                🛒 {t.add2kgBtn}
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center justify-center size-9 rounded-full bg-black/20 hover:bg-black/35 text-white transition cursor-pointer"
              title={t.viewInCart}
            >
              <ShoppingCart className="size-4" />
            </button>
          </div>
        </div>

        {/* Offer 2: Sunday Special */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.45_0.2_27)] text-primary-foreground p-6 shadow-soft flex flex-col justify-between min-h-[240px]">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-2xl group-hover:bg-accent/50 transition" />
          <div>
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {t.weeklyTag}
            </span>
            <h3 className="mt-4 font-display text-3xl leading-tight">{t.sundaySpecialTitle}</h3>
            <p className="mt-2 text-sm opacity-90">{t.sundaySpecialSub}</p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            {isFreeDeliveryApplied ? (
              <button
                type="button"
                onClick={onOpenCart}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-emerald-600 transition cursor-pointer animate-pulse"
              >
                🎉 {t.freeDeliveryActive}! {t.viewInCart}
              </button>
            ) : cart.length > 0 ? (
              <span className="inline-flex items-center gap-1 bg-white/10 text-white px-4 py-2 rounded-full text-xs font-semibold">
                {lang === "hi" ? `योग्य होने के लिए ₹${500 - Math.round(subtotal)} और जोड़ें` : lang === "te" ? `అర్హత పొందడానికి మరో ₹${500 - Math.round(subtotal)} జోడించండి` : `Add ₹${500 - Math.round(subtotal)} more to qualify`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-white/10 text-white px-4 py-2 rounded-full text-xs font-semibold">
                {t.spendMoreForFree}
              </span>
            )}
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center justify-center size-9 rounded-full bg-black/20 hover:bg-black/35 text-white transition cursor-pointer"
              title={t.viewInCart}
            >
              <ShoppingCart className="size-4" />
            </button>
          </div>
        </div>

        {/* Offer 3: Festival Combo */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.45_0.2_27)] text-primary-foreground p-6 shadow-soft flex flex-col justify-between min-h-[240px]">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-2xl group-hover:bg-accent/50 transition" />
          <div>
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              {t.comboTag}
            </span>
            <h3 className="mt-4 font-display text-3xl leading-tight">{t.festivalComboTitle}</h3>
            <p className="mt-2 text-sm opacity-90">{t.festivalComboSub}</p>
          </div>
          <div className="mt-5 flex items-center gap-2">
            {isComboApplied ? (
              <button
                type="button"
                onClick={onOpenCart}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-emerald-600 transition cursor-pointer animate-pulse"
              >
                🎉 {t.offerActive}! {t.viewInCart}
              </button>
            ) : (
              <button
                type="button"
                onClick={addFestivalCombo}
                className="inline-flex items-center gap-1.5 rounded-full bg-background text-foreground px-4 py-2 text-xs font-semibold hover:bg-accent transition shadow-sm cursor-pointer"
              >
                🛒 {t.addComboBtn}
              </button>
            )}
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center justify-center size-9 rounded-full bg-black/20 hover:bg-black/35 text-white transition cursor-pointer"
              title={t.viewInCart}
            >
              <ShoppingCart className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ lang, user }: { lang: "en" | "hi" | "te"; user: FirebaseUser | null }) {
  const t = TRANSLATIONS[lang];
  const defaultReviews = REVIEWS_TRANSLATIONS[lang];

  const [customReviews, setCustomReviews] = useState<{ name: string; rating: number; text: string }[]>([]);
  const [firebaseReviews, setFirebaseReviews] = useState<{ name: string; rating: number; text: string }[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user && !name) {
      setName(user.displayName || user.email?.split("@")[0] || "");
    }
  }, [user]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // 1. Fetch from Firebase
    fetchFirebaseReviews().then((fbReviews) => {
      if (fbReviews && fbReviews.length > 0) {
        setFirebaseReviews(fbReviews);
      }
    });

    // 2. Load from localStorage
    try {
      const stored = localStorage.getItem("user_reviews");
      if (stored) {
        setCustomReviews(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading stored reviews", e);
    }
  }, []);

  const reviewsList = useMemo(() => {
    // Combine and deduplicate
    const combined = [...defaultReviews, ...firebaseReviews, ...customReviews];
    const unique = combined.filter(
      (v, i, a) => a.findIndex((t) => t.name.toLowerCase() === v.name.toLowerCase() && t.text.toLowerCase() === v.text.toLowerCase()) === i
    );
    return unique;
  }, [defaultReviews, firebaseReviews, customReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const newReview = { name: name.trim(), rating, text: text.trim() };
    
    // Save to LocalStorage immediately for instant feedback
    const updated = [newReview, ...customReviews];
    setCustomReviews(updated);
    localStorage.setItem("user_reviews", JSON.stringify(updated));

    // Try saving to Firebase Firestore
    const savedToFirebase = await saveFirebaseReview(newReview);
    if (savedToFirebase) {
      // Re-fetch reviews to sync
      const fbReviews = await fetchFirebaseReviews();
      if (fbReviews && fbReviews.length > 0) {
        setFirebaseReviews(fbReviews);
      }
    }

    setName("");
    setRating(5);
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="reviews" className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto py-16">
      <SectionHeading eyebrow={t.reviewsEyebrow} title={t.reviewsTitle} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {/* Testimonials List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {reviewsList.map((r, idx) => (
              <div
                key={`${r.name}-${idx}`}
                className="rounded-3xl bg-card border border-foreground/5 p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-0.5 text-accent mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${i < r.rating ? "fill-current" : "opacity-30"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm italic text-foreground/90">"{r.text}"</p>
                </div>
                <div className="mt-4 text-xs font-semibold text-muted-foreground">— {r.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Write a Review Form */}
        <div className="rounded-3xl bg-card border border-foreground/5 p-6 shadow-sm hover:shadow-md transition duration-300">
          <h3 className="font-display text-xl mb-4 text-foreground font-semibold flex items-center gap-2">
            <Sparkles className="size-5 text-accent animate-pulse" />
            {t.writeReviewTitle}
          </h3>
          
          {submitted ? (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {t.reviewSuccessMsg}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  {t.reviewRatingLabel}
                </label>
                <div className="flex gap-1.5 items-center">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-0.5 transition hover:scale-110 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`size-6 ${
                            starVal <= (hoverRating ?? rating)
                              ? "fill-accent text-accent"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.reviewNamePlaceholder}
                  className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>

              <div>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.reviewTextPlaceholder}
                  className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition shadow-sm cursor-pointer hover:shadow"
              >
                {t.submitReviewBtn}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function FAQ({ lang }: { lang: "en" | "hi" | "te" }) {
  const [open, setOpen] = useState<number | null>(0);
  const t = TRANSLATIONS[lang];
  const faqsList = FAQ_TRANSLATIONS[lang];

  return (
    <section className="bg-secondary/50 border-y border-foreground/5 w-full">
      <div className="w-full max-w-5xl px-4 sm:px-12 lg:px-16 mx-auto py-16">
        <SectionHeading eyebrow={t.faqEyebrow} title={t.faqTitle} />
        <div className="mt-8 space-y-2">
          {faqsList.map((f, i) => (
            <button
              key={f.q}
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left rounded-2xl bg-card border border-foreground/5 p-5 hover:border-primary/40 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold">{f.q}</span>
                <ChevronDown
                  className={`size-4 transition ${open === i ? "rotate-180 text-primary" : ""}`}
                />
              </div>
              {open === i && <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ lang }: { lang: "en" | "hi" | "te" }) {
  const t = TRANSLATIONS[lang];
  const hoursVal = lang === "hi"
    ? "सुबह 6:30 – रात 9:30, रोजाना"
    : lang === "te"
      ? "ఉదయం 6:30 – రాత్రి 9:30, ప్రతిరోజూ"
      : SHOP.hours;

  return (
    <section
      id="contact"
      className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto py-16"
    >
      <SectionHeading eyebrow={t.contactEyebrow} title={t.contactTitle} />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-card border border-foreground/5 p-6 shadow-sm space-y-4">
          <Row icon={MapPin} title={t.addressLabel} value={SHOP.address} />
          <Row
            icon={Phone}
            title={t.callLabel}
            value={SHOP.phone}
            href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
          />
          <Row
            icon={WhatsAppIcon}
            title={t.whatsappLabel}
            value={"+" + SHOP.whatsapp}
            href={waLink(t.contactWhatsAppPrefill)}
          />
          <Row icon={Clock} title={t.businessHoursLabel} value={hoursVal} />
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
            >
              <Phone className="size-4" /> {t.callNowBtn}
            </a>
            <a
              href={waLink(t.contactWhatsAppPrefill)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-4 py-2 text-sm font-semibold"
            >
              <WhatsAppIcon className="size-4 fill-white" /> {t.whatsappLabel}
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold"
            >
              <MapPin className="size-4" /> {t.directionsBtn}
            </a>
          </div>
        </div>
        <div className="aspect-video md:aspect-auto rounded-3xl overflow-hidden border border-foreground/5 shadow-sm">
          <iframe
            title="Shop location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(SHOP.address)}&output=embed`}
            className="size-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function Row({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <div className="size-9 grid place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:opacity-80 transition">
      {inner}
    </a>
  ) : (
    inner
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className="text-sm sm:text-base md:text-lg font-black uppercase tracking-[0.2em] text-primary leading-snug">
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-balance leading-tight text-foreground">
        {title}
      </h2>
      {sub && (
        <p
          className={`mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl leading-relaxed ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function Footer({ lang }: { lang: "en" | "hi" | "te" }) {
  const t = TRANSLATIONS[lang];
  const hoursVal = lang === "hi"
    ? "सुबह 6:30 – रात 9:30, रोजाना"
    : lang === "te"
      ? "ఉదయం 6:30 – రాత్రి 9:30, ప్రతిరోజూ"
      : SHOP.hours;
  const descVal = lang === "hi"
    ? "ताजा चिकन, सही वजन, अच्छी सेवा — हर एक दिन।"
    : lang === "te"
      ? "తాజా చికెన్, సరైన బరువు, మంచి సేవ — ప్రతిరోజూ."
      : "Fresh chicken, fair weight, friendly service — every single day.";
  const rightsReserved = lang === "hi"
    ? "सर्वाधिकार सुरक्षित।"
    : lang === "te"
      ? "అన్ని హక్కులు ప్రత్యేకించబడినవి."
      : "All rights reserved.";

  return (
    <footer className="bg-foreground text-background w-full">
      <div className="w-full max-w-full px-4 sm:px-12 lg:px-16 xl:px-24 mx-auto py-10 grid sm:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="font-display text-2xl">{SHOP.name}</div>
          <p className="opacity-70 mt-2">
            {descVal}
          </p>
        </div>
        <div>
          <div className="font-semibold mb-2">{lang === "hi" ? "त्वरित लिंक" : lang === "te" ? "త్వరిత లింకులు" : "Quick Links"}</div>
          <ul className="space-y-1 opacity-80 font-medium">
            <li>
              <a href="#prices">{t.pricing}</a>
            </li>
            <li>
              <a href="#products">{t.shop}</a>
            </li>
            <li>
              <a href="#bulk">{t.bulk}</a>
            </li>
            <li>
              <a href="#offers">{t.offers}</a>
            </li>
            <li>
              <a href="#reviews">{t.reviewsNav}</a>
            </li>
            <li>
              <a href="#contact">{t.contact}</a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">{t.contact}</div>
          <p className="opacity-80">{SHOP.address}</p>
          <p className="opacity-80 mt-1">{SHOP.phone}</p>
          <p className="opacity-80">{hoursVal}</p>
        </div>
      </div>
      <div className="border-t border-background/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {SHOP.name}. {rightsReserved}
      </div>
    </footer>
  );
}

function CartDrawer({
  items,
  onClose,
  onRemove,
  onQty,
  onClearCart,
  lang,
  user,
  onAuthRequired,
  onTrackOrders,
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onQty: (id: string, q: number) => void;
  onClearCart: () => void;
  lang: "en" | "hi" | "te";
  user: FirebaseUser | null;
  onAuthRequired: () => void;
  onTrackOrders?: () => void;
}) {
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">("delivery");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "payment" | "gateway" | "success">("cart");
  const t = TRANSLATIONS[lang];

  // Lock background scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Customer states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | "new">("new");

  useEffect(() => {
    if (user) {
      if (user.displayName && !customerName) {
        setCustomerName(user.displayName);
      } else if (user.email && !customerName) {
        setCustomerName(user.email.split("@")[0]);
      }
      if (user.phoneNumber && !customerPhone) {
        setCustomerPhone(user.phoneNumber);
      }

      fetchUserAddresses(user.uid).then((addrs) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddressIndex(0);
          setCustomerAddress(addrs[0]);
        } else {
          setSelectedAddressIndex("new");
          setCustomerAddress("");
        }
      });
    } else {
      setSavedAddresses([]);
      setSelectedAddressIndex("new");
    }
  }, [user]);

  // Payment states
  const [paymentOption, setPaymentOption] = useState<"online" | "cod">("online");
  const [selectedMethod, setSelectedMethod] = useState<"UPI" | "Card" | "QR">("UPI");

  // Simulated gateway states
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = items.reduce(
    (s, i) =>
      s +
      (i.product.id.includes("legs") ? i.product.price * i.qty * 0.15 : i.product.price * i.qty),
    0,
  );

  // Offers loop calculations
  const curryCutItems = items.filter(
    (i) =>
      i.product.name.toLowerCase().includes("curry cut") ||
      i.product.name.toLowerCase().includes("normal cut"),
  );
  const curryCutQty = curryCutItems.reduce((s, i) => s + i.qty, 0);
  const isCurryCutApplied = curryCutQty >= 2;
  const curryCutDiscount = Math.floor(curryCutQty / 2) * 20;

  const hasCurryCut1Kg = items.some(
    (i) =>
      (i.product.name.toLowerCase().includes("curry cut") ||
        i.product.name.toLowerCase().includes("normal cut")) &&
      i.qty >= 1,
  );
  const hasWings500g = items.some((i) => i.product.name.toLowerCase().includes("wings") && i.qty >= 0.5);
  const isComboApplied = hasCurryCut1Kg && hasWings500g;

  let comboDiscount = 0;
  if (isComboApplied) {
    const ccItem = items.find(
      (i) =>
        (i.product.name.toLowerCase().includes("curry cut") ||
          i.product.name.toLowerCase().includes("normal cut")) &&
        i.qty >= 1,
    );
    const wingsItem = items.find((i) => i.product.name.toLowerCase().includes("wings") && i.qty >= 0.5);
    if (ccItem && wingsItem) {
      const regularCcPrice = ccItem.product.price;
      const regularWingsPrice = wingsItem.product.price * 0.5;
      const normalComboTotal = regularCcPrice + regularWingsPrice;
      if (normalComboTotal > 320) {
        comboDiscount = normalComboTotal - 320;
      }
    }
  }

  const discountAmount = curryCutDiscount + comboDiscount;
  const finalSubtotal = Math.max(0, subtotal - discountAmount);

  const isFreeDeliveryApplied = finalSubtotal >= 500;
  const deliveryCharge = deliveryMethod === "delivery" ? (isFreeDeliveryApplied ? 0 : 5) : 0;
  const grandTotal = finalSubtotal + deliveryCharge;

  // Advance online payment is ₹10 for self-pickup, full amount or COD for delivery
  const advanceRequired = deliveryMethod === "pickup" ? 10 : (paymentOption === "cod" ? 5 : grandTotal);
  const finalAdvance = items.length ? Math.min(grandTotal, advanceRequired) : 0;
  const balanceDue = items.length ? Math.max(0, grandTotal - finalAdvance) : 0;

  const pickupTimeStr = useMemo(() => {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 25);
    return time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  }, []);

  const handleNextStep = () => {
    if (checkoutStep === "cart") {
      if (!user) {
        onAuthRequired();
        return;
      }
      setCheckoutStep("details");
    } else if (checkoutStep === "details") {
      if (!customerName.trim() || !customerPhone.trim()) return;
      if (deliveryMethod === "delivery" && !customerAddress.trim()) return;
      setCheckoutStep("payment");
    } else if (checkoutStep === "payment") {
      if (deliveryMethod === "delivery" && paymentOption === "cod" && finalAdvance === 0) {
        // Cash on delivery bypasses payment gateway only if no advance is required!
        placeOrder("COD", "Pending");
      } else {
        setCheckoutStep("gateway");
      }
    }
  };

  const handleBackStep = () => {
    if (checkoutStep === "details") setCheckoutStep("cart");
    else if (checkoutStep === "payment") setCheckoutStep("details");
    else if (checkoutStep === "gateway") setCheckoutStep("payment");
  };

  const handleSimulatedPayment = () => {
    if (selectedMethod === "Card") {
      if (cardNum.replace(/\s/g, "").length < 16 || !cardExpiry || cardCvv.length < 3) return;
    } else if (selectedMethod === "UPI") {
      if (!upiId.trim() || !upiId.includes("@")) return;
    }
    
    const isCodAdvance = deliveryMethod === "delivery" && paymentOption === "cod";
    const paymentStatus = (deliveryMethod === "pickup" || isCodAdvance) ? "Advance Paid" : "Paid";
    const paymentMethodToSave = isCodAdvance ? "COD" : selectedMethod;
    placeOrder(paymentMethodToSave, paymentStatus);
  };

  const placeOrder = async (method: "UPI" | "Card" | "QR" | "COD", payStatus: "Paid" | "Advance Paid" | "Pending") => {
    setIsPlacingOrder(true);

    const orderItems = items.map((i) => ({
      id: i.product.id,
      name: i.product.name,
      qty: i.qty,
      price: i.product.price,
      unit: i.product.unit,
      breed: i.product.breed || "",
      style: i.product.style || "",
    }));

    const orderData = {
      userId: user?.uid || "",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryMethod,
      deliveryAddress: deliveryMethod === "delivery" ? customerAddress.trim() : "",
      pickupTime: deliveryMethod === "pickup" ? (pickupTime || pickupTimeStr) : "",
      paymentMethod: method,
      paymentStatus: payStatus,
      subtotal: Math.round(subtotal),
      discount: Math.round(discountAmount),
      deliveryCharge,
      advancePaid: Math.round(finalAdvance),
      balanceDue: Math.round(balanceDue),
      grandTotal: Math.round(grandTotal),
      items: orderItems,
    };

    const savedId = await saveFirestoreOrder(orderData);
    setIsPlacingOrder(false);
    
    if (savedId) {
      // Save address for future use
      if (user && deliveryMethod === "delivery" && customerAddress.trim()) {
        const addr = customerAddress.trim();
        if (selectedAddressIndex === "new") {
          saveUserAddress(user.uid, addr).then(() => {
            fetchUserAddresses(user.uid).then(setSavedAddresses);
          });
        } else {
          const updated = [...savedAddresses];
          updated[selectedAddressIndex] = addr;
          updateUserAddresses(user.uid, updated).then(() => {
            fetchUserAddresses(user.uid).then(setSavedAddresses);
          });
        }
      }

      setOrderId(savedId);
      setCheckoutStep("success");
      onClearCart();
    } else {
      alert("Something went wrong placing your order. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={checkoutStep !== "success" ? onClose : undefined} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl flex flex-col transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            {checkoutStep !== "cart" && checkoutStep !== "success" && (
              <button
                onClick={handleBackStep}
                className="size-8 grid place-items-center rounded-full hover:bg-secondary cursor-pointer"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <div className="font-display text-2xl">
              {checkoutStep === "cart" && t.yourCartTitle}
              {checkoutStep === "details" && t.checkoutDetailsHeader}
              {checkoutStep === "payment" && t.paymentMethodHeader}
              {checkoutStep === "gateway" && t.paymentSimHeader}
              {checkoutStep === "success" && t.orderSuccessTitle}
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-full hover:bg-secondary cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          
          {/* STEP 1: CART VIEW */}
          {checkoutStep === "cart" && (
            <>
              {/* Delivery / Pickup Method Tabs */}
              {items.length > 0 && (
                <div className="mb-4">
                  <div className="flex rounded-xl bg-secondary p-1 border border-foreground/5">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("delivery")}
                      className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        deliveryMethod === "delivery"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🚚 {lang === "hi" ? "होम डिलीवरी" : lang === "te" ? "హోమ్ డెలివరీ" : "Home Delivery"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("pickup")}
                      className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        deliveryMethod === "pickup"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🏪 {lang === "hi" ? "दुकान से लें" : lang === "te" ? "స్వయంగా తీసుకోండి" : "Self-Pickup"}
                    </button>
                  </div>
                </div>
              )}

              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-12">{t.cartEmpty}</p>
              )}

              {items.map((i) => {
                const isLegs = i.product.id.includes("legs");
                const itemPrice = isLegs
                  ? Math.round(i.product.price * i.qty * 0.15)
                  : Math.round(i.product.price * i.qty);
                const unitLabel = i.product.unit === "kg" ? (lang === "hi" ? "किलो" : lang === "te" ? "కిలో" : "kg") : i.product.unit;
                const weightLabel = isLegs ? (lang === "hi" ? `~ ${(i.qty * 0.15).toFixed(2)} किलो` : lang === "te" ? `~ ${(i.qty * 0.15).toFixed(2)} కిలోలు` : `~ ${(i.qty * 0.15).toFixed(2)} kg`) : "";

                return (
                  <div
                    key={i.product.id}
                    className="flex gap-3 rounded-2xl border border-foreground/5 p-3"
                  >
                    <img src={i.product.img} alt="" className="size-16 rounded-xl object-cover shrink-0 bg-secondary" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm leading-snug">{getProductTranslatedName(i.product.name, lang)}</div>
                      
                      {/* Breed & Style Badges */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {i.product.breed && (
                          <span className="inline-block bg-primary/10 text-primary text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-primary/20">
                            {getBreedTranslatedName(i.product.breed, lang)}
                          </span>
                        )}
                        {i.product.style && (
                          <span className="inline-block bg-secondary text-secondary-foreground text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-foreground/5">
                            {i.product.style === "live"
                              ? (lang === "hi" ? "लाइव चिकन" : lang === "te" ? "లైవ్ చికెన్" : "Live Chicken")
                              : i.product.style === "skin"
                                ? (lang === "hi" ? "स्किन के साथ" : lang === "te" ? "స్కిన్‌తో" : "With Skin")
                                : (lang === "hi" ? "बिना स्किन के" : lang === "te" ? "స్కిన్ లేకుండా" : "Skinless")
                            }
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-1">
                        ₹{i.product.price}/{unitLabel}
                      </div>
                      
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          onClick={() =>
                            onQty(
                              i.product.id,
                              isLegs
                                ? Math.max(1, i.qty - 1)
                                : Math.max(0.5, Number((i.qty - 0.5).toFixed(1))),
                            )
                          }
                          className="size-7 rounded-full bg-secondary grid place-items-center active:scale-95 transition"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-20 text-center text-xs font-bold text-foreground">
                          {i.qty} {isLegs ? (lang === "hi" ? "पीस" : lang === "te" ? "పీస్" : "pieces") : "kg"}
                          {isLegs && (
                            <span className="block text-[9px] text-muted-foreground font-normal">
                              {weightLabel}
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() =>
                            onQty(i.product.id, isLegs ? i.qty + 1 : Number((i.qty + 0.5).toFixed(1)))
                          }
                          className="size-7 rounded-full bg-secondary grid place-items-center active:scale-95 transition"
                        >
                          <Plus className="size-3" />
                        </button>
                        <button
                          onClick={() => onRemove(i.product.id)}
                          className="ml-auto text-destructive p-1"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-foreground text-sm">₹{itemPrice}</div>
                  </div>
                );
              })}

              {isCurryCutApplied && (
                <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 animate-fade-in">
                  <div className="size-16 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                    🎁
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-600">{t.buy2kgSave20Title}</div>
                    <div className="text-xs text-emerald-600/80">
                      {t.curryCutOfferSuccess}
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">-₹{curryCutDiscount}</div>
                </div>
              )}

              {isComboApplied && comboDiscount > 0 && (
                <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 animate-fade-in">
                  <div className="size-16 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                    🎁
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-600">{t.festivalComboTitle}</div>
                    <div className="text-xs text-emerald-600/80">
                      {t.comboOfferSuccess}
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">-₹{Math.round(comboDiscount)}</div>
                </div>
              )}

              {isFreeDeliveryApplied && deliveryMethod === "delivery" && (
                <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 animate-fade-in">
                  <div className="size-16 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                    🎁
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-emerald-600">{t.sundaySpecialTitle}</div>
                    <div className="text-xs text-emerald-600/80">
                      {t.deliveryOfferSuccess}
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600">{lang === "hi" ? "मुफ़्त" : lang === "te" ? "ఉచితం" : "Free"}</div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CUSTOMER DETAILS FORM */}
          {checkoutStep === "details" && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {deliveryMethod === "delivery" ? t.deliveryDetailsHeader : t.pickupDetailsHeader}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    {t.customerNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={lang === "hi" ? "अमित कुमार" : lang === "te" ? "రాము" : "John Doe"}
                    className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    {t.customerPhoneLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>

                {deliveryMethod === "delivery" ? (
                  <div className="space-y-3">
                    {savedAddresses.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">
                          {lang === "hi" ? "सहेजा गया पता चुनें" : lang === "te" ? "సేవ్ చేసిన చిరునామాను ఎంచుకోండి" : "Select Saved Address"}
                        </label>
                        <select
                          value={selectedAddressIndex}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "new") {
                              setSelectedAddressIndex("new");
                              setCustomerAddress("");
                            } else {
                              const idx = parseInt(val);
                              setSelectedAddressIndex(idx);
                              setCustomerAddress(savedAddresses[idx]);
                            }
                          }}
                          className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        >
                          {savedAddresses.map((addr, idx) => (
                            <option key={idx} value={idx} className="bg-card text-foreground">
                              {addr.length > 45 ? `${addr.substring(0, 45)}...` : addr}
                            </option>
                          ))}
                          <option value="new" className="bg-card text-foreground font-semibold">
                            {lang === "hi" ? "+ नया पता जोड़ें" : lang === "te" ? "+ కొత్త చిరునామాను జోడించండి" : "+ Add New Address"}
                          </option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">
                        {selectedAddressIndex === "new" 
                          ? (lang === "hi" ? "नया डिलीवरी पता *" : lang === "te" ? "కొత్త డెలివరీ చిరునామా *" : "New Delivery Address *")
                          : (lang === "hi" ? "डिलीवरी पता संपादित / पुष्टि करें *" : lang === "te" ? "చిరునామాను సవరించండి / నిర్ధారించండి *" : "Edit/Confirm Delivery Address *")}
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder={lang === "hi" ? "मकान संख्या, गली का नाम, सेक्टर..." : lang === "te" ? "ఇంటి నంబర్, వీధి పేరు..." : "House No, Street Name, Area..."}
                        className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      {t.pickupTimeLabel}
                    </label>
                    <input
                      type="text"
                      value={pickupTime || pickupTimeStr}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full rounded-2xl border border-foreground/10 bg-background/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                      {lang === "hi" ? "तैयारी का समय लगभग 25 मिनट है।" : lang === "te" ? "తయారీ సమయం సుమారు 25 నిమిషాలు పడుతుంది." : "Standard preparation time is 25 minutes."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD SELECTION */}
          {checkoutStep === "payment" && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t.paymentMethodHeader}
              </h3>

              {deliveryMethod === "delivery" ? (
                <div className="space-y-3">
                  {/* Option 1: Pay Online */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption("online")}
                    className={`w-full text-left rounded-3xl border p-5 transition flex items-center justify-between cursor-pointer ${
                      paymentOption === "online"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-foreground/5 bg-background hover:border-foreground/10"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        💳 {t.payOnlineOption}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pay ₹{Math.round(grandTotal)} using Card, UPI, or QR code.
                      </div>
                    </div>
                    <div className={`size-5 rounded-full border-2 grid place-items-center shrink-0 ${paymentOption === "online" ? "border-primary" : "border-muted-foreground/30"}`}>
                      {paymentOption === "online" && <div className="size-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>

                  {/* Option 2: Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentOption("cod")}
                    className={`w-full text-left rounded-3xl border p-5 transition flex items-center justify-between cursor-pointer ${
                      paymentOption === "cod"
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-foreground/5 bg-background hover:border-foreground/10"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        💵 {t.codOption}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pay full amount in cash or online at your doorstep.
                      </div>
                    </div>
                    <div className={`size-5 rounded-full border-2 grid place-items-center shrink-0 ${paymentOption === "cod" ? "border-primary" : "border-muted-foreground/30"}`}>
                      {paymentOption === "cod" && <div className="size-2.5 rounded-full bg-primary" />}
                    </div>
                  </button>
                </div>
              ) : (
                /* Self pickup requires ₹10 advance payment */
                <div className="space-y-3">
                  <div className="rounded-3xl bg-primary/5 border border-primary/20 p-5 space-y-2">
                    <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                      🔐 {t.payAdvanceOption} Required
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      To confirm your self-pickup order, a small advance payment of **₹10** is required online. Pay the remaining amount at the counter via cash or UPI.
                    </p>
                  </div>
                </div>
              )}

              {/* Online payment methods tabs */}
              {(deliveryMethod === "pickup" || paymentOption === "online") && (
                <div className="pt-2 animate-fadeIn space-y-3">
                  <label className="block text-xs font-semibold text-muted-foreground">
                    Choose Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("UPI")}
                      className={`py-3 rounded-2xl border text-center text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === "UPI"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-foreground/5 bg-background hover:border-foreground/10 text-muted-foreground"
                      }`}
                    >
                      <Sparkles className="size-4 shrink-0" />
                      <span>{t.upiLabel.split(" ")[0]}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("Card")}
                      className={`py-3 rounded-2xl border text-center text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === "Card"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-foreground/5 bg-background hover:border-foreground/10 text-muted-foreground"
                      }`}
                    >
                      <CreditCard className="size-4 shrink-0" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("QR")}
                      className={`py-3 rounded-2xl border text-center text-xs font-bold transition cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedMethod === "QR"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-foreground/5 bg-background hover:border-foreground/10 text-muted-foreground"
                      }`}
                    >
                      <QrCode className="size-4 shrink-0" />
                      <span>QR Code</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: SIMULATED PAYMENT GATEWAY */}
          {checkoutStep === "gateway" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-3xl bg-secondary p-5 border flex flex-col items-center text-center space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  <Lock className="size-3.5 text-emerald-500" /> Secure Sandbox Gateway
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-black text-foreground">
                    ₹{deliveryMethod === "pickup" ? 10 : Math.round(grandTotal)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Paying to <strong className="text-foreground">{SHOP.name}</strong>
                  </div>
                </div>

                {/* Gateway Detail Sub-forms */}
                <div className="w-full text-left pt-2 border-t space-y-3">
                  {selectedMethod === "UPI" && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <label className="block text-xs font-semibold text-muted-foreground">
                        {t.upiIdLabel}
                      </label>
                      <input
                        type="text"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okhdfc"
                        className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                      />
                      <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition mt-2">
                        <span className="text-[10px] font-bold">Google Pay</span>
                        <span className="text-[10px] font-bold">PhonePe</span>
                        <span className="text-[10px] font-bold">Paytm</span>
                      </div>
                    </div>
                  )}

                  {selectedMethod === "Card" && (
                    <div className="space-y-3 animate-fadeIn">
                      {/* Interactive stylized mock card */}
                      <div className="rounded-2xl bg-gradient-to-r from-neutral-800 to-neutral-900 text-white p-4 shadow-md space-y-6">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold tracking-widest text-neutral-400">CREDIT CARD</span>
                          <CreditCard className="size-6 text-neutral-400" />
                        </div>
                        <div className="font-mono text-base tracking-widest text-neutral-200 py-1">
                          {cardNum || "•••• •••• •••• ••••"}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <div className="text-[8px] text-neutral-400 font-bold uppercase">Cardholder</div>
                            <div className="font-semibold uppercase tracking-wider">{customerName || "Your Name"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[8px] text-neutral-400 font-bold uppercase">Expires</div>
                            <div className="font-mono font-semibold">{cardExpiry || "MM/YY"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="block text-xs font-semibold text-muted-foreground">
                          {t.cardNumLabel}
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          value={cardNum}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const matches = val.match(/\d{4,16}/g);
                            const match = (matches && matches[0]) || "";
                            const parts = [];

                            for (let i = 0, len = match.length; i < len; i += 4) {
                              parts.push(match.substring(i, i + 4));
                            }

                            if (parts.length > 0) {
                              setCardNum(parts.join(" "));
                            } else {
                              setCardNum(val);
                            }
                          }}
                          placeholder={t.cardPlaceholder}
                          className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                              {t.cardExpiryLabel}
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                if (val.length >= 2) {
                                  setCardExpiry(val.slice(0, 2) + "/" + val.slice(2, 4));
                                } else {
                                  setCardExpiry(val);
                                }
                              }}
                              placeholder={t.cardExpiryPlaceholder}
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1">
                              {t.cardCvvLabel}
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={3}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                              placeholder={t.cardCvvPlaceholder}
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMethod === "QR" && (
                    <div className="space-y-3 animate-fadeIn text-center flex flex-col items-center">
                      <p className="text-[11px] text-muted-foreground">
                        {t.qrScanInstruction}
                      </p>
                      
                      {/* Stylized QR Code placeholder */}
                      <div className="rounded-2xl bg-white p-3 border shadow-sm inline-block">
                        <svg className="size-36 text-black" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 0h8v8H0V0zm2 2v4h4V2H2zm0 8h8v8H0v-8zm2 2v4h4v-4H2zm8-12h8v8h-8V0zm2 2v4h4V2h-4zm0 8h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 2h2v2h-2v-2zm4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-10h2v2h-2V4zm-2 2h2v2h-2V6zm2 2h2v2h-2V8zm-2 2h2v2h-2v-2zm4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2z" />
                        </svg>
                      </div>

                      <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        ✓ UPI QR Generated - Scan to Pay
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS BLOCK */}
          {checkoutStep === "success" && (
            <div className="space-y-6 text-center py-6 animate-fadeIn flex flex-col items-center">
              <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-600 grid place-items-center animate-bounce shadow-md">
                <ShieldCheck className="size-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display text-2xl text-foreground font-black">
                  {t.orderSuccessTitle}
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  {t.orderSuccessMessage}
                </p>
              </div>

              {orderId && (
                <div className="rounded-2xl bg-secondary border p-4 w-full text-center space-y-1">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    {t.orderIdLabel}
                  </div>
                  <div className="font-mono text-sm font-bold text-primary tracking-wider">
                    {orderId}
                  </div>
                </div>
              )}

              {/* Order breakdown summary */}
              <div className="w-full text-left bg-secondary/30 rounded-2xl border p-4 space-y-2.5 text-xs">
                <div className="font-semibold text-foreground border-b pb-1.5 uppercase text-[10px] tracking-wider text-muted-foreground">
                  Order Details Summary
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-semibold">{customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold uppercase">{deliveryMethod}</span>
                </div>
                {deliveryMethod === "delivery" ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-semibold italic text-foreground/80">{customerAddress}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Time:</span>
                    <span className="font-semibold">{pickupTime || pickupTimeStr}</span>
                  </div>
                )}
                <div className="border-t border-dashed pt-2 flex justify-between font-bold text-foreground">
                  <span>Paid Amount:</span>
                  <span className="text-emerald-600">₹{Math.round(finalAdvance)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground">
                  <span>Balance Due:</span>
                  <span>₹{Math.round(balanceDue)}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Area */}
        {items.length > 0 && checkoutStep !== "success" && (
          <div className="p-5 border-t space-y-4">
            
            {/* Bill Details Breakdowns on cart/details/payment steps */}
            {checkoutStep !== "gateway" && (
              <div className="space-y-2 text-sm border-b pb-3 border-dashed">
                <div className="flex items-center justify-between text-muted-foreground text-xs">
                  <span>{t.subtotalLabel}</span>
                  <span>₹{Math.round(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold text-xs">
                    <span>{t.offersDiscountLabel}</span>
                    <span>-₹{Math.round(discountAmount)}</span>
                  </div>
                )}
                {deliveryMethod === "delivery" && (
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>{t.deliveryChargesLabel}</span>
                    <span>{deliveryCharge === 0 ? (lang === "hi" ? "मुफ़्त" : lang === "te" ? "ఉచితం" : "Free") : "₹5"}</span>
                  </div>
                )}
                <div className="flex items-center justify-between font-bold text-base pt-1">
                  <span>{t.totalAmountLabel}</span>
                  <span>₹{Math.round(grandTotal)}</span>
                </div>

                {/* Splitting Details */}
                <div className="mt-2 pt-2 border-t space-y-1 text-xs font-semibold">
                  <div className="flex justify-between text-emerald-600">
                    <span>{t.onlineAdvanceRequiredLabel}</span>
                    <span>₹{Math.round(finalAdvance)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {deliveryMethod === "delivery" ? t.cashOnDeliveryLabel : t.cashOnSiteLabel}
                    </span>
                    <span>₹{Math.round(balanceDue)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            {checkoutStep === "cart" && (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={items.length === 0}
                className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition shadow-sm cursor-pointer hover:shadow flex items-center justify-center gap-1.5 font-display text-lg tracking-wider"
              >
                <span>Proceed to Checkout</span>
              </button>
            )}

            {checkoutStep === "details" && (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!customerName.trim() || !customerPhone.trim() || (deliveryMethod === "delivery" && !customerAddress.trim())}
                className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5 font-display text-lg tracking-wider"
              >
                <span>Continue to Payment</span>
              </button>
            )}

            {checkoutStep === "payment" && (
              <button
                type="button"
                onClick={handleNextStep}
                className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 font-display text-lg tracking-wider"
              >
                <span>
                  {deliveryMethod === "delivery" && paymentOption === "cod" 
                    ? `Place Order (COD - Pay ₹${Math.round(grandTotal)} on Delivery)`
                    : `Proceed to Pay ₹${Math.round(finalAdvance)}`}
                </span>
              </button>
            )}

            {checkoutStep === "gateway" && (
              <button
                type="button"
                onClick={handleSimulatedPayment}
                disabled={isPlacingOrder}
                className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-600/95 text-white text-sm font-semibold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 font-display text-lg tracking-wider"
              >
                <span>{isPlacingOrder ? t.loadingText : `${t.simulatedPayBtn} (₹${Math.round(finalAdvance)})`}</span>
              </button>
            )}

          </div>
        )}

        {checkoutStep === "success" && (
          <div className="p-5 border-t space-y-2.5">
            <button
              onClick={() => {
                onTrackOrders?.();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-sm cursor-pointer hover:shadow flex items-center justify-center gap-1.5 font-display text-lg tracking-wider"
            >
              <span>🚚 {lang === "hi" ? "लाइव डिलीवरी ट्रैक करें" : lang === "te" ? "డెలివరీని ట్రాక్ చేయండి" : "Track Live Delivery"}</span>
            </button>
            <button
              onClick={() => {
                setCheckoutStep("cart");
                setOrderId(null);
                onClose();
              }}
              className="w-full py-3 px-4 rounded-full bg-secondary hover:bg-accent text-foreground text-sm font-semibold transition shadow-sm cursor-pointer text-center font-display text-lg tracking-wider"
            >
              {t.backToShop}
            </button>
          </div>
        )}

      </aside>
    </div>
  );
}

// ---------- Auth Modal Component ----------
function AuthModal({
  isOpen,
  onClose,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "hi" | "te";
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const t = TRANSLATIONS[lang];

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForgotPassword = async () => {
    setError(null);
    setResetSent(false);
    if (!email.trim()) {
      setError(lang === "hi" ? "कृपया रीसेट लिंक भेजने के लिए अपना ईमेल पता दर्ज करें।" : lang === "te" ? "దయచేసి రీసెట్ లింక్ పంపడానికి మీ ఈమెయిల్ చిరునామాను నమోదు చేయండి." : "Please enter your email address to send reset link.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      let msg = err.message || "Failed to send password reset email.";
      if (err.code === "auth/user-not-found") {
        msg = lang === "hi" ? "इस ईमेल के साथ कोई उपयोगकर्ता नहीं मिला।" : lang === "te" ? "ఈ ఈమెయిల్ తో వినియోగదారుడు కనుగొనబడలేదు." : "No user found with this email address.";
      } else if (err.code === "auth/invalid-email") {
        msg = lang === "hi" ? "अमान्य ईमेल प्रारूप।" : lang === "te" ? "ఈమెయిల్ సరైనది కాదు." : "Invalid email format.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError(t.pwdLengthError);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Create account
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(userCred.user, {
            displayName: name.trim(),
          });
        }
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (email.toLowerCase().endsWith("@freshlyyours.com") || email.toLowerCase().includes("@freshlyyours")) {
        window.location.href = "/admin";
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = t.authErrorDefault;
      if (err.code === "auth/email-already-in-use") {
        msg = lang === "hi" ? "यह ईमेल पहले से उपयोग में है।" : lang === "te" ? "ఈ ఈమెయిల్ ఇప్పటికే ఉపయోగంలో ఉంది." : "This email is already in use.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = lang === "hi" ? "गलत ईमेल या पासवर्ड।" : lang === "te" ? "తప్పు ఈమెయిల్ లేదా పాస్‌వర్డ్." : "Incorrect email or password.";
      } else if (err.code === "auth/invalid-email") {
        msg = lang === "hi" ? "अमान्य ईमेल प्रारूप।" : lang === "te" ? "ఈమెయిల్ సరైనది కాదు." : "Invalid email format.";
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user?.email || "";
      if (userEmail.toLowerCase().endsWith("@freshlyyours.com") || userEmail.toLowerCase().includes("@freshlyyours")) {
        window.location.href = "/admin";
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Google auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || t.authErrorDefault);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-md px-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-foreground/10 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 grid place-items-center rounded-full bg-secondary hover:bg-accent text-foreground transition cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="size-12 grid place-items-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.45_0.2_27)] text-primary-foreground shadow-soft mb-3">
            <Flame className="size-6 animate-pulse" />
          </div>
          <h2 className="font-display text-2xl font-extrabold text-foreground">
            {isSignUp ? t.signUpTitle : t.signInTitle}
          </h2>
        </div>

        {error && (
          <div className="mb-4 flex gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-semibold animate-fadeIn">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="mb-4 flex gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-semibold animate-fadeIn">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>{t.resetEmailSent}</span>
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
                {t.nameLabel}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
              {t.emailLabel}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-foreground/10 bg-background pl-4 pr-11 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition cursor-pointer"
              >
                {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </div>
            {!isSignUp && (
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-primary hover:underline hover:text-primary/80 bg-transparent cursor-pointer"
                >
                  {t.forgotPassword}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold transition shadow-soft hover:shadow cursor-pointer disabled:opacity-50"
          >
            {loading ? t.loadingText : (isSignUp ? t.signUpTitle : t.signInTitle)}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/10" />
          </div>
          <span className="relative bg-card px-3 text-xs text-muted-foreground uppercase font-bold tracking-wider">
            {lang === "hi" ? "या" : lang === "te" ? "లేదా" : "Or"}
          </span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-full border border-foreground/10 hover:bg-secondary text-sm font-semibold transition cursor-pointer active:scale-98 shadow-sm"
        >
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>{t.googleSignIn}</span>
        </button>

        {/* Toggle Account Mode */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <span className="mr-1">{isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}</span>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-bold text-primary hover:underline cursor-pointer"
          >
            {isSignUp ? t.signInTitle : t.signUpTitle}
          </button>
        </div>
      </div>
    </div>
  );
}

function FloatingWhatsApp({ lang }: { lang: "en" | "hi" | "te" }) {
  const t = TRANSLATIONS[lang];
  const waMsg = lang === "hi"
    ? "नमस्ते! मुझे एक सवाल पूछना है।"
    : lang === "te"
      ? "నమస్తే! నాకు ఒక ప్రశ్న ఉంది."
      : "Hello! I have a question.";

  return (
    <a
      href={waLink(waMsg)}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-whatsapp text-white px-4 py-3 shadow-soft hover:scale-105 transition cursor-pointer"
      aria-label="WhatsApp"
    >
      <WhatsAppIcon className="size-5 fill-white" />
      <span className="text-sm font-semibold hidden sm:inline">{t.whatsappOrder}</span>
    </a>
  );
}

// ---------- Order History Drawer ----------
function OrderHistoryDrawer({
  isOpen,
  onClose,
  lang,
  user,
  onAuthRequired,
}: {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "hi" | "te";
  user: FirebaseUser | null;
  onAuthRequired: () => void;
}) {
  const [orders, setOrders] = useState<(OrderDetails & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserOrders(user.uid, (userOrders) => {
      setOrders(userOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, isOpen]);

  // Auto-select the first active order if none is selected
  useEffect(() => {
    if (isOpen && orders.length > 0 && !selectedOrderId) {
      const activeOrder = orders.find(
        (o) => o.status !== "Delivered" && o.status !== "Cancelled"
      );
      if (activeOrder) {
        setSelectedOrderId(activeOrder.id);
      }
    }
  }, [orders, selectedOrderId, isOpen]);

  if (!isOpen) return null;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const getOrderLiveState = (order: OrderDetails & { id: string }) => {
    const createdTime = order.createdAt?.seconds ? order.createdAt.seconds * 1000 : Date.now();
    const elapsedMs = Date.now() - createdTime;

    if (order.status === "Cancelled") {
      return { step: -1, progress: 0, label: t.cancelledStatus };
    }
    if (order.status === "Delivered") {
      return {
        step: 3,
        progress: 100,
        label:
          order.deliveryMethod === "pickup"
            ? lang === "hi"
              ? "प्राप्त हुआ"
              : lang === "te"
              ? "సేకరించబడింది"
              : "Collected"
            : t.deliveredStep,
      };
    }
    if (order.status === "New") {
      return { step: 0, progress: 15, label: t.orderPlacedStep };
    }
    if (order.status === "Preparing") {
      if (elapsedMs > 45000) {
        return {
          step: 2,
          progress: 70,
          label: order.deliveryMethod === "pickup" ? t.pickupCollectStep : t.outForDeliveryStep,
        };
      }
      return { step: 1, progress: 45, label: t.preparingStep };
    }
    return { step: 0, progress: 15, label: t.orderPlacedStep };
  };

  const deliverySteps = [
    { key: "confirmed", title: t.orderPlacedStep, desc: t.orderPlacedStepDesc },
    { key: "preparing", title: t.preparingStep, desc: t.preparingStepDesc },
    { key: "out", title: t.outForDeliveryStep, desc: t.outForDeliveryStepDesc },
    { key: "delivered", title: t.deliveredStep, desc: t.deliveredStepDesc },
  ];

  const pickupSteps = [
    { key: "confirmed", title: t.orderPlacedStep, desc: t.orderPlacedStepDesc },
    { key: "preparing", title: t.preparingStep, desc: t.preparingStepDesc },
    { key: "pickup", title: t.pickupCollectStep, desc: t.pickupCollectStepDesc },
    { key: "delivered", title: t.deliveredStep, desc: t.deliveredStepDesc },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateY(-85%) translateX(-50%) rotate(0deg); }
          25% { transform: translateY(-87%) translateX(-50%) rotate(1.5deg); }
          75% { transform: translateY(-83%) translateX(-50%) rotate(-1.5deg); }
        }
        @keyframes scooterMove {
          0%, 100% { transform: translateY(-85%) translateX(-50%) translate3d(0, 0, 0); }
          50% { transform: translateY(-85%) translateX(-50%) translate3d(2px, 0, 0); }
        }
      `}</style>
      
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Slide-over Panel */}
      <aside className="relative h-full w-full max-w-md bg-card shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <div className="font-display text-2xl font-black">
            {t.orderHistoryTitle}
          </div>
          <button
            onClick={onClose}
            className="size-9 grid place-items-center rounded-full hover:bg-secondary cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-5">
          {!user ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="size-16 rounded-full bg-secondary grid place-items-center text-muted-foreground">
                <User className="size-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">
                  {lang === "hi" ? "लॉगिन आवश्यक है" : lang === "te" ? "లాగిన్ అవసరం" : "Login Required"}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "hi" ? "अपने ऑर्डर इतिहास और लाइव डिलीवरी को देखने के लिए लॉगिन करें।" : lang === "te" ? "మీ ఆర్డర్ హిస్టరీ మరియు లైవ్ డెలివరీని చూడటానికి లాగిన్ అవ్వండి." : "Please login to track your orders and view history."}
                </p>
              </div>
              <button
                onClick={() => {
                  onAuthRequired();
                }}
                className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-2.5 text-xs font-bold transition shadow-soft cursor-pointer"
              >
                {t.signInTitle}
              </button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted-foreground">{t.loadingText}</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="size-16 rounded-full bg-secondary grid place-items-center text-muted-foreground">
                <ShoppingCart className="size-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">{t.noOrdersText}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "hi" ? "दुकान से ऑर्डर करें और उन्हें यहाँ लाइव ट्रैक करें।" : lang === "te" ? "షాప్ నుండి ఆర్డర్ చేయండి మరియు ఇక్కడ లైవ్ ట్రాక్ చేయండి." : "Place an order from the shop and track it in real-time here."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 text-xs font-bold transition shadow-soft cursor-pointer"
              >
                {lang === "hi" ? "चिकन नस्लें देखें" : lang === "te" ? "చికెన్ రకాలను చూడండి" : "Browse Chicken Breeds"}
              </button>
            </div>
          ) : selectedOrder ? (
            /* Selected Order Details Panel */
            <div className="space-y-6 animate-fadeIn">
              
              {/* Back to Orders List button */}
              {orders.length >= 1 && (
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>{lang === "hi" ? "सभी ऑर्डर" : lang === "te" ? "అన్ని ఆర్డర్లు" : "All Orders"}</span>
                </button>
              )}

              {/* Order Status Header Card */}
              <div className="rounded-3xl border border-foreground/5 bg-secondary/30 p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {t.orderIdLabel}
                    </div>
                    <div className="font-mono text-xs font-bold text-foreground truncate max-w-[180px]">
                      {selectedOrder.id}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-[10px] font-bold uppercase">
                      {selectedOrder.deliveryMethod === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-1 border-t border-foreground/5">
                  <span className="text-muted-foreground">
                    {selectedOrder.createdAt?.seconds 
                      ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleString(lang === "en" ? "en-IN" : lang === "hi" ? "hi-IN" : "te-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true
                        })
                      : "Just Now"}
                  </span>
                  <span className="font-bold text-foreground">
                    ₹{selectedOrder.grandTotal}
                  </span>
                </div>
              </div>

              {/* Cancellation Banner */}
              {selectedOrder.status === "Cancelled" && (
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 text-destructive animate-fadeIn">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">{t.cancelledStatus}</h4>
                    <p className="text-[11px] text-destructive-foreground/85 leading-normal mt-0.5">
                      {lang === "hi" ? "यह ऑर्डर व्यवस्थापक द्वारा रद्द कर दिया गया है। सहायता के लिए संपर्क करें।" : lang === "te" ? "ఈ ఆర్డర్ అడ్మినిస్ట్రేటర్ చేత రద్దు చేయబడింది." : "This order was cancelled. Please contact the shop if you have any questions."}
                    </p>
                  </div>
                </div>
              )}

              {/* Live Scooter / Pickup Counter Tracker Map */}
              {selectedOrder.status !== "Cancelled" && (
                selectedOrder.deliveryMethod === "delivery" ? (
                  /* Animated Delivery Scooter Tracker Map */
                  <div className="relative h-28 bg-secondary/30 rounded-3xl overflow-hidden border border-foreground/5 p-4 flex flex-col justify-between">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
                    
                    <div className="relative flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider z-10">
                      <span>{t.liveTrackingTitle}</span>
                      <span className="text-emerald-500 animate-pulse flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        {getOrderLiveState(selectedOrder).label}
                      </span>
                    </div>

                    <div className="relative h-12 flex items-center mt-2 z-10">
                      {/* Road progress line */}
                      <div className="absolute left-6 right-6 h-2 bg-secondary rounded-full overflow-hidden border border-foreground/5">
                        <div 
                          className="h-full bg-gradient-to-r from-primary via-primary to-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: `${getOrderLiveState(selectedOrder).progress}%` }}
                        />
                      </div>

                      {/* Store Node */}
                      <div className="absolute left-6 -translate-x-1/2 flex flex-col items-center gap-1">
                        <div className={`size-7 rounded-full flex items-center justify-center shadow-md transition ${getOrderLiveState(selectedOrder).step >= 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
                          <Store className="size-4" />
                        </div>
                      </div>

                      {/* Destination Node */}
                      <div className="absolute right-6 translate-x-1/2 flex flex-col items-center gap-1">
                        <div className={`size-7 rounded-full flex items-center justify-center shadow-md transition ${getOrderLiveState(selectedOrder).step === 3 ? "bg-emerald-500 text-white" : "bg-card text-muted-foreground"}`}>
                          <MapPin className="size-4" />
                        </div>
                      </div>

                      {/* Scooter Icon */}
                      {getOrderLiveState(selectedOrder).step !== -1 && (
                        <div 
                          className="absolute -translate-y-1/2 transition-all duration-1000 flex flex-col items-center"
                          style={{ 
                            left: `calc(24px + (${getOrderLiveState(selectedOrder).progress}% - 24px) * 0.88)`,
                            top: "50%",
                            animation: getOrderLiveState(selectedOrder).step === 1 
                              ? "shake 0.15s linear infinite" 
                              : getOrderLiveState(selectedOrder).step === 2 
                              ? "scooterMove 1s ease-in-out infinite" 
                              : "none"
                          }}
                        >
                          <div className="bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md mb-1.5 leading-none animate-bounce flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                            {getOrderLiveState(selectedOrder).step === 0 && (lang === "hi" ? "प्रतीक्षा कर रहा है..." : lang === "te" ? "వేచి ఉంది..." : "Waiting...")}
                            {getOrderLiveState(selectedOrder).step === 1 && (lang === "hi" ? "कटिंग हो रही है..." : lang === "te" ? "కట్ చేస్తున్నారు..." : "Cutting...")}
                            {getOrderLiveState(selectedOrder).step === 2 && (lang === "hi" ? "स्कूटर रास्ते में है!" : lang === "te" ? "డెలివరీ వస్తోంది!" : "Scooter is coming!")}
                            {getOrderLiveState(selectedOrder).step === 3 && (lang === "hi" ? "पहुंच गया!" : lang === "te" ? "చేరింది!" : "Arrived!")}
                          </div>
                          <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-primary/10">
                            <Truck className="size-5" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Animated Shop Pickup Tracker Map */
                  <div className="relative h-28 bg-secondary/30 rounded-3xl overflow-hidden border border-foreground/5 p-4 flex flex-col justify-between">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
                    
                    <div className="relative flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-wider z-10">
                      <span>{lang === "hi" ? "दुकान पिकअप ट्रैकर" : lang === "te" ? "షాప్ పికప్ ట్రాకర్" : "Shop Pickup Tracker"}</span>
                      <span className="text-orange-500 animate-pulse flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-orange-500" />
                        {getOrderLiveState(selectedOrder).label}
                      </span>
                    </div>

                    <div className="relative h-12 flex items-center mt-2 z-10">
                      {/* Counter progress line */}
                      <div className="absolute left-6 right-6 h-2 bg-secondary rounded-full overflow-hidden border border-foreground/5">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full transition-all duration-1000"
                          style={{ width: `${getOrderLiveState(selectedOrder).progress}%` }}
                        />
                      </div>

                      {/* Store Node */}
                      <div className="absolute left-6 -translate-x-1/2 flex flex-col items-center gap-1">
                        <div className={`size-7 rounded-full flex items-center justify-center shadow-md transition ${getOrderLiveState(selectedOrder).step >= 0 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
                          <Store className="size-4" />
                        </div>
                      </div>

                      {/* Counter Node */}
                      <div className="absolute right-6 translate-x-1/2 flex flex-col items-center gap-1">
                        <div className={`size-7 rounded-full flex items-center justify-center shadow-md transition ${getOrderLiveState(selectedOrder).step >= 2 ? "bg-orange-500 text-white" : "bg-card text-muted-foreground"}`}>
                          <Gift className="size-4" />
                        </div>
                      </div>

                      {/* Chicken Bag Indicator */}
                      {getOrderLiveState(selectedOrder).step !== -1 && (
                        <div 
                          className="absolute -translate-y-1/2 transition-all duration-1000 flex flex-col items-center"
                          style={{ 
                            left: `calc(24px + (${getOrderLiveState(selectedOrder).progress}% - 24px) * 0.88)`,
                            top: "50%",
                            animation: getOrderLiveState(selectedOrder).step === 1 ? "shake 0.15s linear infinite" : "none"
                          }}
                        >
                          <div className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-md mb-1.5 leading-none animate-bounce flex items-center gap-0.5 shrink-0 whitespace-nowrap">
                            {getOrderLiveState(selectedOrder).step === 0 && (lang === "hi" ? "तैयारी..." : lang === "te" ? "సిద్ధమౌతోంది..." : "Preparing...")}
                            {getOrderLiveState(selectedOrder).step === 1 && (lang === "hi" ? "कटिंग..." : lang === "te" ? "కటింగ్..." : "Chopping...")}
                            {getOrderLiveState(selectedOrder).step === 2 && (lang === "hi" ? "काउंटर पर तैयार!" : lang === "te" ? "కౌంటర్‌లో సిద్ధంగా ఉంది!" : "Ready at Counter!")}
                            {getOrderLiveState(selectedOrder).step === 3 && (lang === "hi" ? "ले लिया गया!" : lang === "te" ? "తీసుకున్నారు!" : "Collected!")}
                          </div>
                          <div className="size-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg ring-4 ring-orange-500/10">
                            <Sparkles className="size-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Stepper Steps (Confirmed -> Preparing -> Out / Ready -> Delivered / Collected) */}
              {selectedOrder.status !== "Cancelled" && (
                <div className="space-y-6 pt-2 pl-2">
                  {(selectedOrder.deliveryMethod === "delivery" ? deliverySteps : pickupSteps).map((step, idx) => {
                    const isCompleted = getOrderLiveState(selectedOrder).step >= idx;
                    const isActive = getOrderLiveState(selectedOrder).step === idx;
                    
                    return (
                      <div key={step.key} className="relative flex gap-4">
                        {/* Connecting Line */}
                        {idx < 3 && (
                          <div 
                            className={`absolute left-3 top-6 bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-500 ${
                              getOrderLiveState(selectedOrder).step > idx ? "bg-emerald-500" : "bg-secondary"
                            }`}
                            style={{ minHeight: "35px" }}
                          />
                        )}

                        {/* Step Circle */}
                        <div className="relative z-10 shrink-0">
                          <div 
                            className={`size-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                              isCompleted 
                                ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-sm shadow-emerald-500/20" 
                                : "bg-card border-foreground/15 text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="size-3.5 text-white" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                        </div>

                        {/* Step Label & Description */}
                        <div className="space-y-0.5 pt-0.5">
                          <h4 className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
                            isActive ? "text-primary font-black" : isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Item Breakdown Summary */}
              <div className="bg-secondary/30 rounded-2xl border p-4 space-y-2.5 text-xs">
                <div className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider pb-1 border-b">
                  {lang === "hi" ? "ऑर्डर सारांश" : lang === "te" ? "ఆర్డర్ వివరాలు" : "Order Summary"}
                </div>
                {selectedOrder.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between font-semibold">
                    <span>
                      {item.qty} {item.unit === "kg" ? (lang === "hi" ? "किलो" : lang === "te" ? "కిలో" : "kg") : item.unit} × {getProductTranslatedName(item.name, lang)}
                    </span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
                
                <div className="border-t border-dashed pt-2 flex justify-between font-bold text-foreground">
                  <span>{lang === "hi" ? "कुल राशि" : lang === "te" ? "మొత్తం" : "Grand Total"}:</span>
                  <span>₹{selectedOrder.grandTotal}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>{lang === "hi" ? "अग्रिम भुगतान" : lang === "te" ? "అడ్వాన్స్ చెల్లింపు" : "Advance Paid"}:</span>
                  <span>₹{selectedOrder.advancePaid}</span>
                </div>
                {selectedOrder.balanceDue > 0 && (
                  <div className="flex justify-between font-bold text-muted-foreground">
                    <span>
                      {lang === "hi" 
                        ? (selectedOrder.deliveryMethod === "delivery" ? "डिलीवरी पर देय शेष:" : "काउंटर पर देय शेष:") 
                        : lang === "te" 
                        ? (selectedOrder.deliveryMethod === "delivery" ? "డెలివరీ సమయంలో బ్యాలెన్స్:" : "కౌంటర్ వద్ద బ్యాలెన్స్:") 
                        : `Balance due ${selectedOrder.deliveryMethod === "delivery" ? "on Delivery" : "at Counter"}:`}
                    </span>
                    <span>₹{selectedOrder.balanceDue}</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Historical Orders List View (multi-order scenarios) */
            <div className="space-y-4 animate-fadeIn">
              <h3 className="font-bold text-sm text-muted-foreground mb-1 uppercase tracking-wider">
                {lang === "hi" ? "पिछले आदेश" : lang === "te" ? "మునుపటి ఆర్డర్లు" : "Past Orders"}
              </h3>
              <div className="space-y-3">
                {orders.map((order) => {
                  const state = getOrderLiveState(order);
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="w-full text-left rounded-3xl border border-foreground/5 bg-card hover:bg-secondary/40 p-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex justify-between items-center gap-4 cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="font-mono text-xs font-bold text-primary tracking-wider">
                          #{order.id.slice(0, 8)}...
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {order.createdAt?.seconds 
                            ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })
                            : "Just Now"}
                        </div>
                        <div className="text-xs font-semibold text-foreground pt-0.5">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"} • ₹{order.grandTotal}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase ${
                          order.status === "Cancelled" 
                            ? "bg-destructive/10 text-destructive" 
                            : order.status === "Delivered" 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : "bg-primary/10 text-primary animate-pulse"
                        }`}>
                          {state.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          {order.deliveryMethod === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Order Detail footer: list selector if they have multiple orders */}
        {selectedOrderId && orders.length >= 1 && (
          <div className="p-5 border-t shrink-0">
            <button
              onClick={() => setSelectedOrderId(null)}
              className="w-full py-3 px-4 rounded-full bg-secondary hover:bg-accent text-foreground text-sm font-semibold transition text-center cursor-pointer font-display text-lg tracking-wider"
            >
              {lang === "hi" ? "सभी ऑर्डर सूची देखें" : lang === "te" ? "అన్ని ఆర్డర్ల జాబితా" : "View All Orders"}
            </button>
          </div>
        )}

      </aside>
    </div>
  );
}

// ---------- Page ----------
function Home() {
  const [lang, setLang] = useState<"en" | "hi" | "te">("en");
  const t = TRANSLATIONS[lang];
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [trackOrdersOpen, setTrackOrdersOpen] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // --- Dynamic Live Pricing (Business Mindset) ---
  const [govRate, setGovRate] = useState(210);
  const [trend, setTrend] = useState<"up" | "down" | "flat">("flat");
  const [priceFlash, setPriceFlash] = useState<"up" | "down" | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [bulkDiscounts, setBulkDiscounts] = useState({
    tier1Discount: 10,
    tier2Discount: 15,
    tier3Discount: 25,
    tier4Discount: 35,
    tier5Discount: 45,
  });

  useEffect(() => {
    // 1. Subscribe to Firebase prices configuration
    const unsubscribe = subscribeToLivePrices((prices) => {
      if (prices && prices.mandiRate) {
        setFirebaseActive(true);
        setGovRate((prev) => {
          if (prev !== prices.mandiRate) {
            setPriceFlash(prices.mandiRate > prev ? "up" : "down");
            setTimeout(() => setPriceFlash(null), 1500);
          }
          return prices.mandiRate;
        });
        setTrend(prices.trend || "flat");
        if (prices.tier1Discount !== undefined) {
          setBulkDiscounts({
            tier1Discount: prices.tier1Discount,
            tier2Discount: prices.tier2Discount ?? 15,
            tier3Discount: prices.tier3Discount ?? 25,
            tier4Discount: prices.tier4Discount ?? 35,
            tier5Discount: prices.tier5Discount ?? 45,
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 2. Local fallback pricing ticker if Firebase config is not updated
    if (firebaseActive) return;

    const interval = setInterval(() => {
      setGovRate((prev) => {
        const rand = Math.random();
        let change = 0;
        if (rand < 0.25) change = -1;
        else if (rand < 0.5) change = 1;
        else if (rand < 0.6) change = -2;
        else if (rand < 0.7) change = 2;

        if (change === 0) return prev;

        const next = prev + change;
        if (next < 200 || next > 225) return prev;

        setTrend(change > 0 ? "up" : "down");
        setPriceFlash(change > 0 ? "up" : "down");

        setTimeout(() => setPriceFlash(null), 1500);
        return next;
      });
    }, 10000); // ticks every 10 seconds for visual demonstrability

    return () => clearInterval(interval);
  }, [firebaseActive]);

  const livePrices = useMemo(() => {
    const nattuBase = Math.round(govRate * 1.8);
    return {
      tender: {
        government: govRate,
        withoutCutting: govRate + 10,
        withCutting: govRate + 30,
      },
      standard: {
        government: govRate - 15,
        withoutCutting: govRate - 5,
        withCutting: govRate + 15,
      },
      nattuKodi: {
        government: nattuBase,
        withoutCutting: nattuBase + 20,
        withCutting: nattuBase + 40,
      },
    };
  }, [govRate]);

  const liveProducts: Product[] = useMemo(() => {
    const smallBase = govRate;
    const bigBase = govRate - 15;
    const nattuBase = Math.round(govRate * 1.8);

    return [
      // ---------- Small Broiler ----------
      // Live Chicken
      {
        id: "small-live",
        name: "Live Chicken (Whole Uncut)",
        breed: "small",
        style: "live" as const,
        cat: "Small Broiler",
        price: smallBase - 30,
        unit: "kg",
        img: liveImg,
        stock: "available",
        desc: "Farm-fresh live bird, weighed in front of you.",
      },

      // With Skin
      {
        id: "small-skin-whole",
        name: "Whole Dressed (With Skin)",
        breed: "small",
        style: "skin" as const,
        cat: "Small Broiler",
        price: smallBase + 10,
        unit: "kg",
        img: wholeImg,
        stock: "available",
        desc: "Whole dressed chicken with skin retained.",
      },
      {
        id: "small-skin-normal",
        name: "Normal Cut (Curry Cut)",
        breed: "small",
        style: "skin" as const,
        cat: "Small Broiler",
        price: smallBase + 30,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Traditional medium pieces with skin, perfect for standard curries.",
      },
      {
        id: "small-skin-small",
        name: "Small Pieces (Fry/Biryani)",
        breed: "small",
        style: "skin" as const,
        cat: "Small Broiler",
        price: smallBase + 40,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Bite-sized pieces with skin, ideal for fry or dry dishes.",
      },
      {
        id: "small-skin-dum",
        name: "Dum Piece Cutting",
        breed: "small",
        style: "skin" as const,
        cat: "Small Broiler",
        price: smallBase + 50,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Large drumsticks & thigh cuts with skin scored deep for dum biryani.",
      },
      {
        id: "small-skin-legs",
        name: "Leg Pieces (Drumsticks)",
        breed: "small",
        style: "skin" as const,
        cat: "Small Broiler",
        price: smallBase + 20,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Clean whole drumsticks with skin, juicy and tender.",
      },
      {
        id: "small-skin-wings",
        name: "Wings Cutting",
        breed: "small",
        style: "skin" as const,
        cat: "Small Broiler",
        price: smallBase + 50,
        unit: "kg",
        img: wingsImg,
        stock: "limited",
        desc: "Whole chicken wings with skin, perfect for snacks.",
      },

      // Skinless
      {
        id: "small-skinless-whole",
        name: "Skinless Whole Dressed",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 20,
        unit: "kg",
        img: wholeImg,
        stock: "available",
        desc: "Clean whole dressed bird with skin removed.",
      },
      {
        id: "small-skinless-normal",
        name: "Normal Cut (Curry Cut)",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 40,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Traditional medium pieces, skinless, ready for cooking.",
      },
      {
        id: "small-skinless-small",
        name: "Small Pieces (Fry/Biryani)",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 50,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Bite-sized pieces, skinless, ideal for quick cooking or biryani.",
      },
      {
        id: "small-skinless-dum",
        name: "Dum Piece Cutting",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 60,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Large drumsticks & thigh cuts, skinless, prepared for biryani.",
      },
      {
        id: "small-skinless-legs",
        name: "Leg Pieces (Drumsticks)",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 30,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Clean whole drumsticks, skinless and tender.",
      },
      {
        id: "small-skinless-wings",
        name: "Wings Cutting",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 60,
        unit: "kg",
        img: wingsImg,
        stock: "limited",
        desc: "Skinless chicken wings.",
      },
      {
        id: "small-skinless-boneless",
        name: "Boneless Breast Fillet",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 150,
        unit: "kg",
        img: bonelessImg,
        stock: "available",
        desc: "Lean boneless breast fillets, trimmed of fat.",
      },
      {
        id: "small-skinless-thigh",
        name: "Thigh Fillet (Boneless)",
        breed: "small",
        style: "skinless" as const,
        cat: "Small Broiler",
        price: smallBase + 130,
        unit: "kg",
        img: bonelessImg,
        stock: "limited",
        desc: "Juicy boneless thigh pieces, ideal for tikka & grills.",
      },

      // ---------- Big Broiler ----------
      // Live Chicken
      {
        id: "big-live",
        name: "Live Chicken (Whole Uncut)",
        breed: "big",
        style: "live" as const,
        cat: "Big Broiler",
        price: bigBase - 30,
        unit: "kg",
        img: liveImg,
        stock: "available",
        desc: "Standard full-grown bird, weighed live.",
      },

      // With Skin
      {
        id: "big-skin-whole",
        name: "Whole Dressed (With Skin)",
        breed: "big",
        style: "skin" as const,
        cat: "Big Broiler",
        price: bigBase + 10,
        unit: "kg",
        img: wholeImg,
        stock: "available",
        desc: "Standard bird dressed whole with skin.",
      },
      {
        id: "big-skin-normal",
        name: "Normal Cut (Curry Cut)",
        breed: "big",
        style: "skin" as const,
        cat: "Big Broiler",
        price: bigBase + 30,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Standard medium pieces with skin, perfect for family curry.",
      },
      {
        id: "big-skin-small",
        name: "Small Pieces (Fry/Biryani)",
        breed: "big",
        style: "skin" as const,
        cat: "Big Broiler",
        price: bigBase + 40,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Bite-sized pieces with skin from standard broiler.",
      },
      {
        id: "big-skin-dum",
        name: "Dum Piece Cutting",
        breed: "big",
        style: "skin" as const,
        cat: "Big Broiler",
        price: bigBase + 50,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Large drumsticks & thigh cuts with skin for biryani.",
      },
      {
        id: "big-skin-legs",
        name: "Leg Pieces (Drumsticks)",
        breed: "big",
        style: "skin" as const,
        cat: "Big Broiler",
        price: bigBase + 20,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Standard broiler whole drumsticks with skin.",
      },
      {
        id: "big-skin-wings",
        name: "Wings Cutting",
        breed: "big",
        style: "skin" as const,
        cat: "Big Broiler",
        price: bigBase + 50,
        unit: "kg",
        img: wingsImg,
        stock: "limited",
        desc: "Standard broiler chicken wings with skin.",
      },

      // Skinless
      {
        id: "big-skinless-whole",
        name: "Skinless Whole Dressed",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 20,
        unit: "kg",
        img: wholeImg,
        stock: "available",
        desc: "Standard broiler whole dressed bird, skin removed.",
      },
      {
        id: "big-skinless-normal",
        name: "Normal Cut (Curry Cut)",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 40,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Standard medium pieces, skinless.",
      },
      {
        id: "big-skinless-small",
        name: "Small Pieces (Fry/Biryani)",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 50,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Bite-sized standard broiler pieces, skinless.",
      },
      {
        id: "big-skinless-dum",
        name: "Dum Piece Cutting",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 60,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Large drumsticks & thigh cuts, skinless.",
      },
      {
        id: "big-skinless-legs",
        name: "Leg Pieces (Drumsticks)",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 30,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Standard broiler whole drumsticks, skinless.",
      },
      {
        id: "big-skinless-wings",
        name: "Wings Cutting",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 60,
        unit: "kg",
        img: wingsImg,
        stock: "limited",
        desc: "Standard broiler chicken wings, skinless.",
      },
      {
        id: "big-skinless-boneless",
        name: "Boneless Breast Fillet",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 150,
        unit: "kg",
        img: bonelessImg,
        stock: "available",
        desc: "Standard broiler boneless breast fillets.",
      },
      {
        id: "big-skinless-thigh",
        name: "Thigh Fillet (Boneless)",
        breed: "big",
        style: "skinless" as const,
        cat: "Big Broiler",
        price: bigBase + 130,
        unit: "kg",
        img: bonelessImg,
        stock: "limited",
        desc: "Standard broiler juicy thigh fillets, skinless.",
      },

      // ---------- Nattu Kodi ----------
      // Live Chicken
      {
        id: "nattu-live",
        name: "Live Chicken (Whole Uncut)",
        breed: "nattu",
        style: "live" as const,
        cat: "Nattu Kodi",
        price: nattuBase - 40,
        unit: "kg",
        img: liveNattuImg,
        stock: "available",
        desc: "Country chicken free-range bird, traditional Desi breed.",
      },

      // With Skin
      {
        id: "nattu-skin-whole",
        name: "Whole Dressed (With Skin)",
        breed: "nattu",
        style: "skin" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 10,
        unit: "kg",
        img: nattuImg,
        stock: "available",
        desc: "Country chicken dressed whole with skin.",
      },
      {
        id: "nattu-skin-normal",
        name: "Normal Cut (Curry Cut)",
        breed: "nattu",
        style: "skin" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 30,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Traditional country chicken curry cut pieces with skin.",
      },
      {
        id: "nattu-skin-small",
        name: "Small Pieces (Fry/Biryani)",
        breed: "nattu",
        style: "skin" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 40,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Bite-sized country chicken curry pieces with skin.",
      },
      {
        id: "nattu-skin-dum",
        name: "Dum Piece Cutting",
        breed: "nattu",
        style: "skin" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 50,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Country chicken drumsticks & thighs with skin for biryani.",
      },
      {
        id: "nattu-skin-legs",
        name: "Leg Pieces (Drumsticks)",
        breed: "nattu",
        style: "skin" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 35,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Country chicken drumsticks with skin.",
      },
      {
        id: "nattu-skin-wings",
        name: "Wings Cutting",
        breed: "nattu",
        style: "skin" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 45,
        unit: "kg",
        img: wingsImg,
        stock: "limited",
        desc: "Country chicken wings portion with skin.",
      },

      // Skinless
      {
        id: "nattu-skinless-whole",
        name: "Skinless Whole Dressed",
        breed: "nattu",
        style: "skinless" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 20,
        unit: "kg",
        img: nattuImg,
        stock: "available",
        desc: "Clean Country chicken dressed whole with skin removed.",
      },
      {
        id: "nattu-skinless-normal",
        name: "Normal Cut (Curry Cut)",
        breed: "nattu",
        style: "skinless" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 40,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Traditional country chicken curry cut pieces, skinless.",
      },
      {
        id: "nattu-skinless-small",
        name: "Small Pieces (Fry/Biryani)",
        breed: "nattu",
        style: "skinless" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 50,
        unit: "kg",
        img: curryImg,
        stock: "available",
        desc: "Bite-sized country chicken curry pieces, skinless.",
      },
      {
        id: "nattu-skinless-dum",
        name: "Dum Piece Cutting",
        breed: "nattu",
        style: "skinless" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 60,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Country chicken drumsticks & thighs, skinless.",
      },
      {
        id: "nattu-skinless-legs",
        name: "Leg Pieces (Drumsticks)",
        breed: "nattu",
        style: "skinless" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 45,
        unit: "kg",
        img: legsImg,
        stock: "available",
        desc: "Country chicken drumsticks, skinless.",
      },
      {
        id: "nattu-skinless-wings",
        name: "Wings Cutting",
        breed: "nattu",
        style: "skinless" as const,
        cat: "Nattu Kodi",
        price: nattuBase + 55,
        unit: "kg",
        img: wingsImg,
        stock: "limited",
        desc: "Country chicken wings, skinless.",
      },
    ];
  }, [govRate]);

  // Map cart items to latest live prices dynamically
  const cartWithLivePrices = useMemo(() => {
    return cart.map((item) => {
      const liveProduct = liveProducts.find((p) => p.id === item.product.id);
      return {
        ...item,
        product: liveProduct ? { ...item.product, price: liveProduct.price } : item.product,
      };
    });
  }, [cart, liveProducts]);

  function add(p: Product, qty: number = 1) {
    setCart((c) => {
      const found = c.find((i) => i.product.id === p.id);
      return found
        ? c.map((i) =>
            i.product.id === p.id ? { ...i, qty: Number((i.qty + qty).toFixed(1)) } : i,
          )
        : [...c, { product: p, qty }];
    });
    setOpen(true);
    if (!currentUser) {
      setAuthModalOpen(true);
    }
  }

  return (
    <div className="min-h-screen">
      <PriceBanner livePrices={livePrices} lang={lang} />
      {currentUser?.email && (currentUser.email.toLowerCase().endsWith("@freshlyyours.com") || currentUser.email.toLowerCase().includes("@freshlyyours")) && (
        <div className="bg-primary/10 border-b border-primary/20 py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 text-primary animate-pulse">
          <ShieldCheck className="size-4 shrink-0" />
          <span>{t.adminBannerMessage.replace("{email}", currentUser.email)}</span>
          <a
            href="/admin"
            className="ml-2 px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-[10px] font-bold uppercase tracking-wider transition duration-200"
          >
            {t.openAdminDashboard}
          </a>
        </div>
      )}
      <Header 
        cartCount={cart.reduce((s, i) => s + i.qty, 0)} 
        onOpenCart={() => setOpen(true)} 
        lang={lang} 
        setLang={setLang} 
        user={currentUser}
        onAuthClick={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onTrackOrdersClick={() => setTrackOrdersOpen(true)}
      />
      <main>
        <Hero livePrices={livePrices} lang={lang} />
        <PriceCard livePrices={livePrices} trend={trend} priceFlash={priceFlash} lang={lang} />
        <Products products={liveProducts} priceFlash={priceFlash} onAdd={add} lang={lang} />
        <Offers
          cart={cartWithLivePrices}
          onAdd={add}
          products={liveProducts}
          onOpenCart={() => setOpen(true)}
          lang={lang}
        />
        <BulkOrders livePrices={livePrices} lang={lang} bulkDiscounts={bulkDiscounts} />
        <Reviews lang={lang} user={currentUser} />
        <FAQ lang={lang} />
        <Contact lang={lang} />
      </main>
      <Footer lang={lang} />
      <FloatingWhatsApp lang={lang} />
      {open && (
        <CartDrawer
          items={cartWithLivePrices}
          onClose={() => setOpen(false)}
          onRemove={(id) => setCart((c) => c.filter((i) => i.product.id !== id))}
          onQty={(id, q) =>
            setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty: q } : i)))
          }
          onClearCart={() => setCart([])}
          lang={lang}
          user={currentUser}
          onAuthRequired={() => setAuthModalOpen(true)}
          onTrackOrders={() => setTrackOrdersOpen(true)}
        />
      )}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        lang={lang}
      />
      <OrderHistoryDrawer
        isOpen={trackOrdersOpen}
        onClose={() => setTrackOrdersOpen(false)}
        lang={lang}
        user={currentUser}
        onAuthRequired={() => setAuthModalOpen(true)}
      />
    </div>
  );
}

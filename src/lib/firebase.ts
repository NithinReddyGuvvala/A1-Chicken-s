import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  serverTimestamp,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  where,
  deleteDoc,
  getDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db: any = null;
let auth: any = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db };

export interface UserReview {
  name: string;
  rating: number;
  text: string;
  createdAt?: any;
}

export async function fetchFirebaseReviews(): Promise<UserReview[]> {
  if (!db) return [];
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const reviews: UserReview[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        name: data.name || "Anonymous",
        rating: data.rating || 5,
        text: data.text || "",
      });
    });
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews from Firebase:", error);
    return [];
  }
}

export async function saveFirebaseReview(review: Omit<UserReview, "createdAt">): Promise<boolean> {
  if (!db) return false;
  try {
    const reviewsRef = collection(db, "reviews");
    await addDoc(reviewsRef, {
      ...review,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error saving review to Firebase:", error);
    return false;
  }
}

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
  breed?: string;
  style?: string;
}

export interface OrderDetails {
  userId?: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: "delivery" | "pickup";
  deliveryAddress?: string;
  pickupTime?: string;
  paymentMethod: "UPI" | "Card" | "QR" | "COD";
  paymentStatus: "Paid" | "Advance Paid" | "Pending";
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  advancePaid: number;
  balanceDue: number;
  grandTotal: number;
  items: OrderItem[];
  status: "New" | "Preparing" | "Delivered" | "Cancelled";
  createdAt?: any;
}

export async function saveFirestoreOrder(order: Omit<OrderDetails, "status" | "createdAt">): Promise<string | null> {
  if (!db) return null;
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
      ...order,
      status: "New",
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    return null;
  }
}

export function subscribeToOrders(callback: (orders: (OrderDetails & { id: string })[]) => void): () => void {
  if (!db) return () => {};
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const ordersList: (OrderDetails & { id: string })[] = [];
      snapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() } as any);
      });
      callback(ordersList);
    }, (error) => {
      console.error("Error listening to orders:", error);
    });
  } catch (error) {
    console.error("Failed to set up orders subscription:", error);
    return () => {};
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  if (!db) return false;
  try {
    const orderDocRef = doc(db, "orders", orderId);
    await updateDoc(orderDocRef, { status });
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string): Promise<boolean> {
  if (!db) return false;
  try {
    const orderDocRef = doc(db, "orders", orderId);
    await updateDoc(orderDocRef, { paymentStatus });
    return true;
  } catch (error) {
    console.error("Error updating order payment status:", error);
    return false;
  }
}

export interface PriceConfig {
  mandiRate: number;
  trend: "up" | "down" | "flat";
  updatedAt: string;
  tier1Discount?: number;
  tier2Discount?: number;
  tier3Discount?: number;
  tier4Discount?: number;
  tier5Discount?: number;
}

export function subscribeToLivePrices(callback: (prices: PriceConfig | null) => void): () => void {
  if (!db) return () => {};
  try {
    const pricesDocRef = doc(db, "config", "prices");
    return onSnapshot(pricesDocRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as PriceConfig);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Error listening to live prices:", error);
    });
  } catch (error) {
    console.error("Failed to set up prices subscription:", error);
    return () => {};
  }
}

export async function updateLivePrices(mandiRate: number, trend: "up" | "down" | "flat"): Promise<boolean> {
  if (!db) return false;
  try {
    const pricesDocRef = doc(db, "config", "prices");
    await setDoc(pricesDocRef, {
      mandiRate,
      trend,
      updatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) + " (Admin Update)"
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating live prices:", error);
    return false;
  }
}

export async function updateBulkDiscounts(discounts: {
  tier1Discount: number;
  tier2Discount: number;
  tier3Discount: number;
  tier4Discount: number;
  tier5Discount: number;
}): Promise<boolean> {
  if (!db) return false;
  try {
    const pricesDocRef = doc(db, "config", "prices");
    await setDoc(pricesDocRef, discounts, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating bulk discounts:", error);
    return false;
  }
}

export function subscribeToReviews(callback: (reviews: (UserReview & { id: string })[]) => void): () => void {
  if (!db) return () => {};
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const reviewsList: (UserReview & { id: string })[] = [];
      snapshot.forEach((doc) => {
        reviewsList.push({ id: doc.id, ...doc.data() } as any);
      });
      callback(reviewsList);
    }, (error) => {
      console.error("Error listening to reviews:", error);
    });
  } catch (error) {
    console.error("Failed to set up reviews subscription:", error);
    return () => {};
  }
}

export async function deleteFirebaseReview(reviewId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const reviewDocRef = doc(db, "reviews", reviewId);
    await deleteDoc(reviewDocRef);
    return true;
  } catch (error) {
    console.error("Error deleting review:", error);
    return false;
  }
}

export function subscribeToUserOrders(userId: string, callback: (orders: (OrderDetails & { id: string })[]) => void): () => void {
  if (!db) return () => {};
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId));
    return onSnapshot(q, (snapshot) => {
      const ordersList: (OrderDetails & { id: string })[] = [];
      snapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() } as any);
      });
      
      // Sort client-side by createdAt descending
      ordersList.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      
      callback(ordersList);
    }, (error) => {
      console.error("Error listening to user orders:", error);
      callback([]); // Stop infinite loading state on error
    });
  } catch (error) {
    console.error("Failed to set up user orders subscription:", error);
    callback([]);
    return () => {};
  }
}

export async function fetchUserAddresses(userId: string): Promise<string[]> {
  if (!db || !userId) return [];
  try {
    const userDocRef = doc(db, "users", userId);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return data.addresses || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }
}

export async function saveUserAddress(userId: string, address: string): Promise<boolean> {
  if (!db || !userId || !address.trim()) return false;
  try {
    const userDocRef = doc(db, "users", userId);
    const currentAddresses = await fetchUserAddresses(userId);
    const trimmedAddr = address.trim();
    if (!currentAddresses.includes(trimmedAddr)) {
      const newAddresses = [...currentAddresses, trimmedAddr];
      await setDoc(userDocRef, { addresses: newAddresses }, { merge: true });
    }
    return true;
  } catch (error) {
    console.error("Error saving user address:", error);
    return false;
  }
}

export async function updateUserAddresses(userId: string, addresses: string[]): Promise<boolean> {
  if (!db || !userId) return false;
  try {
    const userDocRef = doc(db, "users", userId);
    const cleanedAddresses = addresses.map(a => a.trim()).filter(Boolean);
    await setDoc(userDocRef, { addresses: cleanedAddresses }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user addresses:", error);
    return false;
  }
}


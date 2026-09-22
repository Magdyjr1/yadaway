export interface Artisan {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  governorate: string;
  whatsapp?: string;
  rating: number;
  salesCount: number;
  bio: string;
  joinedYear: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  story: string;
  price: number; // السعر الإجمالي
  originalPrice?: number;
  category: string;
  images: string[];
  artisan: Artisan;
  materials: string[];
  craftingTimeDays: number;
  stock: number;
  isFeatured?: boolean;
  isUniquePiece?: boolean;
  isCustomOrder?: boolean; // هل القطعة تفصيل بالطلب؟
  requiredDeposit?: number; // مبلغ العربون المطلوب لجدية التعاقد وبدء التنفيذ
  dimensions?: string;
  weight?: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  platformCommission?: number;
  netEarnings?: number;
  likesCount?: number;
  likedBy?: string[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description: string;
  count: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCustomization?: string;
}

export type MobileWalletProvider = 'vodafone' | 'orange' | 'etisalat' | 'we' | 'bank_meeza';

export type PaymentMethod = 
  | 'vodafone_cash' 
  | 'orange_cash' 
  | 'etisalat_cash' 
  | 'we_pay' 
  | 'smart_wallet' 
  | 'cod' 
  | 'instapay' 
  | 'card';

export type EscrowStatus = 'held_in_escrow' | 'released_to_artisan' | 'refunded';

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  totalAmount: number;
  paidAmount?: number; // المبلغ المدفوع إلكترونياً (العربون أو الإجمالي)
  remainingAmount?: number; // المبلغ المتبقي عند الاستلام والمعاينة
  depositTotal?: number; // مجموع العرابين المطلوبة
  isDepositOnly?: boolean; // هل الدفع كان عربون فقط؟
  escrowStatus?: EscrowStatus; // حالة حساب الضمان والأمان
  walletNumber?: string; // رقم المحفظة الإلكترونية المدفوع منها
  walletProvider?: MobileWalletProvider | string; // مزود المحفظة
  paymentTransactionId?: string; // كود العملية في بوابة الدفع Paymob / Fawry
  shippingFee: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  governorate: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  productId?: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBuyer: boolean;
}

export interface CustomOrderRequest {
  id: string;
  productId?: string;
  productTitle?: string;
  referenceProduct?: Product;
  budgetEstimate?: number;
  artisanId: string;
  artisanName: string;
  artisanWhatsapp?: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  customizationTypes: string[];
  engravingText?: string;
  dimensions?: string;
  colorNotes?: string;
  notes?: string;
  deadline?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'completed';
  createdAt: string;
}

export type UserRole = 'customer' | 'artisan';

export type ShowcaseItemStatus = 'repeatable' | 'portfolio_only';

export interface ShowcaseItem {
  id: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar?: string;
  artisanGovernorate?: string;
  workshopName?: string;
  title: string;
  description: string;
  materials?: string[];
  category: string;
  images: string[]; // Up to 8 images
  status: ShowcaseItemStatus;
  estimatedCraftDays?: number;
  estimatedPriceNote?: string;
  likesCount: number;
  likedBy?: string[];
  featured?: boolean;
  createdAt: string;
}

export interface VendorPortfolio {
  artisanId: string;
  artisanName: string;
  workshopName: string;
  avatar: string;
  coverImage: string;
  bio: string;
  governorate: string;
  category: string;
  likesCount: number;
  likedBy?: string[];
  featured?: boolean;
  itemCount?: number;
  customOrdersAccepted: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  provider: 'google' | 'email';
  governorate?: string;
  address?: string;
  workshopName?: string;
  craftType?: string;
  bio?: string;
  whatsapp?: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  createdAt: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'support' | 'system' | 'admin';
  senderRole?: 'customer' | 'artisan';
  text: string;
  timestamp: string;
  attachments?: string[];
  isQuickAction?: boolean;
  agentName?: string;
}

export interface SupportTicket {
  id: string;
  orderNumber?: string;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  userRole: 'customer' | 'artisan';
  userName: string;
  userPhone?: string;
  createdAt: string;
  lastUpdated: string;
  messages: SupportChatMessage[];
  isHumanHandoffRequested?: boolean;
  assignedAgent?: {
    name: string;
    title: string;
    avatar?: string;
  };
}

export const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'><circle cx='64' cy='64' r='64' fill='%23E2E8F0'/><circle cx='64' cy='46' r='22' fill='%2394A3B8'/><path d='M24 112c0-22.1 17.9-40 40-40s40 17.9 40 40' fill='%2394A3B8'/></svg>`;

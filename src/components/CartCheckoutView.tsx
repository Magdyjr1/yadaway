import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Sparkles,
  MapPin,
  Lock,
  Clock,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, MobileWalletProvider, Order, PaymentMethod, UserProfile } from '../types';
import { GOVERNORATES } from '../data/mockData';

interface CartCheckoutViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onBackToShopping: () => void;
  onPlaceOrder: (newOrder: Order) => void;
  currentUser?: UserProfile | null;
}

export const CartCheckoutView: React.FC<CartCheckoutViewProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onBackToShopping,
  onPlaceOrder,
  currentUser
}) => {
  // Customer shipping details
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState(currentUser?.governorate || 'القاهرة');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');

  // Payment State: Strictly electronic & Mobile Wallets / Escrow (NO COD)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash');
  const [walletNumber, setWalletNumber] = useState(currentUser?.phone || '');
  const [walletError, setWalletError] = useState('');

  // Completed order state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Price calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 55 : 0;
  const grandTotal = subtotal + shippingFee;

  // Custom Order & Deposit Computations
  const customItems = cartItems.filter(i => i.product.isCustomOrder && i.product.requiredDeposit);
  const hasCustomItems = customItems.length > 0;

  // Sum of deposits for custom items, plus full price for standard items in the cart
  const totalDepositValue = cartItems.reduce((acc, item) => {
    if (item.product.isCustomOrder && item.product.requiredDeposit) {
      return acc + item.product.requiredDeposit * item.quantity;
    }
    return acc + item.product.price * item.quantity;
  }, 0);

  // Payment Option: pay only deposit now OR pay full amount now
  const [payOption, setPayOption] = useState<'deposit' | 'full'>(hasCustomItems ? 'deposit' : 'full');

  const amountToPayNow = (hasCustomItems && payOption === 'deposit')
    ? totalDepositValue + shippingFee
    : grandTotal;

  const remainingAmountOnInspection = Math.max(0, grandTotal - amountToPayNow);

  const getWalletProviderName = (method: PaymentMethod): string => {
    switch (method) {
      case 'vodafone_cash': return 'فودافون كاش (Vodafone Cash)';
      case 'orange_cash': return 'أورنج كاش (Orange Money)';
      case 'etisalat_cash': return 'اتصالات كاش (Etisalat Cash)';
      case 'we_pay': return 'وي باي (WE Pay)';
      case 'instapay': return 'إنستاباي (InstaPay)';
      case 'smart_wallet': return 'المحفظة الذكية / ميزة (Smart Wallet)';
      case 'card': return 'بطاقة بنكية (فيزا / ماستركارد / ميزة)';
      default: return 'محفظة إلكترونية';
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) return;

    // Validate electronic wallet phone number if paying via mobile wallet
    if (paymentMethod !== 'card' && paymentMethod !== 'instapay') {
      const trimmedWallet = walletNumber.trim();
      if (!trimmedWallet || trimmedWallet.length < 11) {
        setWalletError('يرجى إدخال رقم محفظة إلكترونية صحيح (11 رقم) لتأكيد العملية والضمان');
        return;
      }
    }
    setWalletError('');

    const orderNumber = `YD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      items: [...cartItems],
      totalAmount: grandTotal,
      paidAmount: amountToPayNow,
      remainingAmount: remainingAmountOnInspection,
      depositTotal: totalDepositValue,
      isDepositOnly: hasCustomItems && payOption === 'deposit',
      escrowStatus: 'held_in_escrow',
      walletNumber: walletNumber.trim() || customerPhone.trim(),
      walletProvider: getWalletProviderName(paymentMethod),
      paymentTransactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      shippingFee,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: address.trim(),
      governorate,
      paymentMethod,
      status: 'new',
      createdAt: 'الآن',
      notes: notes.trim(),
    };

    onPlaceOrder(newOrder);
    setCompletedOrder(newOrder);
    onClearCart();

    // Confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  // If order is completed, show the beautiful Egyptian Escrow receipt
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14 text-right">
        <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-10 card-shadow-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-black px-3 py-1 rounded-full bg-[#254D3F]/10 text-[#254D3F] mb-2 inline-block">
              ✓ تم الدفع وحفظ المبلغ في حساب الضمان (Escrow Secured)
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1F2937] mt-1">
              شكراً لطلبك! أموالك في أمان تام 🌿
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5">
              رقم الطلب: <span className="font-mono font-bold text-[#254D3F] text-base">{completedOrder.orderNumber}</span>
              {' • '}
              كود عملية الدفع: <span className="font-mono text-[#C97A57] font-bold">{completedOrder.paymentTransactionId}</span>
            </p>
          </div>

          {/* Escrow Protection Badge Callout */}
          <div className="p-4 rounded-2xl bg-[#254D3F]/5 border-2 border-[#254D3F]/20 text-right space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#254D3F]">
              <ShieldCheck className="w-5 h-5 text-[#254D3F]" />
              <span>حالة حماية يدوي (Escrow Status): محفوظ بحساب وسيط آمن</span>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              المبلغ الذي دفعته محفوظ الآن لدى المنصة. لن يتم تحويل أرباح ومستحقات الحرفي إلا بعد استلامك للمشغولة بنفسك ومعاينتها والتأكد من مطابقتها لكل شروطك ومواصفاتك.
            </p>
          </div>

          {/* Receipt details */}
          <div className="p-5 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] text-right text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">المستلم:</span>
              <span className="font-bold text-[#1F2937]">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">رقم هاتف المندوب للتوصيل:</span>
              <span className="font-mono font-bold text-[#1F2937]">{completedOrder.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">عنوان التوصيل:</span>
              <span className="font-bold text-[#1F2937]">{completedOrder.governorate} - {completedOrder.customerAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">طريقة الدفع الإلكترونية:</span>
              <span className="font-bold text-[#254D3F]">{completedOrder.walletProvider}</span>
            </div>
            {completedOrder.walletNumber && (
              <div className="flex justify-between">
                <span className="text-[#6B7280]">المحفظة المحوّل منها:</span>
                <span className="font-mono font-bold text-[#1F2937]">{completedOrder.walletNumber}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#E6E1D3]">
              <span className="text-[#6B7280]">إجمالي قيمة الطلب الكاملة:</span>
              <span className="font-mono font-bold text-[#1F2937]">{completedOrder.totalAmount.toLocaleString('ar-EG')} ج.م</span>
            </div>
            <div className="flex justify-between font-bold text-sm bg-white p-2.5 rounded-xl border border-[#E6E1D3]">
              <span className="text-emerald-800">
                {completedOrder.isDepositOnly ? 'المبلغ المسدد الآن (العربون + الشحن):' : 'المبلغ المسدد بالكامل الآن:'}
              </span>
              <span className="font-mono text-emerald-800">{(completedOrder.paidAmount || completedOrder.totalAmount).toLocaleString('ar-EG')} ج.م</span>
            </div>
            {completedOrder.remainingAmount && completedOrder.remainingAmount > 0 ? (
              <div className="flex justify-between font-bold text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                <span>المتبقي عند الاستلام والمعاينة:</span>
                <span className="font-mono">{completedOrder.remainingAmount.toLocaleString('ar-EG')} ج.م</span>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onBackToShopping}
              className="w-full py-4 px-6 rounded-2xl bg-[#254D3F] hover:bg-[#1A372D] text-white font-bold text-sm transition-all cursor-pointer shadow-md active:scale-98"
            >
              العودة لتصفح المشغولات اليدوية
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-[#F6F4ED] border border-[#E6E1D3] flex items-center justify-center mx-auto mb-4 text-[#6B7280]">
          <ShoppingBag className="w-10 h-10 stroke-1" />
        </div>
        <h2 className="font-display font-black text-2xl text-[#1F2937] mb-2">
          سلة المشتريات فارغة
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mb-6">
          لم تختر أي مشغولات يدوية بعد. تصفح إبداعات الحرفيين المصريين وأضف ما يعجبك.
        </p>
        <button
          onClick={onBackToShopping}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white font-bold text-sm transition-all cursor-pointer shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>تصفح سوق المشغولات اليدوية</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-right">
      
      {/* Return to shop button */}
      <button
        onClick={onBackToShopping}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#254D3F] hover:text-[#1A372D] transition-colors mb-6 cursor-pointer"
      >
        <ArrowRight className="w-4 h-4" />
        <span>متابعة التسوق وإضافة مشغولات أخرى</span>
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#C97A57] text-xs font-bold mb-1">
          <Lock className="w-4 h-4" />
          <span>دفع إلكتروني آمن 100% بنظام الضمان (Escrow) • بدون تعاملات كاش</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1F2937]">
          إتمام الطلب وحساب الضمان الآمن
        </h1>
        <p className="text-xs sm:text-sm text-[#6B7280]">
          جميع المعاملات المالية مشفرة ومؤمنة في حساب وسيط؛ لا يتسلم الحرفي أمواله إلا بعد استلامك ومعاينتك.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items Review & Guarantee (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D3] p-5 card-shadow">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E6E1D3]">
              <h3 className="font-display font-bold text-base text-[#1F2937]">
                المشغولات المختارة ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>
              <button
                onClick={onClearCart}
                className="text-xs text-red-600 hover:text-red-700 font-bold cursor-pointer"
              >
                إفراغ السلة
              </button>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 pb-3 border-b border-[#E6E1D3]/60 last:border-0 last:pb-0"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E6E1D3] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-[#254D3F] block">
                      ورشة: {item.product.artisan.name}
                    </span>
                    <h4 className="font-bold text-xs text-[#1F2937] truncate">
                      {item.product.title}
                    </h4>

                    {item.product.isCustomOrder && item.product.requiredDeposit ? (
                      <div className="mt-0.5 space-y-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#C97A57]/15 text-[#C97A57] border border-[#C97A57]/30 inline-block">
                          تفصيل بالطلب • عربون: {item.product.requiredDeposit.toLocaleString('ar-EG')} ج.م
                        </span>
                        <div className="text-[11px] text-[#6B7280]">
                          الإجمالي: {item.product.price.toLocaleString('ar-EG')} ج.م
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-xs text-[#C97A57]">
                        {item.product.price.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center border border-[#E6E1D3] rounded-lg overflow-hidden shrink-0">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 hover:bg-[#F6F4ED] cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold px-2">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 hover:bg-[#F6F4ED] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg shrink-0 cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-[#E6E1D3] space-y-2 text-xs">
              <div className="flex justify-between text-[#6B7280]">
                <span>المجموع الفرعي للقطع:</span>
                <span className="font-mono font-bold text-[#1F2937]">{subtotal.toLocaleString('ar-EG')} ج.م</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>مصاريف الشحن والتغليف ({governorate}):</span>
                <span className="font-mono font-bold text-[#254D3F]">{shippingFee} ج.م</span>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-[#E6E1D3] text-sm font-bold text-[#1F2937]">
                <span>سعر الطلب الإجمالي:</span>
                <span className="font-mono text-lg text-[#1F2937] font-black">{grandTotal.toLocaleString('ar-EG')} ج.م</span>
              </div>

              {/* Deposit vs Remaining Breakdown */}
              {hasCustomItems && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1.5 mt-2">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>مجموع العربون المطلوب الآن:</span>
                    <span className="font-mono">{(totalDepositValue + shippingFee).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280] text-[11px]">
                    <span>المتبقي عند الاستلام والمعاينة:</span>
                    <span className="font-mono font-bold text-[#254D3F]">{Math.max(0, grandTotal - (totalDepositValue + shippingFee)).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 100% Anti-Cash & Anti-Fraud Policy Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6E1D3] card-shadow space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#254D3F]">
              <Lock className="w-4 h-4 text-[#C97A57]" />
              <span>سياسة منصة يدوي الصارمة ضد التعامل الكاش</span>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-relaxed">
              لحمايتك من النصب وضمان التزام الورشة بتسليم المشغولة بدقة، لا يُسمح بأي تعامل نقدي يدوي مباشر. كافة المدفوعات تتم حصرياً عبر بوابات الدفع والمحافظ الإلكترونية وتودع في حساب الضمان حتى المعاينة.
            </p>
          </div>
        </div>

        {/* Right: Checkout Shipping & Payment Form (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* USER-MANDATED "YADAWY PROTECTION" (ESCROW) EXPLANATORY CARD */}
          <div className="bg-gradient-to-br from-[#254D3F]/8 via-white to-white rounded-3xl border-2 border-[#254D3F]/25 p-5 sm:p-6 card-shadow space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D3]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#254D3F] text-white flex items-center justify-center shadow-xs shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#C97A57]" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm sm:text-base text-[#1F2937]">
                    نظام "حماية يدوي" لحساب الضمان (Yadawy Escrow Protection)
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    آلية تعامل إلكترونية تضمن حق المشتري والحرفي بنسبة 100% وتمنع أي تعامل كاش عشوائي
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#254D3F] text-white shrink-0">
                ضمان آمن 4 خطوات
              </span>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#254D3F]/10 text-[#254D3F] font-black text-xs flex items-center justify-center">1</span>
                  <span className="text-base">🔒</span>
                </div>
                <h4 className="font-bold text-xs text-[#1F2937]">1. الدفع الآمن واحتجاز المبلغ</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  تدفع العربون أو الإجمالي عبر محفظتك الإلكترونية، ويُحجز في حساب ضمان المنصة دون تحويله للبائع.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#254D3F]/10 text-[#254D3F] font-black text-xs flex items-center justify-center">2</span>
                  <span className="text-base">🛠️</span>
                </div>
                <h4 className="font-bold text-xs text-[#1F2937]">2. إشعار الورشة والتنفيذ والشحن</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  يصل إشعار فوري للحرفي بجدية الطلب وتغطية الخامات للبدء فوراً ثم تسليمه لمندوب الشحن المعتمد.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-[#254D3F]/10 text-[#254D3F] font-black text-xs flex items-center justify-center">3</span>
                  <span className="text-base">📦</span>
                </div>
                <h4 className="font-bold text-xs text-[#1F2937]">3. المعاينة والفحص عند الاستلام</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  تستلم المشغولة وتفحص خاماتها وجودتها بدقة للتأكد من مطابقتها الكاملة لمواصفات طلبك.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">4</span>
                  <span className="text-base">✅</span>
                </div>
                <h4 className="font-bold text-xs text-[#1F2937]">4. تأكيد الرضا وتحرير المستحقات</h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  بعد تأكيد رضاك، تقوم المنصة بتحرير مستحقات الورشة إلكترونياً وبشكل فوري.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 card-shadow space-y-6">
            
            {/* Step 1: Shipping Details */}
            <div>
              <h3 className="font-display font-bold text-lg text-[#1F2937] mb-1">
                1. بيانات الشحن ومندوب التوصيل
              </h3>
              <p className="text-xs text-[#6B7280]">
                سيتم التواصل معك هاتفياً قبل موعد التسليم
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  الاسم بالكامل: *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: أحمد عبد الرحمن"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/40 text-sm focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  رقم هاتف استلام الشحنة: *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (!walletNumber) setWalletNumber(e.target.value);
                  }}
                  placeholder="010XXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/40 text-sm font-mono focus:outline-none focus:border-[#254D3F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  المحافظة: *
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/40 text-sm focus:outline-none focus:border-[#254D3F]"
                >
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  العنوان بالتفصيل: *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="المنطقة، الشارع، رقم العمارة والشقة"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/40 text-sm focus:outline-none focus:border-[#254D3F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                ملاحظات خاصة بالتوصيل أو التغليف:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يرجى الاتصال قبل الوصول، تغليف هدية..."
                className="w-full px-4 py-2 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/40 text-xs focus:outline-none focus:border-[#254D3F]"
              />
            </div>

            {/* Step 2: Custom Deposit vs Full Payment Choice (if custom items exist) */}
            {hasCustomItems && (
              <div className="pt-4 border-t border-[#E6E1D3]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-base text-[#1F2937] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C97A57]" />
                    <span>2. خيار سداد مشغولات التفصيل بالطلب</span>
                  </h3>
                  <span className="text-[11px] font-bold text-[#C97A57] bg-[#C97A57]/10 px-2.5 py-0.5 rounded-full">
                    ميزة حماية العربون
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mb-3">
                  تحتوي سلتك على قطع تفصيل بالطلب؛ يمكنك دفع العربون فقط لبدء الورشة في التنفيذ وسداد الباقي عند الاستلام:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Pay Deposit Only */}
                  <label
                    onClick={() => setPayOption('deposit')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all block ${
                      payOption === 'deposit'
                        ? 'border-[#C97A57] bg-[#C97A57]/5 ring-2 ring-[#C97A57]/20'
                        : 'border-[#E6E1D3] hover:border-[#C97A57]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-[#1F2937]">سداد العربون فقط الآن (موصى به)</span>
                      <input
                        type="radio"
                        name="payOption"
                        checked={payOption === 'deposit'}
                        onChange={() => setPayOption('deposit')}
                        className="accent-[#C97A57]"
                      />
                    </div>
                    <div className="text-base font-mono font-black text-[#C97A57]">
                      {(totalDepositValue + shippingFee).toLocaleString('ar-EG')} ج.م
                    </div>
                    <span className="text-[11px] text-[#6B7280] block mt-1">
                      المتبقي ({Math.max(0, grandTotal - (totalDepositValue + shippingFee)).toLocaleString('ar-EG')} ج.م) يُسدد عند استلامك ومعاينتك للقطعة.
                    </span>
                  </label>

                  {/* Option 2: Pay Full Amount */}
                  <label
                    onClick={() => setPayOption('full')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all block ${
                      payOption === 'full'
                        ? 'border-[#254D3F] bg-[#254D3F]/5 ring-2 ring-[#254D3F]/20'
                        : 'border-[#E6E1D3] hover:border-[#254D3F]/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-[#1F2937]">سداد كامل المبلغ في الضمان</span>
                      <input
                        type="radio"
                        name="payOption"
                        checked={payOption === 'full'}
                        onChange={() => setPayOption('full')}
                        className="accent-[#254D3F]"
                      />
                    </div>
                    <div className="text-base font-mono font-black text-[#254D3F]">
                      {grandTotal.toLocaleString('ar-EG')} ج.م
                    </div>
                    <span className="text-[11px] text-[#6B7280] block mt-1">
                      يُحفظ المبلغ كاملاً في حساب الضمان ويُحرر للحرفي بعد تأكيد رضاك واستلامك.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Electronic Wallet Payment Methods (NO COD!) */}
            <div className="pt-4 border-t border-[#E6E1D3]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-bold text-base text-[#1F2937] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#254D3F]" />
                  <span>{hasCustomItems ? '3.' : '2.'} وسيلة الدفع الإلكتروني (محافظ كاش وإنستاباي)</span>
                </h3>
              </div>
              <p className="text-xs text-[#6B7280] mb-3">
                اختر المحفظة الإلكترونية التي ترغب بالسداد من خلالها:
              </p>

              {/* Grid of strictly Electronic Wallets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Vodafone Cash */}
                <label
                  onClick={() => setPaymentMethod('vodafone_cash')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20'
                      : 'border-[#E6E1D3] hover:border-red-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'vodafone_cash'}
                    onChange={() => setPaymentMethod('vodafone_cash')}
                    className="accent-red-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                      فودافون كاش (Vodafone Cash)
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      المحفظة الإلكترونية الأكثر استخداماً
                    </span>
                  </div>
                </label>

                {/* InstaPay */}
                <label
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'instapay'
                      ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-500/20'
                      : 'border-[#E6E1D3] hover:border-purple-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'instapay'}
                    onChange={() => setPaymentMethod('instapay')}
                    className="accent-purple-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                      إنستاباي (InstaPay عبر بوابة الدفع)
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      تحويل لحظي مباشر لحساب الضمان
                    </span>
                  </div>
                </label>

                {/* Orange Cash */}
                <label
                  onClick={() => setPaymentMethod('orange_cash')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'orange_cash'
                      ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                      : 'border-[#E6E1D3] hover:border-orange-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'orange_cash'}
                    onChange={() => setPaymentMethod('orange_cash')}
                    className="accent-orange-500"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      أورنج كاش (Orange Money)
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      دفع آمن عبر محفظة أورنج
                    </span>
                  </div>
                </label>

                {/* Etisalat Cash */}
                <label
                  onClick={() => setPaymentMethod('etisalat_cash')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'etisalat_cash'
                      ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                      : 'border-[#E6E1D3] hover:border-emerald-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'etisalat_cash'}
                    onChange={() => setPaymentMethod('etisalat_cash')}
                    className="accent-emerald-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                      اتصالات كاش (Etisalat Cash)
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      دفع آمن وسريع عبر محفظة اتصالات
                    </span>
                  </div>
                </label>

                {/* WE Pay */}
                <label
                  onClick={() => setPaymentMethod('we_pay')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'we_pay'
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-[#E6E1D3] hover:border-indigo-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'we_pay'}
                    onChange={() => setPaymentMethod('we_pay')}
                    className="accent-indigo-600"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      وي باي (WE Pay)
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      محفظة المصرية للاتصالات
                    </span>
                  </div>
                </label>

                {/* Bank Card / Meeza */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                    paymentMethod === 'card'
                      ? 'border-[#254D3F] bg-[#254D3F]/5 ring-2 ring-[#254D3F]/20'
                      : 'border-[#E6E1D3] hover:border-[#254D3F]/30 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="accent-[#254D3F]"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#254D3F]" />
                      بطاقة بنكية (ميزة / فيزا / ماستركارد)
                    </span>
                    <span className="text-[11px] text-[#6B7280] block">
                      دفع إلكتروني مباشر ومؤمن
                    </span>
                  </div>
                </label>

              </div>

              {/* Wallet Number Field (When paying with any mobile wallet) */}
              {paymentMethod !== 'card' && paymentMethod !== 'instapay' && (
                <div className="mt-4 p-4 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] space-y-2">
                  <label className="block text-xs font-bold text-[#1F2937]">
                    رقم المحفظة الإلكترونية التي ستقوم بالدفع منها: *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={walletNumber}
                      onChange={(e) => {
                        setWalletNumber(e.target.value);
                        setWalletError('');
                      }}
                      placeholder="010XXXXXXXX / 011XXXXXXXX / 012XXXXXXXX / 015XXXXXXXX"
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none ${
                        walletError ? 'border-red-500 bg-red-50/50' : 'border-[#E6E1D3] bg-white focus:border-[#254D3F]'
                      }`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">
                      📱 محفظة
                    </span>
                  </div>
                  {walletError && (
                    <p className="text-xs text-red-600 font-bold">
                      ⚠️ {walletError}
                    </p>
                  )}
                  <p className="text-[11px] text-[#6B7280]">
                    * سيصلك إشعار أو طلب دفع (OTP/PIN) من مزود محفظتك لتأكيد حجز المبلغ في حساب الضمان.
                  </p>
                </div>
              )}
            </div>

            {/* Place Order CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#C97A57] hover:bg-[#B36846] text-white font-bold text-base shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>
                  {hasCustomItems && payOption === 'deposit'
                    ? `تأكيد ودفع العربون في الضمان (${amountToPayNow.toLocaleString('ar-EG')} ج.م)`
                    : `تأكيد ودفع المبلغ في الضمان (${amountToPayNow.toLocaleString('ar-EG')} ج.م)`}
                </span>
                <Sparkles className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center justify-center gap-2 text-center text-[11px] text-[#6B7280] mt-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>أموالك مشفرة ومحفوظة بحساب الضمان ولا تُسلّم للحرفي إلا بعد استلامك ومعاينتك.</span>
              </div>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

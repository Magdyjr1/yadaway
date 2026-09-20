import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard,
  AlertCircle,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingViewProps {
  orders: Order[];
  initialOrderNumber?: string;
  onBack: () => void;
  onSelectProductById?: (productId: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orders,
  initialOrderNumber,
  onBack,
  onSelectProductById
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderNumber || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      const found = orders.find(o => o.orderNumber.toLowerCase() === initialOrderNumber.toLowerCase() || o.id === initialOrderNumber);
      if (found) return found;
    }
    return orders[0] || null;
  });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchInput(initialOrderNumber);
      const found = orders.find(o => o.orderNumber.toLowerCase() === initialOrderNumber.toLowerCase() || o.id === initialOrderNumber);
      if (found) {
        setActiveOrder(found);
        setErrorMessage('');
      }
    }
  }, [initialOrderNumber, orders]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    const query = searchInput.trim().toLowerCase();
    const found = orders.find(
      o => o.orderNumber.toLowerCase() === query || 
           o.id.toLowerCase() === query ||
           o.customerPhone.includes(query)
    );

    if (found) {
      setActiveOrder(found);
      setErrorMessage('');
    } else {
      setErrorMessage(`لم يتم العثور على طلب برقم "${searchInput}". يرجى التأكد من الرقم والمحاولة مرة أخرى.`);
    }
  };

  // Steps definition for visual progress stepper
  const STEPS: { key: OrderStatus; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      key: 'new',
      title: 'تم استلام وتأكيد الطلب',
      subtitle: 'تمت مراجعة المواصفات وإبلاغ ورشة الصانع',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      key: 'processing',
      title: 'قيد التجهيز والتصنيع بالورشة',
      subtitle: 'الصانع يجهز القطعة اليدوية وتغليفها الآمن',
      icon: <Package className="w-5 h-5" />
    },
    {
      key: 'shipped',
      title: 'تم التسليم لشركة الشحن',
      subtitle: 'الشحنة في طريقها مع مندوب التوصيل',
      icon: <Truck className="w-5 h-5" />
    },
    {
      key: 'delivered',
      title: 'تم التوصيل بنجاح',
      subtitle: 'تم استلام المشغولة وتحصيل المبلغ',
      icon: <Sparkles className="w-5 h-5" />
    }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'new': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 1;
    }
  };

  const activeStepIndex = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-right">
      
      {/* Header & Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#254D3F] hover:text-[#1A372D] transition-colors p-2 px-3 rounded-xl bg-white border border-[#E6E1D3] card-shadow cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للمتجر</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Truck className="w-4 h-4 text-[#C97A57]" />
          <span>تتبع الشحن الحي للقطع اليدوية</span>
        </div>
      </div>

      {/* Page Title & Search Bar */}
      <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 card-shadow-md mb-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1F2937]">
            تتبع مسار شحن وتجهيز طلبك
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
            أدخل رقم طلبك (مثل: <strong className="font-mono text-[#254D3F]">YD-8921</strong>) أو رقم هاتفك لمعرفة المرحلة الحالية لتصنيع القطعة وخروجها للشحن
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="اكتب رقم الطلب (مثال: YD-8921)..."
              className="w-full pr-11 pl-28 py-3 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#254D3F] focus:bg-white transition-all font-mono"
            />
            <Search className="w-5 h-5 text-[#6B7280] absolute right-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute left-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              بحث وتتبع
            </button>
          </div>
          {errorMessage && (
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </p>
          )}
        </form>

        {/* Quick Past Orders Chips (if available) */}
        {orders.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E6E1D3] flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-[#6B7280] font-medium">طلباتك الأخيرة:</span>
            {orders.slice(0, 4).map(ord => (
              <button
                key={ord.id}
                onClick={() => {
                  setActiveOrder(ord);
                  setSearchInput(ord.orderNumber);
                  setErrorMessage('');
                }}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeOrder?.id === ord.id
                    ? 'bg-[#C97A57] text-white shadow-xs'
                    : 'bg-[#F6F4ED] text-[#254D3F] hover:bg-[#EAE6DC] border border-[#E6E1D3]'
                }`}
              >
                {ord.orderNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Order Tracking Card */}
      {activeOrder ? (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Status Header Card */}
          <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-8 card-shadow-md">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E1D3]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-[#6B7280]">طلب رقم:</span>
                  <span className="font-mono font-black text-xl text-[#254D3F]">
                    {activeOrder.orderNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    activeOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    activeOrder.status === 'shipped' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                    activeOrder.status === 'processing' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-[#F6F4ED] text-[#254D3F] border border-[#E6E1D3]'
                  }`}>
                    {activeOrder.status === 'delivered' ? 'تم التوصيل' :
                     activeOrder.status === 'shipped' ? 'في طريقها إليك' :
                     activeOrder.status === 'processing' ? 'قيد التجهيز بالورشة' : 'طلب جديد'}
                  </span>
                </div>
                <div className="text-xs text-[#6B7280] flex items-center gap-3">
                  <span>تاريخ الطلب: {activeOrder.createdAt}</span>
                  <span>•</span>
                  <span>المحافظة: {activeOrder.governorate}</span>
                </div>
              </div>

              {/* Platform & Shipping Guarantee for this order */}
              <div className="px-4 py-2 rounded-xl bg-[#254D3F]/10 text-[#254D3F] text-xs font-bold border border-[#254D3F]/20 flex items-center justify-center gap-2 shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#254D3F]" />
                <span>شحن وتوصيل حصري عبر شركة الشحن المعتمدة</span>
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="pt-8 pb-4">
              <div className="relative">
                
                {/* Connecting Line */}
                <div className="hidden sm:block absolute top-5 right-8 left-8 h-1 bg-[#E6E1D3] -z-0">
                  <div 
                    className="h-full bg-[#254D3F] transition-all duration-500"
                    style={{ width: `${(activeStepIndex / (STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps List */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-2 relative z-10">
                  {STEPS.map((step, idx) => {
                    const isDone = idx <= activeStepIndex;
                    const isCurrent = idx === activeStepIndex;

                    return (
                      <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm shrink-0 ${
                          isDone 
                            ? 'bg-[#254D3F] text-white ring-4 ring-[#254D3F]/15' 
                            : 'bg-white border-2 border-[#E6E1D3] text-gray-400'
                        }`}>
                          {step.icon}
                        </div>

                        <div>
                          <h4 className={`text-xs sm:text-sm font-bold ${
                            isCurrent ? 'text-[#C97A57]' : isDone ? 'text-[#1F2937]' : 'text-gray-400'
                          }`}>
                            {step.title}
                          </h4>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 leading-tight">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Estimated Delivery Banner */}
            <div className="mt-8 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Clock className="w-4 h-4 text-[#C97A57]" />
                <span>الموعد التقديري للتسليم: خلال 2 إلى 4 أيام عمل من تاريخ خروج الشحنة</span>
              </div>
              <span className="text-stone-600 font-medium">
                تغليف كرتوني مقوى لحماية القطع اليدوية ضد الكسر
              </span>
            </div>

          </div>

          {/* Two-Column Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Ordered Items List (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E6E1D3] p-6 card-shadow-md">
              <h3 className="font-display font-black text-base text-[#1F2937] mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C97A57]" />
                <span>القطع اليدوية في هذا الطلب ({activeOrder.items.length})</span>
              </h3>

              <div className="divide-y divide-[#E6E1D3]">
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-[#E6E1D3]"
                    />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#254D3F] block">
                        صنع يدوي: {item.product.artisan.name} ({item.product.artisan.governorate})
                      </span>
                      <h4 className="font-display font-bold text-sm text-[#1F2937] line-clamp-1 mb-1">
                        {item.product.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-[#6B7280]">
                        <span>الكمية: <strong>{item.quantity}</strong></span>
                        <span className="font-mono font-bold text-[#1F2937]">
                          {(item.product.price * item.quantity).toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      {item.selectedCustomization && (
                        <p className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded mt-1">
                          تخصيص: {item.selectedCustomization}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="mt-6 pt-4 border-t border-[#E6E1D3] space-y-2 text-xs">
                <div className="flex justify-between text-[#6B7280]">
                  <span>قيمة المشغولات:</span>
                  <span className="font-mono">
                    {(activeOrder.totalAmount - activeOrder.shippingFee).toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>مصاريف الشحن للمحافظة:</span>
                  <span className="font-mono">{activeOrder.shippingFee.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#1F2937] pt-2 border-t border-[#E6E1D3]">
                  <span>الإجمالي المطلوب:</span>
                  <span className="font-mono text-[#254D3F] text-base">
                    {activeOrder.totalAmount.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping & Recipient Details (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Recipient Details */}
              <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 card-shadow-md space-y-4">
                <h3 className="font-display font-black text-base text-[#1F2937] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C97A57]" />
                  <span>بيانات التوصيل والمستلم</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">اسم المستلم:</span>
                    <span className="font-bold text-[#1F2937]">{activeOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">رقم الهاتف:</span>
                    <span className="font-mono font-bold text-[#1F2937]">{activeOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">المحافظة:</span>
                    <span className="font-bold text-[#254D3F]">{activeOrder.governorate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">العنوان التفصيلي:</span>
                    <span className="font-medium text-[#1F2937] text-left max-w-[200px]">{activeOrder.customerAddress}</span>
                  </div>
                  {activeOrder.notes && (
                    <div className="pt-2 border-t border-[#E6E1D3] text-[11px] text-[#6B7280]">
                      <strong>ملاحظات العميل:</strong> {activeOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Escrow Info */}
              <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 card-shadow-md space-y-3">
                <h3 className="font-display font-black text-base text-[#1F2937] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#C97A57]" />
                  <span>طريقة الدفع وحساب الضمان</span>
                </h3>

                <div className="p-3.5 rounded-2xl bg-[#F6F4ED] text-xs space-y-2 border border-[#E6E1D3]">
                  <div className="flex items-center justify-between font-bold text-[#254D3F]">
                    <span>{activeOrder.walletProvider || (
                      activeOrder.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                      activeOrder.paymentMethod === 'orange_cash' ? 'أورنج كاش' :
                      activeOrder.paymentMethod === 'etisalat_cash' ? 'اتصالات كاش' :
                      activeOrder.paymentMethod === 'we_pay' ? 'وي باي' :
                      activeOrder.paymentMethod === 'instapay' ? 'إنستاباي (InstaPay)' : 'بطاقة بنكية'
                    )}</span>
                    <ShieldCheck className="w-4 h-4 text-[#C97A57]" />
                  </div>

                  {activeOrder.walletNumber && (
                    <div className="flex justify-between text-[11px] text-[#6B7280]">
                      <span>رقم المحفظة المحوّل منها:</span>
                      <span className="font-mono font-bold text-[#1F2937]">{activeOrder.walletNumber}</span>
                    </div>
                  )}

                  {activeOrder.paymentTransactionId && (
                    <div className="flex justify-between text-[11px] text-[#6B7280]">
                      <span>كود المعاملة:</span>
                      <span className="font-mono font-bold text-[#C97A57]">{activeOrder.paymentTransactionId}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#E6E1D3]/80 space-y-1">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-emerald-800">
                        {activeOrder.isDepositOnly ? 'المبلغ المسدد الآن (العربون + الشحن):' : 'المبلغ المسدد بالكامل الآن:'}
                      </span>
                      <span className="font-mono text-emerald-800">
                        {(activeOrder.paidAmount || activeOrder.totalAmount).toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>

                    {activeOrder.remainingAmount && activeOrder.remainingAmount > 0 ? (
                      <div className="flex justify-between text-xs text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 font-bold">
                        <span>المتبقي عند المعاينة والاستلام:</span>
                        <span className="font-mono">{activeOrder.remainingAmount.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#254D3F] bg-[#254D3F]/5 p-2.5 rounded-xl border border-[#254D3F]/15">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#254D3F]" />
                  <span>
                    <strong>حماية يدوي (Escrow):</strong> لا يتم الإفراج عن المبلغ للورشة إلا بعد تأكيد استلامك ومعاينتك للقطعة.
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E6E1D3] card-shadow">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#1F2937] mb-1">لا توجد طلبات لعرضها حالياً</h3>
          <p className="text-xs text-[#6B7280]">قم بالبحث باستخدام رقم الطلب لتتبع شحنته مباشرة</p>
        </div>
      )}

    </div>
  );
};

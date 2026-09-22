import React, { useState } from 'react';
import {
  ShieldAlert,
  Scale,
  Coins,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Store,
  DollarSign,
  Lock,
  ArrowLeft,
  ArrowRight,
  Send,
  Eye,
  MessageCircle,
  Upload,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Order, Product, ShowcaseItem, SupportTicket } from '../types';

interface SuperAdminDashboardProps {
  orders: Order[];
  products: Product[];
  showcaseItems: ShowcaseItem[];
  supportTickets: SupportTicket[];
  onAdminReply: (ticketId: string, text: string) => void;
  onApproveProduct: (id: string) => void;
  onRejectProduct: (id: string) => void;
  onApproveShowcaseItem: (id: string) => void;
  onRejectShowcaseItem: (id: string) => void;
  onBack: () => void;
}

// Mock extra operational admin data for disputes & live chat tickets
const INITIAL_DISPUTES = [
  {
    id: 'disp-1',
    orderNumber: 'YDW-8723-2024',
    buyerName: 'رنا أحمد',
    artisanName: 'عم إبراهيم النوبي',
    itemTitle: 'فازة خزفية مزخرفة بالذهب نيلية',
    amount: 1450,
    reason: 'القطعة المستلمة بها كسر واضح في القاعدة الجانبية وتختلف عن الصورة الرئيسية في اللمعان.',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
    status: 'pending', // pending, released_buyer, released_artisan
    chatLog: [
      { sender: 'buyer', text: 'السلام عليكم يا عم إبراهيم، الفازة وصلتني النهاردة للأسف مكسورة من تحت والدهان خفيف جداً عكس الصور خالص.', time: '12:30 م' },
      { sender: 'artisan', text: 'وعليكم السلام يا بنتي. الفازة خارجة من الورشة سليمة ومغلفة بكرتون فوم مزدوج، ده أكيد كسر من شركة الشحن أو مندوب التسليم.', time: '01:05 م' },
      { sender: 'buyer', text: 'أنا فتحت الكرتونة قدام المندوب بس هو رفض يستلمها تاني وقال كلمي الدعم، وأنا دافعة المبلغ كامل بالضمان وعايزة استرداد.', time: '01:15 م' }
    ]
  },
  {
    id: 'disp-2',
    orderNumber: 'YDW-9104-2024',
    buyerName: 'كريم محمود',
    artisanName: 'حسام الأرابلوسكي',
    itemTitle: 'صندوق أرابيسك خشب جوز مطعم بالصدف',
    amount: 3200,
    reason: 'الحرفي يطلب زيادة في السعر المتفق عليه بعد دفع العربون ويدعي أن الصدف الطبيعي ارتفع سعره.',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
    status: 'pending',
    chatLog: [
      { sender: 'buyer', text: 'يا بشمهندس حسام عدي أسبوعين على الاتفاق والعربون مدفوع في الضمان، ليه باعت تقولي نزود 500 جنيه كمان؟', time: '10:00 ص' },
      { sender: 'artisan', text: 'يا فندم الصدف البحري المستورد زاد سعره الضعف الأسبوع ده في السوق وخامات التلميع وغراء الحِرف، الورشة هتخسر كدة.', time: '11:12 ص' },
      { sender: 'buyer', text: 'الاتفاق كان واضح والسعر نهائي، لو مش هتقدر تنفذ بنفس السعر يرجى إلغاء الطلب عشان أسترد العربون كامل.', time: '11:30 ص' }
    ]
  }
];

const INITIAL_VENDOR_PAYOUTS = [
  { id: 'v-1', name: 'عم إبراهيم النوبي', workshop: 'ورشة خزف تونس الأصيل', escrowLocked: 3800, readyPayout: 5200, wallet: '01012345678', method: 'فودافون كاش' },
  { id: 'v-2', name: 'حسام الأرابلوسكي', workshop: 'مؤسسة إحياء الأرابيسك المصري', escrowLocked: 7500, readyPayout: 12400, wallet: 'hossam@instapay', method: 'إنستاباي' },
  { id: 'v-3', name: 'أميرة الحايك', workshop: 'نول كليم وسجاد أخميم التراثي', escrowLocked: 0, readyPayout: 4300, wallet: '01229988776', method: 'فودافون كاش' },
  { id: 'v-4', name: 'جرجس الفخراني', workshop: 'فخار قرية تونس ومصر القديمة', escrowLocked: 2100, readyPayout: 0, wallet: '01144556677', method: 'اتصالات كاش' }
];



export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  orders,
  products,
  showcaseItems,
  supportTickets,
  onAdminReply,
  onApproveProduct,
  onRejectProduct,
  onApproveShowcaseItem,
  onRejectShowcaseItem,
  onBack
}) => {
  const [activeModule, setActiveModule] = useState<'analytics' | 'disputes' | 'payouts' | 'moderation' | 'chat'>('analytics');

  // Operational states
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [payouts, setPayouts] = useState(INITIAL_VENDOR_PAYOUTS);

  // --- Financial & Operational Analytics Calculations ---
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const revenueFromDelivered = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Platform profit (Commission logic: average 12% if not stored per order)
  const platformProfit = revenueFromDelivered * 0.12;
  const pendingEscrowTotal = orders
    .filter(o => o.status !== 'delivered')
    .reduce((sum, o) => sum + (o.paidAmount || 0), 0);

  const avgOrderValue = orders.length > 0 ? totalGMV / orders.length : 0;

  const governorateStats = orders.reduce((acc: Record<string, number>, o) => {
    acc[o.governorate] = (acc[o.governorate] || 0) + 1;
    return acc;
  }, {});

  const topGovernorates = Object.entries(governorateStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Selection states for details viewing
  const [selectedDispute, setSelectedDispute] = useState<typeof INITIAL_DISPUTES[0] | null>(INITIAL_DISPUTES[0]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(supportTickets[0]?.id || null);
  const selectedTicket = supportTickets.find(t => t.id === selectedTicketId) || null;
  const [chatReply, setChatReply] = useState('');

  // Payout action state
  const [processingPayoutVendorId, setProcessingPayoutVendorId] = useState<string | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState('');

  // WhatsApp Automation logs state for display logs feedback
  const [whatsappLogs, setWhatsappLogs] = useState<string[]>([
    '⚙️ خدمة بايلز Baileys / whatsapp-web.js متصلة عبر كود QR وجاهزة للإرسال المجاني...'
  ]);

  const triggerWhatsAppAlert = (message: string) => {
    const time = new Date().toLocaleTimeString('ar-EG');
    setWhatsappLogs(prev => [`[${time}] 📱 إشعار واتساب تلقائي: ${message}`, ...prev]);
  };

  // ── Module 1 Actions: Dispute Resolution
  const handleResolveDispute = (disputeId: string, resolution: 'released_buyer' | 'released_artisan') => {
    setDisputes(prev => prev.map(d => {
      if (d.id === disputeId) {
        const partyText = resolution === 'released_buyer' ? 'رد الأموال للمشتري' : 'تحويل المبالغ للحرفي';
        triggerWhatsAppAlert(`تمت تسوية النزاع للطلب ${d.orderNumber}. تم اتخاذ قرار: ${partyText}. تم إرسال رسائل تأكيد فورية للطرفين المشتري (${d.buyerName}) والصانع (${d.artisanName}).`);
        return { ...d, status: resolution };
      }
      return d;
    }));
    if (selectedDispute && selectedDispute.id === disputeId) {
      setSelectedDispute(prev => prev ? { ...prev, status: resolution } : null);
    }
  };

  // ── Module 2 Actions: Payouts Trigger
  const handleTriggerPayout = (vendorId: string) => {
    setProcessingPayoutVendorId(vendorId);
    setUploadedReceipt(null);
    setPayoutSuccessMessage('');
  };

  const handleConfirmPayoutReceiptUpload = (vendorId: string) => {
    setPayouts(prev => prev.map(p => {
      if (p.id === vendorId) {
        triggerWhatsAppAlert(`تم تحويل مبلغ السحب بنجاح للحرفي (${p.name}) بقيمة ${p.readyPayout} ج.م عبر ${p.method} وإرفاق الإيصال بنظام الضمان المالي.`);
        return { ...p, readyPayout: 0 };
      }
      return p;
    }));
    setPayoutSuccessMessage('✓ تم إرسال الأموال للحرفي بنجاح ورفع إيصال المعاملة المعتمد للضمان!');
    setTimeout(() => {
      setProcessingPayoutVendorId(null);
      setPayoutSuccessMessage('');
    }, 2000);
  };

  // ── Module 4 Actions: Support Chat Response
  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReply.trim() || !selectedTicket) return;

    triggerWhatsAppAlert(`تم إرسال تنبيه واتساب للمستخدم (${selectedTicket.userName}) بوجود رد رسمي جديد من المشرف العام بخصوص شكوى "${selectedTicket.subject}".`);

    onAdminReply(selectedTicket.id, chatReply.trim());
    setChatReply('');
  };

  // Moderation queue helpers (count items that haven't been approved yet)
  // For safety mock in UI we mark them as moderated locally by removing from active list
  const [localProductsQueue, setLocalProductsQueue] = useState(products.slice(0, 3));
  const [localShowcaseQueue, setLocalShowcaseQueue] = useState(showcaseItems.slice(0, 3));

  const handleModerationAction = (id: string, type: 'product' | 'showcase', action: 'approve' | 'reject') => {
    if (type === 'product') {
      setLocalProductsQueue(prev => prev.filter(p => p.id !== id));
      if (action === 'approve') onApproveProduct(id);
      else onRejectProduct(id);
    } else {
      setLocalShowcaseQueue(prev => prev.filter(s => s.id !== id));
      if (action === 'approve') onApproveShowcaseItem(id);
      else onRejectShowcaseItem(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right font-sans" dir="rtl">

      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-gray-900">لوحة التحكم العليا للمشرف (Super Admin Dashboard)</h1>
            <p className="text-xs text-gray-500 mt-0.5">مركز الحماية، تسوية النزاعات، إدارة الحسابات والتحويلات النقدية لمنصة يَدَوِي</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للسوق الرئيسي</span>
        </button>
      </div>

      {/* Grid Menu Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <button
          onClick={() => setActiveModule('analytics')}
          className={`p-4 rounded-2xl border transition-all text-right cursor-pointer flex flex-col justify-between h-28 ${
            activeModule === 'analytics'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <BarChart3 className={`w-5 h-5 ${activeModule === 'analytics' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <span className="block font-bold text-sm">تحليل العمليات والأرباح</span>
            <span className="text-[10px] opacity-80">إحصائيات حية وشاملة للمنصة</span>
          </div>
        </button>

        <button
          onClick={() => setActiveModule('disputes')}
          className={`p-4 rounded-2xl border transition-all text-right cursor-pointer flex flex-col justify-between h-28 ${
            activeModule === 'disputes'
              ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 text-red-900 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Scale className={`w-5 h-5 ${activeModule === 'disputes' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
              {disputes.filter(d => d.status === 'pending').length} معلق
            </span>
          </div>
          <div>
            <span className="block font-bold text-sm">مركز الشكاوي والنزاعات</span>
            <span className="text-[10px] opacity-80">تحكيم أموال الضمان وحل المشكلات</span>
          </div>
        </button>

        <button
          onClick={() => setActiveModule('payouts')}
          className={`p-4 rounded-2xl border transition-all text-right cursor-pointer flex flex-col justify-between h-28 ${
            activeModule === 'payouts'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <Coins className={`w-5 h-5 ${activeModule === 'payouts' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
              المحاسبة المالية
            </span>
          </div>
          <div>
            <span className="block font-bold text-sm">مستحقات ومدفوعات التجار</span>
            <span className="text-[10px] opacity-80">تحويل كاش فوري للمحافظ</span>
          </div>
        </button>

        <button
          onClick={() => setActiveModule('moderation')}
          className={`p-4 rounded-2xl border transition-all text-right cursor-pointer flex flex-col justify-between h-28 ${
            activeModule === 'moderation'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <CheckSquare className={`w-5 h-5 ${activeModule === 'moderation' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              {localProductsQueue.length + localShowcaseQueue.length} فحص
            </span>
          </div>
          <div>
            <span className="block font-bold text-sm">رقابة ومراجعة المحتوى</span>
            <span className="text-[10px] opacity-80">اعتماد المشغولات الجديدة</span>
          </div>
        </button>

        <button
          onClick={() => setActiveModule('chat')}
          className={`p-4 rounded-2xl border transition-all text-right cursor-pointer flex flex-col justify-between h-28 ${
            activeModule === 'chat'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <MessageSquare className={`w-5 h-5 ${activeModule === 'chat' ? 'text-amber-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
              حي الآن
            </span>
          </div>
          <div>
            <span className="block font-bold text-sm">محادثات الدعم الفني</span>
            <span className="text-[10px] opacity-80">الرد المباشر على التذاكر</span>
          </div>
        </button>
      </div>

      {/* --- WHATSAPP AUTOMATION LOGS BAR --- */}
      <div className="mb-8 p-4 rounded-2xl bg-gray-900 text-emerald-400 border border-emerald-900/30 font-mono text-[10px] overflow-hidden relative">
        <div className="flex items-center gap-2 mb-2 border-b border-emerald-900/50 pb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold uppercase tracking-wider">WhatsApp Automation Service [LIVE]</span>
        </div>
        <div className="space-y-1 max-h-16 overflow-y-auto custom-scrollbar">
          {whatsappLogs.map((log, i) => (
            <div key={i} className="opacity-90">{log}</div>
          ))}
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
           <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20 text-[8px]">QR CONNECTED</span>
        </div>
      </div>

      {/* ── MODULE 0: FINANCIAL & OPERATIONAL ANALYTICS ── */}
      {activeModule === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Financial Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">إجمالي حجم التداول (GMV)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-black text-gray-900">{totalGMV.toLocaleString('ar-EG')}</span>
                <span className="text-xs font-bold text-gray-400">ج.م</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <span className="inline-block px-1 rounded bg-emerald-50">+12%</span> نمو عن الشهر الماضي
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">صافي ربح المنصة (المحقق)</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-black text-[#254D3F]">{platformProfit.toLocaleString('ar-EG')}</span>
                <span className="text-xs font-bold text-gray-400">ج.م</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">من مبيعات الطلبات المكتملة فقط</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">مبالغ في الضمان (Escrow)</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-black text-amber-700">{pendingEscrowTotal.toLocaleString('ar-EG')}</span>
                <span className="text-xs font-bold text-gray-400">ج.م</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">محجوزة حتى استلام الزبائن</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 card-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">متوسط قيمة الطلب (AOV)</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-black text-gray-900">{Math.round(avgOrderValue).toLocaleString('ar-EG')}</span>
                <span className="text-xs font-bold text-gray-400">ج.م</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">لكل عملية شراء فردية</p>
            </div>
          </div>

          {/* Operational Insights & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Governorate */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow">
              <h3 className="font-bold text-sm text-gray-900 mb-6 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-gray-400" />
                <span>أكثر المحافظات طلباً للمشغولات اليدوية</span>
              </h3>
              <div className="space-y-4">
                {topGovernorates.map(([gov, count], idx) => {
                  const percentage = (count / orders.length) * 100;
                  return (
                    <div key={gov}>
                      <div className="flex justify-between items-center mb-1.5 text-xs">
                        <span className="font-bold text-gray-700">{idx + 1}. {gov}</span>
                        <span className="text-gray-500">{count} طلب ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C97A57] rounded-full transition-all duration-1000"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform Health & Success Rates */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow">
              <h3 className="font-bold text-sm text-gray-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>مؤشرات أداء الجودة والعمليات</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">نسبة نجاح التسليم</span>
                  <span className="text-xl font-mono font-black text-gray-900">98.4%</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">سرعة الصنع (متوسط)</span>
                  <span className="text-xl font-mono font-black text-gray-900">4.2 يوم</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">نسبة المرتجعات / النزاعات</span>
                  <span className="text-xl font-mono font-black text-red-600">1.2%</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold block mb-1">تقييم رضا العملاء</span>
                  <span className="text-xl font-mono font-black text-[#254D3F]">4.9 / 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE 1: COMPLAINTS & DISPUTE RESOLUTION CENTER ── */}
      {activeModule === 'disputes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Dispute Sidebar List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-bold text-sm text-gray-700 mb-2">شكاوي الزبائن والنزاعات النشطة ({disputes.length})</h3>
            {disputes.map(disp => (

              <div
                key={disp.id}
                onClick={() => setSelectedDispute(disp)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedDispute?.id === disp.id
                    ? 'bg-white border-red-500 shadow-md ring-1 ring-red-500/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-800">{disp.orderNumber}</span>
                  {disp.status === 'pending' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">قيد التحكيم</span>}
                  {disp.status === 'released_buyer' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">رُد للمشتري</span>}
                  {disp.status === 'released_artisan' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">حُوّل للحرفي</span>}
                </div>
                <h4 className="font-bold text-xs text-gray-900 truncate mt-1">{disp.itemTitle}</h4>
                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2 border-t border-gray-100 pt-2">
                  <span>المبلغ بالضمان: <strong>{disp.amount} ج.م</strong></span>
                  <span>{disp.buyerName} ↔ {disp.artisanName}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dispute Main Detailed Work Area */}
          <div className="lg:col-span-2">
            {selectedDispute ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow flex flex-col justify-between h-full min-h-[500px]">
                <div>
                  {/* Detailed Meta Header */}
                  <div className="flex flex-wrap items-start justify-between border-b border-gray-100 pb-4 mb-4 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-red-600 block mb-0.5">غرفة النزاع القضائي والمالي</span>
                      <h3 className="font-black text-base text-gray-900">{selectedDispute.itemTitle}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">الطلب رقم: {selectedDispute.orderNumber} • قيمة حساب الضمان: <strong className="text-gray-900">{selectedDispute.amount} جنيه</strong></p>
                    </div>

                    {/* Resolution Action Trigger Box */}
                    {selectedDispute.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveDispute(selectedDispute.id, 'released_buyer')}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          رد الأموال للمشتري ↩
                        </button>
                        <button
                          onClick={() => handleResolveDispute(selectedDispute.id, 'released_artisan')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          إفراج للحرفي 💸
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl text-center bg-gray-50 border border-gray-200 text-xs font-black text-gray-700">
                        {selectedDispute.status === 'released_buyer' ? '✓ تم إغلاق النزاع ورد الأموال بالكامل لمصلحة المشتري' : '✓ تم إغلاق النزاع وتحويل مستحقات الضمان كاملة للورشه الحرفية'}
                      </div>
                    )}
                  </div>

                  {/* Dispute Description & Photo Proof */}
                  <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-red-800 block">سبب فتح النزاع المرفوع من المشتري:</span>
                      <p className="text-xs text-gray-700 leading-relaxed">{selectedDispute.reason}</p>
                    </div>
                    <div className="shrink-0">
                      <span className="text-[10px] text-gray-400 block mb-1 text-center font-bold">صورة ملحقة بالاثبات</span>
                      <img
                        src={selectedDispute.image}
                        alt="اثبات النزاع"
                        className="w-20 h-20 rounded-xl object-cover border border-red-200 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Buyer Artisan Full Chat Logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span>سجل المحادثات الكامل بين الطرفين (Chat Logs):</span>
                    </h4>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 max-h-[260px] overflow-y-auto space-y-3">
                      {selectedDispute.chatLog.map((chat, idx) => {
                        const isBuyer = chat.sender === 'buyer';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[85%] ${isBuyer ? 'mr-0 ml-auto items-end' : 'ml-0 mr-auto items-start'}`}
                          >
                            <span className="text-[10px] text-gray-400 font-bold mb-0.5">
                              {isBuyer ? `المشتري (${selectedDispute.buyerName})` : `الحرفي (${selectedDispute.artisanName})`}
                            </span>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isBuyer ? 'bg-[#254D3F] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                            }`}>
                              {chat.text}
                            </div>
                            <span className="text-[9px] text-gray-400 font-mono mt-0.5">{chat.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 border-t border-gray-100 pt-4 mt-4 italic text-center">
                  * بصفتك مشرف عام، قرارات إفراج أو رد المبالغ نهائية وتؤثر فوراً على الحسابات المصرفية ومحافظ الضمان الإلكترونية.
                </div>
              </div>
            ) : (
              <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-8 text-center text-gray-400 text-xs font-bold">
                يرجى اختيار أحد نزاعات طلبات الضمان المعلقة من القائمة الجانبية لبدء التحكيم المالي.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODULE 2: VENDOR PAYOUTS MANAGEMENT ── */}
      {activeModule === 'payouts' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-display font-black text-lg text-gray-900">إدارة مستحقات الحرفيين والتحويلات المالية المباشرة</h3>
            <p className="text-xs text-gray-500 mt-0.5">مراجعة المبالغ المحتجزة في الضمان للطلبات الجارية وتدشين تحويل الأرباح للمحافظ المعتمدة في مصر</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-black">
                  <th className="p-4">اسم الحرفي / الورشة</th>
                  <th className="p-4 text-center">رصيد الضمان المحتجز (Escrow Locked)</th>
                  <th className="p-4 text-center">أرباح جاهزة للسحب (Ready Payout)</th>
                  <th className="p-4">المحفظة / الحساب</th>
                  <th className="p-4 text-center">الإجراءات التشغيلية</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map(v => (
                  <tr key={v.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="p-4">
                      <span className="font-bold block text-gray-900">{v.name}</span>
                      <span className="text-[10px] text-gray-500">{v.workshop}</span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-amber-700 bg-amber-50/20">
                      {v.escrowLocked.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-4 text-center font-mono font-black text-emerald-700 bg-emerald-50/20">
                      {v.readyPayout.toLocaleString('ar-EG')} ج.م
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 font-bold block w-fit mb-1">{v.method}</span>
                      <span className="font-mono text-xs">{v.wallet}</span>
                    </td>
                    <td className="p-4 text-center">
                      {v.readyPayout > 0 ? (
                        <button
                          onClick={() => handleTriggerPayout(v.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          إرسال كاش فوري
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 italic">لا توجد مبالغ مستحقة</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Trigger Payout Receipt Modal overlay */}
          {processingPayoutVendorId && (() => {
            const currentVendor = payouts.find(p => p.id === processingPayoutVendorId);
            if (!currentVendor) return null;

            return (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl max-w-sm w-full border border-gray-200 p-6 text-right space-y-4 shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-gray-900">تأكيد تحويل أرباح الحرفي إلكترونياً</h4>
                  </div>

                  {payoutSuccessMessage ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed text-center">
                      {payoutSuccessMessage}
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        سيتم إرسال مبلغ <strong className="text-emerald-700">{currentVendor.readyPayout} ج.م</strong> للحرفي <strong>{currentVendor.name}</strong> مباشرة عبر نظام <strong>{currentVendor.method}</strong> على الرقم أو الحساب: <code>{currentVendor.wallet}</code>.
                      </p>

                      <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 transition-colors"
                        onClick={() => setUploadedReceipt('receipt_payout_success_img_url')}
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-700">
                          {uploadedReceipt ? '✓ تم اختيار إيصال التحويل بنجاح' : 'اضغط لرفع إيصال / لقطة شاشة التحويل البنكي'}
                        </span>
                        <span className="text-[9px] text-gray-400">حقل إلزامي لضمان التوثيق المالي المحاسبي</span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setProcessingPayoutVendorId(null)}
                          className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >إلغاء</button>
                        <button
                          disabled={!uploadedReceipt}
                          onClick={() => handleConfirmPayoutReceiptUpload(currentVendor.id)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 disabled:bg-gray-300 text-white text-xs font-bold shadow-md hover:bg-emerald-700 transition-colors"
                        >تأكيد ورفع الإيصال</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── MODULE 3: CONTENT MODERATION QUEUE ── */}
      {activeModule === 'moderation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section 1: New Crafted Products Waiting Approval */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow space-y-4">
            <div>
              <h3 className="font-display font-black text-base text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>طابور فحص المنتجات والمشغولات الجديدة قبل العرض في البازار</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">التأكد من جودة الصور، أصالة الوصف، وعدم وجود أرقام تواصل أو خرق لسياسة تسعير العمولة</p>
            </div>

            {localProductsQueue.length === 0 ? (
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-4 rounded-xl font-bold text-center">
                ✓ طابور المنتجات فارغ حالياً! تم مراجعة واعتماد جميع القطع المرفوعة من الحرفيين بنجاح.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {localProductsQueue.map(p => (
                  <div key={p.id} className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-gray-100">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/60 text-white font-mono text-[10px] rounded font-bold">
                          {p.price} ج.م
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 mb-1">{p.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">{p.description}</p>
                      <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg mb-3">
                        الصانع: <strong>{p.artisan?.name || 'ورشة يدوي'}</strong> • الحرفة: {p.category}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => handleModerationAction(p.id, 'product', 'reject')}
                        className="py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold transition-all cursor-pointer"
                      >رفض المشغولة</button>
                      <button
                        onClick={() => handleModerationAction(p.id, 'product', 'approve')}
                        className="py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                      >اعتماد ونشر للزبائن</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Showcase Items Portfolio Waiting Approval */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow space-y-4">
            <div>
              <h3 className="font-display font-black text-base text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-purple-600" />
                <span>مراجعة بوستات فاترينة الأعمال والقطع التراثية المضافة للملهم</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">مراجعة بورتفوليو الحرفيين للتأكد من هويتها التراثية المصرية الفريدة قبل إتاحتها في المعرض العام</p>
            </div>

            {localShowcaseQueue.length === 0 ? (
              <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 p-4 rounded-xl font-bold text-center">
                ✓ طابور بوستات الفاترينة فارغ! تم مراجعة بورتفوليو كل الفنانين.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {localShowcaseQueue.map(s => (
                  <div key={s.id} className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-gray-100">
                        <img src={s.images[0]} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-purple-600 text-white text-[9px] rounded font-bold">
                          {s.status === 'portfolio_only' ? 'عرض فني فقط' : 'قابل للتكرار'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 mb-1">{s.title}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">{s.description}</p>
                      <div className="text-[10px] text-gray-400 bg-gray-50 p-2 rounded-lg mb-3">
                        الورشة: <strong>{s.workshopName || s.artisanName}</strong> • التصنيف: {s.category}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => handleModerationAction(s.id, 'showcase', 'reject')}
                        className="py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold transition-all cursor-pointer"
                      >رفض وعودة لمسودة</button>
                      <button
                        onClick={() => handleModerationAction(s.id, 'showcase', 'approve')}
                        className="py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold transition-all shadow-xs cursor-pointer"
                      >نشر بالمعرض العام</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODULE 4: ADMIN CHAT SUPPORT TICKETS ── */}
      {activeModule === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Ticket Sidebar List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-bold text-sm text-gray-700 mb-2">تذاكر الدعم والشكاوى المفتوحة ({supportTickets.length})</h3>
            {supportTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer text-right ${
                  selectedTicketId === t.id
                    ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400">{t.lastUpdated}</span>
                  <span className={`w-2 h-2 rounded-full ${t.status === 'open' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                </div>
                <h4 className="font-bold text-xs text-gray-900 truncate">{t.subject}</h4>
                <p className="text-[10px] text-gray-500 truncate mt-1">المرسل: {t.userName}</p>
              </div>
            ))}
          </div>

          {/* Ticket Chat Interface Box */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 card-shadow flex flex-col justify-between h-[500px]">
                {/* Chat Top Banner Header */}
                <div className="border-b border-gray-100 pb-3 mb-3 shrink-0 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 block">مركز الرد على الاستفسارات الفنية</span>
                    <h3 className="font-bold text-sm text-gray-900">{selectedTicket.subject}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">المستخدم: {selectedTicket.userName}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedTicket.status === 'open'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {selectedTicket.status === 'open' ? 'بإنتظار رد المشرف' : 'تم الرد'}
                  </span>
                </div>

                {/* Messages Body Area */}
                <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 mb-4">
                  {selectedTicket.messages.map((m, idx) => {
                    const isAdmin = m.sender === 'admin' || m.sender === 'support' || m.sender === 'system';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[80%] ${isAdmin ? 'mr-0 ml-auto items-end' : 'ml-0 mr-auto items-start'}`}
                      >
                        <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isAdmin ? 'bg-[#254D3F] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono mt-0.5">{m.timestamp}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form Footer Component */}
                <form onSubmit={handleSendAdminReply} className="shrink-0 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatReply}
                    onChange={(e) => setChatReply(e.target.value)}
                    placeholder="اكتب رد الدعم الفني الرسمي لحل مشكلة المستخدم..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:border-[#254D3F]"
                  />
                  <button
                    type="submit"
                    disabled={!chatReply.trim()}
                    className="p-3 rounded-xl bg-[#254D3F] text-white disabled:bg-gray-200 transition-all shadow-md cursor-pointer shrink-0"
                    title="إرسال الرد"
                  >
                    <Send className="w-4 h-4 transform rotate-180" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex items-center justify-center p-8 text-center text-gray-400 text-xs font-bold">
                يرجى اختيار أحد تذاكر الدعم والشكاوى المفتوحة من القائمة للبدء في الرد وحلها مباشرة.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

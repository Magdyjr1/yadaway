import React, { useState } from 'react';
import {
  ShieldCheck,
  Scale,
  UserShield,
  FileText,
  ChevronLeft,
  Lock,
  Eye,
  CheckCircle2,
  HelpCircle,
  Truck,
  Gavel,
  Image as ImageIcon
} from 'lucide-react';

interface LegalViewProps {
  onBack: () => void;
  initialTab?: 'terms' | 'privacy';
}

export const LegalView: React.FC<LegalViewProps> = ({ onBack, initialTab = 'terms' }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 sm:py-16 text-right font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#254D3F] text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">السياسات القانونية والخصوصية</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">التزامات منصة "يَدَوِي" تجاه الحرفيين والزبائن لضمان تجربة آمنة</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>
        </div>

        {/* Tabs Switcher */}
        <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-10 w-fit mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-[#254D3F] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>شروط الاستخدام</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-[#254D3F] text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserShield className="w-4 h-4" />
            <span>سياسة الخصوصية</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-3xl border border-[#EAE6DC] p-6 sm:p-10 shadow-sm animate-fadeIn">

          {activeTab === 'terms' && (
            <div className="space-y-10">

              {/* Introduction */}
              <div className="pb-6 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#C97A57]" />
                  <span>اتفاقية شروط الخدمة</span>
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  أهلاً بك في منصة "يَدَوِي". باستخدامك لهذا الموقع، أنت توافق على الالتزام بالشروط والأحكام التالية. يرجى قراءتها بعناية قبل البدء في عمليات البيع أو الشراء.
                </p>
              </div>

              {/* Clause 1: Role */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  أولاً: طبيعة دور منصة يدوي
                </h3>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600 leading-relaxed">
                  <p>
                    منصة "يَدَوِي" هي <strong>وسيط تكنولوجي (Technical Intermediary)</strong> يقوم بربط المشتري بالحرفيين والصناع المستقلين في مصر. المنصة ليست المصنع أو المنتج أو البائع المباشر للمشغولات.
                  </p>
                  <p className="mt-2">
                    تنحصر مسؤولية المنصة في توفير الواجهة التقنية، نظام حساب الضمان المالي (Escrow)، وتنسيق عمليات الشحن اللوجستية عبر شركة الشحن المعتمدة (Mylerz).
                  </p>
                </div>
              </section>

              {/* Clause 2: IP & Content */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  ثانياً: الملكية الفكرية ومحتوى الورش
                </h3>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-600 space-y-3 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>يقر الحرفي بأن جميع الصور، الفيديوهات، والبيانات المرفوعة على فاترينته هي ملكية أصلية له، وقد تم تصويرها في ورشته الخاصة.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>يُمنع منعاً باتاً استخدام صور من الإنترنت أو صور لمصانع تجارية صينية أو أجنبية ونسبها للعمل اليدوي.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p>تخلي منصة يدوي مسؤوليتها القانونية عن أي انتهاك لحقوق الملكية الفكرية يقوم به الحرفي، ويتحمل الحرفي المسؤولية الكاملة أمام الجهات القضائية.</p>
                  </div>
                </div>
              </section>

              {/* Clause 3: Escrow & Payments */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  ثالثاً: نظام الضمان المالي والدفع (Escrow)
                </h3>
                <div className="p-5 rounded-2xl bg-[#254D3F]/5 border border-[#254D3F]/10 text-sm text-gray-600 space-y-3 leading-relaxed">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#254D3F] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">حساب الضمان:</span>
                      <p>يتم الاحتفاظ بجميع المبالغ المدفوعة إلكترونياً في "حساب الضمان" التابع للمنصة. لا يتم تحويل الأموال للحرفي إلا بعد تأكيد شركة الشحن (Mylerz) تسليم الطلب للعميل بنجاح بحالة (DELIVERED).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-[#C97A57] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 block mb-1">الطلبات المخصصة (العربون):</span>
                      <p>في حالة "التفصيل حسب الطلب"، يعتبر مبلغ العربون <strong>غير مسترد</strong> بمجرد بدء الحرفي في شراء الخامات وبدء التصنيع، إلا في حالة مخالفة المواصفات المتفق عليها بوضوح.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Clause 4: Disputes */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  رابعاً: فض النزاعات والتحكيم
                </h3>
                <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 text-sm text-gray-600 leading-relaxed">
                  <p>
                    في حالة نشوب نزاع بين المشتري والحرفي (تلف المنتج، عدم مطابقته للصور، تأخير مبالغ فيه)، يمتلك <strong>المشرف العام (Super Admin)</strong> لمنصة يدوي السلطة النهائية والملزمة لفض النزاع.
                  </p>
                  <p className="mt-2">
                    يعتمد القرار على فحص سجل المحادثات داخل المنصة، صور المنتج المرفقة وقت الشحن، وصور إثبات المشكلة المرفقة من المشتري.
                  </p>
                </div>
              </section>

            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-10">

              {/* Introduction Privacy */}
              <div className="pb-6 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#C97A57]" />
                  <span>سياسة الخصوصية وحماية البيانات</span>
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  خصوصيتك وأمان بياناتك هي أولويتنا القصوى في "يَدَوِي". نلتزم بالشفافية المطلقة حول كيفية جمع واستخدام وحماية معلوماتك الشخصية.
                </p>
              </div>

              {/* Data Collection */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  1. المعلومات التي نجمعها
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-bold text-gray-900 block mb-1">بيانات التواصل:</span>
                    <p className="text-xs text-gray-500">الاسم الكامل، رقم الهاتف الجوال، والبريد الإلكتروني.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-bold text-gray-900 block mb-1">بيانات الشحن:</span>
                    <p className="text-xs text-gray-500">العنوان التفصيلي، المحافظة، وأقرب علامة مميزة لمندوب Mylerz.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-bold text-gray-900 block mb-1">بيانات الدفع:</span>
                    <p className="text-xs text-gray-500">أرقام المحافظ الإلكترونية أو تفاصيل عمليات التحويل البنكي (عبر بوابات دفع آمنة).</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-xs font-bold text-gray-900 block mb-1">صور المشغولات:</span>
                    <p className="text-xs text-gray-500">الصور التي يرفعها الحرفي لإدارة فاترينته ومنتجاته.</p>
                  </div>
                </div>
              </section>

              {/* Data Usage */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  2. مشاركة البيانات مع أطراف ثالثة
                </h3>
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-sm text-gray-600 leading-relaxed">
                  <p className="mb-2">نحن <strong>لا نبيع ولا نؤجر</strong> بياناتك الشخصية لأي جهات تسويقية أو أطراف ثالثة.</p>
                  <p>تتم مشاركة بيانات محددة فقط مع الجهات التالية لإتمام الخدمة:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1 mr-4">
                    <li><strong>شركاء الخدمات اللوجستية (Mylerz):</strong> لمشاركة الاسم والعنوان والهاتف لإيصال الطلب.</li>
                    <li><strong>بوابات الدفع الإلكتروني:</strong> لمعالجة المعاملات المالية بشكل آمن ومشفر.</li>
                  </ul>
                </div>
              </section>

              {/* Security */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#C97A57] rounded-full" />
                  3. أمن وتشفير المعلومات
                </h3>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm text-gray-600 flex items-start gap-4">
                  <Lock className="w-8 h-8 text-emerald-600 shrink-0" />
                  <p>تستخدم منصة يدوي بروتوكولات تشفير متقدمة (SSL/TLS) لحماية جميع البيانات المنتقلة عبر الموقع. يتم تخزين كلمات المرور والبيانات الحساسة باستخدام أنظمة Supabase Auth المشفرة والمعتمدة عالمياً.</p>
                </div>
              </section>

            </div>
          )}

        </div>

        {/* Legal Footer Note */}
        <div className="mt-10 p-6 rounded-3xl bg-[#254D3F] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Gavel className="w-6 h-6 text-[#C97A57]" />
            <p className="text-xs sm:text-sm font-medium">آخر تحديث للسياسات: مايو 2024</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
          >
            طباعة النسخة الرسمية
          </button>
        </div>

      </div>
    </div>
  );
};

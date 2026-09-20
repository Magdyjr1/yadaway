import React from 'react';
import { Sparkles, Heart, MapPin, Store, Truck, ShieldCheck, CheckCircle2, Headphones } from 'lucide-react';
import { YadawyLogo } from './YadawyLogo';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onSelectCategory: (categoryId: string) => void;
  onNavigateCatalog?: () => void;
  onNavigateBazaar?: () => void;
  onNavigateTracking?: () => void;
  onNavigateSupport?: () => void;
  onNavigateLegal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateDashboard,
  onSelectCategory,
  onNavigateCatalog,
  onNavigateBazaar,
  onNavigateTracking,
  onNavigateSupport,
  onNavigateLegal
}) => {
  return (
    <footer className="bg-[#1A372D] text-[#E6E1D3] border-t border-[#254D3F] pt-12 pb-8 text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-3">
            <div className="cursor-pointer" onClick={onNavigateHome}>
              <YadawyLogo
                variant="horizontal"
                theme="dark"
                size="md"
                subtitle="سوق الحرف والفنون المصرية"
              />
            </div>

            <p className="text-xs text-[#C5D3CE] leading-relaxed">
              سوق إلكتروني مصري 100% مخصص للفنون اليدوية التراثية، الفخار، الكروشيه، الجلود الطبيعية، والأرابيسك. نربط أنامل الحرفيين المبدعين بالزبائن في كل ربوع مصر.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#C97A57] font-bold">
              <Sparkles className="w-4 h-4" />
              <span>أصالة • إتقان • فخر الصناعة المصرية</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-3">
              حِرف وفنون مصرية
            </h4>
            <ul className="space-y-2 text-xs text-[#C5D3CE]">
              <li>
                <button 
                  onClick={() => onSelectCategory('pottery')}
                  className="hover:text-white transition-colors"
                >
                  فخار وخزف قرية تونس والفسطاط
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('leather')}
                  className="hover:text-white transition-colors"
                >
                  جلود طبيعية مدبوغة نباتياً
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('crochet')}
                  className="hover:text-white transition-colors"
                >
                  تطريز سيوي وكروشيه قطن مصري
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('wood')}
                  className="hover:text-white transition-colors"
                >
                  أرابيسك وتطعيم صدف بحري
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('copper')}
                  className="hover:text-white transition-colors"
                >
                  نحاس أحمر وأصفر مطروق يدوياً
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('rugs')}
                  className="hover:text-white transition-colors"
                >
                  كليم وسجاد نول يدوي أخميمي
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Artisans Portal */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-3">
              للحرفيين والصناع
            </h4>
            <p className="text-xs text-[#C5D3CE] leading-relaxed mb-3">
              هل تصنع قطعاً يدوية في ورشتك أو منزلك؟ انضم لعائلة يدوي واعرض إبداعاتك لآلاف المشترين بسهولة.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onNavigateDashboard}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#254D3F] hover:bg-[#326352] text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-[#C97A57]" />
                <span>دخول بوابة الحِرفي (لوحة الصانع)</span>
              </button>

              {onNavigateBazaar && (
                <button
                  onClick={onNavigateBazaar}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#E6E1D3] text-xs font-bold border border-white/15 transition-all cursor-pointer text-right"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>تصفح فاترينات وسوق الحرفيين</span>
                </button>
              )}
            </div>
          </div>

          {/* Col 4: Platform & Delivery Intermediary */}
          <div>
            <h4 className="font-display font-bold text-white text-sm mb-3">
              حلقة الوصل والشحن
            </h4>
            <p className="text-xs text-[#C5D3CE] mb-3 leading-relaxed">
              منصة يدوي هي الضامن وحلقة الوصل المباشرة بين العميل والورشة، وتتولى شركة الشحن الرسمية الاستلام والتسليم والتحصيل بأمان كامل.
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs text-[#F6F4ED] font-bold">
                <ShieldCheck className="w-4 h-4 text-[#C97A57]" />
                <span>معاملات آمنة 100% عبر المنصة</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#A3B8B0]">
                <Truck className="w-3.5 h-3.5 text-[#C97A57]" />
                <span>توصيل معتمد لباب المنزل بجميع المحافظات</span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {onNavigateSupport && (
                <button
                  onClick={onNavigateSupport}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#254D3F] hover:bg-[#326352] text-white text-xs font-bold border border-emerald-400/40 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-[#C97A57]" />
                    <span>شات الدعم وخدمة العملاء</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    24 ساعة
                  </span>
                </button>
              )}

              {onNavigateTracking && (
                <button
                  onClick={onNavigateTracking}
                  className="inline-flex items-center gap-2 text-xs text-[#E6E1D3] hover:text-white transition-colors cursor-pointer"
                >
                  <Truck className="w-3.5 h-3.5 text-[#C97A57]" />
                  <span>تتبع مسار شحن طلبك الحالي</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-[#A3B8B0]">
                <MapPin className="w-3.5 h-3.5 text-[#C97A57]" />
                <span>ورش وحرفيون في 18 محافظة مصرية</span>
              </div>
            </div>
          </div>

        </div>

        {/* 24/7 Support Banner Bar in Footer */}
        {onNavigateSupport && (
          <div className="mb-8 p-4 rounded-2xl bg-[#254D3F]/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-right w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-[#C97A57]/20 border border-[#C97A57]/30 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-[#C97A57]" />
              </div>
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>خدمة عملاء ودعم الورش على مدار 24 ساعة</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h5>
                <p className="text-[11px] text-[#C5D3CE]">
                  شات مخصص ومباشر للتواصل معي لحل مشكلات الطلبات، متابعة مناديب الشحن، واستفسارات الورش والعملاء في أي وقت.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateSupport}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>فتح شات الدعم الفوري (24/7)</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-[#254D3F] flex flex-col sm:flex-row items-center justify-between text-xs text-[#A3B8B0] gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p>© {new Date().getFullYear()} يدوي. جميع الحقوق محفوظة لحرفيي وصناع مصر.</p>
            {onNavigateLegal && (
              <div className="flex items-center gap-4">
                <button
                  onClick={onNavigateLegal}
                  className="hover:text-white transition-colors cursor-pointer"
                >شروط الخدمة</button>
                <button
                  onClick={onNavigateLegal}
                  className="hover:text-white transition-colors cursor-pointer"
                >سياسة الخصوصية</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>صُنع بحب</span>
            <Heart className="w-3.5 h-3.5 fill-[#C97A57] text-[#C97A57]" />
            <span>لدعم الصناعة المصرية والتراث الأصيل</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

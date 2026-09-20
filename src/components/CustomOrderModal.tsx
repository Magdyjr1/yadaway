import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Clock, 
  FileText, 
  Tag, 
  Scissors, 
  MapPin, 
  CheckCircle2, 
  Layers, 
  Phone,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Artisan, Product, CustomOrderRequest, UserProfile } from '../types';
import { GOVERNORATES } from '../data/mockData';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  artisan: Artisan;
  product?: Product | null;
  currentUser?: UserProfile | null;
  onSubmitCustomOrder: (request: CustomOrderRequest) => void;
}

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({
  isOpen,
  onClose,
  artisan,
  product,
  currentUser,
  onSubmitCustomOrder
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [governorate, setGovernorate] = useState(currentUser?.governorate || 'القاهرة');
  
  // Customization choices
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['engraving']);
  const [engravingText, setEngravingText] = useState('');
  const [dimensions, setDimensions] = useState(product?.dimensions || '');
  const [colorNotes, setColorNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<CustomOrderRequest | null>(null);

  if (!isOpen) return null;

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter(t => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    const newRequest: CustomOrderRequest = {
      id: `cust-${Date.now()}`,
      productId: product?.id,
      productTitle: product?.title,
      artisanId: artisan.id,
      artisanName: artisan.name,
      customerName,
      customerPhone,
      governorate,
      customizationTypes: selectedTypes,
      engravingText: selectedTypes.includes('engraving') ? engravingText : undefined,
      dimensions: selectedTypes.includes('dimensions') ? dimensions : undefined,
      colorNotes: selectedTypes.includes('color') ? colorNotes : undefined,
      notes,
      deadline,
      status: 'new',
      createdAt: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    onSubmitCustomOrder(newRequest);
    setLastSubmittedRequest(newRequest);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setLastSubmittedRequest(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-right">
      <div 
        className="bg-white rounded-3xl border border-[#E6E1D3] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E6E1D3] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C97A57]/15 text-[#C97A57] flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-[#1F2937]">
                طلب تفصيل قطعة يدوية خاصة
              </h3>
              <p className="text-xs text-[#6B7280]">
                مباشرة مع ورشة: <strong className="text-[#254D3F]">{artisan.name}</strong> ({artisan.governorate})
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {isSubmitted ? (
            /* Success State */
            <div className="text-center py-6 animate-scaleIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-display font-black text-2xl text-[#1F2937] mb-2">
                تم استلام طلب التفصيل الخاص!
              </h4>
              <p className="text-xs sm:text-sm text-[#4B5563] mb-6 leading-relaxed max-w-md mx-auto">
                تم تسجيل مواصفات قطعتك في ورشة <strong>{artisan.name}</strong> بنجاح. ستقوم المنصة وفريق المتابعة وشركة الشحن المعتمدة بتنسيق تنفيذ القطعة ومتابعة شحنها وتوصيلها لك دون أي وسيط خارجي.
              </p>

              {/* Summary Card */}
              {lastSubmittedRequest && (
                <div className="p-4 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] text-right text-xs space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">رقم طلب التفصيل:</span>
                    <span className="font-mono font-bold text-[#254D3F]">{lastSubmittedRequest.id}</span>
                  </div>
                  {lastSubmittedRequest.engravingText && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">نص الحفر المطلوب:</span>
                      <span className="font-bold text-[#1F2937]">"{lastSubmittedRequest.engravingText}"</span>
                    </div>
                  )}
                  {lastSubmittedRequest.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-[#6B7280]">المقاس المطلوب:</span>
                      <span className="font-bold text-[#1F2937]">{lastSubmittedRequest.dimensions}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">المستلم:</span>
                    <span className="font-bold text-[#1F2937]">{lastSubmittedRequest.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">المحافظة والتوصيل:</span>
                    <span className="font-bold text-[#254D3F]">{lastSubmittedRequest.governorate} (عبر شركة الشحن المعتمدة)</span>
                  </div>
                </div>
              )}

              {/* Platform Intermediary Info */}
              <div className="p-3.5 rounded-2xl bg-[#254D3F]/5 border border-[#254D3F]/15 text-xs text-[#254D3F] flex items-center gap-2 mb-4 text-right">
                <ShieldCheck className="w-5 h-5 shrink-0 text-[#254D3F]" />
                <p>
                  <strong>ضمان يدوي وشركة الشحن:</strong> منصة يدوي هي حلقة الوصل الرسمية بينك وبين الحرفي، وتتولى شركة الشحن تسليم قطعتك وتحصيل قيمتها بأمان.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white font-bold text-sm transition-all cursor-pointer shadow-md"
                >
                  تم، العودة لتصفح المعروضات
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Context Banner if open from a product */}
              {product && (
                <div className="p-3.5 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] flex items-center gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] text-[#6B7280] block">تعديل مخصص على المشغولة:</span>
                    <h5 className="font-bold text-xs text-[#1F2937] line-clamp-1">{product.title}</h5>
                  </div>
                </div>
              )}

              {/* Customization Types Selection */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-2">
                  ما نوع التخصيص أو التعديل الذي تريده؟ (يمكنك اختيار أكثر من خيار)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => toggleType('engraving')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2 ${
                      selectedTypes.includes('engraving')
                        ? 'border-[#254D3F] bg-[#254D3F]/10 text-[#254D3F] font-bold'
                        : 'border-[#E6E1D3] hover:border-gray-300 text-[#4B5563]'
                    }`}
                  >
                    <Tag className="w-4 h-4 shrink-0 text-[#C97A57]" />
                    <div>
                      <span className="block">حفر اسم أو إهداء</span>
                      <span className="text-[10px] opacity-75 font-normal">على النحاس، الخشب، أو الجلد</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleType('dimensions')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2 ${
                      selectedTypes.includes('dimensions')
                        ? 'border-[#254D3F] bg-[#254D3F]/10 text-[#254D3F] font-bold'
                        : 'border-[#E6E1D3] hover:border-gray-300 text-[#4B5563]'
                    }`}
                  >
                    <Scissors className="w-4 h-4 shrink-0 text-[#C97A57]" />
                    <div>
                      <span className="block">أبعاد ومقاسات خاصة</span>
                      <span className="text-[10px] opacity-75 font-normal">طول، عرض، أو سعة محددة</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleType('color')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2 ${
                      selectedTypes.includes('color')
                        ? 'border-[#254D3F] bg-[#254D3F]/10 text-[#254D3F] font-bold'
                        : 'border-[#E6E1D3] hover:border-gray-300 text-[#4B5563]'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0 text-[#C97A57]" />
                    <div>
                      <span className="block">ألوان ونقوش مخصصة</span>
                      <span className="text-[10px] opacity-75 font-normal">تغيير درجات الخيوط أو الأكاسيد</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleType('unique')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-2 ${
                      selectedTypes.includes('unique')
                        ? 'border-[#254D3F] bg-[#254D3F]/10 text-[#254D3F] font-bold'
                        : 'border-[#E6E1D3] hover:border-gray-300 text-[#4B5563]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-[#C97A57]" />
                    <div>
                      <span className="block">فكرة وتصميم جديد</span>
                      <span className="text-[10px] opacity-75 font-normal">قطعة مبتكرة بالكامل</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Engraving Input */}
              {selectedTypes.includes('engraving') && (
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C97A57]" />
                    <span>النص أو الاسم المراد حفره / تطريزه على القطعة:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={engravingText}
                    onChange={(e) => setEngravingText(e.target.value)}
                    placeholder="مثال: د. منى زهران • مع كل الحب 2026"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    * الحفر يتم يدوياً بالأزاميل والمطارق أو الحرق الطبيعي حسب نوع الخامة.
                  </p>
                </div>
              )}

              {/* Dimensions Input */}
              {selectedTypes.includes('dimensions') && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 animate-fadeIn">
                  <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#254D3F]" />
                    <span>الأبعاد أو المقاسات المطلوبة:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="مثال: طول 180 سم × عرض 120 سم (لسجادة الكليم)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              )}

              {/* Color Notes */}
              {selectedTypes.includes('color') && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 animate-fadeIn">
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    تفضيلات الألوان أو درجات الصبغة الطبيعية:
                  </label>
                  <input
                    type="text"
                    value={colorNotes}
                    onChange={(e) => setColorNotes(e.target.value)}
                    placeholder="مثال: بني داكن مع خيط بيج / أو فخار فيروزي بأكاسيد نحاس"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              )}

              {/* Notes & Specs */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  تفاصيل وملاحظات إضافية للصانع:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="اكتب أي رغبة خاصة، طريقة الاستخدام، أو شكل الإهداء المفضل..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D3] text-xs text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E6E1D3]">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    اسمك الكريم:
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="الاسم ثلاثي"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    رقم تليفون التواصل والتوصيل (خاص بشركة الشحن والمنصة فقط):
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010xxxxxxxx"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                  <p className="text-[10px] text-[#6B7280] mt-1">
                    * يتم استخدام الرقم حصرياً لمندوب شركة الشحن لتسليم القطعة، ولا يظهر للورشة أو البائع.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    المحافظة:
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    تاريخ المناسبة / الموعد المرغوب:
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    placeholder="مثال: قبل نهاية الشهر الجاري"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#E6E1D3] space-y-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال طلب التفصيل للورشة لمراجعته وتحديد السعر</span>
                </button>

                <p className="text-[11px] text-center text-[#6B7280]">
                  لا يتطلب الدفع مقدماً • يتم الاتفاق على السعر النهائي وموعد التسليم بعد مراجعة الصانع
                </p>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

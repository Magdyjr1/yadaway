import React, { useState } from 'react';
import { Calculator, Info, ChevronDown, ChevronUp, CheckCircle2, Coins, ShieldCheck } from 'lucide-react';
import { calculateCommission } from '../utils/commission';

interface CommissionCalculatorBoxProps {
  priceValue: number | string;
  depositValue?: number | string;
  isCustomOrder?: boolean;
  className?: string;
}

export const CommissionCalculatorBox: React.FC<CommissionCalculatorBoxProps> = ({
  priceValue,
  depositValue,
  isCustomOrder = false,
  className = '',
}) => {
  const [showTiersModal, setShowTiersModal] = useState(false);
  const result = calculateCommission(priceValue);
  const numericPrice = parseFloat(priceValue as string);
  const hasPrice = !isNaN(numericPrice) && numericPrice > 0;
  
  const numericDeposit = depositValue !== undefined ? parseFloat(depositValue as string) : 0;
  const hasDeposit = !isNaN(numericDeposit) && numericDeposit > 0;
  const remainingAmount = hasPrice && hasDeposit ? Math.max(0, numericPrice - numericDeposit) : 0;

  return (
    <div
      className={`rounded-2xl border transition-all ${
        hasPrice
          ? 'bg-[#254D3F]/5 border-[#254D3F]/20 text-[#1F2937]'
          : 'bg-[#F6F4ED]/80 border-[#E6E1D3] text-[#6B7280]'
      } p-3.5 sm:p-4 text-right ${className}`}
      id="platform-commission-calculator-box"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#1F2937]">
            {isCustomOrder ? 'حاسبة تفصيل الطلب والعمولة والعربون' : 'حاسبة عمولة منصة يدوي (تلقائية ولحظية)'}
          </span>
        </div>

        {hasPrice && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#254D3F]/10 text-[#254D3F]">
            {result.rateLabel}
          </span>
        )}
      </div>

      {/* Main Commission & Net Payout Display */}
      {hasPrice ? (
        <div className="space-y-2.5">
          {/* Custom Order Deposit Breakdown if applicable */}
          {isCustomOrder && (
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>نظام حجز العربون والضمان للقطعة:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-amber-200/50 flex justify-between items-center">
                  <span className="text-amber-900 font-medium">العربون المحجوز فوراً بالضمان:</span>
                  <span className="font-mono font-bold text-amber-800">
                    {hasDeposit ? `${numericDeposit.toLocaleString('ar-EG')} ج.م` : 'لم يُحدد بعد'}
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-amber-200/50 flex justify-between items-center">
                  <span className="text-amber-900 font-medium">المتبقي عند المعاينة والاستلام:</span>
                  <span className="font-mono font-bold text-amber-800">
                    {hasDeposit ? `${remainingAmount.toLocaleString('ar-EG')} ج.م` : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Platform Commission */}
            <div className="p-2.5 rounded-xl bg-white/80 border border-black/5 flex items-center justify-between">
              <span className="text-xs text-[#4B5563] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C97A57]" />
                <strong>عمولة منصة يدوي:</strong>
              </span>
              <span className="font-mono font-bold text-sm text-[#C97A57]">
                {result.commission.toLocaleString('ar-EG')} جنيه
              </span>
            </div>

            {/* Net Payout */}
            <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200/60 flex items-center justify-between">
              <span className="text-xs text-emerald-900 font-medium flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <strong>صافي إجمالي أرباحك:</strong>
              </span>
              <span className="font-mono font-black text-sm text-emerald-700">
                {result.netPayout.toLocaleString('ar-EG')} جنيه
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280] pt-1">
            <span className="truncate">{result.tierDescription}</span>
            <button
              type="button"
              onClick={() => setShowTiersModal(!showTiersModal)}
              className="text-[#254D3F] hover:underline font-bold inline-flex items-center gap-0.5 shrink-0 ml-1 cursor-pointer"
            >
              <span>تفاصيل الشرائح</span>
              {showTiersModal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-xs py-1 text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#C97A57]" />
            <span>أدخل السعر أعلاه لحساب العمولة وصافي أرباحك أوتوماتيكياً.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTiersModal(!showTiersModal)}
            className="text-[#254D3F] hover:underline text-[11px] font-bold cursor-pointer inline-flex items-center gap-0.5"
          >
            <span>جدول الشرائح</span>
            {showTiersModal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Collapsible Tier Table */}
      {showTiersModal && (
        <div className="mt-3 pt-3 border-t border-black/5 text-[11px] space-y-1.5 bg-white/90 p-3 rounded-xl">
          <p className="font-bold text-[#1F2937] mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#254D3F]" />
            <span>نظام شرائح عمولة منصة يدوي العادل لتشجيع الحِرفيين:</span>
          </p>
          <div className="space-y-1 text-[#4B5563]">
            <div className={`p-1.5 rounded-lg flex items-center justify-between ${result.tierId === 1 ? 'bg-[#254D3F]/10 font-bold text-[#254D3F]' : ''}`}>
              <span>• حتى 1,000 جنيه:</span>
              <span className="font-mono">5% من سعر المنتج (بحد أدنى 5 جنيهات)</span>
            </div>
            <div className={`p-1.5 rounded-lg flex items-center justify-between ${result.tierId === 2 ? 'bg-[#254D3F]/10 font-bold text-[#254D3F]' : ''}`}>
              <span>• أكثر من 1,000 وحتى 5,000 جنيه:</span>
              <span className="font-mono">عمولة ثابتة 50 جنيهاً</span>
            </div>
            <div className={`p-1.5 rounded-lg flex items-center justify-between ${result.tierId === 3 ? 'bg-[#254D3F]/10 font-bold text-[#254D3F]' : ''}`}>
              <span>• أكثر من 5,000 وحتى 10,000 جنيه:</span>
              <span className="font-mono">عمولة ثابتة 200 جنيه</span>
            </div>
            <div className={`p-1.5 rounded-lg flex items-center justify-between ${result.tierId === 4 ? 'bg-[#254D3F]/10 font-bold text-[#254D3F]' : ''}`}>
              <span>• أكثر من 10,000 وحتى 20,000 جنيه:</span>
              <span className="font-mono">عمولة ثابتة 400 جنيه</span>
            </div>
            <div className={`p-1.5 rounded-lg flex items-center justify-between ${result.tierId === 5 ? 'bg-[#254D3F]/10 font-bold text-[#254D3F]' : ''}`}>
              <span>• أكثر من 20,000 جنيه:</span>
              <span className="font-mono">عمولة ثابتة 500 جنيه</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

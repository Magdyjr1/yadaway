/**
 * Yadawy Platform Commission Calculator & Validator
 * حاسبة عمولة منصة يدوي والتحقق من أرباح الحِرفيين
 *
 * منطق الشرائح:
 * 1. أقل من أو يساوي 1,000 جنيه: 5% بحد أدنى 5 جنيهات -> Math.max(price * 0.05, 5)
 * 2. أكثر من 1,000 وحتى 5,000 جنيه: عمولة ثابتة 50 جنيهاً
 * 3. أكثر من 5,000 وحتى 10,000 جنيه: عمولة ثابتة 200 جنيه
 * 4. أكثر من 10,000 وحتى 20,000 جنيه: عمولة ثابتة 400 جنيه
 * 5. أكثر من 20,000 جنيه: عمولة ثابتة 500 جنيه
 */

export interface CommissionResult {
  price: number;
  commission: number;
  netPayout: number;
  tierId: 1 | 2 | 3 | 4 | 5 | 0;
  tierDescription: string;
  rateLabel: string;
}

/**
 * دالة حساب عمولة منصة يدوي وصافي أرباح البائع
 */
export function calculateCommission(rawPrice: number | string): CommissionResult {
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;

  if (isNaN(price) || price <= 0) {
    return {
      price: 0,
      commission: 0,
      netPayout: 0,
      tierId: 0,
      tierDescription: 'أدخل سعر المشغولة لحساب العمولة وصافي الأرباح لحظياً',
      rateLabel: 'غير محدد',
    };
  }

  let commission = 0;
  let tierId: 1 | 2 | 3 | 4 | 5 = 1;
  let tierDescription = '';
  let rateLabel = '';

  if (price <= 1000) {
    tierId = 1;
    commission = Math.max(price * 0.05, 5);
    // تقريب لأقرب رقمين عشريين في حالة الكسور
    commission = Math.round(commission * 100) / 100;
    tierDescription = 'شريحة حتى 1,000 جنيه (عمولة 5% - حد أدنى 5 ج.م)';
    rateLabel = '5% (حد أدنى 5 ج.م)';
  } else if (price <= 5000) {
    tierId = 2;
    commission = 50;
    tierDescription = 'شريحة من 1,001 حتى 5,000 جنيه (عمولة ثابتة 50 ج.م)';
    rateLabel = '50 ج.م ثابتة';
  } else if (price <= 10000) {
    tierId = 3;
    commission = 200;
    tierDescription = 'شريحة من 5,001 حتى 10,000 جنيه (عمولة ثابتة 200 ج.م)';
    rateLabel = '200 ج.م ثابتة';
  } else if (price <= 20000) {
    tierId = 4;
    commission = 400;
    tierDescription = 'شريحة من 10,001 حتى 20,000 جنيه (عمولة ثابتة 400 ج.م)';
    rateLabel = '400 ج.م ثابتة';
  } else {
    tierId = 5;
    commission = 500;
    tierDescription = 'شريحة أكثر من 20,000 جنيه (عمولة ثابتة 500 ج.م)';
    rateLabel = '500 ج.م ثابتة';
  }

  const netPayout = Math.max(0, Math.round((price - commission) * 100) / 100);

  return {
    price,
    commission,
    netPayout,
    tierId,
    tierDescription,
    rateLabel,
  };
}

/**
 * دالة التحقق البرمجي (Backend / Pre-Save Validation) للتأكد من صحة السعر وحساب العمولة قبل الحفظ
 */
export function validateAndComputeProductPricing(rawPrice: number | string): {
  isValid: boolean;
  price: number;
  commission: number;
  netPayout: number;
  errorMessage?: string;
} {
  const price = typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice;

  if (isNaN(price) || price <= 0) {
    return {
      isValid: false,
      price: 0,
      commission: 0,
      netPayout: 0,
      errorMessage: 'سعر المشغولة غير صحيح، يجب أن يكون أكبر من صفر.',
    };
  }

  const result = calculateCommission(price);

  return {
    isValid: true,
    price: result.price,
    commission: result.commission,
    netPayout: result.netPayout,
  };
}

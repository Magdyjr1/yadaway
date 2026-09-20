import React, { useState } from 'react';
import { 
  Store, 
  Package, 
  ShoppingBag, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Sparkles,
  Trash2,
  Eye,
  Check,
  MapPin,
  Truck,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  X,
  Edit3,
  Calculator,
  Coins,
  Flame,
  Camera,
  Wallet,
  Ticket,
  Printer,
  Percent
} from 'lucide-react';
import { Product, Order, OrderStatus, ShowcaseItem, VendorPortfolio, UserProfile } from '../types';
import { CommissionCalculatorBox } from './CommissionCalculatorBox';
import { calculateCommission, validateAndComputeProductPricing } from '../utils/commission';
import { ShowcaseManager } from './ShowcaseManager';

interface ArtisanDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct?: (updatedProduct: Product) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onToggleProductStock: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onViewProduct: (product: Product) => void;
  currentUser?: UserProfile | null;
  showcaseItems?: ShowcaseItem[];
  vendorPortfolio?: VendorPortfolio | null;
  onAddShowcaseItem?: (item: ShowcaseItem) => void;
  onUpdateShowcaseItem?: (item: ShowcaseItem) => void;
  onDeleteShowcaseItem?: (itemId: string) => void;
  onUpdateVendorPortfolio?: (portfolio: VendorPortfolio) => void;
  onViewPublicShowcase?: (artisanId: string) => void;
  initialTab?: 'orders' | 'add' | 'products' | 'showcase';
}

export const ArtisanDashboard: React.FC<ArtisanDashboardProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onUpdateOrderStatus,
  onToggleProductStock,
  onDeleteProduct,
  onViewProduct,
  currentUser,
  showcaseItems = [],
  vendorPortfolio = null,
  onAddShowcaseItem,
  onUpdateShowcaseItem,
  onDeleteShowcaseItem,
  onUpdateVendorPortfolio,
  onViewPublicShowcase,
  initialTab = 'orders',
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'add' | 'products' | 'showcase' | 'wallet' | 'coupons'>(initialTab);

  // --- Missing Operational States ---
  // 1. Wallet & Payout State
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(4250);
  const [pendingBalance, setPendingBalance] = useState<number>(1800);
  const [payoutRequests, setPayoutRequests] = useState([
    { id: 'pay-1', date: '2024-05-10', amount: 2500, method: 'إنستاباي', identifier: 'artisan@instapay', status: 'completed', statusText: 'مكتمل وتحول للحساب' },
    { id: 'pay-2', date: '2024-05-24', amount: 1200, method: 'فودافون كاش', identifier: '01012345678', status: 'pending', statusText: 'قيد المراجعة والتحويل' },
  ]);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('vodafone_cash');
  const [payoutIdentifier, setPayoutIdentifier] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');

  // 2. Custom Coupons State
  const [coupons, setCoupons] = useState([
    { id: 'c-1', code: 'TUNIS10', discount: 10, type: 'percent', totalUses: 24, status: 'active' },
    { id: 'c-2', code: 'EID2024', discount: 50, type: 'fixed', totalUses: 8, status: 'active' },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // 3. Shipping Waybill Modal State
  const [selectedWaybillOrder, setSelectedWaybillOrder] = useState<Order | null>(null);

  // Form state for adding new product
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('pottery');
  const [newPrice, setNewPrice] = useState('');
  const [newIsCustomOrder, setNewIsCustomOrder] = useState(false);
  const [newDeposit, setNewDeposit] = useState('');
  const [newDepositError, setNewDepositError] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStory, setNewStory] = useState('');
  const [newMaterials, setNewMaterials] = useState('');
  const [newCraftingDays, setNewCraftingDays] = useState('3');
  const [newStock, setNewStock] = useState('5');
  // Support up to 4 images for the handcrafted product
  const [newImages, setNewImages] = useState<string[]>([]);
  const [singleInputUrl, setSingleInputUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // State for Editing an existing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('pottery');
  const [editPrice, setEditPrice] = useState('');
  const [editIsCustomOrder, setEditIsCustomOrder] = useState(false);
  const [editDeposit, setEditDeposit] = useState('');
  const [editDepositError, setEditDepositError] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editMaterials, setEditMaterials] = useState('');
  const [editCraftingDays, setEditCraftingDays] = useState('3');
  const [editStock, setEditStock] = useState('5');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSingleInputUrl, setEditSingleInputUrl] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Quick preset sample images for artisans who want to test easily
  const SAMPLE_IMAGES = [
    { label: 'فخار وخزف', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80' },
    { label: 'جلد طبيعي', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
    { label: 'كروشيه ونسيج', url: 'https://images.unsplash.com/photo-1606744888344-493238955de0?auto=format&fit=crop&w=800&q=80' },
    { label: 'أرابيسك وخشب', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80' },
    { label: 'نحاس ومعادن', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
    { label: 'سجاد وكليم', url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80' },
  ];

  // Helper to add an image (up to 4 max)
  const handleAddImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    if (newImages.length >= 4) return;
    if (!newImages.includes(trimmed)) {
      setNewImages(prev => [...prev, trimmed]);
      setSingleInputUrl('');
    }
  };

  // Helper to remove an image
  const handleRemoveImage = (indexToRemove: number) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper to handle local file upload (converts to base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - newImages.length;
    if (remainingSlots <= 0) return;

    const filesArray: File[] = [];
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files.item(i);
      if (file) filesArray.push(file);
    }

    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setNewImages(prev => {
            if (prev.length >= 4) return prev;
            return [...prev, result];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the input value so the same file can be re-selected if removed
    e.target.value = '';
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;

    // Backend / Pre-save Pricing Validation
    const pricing = validateAndComputeProductPricing(newPrice);
    if (!pricing.isValid) {
      alert(pricing.errorMessage || 'يرجى إدخال سعر صالح للمشغولة');
      return;
    }

    // Custom made-to-order deposit validation
    let validatedDeposit: number | undefined = undefined;
    if (newIsCustomOrder) {
      const parsedDeposit = parseFloat(newDeposit);
      if (isNaN(parsedDeposit) || parsedDeposit <= 0) {
        setNewDepositError('يرجى كتابة مبلغ عربون صالح بالجنيه المصري');
        return;
      }
      if (parsedDeposit > pricing.price) {
        setNewDepositError('عفواً، لا يمكن أن يتجاوز مبلغ العربون السعر الإجمالي للمنتج!');
        return;
      }
      validatedDeposit = parsedDeposit;
    }

    const materialsArray = newMaterials.trim() 
      ? newMaterials.split(',').map(m => m.trim())
      : ['خامات طبيعية مصرية 100%'];

    // If artisan typed a URL but didn't press "Add", include it if slots exist
    let finalImages = [...newImages];
    if (singleInputUrl.trim() && finalImages.length < 4 && !finalImages.includes(singleInputUrl.trim())) {
      finalImages.push(singleInputUrl.trim());
    }

    // Default fallback if no images were added
    if (finalImages.length === 0) {
      finalImages = [SAMPLE_IMAGES[0].url];
    }

    const created: Product = {
      id: `prod-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'مشغولة يدوية أصلية صُنعت بعناية وإتقان في الورشة.',
      story: newStory.trim() || 'قطعة مستوحاة من التراث المصري العريق صُنعت يدوياً بالكامل.',
      price: pricing.price,
      isCustomOrder: newIsCustomOrder,
      requiredDeposit: validatedDeposit,
      platformCommission: pricing.commission,
      netEarnings: pricing.netPayout,
      category: newCategory,
      images: finalImages,
      artisan: {
        id: 'artisan-current',
        name: 'عم إبراهيم النوبي (ورشة الفيوم)',
        title: 'صانع فخار وخزف تراثي',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        location: 'قرية تونس',
        governorate: 'الفيوم',
        whatsapp: '+201012345678',
        rating: 5.0,
        salesCount: 343,
        bio: 'ورشة تراثية لصناعة الفخار والخزف من طمي النيل.',
        joinedYear: 2021,
      },
      materials: materialsArray,
      craftingTimeDays: parseInt(newCraftingDays) || 3,
      stock: parseInt(newStock) || 5,
      isFeatured: true,
      rating: 5.0,
      reviewCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddProduct(created);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab('products');
      // Reset form
      setNewTitle('');
      setNewPrice('');
      setNewIsCustomOrder(false);
      setNewDeposit('');
      setNewDepositError('');
      setNewDescription('');
      setNewStory('');
      setNewMaterials('');
      setNewImages([]);
      setSingleInputUrl('');
    }, 1200);
  };

  // Start editing a product
  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditTitle(prod.title);
    setEditCategory(prod.category);
    setEditPrice(prod.price.toString());
    setEditIsCustomOrder(!!prod.isCustomOrder);
    setEditDeposit(prod.requiredDeposit ? prod.requiredDeposit.toString() : '');
    setEditDepositError('');
    setEditDescription(prod.description);
    setEditStory(prod.story);
    setEditMaterials(prod.materials ? prod.materials.join(', ') : '');
    setEditCraftingDays(prod.craftingTimeDays.toString());
    setEditStock(prod.stock.toString());
    setEditImages([...prod.images]);
    setEditSingleInputUrl('');
    setEditSuccess(false);
  };

  // Save edited product
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Backend / Pre-save Pricing Validation
    const pricing = validateAndComputeProductPricing(editPrice);
    if (!pricing.isValid) {
      alert(pricing.errorMessage || 'يرجى إدخال سعر صالح للمشغولة');
      return;
    }

    // Custom made-to-order deposit validation
    let validatedDeposit: number | undefined = undefined;
    if (editIsCustomOrder) {
      const parsedDeposit = parseFloat(editDeposit);
      if (isNaN(parsedDeposit) || parsedDeposit <= 0) {
        setEditDepositError('يرجى كتابة مبلغ عربون صالح بالجنيه المصري');
        return;
      }
      if (parsedDeposit > pricing.price) {
        setEditDepositError('عفواً، لا يمكن أن يتجاوز مبلغ العربون السعر الإجمالي للمنتج!');
        return;
      }
      validatedDeposit = parsedDeposit;
    }

    const materialsArray = editMaterials.trim() 
      ? editMaterials.split(',').map(m => m.trim())
      : editingProduct.materials;

    let finalImages = [...editImages];
    if (editSingleInputUrl.trim() && finalImages.length < 4 && !finalImages.includes(editSingleInputUrl.trim())) {
      finalImages.push(editSingleInputUrl.trim());
    }
    if (finalImages.length === 0) {
      finalImages = editingProduct.images;
    }

    const updated: Product = {
      ...editingProduct,
      title: editTitle.trim() || editingProduct.title,
      category: editCategory,
      price: pricing.price,
      isCustomOrder: editIsCustomOrder,
      requiredDeposit: validatedDeposit,
      platformCommission: pricing.commission,
      netEarnings: pricing.netPayout,
      description: editDescription.trim(),
      story: editStory.trim(),
      materials: materialsArray,
      craftingTimeDays: parseInt(editCraftingDays) || editingProduct.craftingTimeDays,
      stock: parseInt(editStock) || 0,
      images: finalImages,
    };

    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setEditingProduct(null);
    }, 800);
  };

  // Edit images helper
  const handleAddEditImage = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || editImages.length >= 4) return;
    if (!editImages.includes(trimmed)) {
      setEditImages(prev => [...prev, trimmed]);
      setEditSingleInputUrl('');
    }
  };

  const handleRemoveEditImage = (idxToRemove: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== idxToRemove));
  };

  // Metrics calculation
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'new' || o.status === 'processing').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right">
      
      {/* Top Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#254D3F] text-[#F6F4ED] card-shadow-md mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold mb-2">
            <Store className="w-3.5 h-3.5 text-[#C97A57]" />
            <span>بوابة الحِرفي المصرية</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl">
            لوحة تحكم الصانع • مرحباً بك يا فنان 🌿
          </h1>
          <p className="text-xs sm:text-sm text-[#E6E1D3] mt-1">
            صُممت خصيصاً لتكون بسيطة وسهلة لمتابعة طلباتك ومبيعاتك بدون أي تعقيد.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto flex-wrap">
          {/* Direct Button to Manage Showcase / Portfolio */}
          <button
            onClick={() => setActiveTab('showcase')}
            className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
              activeTab === 'showcase'
                ? 'bg-white text-[#254D3F]'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <Store className="w-4 h-4 text-[#C97A57]" />
            <span>إدارة فاترينتي (بورتفوليو)</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className="px-5 py-3 rounded-2xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة مشغولة جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold">إجمالي المبيعات</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#1F2937]">
              {totalRevenue.toLocaleString('ar-EG')}
            </span>
            <span className="text-xs font-bold text-[#6B7280]">ج.م</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold">طلبات تنتظر التنفيذ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono text-2xl sm:text-3xl font-black text-[#C97A57]">
            {pendingOrders}
          </span>
          <span className="text-xs text-[#6B7280] mr-1 font-medium">طلبات جديدة</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold">المشغولات المعروضة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <span className="font-mono text-2xl sm:text-3xl font-black text-[#254D3F]">
            {products.length}
          </span>
          <span className="text-xs text-[#6B7280] mr-1 font-medium">قطعة يدوية</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow">
          <div className="flex items-center justify-between text-[#6B7280] mb-2">
            <span className="text-xs font-bold">تقييم المتجر</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#1F2937]">
              4.9
            </span>
            <span className="text-xs text-[#6B7280] font-bold">من 5.0 ★</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#E6E1D3] mb-6 gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#254D3F] text-[#254D3F] bg-white rounded-t-xl'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>الطلبات الواردة</span>
          {pendingOrders > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#C97A57] text-white text-[11px] flex items-center justify-center font-bold">
              {pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('add')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'add'
              ? 'border-[#254D3F] text-[#254D3F] bg-white rounded-t-xl'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة مشغولة جديدة</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-[#254D3F] text-[#254D3F] bg-white rounded-t-xl'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>مشغولاتي المعروضة للبيع ({products.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('showcase')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'showcase'
              ? 'border-[#C97A57] text-[#C97A57] bg-white rounded-t-xl'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <Store className="w-4 h-4 text-[#C97A57]" />
          <span>إدارة فاترينتي (بورتفوليو الأعمال)</span>
          <span className="w-5 h-5 rounded-full bg-[#C97A57]/15 text-[#C97A57] text-[11px] flex items-center justify-center font-bold">
            {showcaseItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'wallet'
              ? 'border-[#254D3F] text-[#254D3F] bg-white rounded-t-xl'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>المحفظة والأرباح</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
            {withdrawableBalance} ج.م
          </span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'border-[#254D3F] text-[#254D3F] bg-white rounded-t-xl'
              : 'border-transparent text-[#6B7280] hover:text-[#1F2937]'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>كوبونات الخصم</span>
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] flex items-center justify-center font-bold">
            {coupons.length}
          </span>
        </button>
      </div>

      {/* --- LOW STOCK ALERTS BANNER REMOVED AS REQUESTED --- */}

      {/* TAB 1: INCOMING ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-lg text-[#1F2937]">
              قائمة الطلبات الأخيرة من الزبائن
            </h3>
            <span className="text-xs text-[#6B7280]">
              تحديث حالة الطلب وتنسيق التسليم مع شركة الشحن المعتمدة
            </span>
          </div>

          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
              >
                {/* Left info: Order number, customer, address */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-[#254D3F]/10 text-[#254D3F]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-[#9CA3AF]">{order.createdAt}</span>

                    {/* Status Badge */}
                    {order.status === 'new' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        طلب جديد ينتظر البدء
                      </span>
                    )}
                    {order.status === 'processing' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        قيد التنفيذ في الورشة
                      </span>
                    )}
                    {order.status === 'shipped' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        تم التسليم لمندوب شركة الشحن
                      </span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        مكتمل وتم الاستلام والتحصيل
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5563]">
                    <span className="font-bold text-[#1F2937]">المستلم: {order.customerName}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#254D3F]" />
                      <span>{order.governorate} (تسليم عبر شركة الشحن)</span>
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-[#6B7280] pt-1">
                    <span className="font-bold text-[#1F2937]">المشغولات المطلوبة: </span>
                    {order.items.map((it, i) => (
                      <span key={i} className="inline-block ml-2">
                        {it.product.title} (عدد {it.quantity})
                      </span>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg">
                      ملاحظة العميل للورشة: {order.notes}
                    </p>
                  )}
                </div>

                {/* Right actions: Total & Status Advance Button */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E6E1D3]">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-[#6B7280] block">المبلغ المستحق للورشة:</span>
                    <span className="font-mono font-black text-xl text-[#1F2937]">
                      {order.totalAmount.toLocaleString('ar-EG')} ج.م
                    </span>
                    <div className="text-[11px] space-y-0.5 mt-1">
                      <span className="text-[#254D3F] font-bold block">
                        {order.walletProvider ? `محفظة ${order.walletProvider}` : 
                         order.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' :
                         order.paymentMethod === 'instapay' ? 'إنستاباي' :
                         order.paymentMethod === 'smart_wallet' ? 'محفظة إلكترونية ذكية' : 'دفع إلكتروني'}
                      </span>
                      {order.paidAmount && (
                        <span className="text-emerald-700 font-bold block bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                          {order.isDepositOnly ? 'تم دفع العربون:' : 'المدفوع بالضمان:'} {order.paidAmount.toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                      {order.remainingAmount && order.remainingAmount > 0 ? (
                        <span className="text-amber-800 font-bold block bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                          المتبقي عند المعاينة: {order.remainingAmount.toLocaleString('ar-EG')} ج.م
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {/* Status updater */}
                    {order.status === 'new' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'processing')}
                        className="px-4 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        بدء تجهيز القطعة في الورشة
                      </button>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'shipped')}
                        className="px-4 py-2 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>تسليم لمندوب شركة الشحن</span>
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        تأكيد استلام العميل والتحصيل
                      </button>
                    )}

                    {/* Waybill / Shipping Label Printing */}
                    <button
                      onClick={() => setSelectedWaybillOrder(order)}
                      className="px-4 py-2 rounded-xl border border-[#254D3F]/30 text-[#254D3F] hover:bg-[#254D3F]/5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة بوليصة الشحن</span>
                    </button>

                    {/* Platform intermediary note */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#254D3F]/5 border border-[#254D3F]/10 text-[11px] text-[#254D3F]">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>الشحن والتحصيل بضمان يدوي</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ADD NEW PRODUCT FORM */}
      {activeTab === 'add' && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#E6E1D3] p-6 sm:p-10 card-shadow">
          <div className="mb-6">
            <h3 className="font-display font-black text-xl text-[#1F2937]">
              إضافة مشغولة يدوية جديدة لمتجرك
            </h3>
            <p className="text-xs text-[#6B7280]">
              اكتب التفاصيل البسيطة لقطعتك لتظهر فوراً لآلاف المشترين
            </p>
          </div>

          {formSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>تم نشر القطعة بنجاح في متجر يدوي!</span>
            </div>
          )}

          <form onSubmit={handleCreateProduct} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                اسم المشغولة اليدوية: *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: فازة فخار ملوّنة بأكاسيد النيل / محفظة جلد طبيعي هافان"
                className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
              />
            </div>

            {/* Order Type: Ready in Stock vs Custom Made-to-Order */}
            <div className="p-4 rounded-2xl bg-[#EAE6DC]/40 border border-[#E6E1D3] space-y-3">
              <label className="block text-xs font-bold text-[#1F2937]">
                نوع المشغولة والمعروض: *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewIsCustomOrder(false);
                    setNewDeposit('');
                    setNewDepositError('');
                  }}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    !newIsCustomOrder
                      ? 'bg-white border-[#254D3F] shadow-xs'
                      : 'bg-white/50 border-[#E6E1D3] text-[#6B7280]'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold text-[#1F2937]">قطعة جاهزة للطلب الفوري</span>
                    <span className="text-[11px] text-[#6B7280]">متوفرة بمخزن الورشة وتشحن مباشرة</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    !newIsCustomOrder ? 'border-[#254D3F] bg-[#254D3F]' : 'border-gray-300'
                  }`}>
                    {!newIsCustomOrder && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setNewIsCustomOrder(true)}
                  className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    newIsCustomOrder
                      ? 'bg-white border-[#C97A57] ring-2 ring-[#C97A57]/20 shadow-xs'
                      : 'bg-white/50 border-[#E6E1D3] text-[#6B7280]'
                  }`}
                >
                  <div>
                    <span className="block text-xs font-bold text-[#C97A57]">تفصيل بالطلب (Custom Order)</span>
                    <span className="text-[11px] text-[#6B7280]">تُصنع بمواصفات خاصة مع نظام العربون</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    newIsCustomOrder ? 'border-[#C97A57] bg-[#C97A57]' : 'border-gray-300'
                  }`}>
                    {newIsCustomOrder && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              </div>

              {newIsCustomOrder && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <span className="text-base leading-none mt-0.5">🔒</span>
                  <div>
                    <strong>نظام حماية العربون في يدوي:</strong> يدفع المشتري مبلغ العربون عبر محفظته الإلكترونية (فودافون كاش)، ويبقى محفوظاً بأمان في حساب الضمان حتى المعاينة والاستلام النهائي.
                  </div>
                </div>
              )}
            </div>

            {/* Category & Pricing Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  التصنيف والحرفة: *
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
                >
                  <option value="pottery">فخار وخزف</option>
                  <option value="leather">جلود طبيعية</option>
                  <option value="crochet">كروشيه وتطريز</option>
                  <option value="wood">أرابيسك وخشب</option>
                  <option value="copper">نحاس ومعادن</option>
                  <option value="rugs">سجاد وكليم يدوي</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  {newIsCustomOrder ? 'سعر القطعة الإجمالي (Total Price): *' : 'السعر المطلوب (بالجنيه المصري): *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={(e) => {
                      setNewPrice(e.target.value);
                      if (newDeposit && parseFloat(newDeposit) > parseFloat(e.target.value)) {
                        setNewDepositError('عفواً، لا يمكن أن يتجاوز مبلغ العربون السعر الإجمالي للمنتج!');
                      } else {
                        setNewDepositError('');
                      }
                    }}
                    placeholder={newIsCustomOrder ? 'مثال: 2000' : 'مثال: 450'}
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm font-mono focus:outline-none focus:border-[#254D3F]"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B7280]">
                    ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* If Custom Order: Mandatory Deposit Input */}
            {newIsCustomOrder && (
              <div className="p-4 rounded-2xl bg-white border-2 border-[#C97A57]/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#1F2937]">
                    مبلغ العربون المطلوب (Deposit Amount) لتغطية الخامات وبدء التصنيع: *
                  </label>
                  <span className="text-[11px] font-bold text-[#C97A57] bg-[#C97A57]/10 px-2 py-0.5 rounded-full">
                    حقل إجباري للتفصيل
                  </span>
                </div>
                
                <div className="relative">
                  <input
                    type="number"
                    required={newIsCustomOrder}
                    min="1"
                    value={newDeposit}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewDeposit(val);
                      const parsed = parseFloat(val);
                      const total = parseFloat(newPrice);
                      if (!isNaN(parsed) && !isNaN(total) && parsed > total) {
                        setNewDepositError('عفواً، لا يمكن أن يتجاوز مبلغ العربون السعر الإجمالي للمنتج!');
                      } else {
                        setNewDepositError('');
                      }
                    }}
                    placeholder="مثال: 500 (كجدية تعاقد وتغطية الخامات المبدئية)"
                    className={`w-full px-4 py-3 pl-12 rounded-xl border text-sm font-mono focus:outline-none ${
                      newDepositError ? 'border-red-500 bg-red-50/50' : 'border-[#C97A57]/50 bg-white focus:border-[#C97A57]'
                    }`}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B7280]">
                    ج.م
                  </span>
                </div>

                {newDepositError ? (
                  <p className="text-xs text-red-600 font-bold mt-1">
                    ⚠️ {newDepositError}
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-[#6B7280] pt-1">
                    <span>يُسدده المشتري إلكترونياً ويُحفظ في حساب الضمان حتى يستلم ويعاين.</span>
                    {newPrice && newDeposit && !isNaN(parseFloat(newPrice)) && !isNaN(parseFloat(newDeposit)) && (
                      <span className="font-bold text-[#254D3F]">
                        المتبقي عند المعاينة والاستلام: {Math.max(0, parseFloat(newPrice) - parseFloat(newDeposit)).toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Platform Commission & Net Profit Real-time Calculator Box */}
            <CommissionCalculatorBox 
              priceValue={newPrice} 
              depositValue={newDeposit}
              isCustomOrder={newIsCustomOrder}
              className="mt-1" 
            />

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                وصف القطعة ومميزاتها:
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="صف تفاصيل القطعة، جودتها، واستخداماتها اليومية أو الديكورية..."
                className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                قصة الصنع والإلهام (حكاية القطعة):
              </label>
              <textarea
                rows={2}
                value={newStory}
                onChange={(e) => setNewStory(e.target.value)}
                placeholder="كيف خطرت لك فكرة صنعها؟ ما الذي استلهمته من البيئة أو التراث المصري؟"
                className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
              />
            </div>

            {/* Materials & Crafting Days & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  الخامات (افصل بفاصلة):
                </label>
                <input
                  type="text"
                  value={newMaterials}
                  onChange={(e) => setNewMaterials(e.target.value)}
                  placeholder="طمي أسواني، جليز زجاجي"
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-xs focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  مدة الصنع اليدوي (بالأيام):
                </label>
                <input
                  type="number"
                  min="1"
                  value={newCraftingDays}
                  onChange={(e) => setNewCraftingDays(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-xs font-mono focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  الكمية المتاحة حالياً:
                </label>
                <input
                  type="number"
                  min="1"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-xs font-mono focus:outline-none focus:border-[#254D3F]"
                />
              </div>
            </div>

            {/* Up to 4 Images Selection & Upload */}
            <div className="p-4 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1F2937] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#C97A57]" />
                    <span>صور المشغولة اليدوية (حتى 4 صور):</span>
                  </label>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    أضف حتى 4 صور بزوايا مختلفة لإبراز تفاصيل وجمال قطعتك اليدوية للمشترين.
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  newImages.length === 4
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#254D3F]/10 text-[#254D3F]'
                }`}>
                  {newImages.length} من 4 صور
                </span>
              </div>

              {/* 4 Slots Preview Gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const imgUrl = newImages[slotIdx];
                  const isPrimary = slotIdx === 0;

                  return (
                    <div
                      key={slotIdx}
                      className={`relative aspect-square rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all ${
                        imgUrl
                          ? 'border-[#254D3F] bg-white shadow-xs'
                          : 'border-dashed border-[#D1CCC0] bg-[#EAE6DC]/50'
                      }`}
                    >
                      {imgUrl ? (
                        <>
                          <img
                            src={imgUrl}
                            alt={`صورة ${slotIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(slotIdx)}
                              className="self-end p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                              title="حذف الصورة"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-white font-bold text-center">
                              {isPrimary ? 'الصورة الرئيسية ⭐' : `صورة إضافية (${slotIdx + 1})`}
                            </span>
                          </div>
                          {isPrimary && (
                            <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#254D3F] text-[#F6F4ED] text-[9px] font-bold shadow-xs">
                              الرئيسية
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(slotIdx)}
                            className="sm:hidden absolute top-1.5 left-1.5 p-1 rounded-full bg-black/60 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center p-2 text-[#8C827A] cursor-pointer hover:bg-white/80 transition-colors group">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <div className="w-8 h-8 mx-auto mb-1 rounded-xl bg-white/90 border border-[#D1CCC0] group-hover:border-[#254D3F] group-hover:text-[#254D3F] flex items-center justify-center text-[#8C827A] transition-colors shadow-2xs">
                            <Camera className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] block font-bold group-hover:text-[#254D3F] transition-colors">
                            {isPrimary ? 'اضغط لرفع الرئيسية' : `اضغط لرفع زاوية ${slotIdx + 1}`}
                          </span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upload & URL Input Controls (active if < 4 images) */}
              {newImages.length < 4 ? (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Device File Upload Button */}
                    <label className="sm:col-span-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#254D3F] bg-white text-[#254D3F] hover:bg-[#254D3F]/5 transition-colors cursor-pointer text-xs font-bold shadow-xs">
                      <Upload className="w-4 h-4 text-[#C97A57]" />
                      <span>رفع صورة من جهازك / الهاتف</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* URL Input */}
                    <div className="sm:col-span-7 flex items-center gap-1.5">
                      <input
                        type="url"
                        value={singleInputUrl}
                        onChange={(e) => setSingleInputUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImage(singleInputUrl);
                          }
                        }}
                        placeholder="أو ضع رابط صورة مباشر..."
                        className="flex-1 px-3 py-2 rounded-xl border border-[#E6E1D3] bg-white text-xs focus:outline-none focus:border-[#254D3F]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImage(singleInputUrl)}
                        disabled={!singleInputUrl.trim()}
                        className="px-3 py-2 rounded-xl bg-[#254D3F] disabled:bg-gray-300 text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>

                  {/* Preset Quick Samples to easily add with one click */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#6B7280] font-bold">أو اختر من صور تجريبية سريعة:</span>
                    {SAMPLE_IMAGES.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddImage(sample.url)}
                        disabled={newImages.includes(sample.url) || newImages.length >= 4}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:text-[#254D3F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        + {sample.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-bold text-center">
                  ✓ تم اختيار 4 صور كاملة للمشغولة (يمكنك حذف أي صورة بالضغط على علامة × لاستبدالها).
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white font-bold text-base shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-[#C97A57]" />
                <span>نشر المشغولة اليدوية في متجر يدوي الآن</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ARTISAN'S ACTIVE PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-lg text-[#1F2937]">
              المشغولات المعروضة في متجرك
            </h3>
            <span className="text-xs text-[#6B7280]">
              يمكنك تغيير حالة التوفر أو حذف المشغولة بأي وقت
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((prod) => {
              const commissionInfo = calculateCommission(prod.price);
              const netPayout = prod.netEarnings ?? commissionInfo.netPayout;
              const commissionAmount = prod.platformCommission ?? commissionInfo.commission;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-[#E6E1D3] p-4 card-shadow flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-16 h-16 rounded-xl object-cover border border-[#E6E1D3]"
                    />
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-sm text-[#1F2937] truncate">
                        {prod.title}
                      </h4>
                      {prod.isCustomOrder && prod.requiredDeposit ? (
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C97A57]/15 text-[#C97A57] border border-[#C97A57]/30">
                            تفصيل بالطلب • عربون: {prod.requiredDeposit.toLocaleString('ar-EG')} ج.م
                          </span>
                        </div>
                      ) : null}
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-mono font-black text-[#1F2937]">
                          {prod.price.toLocaleString('ar-EG')} ج.م
                        </span>
                        <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          صافيك: {netPayout.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] block mt-0.5">
                        الكمية بالمخزن: {prod.stock} قطع • عمولة المنصة: {commissionAmount} ج.م
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E6E1D3] flex items-center justify-between gap-2">
                    {/* Stock Toggle */}
                    <button
                      onClick={() => onToggleProductStock(prod.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        prod.stock > 0
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {prod.stock > 0 ? '✓ متوفر للطلب' : '✕ نفذت الكمية'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditProduct(prod)}
                        className="p-2 rounded-lg bg-[#254D3F]/10 hover:bg-[#254D3F] hover:text-white text-[#254D3F] transition-colors cursor-pointer"
                        title="تعديل بيانات وسعر المشغولة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onViewProduct(prod)}
                        className="p-2 rounded-lg bg-[#F6F4ED] hover:bg-[#254D3F] hover:text-white text-[#4B5563] transition-colors cursor-pointer"
                        title="عرض صفحة المنتج"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-2 rounded-lg bg-[#F6F4ED] hover:bg-red-600 hover:text-white text-[#4B5563] transition-colors cursor-pointer"
                        title="حذف من المعروض"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SHOWCASE & PORTFOLIO MANAGEMENT */}
      {activeTab === 'showcase' && (
        <ShowcaseManager
          portfolio={vendorPortfolio}
          items={showcaseItems}
          onAddShowcaseItem={onAddShowcaseItem || (() => {})}
          onUpdateShowcaseItem={onUpdateShowcaseItem}
          onDeleteShowcaseItem={onDeleteShowcaseItem || (() => {})}
          onUpdatePortfolio={onUpdateVendorPortfolio || (() => {})}
          onViewPublicShowcase={onViewPublicShowcase || (() => {})}
        />
      )}

      {/* TAB 5: WALLET & PAYOUTS */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wallet Overview */}
            <div className="p-6 rounded-3xl bg-white border border-[#E6E1D3] card-shadow">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1F2937]">محفظتي المالية</h3>
                  <p className="text-xs text-[#6B7280]">إدارة أرباحك وسحب الأموال المتوفرة</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-bold block mb-1">قابل للسحب</span>
                  <span className="text-2xl font-mono font-black text-[#1F2937]">{withdrawableBalance.toLocaleString('ar-EG')}</span>
                  <span className="text-xs text-[#6B7280] mr-1">ج.م</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-xs text-amber-700 font-bold block mb-1">رصيد معلق</span>
                  <span className="text-2xl font-mono font-black text-[#1F2937]">{pendingBalance.toLocaleString('ar-EG')}</span>
                  <span className="text-xs text-[#6B7280] mr-1">ج.م</span>
                  <div className="flex items-center gap-1 text-[9px] text-[#6B7280] mt-1">
                    <Clock className="w-3 h-3" />
                    <span>حتى تأكيد الاستلام</span>
                  </div>
                </div>
              </div>

              {/* Payout Request Form */}
              <div className="p-5 rounded-2xl bg-[#F6F4ED] border border-[#E6E1D3]">
                <h4 className="text-sm font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#C97A57]" />
                  <span>طلب سحب أرباح</span>
                </h4>

                {walletSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{walletSuccess}</span>
                  </div>
                )}

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const amt = parseFloat(payoutAmount);
                  if (isNaN(amt) || amt <= 0 || amt > withdrawableBalance) {
                    alert("يرجى إدخال مبلغ صالح لا يتجاوز الرصيد القابل للسحب");
                    return;
                  }
                  if (!payoutIdentifier.trim()) {
                    alert("يرجى إدخال رقم المحفظة أو الحساب");
                    return;
                  }
                  setWithdrawableBalance(prev => prev - amt);
                  setPayoutRequests(prev => [
                    {
                      id: `pay-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      amount: amt,
                      method: payoutMethod === 'vodafone_cash' ? 'فودافون كاش' : payoutMethod === 'instapay' ? 'إنستاباي' : 'حساب بنكي',
                      identifier: payoutIdentifier,
                      status: 'pending',
                      statusText: 'قيد المراجعة والتحويل'
                    },
                    ...prev
                  ]);
                  setPayoutAmount('');
                  setPayoutIdentifier('');
                  setWalletSuccess('تم تقديم طلب السحب بنجاح! سيتم مراجعته وتحويله خلال 24 ساعة.');
                  setTimeout(() => setWalletSuccess(''), 4000);
                }}>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">المبلغ المطلوب سحبه:</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="مثال: 1000"
                        className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[#E6E1D3] bg-white text-sm focus:outline-none focus:border-[#254D3F]"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">ج.م</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">وسيلة السحب:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('vodafone_cash')}
                        className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${payoutMethod === 'vodafone_cash' ? 'bg-[#254D3F] text-white border-[#254D3F]' : 'bg-white border-[#E6E1D3] text-gray-600'}`}
                      >فودافون كاش</button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('instapay')}
                        className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${payoutMethod === 'instapay' ? 'bg-[#254D3F] text-white border-[#254D3F]' : 'bg-white border-[#E6E1D3] text-gray-600'}`}
                      >إنستاباي</button>
                      <button
                        type="button"
                        onClick={() => setPayoutMethod('bank')}
                        className={`py-2 rounded-xl border text-[10px] font-bold transition-all ${payoutMethod === 'bank' ? 'bg-[#254D3F] text-white border-[#254D3F]' : 'bg-white border-[#E6E1D3] text-gray-600'}`}
                      >حساب بنكي</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">رقم المحفظة / عنوان الحساب:</label>
                    <input
                      type="text"
                      value={payoutIdentifier}
                      onChange={(e) => setPayoutIdentifier(e.target.value)}
                      placeholder={payoutMethod === 'bank' ? 'رقم الـ IBAN البنكي' : '01xxxxxxxxx'}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-white text-sm focus:outline-none focus:border-[#254D3F]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#C97A57] text-white font-bold text-sm shadow-md hover:bg-[#B36846] transition-all cursor-pointer"
                  >
                    تأكيد طلب سحب الأموال
                  </button>
                </form>
              </div>
            </div>

            {/* Payout History */}
            <div className="p-6 rounded-3xl bg-white border border-[#E6E1D3] card-shadow flex flex-col">
              <h3 className="font-display font-bold text-lg text-[#1F2937] mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#254D3F]" />
                <span>سجل عمليات التحويل</span>
              </h3>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
                {payoutRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-2xl border border-[#F6F4ED] bg-gray-50/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-[#1F2937]">{req.amount.toLocaleString('ar-EG')} ج.م</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {req.statusText}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        <span>{req.date} • {req.method} ({req.identifier})</span>
                      </div>
                    </div>
                    {req.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ARTISAN COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#E6E1D3] card-shadow flex flex-col lg:flex-row gap-8">
            {/* Create Coupon Form */}
            <div className="lg:w-1/3 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#1F2937]">كوبونات خصم الورشة</h3>
                  <p className="text-xs text-[#6B7280]">أكواد خصم خاصة لمتابعيك</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 text-xs text-amber-900 leading-relaxed">
                <Sparkles className="w-4 h-4 mb-2 text-amber-600" />
                <strong>فكرة للتسويق:</strong> اصنع كود خصم خاص (مثلاً <code>HANDMADE10</code>) وشاركه على فيسبوك وإنستجرام لزيادة مبيعات ورشتك اليوم!
              </div>

              {couponSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{couponSuccess}</span>
                </div>
              )}

              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                if (!newCouponCode.trim() || !newCouponDiscount) return;
                setCoupons(prev => [
                  ...prev,
                  {
                    id: `c-${Date.now()}`,
                    code: newCouponCode.trim().toUpperCase(),
                    discount: parseInt(newCouponDiscount) || 10,
                    type: 'percent',
                    totalUses: 0,
                    status: 'active'
                  }
                ]);
                setNewCouponCode('');
                setNewCouponDiscount('');
                setCouponSuccess('تم إنشاء كوبون الخصم بنجاح!');
                setTimeout(() => setCouponSuccess(''), 3000);
              }}>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">كود الخصم (أحرف إنجليزية):</label>
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="مثال: TUNIS10"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-white text-sm font-bold focus:outline-none focus:border-[#254D3F] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1.5">نسبة الخصم (%):</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-[#E6E1D3] bg-white text-sm font-bold focus:outline-none focus:border-[#254D3F]"
                    />
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#254D3F] text-white font-bold text-sm shadow-md hover:bg-[#1A372D] transition-all cursor-pointer"
                >تفعيل الكود الآن</button>
              </form>
            </div>

            {/* Active Coupons List */}
            <div className="lg:w-2/3">
              <h4 className="text-sm font-bold text-[#1F2937] mb-4">كوبوناتك الفعالة حالياً</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map(coupon => (
                  <div key={coupon.id} className="relative overflow-hidden p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow-sm group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-amber-50 -rotate-12 translate-x-4 -translate-y-4 rounded-full flex items-center justify-center pt-4 pr-4">
                      <Ticket className="w-5 h-5 text-amber-500/30" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-lg bg-[#254D3F]/5 border border-[#254D3F]/10 text-sm font-black text-[#254D3F] tracking-wider">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">خصم {coupon.discount}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span>عدد المرات المستخدمة: <strong className="text-[#1F2937]">{coupon.totalUses}</strong></span>
                      <button className="text-red-500 hover:underline cursor-pointer">إلغاء الكود</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SHIPPING WAYBILL / LABEL PRINTING MODAL --- */}
      {selectedWaybillOrder && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-0 overflow-hidden shadow-2xl animate-scaleUp">
            {/* Modal Actions Header */}
            <div className="bg-[#254D3F] p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5" />
                <h3 className="font-bold text-sm">بوليصة شحن الطلب {selectedWaybillOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedWaybillOrder(null)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              ><X className="w-5 h-5" /></button>
            </div>

            {/* Waybill Content (Printable Area) */}
            <div id="waybill-printable" className="p-8 bg-white text-right space-y-6">
              {/* Header Label */}
              <div className="flex items-start justify-between border-b-2 border-dashed border-gray-200 pb-6">
                <div className="space-y-1">
                  <YadawyEmblem size={48} />
                  <p className="text-[10px] text-gray-500 font-bold">منصة يَدَوِي - سوق الحرف المصرية</p>
                </div>
                <div className="text-left">
                  <div className="inline-block p-2 border-2 border-black rounded-lg mb-2">
                    <span className="block text-xs font-black uppercase tracking-widest text-center">Tracking Code</span>
                    <div className="h-10 w-32 bg-[url('https://www.barcode-generator.org/zint/api.php?data=YDW-123456&type=20')] bg-contain bg-no-repeat bg-center" />
                    <span className="block text-[10px] font-mono font-bold text-center mt-1">YDW-{selectedWaybillOrder.id.substring(0,8).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Addresses Grid */}
              <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">المرسل (الورشة):</span>
                  <p className="text-sm font-black text-[#1F2937]">{vendorPortfolio?.name || 'ورشة الحرفي'}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    صُنع في: {selectedWaybillOrder.items[0]?.product.artisan?.location || 'قرية تونس، الفيوم'}<br/>
                    هاتف الورشة: {selectedWaybillOrder.items[0]?.product.artisan?.whatsapp || '---'}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">المرسل إليه (العميل):</span>
                  <p className="text-sm font-black text-[#1F2937]">{selectedWaybillOrder.customerName}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    المحافظة: {selectedWaybillOrder.governorate}<br/>
                    العنوان: {selectedWaybillOrder.shippingAddress || 'مرفق بتفاصيل العميل'}<br/>
                    الهاتف: {selectedWaybillOrder.customerPhone || '---'}
                  </p>
                </div>
              </div>

              {/* Order Items & Amount */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">محتويات الطرد والقيمة:</span>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right pb-2 font-black">المشغولة</th>
                        <th className="text-center pb-2 font-black">الكمية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWaybillOrder.items.map((it, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 text-gray-700">{it.product.title}</td>
                          <td className="py-2 text-center font-mono font-bold">{it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#254D3F] text-white">
                  <div>
                    <span className="text-[10px] opacity-80 block">المبلغ المطلوب تحصيله (COD):</span>
                    <span className="text-xl font-black font-mono">{(selectedWaybillOrder.remainingAmount || selectedWaybillOrder.totalAmount).toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] opacity-80 block">طريقة الدفع:</span>
                    <span className="text-xs font-bold">
                      {selectedWaybillOrder.paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'دفع عند الاستلام'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-4 text-center">
                <p className="text-[9px] text-gray-400 italic">
                  * يرجى وضع هذه البوليصة بشكل واضح على صندوق التغليف ليراها مندوب الشحن والعميل.
                </p>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  const printContent = document.getElementById('waybill-printable')?.innerHTML;
                  const originalContent = document.body.innerHTML;
                  if (printContent) {
                    document.body.innerHTML = `<div dir="rtl" style="padding:20px; font-family:sans-serif;">${printContent}</div>`;
                    window.print();
                    document.body.innerHTML = originalContent;
                    window.location.reload();
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-[#254D3F] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:bg-[#1A372D] transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة البوليصة الآن</span>
              </button>
              <button
                onClick={() => setSelectedWaybillOrder(null)}
                className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-bold text-xs hover:bg-white transition-all cursor-pointer"
              >إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL WITH REAL-TIME COMMISSION CALCULATOR */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E6E1D3] p-6 sm:p-8 card-shadow-lg text-right relative my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E6E1D3] mb-5">
              <div>
                <h3 className="font-display font-black text-xl text-[#1F2937] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#C97A57]" />
                  <span>تعديل مشغولة: {editingProduct.title}</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  قم بتعديل السعر أو المخزن أو الخامات، وتأكد من حساب الأرباح لحظياً
                </p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم حفظ التعديلات وحساب العمولة بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveEditProduct} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  اسم المشغولة اليدوية: *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              {/* Order Type: Ready in Stock vs Custom Made-to-Order in Edit Modal */}
              <div className="p-3.5 rounded-2xl bg-[#EAE6DC]/40 border border-[#E6E1D3] space-y-2.5">
                <label className="block text-xs font-bold text-[#1F2937]">
                  نوع المشغولة والمعروض: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditIsCustomOrder(false);
                      setEditDeposit('');
                      setEditDepositError('');
                    }}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      !editIsCustomOrder
                        ? 'bg-white border-[#254D3F] shadow-xs'
                        : 'bg-white/50 border-[#E6E1D3] text-[#6B7280]'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-[#1F2937]">قطعة جاهزة للطلب</span>
                      <span className="text-[10px] text-[#6B7280]">متوفرة بمخزن الورشة</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !editIsCustomOrder ? 'border-[#254D3F] bg-[#254D3F]' : 'border-gray-300'
                    }`}>
                      {!editIsCustomOrder && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditIsCustomOrder(true)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      editIsCustomOrder
                        ? 'bg-white border-[#C97A57] ring-2 ring-[#C97A57]/20 shadow-xs'
                        : 'bg-white/50 border-[#E6E1D3] text-[#6B7280]'
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-[#C97A57]">تفصيل بالطلب (Custom)</span>
                      <span className="text-[10px] text-[#6B7280]">تُصنع بعربون وضمان</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      editIsCustomOrder ? 'border-[#C97A57] bg-[#C97A57]' : 'border-gray-300'
                    }`}>
                      {editIsCustomOrder && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    التصنيف والحرفة: *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
                  >
                    <option value="pottery">فخار وخزف</option>
                    <option value="leather">جلود طبيعية</option>
                    <option value="crochet">كروشيه وتطريز</option>
                    <option value="wood">أرابيسك وخشب</option>
                    <option value="copper">نحاس ومعادن</option>
                    <option value="rugs">سجاد وكليم يدوي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    {editIsCustomOrder ? 'سعر القطعة الإجمالي (Total Price): *' : 'السعر المطلوب (بالجنيه المصري): *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      value={editPrice}
                      onChange={(e) => {
                        setEditPrice(e.target.value);
                        if (editDeposit && parseFloat(editDeposit) > parseFloat(e.target.value)) {
                          setEditDepositError('عفواً، لا يمكن أن يتجاوز مبلغ العربون السعر الإجمالي للمنتج!');
                        } else {
                          setEditDepositError('');
                        }
                      }}
                      placeholder={editIsCustomOrder ? 'مثال: 2000' : 'مثال: 450'}
                      className="w-full px-4 py-2.5 pl-12 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm font-mono focus:outline-none focus:border-[#254D3F]"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B7280]">
                      ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* If Custom Order: Mandatory Deposit Input for Edit */}
              {editIsCustomOrder && (
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#C97A57]/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-[#1F2937]">
                      مبلغ العربون المطلوب (Deposit Amount) للخامات وبدء التصنيع: *
                    </label>
                    <span className="text-[10px] font-bold text-[#C97A57] bg-[#C97A57]/10 px-2 py-0.5 rounded-full">
                      إجباري للطلب
                    </span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="number"
                      required={editIsCustomOrder}
                      min="1"
                      value={editDeposit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditDeposit(val);
                        const parsed = parseFloat(val);
                        const total = parseFloat(editPrice);
                        if (!isNaN(parsed) && !isNaN(total) && parsed > total) {
                          setEditDepositError('عفواً، لا يمكن أن يتجاوز مبلغ العربون السعر الإجمالي للمنتج!');
                        } else {
                          setEditDepositError('');
                        }
                      }}
                      placeholder="مثال: 500"
                      className={`w-full px-4 py-2.5 pl-12 rounded-xl border text-sm font-mono focus:outline-none ${
                        editDepositError ? 'border-red-500 bg-red-50/50' : 'border-[#C97A57]/50 bg-white focus:border-[#C97A57]'
                      }`}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#6B7280]">
                      ج.م
                    </span>
                  </div>

                  {editDepositError ? (
                    <p className="text-xs text-red-600 font-bold">
                      ⚠️ {editDepositError}
                    </p>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span>يُحفظ بأمان في حساب الضمان حتى المعاينة.</span>
                      {editPrice && editDeposit && !isNaN(parseFloat(editPrice)) && !isNaN(parseFloat(editDeposit)) && (
                        <span className="font-bold text-[#254D3F]">
                          المتبقي عند الاستلام: {Math.max(0, parseFloat(editPrice) - parseFloat(editDeposit)).toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Real-time Commission Calculator Box under Edit Price */}
              <CommissionCalculatorBox 
                priceValue={editPrice} 
                depositValue={editDeposit}
                isCustomOrder={editIsCustomOrder}
                className="mt-1" 
              />

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  وصف القطعة ومميزاتها:
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-sm focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              {/* Materials & Crafting Days & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    الخامات:
                  </label>
                  <input
                    type="text"
                    value={editMaterials}
                    onChange={(e) => setEditMaterials(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-xs focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    مدة الصنع (أيام):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editCraftingDays}
                    onChange={(e) => setEditCraftingDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-xs font-mono focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    المخزن المتاح:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1D3] bg-[#F6F4ED]/50 text-xs font-mono focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E6E1D3] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#E6E1D3] text-[#4B5563] text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

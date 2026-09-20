import React, { useState, useRef } from 'react';
import { 
  Store, 
  PlusCircle, 
  Sparkles, 
  Upload, 
  X, 
  Check, 
  Trash2, 
  Heart, 
  Camera, 
  Eye, 
  Edit3,
  Layers,
  ArrowLeft,
  Share2,
  RefreshCw,
  ImageIcon
} from 'lucide-react';
import { ShowcaseItem, VendorPortfolio, ShowcaseItemStatus } from '../types';

interface ShowcaseManagerProps {
  portfolio: VendorPortfolio | null;
  items: ShowcaseItem[];
  onAddShowcaseItem: (item: ShowcaseItem) => void;
  onUpdateShowcaseItem?: (item: ShowcaseItem) => void;
  onDeleteShowcaseItem: (itemId: string) => void;
  onUpdatePortfolio: (portfolio: VendorPortfolio) => void;
  onViewPublicShowcase: (artisanId: string) => void;
}

export const ShowcaseManager: React.FC<ShowcaseManagerProps> = ({
  portfolio,
  items,
  onAddShowcaseItem,
  onUpdateShowcaseItem,
  onDeleteShowcaseItem,
  onUpdatePortfolio,
  onViewPublicShowcase,
}) => {
  // Workshop Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [workshopName, setWorkshopName] = useState(portfolio?.workshopName || 'ورشة طين النيل لفخار قرية تونس');
  const [bio, setBio] = useState(portfolio?.bio || 'صناعة يدوية وتراثية أصيلة بأجود الخامات المصرية.');
  const [coverImage, setCoverImage] = useState(
    portfolio?.coverImage || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80'
  );
  const [avatar, setAvatar] = useState(
    portfolio?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  );
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCoverDragging, setIsCoverDragging] = useState(false);

  // Hidden File Input Refs for direct clicking
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const itemPhotosFileInputRef = useRef<HTMLInputElement>(null);
  const editItemPhotosFileInputRef = useRef<HTMLInputElement>(null);
  const replaceSinglePhotoInputRef = useRef<HTMLInputElement>(null);
  const targetReplaceIndex = useRef<{ index: number; isEditModal: boolean } | null>(null);

  // New Showcase Item Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('pottery');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('');
  const [status, setStatus] = useState<ShowcaseItemStatus>('repeatable');
  const [estimatedCraftDays, setEstimatedCraftDays] = useState('7');
  const [priceNote, setPriceNote] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDraggingItemPhotos, setIsDraggingItemPhotos] = useState(false);
  const [showManualUrlInput, setShowManualUrlInput] = useState(false);
  const [singleImageUrl, setSingleImageUrl] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Edit Existing Showcase Item State
  const [editingItem, setEditingItem] = useState<ShowcaseItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('pottery');
  const [editDescription, setEditDescription] = useState('');
  const [editMaterials, setEditMaterials] = useState('');
  const [editStatus, setEditStatus] = useState<ShowcaseItemStatus>('repeatable');
  const [editEstimatedCraftDays, setEditEstimatedCraftDays] = useState('7');
  const [editPriceNote, setEditPriceNote] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editSuccess, setEditSuccess] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Direct Cover Photo File Upload
  const handleCoverFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const newCover = reader.result;
        setCoverImage(newCover);
        if (portfolio) {
          onUpdatePortfolio({
            ...portfolio,
            coverImage: newCover,
            workshopName,
            bio,
            avatar,
          });
        }
        showToast('✓ تم تغيير صورة غلاف الفاترينة بنجاح!');
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Direct Avatar Photo File Upload
  const handleAvatarFileSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const newAvatar = reader.result;
        setAvatar(newAvatar);
        if (portfolio) {
          onUpdatePortfolio({
            ...portfolio,
            avatar: newAvatar,
            coverImage,
            workshopName,
            bio,
          });
        }
        showToast('✓ تم تحديث الصورة الشخصية للورشة بنجاح!');
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Multi-Photos Upload for New Item
  const handleItemPhotosFiles = (files: FileList | File[]) => {
    const remainingSlots = 8 - images.length;
    if (remainingSlots <= 0) return;

    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    const toProcess = fileList.slice(0, remainingSlots);

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => prev.length < 8 ? [...prev, reader.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 4. Multi-Photos Upload for Editing Item
  const handleEditItemPhotosFiles = (files: FileList | File[]) => {
    const remainingSlots = 8 - editImages.length;
    if (remainingSlots <= 0) return;

    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    const toProcess = fileList.slice(0, remainingSlots);

    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditImages(prev => prev.length < 8 ? [...prev, reader.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 5. Replace a single photo by clicking on its thumbnail
  const handleTriggerReplacePhoto = (index: number, isEditModal: boolean) => {
    targetReplaceIndex.current = { index, isEditModal };
    replaceSinglePhotoInputRef.current?.click();
  };

  const handleSinglePhotoReplaced = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetReplaceIndex.current) return;
    const { index, isEditModal } = targetReplaceIndex.current;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const replacement = reader.result;
        if (isEditModal) {
          setEditImages(prev => prev.map((img, i) => i === index ? replacement : img));
        } else {
          setImages(prev => prev.map((img, i) => i === index ? replacement : img));
        }
        showToast('✓ تم تغيير وتحديث الصورة المحددة بنجاح!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Save Workshop Profile Form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    const updated: VendorPortfolio = {
      ...portfolio,
      workshopName,
      bio,
      coverImage,
      avatar,
    };
    onUpdatePortfolio(updated);
    setProfileSuccess(true);
    showToast('✓ تم حفظ بيانات وهوية الفاترينة بنجاح!');
    setTimeout(() => {
      setProfileSuccess(false);
      setIsEditingProfile(false);
    }, 1500);
  };

  // Create New Showcase Item
  const handleCreateShowcaseItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalImages = images.length > 0 
      ? images 
      : ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'];

    const materialsArray = materials
      ? materials.split(/[,،]/).map(m => m.trim()).filter(Boolean)
      : ['خامات مصرية أصيلة'];

    const newItem: ShowcaseItem = {
      id: `showcase-${Date.now()}`,
      artisanId: portfolio?.artisanId || 'artisan-1',
      artisanName: portfolio?.artisanName || 'الصانع',
      artisanAvatar: avatar || portfolio?.avatar,
      artisanGovernorate: portfolio?.governorate || 'مصر',
      workshopName: workshopName || portfolio?.workshopName || 'ورشة الحِرفي',
      title: title.trim(),
      description: description.trim() || 'قطعة يدوية منفذة بحرفية وشغف تراثي.',
      materials: materialsArray,
      category,
      images: finalImages,
      status,
      estimatedCraftDays: parseInt(estimatedCraftDays, 10) || 7,
      estimatedPriceNote: priceNote.trim() || (status === 'repeatable' ? 'يبدأ حسب المقاسات المطلوبة' : 'سابقة أعمال للعرض والتوثيق'),
      likesCount: 0,
      likedBy: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddShowcaseItem(newItem);
    setFormSuccess(true);
    showToast('✓ تم نشر العمل في فاترينتك وسوق المشغولات!');
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
      setTitle('');
      setDescription('');
      setMaterials('');
      setImages([]);
      setPriceNote('');
    }, 1200);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item: ShowcaseItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditMaterials(item.materials.join('، '));
    setEditStatus(item.status);
    setEditEstimatedCraftDays(item.estimatedCraftDays.toString());
    setEditPriceNote(item.estimatedPriceNote || '');
    setEditImages([...item.images]);
  };

  // Save Edited Item
  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const materialsArray = editMaterials
      ? editMaterials.split(/[,،]/).map(m => m.trim()).filter(Boolean)
      : ['خامات مصرية أصيلة'];

    const finalImages = editImages.length > 0 ? editImages : editingItem.images;

    const updatedItem: ShowcaseItem = {
      ...editingItem,
      title: editTitle.trim(),
      category: editCategory,
      description: editDescription.trim(),
      materials: materialsArray,
      status: editStatus,
      estimatedCraftDays: parseInt(editEstimatedCraftDays, 10) || 7,
      estimatedPriceNote: editPriceNote.trim(),
      images: finalImages,
    };

    if (onUpdateShowcaseItem) {
      onUpdateShowcaseItem(updatedItem);
    }
    setEditSuccess(true);
    showToast('✓ تم تحديث صور وبيانات العمل الفني بنجاح!');
    setTimeout(() => {
      setEditSuccess(false);
      setEditingItem(null);
    }, 1200);
  };

  const totalLikes = items.reduce((acc, curr) => acc + (curr.likesCount || 0), portfolio?.likesCount || 0);

  // Curated cover options for quick inspiration
  const COVER_PRESETS = [
    { label: 'فخار قرية تونس', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80' },
    { label: 'أرابيسك فاطمي', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
    { label: 'نحاس الجمالية', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' },
    { label: 'جلود مجرى العيون', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80' },
    { label: 'كروشيه الإسكندرية', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="space-y-8 text-right" id="showcase-manager">
      {/* Hidden File Inputs for Immediate Click Triggers */}
      <input
        type="file"
        ref={coverFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCoverFileSelected(file);
          e.target.value = '';
        }}
      />

      <input
        type="file"
        ref={avatarFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleAvatarFileSelected(file);
          e.target.value = '';
        }}
      />

      <input
        type="file"
        ref={replaceSinglePhotoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleSinglePhotoReplaced}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#254D3F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-fade-in border border-white/20">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Identity Section with Click-to-Upload Cover & Avatar */}
      <div className="bg-white rounded-3xl border border-[#EAE6DC] overflow-hidden shadow-sm">
        
        {/* Cover Photo Area - CLICK DIRECTLY TO CHANGE */}
        <div 
          onClick={() => coverFileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsCoverDragging(true);
          }}
          onDragLeave={() => setIsCoverDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsCoverDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleCoverFileSelected(file);
          }}
          className={`relative h-48 sm:h-60 bg-stone-900 overflow-hidden cursor-pointer group transition-all ${
            isCoverDragging ? 'ring-4 ring-emerald-500 scale-[0.99]' : ''
          }`}
          title="اضغط هنا لتغيير صورة الغلاف مباشرة من جهازك أو اسحب صورة وأفلتها هنا"
        >
          <img
            src={coverImage}
            alt={workshopName}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20 group-hover:bg-black/50 transition-colors" />

          {/* Center Callout: Click to Change Cover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="px-4 py-2 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/30 shadow-lg scale-95 group-hover:scale-100 transition-transform">
              <Camera className="w-4 h-4 text-[#C97A57]" />
              <span>اضغط لتغيير صورة الغلاف من جهازك 📷</span>
            </div>
          </div>

          {/* Quick Actions top-left */}
          <div 
            className="absolute top-4 left-4 flex items-center gap-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {portfolio && (
              <button
                type="button"
                onClick={() => onViewPublicShowcase(portfolio.artisanId)}
                className="px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-[#254D3F] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              >
                <Eye className="w-4 h-4" />
                <span>معاينة الفاترينة في السوق</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'إغلاق البيانات' : 'تعديل بيانات الورشة'}</span>
            </button>
          </div>

          {/* Top-Right Badge Indicating Clickability */}
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-xs">
              <Camera className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>الغلاف (اضغط للتغيير)</span>
            </span>
          </div>

          {/* Profile Details Over Cover */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3.5 z-10">
            {/* Avatar Photo - CLICK DIRECTLY TO CHANGE */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                avatarFileInputRef.current?.click();
              }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-3 border-white shadow-xl bg-white cursor-pointer group/avatar overflow-hidden shrink-0"
              title="اضغط هنا لتغيير الصورة الشخصية أو شعار الورشة من جهازك"
            >
              <img
                src={avatar}
                alt={workshopName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/65 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-[9px] font-bold mt-0.5">تغيير الصورة</span>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-center sm:hidden">
                <span className="text-[8px] text-white font-bold">تغيير</span>
              </div>
            </div>

            <div className="text-white">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl sm:text-2xl drop-shadow-md">
                  {workshopName}
                </h2>
              </div>
              <p className="text-xs text-[#EAE6DC] font-medium mt-0.5">
                {portfolio?.artisanName} • {portfolio?.governorate || 'الفيوم'} • {portfolio?.category || 'فخار وخزف'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats & Overview Bar */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFBF7]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-rose-500" />
              </div>
              <div>
                <span className="text-[11px] text-[#6B7280] block font-bold">إجمالي إعجابات الفاترينة</span>
                <span className="font-mono text-sm sm:text-base font-black text-[#1F2937]">{totalLikes.toLocaleString('ar-EG')} إعجاب</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-r border-[#EAE6DC] pr-6">
              <div className="w-9 h-9 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center">
                <Camera className="w-4 h-4 text-[#C97A57]" />
              </div>
              <div>
                <span className="text-[11px] text-[#6B7280] block font-bold">الأعمال المعروضة</span>
                <span className="font-mono text-sm sm:text-base font-black text-[#1F2937]">{items.length} قطع فنية</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#C97A57] hover:bg-[#b56847] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة مشغولة جديدة للفاترينة</span>
          </button>
        </div>

        {/* Edit Identity Drawer / Form */}
        {isEditingProfile && (
          <div className="p-6 border-t border-[#EAE6DC] bg-white space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#1F2937] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#254D3F]" />
                <span>تعديل بيانات وهوية الفاترينة</span>
              </h3>
              {profileSuccess && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                  ✓ تم حفظ بيانات الفاترينة بنجاح
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Photo Pickers Grid: Cover and Avatar by DIRECT CLICK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Cover Photo Visual Selector */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                  <label className="block text-xs font-bold text-[#1F2937]">
                    صورة الغلاف البانورامية (Cover):
                  </label>
                  <div 
                    onClick={() => coverFileInputRef.current?.click()}
                    className="relative h-28 rounded-xl overflow-hidden bg-stone-200 border-2 border-dashed border-[#254D3F]/30 hover:border-[#254D3F] cursor-pointer group transition-all"
                  >
                    <img src={coverImage} alt="غلاف" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex flex-col items-center justify-center text-white transition-colors">
                      <Camera className="w-6 h-6 text-[#C97A57]" />
                      <span className="text-xs font-bold mt-1">اضغط هنا لتغيير الغلاف من جهازك</span>
                    </div>
                  </div>
                </div>

                {/* 2. Avatar Photo Visual Selector */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DC] space-y-2">
                  <label className="block text-xs font-bold text-[#1F2937]">
                    الصورة الشخصية أو شعار الورشة (Avatar):
                  </label>
                  <div className="flex items-center gap-4">
                    <div 
                      onClick={() => avatarFileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-200 border-2 border-dashed border-[#254D3F]/30 hover:border-[#254D3F] cursor-pointer group shrink-0 transition-all"
                    >
                      <img src={avatar} alt="شعار" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex flex-col items-center justify-center text-white transition-colors">
                        <Camera className="w-5 h-5 text-[#C97A57]" />
                        <span className="text-[10px] font-bold mt-1">تغيير الصورة</span>
                      </div>
                    </div>
                    <div className="text-xs text-[#6B7280] space-y-1">
                      <p className="font-bold text-[#1F2937]">اضغط على الصورة لتعديلها</p>
                      <p>تدعم جميع الصيغ JPG و PNG و WEBP.</p>
                      <button
                        type="button"
                        onClick={() => avatarFileInputRef.current?.click()}
                        className="text-xs text-[#254D3F] font-bold underline cursor-pointer mt-1"
                      >
                        اختر ملفاً من جهازك
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Presets */}
              <div>
                <span className="block text-xs text-[#6B7280] mb-2 font-bold">
                  أو اختر غلافاً تراثياً سريعاً يعبر عن محافظتك:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCoverImage(preset.url);
                        showToast(`✓ تم تطبيق غلاف ${preset.label}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                        coverImage === preset.url
                          ? 'bg-[#254D3F] text-white border-[#254D3F]'
                          : 'bg-[#F6F4ED] text-[#4B5563] border-[#EAE6DC] hover:bg-[#EAE6DC]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Workshop Name & Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    اسم الورشة أو البراند: *
                  </label>
                  <input
                    type="text"
                    required
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-sm focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    نبذة عن الورشة وتاريخ الصنعة:
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-sm focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE6DC]">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAE6DC] text-xs font-bold text-[#4B5563]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#254D3F] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 2. Modal for Adding a Showcase Item - CLICK DIRECTLY TO UPLOAD MULTIPLE IMAGES */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#EAE6DC] p-6 sm:p-8 shadow-2xl text-right relative my-6">
            
            {/* Hidden Input for adding photos */}
            <input
              type="file"
              ref={itemPhotosFileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleItemPhotosFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DC] mb-5">
              <div>
                <h3 className="font-display font-black text-xl text-[#1F2937] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C97A57]" />
                  <span>إضافة عمل جديد إلى الفاترينة (بورتفوليو)</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  اضغط على منطقة الصور لاختيارها مباشرة من هاتفك أو جهازك (حتى 8 صور للقطعة الواحدة)
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تمت إضافة القطعة بنجاح إلى فاترينتك وظهورها في السوق العام!</span>
              </div>
            )}

            <form onSubmit={handleCreateShowcaseItem} className="space-y-5">
              
              {/* PRIMARY UPLOAD ZONE: CLICK DIRECTLY OR DRAG & DROP */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DC]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#254D3F]" />
                    <span>صور القطعة (اضغط لاختيار الصور مباشرة):</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#C97A57]">
                    {images.length} / 8 صور
                  </span>
                </div>

                {/* Big Drag & Drop + Clickable Target */}
                {images.length < 8 && (
                  <div
                    onClick={() => itemPhotosFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingItemPhotos(true);
                    }}
                    onDragLeave={() => setIsDraggingItemPhotos(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingItemPhotos(false);
                      if (e.dataTransfer.files) handleItemPhotosFiles(e.dataTransfer.files);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDraggingItemPhotos 
                        ? 'border-[#254D3F] bg-[#254D3F]/5 ring-2 ring-[#254D3F]' 
                        : 'border-[#254D3F]/30 bg-white hover:bg-white hover:border-[#254D3F]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6 text-[#C97A57]" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#1F2937]">
                      اضغط هنا لاختيار صور من جهازك أو اسحب الصور إلى هنا
                    </p>
                    <p className="text-[11px] text-[#6B7280] mt-1">
                      يمكنك تحديد عدة صور معاً بضغطة واحدة من الاستوديو (صور عالية الدقة)
                    </p>
                  </div>
                )}

                {/* Interactive Thumbnails Grid */}
                {images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] text-[#6B7280] block font-bold">
                      الصور المرفوعة (اضغط على أي صورة لتغييرها أو الحذف):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {images.map((img, idx) => (
                        <div 
                          key={idx} 
                          className="relative aspect-square rounded-xl overflow-hidden border border-[#EAE6DC] group bg-white shadow-2xs"
                        >
                          <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                          
                          {/* Top Action Overlay: Remove */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 left-1 p-1 rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer z-10"
                            title="حذف الصورة"
                          >
                            <X className="w-3 h-3" />
                          </button>

                          {/* Hover to Replace Single Photo */}
                          <div 
                            onClick={() => handleTriggerReplacePhoto(idx, false)}
                            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-center"
                            title="اضغط لاستبدال هذه الصورة"
                          >
                            <RefreshCw className="w-4 h-4 text-[#C97A57] mb-1" />
                            <span className="text-[9px] font-bold">اضغط للتغيير</span>
                          </div>

                          {idx === 0 && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-[#254D3F] text-white text-[9px] font-bold shadow-xs">
                              الرئيسية
                            </span>
                          )}
                        </div>
                      ))}

                      {/* Add more button tile */}
                      {images.length < 8 && (
                        <div
                          onClick={() => itemPhotosFileInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-[#254D3F]/30 hover:border-[#254D3F] bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all group"
                        >
                          <PlusCircle className="w-5 h-5 text-[#254D3F] group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-[10px] font-bold text-[#254D3F]">إضافة صورة</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Optional Manual URL (Hidden by default for simplicity) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualUrlInput(!showManualUrlInput)}
                    className="text-[11px] text-[#6B7280] hover:text-[#254D3F] underline cursor-pointer"
                  >
                    {showManualUrlInput ? 'إخفاء خيار الرابط' : 'أو إدخال رابط صورة (URL) عبر الإنترنت؟'}
                  </button>

                  {showManualUrlInput && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="url"
                        value={singleImageUrl}
                        onChange={(e) => setSingleImageUrl(e.target.value)}
                        placeholder="أدخل رابط الصورة https://..."
                        className="flex-1 px-3 py-2 rounded-xl border border-[#EAE6DC] bg-white text-xs focus:outline-none focus:border-[#254D3F]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (singleImageUrl.trim() && images.length < 8) {
                            setImages(prev => [...prev, singleImageUrl.trim()]);
                            setSingleImageUrl('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#254D3F] text-white text-xs font-bold cursor-pointer"
                      >
                        إضافة
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    عنوان القطعة الفنية: *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: فازة قارون الخزفية الكبرى بأكاسيد النيل"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-xs sm:text-sm focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    نوع الحرفة والتصنيف: *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-xs sm:text-sm focus:outline-none focus:border-[#254D3F]"
                  >
                    <option value="pottery">فخار وخزف</option>
                    <option value="leather">جلود طبيعية</option>
                    <option value="crochet">كروشيه وتطريز</option>
                    <option value="wood">أرابيسك وخشب</option>
                    <option value="copper">نحاس ومعادن</option>
                    <option value="rugs">سجاد وكليم يدوي</option>
                  </select>
                </div>
              </div>

              {/* Status Selector: Repeatable vs Portfolio Only */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                <label className="block text-xs font-bold text-[#1F2937]">
                  حالة القطعة في الفاترينة: *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                    status === 'repeatable'
                      ? 'bg-white border-emerald-600 ring-1 ring-emerald-600'
                      : 'bg-white/60 border-stone-200 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="repeatable"
                      checked={status === 'repeatable'}
                      onChange={() => setStatus('repeatable')}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1F2937] block">
                        ✓ متاح تنفيذ شبيهة بالطلب
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        يظهر للزبون زر "طلب شبيهة" لدفع عربون وتفصيلها بمقاساته.
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                    status === 'portfolio_only'
                      ? 'bg-white border-amber-600 ring-1 ring-amber-600'
                      : 'bg-white/60 border-stone-200 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="portfolio_only"
                      checked={status === 'portfolio_only'}
                      onChange={() => setStatus('portfolio_only')}
                      className="mt-1"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1F2937] block">
                        سابقة أعمال للعرض والتوثيق فقط
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        قطعة مميزة أو مباعة للتباهي بها وإبراز براعة الورشة دون تكرار فوري.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description & Story */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  طريقة الصنع والقصة التراثية ومكونات القطعة:
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="احكِ للزبائن عن مراحل التشكيل، الفرن، الألوان الطبيعية، ونوع الخامات..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-xs sm:text-sm focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              {/* Materials & Crafting Time & Price Note */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    الخامات (افصل بفواصل):
                  </label>
                  <input
                    type="text"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="طين أسواني، أكسيد نحاس"
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE6DC] text-xs focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    مدة الصنع التقريبية (أيام):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={estimatedCraftDays}
                    onChange={(e) => setEstimatedCraftDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE6DC] text-xs font-mono focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    ملاحظة السعر / الميزانية:
                  </label>
                  <input
                    type="text"
                    value={priceNote}
                    onChange={(e) => setPriceNote(e.target.value)}
                    placeholder="مثال: يبدأ من 1,200 ج.م"
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE6DC] text-xs focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE6DC]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#EAE6DC] text-xs font-bold text-[#4B5563] hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>نشر في الفاترينة والسوق</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal for Editing an Existing Showcase Item (Modifying Photos by Direct Click) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-[#EAE6DC] p-6 sm:p-8 shadow-2xl text-right relative my-6">
            
            {/* Hidden Input for adding photos to editing item */}
            <input
              type="file"
              ref={editItemPhotosFileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleEditItemPhotosFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DC] mb-5">
              <div>
                <h3 className="font-display font-black text-xl text-[#1F2937] flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#C97A57]" />
                  <span>تعديل العمل الفني: {editingItem.title}</span>
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  اضغط على أي صورة لتغييرها بصورة جديدة من جهازك، أو أضف زوايا إضافية
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم تحديث العمل بنجاح!</span>
              </div>
            )}

            <form onSubmit={handleSaveEditedItem} className="space-y-5">
              {/* Photo Management by Click */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DC]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#254D3F]" />
                    <span>صور العمل ({editImages.length} من 8):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => editItemPhotosFileInputRef.current?.click()}
                    className="text-xs text-[#254D3F] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع صورة إضافية</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {editImages.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#EAE6DC] group bg-white shadow-2xs"
                    >
                      <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      <button
                        type="button"
                        onClick={() => setEditImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 left-1 p-1 rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors cursor-pointer z-10"
                        title="حذف الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div 
                        onClick={() => handleTriggerReplacePhoto(idx, true)}
                        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-center"
                        title="اضغط لاستبدال هذه الصورة"
                      >
                        <RefreshCw className="w-4 h-4 text-[#C97A57] mb-1" />
                        <span className="text-[9px] font-bold">اضغط للتغيير</span>
                      </div>

                      {idx === 0 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-[#254D3F] text-white text-[9px] font-bold shadow-xs">
                          الرئيسية
                        </span>
                      )}
                    </div>
                  ))}

                  {editImages.length < 8 && (
                    <div
                      onClick={() => editItemPhotosFileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-[#254D3F]/30 hover:border-[#254D3F] bg-white flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all group"
                    >
                      <PlusCircle className="w-5 h-5 text-[#254D3F] group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[10px] font-bold text-[#254D3F]">إضافة صورة</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    عنوان القطعة الفنية: *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-xs sm:text-sm focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                    نوع الحرفة: *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-xs sm:text-sm focus:outline-none focus:border-[#254D3F]"
                  >
                    <option value="pottery">فخار وخزف</option>
                    <option value="leather">جلود طبيعية</option>
                    <option value="crochet">كروشيه وتطريز</option>
                    <option value="wood">أرابيسك وخشب</option>
                    <option value="copper">نحاس ومعادن</option>
                    <option value="rugs">سجاد وكليم يدوي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  الوصف والقصة:
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EAE6DC] text-xs sm:text-sm focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    الخامات:
                  </label>
                  <input
                    type="text"
                    value={editMaterials}
                    onChange={(e) => setEditMaterials(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE6DC] text-xs focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    مدة الصنع (أيام):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editEstimatedCraftDays}
                    onChange={(e) => setEditEstimatedCraftDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE6DC] text-xs font-mono focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    ملاحظة السعر:
                  </label>
                  <input
                    type="text"
                    value={editPriceNote}
                    onChange={(e) => setEditPriceNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE6DC] text-xs focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE6DC]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#EAE6DC] text-xs font-bold text-[#4B5563] hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Current Showcase Items Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-[#1F2937] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#254D3F]" />
              <span>معرض الأعمال الحالي في الفاترينة ({items.length})</span>
            </h3>
            <p className="text-xs text-[#6B7280]">
              هذه الأعمال تظهر لزوار المنصة في سوق الفاترينات، ويمكنك تعديل صورها أو بياناتها في أي وقت
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white border border-dashed border-[#EAE6DC] text-center space-y-3">
            <Camera className="w-10 h-10 text-[#C97A57] mx-auto opacity-70" />
            <h4 className="font-bold text-base text-[#1F2937]">لم تقم بإضافة أعمال إلى فاترينتك بعد</h4>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              ارفع صور سوابق أعمالك وتحفك الفنية (حتى 8 صور للقطعة الواحدة) لتستقبل طلبات تفصيل شبيهة وتزيد من شهرة ورشتك!
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-5 py-2 rounded-xl bg-[#254D3F] text-white text-xs font-bold shadow-sm cursor-pointer"
            >
              + إضافة أول عمل بالضغط هنا
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#EAE6DC] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div 
                    onClick={() => handleOpenEditItem(item)}
                    className="relative aspect-16/10 overflow-hidden bg-stone-100 cursor-pointer group"
                    title="اضغط لتعديل صور وبيانات هذه القطعة"
                  >
                    <img 
                      src={item.images[0]} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-[#C97A57]" />
                        <span>تعديل الصور</span>
                      </span>
                    </div>

                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/70 text-white text-[10px] font-bold font-mono">
                      {item.images.length} صور 📸
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-[#254D3F] shadow-xs">
                      {item.status === 'repeatable' ? '✓ متاح تفصيل شبيهة' : 'سابقة أعمال'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 
                      onClick={() => handleOpenEditItem(item)}
                      className="font-bold text-sm text-[#1F2937] line-clamp-1 hover:text-[#254D3F] cursor-pointer"
                    >
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    {item.estimatedPriceNote && (
                      <span className="text-[11px] font-bold text-[#C97A57] block font-mono">
                        {item.estimatedPriceNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-2 border-t border-[#EAE6DC] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span className="font-mono font-bold">{item.likesCount} إعجاب</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditItem(item)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#254D3F] text-[#4B5563] hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-[#EAE6DC]"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C97A57]" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteShowcaseItem(item.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors cursor-pointer"
                      title="حذف من الفاترينة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

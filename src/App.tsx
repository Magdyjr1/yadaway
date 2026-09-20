import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  OrderStatus,
  Artisan,
  UserProfile,
  UserRole,
  Review,
  CustomOrderRequest, 
  DEFAULT_USER_AVATAR,
  ShowcaseItem,
  VendorPortfolio,
  SupportTicket,
  SupportChatMessage
} from './types';
import { PRODUCTS, CATEGORIES, INITIAL_ORDERS, INITIAL_REVIEWS, ARTISANS } from './data/mockData';
import { INITIAL_SHOWCASE_ITEMS, INITIAL_VENDOR_PORTFOLIOS } from './data/showcaseData';
import { Navbar, AppView } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CraftsCatalogView } from './components/CraftsCatalogView';
import { ProductDetailsView } from './components/ProductDetailsView';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { CartCheckoutView } from './components/CartCheckoutView';
import { FavoritesView } from './components/FavoritesView';
import { ArtisanStorefrontView } from './components/ArtisanStorefrontView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { SupportChatView } from './components/SupportChatView';
import { CustomOrderModal } from './components/CustomOrderModal';
import { BazaarView } from './components/BazaarView';
import { VendorShowcaseView } from './components/VendorShowcaseView';
import { ShowcaseDetailModal } from './components/ShowcaseDetailModal';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
// import { SuperAdminDashboard } from './components/SuperAdminDashboard';
// import { LegalView } from './components/LegalView';
import { supabase, signOutUser, fetchUserProfile } from './services/supabase';
import { Store, ShieldAlert, Sparkles, ShoppingBag } from 'lucide-react';

const getVisitorId = (): string => {
  try {
    let vid = localStorage.getItem('yadawy_visitor_id');
    if (!vid) {
      vid = `guest_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('yadawy_visitor_id', vid);
    }
    return vid;
  } catch {
    return 'guest_user';
  }
};

export default function App() {
  // Navigation view state
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [activeTrackingNumber, setActiveTrackingNumber] = useState<string>('');
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('yadawy_current_user');
      if (saved) {
        const user = JSON.parse(saved);
        if (!user.avatar || user.avatar.includes('photo-1534528741775-53994a69daeb') || user.avatar.includes('photo-1494790108377-be9c29b29330')) {
          user.avatar = DEFAULT_USER_AVATAR;
          localStorage.setItem('yadawy_current_user', JSON.stringify(user));
        }
        return user;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Custom Order Modal State
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState(false);
  const [customOrderArtisan, setCustomOrderArtisan] = useState<Artisan | null>(null);
  const [customOrderProduct, setCustomOrderProduct] = useState<Product | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  // Data state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_products');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return PRODUCTS;
  });

  const [categories] = useState<Category[]>(CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Favorites state (array of product IDs)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_favorites');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['prod-1', 'prod-3'];
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  // Showcase & Bazaar State
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_showcase_items');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SHOWCASE_ITEMS;
  });

  const [vendorPortfolios, setVendorPortfolios] = useState<VendorPortfolio[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_vendor_portfolios');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_VENDOR_PORTFOLIOS;
  });

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_support_tickets_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Liked showcase item IDs state (persisted)
  const [likedShowcaseItemIds, setLikedShowcaseItemIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_liked_showcase_items');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Liked vendor portfolio artisan IDs state (persisted)
  const [likedPortfolioIds, setLikedPortfolioIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_liked_portfolios');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedShowcaseItem, setSelectedShowcaseItem] = useState<ShowcaseItem | null>(null);
  const [selectedPortfolioArtisanId, setSelectedPortfolioArtisanId] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist current user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('yadawy_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('yadawy_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Listen to real Supabase Auth session & state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) {
            setCurrentUser(profile);
            try {
              localStorage.setItem('yadawy_current_user', JSON.stringify(profile));
            } catch {
              // ignore
            }
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          try {
            localStorage.setItem('yadawy_current_user', JSON.stringify(profile));
          } catch {
            // ignore
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        try {
          localStorage.removeItem('yadawy_current_user');
        } catch {
          // ignore
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --- Hotkey for Super Admin Access (Ctrl + Shift + A) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setCurrentView('super-admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert('🌿 تم الدخول إلى لوحة التحكم العليا للمشرف (Super Admin Dashboard)');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Persist orders
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Persist reviews
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_reviews', JSON.stringify(reviews));
    } catch {
      // ignore
    }
  }, [reviews]);

  // Persist showcase items
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_showcase_items', JSON.stringify(showcaseItems));
    } catch {
      // ignore
    }
  }, [showcaseItems]);

  // Persist vendor portfolios
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_vendor_portfolios', JSON.stringify(vendorPortfolios));
    } catch {
      // ignore
    }
  }, [vendorPortfolios]);

  // Persist liked showcase item IDs
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_liked_showcase_items', JSON.stringify(likedShowcaseItemIds));
    } catch {
      // ignore
    }
  }, [likedShowcaseItemIds]);

  // Persist liked vendor portfolio IDs
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_liked_portfolios', JSON.stringify(likedPortfolioIds));
    } catch {
      // ignore
    }
  }, [likedPortfolioIds]);

  // Persist support tickets
  useEffect(() => {
    try {
      localStorage.setItem('yadawy_support_tickets_v2', JSON.stringify(supportTickets));
    } catch {
      // ignore
    }
  }, [supportTickets]);

  // Support Handlers
  const handleUpdateSupportTickets = (newTickets: SupportTicket[]) => {
    setSupportTickets(newTickets);
  };

  const handleAdminReply = (ticketId: string, replyText: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const adminMsg: SupportChatMessage = {
      id: `admin-${Date.now()}`,
      sender: 'admin',
      text: replyText,
      timestamp: timeStr
    };

    setSupportTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'in_progress',
          lastUpdated: timeStr,
          messages: [...t.messages, adminMsg]
        };
      }
      return t;
    }));
  };

  // Handle Cart Operations
  const handleAddToCart = (product: Product, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleInstantBuy = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Handle Favorites Operations (Like / Unlike Product with persistent count & toggle)
  const handleToggleFavorite = (product: Product) => {
    const userId = currentUser?.id || getVisitorId();
    const isCurrentlyLiked = favorites.includes(product.id);

    // 1. Toggle in favorites list
    setFavorites(prev => {
      if (isCurrentlyLiked) {
        return prev.filter(id => id !== product.id);
      }
      return [...prev, product.id];
    });

    // 2. Increment or decrement like count on product and save
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === product.id) {
          const likedBy = p.likedBy || [];
          const newLikedBy = isCurrentlyLiked
            ? likedBy.filter(id => id !== userId)
            : [...likedBy, userId];
          const baseCount = p.likesCount ?? 15;
          const newLikesCount = Math.max(0, baseCount + (isCurrentlyLiked ? -1 : 1));
          return {
            ...p,
            likesCount: newLikesCount,
            likedBy: newLikedBy
          };
        }
        return p;
      })
    );

    // 3. Update currently selected product if opened in details modal/view
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct(prev => {
        if (!prev) return null;
        const likedBy = prev.likedBy || [];
        const newLikedBy = isCurrentlyLiked
          ? likedBy.filter(id => id !== userId)
          : [...likedBy, userId];
        const baseCount = prev.likesCount ?? 15;
        const newLikesCount = Math.max(0, baseCount + (isCurrentlyLiked ? -1 : 1));
        return {
          ...prev,
          likesCount: newLikesCount,
          likedBy: newLikedBy
        };
      });
    }
  };

  // Handle Artisan Dashboard Operations
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord)
    );
  };

  const handleToggleProductStock = (productId: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock: p.stock > 0 ? 0 : 5 } : p
      )
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Navigation handlers
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArtisan = (artisan: Artisan) => {
    setSelectedArtisan(artisan);
    setCurrentView('storefront');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCustomOrder = (artisan: Artisan, product?: Product) => {
    setCustomOrderArtisan(artisan);
    setCustomOrderProduct(product || null);
    setIsCustomOrderOpen(true);
  };

  const handleSubmitCustomOrder = (request: CustomOrderRequest) => {
    const customOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `YD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: request.referenceProduct ? [{ product: request.referenceProduct, quantity: 1 }] : [],
      totalAmount: request.budgetEstimate || 450,
      shippingFee: 50,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      customerAddress: `طلب مخصص - ${request.governorate}`,
      governorate: request.governorate,
      paymentMethod: 'instapay',
      status: 'new',
      createdAt: 'الآن',
      notes: `طلب تفصيل مخصص: ${request.notes || ''}`
    };
    setOrders(prev => [customOrder, ...prev]);
    setIsCustomOrderOpen(false);
  };

  const handleAddReview = (productId: string, reviewData: { author: string; location: string; rating: number; comment: string }) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      author: reviewData.author,
      location: reviewData.location,
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: 'اليوم',
      verifiedBuyer: true
    };
    setReviews(prev => [newRev, ...prev]);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const count = (p.reviewCount || 0) + 1;
        const currentSum = (p.rating || 5) * (p.reviewCount || 1);
        const rating = Number(((currentSum + reviewData.rating) / count).toFixed(1));
        return { ...p, rating, reviewCount: count };
      }
      return p;
    }));
  };

  const handleTrackOrder = (orderNumber: string) => {
    setActiveTrackingNumber(orderNumber);
    setCurrentView('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  // User Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('yadawy_current_user', JSON.stringify(user));
    } catch {
      // ignore
    }
    if (user.role === 'artisan') {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem('yadawy_current_user');
    } catch {
      // ignore
    }
    setIsProfileModalOpen(false);
    if (currentView === 'dashboard') {
      setCurrentView('home');
    }
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    try {
      localStorage.setItem('yadawy_current_user', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Showcase & Bazaar Handlers
  const handleLikeShowcaseItem = (itemId: string) => {
    const userId = currentUser?.id || getVisitorId();
    const isLiked = likedShowcaseItemIds.includes(itemId);

    // 1. Toggle in likedShowcaseItemIds
    setLikedShowcaseItemIds(prev =>
      isLiked ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );

    // 2. Toggle in showcaseItems list
    setShowcaseItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const likedBy = item.likedBy || [];
          const userAlreadyLiked = isLiked || likedBy.includes(userId);
          const newLikedBy = userAlreadyLiked
            ? likedBy.filter(id => id !== userId)
            : [...likedBy, userId];
          const newLikesCount = Math.max(0, (item.likesCount || 0) + (userAlreadyLiked ? -1 : 1));
          return {
            ...item,
            likedBy: newLikedBy,
            likesCount: newLikesCount
          };
        }
        return item;
      })
    );

    // 3. Toggle in selectedShowcaseItem if open in modal
    if (selectedShowcaseItem && selectedShowcaseItem.id === itemId) {
      setSelectedShowcaseItem(prev => {
        if (!prev) return null;
        const likedBy = prev.likedBy || [];
        const userAlreadyLiked = isLiked || likedBy.includes(userId);
        const newLikedBy = userAlreadyLiked
          ? likedBy.filter(id => id !== userId)
          : [...likedBy, userId];
        const newLikesCount = Math.max(0, (prev.likesCount || 0) + (userAlreadyLiked ? -1 : 1));
        return {
          ...prev,
          likedBy: newLikedBy,
          likesCount: newLikesCount
        };
      });
    }
  };

  const handleLikePortfolio = (artisanId: string) => {
    const userId = currentUser?.id || getVisitorId();
    const isLiked = likedPortfolioIds.includes(artisanId);

    // 1. Toggle in likedPortfolioIds
    setLikedPortfolioIds(prev =>
      isLiked ? prev.filter(id => id !== artisanId) : [...prev, artisanId]
    );

    // 2. Toggle in vendorPortfolios
    setVendorPortfolios(prev =>
      prev.map(p => {
        if (p.artisanId === artisanId) {
          const likedBy = p.likedBy || [];
          const userAlreadyLiked = isLiked || likedBy.includes(userId);
          const newLikedBy = userAlreadyLiked
            ? likedBy.filter(id => id !== userId)
            : [...likedBy, userId];
          const newLikesCount = Math.max(0, (p.likesCount || 0) + (userAlreadyLiked ? -1 : 1));
          return {
            ...p,
            likedBy: newLikedBy,
            likesCount: newLikesCount
          };
        }
        return p;
      })
    );
  };

  const handleAddShowcaseItem = (newItem: ShowcaseItem) => {
    setShowcaseItems(prev => [newItem, ...prev]);
  };

  const handleUpdateShowcaseItem = (updatedItem: ShowcaseItem) => {
    setShowcaseItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteShowcaseItem = (itemId: string) => {
    setShowcaseItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateVendorPortfolio = (updated: VendorPortfolio) => {
    setVendorPortfolios(prev => prev.map(p => p.artisanId === updated.artisanId ? updated : p));
  };

  const handleViewShowcase = (artisanId: string) => {
    setSelectedPortfolioArtisanId(artisanId);
    setCurrentView('vendor-showcase');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestSimilar = (showcaseItem: ShowcaseItem) => {
    const matchedArtisan = products.find(p => p.artisan.id === showcaseItem.artisanId)?.artisan || {
      id: showcaseItem.artisanId,
      name: showcaseItem.artisanName,
      governorate: showcaseItem.artisanGovernorate || 'الفيوم',
      avatar: showcaseItem.artisanAvatar || DEFAULT_USER_AVATAR,
      bio: showcaseItem.workshopName || 'صانع معتمد في منصة يدوي',
      craft: showcaseItem.category,
      rating: 4.9,
      reviewCount: 35,
      yearsOfExperience: 12,
      phone: '01000000000',
    };

    const refProduct: Product = {
      id: showcaseItem.id,
      title: `تفصيل قطعة شبيهة: ${showcaseItem.title}`,
      price: 1200,
      description: showcaseItem.description,
      category: showcaseItem.category,
      images: showcaseItem.images,
      artisan: matchedArtisan,
      story: `مستوحاة من التحفة المعروضة في فاترينة (${showcaseItem.workshopName})`,
      materials: showcaseItem.materials,
      craftingTimeDays: showcaseItem.estimatedCraftDays || 7,
      rating: 5,
      reviewCount: 1,
      stock: 1,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };

    setCustomOrderArtisan(matchedArtisan);
    setCustomOrderProduct(refProduct);
    setSelectedShowcaseItem(null);
    setIsCustomOrderOpen(true);
  };

  // Get favorite products
  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  // Get related products for details view
  const relatedProducts = selectedProduct
    ? products.filter(p => p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.artisan.id === selectedProduct.artisan.id))
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F4ED] text-[#1F2937]">
      {/* Sticky Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard') {
            if (!currentUser) {
              handleOpenAuth('login');
              return;
            } else if (currentUser.role !== 'artisan') {
              setIsProfileModalOpen(true);
              return;
            }
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartItems={cartItems}
        favoritesCount={favorites.length}
        onOpenCart={() => {
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        products={products}
        showcaseItems={showcaseItems}
        vendorPortfolios={vendorPortfolios}
        artisans={ARTISANS}
        onSelectProduct={handleSelectProduct}
        onSelectArtisan={(artisanId) => {
          const art = ARTISANS.find(a => a.id === artisanId) || (products.find(p => p.artisan?.id === artisanId)?.artisan);
          if (art) {
            handleSelectArtisan(art);
          } else {
            handleViewShowcase(artisanId);
          }
        }}
        onViewShowcase={handleViewShowcase}
        onSelectShowcaseItem={(item) => {
          setSelectedShowcaseItem(item);
          if (item.artisanId) {
            setSelectedPortfolioArtisanId(item.artisanId);
          }
          setCurrentView('vendor-showcase');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(product, e) => handleAddToCart(product, 1, e)}
            onSelectArtisan={handleSelectArtisan}
            onNavigateToCatalog={(categoryId) => {
              if (categoryId) setSelectedCategory(categoryId);
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToBazaar={() => {
              setCurrentView('bazaar');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateSupport={() => {
              setCurrentView('support');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Dedicated Full Crafts Catalog Page */}
        {currentView === 'catalog' && (
          <CraftsCatalogView
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(product, e) => handleAddToCart(product, 1, e)}
            onBackToHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectArtisan={handleSelectArtisan}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {currentView === 'product' && selectedProduct && (
          <ProductDetailsView
            product={selectedProduct}
            isFavorite={favorites.includes(selectedProduct.id)}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
            onInstantBuy={handleInstantBuy}
            onBack={() => setCurrentView('catalog')}
            relatedProducts={relatedProducts}
            onSelectProduct={handleSelectProduct}
            reviews={reviews}
            onAddReview={handleAddReview}
            onOpenCustomOrder={handleOpenCustomOrder}
            onSelectArtisan={handleSelectArtisan}
            currentUser={currentUser}
          />
        )}

        {/* Artisan Dedicated Storefront */}
        {currentView === 'storefront' && selectedArtisan && (
          <ArtisanStorefrontView
            artisan={selectedArtisan}
            allProducts={products}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(prod, e) => handleAddToCart(prod, 1, e)}
            onOpenCustomOrder={handleOpenCustomOrder}
            onBack={() => setCurrentView('catalog')}
            reviews={reviews}
          />
        )}

        {/* Order Tracking View */}
        {currentView === 'tracking' && (
          <OrderTrackingView
            orders={orders}
            initialOrderNumber={activeTrackingNumber}
            onBack={() => setCurrentView('home')}
            onSelectProductById={(id) => {
              const p = products.find(x => x.id === id);
              if (p) handleSelectProduct(p);
            }}
          />
        )}

        {/* Artisan Dashboard - STRICTLY RESTRICTED TO ARTISAN USERS */}
        {currentView === 'dashboard' && (
          currentUser?.role === 'artisan' ? (
            <ArtisanDashboard
              products={products}
              orders={orders}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onToggleProductStock={handleToggleProductStock}
              onDeleteProduct={handleDeleteProduct}
              onViewProduct={handleSelectProduct}
              currentUser={currentUser}
              showcaseItems={showcaseItems.filter(i => i.artisanId === currentUser?.id || i.artisanId === 'artisan-1')}
              vendorPortfolio={vendorPortfolios.find(p => p.artisanId === currentUser?.id) || vendorPortfolios[0]}
              onAddShowcaseItem={handleAddShowcaseItem}
              onUpdateShowcaseItem={handleUpdateShowcaseItem}
              onDeleteShowcaseItem={handleDeleteShowcaseItem}
              onUpdateVendorPortfolio={handleUpdateVendorPortfolio}
              onViewPublicShowcase={handleViewShowcase}
            />
          ) : currentUser ? (
            /* Logged in as standard customer - Prompt to Upgrade */
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E6E1D3] text-center card-shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-[#C97A57]/10 text-[#C97A57] flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8" />
              </div>
              <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">
                لوحة تحكم الصانع والحِرفي
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mb-6 leading-relaxed">
                أهلاً بك <strong>{currentUser.name}</strong>. أنت مسجل حالياً كمتسوق في يدوي. للدخول إلى لوحة إدارة الورشة ورفع منتجاتك اليدوية ومتابعة طلبات الزبائن، يمكنك ترقية حسابك إلى صانع مجاناً!
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-[#C97A57] text-white text-sm font-bold shadow-md hover:bg-[#b56846] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ترقية حسابي إلى صانع الآن (مجاناً)</span>
                </button>
                {/* Secret Link to Super Admin for demo purposes - normally restricted by role check */}
                <button
                  onClick={() => setCurrentView('super-admin')}
                  className="text-[10px] text-gray-300 hover:text-red-500 mt-4 transition-colors cursor-pointer"
                >
                  [الدخول للوحة المشرف العام - تجريبي]
                </button>
                <button
                  onClick={() => setCurrentView('catalog')}
                  className="text-xs text-[#6B7280] hover:underline mt-2 cursor-pointer"
                >
                  تصفح سوق المشغولات كمتسوق
                </button>
              </div>
            </div>
          ) : (
            /* Not logged in */
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E6E1D3] text-center card-shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8" />
              </div>
              <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">
                بوابة الحِرفيين وأصحاب الورش
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mb-6 leading-relaxed">
                هذه البوابة مخصصة للحرفيين المسجلين في منصة يدوي. يرجى تسجيل الدخول أو إنشاء حسابك أولاً، ثم ترقية الحساب إلى صانع لإدارة ورشتك.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="w-full py-3 rounded-xl bg-[#254D3F] text-white text-sm font-bold shadow-md hover:bg-[#1A372D] cursor-pointer"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="w-full py-3 rounded-xl bg-white border border-[#254D3F] text-[#254D3F] text-sm font-bold hover:bg-[#254D3F]/5 cursor-pointer"
                >
                  إنشاء حساب جديد
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-xs text-[#6B7280] hover:underline mt-2 cursor-pointer"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'checkout' && (
          <CartCheckoutView
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onBackToShopping={() => setCurrentView('catalog')}
            onPlaceOrder={handlePlaceOrder}
            currentUser={currentUser}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favoriteProducts={favoriteProducts}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={handleSelectProduct}
            onAddToCart={(prod, e) => handleAddToCart(prod, 1, e)}
            onBackToShopping={() => setCurrentView('catalog')}
          />
        )}

        {/* 24/7 Dedicated Support Chat View for Customers and Artisans */}
        {currentView === 'support' && (
          <SupportChatView
            currentUser={currentUser}
            tickets={supportTickets}
            onUpdateTickets={handleUpdateSupportTickets}
            onNavigateHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateDashboard={() => {
              if (!currentUser) {
                handleOpenAuth('login');
              } else if (currentUser.role !== 'artisan') {
                setIsProfileModalOpen(true);
              } else {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onNavigateTracking={() => {
              setCurrentView('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={() => handleOpenAuth('login')}
          />
        )}

        {/* Super Admin Dashboard Integration Component */}
        {currentView === 'super-admin' && (
          <div className="p-20 text-center">لوحة المشرف قيد التحميل...</div>
        )}

        {/* Legal Policies: Terms & Privacy */}
        {currentView === 'legal' && (
          <div className="p-20 text-center">صفحة السياسات قيد التحميل...</div>
        )}

        {/* Bazaar - National Artisans Showcase Feed */}
        {currentView === 'bazaar' && (
          <BazaarView
            showcaseItems={showcaseItems || []}
            items={showcaseItems || []}
            portfolios={vendorPortfolios || []}
            categories={CATEGORIES}
            onSelectItem={(item) => setSelectedShowcaseItem(item)}
            onSelectPortfolio={handleViewShowcase}
            onViewPortfolio={handleViewShowcase}
            onLikeItem={handleLikeShowcaseItem}
            onLikePortfolio={handleLikePortfolio}
            likedItemIds={likedShowcaseItemIds}
            likedPortfolioIds={likedPortfolioIds}
            onRequestSimilar={handleRequestSimilar}
            currentUser={currentUser}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenArtisanDashboard={() => {
              if (!currentUser) {
                handleOpenAuth('login');
              } else if (currentUser.role !== 'artisan') {
                setIsProfileModalOpen(true);
              } else {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onNavigateToDashboard={() => {
              if (!currentUser) {
                handleOpenAuth('login');
              } else if (currentUser.role !== 'artisan') {
                setIsProfileModalOpen(true);
              } else {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}

        {/* Dedicated Vendor Showcase Page */}
        {currentView === 'vendor-showcase' && (() => {
          const portfolio = (vendorPortfolios || []).find(p => p.artisanId === selectedPortfolioArtisanId) || (vendorPortfolios || [])[0];
          const items = (showcaseItems || []).filter(item => item.artisanId === portfolio?.artisanId);
          const activeUid = currentUser?.id || getVisitorId();
          const isPortfolioLiked = likedPortfolioIds.includes(portfolio?.artisanId) || Boolean(portfolio?.likedBy?.includes(activeUid));

          return (
            <VendorShowcaseView
              portfolio={portfolio}
              items={items}
              currentUser={currentUser}
              onBackToBazaar={() => {
                setCurrentView('bazaar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBack={() => {
                setCurrentView('bazaar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectItem={(item) => setSelectedShowcaseItem(item)}
              onLikePortfolio={handleLikePortfolio}
              onLikeItem={handleLikeShowcaseItem}
              likedItemIds={likedShowcaseItemIds}
              isPortfolioLiked={isPortfolioLiked}
              onRequestSimilar={handleRequestSimilar}
              onRequestCustomOrder={(_artisanId, _artisanName) => {
                if (items.length > 0) {
                  handleRequestSimilar(items[0]);
                }
              }}
              isOwner={currentUser?.role === 'artisan' && (currentUser.id === portfolio?.artisanId || currentUser.email === portfolio?.artisanId)}
              onManageShowcase={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenManager={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          );
        })()}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          orders={orders}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onNavigateToDashboard={() => {
            setIsProfileModalOpen(false);
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateToOrders={() => {
            setIsProfileModalOpen(false);
            setCurrentView('checkout');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onTrackOrder={(orderNumber) => {
            setIsProfileModalOpen(false);
            setCurrentView('tracking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Custom Order Request Modal */}
      {isCustomOrderOpen && customOrderArtisan && (
        <CustomOrderModal
          isOpen={isCustomOrderOpen}
          onClose={() => setIsCustomOrderOpen(false)}
          artisan={customOrderArtisan}
          product={customOrderProduct}
          currentUser={currentUser}
          onSubmitCustomOrder={handleSubmitCustomOrder}
        />
      )}

      {/* Showcase Detail Modal */}
      {selectedShowcaseItem && (
        <ShowcaseDetailModal
          item={selectedShowcaseItem}
          onClose={() => setSelectedShowcaseItem(null)}
          onLike={handleLikeShowcaseItem}
          onRequestSimilar={handleRequestSimilar}
          onViewPortfolio={(artisanId) => {
            setSelectedShowcaseItem(null);
            handleViewShowcase(artisanId);
          }}
          isLiked={likedShowcaseItemIds.includes(selectedShowcaseItem.id) || Boolean(selectedShowcaseItem.likedBy?.includes(currentUser?.id || getVisitorId()))}
        />
      )}

      {/* Footer */}
      <Footer
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateDashboard={() => {
          if (!currentUser) {
            handleOpenAuth('login');
          } else if (currentUser.role !== 'artisan') {
            setIsProfileModalOpen(true);
          } else {
            setCurrentView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onSelectCategory={handleSelectCategory}
        onNavigateCatalog={() => {
          setCurrentView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateBazaar={() => {
          setCurrentView('bazaar');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateTracking={() => {
          setCurrentView('tracking');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSupport={() => {
          setCurrentView('support');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateLegal={() => {
          setCurrentView('legal');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Cart Button for Mobile (تحت على الشمال) */}
      {currentView !== 'checkout' && (
        <button
          type="button"
          onClick={() => {
            setCurrentView('checkout');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-5 left-5 z-40 sm:hidden flex items-center justify-center gap-2 p-3.5 rounded-full bg-[#254D3F] hover:bg-[#1A372D] text-white shadow-2xl shadow-[#254D3F]/40 border-2 border-white/40 active:scale-95 transition-all cursor-pointer group"
          aria-label="سلة المشتريات"
          title="عرض سلة المشتريات وإتمام الطلب"
        >
          <div className="relative flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            {cartItems.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
              <span className="absolute -top-2.5 -right-2.5 min-w-5 h-5 px-1 rounded-full bg-[#C97A57] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          {cartItems.length > 0 && (
            <span className="text-xs font-bold font-mono pl-1 text-[#FAF8F5]">
              {cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString('ar-EG')} ج.م
            </span>
          )}
        </button>
      )}
    </div>
  );
}

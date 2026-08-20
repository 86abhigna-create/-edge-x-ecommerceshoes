import React, { useState } from 'react';
import { ActiveTab, CartItem, Order, Product, Review, WishlistItem, NotificationItem, Address } from './types';
import { CATEGORIES, PRODUCTS as INITIAL_PRODUCTS } from './data/products';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { MenuDrawer } from './components/MenuDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerDashboardView } from './components/CustomerDashboardView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import { AuthView } from './components/AuthView';
import { useAuth } from './context/AuthContext';
import { useAddToCart, useUpdateCartItem, useRemoveFromCart, useAddToWishlist, useRemoveFromWishlist, useCreateOrder, useCreateReview } from './hooks/useApi';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply dark mode class immediately on mount
  React.useLayoutEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('shop');
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroImages = [
    {
      src: "https://res.cloudinary.com/gemhzrqu/image/upload/v1786807223/1_2.svg",
      subtitle: "Official Brand Drop",
      title: "EDGEX",
      desc: "The pinnacle of futuristic streetwear & precision engineered footwear."
    },
    {
      src: "/src/assets/images/hero_lifestyle_1_1786357659311.jpg",
      subtitle: "Fall/Winter 2026 Collection",
      title: "Step Into\nThe Edge",
      desc: "Discover high-end architectural aesthetics and raw daily functionality."
    },
    {
      src: "/src/assets/images/hero_lifestyle_3_1786211129161.jpg",
      subtitle: "Essential Utility",
      title: "Urban\nCamouflage",
      desc: "Sleek aesthetics with cinematic lighting and ultra-sharp focus."
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All Shoes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Recommended');
  
  // Filter state
  const [filterPrice, setFilterPrice] = useState<string>('all');
  const [filterSize, setFilterSize] = useState<string>('all');
  const [filterColor, setFilterColor] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [filterDiscount, setFilterDiscount] = useState<boolean>(false);
  const [filterNewArrivals, setFilterNewArrivals] = useState<boolean>(false);
  const [filterBestSellers, setFilterBestSellers] = useState<boolean>(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<boolean>(false);

  const activeFilterCount =
    (filterPrice !== 'all' ? 1 : 0) +
    (filterSize !== 'all' ? 1 : 0) +
    (filterColor !== 'all' ? 1 : 0) +
    (filterCategory !== 'all' ? 1 : 0) +
    (filterRating !== 'all' ? 1 : 0) +
    (filterAvailability !== 'all' ? 1 : 0) +
    (filterDiscount ? 1 : 0) +
    (filterNewArrivals ? 1 : 0) +
    (filterBestSellers ? 1 : 0);

  const resetFilters = () => {
    setFilterPrice('all');
    setFilterSize('all');
    setFilterColor('all');
    setFilterCategory('all');
    setFilterRating('all');
    setFilterAvailability('all');
    setFilterDiscount(false);
    setFilterNewArrivals(false);
    setFilterBestSellers(false);
  };
  
  // Authentication & Authorization state
  const [userRole, setUserRole] = useState<'customer' | 'owner' | 'guest'>('guest');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [ownerPinInput, setOwnerPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  
  // Address state - lifted to App level
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
      user_id: 'user-1',
      type: 'shipping',
      fullName: 'Alex Vance',
      phone: '',
      street: '742 Evergreen Terrace',
      apartment: '',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]);
  
  // API hooks for Supabase persistence
  const { user } = useAuth();
  const addToCartMutation = useAddToCart();
  const updateCartMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  const createOrderMutation = useCreateOrder();
  const createReviewMutation = useCreateReview();
  
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      orderId: 'EX-98214',
      date: 'Aug 6, 2026',
      items: [
        {
          cartItemId: 'item-1',
          product: INITIAL_PRODUCTS[0],
          selectedSize: 'US 10',
          selectedColor: INITIAL_PRODUCTS[0].colorway,
          quantity: 1,
        }
      ],
      itemSnapshots: [
        {
          productId: INITIAL_PRODUCTS[0].id,
          productName: INITIAL_PRODUCTS[0].name,
          image: INITIAL_PRODUCTS[0].image,
          price: INITIAL_PRODUCTS[0].price,
          selectedSize: 'US 10',
          selectedColor: INITIAL_PRODUCTS[0].colorway,
          quantity: 1,
        }
      ],
      total: 240,
      status: 'Delivered',
      paymentMethod: 'Credit Card (•••• 4242)',
      shippingAddress: {
        fullName: 'Alex Vance',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
      },
      refundStatus: 'None',
    },
    {
      orderId: 'EX-48912',
      date: 'Aug 8, 2026',
      items: [
        {
          cartItemId: 'item-2',
          product: INITIAL_PRODUCTS[1],
          selectedSize: 'US 9.5',
          selectedColor: INITIAL_PRODUCTS[1].colorway,
          quantity: 1,
        }
      ],
      itemSnapshots: [
        {
          productId: INITIAL_PRODUCTS[1].id,
          productName: INITIAL_PRODUCTS[1].name,
          image: INITIAL_PRODUCTS[1].image,
          price: INITIAL_PRODUCTS[1].price,
          selectedSize: 'US 9.5',
          selectedColor: INITIAL_PRODUCTS[1].colorway,
          quantity: 1,
        }
      ],
      total: 195,
      status: 'Processing',
      paymentMethod: 'UPI (GPAY - alex.vance@okaxis)',
      shippingAddress: {
        fullName: 'Alex Vance',
        street: '742 Evergreen Terrace',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
      },
      refundStatus: 'None',
    }
  ]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    {
      id: 'wish-1',
      product: INITIAL_PRODUCTS[1],
      dateAdded: 'Aug 5, 2026',
    }
  ]);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      productId: INITIAL_PRODUCTS[0].id,
      productName: INITIAL_PRODUCTS[0].name,
      userName: 'Alex Vance',
      rating: 5,
      comment: 'Incredible streetwear silhouette. The Italian calfskin and technical mesh hold up extremely well.',
      date: 'Aug 7, 2026',
    }
  ]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Order Delivered Successfully',
      message: 'Your order EX-98214 was delivered to 742 Evergreen Terrace.',
      date: 'Aug 7, 2026',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Limited Drop Early Access',
      message: 'Black Circle Tier unlocked for upcoming Concrete Edit drops.',
      date: 'Aug 4, 2026',
      read: true,
    },
  ]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Product CRUD handlers for Owner Dashboard
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) => prev.map((o) => (o.orderId === orderId ? { ...o, status } : o)));
  };

  const handleRequestReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              returnRequested: true,
              returnReason: reason,
              status: 'Return Requested',
              refundStatus: 'Refund Initiated (₹' + o.total.toLocaleString('en-IN') + ')',
            }
          : o
      )
    );
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: 'Return Request Received',
        message: `Order ${orderId} return request logged. Pickup scheduled & refund initiated.`,
        date: new Date().toLocaleDateString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const handleAddToCart = (product: Product, size: string, quantity: number, color?: string) => {
    const chosenColor = color || product.colorway;
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          (item.selectedColor === chosenColor || (!item.selectedColor && chosenColor === product.colorway))
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId: `${product.id}-${size}-${chosenColor}-${Date.now()}`,
            product,
            selectedSize: size,
            selectedColor: chosenColor,
            quantity,
          },
        ];
      }
    });
    
    // Persist to Supabase
    if (user) {
      addToCartMutation.mutate({
        product_id: product.id,
        variant_id: product.id, // Using product id as variant for simplicity
        quantity,
        selected_size: size,
        selected_color: chosenColor,
      });
    }
  };

  const handleAddToWishlist = (product: Product) => {
    if (wishlist.some((w) => w.product.id === product.id)) return;
    setWishlist((prev) => [
      {
        id: 'wish-' + Date.now(),
        product,
        dateAdded: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);
    
    // Persist to Supabase
    if (user) {
      addToWishlistMutation.mutate(product.id);
    }
  };

  const handleRemoveWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((w) => w.id !== id));
    
    // Persist to Supabase
    if (user) {
      removeFromWishlistMutation.mutate(id);
    }
  };

  const handleAddReview = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    
    // Persist to Supabase
    if (user) {
      createReviewMutation.mutate({
        product_id: newReview.productId,
        order_id: newReview.id, // Using review id as order reference for now
        rating: newReview.rating,
        title: newReview.productName,
        comment: newReview.comment,
      });
    }
  };

  const handleModerateReview = (reviewId: string, status: Review['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
    );
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
    
    // Persist to Supabase
    if (user) {
      updateCartMutation.mutate({ id: cartItemId, quantity: delta > 0 ? 1 : -1 });
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    
    // Persist to Supabase
    if (user) {
      removeFromCartMutation.mutate(cartItemId);
    }
  };

  const handleOrderSuccess = (newOrder: Order) => {
    // 1. Decrement inventory at product + size + color variant level
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const boughtItems = newOrder.items.filter((item) => item.product.id === p.id);
        if (boughtItems.length === 0) return p;

        let updatedVariants = p.variants ? [...p.variants] : [];
        let totalDeduction = 0;

        boughtItems.forEach((item) => {
          const qty = item.quantity;
          totalDeduction += qty;
          const chosenColor = item.selectedColor || p.colorway;

          if (updatedVariants.length > 0) {
            updatedVariants = updatedVariants.map((v) => {
              if (
                v.size === item.selectedSize &&
                v.color.toLowerCase() === chosenColor.toLowerCase()
              ) {
                return { ...v, stock: Math.max(0, v.stock - qty) };
              }
              return v;
            });
          }
        });

        const newStockCount = Math.max(0, (p.stockCount || 10) - totalDeduction);
        const finalVariantsStock =
          updatedVariants.length > 0
            ? updatedVariants.reduce((sum, v) => sum + v.stock, 0)
            : newStockCount;

        return {
          ...p,
          variants: updatedVariants,
          stockCount: finalVariantsStock,
          inStock: finalVariantsStock > 0,
        };
      });
    });

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: 'Order Placed & Inventory Reserved',
        message: `Order ${newOrder.orderId} confirmed. Variant inventory matrix updated.`,
        date: new Date().toLocaleDateString(),
        read: false,
      },
      ...prev,
    ]);
    
    // Persist to Supabase
    if (user) {
      // Clear cart on server
      cartItems.forEach(item => {
        removeFromCartMutation.mutate(item.cartItemId);
      });
      
      // Create order
      const shippingAddress = newOrder.shippingAddress;
      createOrderMutation.mutate({
        shipping_address: {
          full_name: shippingAddress.fullName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        },
        billing_address: {
          full_name: shippingAddress.fullName,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        },
        payment_method: newOrder.paymentMethod,
        notes: '',
      });
    }
  };

  // Filter products for customer view (only published products)
  const filteredProducts = products.filter((p) => {
    if (p.published === false) return false;

    let matchesCategory = true;
    if (selectedCategory === 'New Arrivals') {
      matchesCategory = p.badge === 'New';
    } else if (selectedCategory === 'Streetwear') {
      matchesCategory = p.category === 'Streetwear' || p.category === 'High-Top' || p.category.includes('Streetwear');
    } else if (selectedCategory === 'Best Sellers') {
      matchesCategory = p.badge === 'Limited' || p.price > 200;
    } else if (selectedCategory === 'Sale') {
      matchesCategory = p.price < 230 || p.badge === 'Sale' || Boolean(p.discountPercent);
    } else if (selectedCategory !== 'All Shoes') {
      matchesCategory = p.category.toLowerCase() === selectedCategory.toLowerCase();
    }
    
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.colorway.toLowerCase().includes(searchQuery.toLowerCase());

    // Price Filter
    let matchesPrice = true;
    if (filterPrice === 'under10000') matchesPrice = p.price < 10000;
    else if (filterPrice === '10000-15000') matchesPrice = p.price >= 10000 && p.price <= 15000;
    else if (filterPrice === 'over15000') matchesPrice = p.price > 15000;

    // Size Filter
    let matchesSize = true;
    if (filterSize !== 'all') matchesSize = p.sizes ? p.sizes.includes(filterSize) : true;

    // Color Filter
    let matchesColor = true;
    if (filterColor !== 'all') matchesColor = p.colorway.toLowerCase().includes(filterColor.toLowerCase());

    // Sub-Category Filter
    let matchesSubCategory = true;
    if (filterCategory !== 'all') matchesSubCategory = p.category.toLowerCase().includes(filterCategory.toLowerCase());

    // Rating Filter
    let matchesRating = true;
    if (filterRating === '4plus') matchesRating = true;

    // Availability Filter
    let matchesAvailability = true;
    if (filterAvailability === 'inStock') matchesAvailability = p.inStock;

    // Discount Filter
    let matchesDiscount = true;
    if (filterDiscount) matchesDiscount = p.price < 230 || p.badge === 'Sale';

    // New Arrivals Filter
    let matchesNew = true;
    if (filterNewArrivals) matchesNew = p.badge === 'New';

    // Best Sellers Filter
    let matchesBest = true;
    if (filterBestSellers) matchesBest = p.badge === 'Limited' || p.price >= 200;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesSize &&
      matchesColor &&
      matchesSubCategory &&
      matchesRating &&
      matchesAvailability &&
      matchesDiscount &&
      matchesNew &&
      matchesBest
    );
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price low to high') {
      return a.price - b.price;
    }
    if (sortBy === 'Price high to low') {
      return b.price - a.price;
    }
    if (sortBy === 'Newest') {
      return (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0);
    }
    if (sortBy === 'Highest rated') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'Most popular') {
      return (b.badge === 'Limited' ? 1 : 0) - (a.badge === 'Limited' ? 1 : 0);
    }
    if (sortBy === 'Biggest discount') {
      return a.price - b.price;
    }
    return 0;
  });

  const handleLogout = () => {
  setUserRole('guest');
  setActiveTab('shop');
};

  if (userRole === 'guest') {
  return (
    <AuthView 
      onLogin={(role) => {
        setUserRole(role);
        setActiveTab('shop');
      }} 
    />
  );
}
  return (
    <div className="dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 min-h-screen flex flex-col font-['Inter',sans-serif] pt-16 pb-20 md:pb-0">
      {/* Top App Bar */}
      <Header
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        userRole={userRole}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col w-full max-w-[1440px] mx-auto">
        {activeTab === 'shop' && (
          <>
            {/* Hero Section */}
            <section className="relative w-full aspect-[4/5] md:aspect-[21/9] dark:bg-[#0D0D0D] bg-black flex flex-col justify-end p-6 md:p-12 mb-8 md:mb-16 overflow-hidden rounded-none md:rounded-3xl shadow-sm mx-0 md:mx-4 mt-0 md:mt-4 group">
              {heroImages.map((hero, idx) => (
                <div 
                  key={idx}
                  className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${idx === activeHeroIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={{ opacity: idx === activeHeroIndex ? 1 : 0, visibility: idx === activeHeroIndex ? 'visible' : 'hidden' }}
                >
                  <img
                    className="w-full h-full object-cover opacity-100 brightness-115 saturate-110 contrast-105 object-center transition-transform duration-[10000ms] scale-100 group-hover:scale-105"
                    alt={hero.title}
                    src={hero.src}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero_custom.png';
                    }}
                  />
                  {/* Subtle dark gradient only at bottom for button readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                </div>
              ))}

              <div className="relative z-10 w-full flex flex-col gap-4 items-start max-w-2xl">
                <div className="transition-all duration-700 ease-out transform translate-y-0 opacity-100" key={activeHeroIndex}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block py-1 px-3 bg-[#D10000] text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xs">
                      {heroImages[activeHeroIndex].subtitle}
                    </span>
                    <span className="inline-block py-1 px-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10">
                      0{activeHeroIndex + 1} / 0{heroImages.length}
                    </span>
                  </div>
                  {heroImages[activeHeroIndex].title && (
                    <h2 className="text-[42px] md:text-[64px] leading-[0.95] tracking-[-0.03em] font-['Bebas_Neue',sans-serif] text-white tracking-normal uppercase whitespace-pre-line drop-shadow-md">
                      {heroImages[activeHeroIndex].title}
                    </h2>
                  )}
                </div>
                <div className="flex gap-4 mt-1">
                  <button 
                    onClick={() => {
                      document.getElementById('featured-drops')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#D10000] text-white px-7 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#a80000] active:scale-95 transition-all shadow-lg rounded-full flex items-center gap-2"
                  >
                    <span>Shop Collection</span>
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                </div>
              </div>
              
              {/* Sleek Carousel Navigation & Indicators */}
              <div className="absolute bottom-6 right-6 z-20 flex gap-3 items-center bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15 shadow-xl">
                <button
                  onClick={() => setActiveHeroIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  aria-label="Previous Slide"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>

                <div className="flex gap-1.5 items-center px-1">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHeroIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === activeHeroIndex ? 'w-6 bg-[#D10000]' : 'w-2 bg-white/40 hover:bg-white/80'}`}
                      aria-label={`Go to slide ${idx + 1}`}
                      type="button"
                    />
                  ))}
                </div>

                <button
                  onClick={() => setActiveHeroIndex((prev) => (prev + 1) % heroImages.length)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  aria-label="Next Slide"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </section>

            {/* Marquee */}
            <div className="w-full bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-2 overflow-hidden mb-8 md:mb-16 whitespace-nowrap flex items-center">
              <div className="animate-marquee inline-block font-extrabold uppercase tracking-widest text-[10px] md:text-xs">
                <span className="mx-4">LIMITED DROP 04 LIVE NOW</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">FREE EXPRESS SHIPPING WORLDWIDE ON ORDERS OVER ₹2000</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">MEMBER EXCLUSIVE: EXTRA 15% OFF AT CHECKOUT</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">LIMITED DROP 04 LIVE NOW</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">FREE EXPRESS SHIPPING WORLDWIDE ON ORDERS OVER ₹2000</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">MEMBER EXCLUSIVE: EXTRA 15% OFF AT CHECKOUT</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">LIMITED DROP 04 LIVE NOW</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">FREE EXPRESS SHIPPING WORLDWIDE ON ORDERS OVER ₹2000</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">MEMBER EXCLUSIVE: EXTRA 15% OFF AT CHECKOUT</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">LIMITED DROP 04 LIVE NOW</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">FREE EXPRESS SHIPPING WORLDWIDE ON ORDERS OVER ₹2000</span>
                <span className="mx-4 dark:text-[#767680] text-gray-600">•</span>
                <span className="mx-4">MEMBER EXCLUSIVE: EXTRA 15% OFF AT CHECKOUT</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div id="featured-drops" className="w-full px-5 md:px-16 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                {['All Shoes', 'New Arrivals', 'Streetwear', 'Best Sellers', 'Sale'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 text-xs font-bold uppercase tracking-wider shrink-0 transition-all border rounded-full ${
                      selectedCategory === cat
                        ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                        : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                {/* Sorting & Filter options beside Sale */}
                <div className="flex items-center gap-2 ml-2 border-l dark:border-[#262626] border-gray-200 pl-3 shrink-0 relative">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase dark:text-[#767680] text-gray-600 whitespace-nowrap">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-wider px-3.5 py-2 border dark:border-[#262626] border-gray-200 rounded-full focus:border-[#D10000] outline-none cursor-pointer shadow-xs"
                    >
                      <option value="Recommended">Recommended</option>
                      <option value="Newest">Newest</option>
                      <option value="Price low to high">Price: Low to High</option>
                      <option value="Price high to low">Price: High to Low</option>
                      <option value="Highest rated">Highest Rated</option>
                      <option value="Most popular">Most Popular</option>
                      <option value="Biggest discount">Biggest Discount</option>
                    </select>
                  </div>

                  {/* Filters Button beside Sort */}
                  <div>
                    <button
                      onClick={() => setIsFilterMenuOpen(true)}
                      className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3.5 py-2 border rounded-full transition-all shadow-xs cursor-pointer ${
                        activeFilterCount > 0
                          ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                          : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">tune</span>
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-amber-400 dark:text-[#F2F2F2] text-gray-900 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center ml-0.5">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Silhouettes Input */}
              <div className="w-full md:w-80 mt-10 md:mt-16">
                <input
                  type="text"
                  placeholder="Search silhouettes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 text-xs dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 focus:border-[#D10000] outline-none rounded-full shadow-xs"
                />
              </div>
            </div>

            {/* Filter Modal Dialog (Fixed Z-Index Overlay) */}
            {isFilterMenuOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-[#F2F2F2] bg-black/50 p-4 backdrop-blur-xs">
                <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg p-6 text-left text-xs dark:text-[#F2F2F2] text-gray-900 relative animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200 mb-4">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 text-sm">
                      <span className="material-symbols-outlined text-lg">tune</span>
                      <span>Product Catalog Filters</span>
                    </div>
                    <button
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="p-1 rounded-full dark:text-[#767680] text-gray-600 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                    {/* 1. Price Filter */}
                    <div className="dark:bg-[#0D0D0D] bg-white p-3 rounded-xl border dark:border-[#262626] border-gray-200">
                      <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-1.5">1. Price Range</label>
                      <select
                        value={filterPrice}
                        onChange={(e) => setFilterPrice(e.target.value)}
                        className="w-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#D10000]"
                      >
                        <option value="all">All Prices</option>
                        <option value="under10000">Under ₹10,000</option>
                        <option value="10000-15000">₹10,000 - ₹15,000</option>
                        <option value="over15000">Over ₹15,000</option>
                      </select>
                    </div>

                    {/* 2. Size Filter */}
                    <div className="dark:bg-[#0D0D0D] bg-white p-3 rounded-xl border dark:border-[#262626] border-gray-200">
                      <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-1.5">2. Shoe Size</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['all', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 12'].map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setFilterSize(sz)}
                            className={`px-3 py-1.5 text-[11px] rounded-lg font-bold transition-all border ${
                              filterSize === sz
                                ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                                : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                            }`}
                          >
                            {sz === 'all' ? 'All Sizes' : sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Color Filter */}
                    <div className="dark:bg-[#0D0D0D] bg-white p-3 rounded-xl border dark:border-[#262626] border-gray-200">
                      <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-1.5">3. Color</label>
                      <select
                        value={filterColor}
                        onChange={(e) => setFilterColor(e.target.value)}
                        className="w-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#D10000]"
                      >
                        <option value="all">All Colors</option>
                        <option value="white">White</option>
                        <option value="black">Black</option>
                        <option value="grey">Grey</option>
                        <option value="tan">Tan / Sand</option>
                        <option value="blue">Blue</option>
                      </select>
                    </div>

                    {/* 4. Category Filter */}
                    <div className="dark:bg-[#0D0D0D] bg-white p-3 rounded-xl border dark:border-[#262626] border-gray-200">
                      <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-1.5">4. Category</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#D10000]"
                      >
                        <option value="all">All Categories</option>
                        <option value="sneakers">Sneakers</option>
                        <option value="streetwear">Streetwear Sneakers</option>
                        <option value="high-top">High-Top Shoes</option>
                        <option value="low-top">Low-Top Shoes</option>
                        <option value="casual">Casual Shoes</option>
                        <option value="sports">Sports-Inspired Shoes</option>
                        <option value="limited">Limited-Edition Shoes</option>
                      </select>
                    </div>

                    {/* 5. Rating Filter */}
                    <div className="dark:bg-[#0D0D0D] bg-white p-3 rounded-xl border dark:border-[#262626] border-gray-200">
                      <label className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-1.5">5. Rating</label>
                      <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="w-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-[#D10000]"
                      >
                        <option value="all">All Ratings</option>
                        <option value="4plus">★ 4.0 & above</option>
                      </select>
                    </div>

                    {/* Quick Toggles: 6. Availability, 7. Discount, 8. New Arrivals, 9. Best Sellers */}
                    <div className="dark:bg-[#0D0D0D] bg-white p-3.5 rounded-xl border dark:border-[#262626] border-gray-200 space-y-2.5">
                      <span className="block text-[11px] font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-1">Status & Line Highlights</span>
                      
                      {/* 6. Availability */}
                      <label className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-[#262626] border-gray-200">
                        <span className="font-semibold text-xs dark:text-[#F2F2F2] text-gray-900">6. Availability (In Stock Only)</span>
                        <input
                          type="checkbox"
                          checked={filterAvailability === 'inStock'}
                          onChange={(e) => setFilterAvailability(e.target.checked ? 'inStock' : 'all')}
                          className="w-4 h-4 accent-[#000f3f] cursor-pointer"
                        />
                      </label>

                      {/* 7. Discount */}
                      <label className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-[#262626] border-gray-200">
                        <span className="font-semibold text-xs dark:text-[#F2F2F2] text-gray-900">7. Discount / On Sale</span>
                        <input
                          type="checkbox"
                          checked={filterDiscount}
                          onChange={(e) => setFilterDiscount(e.target.checked)}
                          className="w-4 h-4 accent-[#000f3f] cursor-pointer"
                        />
                      </label>

                      {/* 8. New Arrivals */}
                      <label className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-[#262626] border-gray-200">
                        <span className="font-semibold text-xs dark:text-[#F2F2F2] text-gray-900">8. New Arrivals</span>
                        <input
                          type="checkbox"
                          checked={filterNewArrivals}
                          onChange={(e) => setFilterNewArrivals(e.target.checked)}
                          className="w-4 h-4 accent-[#000f3f] cursor-pointer"
                        />
                      </label>

                      {/* 9. Best Sellers */}
                      <label className="flex items-center justify-between cursor-pointer py-1">
                        <span className="font-semibold text-xs dark:text-[#F2F2F2] text-gray-900">9. Best Sellers</span>
                        <input
                          type="checkbox"
                          checked={filterBestSellers}
                          onChange={(e) => setFilterBestSellers(e.target.checked)}
                          className="w-4 h-4 accent-[#000f3f] cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t dark:border-[#262626] border-gray-200 flex justify-between items-center">
                    <button
                      onClick={resetFilters}
                      className="text-xs font-bold text-red-600 hover:underline px-2 py-1"
                    >
                      Reset All Filters
                    </button>
                    <button
                      onClick={() => setIsFilterMenuOpen(false)}
                      className="px-6 py-2.5 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 font-bold text-xs rounded-full uppercase tracking-wider hover:bg-[#D10000] transition-colors shadow-sm"
                    >
                      Apply & Close ({sortedProducts.length} Results)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Shoes Grid */}
            <section className="w-full px-5 md:px-16 mb-16">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-[36px] md:text-[48px] font-['Bebas_Neue',sans-serif] dark:text-[#F2F2F2] text-gray-900 tracking-normal">
                  {selectedCategory === 'All Shoes' ? 'Featured Drops' : selectedCategory}
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest dark:text-[#767680] text-gray-600">
                  {sortedProducts.length} Silhouettes
                </span>
              </div>

              {sortedProducts.length === 0 ? (
                <div className="text-center py-16 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200">
                  <p className="text-lg font-bold dark:text-[#F2F2F2] text-gray-900">No silhouettes match your query</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All Shoes');
                      setSearchQuery('');
                      setSortBy('Recommended');
                    }}
                    className="mt-4 text-xs font-bold uppercase tracking-widest text-[#D10000] underline"
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] dark:bg-[#262626] bg-gray-200 overflow-hidden border dark:border-[#262626] border-gray-200">
                  {sortedProducts.map((shoe) => (
                    <div
                      key={shoe.id}
                      onClick={() => setSelectedProduct(shoe)}
                      className="dark:bg-[#0D0D0D] bg-white flex flex-col justify-between p-4 relative group cursor-pointer hover:dark:bg-[#0D0D0D] bg-white transition-colors"
                    >
                      <div>
                        <div className="aspect-square w-full dark:bg-white bg-gray-50 mb-3 flex items-center justify-center p-2 relative overflow-hidden rounded-lg border dark:border-gray-200 border-gray-200">
                          <img
                            src={shoe.image}
                            alt={shoe.altText}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                          />
                          {shoe.badge && (
                            <span className="absolute top-2 left-2 bg-[#D10000] text-white text-[9px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-md shadow-xs z-10">
                              {shoe.badge}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(shoe);
                              }}
                              className="bg-[#0D0D0D] text-white font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              Quick View
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] dark:text-[#868686] text-gray-500 uppercase tracking-widest font-bold">
                            {shoe.category}
                          </p>
                          <h4 className="text-base font-bold dark:text-[#F2F2F2] text-gray-900 leading-tight">{shoe.name}</h4>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t dark:border-[#262626] border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold dark:text-[#F2F2F2] text-gray-900">₹{shoe.price.toLocaleString('en-IN')}</span>
                            {shoe.discountPercent ? (
                              <span className="text-[9px] font-black text-red-600 bg-[#5c0000] border border-[#D10000] px-1 py-0.2 rounded">
                                -{shoe.discountPercent}%
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] dark:text-[#767680] text-gray-600 font-semibold">Size {shoe.sizes?.[0] || 'US 9'}</span>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(shoe, shoe.sizes?.[0] || 'US 9', 1, shoe.colorway);
                              setIsCartOpen(true);
                            }}
                            className="w-full bg-[#D10000] hover:bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs"
                            title="Add silhouette directly to your shopping bag"
                          >
                            <span className="material-symbols-outlined text-xs">shopping_bag</span>
                            <span>Add to Bag</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(shoe, shoe.sizes?.[0] || 'US 9', 1, shoe.colorway);
                              setIsCheckoutOpen(true);
                            }}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 dark:text-[#F2F2F2] text-gray-900 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 shadow-xs"
                            title="Buy now and proceed directly to instant checkout"
                          >
                            <span className="material-symbols-outlined text-xs">bolt</span>
                            <span>Buy Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Features / Benefits Section */}
            <section className="mt-20 border-t dark:border-[#262626] border-gray-200 pt-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  {
                    icon: 'local_shipping',
                    title: 'Free Global Shipping',
                    desc: 'On all orders over ₹2000. Tracked and insured.'
                  },
                  {
                    icon: 'verified',
                    title: 'Authenticity Guaranteed',
                    desc: 'Every silhouette is verified and authenticated before shipping.'
                  },
                  {
                    icon: 'recycling',
                    title: 'Sustainable Materials',
                    desc: 'Crafted with premium recycled materials and ethical labor.'
                  },
                  {
                    icon: 'support_agent',
                    title: '24/7 Client Services',
                    desc: 'Dedicated support via live chat, email, and phone.'
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center p-6 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black transition-colors group">
                    <span className="material-symbols-outlined text-4xl dark:text-[#F2F2F2] text-gray-900 mb-4 group-hover:scale-110 transition-transform">{feature.icon}</span>
                    <h4 className="font-bold dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider text-[11px] mb-2">{feature.title}</h4>
                    <p className="text-xs dark:text-[#767680] text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Customer Reviews Section */}
            <section className="mt-20 border-t dark:border-[#262626] border-gray-200 pt-12">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-[36px] md:text-[48px] font-['Bebas_Neue',sans-serif] dark:text-[#F2F2F2] text-gray-900 tracking-normal">
                  What Our Community Says
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Michael T.',
                    location: 'New York, US',
                    rating: 5,
                    product: 'Aero Street Runner',
                    comment: 'The silhouette is unbelievable. Perfectly bridges the gap between high fashion and everyday comfort. Have worn these every day since they arrived.',
                    date: 'August 1, 2026'
                  },
                  {
                    name: 'Sarah K.',
                    location: 'London, UK',
                    rating: 5,
                    product: 'Obsidian Prime',
                    comment: 'Incredible attention to detail. The materials feel premium and the construction is solid. Shipping to the UK was surprisingly fast.',
                    date: 'July 28, 2026'
                  },
                  {
                    name: 'David L.',
                    location: 'Los Angeles, US',
                    rating: 4,
                    product: 'Metro Glide',
                    comment: 'Love the minimalist design. They fit true to size. Deducting one star only because I wish they came with extra laces.',
                    date: 'July 15, 2026'
                  }
                ].map((review, idx) => (
                  <div key={idx} className="dark:bg-[#0D0D0D] bg-white p-6 border dark:border-[#262626] border-gray-200 flex flex-col gap-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold dark:text-[#F2F2F2] text-gray-900">{review.name}</h4>
                        <p className="text-[10px] uppercase dark:text-[#767680] text-gray-600 font-bold tracking-widest">{review.location}</p>
                      </div>
                      <div className="flex text-[#D10000]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm dark:text-[#868686] text-gray-500 italic leading-relaxed">"{review.comment}"</p>
                    <div className="mt-auto pt-4 border-t dark:border-[#262626] border-gray-200">
                      <p className="text-xs font-bold dark:text-[#F2F2F2] text-gray-900">On: {review.product}</p>
                      <p className="text-[10px] dark:text-[#767680] text-gray-600">{review.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Our Story Section */}
            <section className="mt-20 border-t dark:border-[#262626] border-gray-200 pt-12 pb-8">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h3 className="text-[36px] md:text-[48px] font-['Bebas_Neue',sans-serif] dark:text-[#F2F2F2] text-gray-900 tracking-normal">
                  Our Story
                </h3>
                <div className="w-16 h-1 bg-[#D10000] mx-auto"></div>
                <div className="text-base dark:text-[#868686] text-gray-500 leading-relaxed space-y-4">
                  <p>
                    Born from the concrete streets and inspired by the relentless pace of urban life, 
                    <strong> EDGEX</strong> was established in 2024 with a singular vision: 
                    to engineer footwear that refuses to compromise between high-end architectural aesthetics and raw, daily functionality.
                  </p>
                  <p>
                    Every silhouette we design is a testament to meticulous craftsmanship. We source 
                    premium materials globally—from weather-resistant synthetics to artisanal full-grain 
                    leathers—and combine them with cutting-edge ergonomic cushioning systems. We believe 
                    that a shoe is not just an accessory; it is the foundation of your journey.
                  </p>
                  <p>
                    Our limited-batch production model ensures that every pair meets our rigorous standards of quality. 
                    Whether you are navigating the morning commute, exploring weekend galleries, or 
                    making a statement after hours, EDGEX is designed to move with you—effortlessly, comfortably, and boldly.
                  </p>
                </div>
                <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 text-sm uppercase tracking-widest pt-4">
                  Step Into The Future.
                </p>
              </div>
            </section>

            {/* Newsletter Section */}
            <section className="mt-20 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-16 px-5 md:px-16 text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <span className="material-symbols-outlined text-4xl mb-2">mail</span>
                <h3 className="text-[48px] md:text-[64px] font-['Bebas_Neue',sans-serif] uppercase tracking-normal leading-none">
                  Join the Inner Circle
                </h3>
                <p className="text-[#a0a0ab] font-medium max-w-md mx-auto">
                  Subscribe to receive early access to limited drops, exclusive editorial content, and member-only pricing.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto pt-4">
                  <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL ADDRESS" 
                    className="flex-grow bg-transparent border border-[#868686] dark:text-[#F2F2F2] text-gray-900 p-4 outline-none focus:border-white placeholder-[#767680] text-xs font-bold tracking-widest uppercase"
                  />
                  <button className="dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 font-bold uppercase tracking-widest text-xs px-8 py-4 hover:bg-[#e5e5e0] transition-colors shrink-0">
                    Subscribe
                  </button>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="dark:bg-[#0D0D0D] bg-white border-t dark:border-[#262626] border-gray-200 pt-16 pb-24 md:pb-8 px-5 md:px-16 text-sm dark:text-[#868686] text-gray-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="space-y-4">
                  <h4 className="text-2xl font-['Bebas_Neue',sans-serif] dark:text-[#F2F2F2] text-gray-900 tracking-normal">EDGEX</h4>
                  <p className="text-xs max-w-xs">Engineered for the modern urban landscape. We fuse architectural aesthetics with raw functionality.</p>
                </div>
                <div>
                  <h5 className="font-bold dark:text-[#F2F2F2] text-gray-900 mb-4 uppercase text-xs tracking-widest">Shop</h5>
                  <ul className="space-y-2 text-xs">
                    <li><button onClick={() => { setActiveTab('shop'); setSelectedCategory('New Arrivals'); window.scrollTo(0,0); }} className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">New Arrivals</button></li>
                    <li><button onClick={() => { setActiveTab('shop'); setSelectedCategory('Streetwear Sneakers'); window.scrollTo(0,0); }} className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Streetwear</button></li>
                    <li><button onClick={() => { setActiveTab('shop'); setSelectedCategory('Casual Shoes'); window.scrollTo(0,0); }} className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Casual</button></li>
                    <li><button onClick={() => { setActiveTab('shop'); setSelectedCategory('Sale'); window.scrollTo(0,0); }} className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Sale</button></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold dark:text-[#F2F2F2] text-gray-900 mb-4 uppercase text-xs tracking-widest">Support</h5>
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">FAQ</a></li>
                    <li><a href="#" className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Shipping & Returns</a></li>
                    <li><a href="#" className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Shoe Care Guide</a></li>
                    <li><a href="#" className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Contact Us</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold dark:text-[#F2F2F2] text-gray-900 mb-4 uppercase text-xs tracking-widest">Connect</h5>
                  <div className="flex gap-4">
                    <a href="#" className="w-8 h-8 rounded-full border dark:border-[#262626] border-gray-200 flex items-center justify-center hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black transition-all">
                      <span className="text-xs font-bold">IG</span>
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full border dark:border-[#262626] border-gray-200 flex items-center justify-center hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black transition-all">
                      <span className="text-xs font-bold">TW</span>
                    </a>
                    <a href="#" className="w-8 h-8 rounded-full border dark:border-[#262626] border-gray-200 flex items-center justify-center hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black transition-all">
                      <span className="text-xs font-bold">TK</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t dark:border-[#262626] border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                <p>&copy; 2026 EDGEX FOOTWEAR. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-4">
                  <a href="#" className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Terms of Service</a>
                  <a href="#" className="dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">Privacy Policy</a>
                </div>
              </div>
            </footer>
          </>
        )}

        {activeTab === 'customer-dashboard' && (
          <CustomerDashboardView
            orders={orders}
            wishlist={wishlist}
            reviews={reviews}
            notifications={notifications}
            cartItems={cartItems}
            products={products}
            onRemoveWishlist={handleRemoveWishlist}
            onAddReview={handleAddReview}
            onRequestReturn={handleRequestReturn}
            onShopClick={() => setActiveTab('shop')}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveCartItem={handleRemoveItem}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
            onLogout={handleLogout}
            savedAddresses={savedAddresses}
            setSavedAddresses={setSavedAddresses}
          />
        )}

        {activeTab === 'profile' && (
          <CustomerDashboardView
            orders={orders}
            wishlist={wishlist}
            reviews={reviews}
            notifications={notifications}
            cartItems={cartItems}
            products={products}
            onRemoveWishlist={handleRemoveWishlist}
            onAddReview={handleAddReview}
            onRequestReturn={handleRequestReturn}
            onShopClick={() => setActiveTab('shop')}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveCartItem={handleRemoveItem}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
            onLogout={handleLogout}
            savedAddresses={savedAddresses}
            setSavedAddresses={setSavedAddresses}
          />
        )}

        {activeTab === 'owner-dashboard' && (
          userRole === 'owner' ? (
            <OwnerDashboardView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onSwitchToCustomer={() => setActiveTab('shop')}
              reviews={reviews}
              onModerateReview={handleModerateReview}
              onDeleteReview={handleDeleteReview}
              notifications={notifications}
              onLogout={handleLogout}
            />
          ) : (
            <div className="w-full max-w-xl mx-auto px-5 py-24 text-center">
              <div className="dark:bg-[#0D0D0D] bg-white border-2 border-red-200 p-8 shadow-lg space-y-4">
                <span className="material-symbols-outlined text-5xl text-red-600">lock</span>
                <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Owner Authorization Required</h3>
                <p className="text-xs dark:text-[#868686] text-gray-500">
                  Access denied. A normal customer account cannot access EDGEX Owner functionality, product inventory management, or platform analytics.
                </p>
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-full bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#D10000]"
                  >
                    Switch to Owner Account
                  </button>
                  <button
                    onClick={() => setActiveTab('customer-dashboard')}
                    className="w-full dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 py-3 text-xs font-bold uppercase tracking-widest dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200"
                  >
                    Return to Customer Dashboard
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'cart' && (
          <div className="w-full max-w-3xl mx-auto px-5 py-8 pb-24">
            <h2 className="text-4xl font-['Bebas_Neue',sans-serif] dark:text-[#F2F2F2] text-gray-900 tracking-normal mb-6">SHOPPING BAG</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-16 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200">
                <span className="material-symbols-outlined text-5xl dark:text-[#767680] text-gray-600 mb-4">shopping_bag</span>
                <p className="text-lg font-bold dark:text-[#F2F2F2] text-gray-900 mb-1">Your bag is empty</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="mt-4 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#D10000]"
                >
                  Return to Catalog
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4 p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200">
                    <div className="w-20 h-20 dark:bg-white bg-gray-50 flex items-center justify-center shrink-0 rounded p-1">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">{item.product.name}</h4>
                          <p className="text-xs dark:text-[#767680] text-gray-600">Size: {item.selectedSize}</p>
                        </div>
                        <button onClick={() => handleRemoveItem(item.cartItemId)} className="dark:text-[#767680] text-gray-600 hover:text-[#ba1a1a]">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border dark:border-[#262626] border-gray-200">
                          <button onClick={() => handleUpdateQuantity(item.cartItemId, -1)} className="px-2 py-0.5 text-xs">-</button>
                          <span className="px-3 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.cartItemId, 1)} className="px-2 py-0.5 text-xs">+</button>
                        </div>
                        <span className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-6 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 mt-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs dark:text-[#767680] text-gray-600">Total ({cartCount} items)</p>
                    <p className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">
                      ₹{cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="dark:bg-[#F2F2F2] bg-black dark:text-[#F2F2F2] text-gray-900 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#D10000]"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} cartCount={cartCount} userRole={userRole} onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Authentication / Authorization Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
          <div className="dark:bg-[#0D0D0D] bg-white w-full max-w-md p-8 border dark:border-[#262626] border-gray-200 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">EDGEX Identity & Authorization</h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="dark:text-[#868686] text-gray-500">
                Select your session role. Normal customer permissions grant access to orders, wishlist, reviews, and purchases. Owner role grants secure catalog and order fulfillment management.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setUserRole('customer');
                    setIsAuthModalOpen(false);
                    setActiveTab('customer-dashboard');
                  }}
                  className={`p-4 border text-left flex flex-col gap-1 transition-all rounded-xl ${
                    userRole === 'customer' ? 'border-[#D10000] dark:bg-[#1a1a1a] bg-gray-50 shadow-xs' : 'dark:border-[#262626] border-gray-200'
                  }`}
                >
                  <span className="font-bold dark:text-[#F2F2F2] text-gray-900 text-sm">You</span>
                  <span className="dark:text-[#767680] text-gray-600">Alex Vance (Member)</span>
                </button>

                <button
                  onClick={() => {
                    setUserRole('owner');
                    setIsAuthModalOpen(false);
                    setActiveTab('owner-dashboard');
                  }}
                  className={`p-4 border text-left flex flex-col gap-1 transition-all rounded-xl ${
                    userRole === 'owner' ? 'dark:border-[#F2F2F2] border-black dark:bg-[#1a1a1a] bg-gray-50 shadow-xs' : 'dark:border-[#262626] border-gray-200'
                  }`}
                >
                  <span className="font-bold text-emerald-800 text-sm">Platform Owner</span>
                  <span className="dark:text-[#767680] text-gray-600">EDGEX Admin</span>
                </button>
              </div>

              {userRole !== 'owner' && (
                <div className="pt-4 border-t dark:border-[#262626] border-gray-200 space-y-2">
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900">Owner Portal PIN Access</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Enter Owner PIN (e.g. 2026)"
                      value={ownerPinInput}
                      onChange={(e) => setOwnerPinInput(e.target.value)}
                      className="w-full p-2.5 border dark:border-[#262626] border-gray-200 outline-none"
                    />
                    <button
                      onClick={() => {
                        if (ownerPinInput === '2026' || ownerPinInput === 'edgex') {
                          setUserRole('owner');
                          setAuthError('');
                          setIsAuthModalOpen(false);
                          setActiveTab('owner-dashboard');
                        } else {
                          setAuthError('Invalid Owner PIN. (Hint: use 2026)');
                        }
                      }}
                      className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-4 font-bold uppercase tracking-wider shrink-0 hover:bg-[#D10000]"
                    >
                      Authenticate
                    </button>
                  </div>
                  {authError && <p className="text-red-600 font-bold">{authError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        setActiveTab={setActiveTab}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        onBuyNow={(prod, size, qty) => {
          handleAddToCart(prod, size, qty);
          setSelectedProduct(null);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
        addresses={savedAddresses}
      />
    </div>
  );
}


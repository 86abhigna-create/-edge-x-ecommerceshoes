import React, { useState } from 'react';
import { Order, WishlistItem, Review, NotificationItem, CartItem, Product, Address } from '../types';
import {
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingBag,
  Heart,
  Bookmark,
  History,
  User as UserIcon,
  MapPin,
  CreditCard,
  Settings,
  RotateCcw,
  Banknote,
  Star,
  TicketPercent,
  Bell,
  Headphones,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LogOut,
  Sparkles,
  Clock,
  ArrowLeft,
  Zap,
} from 'lucide-react';

interface CustomerDashboardViewProps {
  initialSubTab?:
    | 'overview'
    | 'profile'
    | 'orders'
    | 'order-details'
    | 'cart'
    | 'wishlist'
    | 'payments'
    | 'addresses'
    | 'returns'
    | 'refunds'
    | 'reviews'
    | 'recently-viewed'
    | 'saved-products'
    | 'notifications'
    | 'coupons'
    | 'support'
    | 'settings';
  orders: Order[];
  wishlist: WishlistItem[];
  reviews: Review[];
  notifications: NotificationItem[];
  cartItems?: CartItem[];
  products?: Product[];
  onRemoveWishlist: (id: string) => void;
  onAddReview: (review: Review) => void;
  onRequestReturn: (orderId: string, reason: string) => void;
  onShopClick: () => void;
  onAddToCart?: (product: Product, size: string, quantity: number, color?: string) => void;
  onUpdateQuantity?: (cartItemId: string, delta: number) => void;
  onRemoveCartItem?: (cartItemId: string) => void;
  onProceedToCheckout?: () => void;
  onLogout: () => void;
  savedAddresses: Address[];
  setSavedAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  initialSubTab,
  orders,
  wishlist,
  reviews,
  notifications,
  cartItems = [],
  products = [],
  onRemoveWishlist,
  onAddReview,
  onRequestReturn,
  onShopClick,
  onAddToCart,
  onUpdateQuantity,
  onRemoveCartItem,
  onProceedToCheckout,
  onLogout,
  savedAddresses,
  setSavedAddresses,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    | 'overview'
    | 'profile'
    | 'orders'
    | 'order-details'
    | 'cart'
    | 'wishlist'
    | 'payments'
    | 'addresses'
    | 'returns'
    | 'refunds'
    | 'reviews'
    | 'recently-viewed'
    | 'saved-products'
    | 'notifications'
    | 'coupons'
    | 'support'
    | 'settings'
  >(initialSubTab || 'overview');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [recentTabs, setRecentTabs] = useState<string[]>(['overview', 'orders', 'cart', 'wishlist']);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const handleSelectTab = (tabId: any) => {
    setActiveSubTab(tabId);
    setRecentTabs((prev) => {
      const filtered = prev.filter((id) => id !== tabId);
      return [tabId, ...filtered].slice(0, 4);
    });
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Coupon state for Cart tab
  const [cartCoupon, setCartCoupon] = useState('');
  const [cartActiveCoupon, setCartActiveCoupon] = useState<{ code: string; type: 'flat' | 'percent'; amount: number } | null>(null);
  const [cartCouponError, setCartCouponError] = useState('');

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [activeOrderFilter, setActiveOrderFilter] = useState<string>('all');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  let cartDiscount = 0;
  if (cartActiveCoupon) {
    if (cartActiveCoupon.type === 'flat') {
      cartDiscount = Math.min(cartSubtotal, cartActiveCoupon.amount);
    } else {
      cartDiscount = Math.round((cartSubtotal * cartActiveCoupon.amount) / 100);
    }
  }
  const cartShipping = cartSubtotal > 200 || cartSubtotal === 0 ? 0 : 15;
  const cartGrandTotal = Math.max(0, cartSubtotal - cartDiscount + cartShipping);

  const handleApplyCartCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCartCouponError('');
    const code = cartCoupon.trim().toUpperCase();
    if (code === 'EDGEX10') {
      setCartActiveCoupon({ code: 'EDGEX10', type: 'flat', amount: 25 });
      setCartCoupon('');
    } else if (code === 'STEEP10' || code === 'SAVE10') {
      setCartActiveCoupon({ code: code, type: 'percent', amount: 10 });
      setCartCoupon('');
    } else if (code === 'EDGE20' || code === 'SALE20') {
      setCartActiveCoupon({ code: code, type: 'percent', amount: 20 });
      setCartCoupon('');
    } else {
      setCartCouponError('Invalid coupon. Try "EDGEX10", "STEEP10", or "EDGE20"');
    }
  };

  // Review form state
  const [reviewProductName, setReviewProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isWritingReview, setIsWritingReview] = useState(false);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    type: 'shipping' as 'shipping' | 'billing',
    is_default: false,
  });

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: editingAddress?.id || `addr-${Date.now()}`,
      user_id: 'user-1',
      type: addressForm.type,
      fullName: addressForm.full_name,
      phone: addressForm.phone,
      street: addressForm.street,
      apartment: addressForm.apartment,
      city: addressForm.city,
      state: addressForm.state,
      zip: addressForm.zip,
      country: addressForm.country,
      isDefault: addressForm.is_default,
      createdAt: editingAddress?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingAddress) {
      setSavedAddresses(prev => {
        if (addressForm.is_default) {
          const updated = { ...newAddress, isDefault: true };
          const rest = prev.filter(a => a.id !== editingAddress.id).map(a => ({ ...a, isDefault: false }));
          return [updated, ...rest];
        }
        return prev.map(a => a.id === editingAddress.id ? newAddress : a);
      });
    } else {
      if (addressForm.is_default || savedAddresses.length === 0) {
        setSavedAddresses(prev => {
          const rest = prev.map(a => ({ ...a, isDefault: false }));
          return [{ ...newAddress, isDefault: true }, ...rest];
        });
      } else {
        setSavedAddresses(prev => [...prev, newAddress]);
      }
    }
    alert(`Address ${editingAddress ? 'updated' : 'added'} successfully!`);
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({
      full_name: '',
      phone: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      type: 'shipping',
      is_default: false,
    });
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressForm({
      full_name: '',
      phone: '',
      street: '',
      apartment: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      type: 'shipping',
      is_default: false,
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      full_name: address.fullName,
      phone: address.phone || '',
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      type: address.type,
      is_default: address.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProductName) return;
    onAddReview({
      id: 'rev-' + Date.now(),
      productId: 'p-1',
      productName: reviewProductName,
      userName: 'Alex Vance',
      rating,
      comment,
      date: new Date().toLocaleDateString(),
    });
    setComment('');
    setIsWritingReview(false);
    alert('Review submitted successfully.');
  };

  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const customerOptionDescriptions: Record<string, string> = {
    overview: 'Your personal account summary, active deliveries, saved sneaker wishlist, and VIP status.',
    orders: 'Review past purchases, download invoice receipts, and check courier tracking.',
    'order-details': 'Real-time live delivery checkpoint progress, estimated arrival, and dispatch logs.',
    cart: 'Manage items ready for purchase, apply coupon vouchers, and proceed to secure checkout.',
    wishlist: 'Curate your favorite sneaker silhouettes and receive instant notifications when drops release.',
    'saved-products': 'Sneaker silhouettes bookmarked for future seasonal release drops.',
    'recently-viewed': 'Footwear models and limited edition colorways you browsed recently.',
    profile: 'Update your display name, email preferences, phone number, and footwear sizing preferences.',
    addresses: 'Manage delivery destinations, default apartment/building notes, and postal codes.',
    payments: 'Saved credit cards, Apple Pay credentials, billing addresses, and default payment method.',
    settings: 'Security settings, password changes, SMS alerts, and marketing privacy preferences.',
    returns: 'Initiate an easy return or exchange within 30 days of receiving your package.',
    refunds: 'Track pending payment reversals and store credit balance status.',
    reviews: 'Share buyer feedback, star ratings, styling photos, and sizing accuracy advice.',
    coupons: 'Active member discounts, VIP tier vouchers, and free shipping codes.',
    notifications: 'Drop reminders, order status updates, and exclusive invitation alerts.',
    support: '24/7 Priority Concierge live chat, email assistance, and sizing hotline.',
  };

  interface CustomerNavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }

  interface CustomerNavGroup {
    group: string;
    items: CustomerNavItem[];
  }

  const navigationGroups: CustomerNavGroup[] = [
    {
      group: 'Orders & Shopping',
      items: [
        { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'orders', label: 'My Orders', icon: Package, badge: orders.length },
        { id: 'order-details', label: 'Order Tracking & Details', icon: Receipt },
        { id: 'cart', label: 'Shopping Cart', icon: ShoppingBag, badge: cartItems.length },
        { id: 'wishlist', label: 'Wishlist & Favorites', icon: Heart, badge: wishlist.length },
        { id: 'saved-products', label: 'Saved Products', icon: Bookmark },
        { id: 'recently-viewed', label: 'Recently Viewed', icon: History },
      ],
    },
    {
      group: 'Account & Billing',
      items: [
        { id: 'profile', label: 'Personal Profile', icon: UserIcon },
        { id: 'addresses', label: 'Shipping Addresses', icon: MapPin, badge: savedAddresses.length },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
        { id: 'settings', label: 'Account Settings', icon: Settings },
      ],
    },
    {
      group: 'Services & Rewards',
      items: [
        { id: 'returns', label: 'Returns & Exchanges', icon: RotateCcw },
        { id: 'refunds', label: 'Refunds & Payouts', icon: Banknote },
        { id: 'reviews', label: 'My Reviews & Ratings', icon: Star, badge: reviews.length },
        { id: 'coupons', label: 'Offers & Coupons', icon: TicketPercent, badge: '3 Active' },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: notifications.filter((n) => !n.read).length || undefined,
          badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
        },
        {
          id: 'support',
          label: 'Concierge Support',
          icon: Headphones,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
      ],
    },
  ];

  // Flattened for search
  const allNavItems: CustomerNavItem[] = navigationGroups.flatMap((g) => g.items);
  const filteredGroups: CustomerNavGroup[] = navigationGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item: CustomerNavItem) =>
        item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        item.id.toLowerCase().includes(sidebarSearch.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const activeItemDetails: CustomerNavItem = allNavItems.find((item) => item.id === activeSubTab) || allNavItems[0];
  const activeGroup = navigationGroups.find((g) => g.items.some((item) => item.id === activeSubTab));

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b dark:border-[#262626] border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs font-['Bebas_Neue',sans-serif]">
              EX
            </div>
            <div>
              <p className="text-xs font-bold dark:text-white text-gray-900 leading-none">Member Console</p>
              <p className="text-[10px] dark:text-neutral-400 text-gray-500 mt-0.5">17 Account Services</p>
            </div>
          </div>
          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded">
            VIP Tier
          </span>
        </div>

        {/* Real-time search filter inside sidebar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Search all 17 services..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#2A2A2A] border-gray-200 dark:text-white text-gray-900 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {sidebarSearch && (
            <button
              onClick={() => setSidebarSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Recently visited pills */}
        {recentTabs.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-[10px] dark:text-neutral-400 text-gray-500 font-semibold mb-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>Recent Tabs</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recentTabs.map((tabId) => {
                const tab = allNavItems.find((n) => n.id === tabId);
                if (!tab) return null;
                const isActive = activeSubTab === tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => {
                      handleSelectTab(tabId);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded-md transition-colors cursor-pointer truncate max-w-[110px] ${
                      isActive
                        ? 'bg-red-600 text-white font-bold'
                        : 'dark:bg-[#1f1f1f] bg-gray-100 dark:text-neutral-300 text-gray-700 hover:bg-red-500/10 hover:text-red-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups with Collapsible Accordions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {filteredGroups.length === 0 ? (
          <div className="py-8 text-center text-xs dark:text-neutral-500 text-gray-400">
            No matching services found.
          </div>
        ) : (
          filteredGroups.map((grp) => {
            const isCollapsed = !sidebarSearch && !!collapsedGroups[grp.group];
            return (
              <div key={grp.group} className="space-y-1">
                <button
                  onClick={() => toggleGroupCollapse(grp.group)}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider dark:text-neutral-400 text-gray-500 px-3 py-1.5 rounded-lg dark:hover:bg-[#1a1a1a] hover:bg-gray-100 transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{grp.group}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full dark:bg-[#222] bg-gray-200 text-neutral-400">
                      {grp.items.length}
                    </span>
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 pt-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSubTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleSelectTab(item.id as any);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                            isActive
                              ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                              : 'dark:text-neutral-300 text-gray-700 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'dark:text-neutral-400 text-gray-500 group-hover:text-red-500'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeColor ||
                                    'dark:bg-[#222] bg-gray-200 dark:text-neutral-300 text-gray-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t dark:border-[#262626] border-gray-200 dark:bg-[#141414] bg-gray-50/50 rounded-b-2xl">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 text-xs font-black">
            AV
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold dark:text-white text-gray-900 truncate">Alex Vance</p>
            <p className="text-[10px] dark:text-neutral-500 text-gray-400 truncate">alex.vance@gmail.com</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={onShopClick}
            className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold dark:bg-[#222] bg-white border dark:border-[#333] border-gray-200 dark:text-neutral-300 text-gray-700 rounded-lg hover:border-red-500 transition-colors cursor-pointer"
          >
            <span>Explore Drops</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold dark:bg-red-950/30 bg-red-50 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-2.5 h-2.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#B00000] via-[#D10000] to-[#800000] text-white p-5 sm:p-6 mb-6 rounded-2xl shadow-xl mx-3 sm:mx-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl border border-white/20 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
            aria-label="Toggle navigation sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded text-white border border-white/10">
                Your Member Space
              </span>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Black Circle VIP • Member #EX-99421
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-1 font-['Bebas_Neue',sans-serif]">
              Alex Vance
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={onShopClick}
            className="bg-black hover:bg-neutral-900 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Explore Drops</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Layout Container: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6 px-3 sm:px-6">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 dark:bg-[#121212] bg-white border dark:border-[#262626] border-gray-200 rounded-2xl shadow-sm overflow-hidden max-h-[calc(100vh-6.5rem)] flex flex-col">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL / DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-4/5 max-w-xs dark:bg-[#121212] bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden">
              <div className="p-4 border-b dark:border-[#262626] border-gray-200 flex items-center justify-between">
                <span className="font-bold text-sm dark:text-white text-gray-900 uppercase tracking-wider">
                  Member Services
                </span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg dark:hover:bg-neutral-800 hover:bg-gray-100 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderSidebarContent()}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* Quick Actions Shortcuts Bar */}
          <div className="mb-4 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[10px] font-extrabold uppercase tracking-wider dark:text-neutral-500 text-gray-400 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Quick Jump:
              </span>
              <button
                onClick={() => handleSelectTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'overview'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => handleSelectTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'orders'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders</span>
                {orders.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded-full font-black">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSelectTab('cart')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'cart'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Cart</span>
                {cartItems.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded-full font-black">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSelectTab('wishlist')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'wishlist'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-full font-black">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSelectTab('addresses')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'addresses'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Addresses</span>
                {savedAddresses.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 dark:bg-neutral-800 bg-gray-200 text-neutral-400 rounded-full font-bold">
                    {savedAddresses.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSelectTab('coupons')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'coupons'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <TicketPercent className="w-3.5 h-3.5" />
                <span>Coupons</span>
              </button>
              <button
                onClick={() => handleSelectTab('support')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'support'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Support</span>
              </button>
            </div>
          </div>

          {/* Contextual Section Header Banner */}
          <div className="dark:bg-[#121212] bg-white border dark:border-[#262626] border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="dark:text-neutral-500 text-gray-400">Customer Space</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="dark:text-neutral-400 text-gray-600 font-medium">{activeGroup?.group}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-red-500 font-bold">{activeItemDetails.label}</span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <h2 className="text-lg sm:text-xl font-black dark:text-white text-gray-900 tracking-tight">
                    {activeItemDetails.label}
                  </h2>
                  {activeItemDetails.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeItemDetails.badgeColor || 'dark:bg-[#222] bg-gray-200 dark:text-neutral-300 text-gray-700'
                      }`}
                    >
                      {activeItemDetails.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs dark:text-neutral-400 text-gray-500 leading-relaxed max-w-3xl">
                  {customerOptionDescriptions[activeSubTab] || 'Access your personalized footwear services, order management, and rewards.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {activeSubTab !== 'overview' && (
                  <button
                    onClick={() => handleSelectTab('overview')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold dark:bg-[#1a1a1a] bg-gray-100 dark:text-neutral-300 text-gray-700 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Overview</span>
                  </button>
                )}

                {(activeSubTab === 'cart' || activeSubTab === 'wishlist') && (
                  <button
                    onClick={onShopClick}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Shop Footwear</span>
                  </button>
                )}

                {/* Mobile sidebar trigger */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-500/30"
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span>All 17 Services</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">

      {/* 1. OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 shadow-xs">
              <p className="text-xs font-bold dark:text-[#868686] text-gray-500 uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-black dark:text-[#F2F2F2] text-gray-900 mt-2">{orders.length}</p>
              <button onClick={() => setActiveSubTab('orders')} className="text-xs text-[#D10000] font-bold mt-2 hover:underline block">
                View orders →
              </button>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 shadow-xs">
              <p className="text-xs font-bold dark:text-[#868686] text-gray-500 uppercase tracking-wider">Wishlist Items</p>
              <p className="text-3xl font-black dark:text-[#F2F2F2] text-gray-900 mt-2">{wishlist.length}</p>
              <button onClick={() => setActiveSubTab('wishlist')} className="text-xs text-[#D10000] font-bold mt-2 hover:underline block">
                View wishlist →
              </button>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 shadow-xs">
              <p className="text-xs font-bold dark:text-[#868686] text-gray-500 uppercase tracking-wider">Active Coupons</p>
              <p className="text-3xl font-black text-emerald-700 mt-2">2 Available</p>
              <button onClick={() => setActiveSubTab('coupons')} className="text-xs text-[#D10000] font-bold mt-2 hover:underline block">
                View offers →
              </button>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 shadow-xs">
              <p className="text-xs font-bold dark:text-[#868686] text-gray-500 uppercase tracking-wider">Reviews Posted</p>
              <p className="text-3xl font-black dark:text-[#F2F2F2] text-gray-900 mt-2">{reviews.length}</p>
              <button onClick={() => setActiveSubTab('reviews')} className="text-xs text-[#D10000] font-bold mt-2 hover:underline block">
                View ratings →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6">
              <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 mb-4">Default Shipping Address</h3>
              <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 text-xs space-y-1 border dark:border-[#262626] border-gray-200">
                <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Alex Vance</p>
                <p>742 Evergreen Terrace</p>
                <p>New York, NY 10001</p>
                <p>United States</p>
              </div>
              <button onClick={() => setActiveSubTab('addresses')} className="text-xs font-bold text-[#D10000] mt-3 hover:underline block">
                Manage all addresses →
              </button>
            </div>

            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6">
              <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 mb-4">Saved Payment Card</h3>
              <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 text-xs flex justify-between items-center border dark:border-[#262626] border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl dark:text-[#F2F2F2] text-gray-900">credit_card</span>
                  <div>
                    <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Mastercard ending in 4242</p>
                    <p className="dark:text-[#868686] text-gray-500">Express Checkout Enabled</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">Active</span>
              </div>
              <button onClick={() => setActiveSubTab('payments')} className="text-xs font-bold text-[#D10000] mt-3 hover:underline block">
                Manage payment methods →
              </button>
            </div>
          </div>

          {/* Recent Orders & Sneaker Previews Widget */}
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
              <div>
                <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-500" />
                  <span>Recent Footwear Orders & Drop Deliveries</span>
                </h3>
                <p className="text-xs dark:text-[#868686] text-gray-500">Instant visual preview of your ordered silhouettes and tracking updates</p>
              </div>
              <button 
                onClick={() => setActiveSubTab('orders')} 
                className="text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
              >
                <span>View all ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500 dark:text-neutral-400">No recent orders yet. Explore our curated drop!</p>
                <button onClick={onShopClick} className="mt-3 text-xs font-bold text-red-500 hover:underline">Shop Now →</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.orderId} className="p-4 rounded-xl dark:bg-[#151515] bg-gray-50 border dark:border-[#262626] border-gray-200 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-red-500">#{o.orderId}</span>
                        <span className="text-[11px] text-gray-400 ml-2">{o.date}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                        <div className="flex -space-x-3 overflow-hidden py-1">
                          {o.itemSnapshots.slice(0, 3).map((snap, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                              className="w-14 h-14 bg-white rounded-xl border-2 dark:border-[#151515] border-gray-100 p-1 flex items-center justify-center cursor-pointer shadow-xs hover:scale-110 hover:z-10 transition-transform"
                              title={snap.productName}
                            >
                              <img src={snap.image} alt={snap.productName} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex -space-x-3 overflow-hidden py-1">
                          {o.items.slice(0, 3).map((item, idx) => (
                            <div 
                              key={idx}
                              onClick={() => item.product?.image && setPreviewImage({ url: item.product.image, title: item.product.name })}
                              className="w-14 h-14 bg-white rounded-xl border-2 dark:border-[#151515] border-gray-100 p-1 flex items-center justify-center cursor-pointer shadow-xs hover:scale-110 hover:z-10 transition-transform"
                              title={item.product?.name}
                            >
                              <img src={item.product?.image || ''} alt={item.product?.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate dark:text-white text-gray-900">
                          {o.itemSnapshots?.[0]?.productName || o.items?.[0]?.product?.name || 'Sneaker Pair'}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-neutral-400">
                          Total: <strong className="text-red-500 font-bold">₹{o.total.toLocaleString()}</strong> ({o.itemSnapshots?.length || o.items?.length || 1} item{o.items?.length > 1 ? 's' : ''})
                        </p>
                      </div>

                      <button 
                        onClick={() => setActiveSubTab('order-details')}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-bold dark:bg-neutral-800 bg-gray-200 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. MY PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-8 space-y-8">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">My Profile & Personal Information</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Manage your identity, contact details, profile picture, and credentials.</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200">
              Black Circle VIP Member
            </span>
          </div>

          {/* Profile Image & Basic Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200">
            <div className="w-24 h-24 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 flex items-center justify-center font-black text-3xl shrink-0 rounded-full overflow-hidden shadow-sm relative group">
              <span className="material-symbols-outlined text-4xl">person</span>
            </div>
            <div className="space-y-2 flex-grow">
              <label className="block text-xs font-bold uppercase dark:text-[#F2F2F2] text-gray-900">Profile Image / Avatar</label>
              <div className="flex items-center gap-3">
                <button onClick={() => alert('Avatar updated successfully.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000]">
                  Upload New Photo
                </button>
                <button onClick={() => alert('Default avatar restored.')} className="dark:bg-[#0D0D0D] bg-white text-[#45464f] border dark:border-[#262626] border-gray-200 px-4 py-2 text-xs font-bold uppercase tracking-wider dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black">
                  Remove
                </button>
              </div>
              <p className="text-[11px] dark:text-[#868686] text-gray-500">JPG, GIF or PNG. Max size of 800K.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Full Name</label>
              <input type="text" defaultValue="Alex Vance" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-semibold dark:text-[#F2F2F2] text-gray-900" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Email Address</label>
              <input type="email" defaultValue="alex.vance@edgex.studio" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-semibold dark:text-[#F2F2F2] text-gray-900" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Mobile Number</label>
              <input type="text" defaultValue="+1 (555) 382-9912" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-semibold dark:text-[#F2F2F2] text-gray-900" />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Membership Tier</label>
              <input type="text" defaultValue="Black Circle Tier (VIP)" disabled className="w-full p-3 border dark:border-[#262626] border-gray-200 bg-emerald-50 font-bold text-emerald-800" />
            </div>
          </div>

          {/* Password & Security Settings */}
          <div className="pt-6 border-t dark:border-[#262626] border-gray-200 space-y-4">
            <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900">Password & Account Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white" />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase dark:text-[#868686] text-gray-500">New Password</label>
                <input type="password" placeholder="New password" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white" />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Confirm Password</label>
                <input type="password" placeholder="Confirm password" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button onClick={() => alert('Profile and security credentials updated successfully.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#8a0000]">
              Save Profile Changes
            </button>
            <button onClick={() => alert('Changes discarded.')} className="dark:bg-[#1a1a1a] bg-gray-50 text-[#45464f] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#c6c5d0]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 3. MY ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-4">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                <span>My Orders & Sneaker Purchases</span>
                <span className="text-xs px-2.5 py-0.5 font-bold uppercase tracking-wider bg-red-500/10 text-red-600 rounded-full border border-red-500/20">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Full visual ledger of your sneaker drops, ordered sizes, colors, and live delivery status.</p>
            </div>
            
            {/* Search & Filter Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 dark:text-neutral-400 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search order ID, shoe name..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border dark:border-[#262626] border-gray-200 dark:bg-[#1a1a1a] bg-gray-50 dark:text-white text-gray-900 focus:outline-none focus:border-red-500"
                />
                {orderSearchQuery && (
                  <button 
                    onClick={() => setOrderSearchQuery('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button 
                onClick={onShopClick} 
                className="bg-[#D10000] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-[#a80000] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop New Drop</span>
              </button>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'In Transit', label: 'In Transit & Shipped' },
              { id: 'Processing', label: 'Processing / Confirmed' },
              { id: 'Delivered', label: 'Delivered' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveOrderFilter(filter.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors ${
                  activeOrderFilter === filter.id
                    ? 'bg-red-600 text-white'
                    : 'dark:bg-[#1a1a1a] bg-gray-100 dark:text-neutral-300 text-gray-700 hover:bg-gray-200 dark:hover:bg-neutral-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-12 text-center rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h4 className="font-black text-lg dark:text-[#F2F2F2] text-gray-900">No orders placed yet</h4>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1 max-w-md mx-auto">
                Explore our latest drop of high-performance and streetwear silhouettes to place your first booking!
              </p>
              <button onClick={onShopClick} className="mt-5 bg-[#D10000] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#a80000] transition-colors inline-flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Footwear Collection</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders
                .filter((o) => {
                  if (activeOrderFilter === 'all') return true;
                  if (activeOrderFilter === 'In Transit') return o.status === 'Shipped' || o.status === 'Out for Delivery';
                  if (activeOrderFilter === 'Processing') return o.status === 'Processing' || o.status === 'Order Confirmed' || o.status === 'Payment Confirmed';
                  if (activeOrderFilter === 'Delivered') return o.status === 'Delivered';
                  return true;
                })
                .filter((o) => {
                  if (!orderSearchQuery.trim()) return true;
                  const query = orderSearchQuery.toLowerCase();
                  const matchId = o.orderId.toLowerCase().includes(query);
                  const matchAddress = o.shippingAddress?.fullName?.toLowerCase().includes(query);
                  const matchItems = (o.itemSnapshots || []).some(
                    (s) => s.productName?.toLowerCase().includes(query) || s.selectedColor?.toLowerCase().includes(query)
                  ) || (o.items || []).some(
                    (i) => i.product?.name?.toLowerCase().includes(query)
                  );
                  return matchId || matchAddress || matchItems;
                })
                .map((o) => (
                <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 md:p-8 rounded-2xl shadow-xs space-y-6">
                  {/* Order Top Meta */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-black text-base text-[#D10000] tracking-wide">Order #{o.orderId}</span>
                        <span className="text-xs dark:text-[#868686] text-gray-500 font-semibold">• Date: {o.date}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase dark:bg-neutral-800 bg-gray-100 dark:text-neutral-300 text-gray-700">
                          {o.itemSnapshots?.length || o.items?.length || 1} Item(s)
                        </span>
                      </div>
                      <p className="text-xs dark:text-[#868686] text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-red-500" />
                        <span>Deliver to: <strong>{o.shippingAddress.fullName}</strong> — {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-lg flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span>{o.paymentMethod || 'Paid in Full'}</span>
                      </span>
                      <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-lg flex items-center gap-1 ${
                        o.status === 'Delivered' 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                          : o.status === 'Shipped' || o.status === 'Out for Delivery'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{o.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items List With Visual Previews */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-wider dark:text-neutral-400 text-gray-500">Ordered Silhouettes & Visual Gallery</p>
                    {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                      o.itemSnapshots.map((snap, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 dark:bg-[#151515] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-xl gap-4 hover:border-red-500/30 transition-colors">
                          <div className="flex items-center gap-4">
                            {/* Product Thumbnail with Lightbox zoom button */}
                            <div 
                              onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                              className="w-20 h-20 bg-white flex items-center justify-center p-1.5 shrink-0 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden cursor-zoom-in relative group shadow-xs"
                              title="Click to zoom image"
                            >
                              <img 
                                src={snap.image} 
                                alt={snap.productName} 
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Search className="w-4 h-4" />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">{snap.productName}</p>
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-600 rounded font-bold uppercase">Authentic</span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs dark:text-[#868686] text-gray-500 mt-1.5 font-semibold">
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Size: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">{snap.selectedSize}</strong>
                                </span>
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Color: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">{snap.selectedColor || 'Standard Edition'}</strong>
                                </span>
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Qty: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">{snap.quantity}</strong>
                                </span>
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Unit Price: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">₹{snap.price.toLocaleString()}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-xs text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 dark:border-[#262626] border-gray-200">
                            <div>
                              <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Express Shipping</p>
                              <p className="font-bold text-emerald-600 uppercase">FREE</p>
                            </div>
                            <div>
                              <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Item Total</p>
                              <p className="font-black text-base text-red-600">₹{(snap.price * snap.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      o.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 dark:bg-[#151515] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-xl gap-4 hover:border-red-500/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div 
                              onClick={() => item.product?.image && setPreviewImage({ url: item.product.image, title: item.product.name })}
                              className="w-20 h-20 bg-white flex items-center justify-center p-1.5 shrink-0 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden cursor-zoom-in relative group shadow-xs"
                            >
                              <img 
                                src={item.product?.image || ''} 
                                alt={item.product?.name || 'Shoe'} 
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" 
                              />
                            </div>
                            <div>
                              <p className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">{item.product?.name || 'Deactivated Shoe'}</p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs dark:text-[#868686] text-gray-500 mt-1.5 font-semibold">
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Size: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">{item.selectedSize}</strong>
                                </span>
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Color: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">{item.selectedColor || item.product?.colorway || 'Standard Edition'}</strong>
                                </span>
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Qty: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">{item.quantity}</strong>
                                </span>
                                <span className="dark:bg-neutral-800 bg-white px-2 py-0.5 rounded border dark:border-neutral-700 border-gray-200">
                                  Unit Price: <strong className="dark:text-[#F2F2F2] text-gray-900 font-black">₹{(item.product?.price || 0).toLocaleString()}</strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-xs text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 dark:border-[#262626] border-gray-200">
                            <div>
                              <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Express Shipping</p>
                              <p className="font-bold text-emerald-600 uppercase">FREE</p>
                            </div>
                            <div>
                              <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Item Total</p>
                              <p className="font-black text-base text-red-600">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Order Footer Totals & Action */}
                  <div className="pt-4 border-t dark:border-[#262626] border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="dark:text-[#868686] text-gray-500 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-red-500" />
                        <span>Courier: <strong className="dark:text-[#F2F2F2] text-gray-900 font-bold">EDGEX Air Express (Airway Bill # AW-{o.orderId.replace(/[^0-9]/g, '') || '98214'})</strong></span>
                      </p>
                      <p className="dark:text-[#868686] text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Estimated Delivery: <strong className="text-emerald-600 font-bold">3 Business Days via Priority Air</strong></span>
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right mr-2">
                        <span className="dark:text-[#868686] text-gray-500 uppercase text-[10px] block font-bold">Grand Total Paid</span>
                        <span className="font-black text-xl text-red-600">₹{o.total.toLocaleString()}</span>
                      </div>
                      <button 
                        onClick={() => setTrackingOrderId(trackingOrderId === o.orderId ? null : o.orderId)} 
                        className="bg-[#D10000] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#a80000] rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{trackingOrderId === o.orderId ? 'Hide Tracking' : 'Track Shipment'}</span>
                      </button>
                      <button 
                        onClick={() => setActiveSubTab('order-details')} 
                        className="dark:bg-[#1a1a1a] bg-gray-100 border dark:border-[#262626] border-gray-300 dark:text-[#F2F2F2] text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl hover:border-red-500 transition-colors flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Full Invoice</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Tracking Timeline */}
                  {trackingOrderId === o.orderId && (
                    <div className="pt-6 pb-2 border-t dark:border-[#262626] border-gray-200 mt-4 bg-red-500/5 -mx-6 md:-mx-8 px-6 md:px-8 -mb-6 md:-mb-8 py-6 rounded-b-2xl">
                      <h5 className="font-black text-xs uppercase tracking-wider mb-4 dark:text-white text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-500" />
                        <span>Live Courier Milestones & Tracking Progress</span>
                      </h5>
                      <div className="flex flex-col md:flex-row justify-between relative max-w-4xl mx-auto">
                        <div className="absolute top-4 left-4 right-4 h-1 dark:bg-[#262626] bg-gray-200 hidden md:block -z-10"></div>
                        <div className="absolute top-4 left-4 h-1 bg-[#D10000] hidden md:block -z-10" style={{
                          width: o.status === 'Processing' || o.status === 'Order Confirmed' || o.status === 'Payment Confirmed' ? '0%' :
                                 o.status === 'Shipped' ? '33%' :
                                 o.status === 'Out for Delivery' ? '66%' :
                                 o.status === 'Delivered' ? '100%' : '0%'
                        }}></div>
                        
                        {[
                          { label: 'Order Confirmed', icon: 'receipt_long', desc: 'Payment verified & sneaker allocated' },
                          { label: 'Air Express Shipped', icon: 'local_shipping', desc: 'Dispatched from central hub' },
                          { label: 'Out for Delivery', icon: 'directions_car', desc: 'Courier on route to your address' },
                          { label: 'Delivered', icon: 'done_all', desc: 'Package safely received' }
                        ].map((step, stepIdx) => {
                          const currentStepIdx = 
                            o.status === 'Shipped' ? 1 : 
                            o.status === 'Out for Delivery' ? 2 : 
                            o.status === 'Delivered' ? 3 : 0;
                            
                          const isCompleted = stepIdx <= currentStepIdx;
                          const isCurrent = stepIdx === currentStepIdx;
                          
                          return (
                            <div key={step.label} className="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-2 mb-6 md:mb-0 relative">
                              {/* Mobile timeline line */}
                              {stepIdx !== 3 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] dark:bg-[#262626] bg-gray-200 md:hidden -z-10"></div>}
                              {stepIdx !== 3 && isCompleted && !isCurrent && <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-[#D10000] md:hidden -z-10"></div>}
                              
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                                isCompleted ? 'bg-[#D10000] border-[#D10000] text-white shadow-md' : 'dark:bg-[#0D0D0D] bg-white dark:border-[#262626] border-gray-300 text-gray-400'
                              }`}>
                                <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                              </div>
                              <div className="md:text-center">
                                <p className={`text-xs font-black uppercase tracking-wider ${isCompleted ? 'dark:text-[#F2F2F2] text-gray-900' : 'dark:text-[#868686] text-gray-500'}`}>
                                  {step.label}
                                </p>
                                <p className="text-[10px] dark:text-neutral-400 text-gray-500 hidden md:block max-w-[130px]">{step.desc}</p>
                                {isCurrent && o.status !== 'Delivered' && (
                                  <span className="inline-block text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase mt-1">In Progress</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ORDER DETAILS */}
      {activeSubTab === 'order-details' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-500" />
                <span>Comprehensive Order & Shipment Invoices</span>
              </h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Complete itemized breakdowns, customer delivery destinations, and sneaker previews.</p>
            </div>
            <button 
              onClick={() => setActiveSubTab('orders')}
              className="text-xs font-bold text-red-600 hover:text-red-500 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders List</span>
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-12 text-center rounded-2xl">
              <Package className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">No order details available.</p>
              <button onClick={onShopClick} className="mt-4 bg-[#D10000] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl">Shop Now</button>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 md:p-8 rounded-2xl space-y-6 shadow-xs">
                {/* Header Meta */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-3">
                  <div>
                    <h4 className="font-black text-lg text-red-600">Order #{o.orderId}</h4>
                    <p className="text-xs dark:text-[#868686] text-gray-500">Placed on {o.date} • Electronic Invoice # INV-{o.orderId.replace(/[^0-9]/g, '') || '4920'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase border border-emerald-500/20 rounded-lg">
                      {o.status}
                    </span>
                    <button 
                      onClick={() => window.print()}
                      className="px-3 py-1 dark:bg-neutral-800 bg-gray-100 dark:text-neutral-300 text-gray-700 text-xs font-bold uppercase rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>

                {/* 3-Column Info Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="dark:bg-[#151515] bg-gray-50 p-4 rounded-xl space-y-1.5 border dark:border-[#262626] border-gray-200">
                    <p className="font-bold uppercase dark:text-[#F2F2F2] text-gray-900 flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>Shipping Destination</span>
                    </p>
                    <p className="font-bold text-gray-800 dark:text-neutral-200">{o.shippingAddress.fullName}</p>
                    <p className="text-gray-600 dark:text-neutral-400">{o.shippingAddress.street}</p>
                    <p className="text-gray-600 dark:text-neutral-400">{o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.zip}</p>
                  </div>
                  <div className="dark:bg-[#151515] bg-gray-50 p-4 rounded-xl space-y-1.5 border dark:border-[#262626] border-gray-200">
                    <p className="font-bold uppercase dark:text-[#F2F2F2] text-gray-900 flex items-center gap-1.5 text-[11px]">
                      <CreditCard className="w-3.5 h-3.5 text-red-500" />
                      <span>Payment Summary</span>
                    </p>
                    <p className="font-bold text-gray-800 dark:text-neutral-200">{o.paymentMethod || 'Credit / Debit Card'}</p>
                    <p className="text-emerald-600 font-bold">Payment Verified & Settled</p>
                    <p className="text-gray-500 text-[10px]">Taxes & Courier Included</p>
                  </div>
                  <div className="dark:bg-[#151515] bg-gray-50 p-4 rounded-xl space-y-1.5 border dark:border-[#262626] border-gray-200">
                    <p className="font-bold uppercase dark:text-[#F2F2F2] text-gray-900 flex items-center gap-1.5 text-[11px]">
                      <Package className="w-3.5 h-3.5 text-red-500" />
                      <span>Logistics & Courier</span>
                    </p>
                    <p className="font-bold text-gray-800 dark:text-neutral-200">EDGEX Air Express Priority</p>
                    <p className="text-red-600 font-bold">Tracking # EX-TRK-{o.orderId.replace(/[^0-9]/g, '') || '98214'}</p>
                    <p className="text-gray-500 text-[10px]">Estimated Delivery: 3 Days</p>
                  </div>
                </div>

                {/* Purchased Footwear Showcase with High-Res Images */}
                <div>
                  <p className="font-bold uppercase text-xs mb-3 dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-red-500" />
                    <span>Purchased Footwear & Itemized Specs</span>
                  </p>
                  <div className="space-y-3">
                    {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                      o.itemSnapshots.map((snap, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border dark:border-[#262626] border-gray-200 p-4 rounded-xl dark:bg-[#151515] bg-gray-50 gap-4">
                          <div className="flex items-center gap-4">
                            <div 
                              onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                              className="w-20 h-20 bg-white flex items-center justify-center p-1.5 shrink-0 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden cursor-zoom-in group shadow-xs"
                            >
                              <img src={snap.image} alt={snap.productName} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <p className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">{snap.productName}</p>
                              <div className="flex flex-wrap gap-2 text-xs dark:text-[#868686] text-gray-500 mt-1">
                                <span className="font-semibold">Size: <strong className="dark:text-white text-gray-900">{snap.selectedSize}</strong></span>
                                <span>•</span>
                                <span className="font-semibold">Colorway: <strong className="dark:text-white text-gray-900">{snap.selectedColor || 'Standard'}</strong></span>
                                <span>•</span>
                                <span className="font-semibold">Qty: <strong className="dark:text-white text-gray-900">{snap.quantity}</strong></span>
                              </div>
                              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Unit Price: ₹{snap.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right sm:self-center self-end">
                            <span className="text-[10px] uppercase font-bold dark:text-neutral-400 text-gray-500 block">Subtotal</span>
                            <span className="font-black text-base text-red-600">₹{(snap.price * snap.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      o.items.map((item, i) => (
                        <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border dark:border-[#262626] border-gray-200 p-4 rounded-xl dark:bg-[#151515] bg-gray-50 gap-4">
                          <div className="flex items-center gap-4">
                            <div 
                              onClick={() => item.product?.image && setPreviewImage({ url: item.product.image, title: item.product.name })}
                              className="w-20 h-20 bg-white flex items-center justify-center p-1.5 shrink-0 border border-gray-200 dark:border-neutral-700 rounded-xl overflow-hidden cursor-zoom-in group shadow-xs"
                            >
                              <img src={item.product?.image || ''} alt={item.product?.name || 'Shoe'} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <p className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">{item.product?.name || 'Deactivated Shoe'}</p>
                              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Size: {item.selectedSize} | Color: {item.selectedColor || item.product?.colorway || 'Standard'} | Qty: {item.quantity}</p>
                              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Unit Price: ₹{(item.product?.price || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right sm:self-center self-end">
                            <span className="text-[10px] uppercase font-bold dark:text-neutral-400 text-gray-500 block">Subtotal</span>
                            <span className="font-black text-base text-red-600">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Grand Total Summary */}
                <div className="pt-4 border-t dark:border-[#262626] border-gray-200 flex justify-between items-center text-xs">
                  <div>
                    <button 
                      onClick={() => onRequestReturn(o.orderId, 'Exchange / Return requested by customer')}
                      className="text-xs font-bold text-neutral-500 hover:text-red-500 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Return / Size Replacement</span>
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="dark:text-neutral-400 text-gray-500 uppercase font-bold text-[10px] block">Invoice Grand Total</span>
                    <span className="font-black text-2xl text-red-600">₹{o.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. MY CART */}
      {activeSubTab === 'cart' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">My Active Shopping Bag & Cart</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Review selected silhouettes, sizing, colorways, quantities, unit prices, discounts, and coupon breakdown.</p>
            </div>
            <span className="text-xs font-bold dark:text-[#F2F2F2] text-gray-900 bg-blue-50 px-3 py-1 border border-blue-200 rounded-full">
              {cartItems.length} Items in Bag
            </span>
          </div>

          {cartItems.length === 0 ? (
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full dark:bg-[#1a1a1a] bg-gray-50 flex items-center justify-center mx-auto border dark:border-[#262626] border-gray-200">
                <span className="material-symbols-outlined text-3xl dark:text-[#868686] text-gray-500">shopping_bag</span>
              </div>
              <p className="font-bold text-base dark:text-[#F2F2F2] text-gray-900">Your shopping bag is currently empty.</p>
              <p className="text-xs dark:text-[#868686] text-gray-500">Browse the drop catalog to reserve your desired size and colorway.</p>
              <button onClick={onShopClick} className="mt-2 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#8a0000] transition-colors">Return to Catalog</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const selectedColor = item.selectedColor || item.product.colorway;
                  const listPrice = Math.round(item.product.price * 1.18);
                  const discountPct = item.product.discountPercent || 15;

                  return (
                    <div key={item.cartItemId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 rounded-lg flex items-center justify-center p-2 shrink-0">
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500">{item.product.category} • SKU: EX-{item.product.id.toUpperCase()}</p>
                          <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900">{item.product.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#45464f] mt-1.5 font-semibold">
                            <span className="dark:bg-[#1a1a1a] bg-gray-50 px-2 py-0.5 rounded border dark:border-[#262626] border-gray-200 text-[11px] font-extrabold dark:text-[#F2F2F2] text-gray-900">
                              Size: {item.selectedSize}
                            </span>
                            <span className="dark:bg-[#1a1a1a] bg-gray-50 px-2 py-0.5 rounded border dark:border-[#262626] border-gray-200 text-[11px] font-extrabold dark:text-[#F2F2F2] text-gray-900 flex items-center gap-1">
                              Color: {selectedColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Pricing Breakdowns */}
                      <div className="flex items-center gap-6 text-xs text-right w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 dark:border-[#262626] border-gray-200">
                        {/* Quantity controls */}
                        <div className="text-left">
                          <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold mb-1">Quantity</p>
                          <div className="flex items-center border dark:border-[#262626] border-gray-200 rounded dark:bg-[#0D0D0D] bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity && onUpdateQuantity(item.cartItemId, -1)}
                              className="px-2.5 py-1 text-xs font-black dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-black dark:text-[#F2F2F2] text-gray-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity && onUpdateQuantity(item.cartItemId, 1)}
                              className="px-2.5 py-1 text-xs font-black dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Unit Price</p>
                          <p className="font-bold dark:text-[#F2F2F2] text-gray-900">₹{item.product.price.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] dark:text-[#868686] text-gray-500 line-through">₹{listPrice.toLocaleString('en-IN')}</p>
                        </div>

                        <div>
                          <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Discount</p>
                          <p className="font-bold text-emerald-700">-₹{((listPrice - item.product.price) * item.quantity).toLocaleString('en-IN')}</p>
                          <span className="text-[9px] font-black text-red-600 bg-red-50 px-1 py-0.5 rounded">-{discountPct}% OFF</span>
                        </div>

                        <div>
                          <p className="dark:text-[#868686] text-gray-500 uppercase text-[10px] font-bold">Item Total</p>
                          <p className="font-black text-lg dark:text-[#F2F2F2] text-gray-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveCartItem && onRemoveCartItem(item.cartItemId)}
                          className="dark:text-[#868686] text-gray-500 hover:text-red-600 p-1.5 transition-colors"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form & Totals Box */}
              <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-[#262626] border-gray-200">
                  <div className="w-full sm:w-auto">
                    <p className="font-bold text-xs uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Apply Promotional Coupon</p>
                    {cartActiveCoupon ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 font-bold flex items-center gap-2">
                        <span>✓ Coupon "{cartActiveCoupon.code}" Active ({cartActiveCoupon.type === 'flat' ? `₹${cartActiveCoupon.amount} OFF` : `${cartActiveCoupon.amount}% OFF`})</span>
                        <button onClick={() => setCartActiveCoupon(null)} className="text-red-600 text-[10px] uppercase font-black underline">Remove</button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCartCoupon} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon code (e.g. EDGEX10)"
                          value={cartCoupon}
                          onChange={(e) => setCartCoupon(e.target.value)}
                          className="px-3 py-1.5 text-xs border dark:border-[#262626] border-gray-200 rounded outline-none font-bold uppercase tracking-wider"
                        />
                        <button type="submit" className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-4 py-1.5 text-xs font-bold uppercase rounded">Apply</button>
                      </form>
                    )}
                    {cartCouponError && <p className="text-[11px] text-red-600 font-semibold mt-1">{cartCouponError}</p>}
                  </div>

                  <div className="space-y-1 text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 dark:border-[#262626] border-gray-200">
                    <p className="text-xs dark:text-[#868686] text-gray-500">Subtotal: <strong className="dark:text-[#F2F2F2] text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</strong></p>
                    {cartDiscount > 0 && <p className="text-xs text-emerald-700 font-bold">Coupon Discount: -₹{cartDiscount.toLocaleString('en-IN')}</p>}
                    <p className="text-xs dark:text-[#868686] text-gray-500">Express Shipping: <strong className="text-emerald-700">{cartShipping === 0 ? 'FREE' : `₹${cartShipping.toLocaleString('en-IN')}`}</strong></p>
                    <p className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Grand Total: <span className="text-[#D10000]">₹{cartGrandTotal.toLocaleString('en-IN')}</span></p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={onShopClick} className="dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 px-5 py-3 text-xs font-bold uppercase rounded dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200">
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      if (onProceedToCheckout) onProceedToCheckout();
                      else alert('Proceeding to Checkout...');
                    }}
                    className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-8 py-3 text-xs font-bold uppercase tracking-widest rounded hover:bg-[#8a0000] shadow-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span>Proceed to Secure Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. WISHLIST */}
      {activeSubTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Saved Wishlist Silhouettes</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Saved sneakers, real-time availability status, current prices, and instant transfer to cart.</p>
            </div>
            <span className="text-xs font-bold dark:text-[#F2F2F2] text-gray-900 bg-blue-50 px-3 py-1 border border-blue-200 rounded-full">
              {wishlist.length} Saved Items
            </span>
          </div>

          {wishlist.length === 0 ? (
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
              <div className="w-16 h-16 rounded-full dark:bg-[#1a1a1a] bg-gray-50 flex items-center justify-center mx-auto border dark:border-[#262626] border-gray-200">
                <span className="material-symbols-outlined text-3xl dark:text-[#868686] text-gray-500">favorite</span>
              </div>
              <p className="font-bold text-base dark:text-[#F2F2F2] text-gray-900">Your wishlist is currently empty.</p>
              <p className="text-xs dark:text-[#868686] text-gray-500">Save your favorite drops to monitor stock availability and price updates.</p>
              <button onClick={onShopClick} className="mt-2 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#8a0000] transition-colors">Browse Drop Catalog</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const p = item.product;
                const stock = p.stockCount !== undefined ? p.stockCount : 10;
                const isOutOfStock = !p.inStock || stock <= 0;
                const isLowStock = stock > 0 && stock <= 3;
                const listPrice = Math.round(p.price * 1.18);
                const discountPct = p.discountPercent || 15;

                return (
                  <div key={item.id} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs relative group">
                    <div>
                      {/* Availability Badge */}
                      <div className="w-full h-48 dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 rounded-lg flex items-center justify-center p-4 mb-3 relative overflow-hidden">
                        <span className={`absolute top-2 right-2 px-2.5 py-0.5 text-[9px] font-black uppercase rounded border ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? `LOW STOCK (${stock} LEFT)` : `IN STOCK (${stock} READY)`}
                        </span>

                        <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                      </div>

                      <span className="text-[10px] font-bold dark:text-[#868686] text-gray-500 uppercase tracking-wider">{p.category} • SKU: EX-{p.id.toUpperCase()}</span>
                      <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900 mt-0.5 leading-tight">{p.name}</h4>

                      {/* Current Price vs Original Price */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-base font-black text-[#D10000]">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="text-xs dark:text-[#868686] text-gray-500 line-through font-semibold">₹{listPrice.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">-{discountPct}% OFF</span>
                      </div>

                      {/* Real-time availability indicator text */}
                      <div className="mt-2 text-xs font-semibold">
                        {isOutOfStock ? (
                          <span className="text-red-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                            <span>Currently Sold Out</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="text-amber-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-600 inline-block animate-ping"></span>
                            <span>Hurry, only {stock} units remaining in warehouse</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                            <span>In Stock — Express Shipment Available</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Remove & Move to Cart */}
                    <div className="flex gap-2 pt-3 border-t dark:border-[#262626] border-gray-200">
                      <button
                        type="button"
                        onClick={() => onRemoveWishlist(item.id)}
                        className="w-1/3 dark:bg-[#1a1a1a] bg-gray-50 text-[#ba1a1a] hover:bg-red-50 border dark:border-[#262626] border-gray-200 py-2.5 text-xs font-bold uppercase rounded tracking-wider transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart(p, p.sizes?.[0] || 'US 9', 1, p.colorway);
                          }
                          onRemoveWishlist(item.id);
                          alert(`Moved "${p.name}" to your shopping bag!`);
                        }}
                        className={`w-2/3 dark:text-[#F2F2F2] text-gray-900 py-2.5 text-xs font-bold uppercase rounded tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                          isOutOfStock
                            ? 'dark:bg-[#1a1a1a] bg-gray-50 cursor-not-allowed dark:text-[#868686] text-gray-500'
                            : 'bg-[#D10000] hover:bg-[#8a0000]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">shopping_bag</span>
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. PAYMENTS */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Payment Methods</h3>
            <button onClick={() => alert('Add card modal.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2.5">+ Add Card</button>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-3xl dark:text-[#F2F2F2] text-gray-900">credit_card</span>
                <div>
                  <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">Mastercard ending in 4242</p>
                  <p className="text-xs dark:text-[#868686] text-gray-500">Expires 08/28 • Default Express Checkout</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 uppercase">Default</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. ADDRESSES */}
      {activeSubTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Shipping Addresses</h3>
            <button onClick={openAddAddressModal} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2.5">+ Add Address</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedAddresses.map((address) => (
              <div key={address.id} className={`dark:bg-[#0D0D0D] bg-white p-6 space-y-3 ${address.isDefault ? 'border-2 border-[#D10000]' : 'border dark:border-[#262626] border-gray-200'}`}>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${address.isDefault ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900' : 'dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900'}`}>
                    {address.type === 'shipping' ? 'Shipping' : 'Billing'}{address.isDefault ? ' (Default)' : ''}
                  </span>
                  <button onClick={() => openEditAddressModal(address)} className="text-xs font-bold text-[#D10000] hover:underline">
                    Edit
                  </button>
                </div>
                <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">{address.fullName}</p>
                <p className="text-xs dark:text-[#868686] text-gray-500">{address.street}{address.apartment ? `<br />${address.apartment}` : ''}<br />{address.city}, {address.state} {address.zip}<br />{address.country}</p>
                {address.isDefault && (
                  <span className="text-[10px] font-bold uppercase bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-2 py-0.5 inline-block mt-2">
                    Default {address.type === 'shipping' ? 'Shipping' : 'Billing'}
                  </span>
                )}
                <div className="flex gap-2 pt-2 border-t dark:border-[#262626] border-gray-200 flex-wrap">
                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => {
                        setSavedAddresses((prev) => {
                          const updated = { ...address, isDefault: true };
                          const rest = prev.filter((a) => a.id !== address.id).map((a) => ({ ...a, isDefault: false }));
                          return [updated, ...rest];
                        });
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-[#D10000] border border-[#D10000]/40 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => openEditAddressModal(address)} className="flex-1 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 py-2 text-xs font-bold uppercase rounded-lg tracking-wider border dark:border-[#262626] border-gray-200 hover:border-neutral-400 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => {
                    if (address.isDefault && savedAddresses.length > 1) {
                      alert('Cannot delete default address. Please set another address as default first.');
                      return;
                    }
                    if (confirm('Delete this address?')) {
                      setSavedAddresses(prev => prev.filter(a => a.id !== address.id));
                    }
                  }} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg tracking-wider transition-all ${address.isDefault && savedAddresses.length > 1 ? 'dark:bg-[#1a1a1a] bg-gray-50 cursor-not-allowed dark:text-[#868686] text-gray-500' : 'bg-red-600 hover:bg-red-700 dark:text-[#F2F2F2] text-white'}`}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. RETURNS */}
      {activeSubTab === 'returns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Returns & Exchanges Workflow</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Request eligible order returns with reason & details, track pickup & return status.</p>
            </div>
            <span className="text-xs font-extrabold text-[#D10000] bg-blue-50 px-3 py-1 border border-blue-200 rounded">
              30-Day Risk-Free Returns Active
            </span>
          </div>

          <div className="space-y-6">
            {/* Active Return Requests & History */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider">Your Return Requests & Status</h4>
              {orders.filter((o) => o.returnRequested || o.status === 'Return Requested' || o.status === 'Returned' || o.status === 'Refund Initiated' || o.status === 'Refunded').length === 0 ? (
                <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-6 text-xs dark:text-[#868686] text-gray-500">
                  No active return requests. You can request a return on any delivered order below.
                </div>
              ) : (
                orders
                  .filter((o) => o.returnRequested || o.status === 'Return Requested' || o.status === 'Returned' || o.status === 'Refund Initiated' || o.status === 'Refunded')
                  .map((o) => (
                    <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-6 space-y-3 shadow-xs">
                      <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
                        <div>
                          <span className="font-extrabold text-sm text-[#D10000]">Order ID: {o.orderId}</span>
                          <p className="text-xs dark:text-[#868686] text-gray-500">Placed on {o.date} • Total: ₹{o.total.toLocaleString('en-IN')}</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 rounded">
                          Return Status: {o.status}
                        </span>
                      </div>
                      <div className="dark:bg-[#1a1a1a] bg-gray-50 p-3.5 rounded-lg border dark:border-[#262626] border-gray-200 text-xs space-y-1">
                        <p className="dark:text-[#F2F2F2] text-gray-900"><strong>Reason / Details:</strong> {o.returnReason || 'Wrong Size / Fit Adjustment'}</p>
                        <p className="dark:text-[#868686] text-gray-500"><strong>Refund Status:</strong> {o.refundStatus || `Initiated (₹${o.total.toLocaleString('en-IN')})`}</p>
                        <p className="dark:text-[#868686] text-gray-500"><strong>Pickup Courier:</strong> FedEx Express Pickup (Ref: EX-RET-{o.orderId})</p>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Eligible Orders for Return */}
            <div className="pt-6 border-t dark:border-[#262626] border-gray-200 space-y-4">
              <h4 className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider">Eligible Orders for Return</h4>
              <div className="space-y-4">
                {orders.map((o) => {
                  const isReturned = o.returnRequested || o.status === 'Returned' || o.status === 'Refunded' || o.status === 'Return Requested';
                  return (
                    <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900">{o.orderId}</span>
                          <span className="text-xs dark:text-[#868686] text-gray-500">• {o.date}</span>
                        </div>
                        <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">Payment: {o.paymentMethod} • Total: ₹{o.total.toLocaleString('en-IN')}</p>
                        <p className="text-xs font-semibold text-[#D10000] mt-1">Status: {o.status}</p>
                      </div>

                      <div>
                        {isReturned ? (
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 border border-amber-200 rounded">
                            Return Processed
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt(`Enter return reason / details for Order ${o.orderId}:`, 'Wrong Size / Fit Adjustment');
                              if (reason) {
                                onRequestReturn(o.orderId, reason);
                                alert(`Return request for Order ${o.orderId} submitted! Pickup label generated.`);
                              }
                            }}
                            className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-extrabold uppercase px-5 py-2.5 rounded hover:bg-[#8a0000] transition-colors flex items-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">assignment_return</span>
                            <span>Request Return</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. REFUNDS */}
      {activeSubTab === 'refunds' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Refund Status & Transaction Ledger</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Itemized record of initiated and completed refunds, credited amounts, and original payment methods.</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200 rounded">
              {orders.filter((o) => o.refundStatus || o.status === 'Refunded' || o.status === 'Refund Initiated' || o.returnRequested).length} Refund Record(s)
            </span>
          </div>

          <div className="space-y-4">
            {orders.filter((o) => o.refundStatus || o.status === 'Refunded' || o.status === 'Refund Initiated' || o.returnRequested).length === 0 ? (
              <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-8 text-center text-xs dark:text-[#868686] text-gray-500">
                No refund history found. When a return is approved or refund initiated, details will appear here.
              </div>
            ) : (
              orders
                .filter((o) => o.refundStatus || o.status === 'Refunded' || o.status === 'Refund Initiated' || o.returnRequested)
                .map((o) => (
                  <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-6 md:p-8 space-y-4 shadow-xs">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-3">
                      <div>
                        <span className="font-extrabold text-base text-[#D10000]">Related Order: {o.orderId}</span>
                        <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">Date: {o.date} • Method: {o.paymentMethod}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                          {o.refundStatus || `Refund Initiated (₹${o.total.toLocaleString('en-IN')})`}
                        </span>
                        <span className="font-black text-xl dark:text-[#F2F2F2] text-gray-900">₹{o.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 rounded-lg border dark:border-[#262626] border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-xs">
                      <div>
                        <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900">Return Reason: {o.returnReason || 'Fit / Size Adjustment'}</p>
                        <p className="dark:text-[#868686] text-gray-500">Credited back to original payment channel: {o.paymentMethod}</p>
                      </div>
                      <span className="font-extrabold text-[#D10000] dark:bg-[#0D0D0D] bg-white px-3 py-1 border dark:border-[#262626] border-gray-200 rounded">
                        Ref: TXN-REF-{o.orderId}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 11. REVIEWS & RATINGS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Product Reviews & Ratings</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Manage your written reviews, star ratings, and review pending silhouettes.</p>
            </div>
            <button
              onClick={() => {
                setReviewProductName('Apex Vol. 1 - Carbon Black');
                setIsWritingReview(true);
              }}
              className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-5 py-2.5 hover:bg-[#8a0000]"
            >
              + Write Review
            </button>
          </div>

          {/* Reviewed Products */}
          <div className="space-y-4">
            <h4 className="font-black text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider">Reviewed Products ({reviews.length})</h4>
            {reviews.length === 0 ? (
              <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-8 text-center text-xs dark:text-[#868686] text-gray-500">
                No reviews submitted yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-black text-base dark:text-[#F2F2F2] text-gray-900">{r.productName}</h5>
                        <p className="text-xs dark:text-[#868686] text-gray-500">Reviewed on {r.date} • Verified Owner</p>
                      </div>
                      <button
                        onClick={() => {
                          setReviewProductName(r.productName);
                          setComment(r.comment);
                          setRating(r.rating);
                          setIsWritingReview(true);
                        }}
                        className="text-xs font-bold text-[#D10000] hover:underline bg-blue-50 px-3 py-1 border border-blue-200"
                      >
                        Edit Review
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-sm font-variation-settings-fill">star</span>
                      ))}
                      <span className="text-xs dark:text-[#F2F2F2] text-gray-900 font-bold ml-2">{r.rating}.0 / 5.0 Stars</span>
                    </div>
                    <p className="text-xs text-[#45464f] dark:bg-[#1a1a1a] bg-gray-50 p-3 border dark:border-[#262626] border-gray-200 font-medium">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products Awaiting Review */}
          <div className="pt-6 border-t dark:border-[#262626] border-gray-200 space-y-4">
            <h4 className="font-black text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider">Products Awaiting Review (1)</h4>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 flex items-center justify-center p-1">
                  <span className="material-symbols-outlined text-2xl dark:text-[#F2F2F2] text-gray-900">checkroom</span>
                </div>
                <div>
                  <h5 className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">Concrete V-2 - Obsidian Grey</h5>
                  <p className="text-xs dark:text-[#868686] text-gray-500">Delivered on August 2, 2026 • Share your experience to earn VIP reward points.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setReviewProductName('Concrete V-2 - Obsidian Grey');
                  setRating(5);
                  setComment('');
                  setIsWritingReview(true);
                }}
                className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000]"
              >
                Write Review Now
              </button>
            </div>
          </div>

          {isWritingReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
              <form onSubmit={handleReviewSubmit} className="dark:bg-[#0D0D0D] bg-white w-full max-w-md p-6 border dark:border-[#262626] border-gray-200 space-y-4 text-xs">
                <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">Submit or Edit Review</h3>
                <div>
                  <label className="block font-bold uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    value={reviewProductName}
                    onChange={(e) => setReviewProductName(e.target.value)}
                    className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Star Rating</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars - Masterpiece</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars - Exceptional</option>
                    <option value={3}>⭐⭐⭐ 3 Stars - Good</option>
                    <option value={2}>⭐⭐ 2 Stars - Fair</option>
                    <option value={1}>⭐ 1 Star - Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Written Review</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white"
                    placeholder="Describe comfort, fit, and build quality..."
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsWritingReview(false)} className="w-1/2 dark:bg-[#1a1a1a] bg-gray-50 py-3 font-bold uppercase">Cancel</button>
                  <button type="submit" className="w-1/2 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 font-bold uppercase">Save Review</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 12. RECENTLY VIEWED */}
      {activeSubTab === 'recently-viewed' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Recently Viewed Silhouettes</h3>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-[#262626] border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 dark:bg-[#1a1a1a] bg-gray-50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">Apex Vol. 1 - Carbon Black</p>
                  <p className="text-xs dark:text-[#868686] text-gray-500">Viewed today at 2:14 PM</p>
                </div>
              </div>
              <button onClick={onShopClick} className="text-xs font-bold text-[#D10000] hover:underline">View Again</button>
            </div>
          </div>
        </div>
      )}

      {/* 13. SAVED PRODUCTS */}
      {activeSubTab === 'saved-products' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Saved Products & Collections</h3>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-8 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl dark:text-[#868686] text-gray-500">bookmark</span>
            <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">Your saved drop collections are synchronized with Wishlist.</p>
            <button onClick={() => setActiveSubTab('wishlist')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-6 py-3">
              View Wishlist Silhouettes
            </button>
          </div>
        </div>
      )}

      {/* 14. NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Notifications & Drop Alerts</h3>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 border ${n.read ? 'dark:bg-[#0D0D0D] bg-white dark:border-[#262626] border-gray-200' : 'bg-blue-50/50 border-blue-200'} flex justify-between items-start`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs dark:text-[#F2F2F2] text-gray-900">{n.title}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#D10000]"></span>}
                  </div>
                  <p className="text-xs text-[#45464f]">{n.message}</p>
                  <p className="text-[10px] dark:text-[#868686] text-gray-500">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 15. OFFERS & COUPONS */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Available Offers & Coupons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark:bg-[#0D0D0D] bg-white border-2 border-dashed border-[#D10000] p-6 space-y-3">
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5">VIP Drop Perk</span>
              <h4 className="font-black text-lg dark:text-[#F2F2F2] text-gray-900">15% OFF Next Concrete Edit Release</h4>
              <p className="text-xs dark:text-[#868686] text-gray-500">Use code <span className="font-bold dark:text-[#F2F2F2] text-gray-900">EDGEX15</span> at checkout.</p>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border-2 border-dashed border-[#D10000] p-6 space-y-3">
              <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5">Free Express Shipping</span>
              <h4 className="font-black text-lg dark:text-[#F2F2F2] text-gray-900">Complimentary Air Delivery Worldwide</h4>
              <p className="text-xs dark:text-[#868686] text-gray-500">Applied automatically on orders over $200.</p>
            </div>
          </div>
        </div>
      )}

      {/* 16. SUPPORT */}
      {activeSubTab === 'support' && (
        <div className="space-y-6">
          <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Customer Concierge & Support</h3>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-8 space-y-4 text-xs">
            <p className="text-[#45464f]">
              Need assistance with your sizing, order shipment, or custom drop inquiries? Our concierge team is on standby 24/7.
            </p>
            <div className="flex gap-3">
              <button onClick={() => alert('Live Concierge chat initiated.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-6 py-3 font-bold uppercase">
                Start Live Chat
              </button>
              <button onClick={() => alert('Support ticket created.')} className="dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 px-6 py-3 font-bold uppercase">
                Submit Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 17. ACCOUNT SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-8 space-y-6 text-xs">
          <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Account & Security Settings</h3>
          <div className="space-y-4 max-w-xl">
            <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
              <div>
                <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">Two-Factor Authentication</p>
                <p className="dark:text-[#868686] text-gray-500">Protect your account and limited drop access</p>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200">Enabled</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
              <div>
                <p className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">Marketing & Drop SMS Alerts</p>
                <p className="dark:text-[#868686] text-gray-500">Receive instant SMS notifications when limited editions launch</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#000f3f]" />
            </div>
            <button onClick={() => alert('Settings saved.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-6 py-3 font-bold uppercase tracking-widest">
              Save Preferences
            </button>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>

      {/* Add/Edit Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleAddressSubmit} className="dark:bg-[#0D0D0D] bg-white w-full max-w-md p-6 border dark:border-[#262626] border-gray-200 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
              <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button type="button" onClick={() => { setShowAddressModal(false); setEditingAddress(null); }} className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">Full Name</label>
                  <input type="text" value={addressForm.full_name} onChange={(e) => setAddressForm({...addressForm, full_name: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">Phone</label>
                  <input type="text" value={addressForm.phone} onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">Street Address</label>
                <input type="text" value={addressForm.street} onChange={(e) => setAddressForm({...addressForm, street: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">Apartment, Suite, etc. (Optional)</label>
                <input type="text" value={addressForm.apartment} onChange={(e) => setAddressForm({...addressForm, apartment: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">City</label>
                  <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">State</label>
                  <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({...addressForm, state: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" required />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">ZIP</label>
                  <input type="text" value={addressForm.zip} onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">Country</label>
                  <select value={addressForm.country} onChange={(e) => setAddressForm({...addressForm, country: e.target.value})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold">
                    <option value="USA">United States</option>
                    <option value="CAN">Canada</option>
                    <option value="GBR">United Kingdom</option>
                    <option value="AUS">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase dark:text-[#868686] text-gray-500 mb-1">Type</label>
                  <select value={addressForm.type} onChange={(e) => setAddressForm({...addressForm, type: e.target.value as 'shipping' | 'billing'})} className="w-full p-2.5 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold">
                    <option value="shipping">Shipping</option>
                    <option value="billing">Billing</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_default" checked={addressForm.is_default} onChange={(e) => setAddressForm({...addressForm, is_default: e.target.checked})} className="w-4 h-4 accent-[#000f3f]" />
                <label htmlFor="is_default" className="text-xs font-bold uppercase dark:text-[#F2F2F2] text-gray-900">Set as default {addressForm.type} address</label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { setShowAddressModal(false); setEditingAddress(null); }} className="w-1/2 dark:bg-[#1a1a1a] bg-gray-50 py-3 font-bold uppercase">Cancel</button>
              <button type="submit" className="w-1/2 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 font-bold uppercase">{editingAddress ? 'Update' : 'Save Address'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox Zoom Modal for Ordered Sneaker Images */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="dark:bg-[#151515] bg-white rounded-3xl p-6 max-w-xl w-full border dark:border-neutral-700 border-gray-200 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-neutral-800 border-gray-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-500 block">Ordered Sneaker Preview</span>
                <h4 className="font-black text-base dark:text-white text-gray-900">{previewImage.title}</h4>
              </div>
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full dark:bg-neutral-800 bg-gray-100 flex items-center justify-center dark:text-white text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-80 bg-white rounded-2xl p-6 flex items-center justify-center border border-gray-200 dark:border-neutral-800 shadow-inner">
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300" 
              />
            </div>
            <div className="flex items-center justify-between text-xs dark:text-neutral-400 text-gray-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>100% Authentic Drop Guarantee</span>
              </span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-[#D10000] text-white rounded-xl font-bold uppercase text-xs hover:bg-[#a80000] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

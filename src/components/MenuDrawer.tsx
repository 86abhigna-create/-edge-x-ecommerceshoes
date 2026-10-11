import React from 'react';
import { ActiveTab } from '../types';
import { CATEGORIES } from '../data/products';
import { LanguageSelector } from './LanguageSelector';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCategory?: string;
  onSelectCategory: (cat: string) => void;
  onOpenAuthModal: () => void;
  userRole: 'customer' | 'owner' | 'guest';
  onLogout: () => void;
  wishlistCount?: number;
  cartCount?: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  selectedCategory,
  onSelectCategory,
  onOpenAuthModal,
  userRole,
  onLogout,
  wishlistCount = 0,
  cartCount = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
}) => {
  if (!isOpen) return null;

  const navigateToCategory = (cat: string) => {
    setActiveTab('shop');
    onSelectCategory(cat);
    onClose();
    // Smooth scroll down to products section if available
    setTimeout(() => {
      const el = document.getElementById('featured-drops');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Menu Drawer container */}
      <aside
        aria-label="Side Navigation Menu"
        className="relative w-84 max-w-[88vw] dark:bg-[#0D0D0D] bg-white h-full shadow-2xl flex flex-col z-10 border-r dark:border-[#262626] border-gray-200 overflow-y-auto animate-in slide-in-from-left duration-300 ease-out"
      >
        {/* Header inside Side Menu */}
        <div className="p-5 border-b dark:border-[#262626] border-gray-200 flex items-center justify-between sticky top-0 dark:bg-[#0D0D0D]/95 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#D10000] text-2xl" translate="no">
              menu_open
            </span>
            <div>
              <span className="text-xl font-['Bebas_Neue',sans-serif] tracking-wide dark:text-[#F2F2F2] text-gray-900 leading-none">
                EDGEX MENU
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#D10000]">
                Side Navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-xl dark:bg-[#1a1a1a] bg-gray-100 dark:text-gray-300 text-gray-700 hover:text-white hover:bg-[#D10000] dark:hover:bg-[#D10000] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none" translate="no">
              close
            </span>
          </button>
        </div>

        {/* Side Menu Body */}
        <div className="p-5 flex flex-col gap-6 flex-grow">
          {/* 1. Quick Shopping & Cart / Orders / Wishlist Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500">
                Shop & Activity
              </p>
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#D10000]">
                Quick Access
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {/* Add to Cart / Bag button */}
              <button
                type="button"
                onClick={() => {
                  onOpenCart();
                  onClose();
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-bold flex items-center justify-between transition-all min-h-[46px] cursor-pointer ${
                  activeTab === 'cart'
                    ? 'bg-[#D10000] text-white shadow-md'
                    : 'dark:bg-[#151515] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border dark:border-[#262626] border-gray-200 hover:border-[#D10000] hover:text-[#D10000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      activeTab === 'cart' ? 'text-white' : 'text-[#D10000]'
                    }`}
                    translate="no"
                  >
                    shopping_bag
                  </span>
                  <div className="leading-tight">
                    <span className="text-xs uppercase tracking-wider block">Add to Cart / Bag</span>
                    <span className="text-[10px] opacity-75 font-medium">View items & instant checkout</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cartCount > 0 && (
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        activeTab === 'cart' ? 'bg-white text-[#D10000]' : 'bg-[#D10000] text-white'
                      }`}
                    >
                      {cartCount}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-sm opacity-60">chevron_right</span>
                </div>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  onOpenWishlist();
                  onClose();
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-bold flex items-center justify-between transition-all min-h-[46px] cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-[#D10000] text-white shadow-md'
                    : 'dark:bg-[#151515] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border dark:border-[#262626] border-gray-200 hover:border-[#D10000] hover:text-[#D10000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      activeTab === 'wishlist' ? 'text-white' : 'text-red-500'
                    }`}
                    translate="no"
                  >
                    favorite
                  </span>
                  <div className="leading-tight">
                    <span className="text-xs uppercase tracking-wider block">Wishlist</span>
                    <span className="text-[10px] opacity-75 font-medium">Saved favourite pairs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {wishlistCount > 0 && (
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        activeTab === 'wishlist' ? 'bg-white text-[#D10000]' : 'bg-red-500 text-white'
                      }`}
                    >
                      {wishlistCount}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-sm opacity-60">chevron_right</span>
                </div>
              </button>

              {/* Orders Button */}
              <button
                type="button"
                onClick={() => {
                  onOpenOrders();
                  onClose();
                }}
                className={`w-full text-left px-3.5 py-3 rounded-xl font-bold flex items-center justify-between transition-all min-h-[46px] cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#D10000] text-white shadow-md'
                    : 'dark:bg-[#151515] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border dark:border-[#262626] border-gray-200 hover:border-[#D10000] hover:text-[#D10000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-xl ${
                      activeTab === 'orders' ? 'text-white' : 'text-indigo-500'
                    }`}
                    translate="no"
                  >
                    package_2
                  </span>
                  <div className="leading-tight">
                    <span className="text-xs uppercase tracking-wider block">Orders</span>
                    <span className="text-[10px] opacity-75 font-medium">Tracking, history & invoices</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm opacity-60">chevron_right</span>
              </button>
            </div>
          </div>

          {/* 2. Featured Drops & Highlights: New Arrivals, Best Sellers, etc. */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-2.5">
              Collections & Curations
            </p>
            <div className="flex flex-col gap-1.5">
              {/* All Shoes / Catalog */}
              <button
                type="button"
                onClick={() => navigateToCategory('All Shoes')}
                className={`text-left px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'All Shoes'
                    ? 'bg-neutral-800 text-white border-l-4 border-l-[#D10000]'
                    : 'dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-[#D10000]" translate="no">
                    storefront
                  </span>
                  <span>All Footwear Collection</span>
                </div>
                <span className="text-[10px] text-neutral-400 uppercase">Explore</span>
              </button>

              {/* New Arrivals */}
              <button
                type="button"
                onClick={() => navigateToCategory('New Arrivals')}
                className={`text-left px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'New Arrivals'
                    ? 'bg-neutral-800 text-white border-l-4 border-l-emerald-500'
                    : 'dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-emerald-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-emerald-500" translate="no">
                    fiber_new
                  </span>
                  <span>New Arrivals</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Fresh
                </span>
              </button>

              {/* Best Sellers */}
              <button
                type="button"
                onClick={() => navigateToCategory('Best Sellers')}
                className={`text-left px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'Best Sellers'
                    ? 'bg-neutral-800 text-white border-l-4 border-l-amber-500'
                    : 'dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-amber-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-amber-500" translate="no">
                    trending_up
                  </span>
                  <span>Best Sellers</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                  Hot
                </span>
              </button>

              {/* Streetwear */}
              <button
                type="button"
                onClick={() => navigateToCategory('Streetwear')}
                className={`text-left px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'Streetwear'
                    ? 'bg-neutral-800 text-white border-l-4 border-l-indigo-500'
                    : 'dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-indigo-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-indigo-400" translate="no">
                    style
                  </span>
                  <span>Streetwear Sneakers</span>
                </div>
                <span className="text-[10px] text-neutral-400 uppercase">Urban</span>
              </button>

              {/* Sale Drops */}
              <button
                type="button"
                onClick={() => navigateToCategory('Sale')}
                className={`text-left px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-between text-xs transition-colors cursor-pointer ${
                  activeTab === 'shop' && selectedCategory === 'Sale'
                    ? 'bg-neutral-800 text-white border-l-4 border-l-[#D10000]'
                    : 'text-[#D10000] dark:hover:bg-[#1a1a1a] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-base text-[#D10000]" translate="no">
                    local_offer
                  </span>
                  <span>Sale Drops & Discounts</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600/20 text-red-500">
                  Discount
                </span>
              </button>
            </div>
          </div>

          {/* 3. Browse By Silhouette Categories */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-2.5">
              Silhouettes & Styles
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'High-Top Shoes', icon: 'height' },
                { name: 'Low-Top Shoes', icon: 'vertical_align_bottom' },
                { name: 'Casual Shoes', icon: 'hiking' },
                { name: 'Fashion Shoes', icon: 'diamond' },
                { name: 'Sports-Inspired Shoes', icon: 'sprint' },
                { name: 'Limited-Edition Shoes', icon: 'stars' },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigateToCategory(item.name)}
                  className={`text-left p-2.5 rounded-xl font-semibold text-[11px] flex items-center gap-2 transition-all border cursor-pointer ${
                    activeTab === 'shop' && selectedCategory === item.name
                      ? 'bg-[#D10000] text-white border-[#D10000]'
                      : 'dark:bg-[#121212] bg-gray-50 dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-[#D10000] hover:text-[#D10000]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm shrink-0" translate="no">
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name.replace(' Shoes', '')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Language & Currency Selector */}
          <div className="pt-4 border-t dark:border-[#262626] border-gray-200">
            <p className="text-[11px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-2.5">
              Language & Region
            </p>
            <LanguageSelector />
          </div>

          {/* 5. User Account & Preferences */}
          <div className="pt-4 border-t dark:border-[#262626] border-gray-200">
            <p className="text-[11px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-2.5">
              Account & Profile
            </p>

            {userRole === 'guest' ? (
              <div className="p-3.5 rounded-xl dark:bg-neutral-900 bg-neutral-100 border dark:border-neutral-800 border-neutral-200 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold dark:text-white text-gray-900">Guest Access</p>
                  <p className="text-[11px] dark:text-neutral-400 text-gray-600">
                    Sign in to book & reserve pairs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-[#D10000] hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span>Sign In</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {userRole === 'owner' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('owner-dashboard');
                      onClose();
                    }}
                    className="text-left px-3.5 py-2.5 rounded-xl font-bold text-emerald-400 dark:bg-emerald-950/30 bg-emerald-50 border border-emerald-800 hover:bg-emerald-900/40 flex items-center justify-between text-xs min-h-[44px] cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-lg text-emerald-500" translate="no">
                        admin_panel_settings
                      </span>
                      <span>Owner Dashboard</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold bg-emerald-800 text-white px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('customer-dashboard');
                    onClose();
                  }}
                  className="text-left px-3.5 py-2.5 rounded-xl font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-2.5 text-xs min-h-[42px] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-[#D10000]" translate="no">
                    person
                  </span>
                  <span>Your Profile & Saved Addresses</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="text-left px-3.5 py-2.5 rounded-xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 text-xs min-h-[42px] cursor-pointer mt-1"
                >
                  <span className="material-symbols-outlined text-lg" translate="no">
                    logout
                  </span>
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info inside menu */}
        <div className="p-5 border-t dark:border-[#262626] border-gray-200 text-xs dark:text-[#868686] text-gray-500 bg-neutral-50 dark:bg-neutral-950/50">
          <p className="font-bold text-gray-900 dark:text-gray-300">© 2026 EDGEX Footwear</p>
          <p className="text-[11px] mt-0.5">Architectural Aesthetics • Premium Craft</p>
        </div>
      </aside>
    </div>
  );
};

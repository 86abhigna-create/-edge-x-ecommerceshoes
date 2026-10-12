import React from 'react';
import { ActiveTab } from '../types';

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

interface MenuItem {
  label: string;
  categoryValue: string;
  tag?: string;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  onOpenAuthModal,
  userRole,
  onLogout,
  setActiveTab,
}) => {
  if (!isOpen) return null;

  const menuItems: MenuItem[] = [
    { label: 'All Collection', categoryValue: 'All Shoes' },
    { label: 'T-Shirts', categoryValue: 'T-Shirts' },
    { label: 'Shoes', categoryValue: 'Shoes' },
    { label: 'Sales & Offers', categoryValue: 'Sales and Offer', tag: 'Sale' },
    { label: 'New Arrivals', categoryValue: 'New Arrivals', tag: 'New' },
    { label: 'Best Sellers', categoryValue: 'Best Sellers', tag: 'Hot' },
  ];

  const handleSelect = (categoryValue: string) => {
    setActiveTab('shop');
    onSelectCategory(categoryValue);
    onClose();
    setTimeout(() => {
      const el = document.getElementById('featured-drops');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Menu Drawer container */}
      <aside
        aria-label="Side Navigation Menu"
        className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 border-r border-gray-100 overflow-y-auto animate-in slide-in-from-left duration-300 ease-out"
      >
        {/* Minimal Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span
              className="text-2xl font-['Bebas_Neue',sans-serif] tracking-widest text-gray-900 leading-none select-none"
              style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            >
              EDGEX
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none" translate="no">
              close
            </span>
          </button>
        </div>

        {/* Clean Editorial Navigation Links - No boxes */}
        <div className="px-6 py-8 flex flex-col flex-grow justify-between">
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const isActive =
                selectedCategory === item.categoryValue ||
                (item.categoryValue === 'All Shoes' && selectedCategory === 'All Shoes');

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelect(item.categoryValue)}
                  className="group w-full py-3.5 flex items-center justify-between text-left text-sm transition-all cursor-pointer border-b border-gray-100 last:border-b-0 hover:pl-1.5"
                >
                  <span
                    className={`font-semibold tracking-wide transition-colors ${
                      isActive
                        ? 'text-[#D10000] font-bold'
                        : 'text-gray-800 group-hover:text-[#D10000]'
                    }`}
                  >
                    {item.label}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.tag && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#D10000]">
                        {item.tag}
                      </span>
                    )}
                    <span className="material-symbols-outlined text-base text-gray-300 group-hover:text-[#D10000] group-hover:translate-x-0.5 transition-all">
                      arrow_forward
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Last item: Sign In / Register in red oval shape at the end of the menu */}
            <div className="pt-6 mt-2">
              {userRole === 'guest' ? (
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal();
                    onClose();
                  }}
                  className="w-full py-3 px-6 rounded-full bg-[#D10000] hover:bg-[#a80000] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Sign In / Register</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab(userRole === 'owner' ? 'owner-dashboard' : 'customer-dashboard');
                      onClose();
                    }}
                    className="w-full py-3 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">account_circle</span>
                    <span>Account Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 px-6 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </div>
  );
};

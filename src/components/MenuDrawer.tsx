import React from 'react';
import { ActiveTab } from '../types';
import { CATEGORIES } from '../data/products';
import { LanguageSelector } from './LanguageSelector';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCategory: (cat: string) => void;
  onOpenAuthModal: () => void;
  userRole: 'customer' | 'owner' | 'guest';
  onLogout: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  setActiveTab,
  onSelectCategory,
  onOpenAuthModal,
  userRole,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 dark:bg-[#F2F2F2] bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      {/* Drawer content */}
      <div className="relative w-80 dark:bg-[#0D0D0D] bg-white h-full shadow-2xl flex flex-col z-10 p-6 border-r dark:border-[#262626] border-gray-200 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Bebas_Neue',sans-serif] tracking-normal dark:text-[#F2F2F2] text-gray-900">EDGEX NAVIGATION</h2>
          <button onClick={onClose} className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 flex-grow">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-3">Main Navigation</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('All Shoes');
                  onClose();
                }}
                className="text-left py-2 font-semibold dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">home</span> Home (Catalog)
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('New Arrivals');
                  onClose();
                }}
                className="text-left py-2 font-semibold dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">fiber_new</span> New Arrivals
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('Streetwear');
                  onClose();
                }}
                className="text-left py-2 font-semibold dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">style</span> Streetwear
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('Best Sellers');
                  onClose();
                }}
                className="text-left py-2 font-semibold dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">trending_up</span> Best Sellers
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('Sale');
                  onClose();
                }}
                className="text-left py-2 font-bold text-[#D10000] hover:text-red-500 flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">local_offer</span> Sale
              </button>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-[#262626] border-gray-200">
            <p className="text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-3">Language & Region</p>
            <div className="mb-4">
              <LanguageSelector />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-3">Account</p>
            <div className="flex flex-col gap-2">
              {userRole === 'owner' && (
                <button
                  onClick={() => {
                    setActiveTab('owner-dashboard');
                    onClose();
                  }}
                  className="text-left py-2 font-bold dark:text-[#F2F2F2] text-gray-900 hover:text-emerald-400 flex items-center gap-3 text-sm px-2.5 border border-emerald-900 bg-emerald-950/30"
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span> Owner Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  if (userRole === 'guest') {
                    onOpenAuthModal();
                  } else if (userRole === 'customer') {
                    setActiveTab('customer-dashboard');
                  } else {
                    setActiveTab('owner-dashboard');
                  }
                  onClose();
                }}
                className="text-left py-2 font-semibold dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">person</span> {userRole === 'guest' ? 'Sign In / Register' : 'You'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('cart');
                  onClose();
                }}
                className="text-left py-2 font-semibold dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] flex items-center gap-3 text-sm"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span> Cart & Checkout
              </button>
              {userRole !== 'guest' && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="text-left py-2 font-semibold dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 flex items-center gap-3 text-sm mt-4 border-t dark:border-[#262626] border-gray-200 pt-4"
                >
                  <span className="material-symbols-outlined text-lg">logout</span> Log Out
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t dark:border-[#262626] border-gray-200 text-xs dark:text-[#868686] text-gray-500 mt-6">
          <p>© 2026 EDGEX Inc.</p>
          <p>Precision Architectural Streetwear</p>
        </div>
      </div>
    </div>
  );
};


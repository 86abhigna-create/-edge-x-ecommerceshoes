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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      {/* Drawer content */}
      <div className="relative w-80 max-w-[85vw] dark:bg-[#0D0D0D] bg-white h-full shadow-2xl flex flex-col z-10 p-6 border-r dark:border-[#262626] border-gray-200 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tight dark:text-[#F2F2F2] text-gray-900 notranslate" translate="no">EDGEX NAVIGATION</h2>
          <button onClick={onClose} className="p-2 rounded-full dark:bg-[#1a1a1a] bg-gray-100 dark:text-gray-300 text-gray-700 hover:text-[#D10000] notranslate" translate="no">
            <span className="material-symbols-outlined notranslate text-lg" translate="no">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 flex-grow">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-3">Main Navigation</p>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('All Shoes');
                  onClose();
                }}
                className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg text-[#D10000]" translate="no">home</span> Home (Catalog)
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('New Arrivals');
                  onClose();
                }}
                className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg text-emerald-500" translate="no">fiber_new</span> New Arrivals
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('Streetwear');
                  onClose();
                }}
                className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg text-indigo-500" translate="no">style</span> Streetwear
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('Best Sellers');
                  onClose();
                }}
                className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg text-[#D10000]" translate="no">trending_up</span> Best Sellers
              </button>
              <button
                onClick={() => {
                  setActiveTab('shop');
                  onSelectCategory('Sale');
                  onClose();
                }}
                className="text-left px-3 py-2.5 rounded-lg font-bold text-[#D10000] dark:hover:bg-[#1a1a1a] hover:bg-gray-100 flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg text-[#D10000]" translate="no">local_offer</span> Sale Drops
              </button>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-[#262626] border-gray-200">
            <p className="text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-3">Language & Region</p>
            <div className="mb-4">
              <LanguageSelector />
            </div>

            <p className="text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-3">You & Account</p>
            <div className="flex flex-col gap-1.5">
              {userRole === 'owner' && (
                <button
                  onClick={() => {
                    setActiveTab('owner-dashboard');
                    onClose();
                  }}
                  className="text-left px-3 py-2.5 rounded-lg font-bold text-emerald-400 dark:bg-emerald-950/30 bg-emerald-50 border border-emerald-800 hover:bg-emerald-900/40 flex items-center gap-3 text-sm min-h-[44px]"
                >
                  <span className="material-symbols-outlined notranslate text-lg text-emerald-500" translate="no">admin_panel_settings</span> You (Owner Dashboard)
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
                className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg text-[#D10000]" translate="no">person</span> 
                <span>{userRole === 'guest' ? 'You (Sign In / Register)' : 'You (Profile, Orders & Addresses)'}</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('cart');
                  onClose();
                }}
                className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-[#D10000] flex items-center gap-3 text-sm min-h-[44px]"
              >
                <span className="material-symbols-outlined notranslate text-lg" translate="no">shopping_bag</span> Your Bag & Checkout
              </button>
              {userRole !== 'guest' && (
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="text-left px-3 py-2.5 rounded-lg font-semibold dark:text-[#868686] text-gray-500 hover:text-red-500 flex items-center gap-3 text-sm mt-4 border-t dark:border-[#262626] border-gray-200 pt-4 min-h-[44px]"
                >
                  <span className="material-symbols-outlined notranslate text-lg" translate="no">logout</span> Log Out
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t dark:border-[#262626] border-gray-200 text-xs dark:text-[#868686] text-gray-500 mt-6 notranslate" translate="no">
          <p>© 2026 EDGEX Inc.</p>
          <p>Precision Architectural Streetwear</p>
        </div>
      </div>
    </div>
  );
};


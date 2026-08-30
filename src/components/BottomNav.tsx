import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  userRole: 'customer' | 'owner' | 'guest';
  onOpenAuthModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, cartCount, userRole, onOpenAuthModal }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-16 dark:bg-[#0D0D0D] bg-white border-t dark:border-[#262626] border-gray-200 md:hidden pb-[env(safe-area-inset-bottom,0px)] shadow-lg notranslate" translate="no">
      <button
        onClick={() => {
          setActiveTab('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center justify-center w-full h-full transition-all select-none notranslate ${
          activeTab === 'shop'
            ? 'text-[#D10000] font-black'
            : 'dark:text-[#868686] text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
        translate="no"
      >
        <span
          className="material-symbols-outlined notranslate text-2xl leading-none mb-1"
          translate="no"
          style={{ fontVariationSettings: activeTab === 'shop' ? "'FILL' 1" : "'FILL' 0" }}
        >
          storefront
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase">Shop</span>
      </button>

      {userRole !== 'owner' && (
        <button
          onClick={() => {
            setActiveTab('orders');
          }}
          className={`flex flex-col items-center justify-center w-full h-full transition-all select-none notranslate ${
            activeTab === 'orders'
              ? 'text-[#D10000] font-black'
              : 'dark:text-[#868686] text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          translate="no"
        >
          <span
            className="material-symbols-outlined notranslate text-2xl leading-none mb-1"
            translate="no"
            style={{ fontVariationSettings: activeTab === 'orders' ? "'FILL' 1" : "'FILL' 0" }}
          >
            package_2
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase">Orders</span>
        </button>
      )}

      <button
        onClick={() => setActiveTab('cart')}
        className={`flex flex-col items-center justify-center w-full h-full transition-all relative select-none notranslate ${
          activeTab === 'cart'
            ? 'text-[#D10000] font-black'
            : 'dark:text-[#868686] text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
        translate="no"
      >
        <div className="relative leading-none mb-1 flex items-center justify-center notranslate" translate="no">
          <span
            className="material-symbols-outlined notranslate text-2xl"
            translate="no"
            style={{ fontVariationSettings: activeTab === 'cart' ? "'FILL' 1" : "'FILL' 0" }}
          >
            shopping_bag
          </span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-[#D10000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs notranslate" translate="no">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase">Cart</span>
      </button>

      <button
        onClick={() => {
          if (userRole === 'guest') {
            onOpenAuthModal();
          } else if (userRole === 'owner') {
            setActiveTab('owner-dashboard');
          } else {
            setActiveTab('profile');
          }
        }}
        className={`flex flex-col items-center justify-center w-full h-full transition-all select-none notranslate ${
          activeTab === 'profile' || activeTab === 'owner-dashboard' || activeTab === 'customer-dashboard'
            ? 'text-[#D10000] font-black'
            : 'dark:text-[#868686] text-gray-500 hover:text-gray-900 dark:hover:text-white'
        }`}
        translate="no"
      >
        <span
          className="material-symbols-outlined notranslate text-2xl leading-none mb-1"
          translate="no"
          style={{ fontVariationSettings: (activeTab === 'profile' || activeTab === 'owner-dashboard' || activeTab === 'customer-dashboard') ? "'FILL' 1" : "'FILL' 0" }}
        >
          {userRole === 'owner' ? 'admin_panel_settings' : 'person'}
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase">
          {userRole === 'owner' ? 'Admin' : 'You'}
        </span>
      </button>
    </nav>
  );
};

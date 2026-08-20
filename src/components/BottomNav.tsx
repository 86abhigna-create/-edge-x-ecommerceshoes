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
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center h-16 dark:bg-[#0D0D0D] bg-white border-t dark:border-[#262626] border-gray-200 md:hidden pb-safe">
      <button
        onClick={() => setActiveTab('shop')}
        className={`flex flex-col items-center justify-center w-full h-full transition-all ${
          activeTab === 'shop'
            ? 'text-[#D10000]'
            : 'dark:text-[#868686] text-gray-500 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50'
        }`}
      >
        <span
          className="material-symbols-outlined mb-1 text-2xl"
          style={{ fontVariationSettings: activeTab === 'shop' ? "'FILL' 1" : "'FILL' 0" }}
        >
          storefront
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase">Shop</span>
      </button>

      <button
        onClick={() => {
          if (userRole === 'guest') {
            onOpenAuthModal();
          } else {
            setActiveTab('orders');
          }
        }}
        className={`flex flex-col items-center justify-center w-full h-full transition-all ${
          activeTab === 'orders'
            ? 'text-[#D10000]'
            : 'dark:text-[#868686] text-gray-500 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50'
        }`}
      >
        <span
          className="material-symbols-outlined mb-1 text-2xl"
          style={{ fontVariationSettings: activeTab === 'orders' ? "'FILL' 1" : "'FILL' 0" }}
        >
          package_2
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase">Orders</span>
      </button>

      <button
        onClick={() => setActiveTab('cart')}
        className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${
          activeTab === 'cart'
            ? 'text-[#D10000]'
            : 'dark:text-[#868686] text-gray-500 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50'
        }`}
      >
        <span
          className="material-symbols-outlined mb-1 text-2xl"
          style={{ fontVariationSettings: activeTab === 'cart' ? "'FILL' 1" : "'FILL' 0" }}
        >
          shopping_cart
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase">Cart</span>
        {cartCount > 0 && (
          <span className="absolute top-2 right-6 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
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
        className={`flex flex-col items-center justify-center w-full h-full transition-all ${
          activeTab === 'profile' || activeTab === 'owner-dashboard' || activeTab === 'customer-dashboard'
            ? 'text-[#D10000]'
            : 'dark:text-[#868686] text-gray-500 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50'
        }`}
      >
        <span
          className="material-symbols-outlined mb-1 text-2xl"
          style={{ fontVariationSettings: (activeTab === 'profile' || activeTab === 'owner-dashboard' || activeTab === 'customer-dashboard') ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase">{userRole === 'guest' ? 'Sign In' : 'You'}</span>
      </button>
    </nav>
  );
};

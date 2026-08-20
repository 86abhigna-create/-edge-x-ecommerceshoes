import React, { useState } from 'react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; type: 'flat' | 'percent'; amount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Calculate discount based on active coupon
  let discountAmount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === 'flat') {
      discountAmount = Math.min(subtotal, activeCoupon.amount);
    } else if (activeCoupon.type === 'percent') {
      discountAmount = Math.round((subtotal * activeCoupon.amount) / 100);
    }
  }

  const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'EDGEX10') {
      setActiveCoupon({ code: 'EDGEX10', type: 'flat', amount: 25 });
      setPromoCode('');
    } else if (code === 'STEEP10' || code === 'SAVE10') {
      setActiveCoupon({ code: code, type: 'percent', amount: 10 });
      setPromoCode('');
    } else if (code === 'EDGE20' || code === 'SALE20') {
      setActiveCoupon({ code: code, type: 'percent', amount: 20 });
      setPromoCode('');
    } else {
      setCouponError('Invalid promo code. Try "EDGEX10", "STEEP10", or "EDGE20"');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Slide-over cart */}
      <div className="relative w-full max-w-md dark:bg-[#0D0D0D] bg-white h-full shadow-2xl flex flex-col z-10 border-l dark:border-[#262626] border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 dark:bg-[#0D0D0D] bg-white border-b dark:border-[#262626] border-gray-200">
          <div>
            <h2 className="text-lg font-black tracking-tighter dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
              <span>SHOPPING BAG ({cartItems.length})</span>
            </h2>
            <p className="text-[11px] dark:text-[#868686] text-gray-500">EDGEX Footwear Drop Reservation</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full dark:bg-[#1a1a1a] bg-gray-50 dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200 flex items-center justify-center text-[#45464f] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-grow overflow-y-auto p-5 space-y-3">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-3xl dark:text-[#868686] text-gray-500">shopping_bag</span>
              </div>
              <p className="text-base font-black dark:text-[#F2F2F2] text-gray-900">Your bag is currently empty</p>
              <p className="text-xs dark:text-[#868686] text-gray-500 max-w-xs">Explore our active sneaker drops to reserve your size and colorway.</p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#8a0000] transition-colors shadow-sm"
              >
                Browse Shoe Catalog
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const selectedColor = item.selectedColor || item.product.colorway;
              const originalPrice = Math.round(item.product.price * 1.18);
              const itemDiscount = item.product.discountPercent || 15;

              return (
                <div key={item.cartItemId} className="p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl flex gap-4 shadow-xs relative group">
                  {/* Thumbnail Image */}
                  <div className="w-20 h-20 dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 rounded-lg p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Product Metadata & Details */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider dark:text-[#868686] text-gray-500">{item.product.category}</p>
                          <h3 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900 leading-snug">{item.product.name}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="dark:text-[#868686] text-gray-500 hover:text-red-600 p-1"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>

                      {/* Variant Specs: Size & Color */}
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="dark:bg-[#1a1a1a] bg-gray-50 px-2 py-0.5 rounded border dark:border-[#262626] border-gray-200 text-[11px] font-bold dark:text-[#F2F2F2] text-gray-900">
                          Size: {item.selectedSize}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#45464f] font-semibold">
                          <span
                            className="w-2.5 h-2.5 rounded-full border dark:border-[#262626] border-gray-200 inline-block"
                            style={{
                              backgroundColor: selectedColor.toLowerCase().includes('black')
                                ? '#000'
                                : selectedColor.toLowerCase().includes('white')
                                ? '#fff'
                                : selectedColor.toLowerCase().includes('grey') || selectedColor.toLowerCase().includes('silver')
                                ? '#888'
                                : selectedColor.toLowerCase().includes('blue')
                                ? '#2563eb'
                                : '#6b7280',
                            }}
                          />
                          <span>{selectedColor}</span>
                        </span>
                      </div>
                    </div>

                    {/* Unit Price, Discount & Quantity Control */}
                    <div className="flex justify-between items-end mt-3 pt-2 border-t border-[#f4f4f2]">
                      <div className="flex items-center border dark:border-[#262626] border-gray-200 rounded-lg dark:bg-[#0D0D0D] bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                          className="px-2.5 py-1 text-xs font-black dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-black dark:text-[#F2F2F2] text-gray-900">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                          className="px-2.5 py-1 text-xs font-black dark:text-[#F2F2F2] text-gray-900 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-[10px] dark:text-[#868686] text-gray-500 line-through font-semibold">₹{originalPrice.toLocaleString('en-IN')}</span>
                          <span className="text-[9px] font-black text-red-600 bg-red-50 px-1 rounded">-{itemDiscount}%</span>
                        </div>
                        <span className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[9px] dark:text-[#868686] text-gray-500">(₹{item.product.price.toLocaleString('en-IN')} each)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cart Summary & Coupon Section */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white space-y-4">
            {/* Promo Code Coupon Input */}
            <div>
              {activeCoupon ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs text-emerald-800 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-emerald-600">confirmation_number</span>
                    <span>Coupon "{activeCoupon.code}" Applied ({activeCoupon.type === 'flat' ? `₹${activeCoupon.amount.toLocaleString('en-IN')} OFF` : `${activeCoupon.amount}% OFF`})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-600 hover:underline text-[11px] uppercase font-black"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon / Promo Code (e.g. EDGEX10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-grow px-3 py-2 text-xs border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none font-semibold uppercase tracking-wider"
                    />
                    <button
                      type="submit"
                      className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold px-4 py-2 rounded-lg uppercase tracking-wider hover:bg-[#8a0000] transition-colors shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>}
                  <p className="text-[10px] dark:text-[#868686] text-gray-500">Available coupons: <strong className="dark:text-[#F2F2F2] text-gray-900">EDGEX10</strong> (₹500 off), <strong className="dark:text-[#F2F2F2] text-gray-900">STEEP10</strong> (10% off), <strong className="dark:text-[#F2F2F2] text-gray-900">EDGE20</strong> (20% off)</p>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-2 border-t dark:border-[#262626] border-gray-200">
              <div className="flex justify-between text-[#45464f]">
                <span>Items Subtotal</span>
                <span className="font-bold dark:text-[#F2F2F2] text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                  <span>Coupon Discount ({activeCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-[#45464f]">
                <span>Express Air Shipping</span>
                <span className="font-bold">{shipping === 0 ? <strong className="text-emerald-700">FREE (Orders &gt; ₹2,000)</strong> : `₹${shipping.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-base font-black dark:text-[#F2F2F2] text-gray-900 pt-2 border-t dark:border-[#262626] border-gray-200">
                <span>Total Amount</span>
                <span className="text-lg text-[#D10000]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full bg-[#172554] dark:text-[#F2F2F2] text-gray-900 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#8a0000] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-base">lock</span>
              <span>Proceed to Secure Checkout — ₹{grandTotal.toLocaleString('en-IN')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


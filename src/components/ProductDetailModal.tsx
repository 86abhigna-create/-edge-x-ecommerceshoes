import React, { useState } from 'react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number, color?: string) => void;
  onAddToWishlist: (product: Product) => void;
  onBuyNow?: (product: Product, size: string, quantity: number, color?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onAddToWishlist,
  onBuyNow,
}) => {
  const availableColors = product?.colors && product.colors.length > 0 ? product.colors : [product?.colorway || 'Standard'];
  const availableSizes = product?.sizes && product.sizes.length > 0 ? product.sizes : ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'];

  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'US 9');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews' | 'shipping'>('details');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [wishlistAdded, setWishlistAdded] = useState<boolean>(false);

  if (!product) return null;

  // Color selection
  const currentColor = selectedColor || availableColors[0] || product.colorway;

  // Generate gallery images (simulated angles/views)
  const galleryImages = [
    product.image,
    product.image,
    product.image,
  ];

  const originalPrice = Math.round(product.price * 1.18);
  const discountAmount = originalPrice - product.price;
  const discountPercent = product.discountPercent || Math.round((discountAmount / originalPrice) * 100);

  // Lookup Variant Inventory for current Color + Size combination
  const effectiveSize = selectedSize || availableSizes[0] || 'US 9';
  const selectedVariant = product.variants?.find(
    (v) => v.color.toLowerCase() === currentColor.toLowerCase() && v.size === effectiveSize
  );

  // Determine current variant stock count
  const currentVariantStock = selectedVariant !== undefined ? selectedVariant.stock : (product.stockCount || 10);

  const isOutOfStock = Boolean(currentVariantStock <= 0);
  const isLowStock = Boolean(currentVariantStock > 0 && currentVariantStock <= 3);

  // Delivery date calculation
  const today = new Date();
  const deliveryStart = new Date(today.setDate(today.getDate() + 3)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const deliveryEnd = new Date(today.setDate(today.getDate() + 2)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleAddToCartClick = () => {
    const sizeToUse = selectedSize || availableSizes[0] || 'US 9';
    const colorToUse = currentColor || availableColors[0] || product.colorway;

    if (isOutOfStock) {
      alert(`The ${colorToUse} in size ${sizeToUse} is currently OUT OF STOCK.`);
      return;
    }
    if (quantity > currentVariantStock) {
      alert(`Only ${currentVariantStock} units available in stock for this variant.`);
      return;
    }
    onAddToCart(product, sizeToUse, quantity, colorToUse);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1000);
  };

  const handleBuyNowClick = () => {
    const sizeToUse = selectedSize || availableSizes[0] || 'US 9';
    const colorToUse = currentColor || availableColors[0] || product.colorway;

    if (isOutOfStock) {
      alert(`The ${colorToUse} in size ${sizeToUse} is currently OUT OF STOCK.`);
      return;
    }
    if (onBuyNow) {
      onBuyNow(product, sizeToUse, quantity, colorToUse);
    } else {
      onAddToCart(product, sizeToUse, quantity, colorToUse);
      onClose();
    }
  };

  const handleWishlistClick = () => {
    onAddToWishlist(product);
    setWishlistAdded(true);
    setTimeout(() => setWishlistAdded(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="dark:bg-[#0D0D0D] bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border dark:border-[#262626] border-gray-200 shadow-2xl relative flex flex-col my-auto">
        
        {/* Sticky Close Header */}
        <div className="sticky top-0 z-20 dark:bg-[#0D0D0D] bg-white/95 backdrop-blur-md border-b dark:border-[#262626] border-gray-200 px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest dark:text-[#F2F2F2] text-gray-900">
            <span className="material-symbols-outlined text-base">inventory_2</span>
            <span>EDGEX Silhouette Spec Card & Variant Inventory</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Main Content Container */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Image Gallery & Badges (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            {/* Main Featured Image Display */}
            <div className="dark:bg-white bg-gray-50 rounded-xl p-6 relative flex items-center justify-center aspect-square border dark:border-gray-200 border-gray-200 overflow-hidden group">
              <img
                src={galleryImages[activeImageIndex]}
                alt={product.altText}
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badge && (
                  <span className="bg-[#D10000] text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider rounded-md shadow-xs">
                    {product.badge}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-extrabold px-2.5 py-1 uppercase tracking-wider rounded-md shadow-xs">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Variant Level Stock Status Badge */}
              <div className="absolute bottom-3 right-3">
                {isOutOfStock ? (
                  <span className="bg-red-100 text-red-800 border border-red-300 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>OUT OF STOCK</span>
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                    <span>LOW STOCK ({currentVariantStock} left)</span>
                  </span>
                ) : (
                  <div className="dark:bg-[#0D0D0D] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border dark:border-[#262626] border-gray-200 flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>
                      {selectedSize
                        ? `In Stock (${currentVariantStock} available)`
                        : `In Stock (${product.stockCount || 18} total)`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery Row */}
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`dark:bg-white bg-gray-50 p-2 rounded-lg border aspect-square flex items-center justify-center transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#D10000] ring-2 ring-[#000f3f]/20'
                      : 'dark:border-gray-200 border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>

            {/* Quick Delivery & Return Highlights */}
            <div className="dark:bg-[#0D0D0D] bg-white rounded-xl p-4 border dark:border-[#262626] border-gray-200 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 dark:text-[#F2F2F2] text-gray-900">
                <span className="material-symbols-outlined text-base text-[#D10000]">local_shipping</span>
                <div>
                  <p className="font-bold">Estimated Delivery: {deliveryStart} – {deliveryEnd}</p>
                  <p className="text-[11px] dark:text-[#868686] text-gray-500">Free Express Delivery over ₹2,000</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 dark:text-[#F2F2F2] text-gray-900 pt-2 border-t dark:border-[#262626] border-gray-200">
                <span className="material-symbols-outlined text-base text-emerald-700">verified_user</span>
                <div>
                  <p className="font-bold">30-Day Free Returns & Exchanges</p>
                  <p className="text-[11px] dark:text-[#868686] text-gray-500">Hassle-free guarantee with prepaid return labels</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info & Configuration (7 cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div>
              {/* Category & Rating Row */}
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-black tracking-widest uppercase dark:text-[#868686] text-gray-500">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  <span className="text-amber-500 font-bold text-xs">★★★★★</span>
                  <span className="text-[11px] font-bold dark:text-[#F2F2F2] text-gray-900">4.9 (42 reviews)</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <h2 className="text-2xl sm:text-3xl font-black dark:text-[#F2F2F2] text-gray-900 tracking-tight mb-1">{product.name}</h2>
              {product.tagline && <p className="text-xs font-semibold text-[#D10000] uppercase tracking-wider mb-3">{product.tagline}</p>}

              {/* Price & Discount */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                <span className="text-base dark:text-[#868686] text-gray-500 line-through font-semibold">₹{originalPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ₹{discountAmount.toLocaleString('en-IN')} ({discountPercent}% OFF)
                </span>
              </div>

              {/* Color Variant Selector */}
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 mb-2">
                  Select Color Variant: <span className="font-extrabold text-[#D10000]">{currentColor}</span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {availableColors.map((col) => {
                    const isSelected = currentColor.toLowerCase() === col.toLowerCase();
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000] shadow-xs'
                            : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border dark:border-[#262626] border-gray-200"
                          style={{
                            backgroundColor: col.toLowerCase().includes('black')
                              ? '#000'
                              : col.toLowerCase().includes('white')
                              ? '#fff'
                              : col.toLowerCase().includes('grey') || col.toLowerCase().includes('silver')
                              ? '#888'
                              : col.toLowerCase().includes('blue')
                              ? '#2563eb'
                              : '#6b7280',
                          }}
                        />
                        <span>{col}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector & Stock Availability Check */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900">
                    Select Size (US)
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs font-bold text-[#D10000] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">straighten</span>
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSizes.map((size) => {
                    // check specific variant stock for this size and current color
                    const varStock = product.variants?.find(
                      (v) => v.color.toLowerCase() === currentColor.toLowerCase() && v.size === size
                    )?.stock;

                    const sizeOut = varStock !== undefined ? varStock <= 0 : false;
                    const sizeLow = varStock !== undefined ? varStock > 0 && varStock <= 3 : false;
                    const isSelected = selectedSize === size;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-1 text-xs font-extrabold rounded-lg border transition-all relative flex flex-col items-center justify-center ${
                          sizeOut
                            ? 'dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#868686] text-gray-500 dark:border-[#262626] border-gray-200 line-through cursor-pointer opacity-75'
                            : isSelected
                            ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000] shadow-xs'
                            : sizeLow
                            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:border-amber-600'
                            : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                        }`}
                      >
                        <span>{size}</span>
                        {sizeOut ? (
                          <span className="text-[8px] font-black uppercase text-red-600 no-underline">SOLD OUT</span>
                        ) : sizeLow ? (
                          <span className="text-[8px] font-black uppercase text-amber-700 no-underline">{varStock} LEFT</span>
                        ) : varStock !== undefined ? (
                          <span className="text-[8px] font-semibold dark:text-[#868686] text-gray-500 no-underline">{varStock} in stock</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Granular Low Stock / Out of Stock Banner */}
                {selectedSize && (
                  <div className="mt-3">
                    {isOutOfStock ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-red-600">block</span>
                        <span>Out of Stock: Size {selectedSize} in {currentColor} is currently sold out. Please select another size or color variant.</span>
                      </div>
                    ) : isLowStock ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-amber-600">warning</span>
                        <span>Low Stock Alert: Only {currentVariantStock} left in stock for size {selectedSize} ({currentColor})! Reserve now.</span>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                        <span>In Stock: {currentVariantStock} units available for {currentColor} / {selectedSize}. Ready for express dispatch.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Picker */}
              <div className="mb-5 flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900">Quantity:</span>
                <div className="flex items-center border dark:border-[#262626] border-gray-200 rounded-lg dark:bg-[#0D0D0D] bg-white overflow-hidden">
                  <button
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-xs font-bold dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold dark:text-[#F2F2F2] text-gray-900">{quantity}</span>
                  <button
                    disabled={isOutOfStock || quantity >= currentVariantStock}
                    onClick={() => setQuantity(Math.min(currentVariantStock, quantity + 1))}
                    className="px-3 py-1.5 text-xs font-bold dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] dark:text-[#868686] text-gray-500">Total: ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
              </div>

              {/* Tabs for Description, Specs, Reviews */}
              <div className="border-t border-b dark:border-[#262626] border-gray-200 py-3 mb-5">
                <div className="flex gap-4 border-b dark:border-[#262626] border-gray-200 pb-2 mb-3">
                  {(['details', 'specs', 'reviews', 'shipping'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-xs font-bold uppercase tracking-wider pb-1 transition-all ${
                        activeTab === tab
                          ? 'border-b-2 border-[#D10000] dark:text-[#F2F2F2] text-gray-900'
                          : 'dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'details' && (
                  <p className="text-xs text-[#45464f] leading-relaxed">{product.description}</p>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-2 text-xs">
                    <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Materials & Construction:</p>
                    <ul className="list-disc list-inside text-[#45464f] space-y-1">
                      {product.materials.map((mat, i) => (
                        <li key={i}>{mat}</li>
                      ))}
                      <li>Outsole: Molded rubber chassis with high-friction traction grip</li>
                      <li>SKU: EDGEX-{product.id.toUpperCase()}</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-600 font-bold">
                      <span>★ 4.9 out of 5 stars</span>
                      <span className="dark:text-[#868686] text-gray-500 font-normal">(42 buyer reviews)</span>
                    </div>
                    <p className="text-[#45464f] italic">"Unmatched comfort and incredible futuristic silhouette. Fits true to size!" — Marcus V.</p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-1 text-xs text-[#45464f]">
                    <p>• Express Shipping: 2-4 business days</p>
                    <p>• 30-day hassle-free return policy</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons: Add to Bag, Buy Now (below Add to Bag) */}
            <div className="space-y-2.5 pt-2">
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCartClick}
                className={`w-full py-3.5 px-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                  isOutOfStock
                    ? 'dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#868686] text-gray-500 cursor-not-allowed border dark:border-[#262626] border-gray-200'
                    : addedAnimation
                    ? 'bg-emerald-600 dark:text-[#F2F2F2] text-gray-900'
                    : 'bg-[#172554] dark:text-[#F2F2F2] text-gray-900 hover:bg-[#8a0000]'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isOutOfStock ? 'block' : 'shopping_bag'}
                </span>
                <span>{isOutOfStock ? 'Variant Out of Stock' : addedAnimation ? 'Added to Bag ✓' : 'Add to Bag'}</span>
              </button>

              <button
                disabled={isOutOfStock}
                onClick={handleBuyNowClick}
                className={`w-full py-3.5 px-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm ${
                  isOutOfStock
                    ? 'bg-[#5c0000] dark:text-[#868686] text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-700 dark:text-[#F2F2F2] text-gray-900 hover:bg-emerald-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">bolt</span>
                <span>Buy Now</span>
              </button>

              <button
                onClick={handleWishlistClick}
                className="w-full py-2.5 text-xs font-bold uppercase tracking-widest dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border dark:border-[#262626] border-gray-200 dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200 transition-colors rounded-xl flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base text-red-600">
                  {wishlistAdded ? 'favorite' : 'favorite_border'}
                </span>
                <span>{wishlistAdded ? 'Saved to Wishlist ♥' : 'Save to Wishlist'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Product Spec Table Breakdown with Granular Variant Matrix */}
        <div className="dark:bg-[#0D0D0D] bg-white border-t dark:border-[#262626] border-gray-200 p-6 text-xs dark:text-[#F2F2F2] text-gray-900">
          <h4 className="font-black dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">grid_view</span>
            <span>Product + Size + Color Variant Inventory Matrix</span>
          </h4>
          
          <div className="overflow-x-auto dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableColors.map((col) => {
                const colorVariants = product.variants?.filter((v) => v.color.toLowerCase() === col.toLowerCase()) || [];
                return (
                  <div key={col} className="border dark:border-[#262626] border-gray-200 rounded-lg p-3 dark:bg-[#0D0D0D] bg-white">
                    <p className="font-black dark:text-[#F2F2F2] text-gray-900 text-xs uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D10000]"></span>
                      <span>Color: {col}</span>
                    </p>
                    {colorVariants.length === 0 ? (
                      <p className="text-[11px] dark:text-[#868686] text-gray-500">General stock available: {product.stockCount || 10} units</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {colorVariants.map((v) => {
                          const vOut = v.stock <= 0;
                          const vLow = v.stock > 0 && v.stock <= 3;
                          return (
                            <div
                              key={v.size}
                              className={`p-2 rounded border text-[11px] flex justify-between items-center ${
                                vOut
                                  ? 'bg-red-50 border-red-200 text-red-900'
                                  : vLow
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : 'dark:bg-[#0D0D0D] bg-white dark:border-[#262626] border-gray-200 dark:text-[#F2F2F2] text-gray-900'
                              }`}
                            >
                              <span className="font-bold">{v.size}</span>
                              <span
                                className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                                  vOut
                                    ? 'bg-red-600 dark:text-[#F2F2F2] text-gray-900'
                                    : vLow
                                    ? 'bg-amber-500 dark:text-[#F2F2F2] text-gray-900 animate-pulse'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {vOut ? 'OUT OF STOCK' : vLow ? `${v.stock} LOW STOCK` : `${v.stock} in stock`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Size Guide Modal Overlay */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
            <div className="dark:bg-[#0D0D0D] bg-white rounded-2xl max-w-lg w-full p-6 border dark:border-[#262626] border-gray-200 shadow-2xl relative text-xs">
              <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200 mb-4">
                <h3 className="font-black text-sm uppercase tracking-wider dark:text-[#F2F2F2] text-gray-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">straighten</span>
                  <span>Shoe Size Conversion & Fitting Guide</span>
                </h3>
                <button onClick={() => setShowSizeGuide(false)} className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-[#45464f] mb-4">
                EDGEX footwear runs true-to-size. For a standard snug fit, choose your normal athletic shoe size. If you have wider feet, we recommend sizing up 0.5 size.
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-center border-collapse border dark:border-[#262626] border-gray-200">
                  <thead>
                    <tr className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[10px] uppercase">
                      <th className="p-2">US Men</th>
                      <th className="p-2">UK</th>
                      <th className="p-2">EU</th>
                      <th className="p-2">CM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e0] text-[11px]">
                    <tr><td className="p-1.5 font-bold">US 8</td><td>7.5</td><td>41</td><td>26.0 cm</td></tr>
                    <tr><td className="p-1.5 font-bold">US 8.5</td><td>8.0</td><td>41.5</td><td>26.5 cm</td></tr>
                    <tr><td className="p-1.5 font-bold">US 9</td><td>8.5</td><td>42</td><td>27.0 cm</td></tr>
                    <tr><td className="p-1.5 font-bold">US 9.5</td><td>9.0</td><td>42.5</td><td>27.5 cm</td></tr>
                    <tr><td className="p-1.5 font-bold">US 10</td><td>9.5</td><td>43</td><td>28.0 cm</td></tr>
                    <tr><td className="p-1.5 font-bold">US 11</td><td>10.5</td><td>44.5</td><td>29.0 cm</td></tr>
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full py-2.5 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 font-bold uppercase rounded-xl tracking-wider text-xs hover:bg-[#8a0000]"
              >
                Close Size Guide
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

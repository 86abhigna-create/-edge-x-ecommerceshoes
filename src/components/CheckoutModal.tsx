import React, { useState } from 'react';
import { CartItem, Order, OrderItemSnapshot, Address } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (order: Order) => void;
  addresses?: Address[];
  onSaveAddress?: (address: Address) => void;
}

interface AddressOption {
  id: string;
  label: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

// Convert Address to AddressOption
const addressToOption = (addr: Address): AddressOption => ({
  id: addr.id,
  label: addr.type === 'shipping' ? 'Shipping Address' : 'Billing Address',
  fullName: addr.fullName || addr.full_name || 'Alex Vance',
  street: addr.street || '',
  apartment: addr.apartment || '',
  city: addr.city || '',
  state: addr.state || '',
  zip: addr.zip || '',
  country: addr.country || 'United States',
  phone: addr.phone || '',
});

interface DeliveryOption {
  id: string;
  name: string;
  days: string;
  price: number;
  description: string;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'express',
    name: 'Express Air Courier',
    days: '2 - 3 Business Days',
    price: 15,
    description: 'Priority flight dispatch with real-time GPS tracking.',
  },
  {
    id: 'priority',
    name: 'Overnight Priority Air',
    days: '1 Business Day',
    price: 30,
    description: 'Guaranteed next-morning delivery before 10:30 AM.',
  },
  {
    id: 'ground',
    name: 'Standard Eco Freight',
    days: '5 - 7 Business Days',
    price: 0,
    description: 'Carbon-neutral ground shipment.',
  },
];

type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 6; 
// 1: Address, 2: Delivery, 3: Review & Coupon, 4: Payment Select, 5: Verify Payment, 6: Confirmation

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
  addresses,
  onSaveAddress,
}) => {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);

  // Address State - use passed addresses or fallback to defaults
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    if (addresses && addresses.length > 0) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      return def.id;
    }
    return 'addr-1';
  });
  
  // Custom or new address state
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressValidationError, setAddressValidationError] = useState<string>('');
  const [addressSuccessFeedback, setAddressSuccessFeedback] = useState<string>('');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState<boolean>(true);

  // Form state for either adding a new address or editing an existing one
  const [addressForm, setAddressForm] = useState<AddressOption>({
    id: 'addr-custom',
    label: 'New Delivery Destination',
    fullName: 'Alex Vance',
    street: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    phone: '',
  });

  // Local list of addresses allowing user edits during checkout session
  const [localAddresses, setLocalAddresses] = useState<AddressOption[]>(() => {
    if (addresses && addresses.length > 0) {
      return addresses.map(addressToOption);
    }
    return [
      {
        id: 'addr-1',
        label: 'Primary Residence (Home)',
        fullName: 'Alex Vance',
        street: '742 Evergreen Terrace',
        apartment: 'Suite 4B',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
        phone: '+1 (555) 019-2834',
      },
      {
        id: 'addr-2',
        label: 'EDGE Design Studio (Office)',
        fullName: 'Alex Vance',
        street: '120 Broadway Ave',
        apartment: 'Floor 18',
        city: 'New York',
        state: 'NY',
        zip: '10005',
        country: 'United States',
        phone: '+1 (555) 882-9102',
      },
    ];
  });

  // Synchronize modal state whenever modal opens or addresses prop changes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsAddingNewAddress(false);
      setEditingAddressId(null);
      setAddressValidationError('');
      setCreatedOrder(null);
      setIsVerifying(false);
      setVerificationPhase('initiating');
      setUserEnteredOtp('');

      if (addresses && addresses.length > 0) {
        const mapped = addresses.map(addressToOption);
        setLocalAddresses(mapped);
        const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
      }
    }
  }, [isOpen, addresses]);

  // Delivery State
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('express');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; type: 'flat' | 'percent'; amount: number } | null>({
    code: 'EDGEX10',
    type: 'flat',
    amount: 25,
  });
  const [couponError, setCouponError] = useState('');

  // Payment Method State
  type PaymentCategory = 'upi' | 'credit' | 'debit' | 'netbanking' | 'wallet' | 'cod';
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>('upi');

  // Specific Payment Details
  const [upiId, setUpiId] = useState('alex.vance@okaxis');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [cardDetails, setCardDetails] = useState({
    name: 'Alex Vance',
    number: '4242 •••• •••• 4242',
    exp: '08/28',
    cvv: '123',
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Apple Pay');

  // Payment Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPhase, setVerificationPhase] = useState<'initiating' | 'otp_required' | 'verified'>('initiating');
  const [otpCode, setOtpCode] = useState('849201');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Created Order Record
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Pricing Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let couponDiscount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === 'flat') {
      couponDiscount = Math.min(subtotal, activeCoupon.amount);
    } else {
      couponDiscount = Math.round((subtotal * activeCoupon.amount) / 100);
    }
  }

  const deliveryOption = DELIVERY_OPTIONS.find((d) => d.id === selectedDeliveryId) || DELIVERY_OPTIONS[0];
  const shippingFee = subtotal > 200 && selectedDeliveryId === 'express' ? 0 : deliveryOption.price;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);

  // Active address resolution
  const getActiveAddress = (): AddressOption => {
    if (isAddingNewAddress) {
      return addressForm;
    }
    if (editingAddressId) {
      return { ...addressForm, id: editingAddressId };
    }
    const found = localAddresses.find((a) => a.id === selectedAddressId);
    if (found) return found;
    if (localAddresses.length > 0) return localAddresses[0];
    return addressForm;
  };

  const activeAddress = getActiveAddress();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'EDGEX10') {
      setActiveCoupon({ code: 'EDGEX10', type: 'flat', amount: 25 });
      setCouponCode('');
    } else if (code === 'STEEP10' || code === 'SAVE10') {
      setActiveCoupon({ code: code, type: 'percent', amount: 10 });
      setCouponCode('');
    } else if (code === 'EDGE20' || code === 'SALE20') {
      setActiveCoupon({ code: code, type: 'percent', amount: 20 });
      setCouponCode('');
    } else if (code === 'FREESHIP') {
      setActiveCoupon({ code: 'FREESHIP', type: 'flat', amount: shippingFee });
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon. Try EDGEX10 (₹500 OFF) or STEEP10 (10% OFF)');
    }
  };

  // Step 1 Validation & Progression Handler
  const handleProceedToDelivery = () => {
    setAddressValidationError('');
    setAddressSuccessFeedback('');

    if (isAddingNewAddress) {
      if (!addressForm.fullName.trim()) {
        setAddressValidationError('Please enter your full name for shipment delivery.');
        return;
      }
      if (!addressForm.street.trim()) {
        setAddressValidationError('Please enter your street address.');
        return;
      }
      if (!addressForm.city.trim()) {
        setAddressValidationError('Please enter your city.');
        return;
      }

      // If user is adding new address and wants to save it
      const newAddrId = 'addr-' + Date.now();
      const finalizedNewAddress: AddressOption = {
        ...addressForm,
        id: newAddrId,
        label: addressForm.label || 'Saved Shipping Destination',
      };

      setLocalAddresses((prev) => [finalizedNewAddress, ...prev.filter(a => a.id !== newAddrId)]);
      setSelectedAddressId(newAddrId);
      setIsAddingNewAddress(false);

      if (saveAddressToProfile && onSaveAddress) {
        onSaveAddress({
          id: newAddrId,
          type: 'shipping',
          fullName: finalizedNewAddress.fullName,
          street: finalizedNewAddress.street,
          apartment: finalizedNewAddress.apartment || '',
          city: finalizedNewAddress.city,
          state: finalizedNewAddress.state || '',
          zip: finalizedNewAddress.zip || '',
          country: finalizedNewAddress.country || 'United States',
          phone: finalizedNewAddress.phone || '',
          isDefault: true,
        });
      }
    } else if (editingAddressId) {
      if (!addressForm.fullName.trim() || !addressForm.street.trim() || !addressForm.city.trim()) {
        setAddressValidationError('Please fill in Full Name, Street Address, and City.');
        return;
      }

      // Update the edited address in local list
      setLocalAddresses((prev) =>
        prev.map((a) => (a.id === editingAddressId ? { ...addressForm, id: editingAddressId } : a))
      );
      setSelectedAddressId(editingAddressId);
      setEditingAddressId(null);

      if (saveAddressToProfile && onSaveAddress) {
        onSaveAddress({
          id: editingAddressId,
          type: 'shipping',
          fullName: addressForm.fullName,
          street: addressForm.street,
          apartment: addressForm.apartment || '',
          city: addressForm.city,
          state: addressForm.state || '',
          zip: addressForm.zip || '',
          country: addressForm.country || 'United States',
          phone: addressForm.phone || '',
          isDefault: true,
        });
      }
    } else {
      // Validate that an existing address is selected
      const current = localAddresses.find((a) => a.id === selectedAddressId);
      if (!current || !current.street.trim()) {
        setAddressValidationError('Please select or enter a valid shipping address.');
        return;
      }
    }

    setCurrentStep(2);
  };

  // Payment Verification Handlers
  const handleStartVerification = () => {
    const currentActive = getActiveAddress();
    if (!currentActive.street.trim() || !currentActive.city.trim()) {
      setCurrentStep(1);
      setAddressValidationError('Please ensure a valid shipping address is provided.');
      return;
    }

    setCurrentStep(5);
    setIsVerifying(true);
    setVerificationPhase('initiating');

    // Simulate 1.2s security handshake then prompt for OTP/Confirmation
    setTimeout(() => {
      setVerificationPhase('otp_required');
      setIsVerifying(false);
    }, 1200);
  };

  const handleConfirmOtpVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError('');

    if (paymentCategory === 'upi' || paymentCategory === 'credit' || paymentCategory === 'debit' || paymentCategory === 'netbanking') {
      if (userEnteredOtp.trim() !== '849201' && userEnteredOtp.trim() !== '123456') {
        setVerificationError('Invalid 3D-Secure OTP. Enter authorization code 849201.');
        return;
      }
    }

    setIsVerifying(true);
    setVerificationPhase('verified');

    // Finalize order creation with accurate address
    setTimeout(() => {
      const finalAddr = getActiveAddress();
      const itemSnapshots: OrderItemSnapshot[] = cartItems.map((ci) => ({
        productId: ci.product.id,
        productName: ci.product.name,
        image: ci.product.image,
        price: ci.product.price,
        selectedSize: ci.selectedSize,
        selectedColor: ci.selectedColor || ci.product.colorway,
        quantity: ci.quantity,
      }));

      let pMethodLabel = '';
      if (paymentCategory === 'upi') pMethodLabel = `UPI (${upiApp.toUpperCase()} - ${upiId})`;
      else if (paymentCategory === 'credit') pMethodLabel = `Credit Card (•••• ${cardDetails.number.slice(-4)})`;
      else if (paymentCategory === 'debit') pMethodLabel = `Debit Card (•••• ${cardDetails.number.slice(-4)})`;
      else if (paymentCategory === 'netbanking') pMethodLabel = `Net Banking (${selectedBank})`;
      else if (paymentCategory === 'wallet') pMethodLabel = `Digital Wallet (${selectedWallet})`;
      else pMethodLabel = 'Cash on Delivery (COD)';

      const fullStreet = finalAddr.apartment 
        ? `${finalAddr.street}, ${finalAddr.apartment}` 
        : finalAddr.street;

      const newOrder: Order = {
        orderId: 'EX-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: [...cartItems],
        itemSnapshots,
        total: grandTotal,
        status: 'Processing',
        paymentMethod: pMethodLabel,
        shippingAddress: {
          fullName: finalAddr.fullName || 'Alex Vance',
          street: fullStreet,
          apartment: finalAddr.apartment || '',
          city: finalAddr.city,
          state: finalAddr.state || '',
          zip: finalAddr.zip || '',
          country: finalAddr.country || 'United States',
          phone: finalAddr.phone || '',
        },
      };

      setCreatedOrder(newOrder);
      onOrderSuccess(newOrder);
      setIsVerifying(false);
      setCurrentStep(6);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 dark:bg-black/80 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="dark:bg-[#0D0D0D] bg-white w-full max-w-2xl border dark:border-[#262626] border-gray-200 shadow-2xl rounded-2xl relative flex flex-col my-auto max-h-[92vh] overflow-hidden">
        
        {/* Modal Header & Progress Stepper */}
        <div className="p-5 dark:bg-[#0D0D0D] bg-white border-b dark:border-[#262626] border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900 tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-2xl text-[#D10000]">lock</span>
                <span>SECURE CHECKOUT & PAYMENT</span>
              </h2>
              <p className="text-xs dark:text-[#868686] text-gray-500">EDGEX Footwear Drop • Official Order Portal</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full dark:bg-[#1a1a1a] bg-gray-50 dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200 flex items-center justify-center text-[#45464f] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-5 gap-1.5 pt-2 border-t dark:border-[#262626] border-gray-200 text-center">
            {[
              { num: 1, label: 'Address' },
              { num: 2, label: 'Delivery' },
              { num: 3, label: 'Review' },
              { num: 4, label: 'Payment' },
              { num: 5, label: 'Verification' },
            ].map((s) => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num;

              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center transition-all ${
                      isPassed
                        ? 'bg-emerald-600 dark:text-[#F2F2F2] text-gray-900'
                        : isActive
                        ? 'bg-[#D10000] text-white ring-2 ring-[#D10000]/40'
                        : 'dark:bg-[#262626] bg-gray-200 dark:text-[#868686] text-gray-500'
                    }`}
                  >
                    {isPassed ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-1 uppercase ${
                      isActive ? 'text-[#D10000]' : isPassed ? 'text-emerald-600' : 'dark:text-[#868686] text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow space-y-6">

          {/* STEP 1: SELECT ADDRESS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-[#D10000]">location_on</span>
                  <span>1. Shipping Destination & Address</span>
                </h3>
                <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">
                  Select a saved destination, edit details, or add a new delivery address.
                </p>
              </div>

              {/* Automatic Persistence Banner */}
              <div className="p-3 dark:bg-[#151515] bg-red-50/70 border dark:border-neutral-800 border-red-200/60 rounded-xl flex items-center gap-2.5 text-xs">
                <span className="material-symbols-outlined text-base text-[#D10000] shrink-0">bookmark_added</span>
                <p className="dark:text-neutral-300 text-gray-700 text-[11px] leading-relaxed">
                  <strong className="text-[#D10000]">Auto-Save Enabled:</strong> Any new address added or edited during this booking is automatically saved to your profile and will be pre-selected on your next order booking.
                </p>
              </div>

              {addressSuccessFeedback && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                  <span>{addressSuccessFeedback}</span>
                </div>
              )}

              {addressValidationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{addressValidationError}</span>
                </div>
              )}

              {/* Saved Address List */}
              <div className="space-y-3">
                {localAddresses.map((addr) => {
                  const isSelected = !isAddingNewAddress && selectedAddressId === addr.id;
                  const isEditingThis = editingAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'dark:bg-[#0D0D0D] bg-white border-[#D10000] ring-2 ring-[#D10000]/10 shadow-sm'
                          : 'dark:bg-[#1a1a1a] bg-gray-50 dark:border-[#262626] border-gray-200 hover:dark:bg-[#0D0D0D] bg-white'
                      }`}
                    >
                      {!isEditingThis ? (
                        <div className="flex items-start justify-between">
                          <div
                            onClick={() => {
                              setIsAddingNewAddress(false);
                              setEditingAddressId(null);
                              setSelectedAddressId(addr.id);
                              setAddressValidationError('');
                            }}
                            className="flex items-start gap-3 cursor-pointer flex-grow"
                          >
                            <input
                              type="radio"
                              name="checkoutAddress"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 mt-0.5 text-[#D10000] focus:ring-[#D10000]"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-[10px] uppercase bg-red-50 dark:bg-red-950/40 text-[#D10000] px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                                  {addr.label}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-xs">check_circle</span>
                                    <span>Selected</span>
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900 mt-1">{addr.fullName}</h4>
                              <p className="text-xs dark:text-gray-300 text-gray-700 mt-0.5">
                                {addr.street}
                                {addr.apartment ? `, ${addr.apartment}` : ''}
                              </p>
                              <p className="text-xs dark:text-gray-400 text-gray-600">
                                {addr.city}, {addr.state} {addr.zip}
                              </p>
                              <p className="text-[11px] dark:text-[#868686] text-gray-500 mt-0.5">
                                {addr.country} {addr.phone ? `• ${addr.phone}` : ''}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAddingNewAddress(false);
                              setSelectedAddressId(addr.id);
                              setEditingAddressId(addr.id);
                              setAddressForm({
                                id: addr.id,
                                label: addr.label,
                                fullName: addr.fullName,
                                street: addr.street,
                                apartment: addr.apartment || '',
                                city: addr.city,
                                state: addr.state,
                                zip: addr.zip,
                                country: addr.country,
                                phone: addr.phone || '',
                              });
                              setAddressValidationError('');
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-[#D10000] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            <span>Edit</span>
                          </button>
                        </div>
                      ) : (
                        /* Inline Address Editing Form */
                        <div className="space-y-3 text-xs pt-1">
                          <div className="flex items-center justify-between pb-2 border-b dark:border-[#262626] border-gray-200">
                            <span className="font-bold uppercase text-[11px] text-[#D10000] flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">edit_note</span>
                              <span>Edit Address Details</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingAddressId(null)}
                              className="text-[11px] dark:text-gray-400 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                Full Name *
                              </label>
                              <input
                                type="text"
                                value={addressForm.fullName}
                                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="Recipient Name"
                              />
                            </div>
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="+1 (555) 000-0000"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                              Street Address *
                            </label>
                            <input
                              type="text"
                              value={addressForm.street}
                              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                              className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                              placeholder="e.g. 742 Evergreen Terrace"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                Apt / Suite / Unit
                              </label>
                              <input
                                type="text"
                                value={addressForm.apartment}
                                onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="Suite 4B"
                              />
                            </div>
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                City *
                              </label>
                              <input
                                type="text"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="New York"
                              />
                            </div>
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="NY"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                ZIP / Postal Code
                              </label>
                              <input
                                type="text"
                                value={addressForm.zip}
                                onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="10001"
                              />
                            </div>
                            <div>
                              <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                value={addressForm.country}
                                onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none text-xs"
                                placeholder="United States"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer text-xs dark:text-gray-300 text-gray-700">
                              <input
                                type="checkbox"
                                checked={saveAddressToProfile}
                                onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                                className="rounded text-[#D10000] focus:ring-[#D10000]"
                              />
                              <span>Save updates to my address book</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                if (!addressForm.fullName.trim() || !addressForm.street.trim() || !addressForm.city.trim()) {
                                  setAddressValidationError('Please provide Full Name, Street Address, and City.');
                                  return;
                                }
                                setLocalAddresses((prev) =>
                                  prev.map((a) => (a.id === editingAddressId ? { ...addressForm, id: editingAddressId } : a))
                                );
                                if (saveAddressToProfile && onSaveAddress) {
                                  onSaveAddress({
                                    id: editingAddressId,
                                    type: 'shipping',
                                    fullName: addressForm.fullName,
                                    street: addressForm.street,
                                    apartment: addressForm.apartment || '',
                                    city: addressForm.city,
                                    state: addressForm.state || '',
                                    zip: addressForm.zip || '',
                                    country: addressForm.country || 'United States',
                                    phone: addressForm.phone || '',
                                  });
                                }
                                setEditingAddressId(null);
                                setAddressValidationError('');
                              }}
                              className="bg-[#D10000] text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-[#8a0000] transition-colors"
                            >
                              Save Address
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add New Address Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    isAddingNewAddress
                      ? 'dark:bg-[#0D0D0D] bg-white border-[#D10000] ring-2 ring-[#D10000]/10 shadow-sm'
                      : 'dark:bg-[#1a1a1a] bg-gray-50 dark:border-[#262626] border-gray-200 hover:dark:bg-[#0D0D0D] bg-white cursor-pointer'
                  }`}
                >
                  <div
                    onClick={() => {
                      setIsAddingNewAddress(true);
                      setEditingAddressId(null);
                      setAddressValidationError('');
                      setAddressForm({
                        id: 'addr-new',
                        label: 'New Delivery Address',
                        fullName: 'Alex Vance',
                        street: '',
                        apartment: '',
                        city: '',
                        state: '',
                        zip: '',
                        country: 'United States',
                        phone: '',
                      });
                    }}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="checkoutAddress"
                      checked={isAddingNewAddress}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#D10000] focus:ring-[#D10000]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-[#D10000]">add_location_alt</span>
                      <span className="font-bold text-xs dark:text-[#F2F2F2] text-gray-900 uppercase">
                        + Enter New Delivery Address
                      </span>
                    </div>
                  </div>

                  {isAddingNewAddress && (
                    <div className="mt-4 space-y-3 pt-3 border-t dark:border-[#262626] border-gray-200 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="Recipient Full Name"
                          />
                        </div>
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                          placeholder="e.g. 100 Innovation Way"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            Apt / Suite / Unit
                          </label>
                          <input
                            type="text"
                            value={addressForm.apartment}
                            onChange={(e) => setAddressForm({ ...addressForm, apartment: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="Apt 4B"
                          />
                        </div>
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="New York"
                          />
                        </div>
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            ZIP / Postal Code
                          </label>
                          <input
                            type="text"
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="10001"
                          />
                        </div>
                        <div>
                          <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full px-3 py-2 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg focus:border-[#D10000] outline-none"
                            placeholder="United States"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs dark:text-gray-300 text-gray-700">
                          <input
                            type="checkbox"
                            checked={saveAddressToProfile}
                            onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                            className="rounded text-[#D10000] focus:ring-[#D10000]"
                          />
                          <span>Save to my profile for next order bookings</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingNewAddress(false);
                              setAddressValidationError('');
                            }}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!addressForm.fullName.trim()) {
                                setAddressValidationError('Please enter your full name for shipment delivery.');
                                return;
                              }
                              if (!addressForm.street.trim()) {
                                setAddressValidationError('Please enter your street address.');
                                return;
                              }
                              if (!addressForm.city.trim()) {
                                setAddressValidationError('Please enter your city.');
                                return;
                              }

                              const newAddrId = 'addr-' + Date.now();
                              const finalizedNewAddress: AddressOption = {
                                ...addressForm,
                                id: newAddrId,
                                label: addressForm.label || 'Saved Shipping Destination',
                              };

                              setLocalAddresses((prev) => [finalizedNewAddress, ...prev.filter(a => a.id !== newAddrId)]);
                              setSelectedAddressId(newAddrId);
                              setIsAddingNewAddress(false);
                              setAddressValidationError('');
                              setAddressSuccessFeedback('✓ Address added, saved, and selected for this and future bookings!');

                              if (saveAddressToProfile && onSaveAddress) {
                                onSaveAddress({
                                  id: newAddrId,
                                  type: 'shipping',
                                  fullName: finalizedNewAddress.fullName,
                                  street: finalizedNewAddress.street,
                                  apartment: finalizedNewAddress.apartment || '',
                                  city: finalizedNewAddress.city,
                                  state: finalizedNewAddress.state || '',
                                  zip: finalizedNewAddress.zip || '',
                                  country: finalizedNewAddress.country || 'United States',
                                  phone: finalizedNewAddress.phone || '',
                                  isDefault: true,
                                });
                              }
                            }}
                            className="px-4 py-2 bg-[#D10000] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000] transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">bookmark_add</span>
                            <span>Save & Select</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-[#262626] border-gray-200">
                <button
                  onClick={handleProceedToDelivery}
                  className="bg-[#D10000] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>Continue to Delivery</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT DELIVERY OPTION */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">local_shipping</span>
                  <span>2. Select Shipping & Delivery Option</span>
                </h3>
                <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">
                  Select your preferred courier transit speed.
                </p>
              </div>

              <div className="space-y-3">
                {DELIVERY_OPTIONS.map((option) => {
                  const isSelected = selectedDeliveryId === option.id;
                  const isFree = option.price === 0 || (subtotal > 200 && option.id === 'express');

                  return (
                    <div
                      key={option.id}
                      onClick={() => setSelectedDeliveryId(option.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'dark:bg-[#0D0D0D] bg-white border-[#D10000] ring-2 ring-[#000f3f]/10 shadow-sm'
                          : 'dark:bg-[#1a1a1a] bg-gray-50 dark:border-[#262626] border-gray-200 hover:dark:bg-[#0D0D0D] bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 dark:text-[#F2F2F2] text-gray-900 mt-1"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900">{option.name}</h4>
                              <span className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                {option.days}
                              </span>
                            </div>
                            <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">{option.description}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">
                            {isFree ? <strong className="text-emerald-700">FREE</strong> : `₹${option.price.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4 border-t dark:border-[#262626] border-gray-200">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 px-5 py-3 rounded-xl text-xs font-bold uppercase dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200"
                >
                  Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000] flex items-center gap-2"
                >
                  <span>Review Order & Coupon</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: REVIEW ORDER & APPLY COUPON */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">fact_check</span>
                  <span>3. Review Order & Apply Promotional Coupon</span>
                </h3>
                <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">
                  Confirm items, sizes, quantities, and apply promotional discounts.
                </p>
              </div>

              {/* Shipping Destination & Delivery Summary */}
              <div className="p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b dark:border-[#262626] border-gray-200">
                  <span className="font-extrabold text-xs dark:text-[#F2F2F2] text-gray-900 uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#D10000]">pin_drop</span>
                    <span>Shipping Destination & Courier</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[#D10000] font-bold text-[11px] hover:underline flex items-center gap-0.5"
                  >
                    <span>Change Address</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="font-bold text-xs dark:text-[#F2F2F2] text-gray-900">{activeAddress.fullName}</p>
                    <p className="dark:text-gray-300 text-gray-600 mt-0.5">
                      {activeAddress.street}{activeAddress.apartment ? `, ${activeAddress.apartment}` : ''}
                    </p>
                    <p className="dark:text-gray-400 text-gray-500">
                      {activeAddress.city}, {activeAddress.state} {activeAddress.zip}
                    </p>
                    {activeAddress.phone && <p className="text-[11px] dark:text-[#868686] text-gray-500">{activeAddress.phone}</p>}
                  </div>
                  <div className="sm:border-l sm:pl-3 dark:border-[#262626] border-gray-200 flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase dark:text-[#868686] text-gray-500">Transit Method</span>
                    <span className="font-black text-xs dark:text-[#F2F2F2] text-gray-900 mt-0.5">{deliveryOption.name}</span>
                    <span className="text-[11px] text-[#D10000] font-semibold">{deliveryOption.days} • {shippingFee === 0 ? 'FREE Shipping' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
                  </div>
                </div>
              </div>

              {/* Itemized List */}
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const selectedColor = item.selectedColor || item.product.colorway;

                  return (
                    <div key={item.cartItemId} className="p-3 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 object-contain mix-blend-multiply dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 rounded p-1"
                      />
                      <div className="flex-grow">
                        <h4 className="font-bold text-xs dark:text-[#F2F2F2] text-gray-900">{item.product.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] dark:text-[#868686] text-gray-500">
                          <span>Size: <strong className="dark:text-[#F2F2F2] text-gray-900">{item.selectedSize}</strong></span>
                          <span>Color: <strong className="dark:text-[#F2F2F2] text-gray-900">{selectedColor}</strong></span>
                          <span>Qty: <strong className="dark:text-[#F2F2F2] text-gray-900">{item.quantity}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-xs dark:text-[#F2F2F2] text-gray-900">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <div className="p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl space-y-2">
                <p className="font-extrabold text-xs dark:text-[#F2F2F2] text-gray-900 uppercase">Apply Coupon / Discount Code</p>
                {activeCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center text-xs text-emerald-800 font-bold">
                    <span>✓ Coupon "{activeCoupon.code}" Active ({activeCoupon.type === 'flat' ? `₹${activeCoupon.amount.toLocaleString('en-IN')} OFF` : `${activeCoupon.amount}% OFF`})</span>
                    <button onClick={() => setActiveCoupon(null)} className="text-red-600 text-[10px] uppercase font-black underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. EDGEX10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-grow px-3 py-2 text-xs border dark:border-[#262626] border-gray-200 rounded focus:border-[#D10000] outline-none font-bold uppercase"
                    />
                    <button type="submit" className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-4 py-2 text-xs font-bold uppercase rounded">
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>}
              </div>

              {/* Order Cost Summary */}
              <div className="p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-[#45464f]">
                  <span>Items Subtotal</span>
                  <span className="font-bold dark:text-[#F2F2F2] text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                    <span>Coupon Discount ({activeCoupon?.code})</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#45464f]">
                  <span>Shipping ({deliveryOption.name})</span>
                  <span className="font-bold">{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between text-base font-black dark:text-[#F2F2F2] text-gray-900 pt-2 border-t dark:border-[#262626] border-gray-200">
                  <span>Total Due</span>
                  <span className="text-[#D10000]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t dark:border-[#262626] border-gray-200">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 px-5 py-3 rounded-xl text-xs font-bold uppercase dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200"
                >
                  Back to Delivery
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000] flex items-center gap-2"
                >
                  <span>Select Payment Method</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SELECT PAYMENT METHOD */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-black dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">payments</span>
                  <span>4. Select Payment Method</span>
                </h3>
                <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">
                  Select payment option. Card details are verified in real time and strictly never stored.
                </p>
              </div>

              {/* Payment Method Category Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'upi', name: 'UPI (GPay / PhonePe)', icon: 'qr_code_2' },
                  { id: 'credit', name: 'Credit Card', icon: 'credit_card' },
                  { id: 'debit', name: 'Debit Card', icon: 'account_balance_wallet' },
                  { id: 'netbanking', name: 'Net Banking', icon: 'account_balance' },
                  { id: 'wallet', name: 'Digital Wallets', icon: 'wallet' },
                  { id: 'cod', name: 'Cash on Delivery', icon: 'local_atm' },
                ].map((m) => {
                  const isSelected = paymentCategory === m.id;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentCategory(m.id as PaymentCategory)}
                      className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                        isSelected
                          ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000] shadow-sm'
                          : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">{m.icon}</span>
                      <span className="font-extrabold text-xs">{m.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Form based on selected category */}
              <div className="p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl space-y-4">
                
                {/* 1. UPI */}
                {paymentCategory === 'upi' && (
                  <div className="space-y-3 text-xs">
                    <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase">UPI Instant Authorization</p>
                    <div className="grid grid-cols-4 gap-2">
                      {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          onClick={() => setUpiApp(app as any)}
                          className={`py-2 px-1 text-[11px] font-black uppercase rounded border transition-colors ${
                            upiApp === app
                              ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                              : 'dark:bg-[#1a1a1a] bg-gray-50 text-[#45464f] dark:border-[#262626] border-gray-200'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 text-[10px] uppercase mb-1">Enter VPA / UPI ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 rounded font-mono focus:border-[#D10000] outline-none"
                        placeholder="e.g. alex@okaxis"
                      />
                    </div>
                  </div>
                )}

                {/* 2 & 3. CREDIT or DEBIT CARD */}
                {(paymentCategory === 'credit' || paymentCategory === 'debit') && (
                  <div className="space-y-3 text-xs">
                    <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase">{paymentCategory === 'credit' ? 'Credit' : 'Debit'} Card Payment</p>
                    <div>
                      <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 text-[10px] uppercase mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 rounded focus:border-[#D10000] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 text-[10px] uppercase mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 rounded font-mono focus:border-[#D10000] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 text-[10px] uppercase mb-1">Expires (MM/YY)</label>
                        <input
                          type="text"
                          value={cardDetails.exp}
                          onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 rounded font-mono focus:border-[#D10000] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold dark:text-[#F2F2F2] text-gray-900 text-[10px] uppercase mb-1">CVV / Security Code</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 rounded font-mono focus:border-[#D10000] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. NET BANKING */}
                {paymentCategory === 'netbanking' && (
                  <div className="space-y-3 text-xs">
                    <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase">Select Banking Partner</p>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 rounded font-bold dark:text-[#F2F2F2] text-gray-900 dark:bg-[#0D0D0D] bg-white outline-none"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* 5. DIGITAL WALLETS */}
                {paymentCategory === 'wallet' && (
                  <div className="space-y-3 text-xs">
                    <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase">Digital Wallet Provider</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Apple Pay', 'Google Pay', 'PayPal', 'Paytm Wallet', 'Amazon Pay'].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWallet(w)}
                          className={`p-2 font-bold text-center rounded border text-[11px] ${
                            selectedWallet === w
                              ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                              : 'dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200'
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. CASH ON DELIVERY */}
                {paymentCategory === 'cod' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
                    <p className="font-extrabold flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">verified</span>
                      <span>Cash on Delivery Active</span>
                    </p>
                    <p className="text-[11px]">Pay upon physical arrival at delivery destination. Exact change required.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t dark:border-[#262626] border-gray-200">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 px-5 py-3 rounded-xl text-xs font-bold uppercase dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200"
                >
                  Back to Review
                </button>
                <button
                  onClick={handleStartVerification}
                  className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000] shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Verify Payment (₹{grandTotal.toLocaleString('en-IN')})</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: VERIFY PAYMENT (INDEPENDENT GATEWAY VERIFICATION) */}
          {currentStep === 5 && (
            <div className="space-y-6 py-4 text-center">
              {verificationPhase === 'initiating' && (
                <div className="space-y-4 py-8">
                  <div className="w-16 h-16 border-4 border-[#D10000] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">CONNECTING TO SECURE PAYMENT GATEWAY...</h3>
                  <p className="text-xs dark:text-[#868686] text-gray-500 max-w-sm mx-auto">
                    Executing fraud checks, encryption handshake, and payment network authorization.
                  </p>
                </div>
              )}

              {verificationPhase === 'otp_required' && (
                <form onSubmit={handleConfirmOtpVerification} className="max-w-md mx-auto dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 rounded-2xl space-y-4 text-left shadow-md">
                  <div className="flex items-center gap-2 border-b dark:border-[#262626] border-gray-200 pb-3">
                    <span className="material-symbols-outlined text-2xl text-emerald-600">shield</span>
                    <div>
                      <h3 className="text-sm font-black dark:text-[#F2F2F2] text-gray-900">3D SECURE PAYMENT VERIFICATION</h3>
                      <p className="text-[11px] dark:text-[#868686] text-gray-500">Independent Authorization Gate</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#45464f]">
                    A 6-digit verification security code was generated for authorization to complete transaction of <strong className="dark:text-[#F2F2F2] text-gray-900">₹{grandTotal.toLocaleString('en-IN')}</strong>.
                  </p>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 font-mono">
                    Demo OTP Code: <strong className="text-base text-[#D10000] font-black tracking-widest">{otpCode}</strong>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Enter 6-Digit Authorization Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full px-4 py-3 text-center text-lg font-black tracking-widest border dark:border-[#262626] border-gray-200 rounded-xl focus:border-[#D10000] outline-none font-mono"
                    />
                  </div>

                  {verificationError && <p className="text-xs text-red-600 font-bold">{verificationError}</p>}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="w-1/3 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 py-3 text-xs font-bold uppercase rounded dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 text-xs font-bold uppercase tracking-wider rounded hover:bg-[#8a0000] shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Authorize Order</span>
                    </button>
                  </div>
                </form>
              )}

              {verificationPhase === 'verified' && (
                <div className="space-y-4 py-8">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">verified</span>
                  </div>
                  <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">PAYMENT INDEPENDENTLY VERIFIED!</h3>
                  <p className="text-xs dark:text-[#868686] text-gray-500">Reserving sneaker variant inventory and issuing receipt...</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 7 & 8: CONFIRMATION & RECEIPT */}
          {currentStep === 6 && createdOrder && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>

              <div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-300">
                  Payment Confirmed & Verified
                </span>
                <h2 className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-2">ORDER CONFIRMED & RESERVED</h2>
                <p className="text-sm font-black text-[#D10000] mt-0.5">Order ID: {createdOrder.orderId}</p>
              </div>

              {/* Order Details Receipt Box */}
              <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-5 text-left text-xs space-y-3 shadow-xs">
                <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
                  <div>
                    <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Order Timestamp:</p>
                    <p className="dark:text-[#868686] text-gray-500">{createdOrder.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Payment Method:</p>
                    <p className="text-[#D10000] font-semibold">{createdOrder.paymentMethod}</p>
                  </div>
                </div>

                <div>
                  <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] mb-2">Itemized Order Receipt</p>
                  <div className="space-y-2">
                    {createdOrder.itemSnapshots?.map((snap, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 dark:bg-[#0D0D0D] bg-white rounded border dark:border-[#262626] border-gray-200">
                        <div className="flex items-center gap-2">
                          <img src={snap.image} alt={snap.productName} className="w-8 h-8 object-contain mix-blend-multiply dark:bg-white bg-gray-50 rounded border dark:border-gray-200 border-gray-200 p-0.5" />
                          <div>
                            <p className="font-bold dark:text-[#F2F2F2] text-gray-900">{snap.quantity}x {snap.productName}</p>
                            <p className="text-[10px] dark:text-[#868686] text-gray-500">Size: {snap.selectedSize} • Color: {snap.selectedColor}</p>
                          </div>
                        </div>
                        <span className="font-black dark:text-[#F2F2F2] text-gray-900">₹{(snap.price * snap.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t dark:border-[#262626] border-gray-200 flex justify-between items-center font-bold">
                  <span>Shipping Address:</span>
                  <span className="text-[#45464f] font-normal">{createdOrder.shippingAddress.street}, {createdOrder.shippingAddress.city}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full sm:w-1/2 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border dark:border-[#262626] border-gray-200 py-3 rounded-xl text-xs font-bold uppercase dark:hover:bg-[#262626] hover:dark:bg-[#262626] bg-gray-200 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 bg-[#D10000] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#8a0000] shadow-sm"
                >
                  Return to Store Catalog
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


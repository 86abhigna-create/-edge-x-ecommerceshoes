import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onShopClick: () => void;
  onRequestReturn: (orderId: string, reason: string) => void;
}

const ORDER_LIFECYCLE_STEPS: OrderStatus[] = [
  'Order Placed',
  'Payment Confirmed',
  'Order Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
];

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onShopClick, onRequestReturn }) => {
  const [returnModalOrderId, setReturnModalOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>('Wrong Size');
  const [trackingModalOrderId, setTrackingModalOrderId] = useState<string | null>(null);

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (returnModalOrderId) {
      onRequestReturn(returnModalOrderId, returnReason);
      setReturnModalOrderId(null);
      alert('Return request submitted successfully. Our courier will contact you within 24 hours.');
    }
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    if (status === 'Delivered' || status === 'Refunded') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (status === 'Payment Failed' || status === 'Cancelled') {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    if (status === 'Return Requested' || status === 'Returned' || status === 'Refund Initiated') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-blue-50 text-blue-800 border-blue-200';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-5 py-8 pb-24">
      <h2 className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 tracking-tight mb-2">ORDER LIFECYCLE & PURCHASES</h2>
      <p className="text-sm dark:text-[#868686] text-gray-500 mb-8">Track your footwear drops across all 8 lifecycle fulfillment stages.</p>

      {orders.length === 0 ? (
        <div className="text-center py-20 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-8">
          <span className="material-symbols-outlined text-5xl dark:text-[#868686] text-gray-500 mb-4">package_2</span>
          <p className="text-lg font-bold dark:text-[#F2F2F2] text-gray-900 mb-1">No orders placed yet</p>
          <p className="text-sm dark:text-[#868686] text-gray-500 mb-6">Your acquired footwear will appear here once checked out.</p>
          <button
            onClick={onShopClick}
            className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#8a0000] transition-colors"
          >
            Explore Featured Drops
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentLifecycleIndex = ORDER_LIFECYCLE_STEPS.indexOf(order.status);
            const isExceptionStatus = currentLifecycleIndex === -1;

            return (
              <div key={order.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 shadow-xs rounded-xl space-y-5">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold uppercase tracking-wider text-[#D10000]">
                        ORDER ID: {order.orderId}
                      </span>
                      <span className="text-xs dark:text-[#868686] text-gray-500">• {order.date}</span>
                    </div>
                    <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">Method: {order.paymentMethod}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-[11px] font-black uppercase tracking-wider border rounded ${getStatusBadgeStyle(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Lifecycle Progress Stepper */}
                {!isExceptionStatus && (
                  <div className="p-4 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl space-y-2">
                    <p className="text-[10px] font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider">
                      Fulfillment Progress ({currentLifecycleIndex + 1} of 8)
                    </p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 pt-1">
                      {ORDER_LIFECYCLE_STEPS.map((stepName, sIdx) => {
                        const isCompleted = sIdx < currentLifecycleIndex;
                        const isCurrent = sIdx === currentLifecycleIndex;

                        return (
                          <div key={stepName} className="flex flex-col items-center text-center">
                            <div
                              className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-emerald-600 dark:text-[#F2F2F2] text-gray-900'
                                  : isCurrent
                                  ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 ring-2 ring-[#0051d5]'
                                  : 'dark:bg-[#262626] bg-gray-200 dark:text-[#868686] text-gray-500'
                              }`}
                            >
                              {isCompleted ? '✓' : sIdx + 1}
                            </div>
                            <span
                              className={`text-[9px] font-bold mt-1 uppercase leading-tight ${
                                isCurrent ? 'dark:text-[#F2F2F2] text-gray-900 font-black' : isCompleted ? 'text-emerald-800' : 'dark:text-[#868686] text-gray-500'
                              }`}
                            >
                              {stepName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="py-2 space-y-3">
                  {order.itemSnapshots && order.itemSnapshots.length > 0 ? (
                    order.itemSnapshots.map((snap, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 dark:bg-[#1a1a1a] bg-gray-50 rounded-lg border dark:border-[#262626] border-gray-200">
                        <div className="w-14 h-14 dark:bg-white bg-gray-50 flex items-center justify-center shrink-0 border dark:border-gray-200 border-gray-200 p-1 rounded">
                          <img
                            src={snap.image}
                            alt={snap.productName}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">{snap.productName}</h4>
                          <p className="text-xs dark:text-[#868686] text-gray-500">
                            Size: <strong className="dark:text-[#F2F2F2] text-gray-900">{snap.selectedSize}</strong> | Color: <strong className="dark:text-[#F2F2F2] text-gray-900">{snap.selectedColor}</strong> | Qty: <strong className="dark:text-[#F2F2F2] text-gray-900">{snap.quantity}</strong>
                          </p>
                        </div>
                        <span className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900">
                          ${snap.price * snap.quantity}
                        </span>
                      </div>
                    ))
                  ) : (
                    order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 dark:bg-[#1a1a1a] bg-gray-50 rounded-lg border dark:border-[#262626] border-gray-200">
                        <div className="w-14 h-14 dark:bg-white bg-gray-50 flex items-center justify-center shrink-0 border dark:border-gray-200 border-gray-200 p-1 rounded">
                          <img
                            src={item.product?.image || ''}
                            alt={item.product?.name || 'Shoe'}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900">{item.product?.name || 'Deactivated Shoe'}</h4>
                          <p className="text-xs dark:text-[#868686] text-gray-500">
                            Size: {item.selectedSize} | Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="font-extrabold text-sm dark:text-[#F2F2F2] text-gray-900">
                          ${(item.product?.price || 0) * item.quantity}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Destination & Actions */}
                <div className="pt-3 border-t dark:border-[#262626] border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center text-xs dark:text-[#868686] text-gray-500 gap-3">
                  <span>Destination: {order.shippingAddress.fullName}, {order.shippingAddress.street}, {order.shippingAddress.city}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTrackingModalOrderId(order.orderId)}
                      className="font-bold text-[#D10000] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      <span>Track Shipment</span>
                    </button>
                    {!order.returnRequested && order.status !== 'Returned' && order.status !== 'Refunded' && (
                      <button
                        onClick={() => setReturnModalOrderId(order.orderId)}
                        className="font-bold text-[#ba1a1a] hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">assignment_return</span>
                        <span>Request Return</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Return Modal */}
      {returnModalOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
          <form onSubmit={handleReturnSubmit} className="dark:bg-[#0D0D0D] bg-white w-full max-w-md p-6 border dark:border-[#262626] border-gray-200 rounded-xl space-y-4 shadow-2xl">
            <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">Request Shoe Return</h3>
            <p className="text-xs dark:text-[#868686] text-gray-500">Order ID: {returnModalOrderId}</p>
            <div>
              <label className="block text-xs font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Reason for Return</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white rounded outline-none font-semibold"
              >
                <option value="Wrong Size">Wrong Size (Need exchange)</option>
                <option value="Style Preference">Style Preference / Fit</option>
                <option value="Defect or Damage">Minor Defect or Transit Damage</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalOrderId(null)}
                className="w-1/2 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 py-3 text-xs font-bold uppercase rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 text-xs font-bold uppercase hover:bg-[#8a0000] rounded"
              >
                Submit Return
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingModalOrderId && (() => {
        const selectedOrder = orders.find((o) => o.orderId === trackingModalOrderId);
        const trackingNum = selectedOrder?.trackingNumber || `EX-TRK-${selectedOrder?.orderId.replace('EX-', '') || '982140'}`;
        const carrier = selectedOrder?.carrier || 'FedEx Express Air';
        const expectedDate = selectedOrder?.expectedDeliveryDate || 'August 10, 2026';
        const notes = selectedOrder?.deliveryNotes || 'Shipment in transit on schedule.';
        const currentStepIndex = selectedOrder ? ORDER_LIFECYCLE_STEPS.indexOf(selectedOrder.status) : 0;
        const isDelivered = selectedOrder?.status === 'Delivered';
        const isOutForDelivery = selectedOrder?.status === 'Out for Delivery';
        const isCancelled = selectedOrder?.status === 'Cancelled' || selectedOrder?.status === 'Payment Failed';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
            <div className="dark:bg-[#0D0D0D] bg-white w-full max-w-lg p-6 border dark:border-[#262626] border-gray-200 rounded-xl space-y-4 text-xs shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
                <div>
                  <h3 className="text-lg font-black dark:text-[#F2F2F2] text-gray-900">Live Delivery & Air Tracking</h3>
                  <p className="text-xs dark:text-[#868686] text-gray-500">Order ID: {selectedOrder?.orderId}</p>
                </div>
                <button onClick={() => setTrackingModalOrderId(null)} className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 font-extrabold text-lg">✕</button>
              </div>

              {/* Status Header Bar */}
              <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 rounded-lg border dark:border-[#262626] border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[#D10000]">Tracking No: {trackingNum}</span>
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded border ${
                    isDelivered
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isOutForDelivery
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : isCancelled
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-blue-100 text-blue-900 border-blue-300'
                  }`}>
                    {selectedOrder?.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="dark:text-[#868686] text-gray-500 block">Courier Partner:</span>
                    <strong className="dark:text-[#F2F2F2] text-gray-900">{carrier}</strong>
                  </div>
                  <div>
                    <span className="dark:text-[#868686] text-gray-500 block">Expected Delivery:</span>
                    <strong className="dark:text-[#F2F2F2] text-gray-900">{expectedDate}</strong>
                  </div>
                </div>
                {notes && (
                  <div className="dark:bg-[#0D0D0D] bg-white p-2.5 rounded border dark:border-[#262626] border-gray-200 text-[11px] text-[#45464f] mt-1">
                    <strong>Delivery Exception / Status Note:</strong> {notes}
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 uppercase text-[10px] tracking-wider">Fulfillment Lifecycle Timeline</p>
                {ORDER_LIFECYCLE_STEPS.map((stepName, i) => {
                  const isDone = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;

                  return (
                    <div key={stepName} className="flex items-start gap-3 text-xs">
                      <div className={`w-4 h-4 rounded-full mt-0.5 shrink-0 text-[10px] font-bold flex items-center justify-center ${
                        isDone
                          ? 'bg-emerald-600 dark:text-[#F2F2F2] text-gray-900'
                          : 'dark:bg-[#262626] bg-gray-200 dark:text-[#868686] text-gray-500'
                      }`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <div className="flex-grow pb-1">
                        <div className="flex justify-between items-center">
                          <p className={`font-bold ${isCurrent ? 'text-[#D10000] font-black' : isDone ? 'dark:text-[#F2F2F2] text-gray-900' : 'dark:text-[#868686] text-gray-500'}`}>
                            {stepName}
                          </p>
                          {isCurrent && <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded">CURRENT STAGE</span>}
                        </div>
                        <p className="text-[10px] dark:text-[#868686] text-gray-500">
                          {isDone ? 'Completed & verified' : 'Scheduled stage'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setTrackingModalOrderId(null)}
                className="w-full bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 font-extrabold uppercase rounded-lg hover:bg-[#8a0000] transition-colors"
              >
                Close Tracking Modal
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

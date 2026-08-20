import React from 'react';

export const ProfileView: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-5 py-8 pb-24">
      <h2 className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 tracking-tight mb-2">MEMBER PROFILE</h2>
      <p className="text-sm dark:text-[#868686] text-gray-500 mb-8">Manage your EDGEX account, shipping addresses, and preferences.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 md:col-span-1 shadow-xs">
          <div className="w-20 h-20 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4">
            AV
          </div>
          <h3 className="text-center font-bold text-lg dark:text-[#F2F2F2] text-gray-900">Alex Vance</h3>
          <p className="text-center text-xs dark:text-[#868686] text-gray-500 mb-4">alex.vance@edgex.com</p>
          <div className="border-t dark:border-[#262626] border-gray-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="dark:text-[#868686] text-gray-500">Membership Tier</span>
              <span className="font-bold dark:text-[#F2F2F2] text-gray-900">Black Circle (Tier 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="dark:text-[#868686] text-gray-500">Early Access</span>
              <span className="font-bold text-emerald-600">Enabled</span>
            </div>
          </div>
        </div>

        {/* Details & Addresses */}
        <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 md:col-span-2 space-y-6 shadow-xs">
          <div>
            <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider mb-3">Saved Shipping Address</h4>
            <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 text-xs space-y-1 border dark:border-[#262626] border-gray-200">
              <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Alex Vance</p>
              <p>742 Evergreen Terrace</p>
              <p>New York, NY 10001</p>
              <p>United States</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider mb-3">Payment Methods</h4>
            <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 text-xs flex justify-between items-center border dark:border-[#262626] border-gray-200">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl dark:text-[#F2F2F2] text-gray-900">credit_card</span>
                <div>
                  <p className="font-bold dark:text-[#F2F2F2] text-gray-900">Mastercard ending in 4242</p>
                  <p className="dark:text-[#868686] text-gray-500">Expires 08/28</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#D10000]">Default</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm dark:text-[#F2F2F2] text-gray-900 uppercase tracking-wider mb-3">Preferences</h4>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#000f3f]" />
                <span>Instant SMS notifications for Limited Drop releases</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-[#000f3f]" />
                <span>Email newsletter for "The Concrete Edit" lookbooks</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

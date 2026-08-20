import React, { useState } from 'react';
import { Product, Order, Review, NotificationItem } from '../types';
import { CATEGORIES } from '../data/products';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

interface OwnerDashboardViewProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onSwitchToCustomer: () => void;
  reviews?: Review[];
  onModerateReview?: (reviewId: string, status: Review['status']) => void;
  onDeleteReview?: (reviewId: string) => void;
  notifications?: NotificationItem[];
  onLogout: () => void;
}

const salesData = [
  { name: 'Mon', sales: 1200, orders: 5 },
  { name: 'Tue', sales: 2100, orders: 9 },
  { name: 'Wed', sales: 1800, orders: 7 },
  { name: 'Thu', sales: 3200, orders: 12 },
  { name: 'Fri', sales: 4500, orders: 18 },
  { name: 'Sat', sales: 5400, orders: 22 },
  { name: 'Sun', sales: 4800, orders: 19 },
];

const topSelling = [
  { name: 'Apex Vol. 1', units: 48, revenue: 11520 },
  { name: 'Strata Void', units: 39, revenue: 7605 },
  { name: 'Titan Shift', units: 31, revenue: 8680 },
  { name: 'Core Minimal', units: 27, revenue: 4320 },
];

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders,
  onUpdateOrderStatus,
  onSwitchToCustomer,
  reviews = [],
  onModerateReview,
  onDeleteReview,
  notifications = [],
  onLogout,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [notifFilter, setNotifFilter] = useState<string>('all');
  
  // Product Form Modal state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 220,
    discountPercent: 0,
    category: CATEGORIES[1],
    badge: 'New' as Product['badge'],
    image: '/src/assets/images/sneaker_product_4_1786357614054.jpg',
    description: '',
    colorway: 'Stealth Black',
    materials: 'Full-grain Italian Leather, Ballistic Mesh, Rubber Outsole',
    sizes: ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 12'],
    inStock: true,
    stockCount: 20,
    published: true,
  });

  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      price: 220,
      discountPercent: 0,
      category: CATEGORIES[1],
      badge: 'New',
      image: '/src/assets/images/sneaker_product_4_1786357614054.jpg',
      description: 'High-end streetwear silhouette engineered with precision.',
      colorway: 'Stealth Black',
      materials: 'Full-grain Italian Leather, Ballistic Mesh, Rubber Outsole',
      sizes: ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 12'],
      inStock: true,
      stockCount: 20,
      published: true,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (p: Product) => {
    setCurrentProduct(p);
    setFormData({
      name: p.name,
      price: p.price,
      discountPercent: p.discountPercent || 0,
      category: p.category,
      badge: p.badge || 'New',
      image: p.image,
      description: p.description,
      colorway: p.colorway,
      materials: Array.isArray(p.materials) ? p.materials.join(', ') : 'Full-grain Leather, Rubber Outsole',
      sizes: p.sizes && p.sizes.length > 0 ? p.sizes : ['US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 11'],
      inStock: p.inStock,
      stockCount: p.stockCount || 18,
      published: p.published !== false,
    });
    setIsEditing(true);
  };

  const handleSaveProduct = (e?: React.FormEvent, forcePublishStatus?: boolean) => {
    if (e) e.preventDefault();
    const finalPublished = forcePublishStatus !== undefined ? forcePublishStatus : formData.published;

    const parsedMaterials = typeof formData.materials === 'string'
      ? formData.materials.split(',').map((s) => s.trim()).filter(Boolean)
      : formData.materials;

    if (currentProduct) {
      onUpdateProduct({
        ...currentProduct,
        name: formData.name,
        price: Number(formData.price),
        discountPercent: Number(formData.discountPercent || 0),
        category: formData.category,
        badge: formData.badge,
        image: formData.image,
        description: formData.description,
        colorway: formData.colorway,
        materials: parsedMaterials.length > 0 ? parsedMaterials : ['Italian Calfskin', 'Rubber Outsole'],
        sizes: formData.sizes,
        inStock: formData.inStock,
        stockCount: Number(formData.stockCount || 0),
        published: finalPublished,
      });
    } else {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name: formData.name,
        price: Number(formData.price),
        discountPercent: Number(formData.discountPercent || 0),
        category: formData.category,
        badge: formData.badge,
        image: formData.image,
        altText: formData.name + ' streetwear shoe',
        description: formData.description,
        materials: parsedMaterials.length > 0 ? parsedMaterials : ['Italian Calfskin', 'Rubber Outsole'],
        colorway: formData.colorway,
        sizes: formData.sizes.length > 0 ? formData.sizes : ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
        inStock: formData.inStock,
        stockCount: Number(formData.stockCount || 18),
        published: finalPublished,
      };
      onAddProduct(newProd);
    }
    setIsEditing(false);
  };

  const handleQuickTogglePublish = (p: Product) => {
    onUpdateProduct({
      ...p,
      published: p.published === false ? true : false,
    });
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 23050);
  const totalOrdersCount = orders.length + 84;
  const todaysSales = 4820;
  const pendingOrders = orders.filter(o => o.status === 'Processing').length + 3;
  const totalCustomers = 412;
  const lowStockCount = 2;
  const outOfStockCount = 0;
  const returnsCount = 4;
  const pendingRefundsCount = 1;

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'variants', label: 'Variants' },
    { id: 'sizes', label: 'Sizes' },
    { id: 'colors', label: 'Colors' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'payments', label: 'Payments' },
    { id: 'returns', label: 'Returns' },
    { id: 'refunds', label: 'Refunds' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'coupons', label: 'Coupons & Discounts' },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'sales', label: 'Sales' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'reports', label: 'Reports' },
    { id: 'support', label: 'Customer Support' },
    { id: 'website', label: 'Website Management' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-5 md:px-16 py-8 pb-24">
      {/* Top Banner */}
      <div className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b7c4fd]">Owner & Operations Portal</span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">EDGEX Central Dashboard</h1>
          <p className="text-xs text-[#b7c4fd] mt-1">Real-time inventory, sales analytics, and order fulfillment control.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSwitchToCustomer}
            className="dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#b7c4fd] transition-colors"
          >
            View Storefront →
          </button>
          <button
            onClick={onLogout}
            className="bg-transparent border dark:border-[#F2F2F2] border-black dark:text-[#F2F2F2] text-gray-900 px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#b7c4fd] hover:dark:text-[#0D0D0D] text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Sub Tabs Bar (Scrollable horizontally) */}
      <div className="flex gap-2 border-b dark:border-[#262626] border-gray-200 mb-8 pb-3 overflow-x-auto whitespace-nowrap">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              activeSubTab === item.id
                ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900'
                : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 border dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Executive Overview</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Key performance metrics and operational pulse of EDGEX.</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200">
              Live System Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Today's Sales</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">${todaysSales.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ 14% vs yesterday</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Total Sales</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ 18.4% month-to-date</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Total Orders</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">{totalOrdersCount}</p>
              <span className="text-[10px] text-[#D10000] font-bold mt-1 block">Fully fulfilled: 92%</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Pending Orders</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{pendingOrders}</p>
              <span className="text-[10px] dark:text-[#868686] text-gray-500 font-bold mt-1 block">Requires dispatch</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Total Customers</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">{totalCustomers}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">+28 new this week</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Total Products</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">{products.length}</p>
              <span className="text-[10px] dark:text-[#868686] text-gray-500 font-bold mt-1 block">Active silhouettes</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Low-Stock Products</p>
              <p className="text-2xl font-black text-amber-700 mt-1">{lowStockCount}</p>
              <span className="text-[10px] text-amber-700 font-bold mt-1 block">Restock recommended</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Out-of-Stock</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">{outOfStockCount}</p>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">All primary lines ready</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Returns</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">{returnsCount}</p>
              <span className="text-[10px] dark:text-[#868686] text-gray-500 font-bold mt-1 block">Inspected & processed</span>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 shadow-xs">
              <p className="text-[11px] font-bold dark:text-[#868686] text-gray-500 uppercase">Pending Refunds</p>
              <p className="text-2xl font-black dark:text-[#F2F2F2] text-gray-900 mt-1">{pendingRefundsCount}</p>
              <span className="text-[10px] dark:text-[#868686] text-gray-500 font-bold mt-1 block">Queue clearance today</span>
            </div>
          </div>

          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6">
            <h4 className="font-black text-sm dark:text-[#F2F2F2] text-gray-900 mb-4">Quick Operational Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 space-y-1">
                <p className="font-bold uppercase dark:text-[#F2F2F2] text-gray-900">Global Logistics</p>
                <p className="dark:text-[#868686] text-gray-500">Air Express Hub: Operational (99.8% on-time delivery)</p>
              </div>
              <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 space-y-1">
                <p className="font-bold uppercase dark:text-[#F2F2F2] text-gray-900">Payment Gateway</p>
                <p className="dark:text-[#868686] text-gray-500">Stripe & Mastercard API: Secure (0 failed transactions)</p>
              </div>
              <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 space-y-1">
                <p className="font-bold uppercase dark:text-[#F2F2F2] text-gray-900">VIP Membership</p>
                <p className="dark:text-[#868686] text-gray-500">Black Circle Tier Active: 142 members enrolled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Product Catalog & Visibility Control</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">
                Manage streetwear silhouettes, pricing, stock levels, variants, and storefront publication settings.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase tracking-widest px-5 py-3 hover:bg-[#8a0000] shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-base">add_box</span>
              <span>+ Add New Shoe</span>
            </button>
          </div>

          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="dark:bg-[#1a1a1a] bg-gray-50 border-b dark:border-[#262626] border-gray-200 text-xs font-bold uppercase dark:text-[#F2F2F2] text-gray-900">
                  <th className="p-4">Silhouette</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Colorway</th>
                  <th className="p-4">Price / Discount</th>
                  <th className="p-4">Stock & Sizes</th>
                  <th className="p-4">Visibility Setting</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c5d0] text-xs">
                {products.map((p) => {
                  const isPublished = p.published !== false;
                  return (
                    <tr key={p.id} className="hover:dark:bg-[#0D0D0D] bg-white transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 flex items-center justify-center p-1 shrink-0 rounded-md">
                          <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div>
                          <p className="font-black dark:text-[#F2F2F2] text-gray-900 text-sm">{p.name}</p>
                          <p className="dark:text-[#868686] text-gray-500 text-[10px]">ID: {p.id}</p>
                          {p.badge && (
                            <span className="inline-block mt-0.5 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[#45464f]">{p.category}</td>
                      <td className="p-4 text-[#45464f] font-medium">{p.colorway}</td>
                      <td className="p-4">
                        <p className="font-black dark:text-[#F2F2F2] text-gray-900">${p.price}</p>
                        {p.discountPercent ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded block w-max mt-0.5">
                            {p.discountPercent}% OFF
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <p className={`font-bold text-[11px] ${p.inStock ? 'text-emerald-800' : 'text-red-600'}`}>
                          {p.inStock ? `In Stock (${p.stockCount || 18})` : 'Out of Stock'}
                        </p>
                        <p className="text-[10px] dark:text-[#868686] text-gray-500 mt-0.5 max-w-[120px] truncate">
                          {p.sizes ? p.sizes.join(', ') : 'US 8 - 12'}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleQuickTogglePublish(p)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                          title="Click to toggle customer storefront visibility"
                        >
                          <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          <span>{isPublished ? 'Published' : 'Draft / Hidden'}</span>
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 px-3 py-1.5 font-bold hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id)}
                          className="bg-[#5c0000] dark:text-[#F2F2F2] text-gray-900 px-3 py-1.5 font-bold hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CATEGORIES */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Product Categories</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Organize sneaker classifications and editorial collections.</p>
            </div>
            <button onClick={() => alert('New category dialog opened.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2">
              + Add Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {CATEGORIES.filter(c => c !== 'All Shoes').map((cat, idx) => (
              <div key={idx} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold dark:text-[#868686] text-gray-500 uppercase">Category #{idx + 1}</span>
                  <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900 mt-1">{cat}</h4>
                  <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">{products.filter(p => p.category === cat).length} active silhouettes assigned</p>
                </div>
                <div className="flex gap-2 pt-2 border-t dark:border-[#262626] border-gray-200">
                  <button onClick={() => alert(`Editing category: ${cat}`)} className="w-1/2 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 py-2 text-xs font-bold uppercase">Edit</button>
                  <button onClick={() => alert(`Category ${cat} is locked.`)} className="w-1/2 bg-[#5c0000] dark:text-[#F2F2F2] text-gray-900 py-2 text-xs font-bold uppercase">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. VARIANTS */}
      {activeSubTab === 'variants' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Product Variants</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Manage colorway combinations, materials, and specialized editions.</p>
            </div>
            <button onClick={() => alert('New variant created.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2">
              + Create Variant
            </button>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4">
            <p className="text-xs dark:text-[#868686] text-gray-500">Showing variant mappings for all active footwear lines:</p>
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 text-xs">
                  <div>
                    <p className="font-bold dark:text-[#F2F2F2] text-gray-900">{p.name} ({p.colorway})</p>
                    <p className="dark:text-[#868686] text-gray-500">Materials: {p.materials.join(', ')}</p>
                  </div>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 border border-emerald-200">
                    SKU: EX-{p.id.toUpperCase()}-V1
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SIZES */}
      {activeSubTab === 'sizes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Size Inventory Matrix (US Men's 7 - 13)</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Stock count per shoe size.</p>
            </div>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs">
            <div className="grid grid-cols-7 gap-2 text-center font-bold dark:text-[#F2F2F2] text-gray-900">
              {['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'].map(s => (
                <div key={s} className="p-3 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200">{s}</div>
              ))}
            </div>
            <p className="text-emerald-700 font-bold">● All size allocations are fully synchronized with warehouse stock levels.</p>
          </div>
        </div>
      )}

      {/* 6. COLORS */}
      {activeSubTab === 'colors' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Colorways & Palettes</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Master colorway specifications for sneaker drops.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {['Carbon Black', 'Obsidian Grey', 'Optic White', 'Titanium Silver', 'Midnight Blue'].map((color, i) => (
              <div key={i} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 flex items-center justify-between">
                <div>
                  <p className="font-black dark:text-[#F2F2F2] text-gray-900 text-sm">{color}</p>
                  <p className="dark:text-[#868686] text-gray-500">Used across 4 silhouettes</p>
                </div>
                <div className="w-8 h-8 rounded-full border dark:border-[#262626] border-gray-200 bg-[#D10000]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. INVENTORY */}
      {activeSubTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Warehouse Inventory Control & Variant Adjuster</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">
                Maintain inventory at Product + Size + Color variant level. Update stock, view low-stock alerts, and set reorder targets.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold uppercase dark:text-[#868686] text-gray-500">Filter Stock:</span>
              <button
                onClick={() => setActiveSubTab('inventory')}
                className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-3 py-1 font-bold rounded"
              >
                All Variants
              </button>
            </div>
          </div>

          {/* Granular Inventory Matrix per Product */}
          <div className="space-y-6">
            {products.map((p) => {
              const availableColors = p.colors && p.colors.length > 0 ? p.colors : [p.colorway];
              const availableSizes = p.sizes && p.sizes.length > 0 ? p.sizes : ['US 8', 'US 9', 'US 10', 'US 11'];
              
              const handleVariantStockChange = (color: string, size: string, newStock: number) => {
                const safeStock = Math.max(0, newStock);
                let currentVariants = p.variants ? [...p.variants] : [];

                const varIndex = currentVariants.findIndex(
                  (v) => v.color.toLowerCase() === color.toLowerCase() && v.size === size
                );

                if (varIndex > -1) {
                  currentVariants[varIndex] = { ...currentVariants[varIndex], stock: safeStock };
                } else {
                  currentVariants.push({ color, size, stock: safeStock });
                }

                const totalVariantStock = currentVariants.reduce((sum, v) => sum + v.stock, 0);

                onUpdateProduct({
                  ...p,
                  variants: currentVariants,
                  stockCount: totalVariantStock,
                  inStock: totalVariantStock > 0,
                });
              };

              return (
                <div key={p.id} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-xl p-5 shadow-xs">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b dark:border-[#262626] border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 p-1 rounded-md flex items-center justify-center shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900">{p.name}</h4>
                          {p.published === false && (
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                              Deactivated / Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs dark:text-[#868686] text-gray-500">SKU: EX-{p.id.toUpperCase()} • Total Stock: {p.stockCount || 0} pairs</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        (p.stockCount || 0) <= 0
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : (p.stockCount || 0) <= 10
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {(p.stockCount || 0) <= 0 ? 'OUT OF STOCK' : (p.stockCount || 0) <= 10 ? 'LOW STOCK ALERT' : 'OPTIMAL STOCK'}
                      </span>
                    </div>
                  </div>

                  {/* Colors & Sizes Grid */}
                  <div className="mt-4 space-y-4">
                    {availableColors.map((col) => (
                      <div key={col} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-lg p-3.5">
                        <p className="font-black text-xs dark:text-[#F2F2F2] text-gray-900 uppercase mb-3 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D10000]"></span>
                          <span>Color Variant: {col}</span>
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {availableSizes.map((sz) => {
                            const variantObj = p.variants?.find(
                              (v) => v.color.toLowerCase() === col.toLowerCase() && v.size === sz
                            );
                            const currentStock = variantObj !== undefined ? variantObj.stock : 10;
                            const isOut = currentStock <= 0;
                            const isLow = currentStock > 0 && currentStock <= 3;

                            return (
                              <div
                                key={sz}
                                className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 text-xs transition-all ${
                                  isOut
                                    ? 'bg-red-50 border-red-300'
                                    : isLow
                                    ? 'bg-amber-50 border-amber-300'
                                    : 'dark:bg-[#0D0D0D] bg-white dark:border-[#262626] border-gray-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-extrabold dark:text-[#F2F2F2] text-gray-900">{sz}</span>
                                  {isOut ? (
                                    <span className="text-[9px] font-black uppercase dark:text-[#F2F2F2] text-gray-900 bg-red-100 px-1.5 py-0.5 rounded">OUT OF STOCK</span>
                                  ) : isLow ? (
                                    <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded animate-pulse">LOW STOCK</span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">In Stock</span>
                                  )}
                                </div>

                                {/* Stock Adjuster Controls */}
                                <div className="flex items-center justify-between gap-1 pt-1 border-t dark:border-[#262626] border-gray-200">
                                  <span className="text-[10px] font-bold dark:text-[#868686] text-gray-500 uppercase">Units:</span>
                                  <div className="flex items-center border dark:border-[#262626] border-gray-200 rounded dark:bg-[#0D0D0D] bg-white overflow-hidden">
                                    <button
                                      type="button"
                                      onClick={() => handleVariantStockChange(col, sz, currentStock - 1)}
                                      className="px-2 py-1 text-xs font-black dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border-r dark:border-[#262626] border-gray-200"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      value={currentStock}
                                      onChange={(e) => handleVariantStockChange(col, sz, Number(e.target.value))}
                                      className="w-12 text-center text-xs font-black dark:text-[#F2F2F2] text-gray-900 focus:outline-none bg-transparent py-0.5"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleVariantStockChange(col, sz, currentStock + 1)}
                                      className="px-2 py-1 text-xs font-black dark:hover:bg-[#1a1a1a] hover:dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 border-l dark:border-[#262626] border-gray-200"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Customer Order Fulfillment & Historical Ledger</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Review customer orders, update dispatch status, and inspect preserved order snapshots.</p>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-12 text-center text-xs dark:text-[#868686] text-gray-500">
              No customer orders received yet.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {orders.map((o) => (
                <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 rounded-xl shadow-xs">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b dark:border-[#262626] border-gray-200 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#D10000]">{o.orderId}</span>
                        <span className="text-xs dark:text-[#868686] text-gray-500">• {o.date}</span>
                      </div>
                      <p className="text-xs font-bold dark:text-[#F2F2F2] text-gray-900 mt-0.5">
                        Customer: <span className="font-black text-[#D10000]">{o.shippingAddress.fullName}</span> ({o.shippingAddress.city}, {o.shippingAddress.state})
                      </p>
                      <p className="text-[11px] dark:text-[#868686] text-gray-500">Address: {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.zip}</p>
                      <p className="text-[11px] dark:text-[#868686] text-gray-500">Payment: <strong className="dark:text-[#F2F2F2] text-gray-900">{o.paymentMethod}</strong></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(o.orderId, e.target.value as Order['status'])}
                        className="dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 text-xs font-bold px-3 py-1.5 uppercase dark:text-[#F2F2F2] text-gray-900 rounded outline-none focus:ring-1 focus:ring-[#000f3f]"
                      >
                        <option value="Order Placed">1. Order Placed</option>
                        <option value="Payment Confirmed">2. Payment Confirmed</option>
                        <option value="Order Confirmed">3. Order Confirmed</option>
                        <option value="Processing">4. Processing</option>
                        <option value="Packed">5. Packed</option>
                        <option value="Shipped">6. Shipped</option>
                        <option value="Out for Delivery">7. Out for Delivery</option>
                        <option value="Delivered">8. Delivered</option>
                        <option value="Payment Failed">⚡ Payment Failed</option>
                        <option value="Cancelled">❌ Cancelled</option>
                        <option value="Return Requested">🔄 Return Requested</option>
                        <option value="Returned">📦 Returned</option>
                        <option value="Refund Initiated">💳 Refund Initiated</option>
                        <option value="Refunded">💰 Refunded</option>
                      </select>
                      <span className="font-black text-base dark:text-[#F2F2F2] text-gray-900">${o.total}</span>
                    </div>
                  </div>

                  {/* Render preserved itemSnapshots if present, or fallback to items */}
                  <div className="space-y-2">
                    {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                      o.itemSnapshots.map((snap, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[#45464f] p-2.5 dark:bg-[#0D0D0D] bg-white rounded-lg border dark:border-[#262626] border-gray-200">
                          <div className="flex items-center gap-3">
                            <img src={snap.image} alt={snap.productName} className="w-10 h-10 object-contain mix-blend-multiply dark:bg-white bg-gray-50 border dark:border-gray-200 border-gray-200 rounded p-0.5" />
                            <div>
                              <p className="font-bold dark:text-[#F2F2F2] text-gray-900 text-xs">{snap.quantity}x {snap.productName}</p>
                              <p className="text-[11px] dark:text-[#868686] text-gray-500">Color: {snap.selectedColor} • Size: {snap.selectedSize}</p>
                            </div>
                          </div>
                          <span className="font-extrabold dark:text-[#F2F2F2] text-gray-900">${snap.price * snap.quantity}</span>
                        </div>
                      ))
                    ) : (
                      o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[#45464f] p-2 dark:bg-[#0D0D0D] bg-white rounded border dark:border-[#262626] border-gray-200">
                          <span>{item.quantity}x {item.product ? item.product.name : 'Deactivated Shoe'} (Size: {item.selectedSize})</span>
                          <span className="font-bold">${(item.product ? item.product.price : 0) * item.quantity}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 9. CUSTOMERS */}
      {activeSubTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Customer Database & VIP Members</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Registered accounts, emails, mobile numbers, and lifetime spend.</p>
            </div>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200">
              <div>
                <p className="font-black dark:text-[#F2F2F2] text-gray-900 text-sm">Alex Vance (VIP)</p>
                <p className="dark:text-[#868686] text-gray-500">alex.vance@edgex.studio • +1 (555) 382-9912</p>
              </div>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 font-bold">
                Black Circle Member ($1,420 Spend)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 10. PAYMENTS */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Payment Transactions & Gateway Ledger</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Stripe, UPI, Cards, and Net Banking payment status per order.</p>
            </div>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs">
            {orders.length === 0 ? (
              <p className="dark:text-[#868686] text-gray-500">No payment transactions recorded yet.</p>
            ) : (
              orders.map((o) => (
                <div key={o.orderId} className="flex justify-between items-center p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-lg">
                  <div>
                    <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900">Order {o.orderId} • {o.paymentMethod}</p>
                    <p className="dark:text-[#868686] text-gray-500">Customer: {o.shippingAddress.fullName} ({o.shippingAddress.city}) • {o.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-800 font-extrabold bg-emerald-50 px-3 py-1 border border-emerald-200 uppercase rounded">
                      Paid (${o.total})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 11. RETURNS */}
      {activeSubTab === 'returns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Return Requests & Workflow Management</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Review customer return reasons according to policy, approve or reject return requests, and initiate refunds.</p>
            </div>
            <span className="text-xs font-bold text-[#D10000] bg-blue-50 px-3 py-1 border border-blue-200 rounded">
              {orders.filter((o) => o.returnRequested || o.status === 'Return Requested' || o.status === 'Returned').length} Active Return Request(s)
            </span>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs rounded-xl shadow-xs">
            {orders.filter((o) => o.returnRequested || o.status === 'Return Requested' || o.status === 'Returned' || o.status === 'Refund Initiated' || o.status === 'Refunded').length === 0 ? (
              <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-lg dark:text-[#868686] text-gray-500">
                No active return requests. Submit a return request from Customer Orders view to test cross-dashboard synchronization.
              </div>
            ) : (
              orders
                .filter((o) => o.returnRequested || o.status === 'Return Requested' || o.status === 'Returned' || o.status === 'Refund Initiated' || o.status === 'Refunded')
                .map((o) => (
                  <div key={o.orderId} className="p-5 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-xl space-y-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">Order ID: {o.orderId}</span>
                          <span className="text-xs dark:text-[#868686] text-gray-500">• {o.date}</span>
                        </div>
                        <p className="text-xs font-bold text-[#D10000] mt-0.5">Customer: {o.shippingAddress.fullName} ({o.shippingAddress.city})</p>
                      </div>
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 font-extrabold rounded text-[11px] uppercase">
                        Status: {o.status}
                      </span>
                    </div>

                    <div className="dark:bg-[#0D0D0D] bg-white p-3.5 rounded-lg border dark:border-[#262626] border-gray-200 space-y-1">
                      <p className="dark:text-[#F2F2F2] text-gray-900"><strong>Reason / Details:</strong> {o.returnReason || 'Fit / Size Adjustment'}</p>
                      <p className="dark:text-[#868686] text-gray-500"><strong>Total Order Amount:</strong> ${o.total} • <strong>Payment Channel:</strong> {o.paymentMethod}</p>
                      <p className="dark:text-[#868686] text-gray-500"><strong>Current Refund Status:</strong> {o.refundStatus || `Refund Initiated ($${o.total})`}</p>
                    </div>

                    {/* Workflow Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(o.orderId, 'Returned');
                          alert(`Order ${o.orderId} return approved according to policy.`);
                        }}
                        className="bg-emerald-700 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-extrabold px-3.5 py-1.5 rounded hover:bg-emerald-800 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Approve Return</span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateOrderStatus(o.orderId, 'Delivered');
                          alert(`Order ${o.orderId} return request rejected according to policy.`);
                        }}
                        className="bg-red-700 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-extrabold px-3.5 py-1.5 rounded hover:bg-red-800 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        <span>Reject Return</span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateOrderStatus(o.orderId, 'Refund Initiated');
                          alert(`Refund initiated for Order ${o.orderId} ($${o.total}).`);
                        }}
                        className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[11px] font-extrabold px-3.5 py-1.5 rounded hover:bg-[#D10000] transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
                        <span>Initiate Refund</span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateOrderStatus(o.orderId, 'Refunded');
                          alert(`Refund processed and completed for Order ${o.orderId} ($${o.total}).`);
                        }}
                        className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[11px] font-extrabold px-3.5 py-1.5 rounded hover:bg-[#8a0000] transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">payments</span>
                        <span>Process & Complete Refund</span>
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 12. REFUNDS */}
      {activeSubTab === 'refunds' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Refund Ledger & Payout Workflow</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Track refund status, initiate payouts, and verify credited refunds across payment gateways.</p>
            </div>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs rounded-xl shadow-xs">
            {orders.filter((o) => o.refundStatus || o.status === 'Refunded' || o.status === 'Refund Initiated').length === 0 ? (
              <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-lg dark:text-[#868686] text-gray-500">
                No active refund records found. Initiate or approve a return to generate a refund record.
              </div>
            ) : (
              orders
                .filter((o) => o.refundStatus || o.status === 'Refunded' || o.status === 'Refund Initiated')
                .map((o) => (
                  <div key={o.orderId} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-xl gap-4">
                    <div>
                      <p className="font-extrabold dark:text-[#F2F2F2] text-gray-900 text-sm">Related Order: {o.orderId} • {o.date}</p>
                      <p className="text-[#45464f] mt-0.5">Customer: {o.shippingAddress.fullName} • Method: {o.paymentMethod}</p>
                      <p className="dark:text-[#868686] text-gray-500 text-[11px] mt-0.5">Ref: TXN-REF-{o.orderId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-800 bg-emerald-50 px-3.5 py-1.5 border border-emerald-200 rounded text-xs uppercase">
                        {o.status === 'Refunded' ? `Refunded: $${o.total}` : `Refund Initiated ($${o.total})`}
                      </span>
                      {o.status !== 'Refunded' && (
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(o.orderId, 'Refunded');
                            alert(`Refund of $${o.total} successfully processed for Order ${o.orderId}.`);
                          }}
                          className="bg-emerald-700 dark:text-[#F2F2F2] text-gray-900 text-xs font-bold px-3 py-1.5 rounded hover:bg-emerald-800 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">payments</span>
                          <span>Mark Refunded</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* 13. REVIEWS */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-4">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Customer Reviews & Moderation Hub</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Review ratings submitted by customers, moderate spam/flagged content according to published policy.</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs max-w-md">
              <p className="font-extrabold text-[#D10000] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">gavel</span>
                <span>Published Review Policy</span>
              </p>
              <p className="text-[11px] text-[#45464f] mt-0.5">Reviews must be from verified buyers, contain no external links or promotional spam, and adhere to community standards.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex gap-2 border-b dark:border-[#262626] border-gray-200 pb-3 text-xs overflow-x-auto">
            {['all', 'Published', 'Pending', 'Flagged', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setReviewFilter(status)}
                className={`px-3.5 py-1.5 font-bold uppercase rounded border transition-colors ${
                  reviewFilter === status
                    ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                    : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                }`}
              >
                {status === 'all' ? 'All Reviews' : status}
              </button>
            ))}
          </div>

          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs rounded-xl shadow-xs">
            {reviews.filter((r) => reviewFilter === 'all' || (r.status || 'Published') === reviewFilter).length === 0 ? (
              <p className="dark:text-[#868686] text-gray-500 p-4 dark:bg-[#1a1a1a] bg-gray-50 rounded-lg border dark:border-[#262626] border-gray-200">
                No product reviews match the selected filter.
              </p>
            ) : (
              reviews
                .filter((r) => reviewFilter === 'all' || (r.status || 'Published') === reviewFilter)
                .map((r) => {
                  const statusLabel = r.status || 'Published';
                  return (
                    <div key={r.id} className="p-5 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-xl space-y-3">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <p className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">
                            Product: {r.productName || products.find((p) => p.id === r.productId)?.name || r.productId}
                          </p>
                          <p className="text-xs dark:text-[#868686] text-gray-500">Submitted by <strong className="dark:text-[#F2F2F2] text-gray-900">{r.userName || 'Verified Buyer'}</strong> on {r.date}</p>
                        </div>
                        <span className={`px-3 py-1 font-extrabold text-[11px] uppercase rounded border ${
                          statusLabel === 'Published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : statusLabel === 'Flagged'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : statusLabel === 'Rejected'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          Status: {statusLabel}
                        </span>
                      </div>

                      <div className="dark:bg-[#0D0D0D] bg-white p-3.5 rounded-lg border dark:border-[#262626] border-gray-200 space-y-1.5">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: r.rating || 5 }).map((_, i) => (
                            <span key={i} className="material-symbols-outlined text-sm font-variation-settings-fill">star</span>
                          ))}
                          <span className="text-xs dark:text-[#F2F2F2] text-gray-900 font-bold ml-1.5">{r.rating}.0 / 5.0 Stars</span>
                        </div>
                        <p className="text-xs text-[#45464f] italic">"{r.comment}"</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (onModerateReview) onModerateReview(r.id, 'Published');
                            alert(`Review by ${r.userName || 'Customer'} published according to policy.`);
                          }}
                          className="bg-emerald-700 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-emerald-800 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          <span>Approve & Publish</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onModerateReview) onModerateReview(r.id, 'Flagged');
                            alert(`Review ${r.id} flagged for policy inspection.`);
                          }}
                          className="bg-amber-600 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-amber-700 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">flag</span>
                          <span>Flag for Policy Check</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onModerateReview) onModerateReview(r.id, 'Rejected');
                            alert(`Review ${r.id} rejected / hidden.`);
                          }}
                          className="bg-red-700 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-red-800 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">visibility_off</span>
                          <span>Reject & Hide</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onDeleteReview) onDeleteReview(r.id);
                            alert(`Review ${r.id} deleted from database.`);
                          }}
                          className="bg-[#5c0000] dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-[#D10000] transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 14. COUPONS */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Coupons & Discounts Management</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Active promotional codes, discount percentages, and expiry dates.</p>
            </div>
            <button onClick={() => alert('New coupon created.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2">
              + Create Coupon
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm text-[#D10000]">VIP20</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 font-bold">20% OFF</span>
              </div>
              <p className="dark:text-[#868686] text-gray-500">Eligible for Black Circle members • Expires Dec 31, 2026</p>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-black text-sm text-[#D10000]">DROP15</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 font-bold">$15 OFF</span>
              </div>
              <p className="dark:text-[#868686] text-gray-500">Applies to all drop silhouettes • Expires Aug 30, 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* 15. DELIVERIES */}
      {activeSubTab === 'deliveries' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Delivery & Air Courier Dispatch Center</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Manage shipping status, tracking numbers, delivery notes/exceptions, and out-for-delivery confirmations.</p>
            </div>
            <span className="text-xs font-bold text-[#D10000] bg-blue-50 px-3 py-1 border border-blue-200 rounded">
              {orders.length} Active Orders Handled
            </span>
          </div>

          <div className="space-y-4">
            {orders.map((o) => {
              const trackingNum = o.trackingNumber || `EX-TRK-${o.orderId.replace('EX-', '')}`;
              const carrier = o.carrier || 'FedEx Express Air';
              const expectedDate = o.expectedDeliveryDate || 'Aug 10, 2026';

              return (
                <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 rounded-xl space-y-4 shadow-xs">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-3 border-b dark:border-[#262626] border-gray-200 gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-[#D10000]">Order ID: {o.orderId}</span>
                        <span className="dark:text-[#868686] text-gray-500">• {o.date}</span>
                      </div>
                      <p className="text-[#45464f] mt-0.5">
                        Recipient: <strong>{o.shippingAddress.fullName}</strong> ({o.shippingAddress.city}, {o.shippingAddress.state})
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-900 border border-blue-200 rounded">
                        Status: {o.status}
                      </span>
                      <span className="font-black text-base dark:text-[#F2F2F2] text-gray-900">${o.total}</span>
                    </div>
                  </div>

                  <div className="dark:bg-[#1a1a1a] bg-gray-50 p-4 rounded-lg border dark:border-[#262626] border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="dark:text-[#868686] text-gray-500 block font-bold">Tracking Number:</span>
                      <span className="font-black dark:text-[#F2F2F2] text-gray-900">{trackingNum}</span>
                    </div>
                    <div>
                      <span className="dark:text-[#868686] text-gray-500 block font-bold">Courier Carrier:</span>
                      <span className="font-bold dark:text-[#F2F2F2] text-gray-900">{carrier}</span>
                    </div>
                    <div>
                      <span className="dark:text-[#868686] text-gray-500 block font-bold">Expected Delivery:</span>
                      <span className="font-bold dark:text-[#F2F2F2] text-gray-900">{expectedDate}</span>
                    </div>
                  </div>

                  {o.deliveryNotes && (
                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
                      <strong>Delivery Exception / Status Note:</strong> {o.deliveryNotes}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t dark:border-[#262626] border-gray-200">
                    <span className="text-xs font-bold dark:text-[#F2F2F2] text-gray-900 mr-2">Update Shipping Status:</span>
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(o.orderId, 'Shipped');
                        alert(`Order ${o.orderId} status set to Shipped.`);
                      }}
                      className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-[#8a0000] transition-colors"
                    >
                      Set Shipped
                    </button>
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(o.orderId, 'Out for Delivery');
                        alert(`Order ${o.orderId} status set to Out for Delivery.`);
                      }}
                      className="bg-amber-600 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-amber-700 transition-colors"
                    >
                      Set Out for Delivery
                    </button>
                    <button
                      onClick={() => {
                        onUpdateOrderStatus(o.orderId, 'Delivered');
                        alert(`Order ${o.orderId} marked as Delivered.`);
                      }}
                      className="bg-emerald-700 dark:text-[#F2F2F2] text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded hover:bg-emerald-800 transition-colors"
                    >
                      Set Delivered
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 16. NOTIFICATIONS */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-4">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Owner Real-Time Alerts & Operations Dispatch</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Live automated notifications for orders, payments, stock levels, return/refund requests, reviews, and support tickets.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => alert('Broadcast drop alert dispatched to all 412 registered customers.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2 rounded hover:bg-[#8a0000] transition-colors">
                + Broadcast Customer Drop Alert
              </button>
            </div>
          </div>

          {/* Owner Notification Category Filter Bar */}
          <div className="flex gap-2 border-b dark:border-[#262626] border-gray-200 pb-3 text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'new_order', label: 'New Orders' },
              { id: 'payment', label: 'Payment Events' },
              { id: 'low_stock', label: 'Low Stock' },
              { id: 'out_of_stock', label: 'Out of Stock' },
              { id: 'return', label: 'Return Requests' },
              { id: 'refund', label: 'Refund Requests' },
              { id: 'review', label: 'New Reviews' },
              { id: 'support', label: 'Support Requests' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setNotifFilter(cat.id)}
                className={`px-3.5 py-1.5 font-bold uppercase rounded border transition-colors shrink-0 ${
                  notifFilter === cat.id
                    ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                    : 'dark:bg-[#0D0D0D] bg-white dark:text-[#F2F2F2] text-gray-900 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Real-time Owner Alerts Log */}
          <div className="space-y-3">
            {[
              {
                id: 'on-1',
                category: 'new_order',
                badge: 'New Order',
                color: 'bg-blue-50 text-blue-900 border-blue-200',
                icon: 'shopping_bag',
                title: 'New Order Received: EX-48912',
                details: 'Customer Alex Vance placed order for Apex Vol. 1 - Carbon Black (Size US 9.5). Total: ₹15,600',
                time: '10 mins ago • Aug 8, 2026',
              },
              {
                id: 'on-2',
                category: 'payment',
                badge: 'Payment Event',
                color: 'bg-emerald-50 text-emerald-900 border-emerald-200',
                icon: 'verified_user',
                title: 'Payment Confirmed: Order EX-48912',
                details: 'Instant UPI Payment (₹15,600 via GPAY) successfully settled and verified.',
                time: '10 mins ago • Aug 8, 2026',
              },
              {
                id: 'on-3',
                category: 'return',
                badge: 'Return Request',
                color: 'bg-amber-50 text-amber-900 border-amber-200',
                icon: 'assignment_return',
                title: 'New Return Request: Order EX-98102',
                details: 'Customer Alex Vance submitted a return request for Apex Vol. 1. Reason: Fit / Size Adjustment.',
                time: '2 hours ago • Aug 8, 2026',
              },
              {
                id: 'on-4',
                category: 'refund',
                badge: 'Refund Request',
                color: 'bg-purple-50 text-purple-900 border-purple-200',
                icon: 'account_balance_wallet',
                title: 'Refund Action Required: Order EX-98102',
                details: 'Return received at fulfillment warehouse. Refund payout of ₹19,200 ready for store owner processing.',
                time: '3 hours ago • Aug 8, 2026',
              },
              {
                id: 'on-5',
                category: 'low_stock',
                badge: 'Low Stock Alert',
                color: 'bg-amber-100 text-amber-900 border-amber-300',
                icon: 'inventory_2',
                title: 'Low Stock Warning: Apex Runner Vol. 1',
                details: 'Only 3 units remaining in warehouse (Size US 10, Carbon Black). Reorder recommended.',
                time: '5 hours ago • Aug 8, 2026',
              },
              {
                id: 'on-6',
                category: 'out_of_stock',
                badge: 'Out of Stock',
                color: 'bg-red-50 text-red-900 border-red-200',
                icon: 'do_not_disturb_on',
                title: 'Out of Stock: Vector Knit High-Top',
                details: 'Variant Size US 11 in Onyx Black is completely out of stock.',
                time: '1 day ago • Aug 7, 2026',
              },
              {
                id: 'on-7',
                category: 'review',
                badge: 'New Review',
                color: 'bg-indigo-50 text-indigo-900 border-indigo-200',
                icon: 'rate_review',
                title: 'New 5-Star Review Submitted',
                details: 'Alex Vance reviewed "Apex Runner Vol. 1": "Incredible streetwear silhouette. Italian calfskin holds up great."',
                time: '1 day ago • Aug 7, 2026',
              },
              {
                id: 'on-8',
                category: 'support',
                badge: 'Support Request',
                color: 'bg-teal-50 text-teal-900 border-teal-200',
                icon: 'headset_mic',
                title: 'New Support Ticket #SUP-8821',
                details: 'Inquiry from customer regarding size guide recommendation for wider feet.',
                time: '2 days ago • Aug 6, 2026',
              },
            ]
              .filter((item) => notifFilter === 'all' || item.category === notifFilter)
              .map((item) => (
                <div key={item.id} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg border ${item.color} shrink-0`}>
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  </div>
                  <div className="flex-grow text-xs space-y-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded border ${item.color}`}>
                          {item.badge}
                        </span>
                        <strong className="dark:text-[#F2F2F2] text-gray-900 text-sm">{item.title}</strong>
                      </div>
                      <span className="text-[11px] dark:text-[#868686] text-gray-500 font-semibold">{item.time}</span>
                    </div>
                    <p className="text-[#45464f] text-xs pt-0.5">{item.details}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 17. SALES */}
      {activeSubTab === 'sales' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Sales Performance & Revenue</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Detailed breakdown of sales velocity and conversion metrics.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-3">
              <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900">Weekly Revenue (₹)</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e3e1" />
                    <XAxis dataKey="name" stroke="#767680" fontSize={12} />
                    <YAxis stroke="#767680" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#0051d5" fill="#dbe1ff" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-3">
              <h4 className="font-black text-base dark:text-[#F2F2F2] text-gray-900">Top Selling Silhouettes</h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSelling} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e3e1" />
                    <XAxis dataKey="name" stroke="#767680" fontSize={11} />
                    <YAxis stroke="#767680" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#172554" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 18. ANALYTICS */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Advanced Traffic & Conversion Analytics</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Visitor behavior, drop engagement, and cart abandonment rates.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-2">
              <p className="font-bold dark:text-[#868686] text-gray-500 uppercase">Unique Storefront Visits</p>
              <p className="text-3xl font-black dark:text-[#F2F2F2] text-gray-900">18,490</p>
              <p className="text-emerald-700 font-bold">↑ 22% vs last week</p>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-2">
              <p className="font-bold dark:text-[#868686] text-gray-500 uppercase">Cart Abandonment Rate</p>
              <p className="text-3xl font-black dark:text-[#F2F2F2] text-gray-900">14.2%</p>
              <p className="text-emerald-700 font-bold">↓ 3.1% improvement</p>
            </div>
            <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-2">
              <p className="font-bold dark:text-[#868686] text-gray-500 uppercase">Average Order Value (AOV)</p>
              <p className="text-3xl font-black dark:text-[#F2F2F2] text-gray-900">₹18,800</p>
              <p className="text-emerald-700 font-bold">Strong multi-item buys</p>
            </div>
          </div>
        </div>
      )}

      {/* 19. REPORTS */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Financial & Inventory Reports</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Download monthly accounting statements and tax summaries.</p>
            </div>
            <button onClick={() => alert('Report generated and downloaded successfully.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2">
              Download PDF Report
            </button>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-3 text-xs">
            <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-bold dark:text-[#F2F2F2] text-gray-900">July 2026 Financial & Tax Statement</p>
                <p className="dark:text-[#868686] text-gray-500">Includes gross revenue, sales tax collected, and courier expenses.</p>
              </div>
              <button onClick={() => alert('Downloading PDF...')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 px-3 py-1.5 font-bold uppercase">Download</button>
            </div>
          </div>
        </div>
      )}

      {/* 20. SUPPORT */}
      {activeSubTab === 'support' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Customer Support & Tickets</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Manage inquiries regarding sizing, returns, and order tracking.</p>
            </div>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs">
            <div className="p-4 dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold dark:text-[#F2F2F2] text-gray-900">Ticket #TICK-8841 - Alex Vance</span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 font-bold">Resolved</span>
              </div>
              <p className="dark:text-[#868686] text-gray-500">"Inquiry regarding tracking number for Apex Vol. 1 dispatch."</p>
            </div>
          </div>
        </div>
      )}

      {/* 21. WEBSITE */}
      {activeSubTab === 'website' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Website & Storefront Management</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Hero banners, marquee announcements, and theme customizations.</p>
            </div>
            <button onClick={() => alert('Website settings saved.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2">
              Save Changes
            </button>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Marquee Announcement Text</label>
              <input type="text" defaultValue="LIMITED DROP 04 LIVE NOW — FREE EXPRESS SHIPPING WORLDWIDE ON ORDERS OVER ₹2000" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Hero Headline</label>
              <input type="text" defaultValue="ENGINEERED SILHOUETTES FOR MODERN ARCHITECTURE." className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" />
            </div>
          </div>
        </div>
      )}

      {/* 22. SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b dark:border-[#262626] border-gray-200">
            <div>
              <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Owner Account & Store Settings</h3>
              <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Admin credentials, currency, tax rates, and security.</p>
            </div>
            <button onClick={() => alert('Settings updated successfully.')} className="bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-xs font-bold uppercase px-4 py-2">
              Save Settings
            </button>
          </div>
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Store Currency</label>
              <input type="text" defaultValue="INR (₹)" className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" />
            </div>
            <div className="space-y-1">
              <label className="font-bold uppercase dark:text-[#868686] text-gray-500">Default Tax Rate (%)</label>
              <input type="number" defaultValue={8.5} className="w-full p-3 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white font-bold" />
            </div>
          </div>
        </div>
      )}

      {/* Product Edit / Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-[#F2F2F2] bg-black/60 backdrop-blur-xs">
          <div className="dark:bg-[#0D0D0D] bg-white w-full max-w-2xl border dark:border-[#262626] border-gray-200 shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b dark:border-[#262626] border-gray-200">
              <div>
                <h2 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">
                  {currentProduct ? 'Edit Shoe Silhouette' : 'Add New Streetwear Shoe'}
                </h2>
                <p className="text-xs dark:text-[#868686] text-gray-500 mt-0.5">
                  Configure pricing, stock, size variants, materials, and publication settings.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleSaveProduct(e)} className="space-y-5 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Product / Shoe Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Vol. 2 High-Top"
                  className="w-full px-3 py-2.5 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none font-medium"
                />
              </div>

              {/* Price, Discount, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none dark:bg-[#0D0D0D] bg-white font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== 'All Shoes').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Badge & Colorway */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Badge Tag</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value as Product['badge'] })}
                    className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none dark:bg-[#0D0D0D] bg-white font-medium"
                  >
                    <option value="New">New</option>
                    <option value="Limited">Limited</option>
                    <option value="Sale">Sale</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Colorway *</label>
                  <input
                    type="text"
                    required
                    value={formData.colorway}
                    onChange={(e) => setFormData({ ...formData, colorway: e.target.value })}
                    placeholder="e.g. Optic White / Off-White"
                    className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none"
                  />
                </div>
              </div>

              {/* Stock Count & Stock Switch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:bg-[#1a1a1a] bg-gray-50 p-3.5 border dark:border-[#262626] border-gray-200">
                <div>
                  <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Inventory / Stock Count</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm dark:bg-[#0D0D0D] bg-white focus:border-[#D10000] outline-none font-bold"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#000f3f]"
                  />
                  <label htmlFor="inStockCheck" className="font-extrabold uppercase dark:text-[#F2F2F2] text-gray-900 cursor-pointer">
                    Shoe Available In Stock
                  </label>
                </div>
              </div>

              {/* Sizes Selection */}
              <div>
                <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1.5">
                  Available Sizes ({formData.sizes.length} selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['US 7', 'US 7.5', 'US 8', 'US 8.5', 'US 9', 'US 9.5', 'US 10', 'US 10.5', 'US 11', 'US 11.5', 'US 12', 'US 13'].map((sz) => {
                    const isSelected = formData.sizes.includes(sz);
                    return (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== sz) });
                          } else {
                            setFormData({ ...formData, sizes: [...formData.sizes, sz] });
                          }
                        }}
                        className={`px-3 py-1.5 border text-xs font-extrabold rounded transition-all ${
                          isSelected
                            ? 'bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 border-[#D10000]'
                            : 'dark:bg-[#0D0D0D] bg-white dark:text-[#868686] text-gray-500 dark:border-[#262626] border-gray-200 dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-xs focus:border-[#D10000] outline-none font-mono text-[11px]"
                />
              </div>

              {/* Materials & Sole Info */}
              <div>
                <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Material / Sole Information</label>
                <input
                  type="text"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  placeholder="e.g. Italian Calfskin, Ballistic Mesh, Vibram Outsole"
                  className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase dark:text-[#F2F2F2] text-gray-900 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-[#262626] border-gray-200 text-sm focus:border-[#D10000] outline-none"
                />
              </div>

              {/* Visibility / Publication Radio Options */}
              <div className="p-4 border dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white space-y-2">
                <label className="block font-extrabold uppercase dark:text-[#F2F2F2] text-gray-900">
                  Publication & Storefront Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setFormData({ ...formData, published: true })}
                    className={`p-3 border rounded-md cursor-pointer flex items-start gap-2.5 transition-all ${
                      formData.published
                        ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-600'
                        : 'dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publicationStatus"
                      checked={formData.published}
                      onChange={() => setFormData({ ...formData, published: true })}
                      className="mt-0.5 accent-emerald-700"
                    />
                    <div>
                      <p className="font-extrabold text-emerald-900 text-xs">Published (Customer Visible)</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Appears live immediately in the customer product catalog.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, published: false })}
                    className={`p-3 border rounded-md cursor-pointer flex items-start gap-2.5 transition-all ${
                      !formData.published
                        ? 'border-amber-600 bg-amber-50/80 ring-1 ring-amber-600'
                        : 'dark:border-[#262626] border-gray-200 dark:bg-[#0D0D0D] bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="publicationStatus"
                      checked={!formData.published}
                      onChange={() => setFormData({ ...formData, published: false })}
                      className="mt-0.5 accent-amber-700"
                    />
                    <div>
                      <p className="font-extrabold text-amber-900 text-xs">Draft / Hidden</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Only visible in Owner Dashboard -&gt; Products until published.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t dark:border-[#262626] border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-1/3 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 py-3 font-bold uppercase tracking-widest hover:bg-[#c6c5d0] rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProduct(undefined, false)}
                  className="w-full sm:w-1/3 bg-amber-600 dark:text-[#F2F2F2] text-gray-900 py-3 font-bold uppercase tracking-widest hover:bg-amber-700 rounded transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProduct(undefined, true)}
                  className="w-full sm:w-1/3 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 py-3 font-bold uppercase tracking-widest hover:bg-[#8a0000] rounded transition-colors"
                >
                  Save &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

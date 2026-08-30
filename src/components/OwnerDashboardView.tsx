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
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  Ruler,
  Palette,
  Warehouse,
  ShoppingBag,
  Users,
  CreditCard,
  RotateCcw,
  Receipt,
  Star,
  TicketPercent,
  Truck,
  Bell,
  TrendingUp,
  BarChart3,
  FileText,
  Headphones,
  Globe,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Search,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Zap,
  Clock,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react';

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
  const [recentTabs, setRecentTabs] = useState<string[]>(['overview', 'products', 'orders', 'sales']);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [reviewFilter, setReviewFilter] = useState<string>('all');
  const [notifFilter, setNotifFilter] = useState<string>('all');
  const [sidebarSearch, setSidebarSearch] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const handleSelectTab = (tabId: string) => {
    setActiveSubTab(tabId);
    setRecentTabs((prev) => {
      const filtered = prev.filter((id) => id !== tabId);
      return [tabId, ...filtered].slice(0, 4);
    });
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };
  
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

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const optionDescriptions: Record<string, string> = {
    overview: 'High-level operational pulse, real-time revenue, conversion rates, and recent orders.',
    sales: 'Detailed sales performance metrics, revenue trajectories, and top-earning products.',
    analytics: 'Customer traffic breakdown, bounce rates, conversion funnels, and cart abandonment insights.',
    reports: 'Exportable executive performance summaries, quarterly projections, and balance sheets.',
    products: 'Manage active footwear drops, create new products, toggle availability, and edit metadata.',
    categories: 'Organize drops into High-Top, Low-Top, Runners, Boots, and Luxury categories.',
    variants: 'Configure product SKU editions, limited-edition colorways, and material variations.',
    sizes: 'Standard US/UK/EU sizing matrix and size-specific availability management.',
    colors: 'Define brand colorways, hex codes, material finishes, and accent combinations.',
    inventory: 'Real-time warehouse stock tracking, threshold warnings, and low-inventory restock alerts.',
    orders: 'Review customer fulfillment pipeline, process pending orders, and print shipping tags.',
    deliveries: 'Courier routing, DHL/FedEx dispatch status, tracking numbers, and delivery confirmation.',
    returns: 'Manage customer exchange and return merchandise authorizations (RMA).',
    refunds: 'Authorize customer payment reversals, refund balances, and process store credits.',
    payments: 'Stripe, Apple Pay, and cryptocurrency gateway transactions and payout logs.',
    customers: 'Customer CRM directory, lifetime value metrics, VIP tier statuses, and order histories.',
    reviews: 'Moderate verified buyer feedback, ratings, review comments, and customer media.',
    coupons: 'Create promotional voucher codes, percentage discounts, and countdown drop promos.',
    notifications: 'Configure real-time system alerts, drop broadcast emails, and inventory alerts.',
    support: 'Handle live customer concierge tickets, live inquiries, and VIP support queues.',
    website: 'Customize store hero banners, announcement tickers, lookbooks, and homepage layout.',
    settings: 'Security controls, 2-factor authentication, team permissions, and API credentials.',
  };

  // Grouped Navigation Items with Icons and Badges
  const navigationGroups: NavGroup[] = [
    {
      group: 'Analytics & Performance',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'sales', label: 'Sales Performance', icon: TrendingUp },
        { id: 'analytics', label: 'Store Analytics', icon: BarChart3 },
        { id: 'reports', label: 'Executive Reports', icon: FileText },
      ],
    },
    {
      group: 'Catalog & Merchandising',
      items: [
        { id: 'products', label: 'Products Catalog', icon: Package, badge: products.length },
        { id: 'categories', label: 'Categories', icon: Layers, badge: CATEGORIES.length - 1 },
        { id: 'variants', label: 'Product Variants', icon: Boxes },
        { id: 'sizes', label: 'Sizes Matrix', icon: Ruler },
        { id: 'colors', label: 'Colorways & Palettes', icon: Palette },
        {
          id: 'inventory',
          label: 'Inventory & Stock',
          icon: Warehouse,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        },
      ],
    },
    {
      group: 'Orders & Operations',
      items: [
        {
          id: 'orders',
          label: 'Customer Orders',
          icon: ShoppingBag,
          badge: pendingOrders > 0 ? `${pendingOrders} Pending` : undefined,
          badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
        },
        { id: 'deliveries', label: 'Deliveries & Logistics', icon: Truck },
        { id: 'returns', label: 'Product Returns', icon: RotateCcw, badge: returnsCount },
        { id: 'refunds', label: 'Refunds Processing', icon: Receipt, badge: pendingRefundsCount },
        { id: 'payments', label: 'Payments & Gateways', icon: CreditCard },
      ],
    },
    {
      group: 'Customer & Community',
      items: [
        { id: 'customers', label: 'Customer Base', icon: Users, badge: totalCustomers },
        { id: 'reviews', label: 'Reviews & Feedback', icon: Star, badge: reviews.length },
        { id: 'coupons', label: 'Coupons & Discounts', icon: TicketPercent, badge: '4 Active' },
        {
          id: 'notifications',
          label: 'System Notifications',
          icon: Bell,
          badge: notifications.filter((n) => !n.read).length || 3,
        },
        { id: 'support', label: 'Customer Support', icon: Headphones, badge: 'Live' },
      ],
    },
    {
      group: 'Storefront & Settings',
      items: [
        { id: 'website', label: 'Website Management', icon: Globe },
        { id: 'settings', label: 'Settings & Security', icon: Settings },
      ],
    },
  ];

  // Flattened for search
  const allNavItems: NavItem[] = navigationGroups.flatMap((g) => g.items);
  const filteredGroups: NavGroup[] = navigationGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item: NavItem) =>
        item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        item.id.toLowerCase().includes(sidebarSearch.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  const activeItemDetails: NavItem = allNavItems.find((item) => item.id === activeSubTab) || allNavItems[0];
  const activeGroup = navigationGroups.find((g) => g.items.some((item) => item.id === activeSubTab));

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b dark:border-[#262626] border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xs font-['Bebas_Neue',sans-serif]">
              EX
            </div>
            <div>
              <p className="text-xs font-bold dark:text-white text-gray-900 leading-none">Console Nav</p>
              <p className="text-[10px] dark:text-neutral-400 text-gray-500 mt-0.5">22 Operational Controls</p>
            </div>
          </div>
          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded">
            Admin
          </span>
        </div>

        {/* Real-time search filter inside sidebar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            placeholder="Search all 22 options..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#2A2A2A] border-gray-200 dark:text-white text-gray-900 placeholder:text-neutral-500 focus:outline-none focus:border-red-500 transition-colors"
          />
          {sidebarSearch && (
            <button
              onClick={() => setSidebarSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Recently visited pills */}
        {recentTabs.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-[10px] dark:text-neutral-400 text-gray-500 font-semibold mb-1">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>Recent Tabs</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recentTabs.map((tabId) => {
                const tab = allNavItems.find((n) => n.id === tabId);
                if (!tab) return null;
                const isActive = activeSubTab === tabId;
                return (
                  <button
                    key={tabId}
                    onClick={() => {
                      handleSelectTab(tabId);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded-md transition-colors cursor-pointer truncate max-w-[110px] ${
                      isActive
                        ? 'bg-red-600 text-white font-bold'
                        : 'dark:bg-[#1f1f1f] bg-gray-100 dark:text-neutral-300 text-gray-700 hover:bg-red-500/10 hover:text-red-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Groups with Collapsible Accordions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {filteredGroups.length === 0 ? (
          <div className="py-8 text-center text-xs dark:text-neutral-500 text-gray-400">
            No matching options found.
          </div>
        ) : (
          filteredGroups.map((grp) => {
            const isCollapsed = !sidebarSearch && !!collapsedGroups[grp.group];
            return (
              <div key={grp.group} className="space-y-1">
                <button
                  onClick={() => toggleGroupCollapse(grp.group)}
                  className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider dark:text-neutral-400 text-gray-500 px-3 py-1.5 rounded-lg dark:hover:bg-[#1a1a1a] hover:bg-gray-100 transition-colors group cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <span>{grp.group}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full dark:bg-[#222] bg-gray-200 text-neutral-400">
                      {grp.items.length}
                    </span>
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 pt-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSubTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleSelectTab(item.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                            isActive
                              ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/20'
                              : 'dark:text-neutral-300 text-gray-700 dark:hover:bg-[#1a1a1a] hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-white' : 'dark:text-neutral-400 text-gray-500 group-hover:text-red-500'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeColor ||
                                    'dark:bg-[#222] bg-gray-200 dark:text-neutral-300 text-gray-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t dark:border-[#262626] border-gray-200 dark:bg-[#141414] bg-gray-50/50 rounded-b-2xl">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-black">
            NA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold dark:text-white text-gray-900 truncate">Neravati Abhigna</p>
            <p className="text-[10px] text-emerald-400 truncate">neravatiabhigna@gmail.com</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={onSwitchToCustomer}
            className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold dark:bg-[#222] bg-white border dark:border-[#333] border-gray-200 dark:text-neutral-300 text-gray-700 rounded-lg hover:border-red-500 transition-colors cursor-pointer"
          >
            <span>Customer View</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-1 py-1.5 px-2 text-[10px] font-bold dark:bg-red-950/30 bg-red-50 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-2.5 h-2.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#B00000] via-[#D10000] to-[#800000] text-white p-5 sm:p-6 mb-6 rounded-2xl shadow-xl mx-3 sm:mx-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="lg:hidden p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl border border-white/20 transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
            aria-label="Toggle navigation sidebar"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 px-2.5 py-0.5 rounded text-white border border-white/10">
                Owner &amp; Operations Portal
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Node Online
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-1 font-['Bebas_Neue',sans-serif]">
              EDGEX Central Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={onSwitchToCustomer}
            className="bg-black hover:bg-neutral-900 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>View Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLogout}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Layout Container: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-6 px-3 sm:px-6">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 dark:bg-[#121212] bg-white border dark:border-[#262626] border-gray-200 rounded-2xl shadow-sm overflow-hidden max-h-[calc(100vh-6.5rem)] flex flex-col">
            {renderSidebarContent()}
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL / DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative w-4/5 max-w-xs dark:bg-[#121212] bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden">
              <div className="p-4 border-b dark:border-[#262626] border-gray-200 flex items-center justify-between">
                <span className="font-bold text-sm dark:text-white text-gray-900 uppercase tracking-wider">
                  Dashboard Navigation
                </span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg dark:hover:bg-neutral-800 hover:bg-gray-100 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {renderSidebarContent()}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* Quick Actions Shortcuts Bar */}
          <div className="mb-4 overflow-x-auto pb-1 no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              <span className="text-[10px] font-extrabold uppercase tracking-wider dark:text-neutral-500 text-gray-400 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Quick Jump:
              </span>
              <button
                onClick={() => handleSelectTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'overview'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => {
                  handleSelectTab('products');
                  handleOpenAdd();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold dark:bg-red-950/40 bg-red-50 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
              <button
                onClick={() => handleSelectTab('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'orders'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
                {pendingOrders > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded-full font-black">
                    {pendingOrders}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSelectTab('inventory')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'inventory'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <Warehouse className="w-3.5 h-3.5" />
                <span>Inventory</span>
                {lowStockCount > 0 && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-full font-black">
                    {lowStockCount} Low
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSelectTab('sales')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'sales'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sales Stats</span>
              </button>
              <button
                onClick={() => handleSelectTab('customers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'customers'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>CRM</span>
              </button>
              <button
                onClick={() => handleSelectTab('support')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'support'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'dark:bg-[#151515] bg-white border dark:border-[#262626] border-gray-200 dark:text-neutral-300 text-gray-700 hover:border-red-500'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Support</span>
              </button>
            </div>
          </div>

          {/* Contextual Section Header Banner */}
          <div className="dark:bg-[#121212] bg-white border dark:border-[#262626] border-gray-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <span className="dark:text-neutral-500 text-gray-400">Owner Portal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="dark:text-neutral-400 text-gray-600 font-medium">{activeGroup?.group}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-red-500 font-bold">{activeItemDetails.label}</span>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <h2 className="text-lg sm:text-xl font-black dark:text-white text-gray-900 tracking-tight">
                    {activeItemDetails.label}
                  </h2>
                  {activeItemDetails.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        activeItemDetails.badgeColor || 'dark:bg-[#222] bg-gray-200 dark:text-neutral-300 text-gray-700'
                      }`}
                    >
                      {activeItemDetails.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs dark:text-neutral-400 text-gray-500 leading-relaxed max-w-3xl">
                  {optionDescriptions[activeSubTab] || 'Manage store operations, analytics, drops, and customer orders.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {activeSubTab !== 'overview' && (
                  <button
                    onClick={() => handleSelectTab('overview')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold dark:bg-[#1a1a1a] bg-gray-100 dark:text-neutral-300 text-gray-700 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Overview</span>
                  </button>
                )}

                {activeSubTab === 'products' && (
                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Drop</span>
                  </button>
                )}

                {/* Mobile sidebar trigger */}
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-500/30"
                >
                  <Menu className="w-3.5 h-3.5" />
                  <span>All 22 Options</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">

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

          {/* Recent Orders Spotlight with Sneaker Images */}
          <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-6 rounded-xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b dark:border-[#262626] border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#D10000]" />
                <h4 className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">Recent Customer Orders & Product Previews</h4>
              </div>
              <button
                onClick={() => handleSelectTab('orders')}
                className="text-xs font-bold text-[#D10000] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({orders.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs dark:text-[#868686] text-gray-500 py-4 text-center">No orders recorded yet. Book a pair from the storefront to see live order cards.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.slice(0, 3).map((o) => (
                  <div key={o.orderId} className="p-3.5 dark:bg-[#141414] bg-gray-50 rounded-xl border dark:border-[#262626] border-gray-200 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[#D10000]">{o.orderId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-500">
                        {o.status}
                      </span>
                    </div>
                    <p className="font-bold dark:text-[#F2F2F2] text-gray-900">
                      {o.shippingAddress?.fullName || 'Customer'} • <span className="text-[#D10000]">₹{o.total.toLocaleString('en-IN')}</span>
                    </p>
                    {/* Sneaker Images Row */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                        o.itemSnapshots.map((snap, sIdx) => (
                          <div
                            key={sIdx}
                            onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                            className="relative w-12 h-12 shrink-0 bg-white rounded-lg border dark:border-gray-200 border-gray-200 p-0.5 flex items-center justify-center cursor-zoom-in group shadow-xs"
                            title={`${snap.productName} (${snap.selectedSize})`}
                          >
                            <img src={snap.image} alt={snap.productName} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                          </div>
                        ))
                      ) : (
                        o.items.map((it, iIdx) => it.product?.image ? (
                          <div
                            key={iIdx}
                            onClick={() => setPreviewImage({ url: it.product.image, title: it.product.name })}
                            className="relative w-12 h-12 shrink-0 bg-white rounded-lg border dark:border-gray-200 border-gray-200 p-0.5 flex items-center justify-center cursor-zoom-in group shadow-xs"
                            title={`${it.product.name} (${it.selectedSize})`}
                          >
                            <img src={it.product.image} alt={it.product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                          </div>
                        ) : null)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
      {activeSubTab === 'orders' && (() => {
        const filteredOrders = orders.filter((o) => {
          if (!orderSearchQuery.trim()) return true;
          const q = orderSearchQuery.toLowerCase();
          const matchId = o.orderId.toLowerCase().includes(q);
          const matchCust = o.shippingAddress?.fullName?.toLowerCase().includes(q) || false;
          const matchCity = o.shippingAddress?.city?.toLowerCase().includes(q) || false;
          const matchItems = (o.itemSnapshots || []).some((s) => s.productName?.toLowerCase().includes(q)) ||
            (o.items || []).some((i) => i.product?.name?.toLowerCase().includes(q));
          return matchId || matchCust || matchCity || matchItems;
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-[#262626] border-gray-200">
              <div>
                <h3 className="text-xl font-black dark:text-[#F2F2F2] text-gray-900">Customer Order Fulfillment & Historical Ledger</h3>
                <p className="text-xs dark:text-[#868686] text-gray-500 mt-1">Review live customer orders, inspect high-resolution product snapshots, and manage delivery status.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 dark:text-neutral-400 text-gray-500" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by order ID, customer, sneaker..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-lg dark:text-[#F2F2F2] text-gray-900 outline-none focus:border-[#D10000]"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
                <span className="text-xs font-bold text-[#D10000] dark:bg-red-950/40 bg-red-50 px-3 py-1.5 border border-red-200 dark:border-red-900 rounded-lg shrink-0">
                  {filteredOrders.length} Order{filteredOrders.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-12 text-center text-xs dark:text-[#868686] text-gray-500 rounded-xl space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-gray-400" />
                <p className="font-bold text-sm dark:text-gray-300 text-gray-700">No orders matching your criteria.</p>
                <p className="text-xs">Customer orders booked on the storefront will appear here with complete snapshot imagery.</p>
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {filteredOrders.map((o) => {
                  const trackingNum = o.trackingNumber || `EX-TRK-${o.orderId.replace('EX-', '')}`;
                  return (
                    <div key={o.orderId} className="dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 p-5 sm:p-6 space-y-4 rounded-xl shadow-xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
                      {/* Top Bar: Order ID, Date, Customer info & Status Dropdown */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b dark:border-[#262626] border-gray-200 gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-base text-[#D10000] tracking-wide">{o.orderId}</span>
                            <span className="text-xs font-semibold dark:text-[#868686] text-gray-500">• {o.date}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Verified Order
                            </span>
                          </div>
                          <p className="text-xs font-bold dark:text-[#F2F2F2] text-gray-900">
                            Customer: <span className="font-black text-[#D10000]">{o.shippingAddress?.fullName || 'Valued Customer'}</span> 
                            {o.shippingAddress?.city && <span> • {o.shippingAddress.city}, {o.shippingAddress.state}</span>}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] dark:text-[#868686] text-gray-500">
                            <span><strong>Address:</strong> {o.shippingAddress?.street}{o.shippingAddress?.apartment ? `, ${o.shippingAddress.apartment}` : ''}, {o.shippingAddress?.city} {o.shippingAddress?.zip}</span>
                            {o.shippingAddress?.phone && <span>• <strong>Phone:</strong> {o.shippingAddress.phone}</span>}
                            <span>• <strong>Payment:</strong> <strong className="dark:text-[#F2F2F2] text-gray-900">{o.paymentMethod}</strong></span>
                            <span>• <strong>Tracking:</strong> {trackingNum}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 dark:border-[#262626] border-gray-200">
                          <div className="flex flex-col items-start md:items-end">
                            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#868686] text-gray-500">Dispatch Status</span>
                            <select
                              value={o.status}
                              onChange={(e) => onUpdateOrderStatus(o.orderId, e.target.value as Order['status'])}
                              className="dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 text-xs font-extrabold px-3 py-1.5 uppercase dark:text-[#F2F2F2] text-gray-900 rounded-lg outline-none focus:ring-1 focus:ring-[#D10000] cursor-pointer mt-0.5"
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
                          </div>
                          <div className="text-right pl-3 border-l dark:border-[#262626] border-gray-200">
                            <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#868686] text-gray-500 block">Total</span>
                            <span className="font-black text-base text-[#D10000] block">₹{o.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Preserved Customer Ordered Products with Large Images */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider dark:text-[#868686] text-gray-500 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-[#D10000]" />
                            <span>Ordered Sneaker Silhouettes ({o.itemSnapshots ? o.itemSnapshots.length : o.items.length} item{(o.itemSnapshots ? o.itemSnapshots.length : o.items.length) === 1 ? '' : 's'})</span>
                          </span>
                          <span className="text-[10px] dark:text-[#868686] text-gray-400">Click image to inspect high-res</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                            o.itemSnapshots.map((snap, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 dark:bg-[#141414] bg-gray-50/80 rounded-xl border dark:border-[#262626] border-gray-200 hover:border-red-500/50 transition-colors gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* High-res sneaker thumbnail with hover zoom */}
                                  <div
                                    onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                                    className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white rounded-lg border dark:border-gray-200 border-gray-200 p-1 flex items-center justify-center cursor-zoom-in group shadow-xs"
                                    title="Click to view enlarged sneaker image"
                                  >
                                    <img
                                      src={snap.image}
                                      alt={snap.productName}
                                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-110"
                                      loading="lazy"
                                    />
                                    <span className="absolute bottom-1 right-1 bg-black/70 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="material-symbols-outlined text-[10px]">zoom_in</span>
                                    </span>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="font-black dark:text-[#F2F2F2] text-gray-900 text-xs sm:text-sm truncate">
                                      {snap.productName}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold dark:bg-[#262626] bg-gray-200 dark:text-gray-300 text-gray-700">
                                        Size: {snap.selectedSize}
                                      </span>
                                      {snap.selectedColor && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D10000]/10 text-[#D10000]">
                                          Color: {snap.selectedColor}
                                        </span>
                                      )}
                                      <span className="text-[11px] font-extrabold dark:text-[#F2F2F2] text-gray-900">
                                        Qty: {snap.quantity}
                                      </span>
                                    </div>
                                    <p className="text-[11px] dark:text-[#868686] text-gray-500 mt-0.5">
                                      Unit Price: ₹{snap.price.toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#868686] text-gray-500 block">Line Total</span>
                                  <span className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">
                                    ₹{(snap.price * snap.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            o.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 dark:bg-[#141414] bg-gray-50/80 rounded-xl border dark:border-[#262626] border-gray-200 hover:border-red-500/50 transition-colors gap-3"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {item.product?.image && (
                                    <div
                                      onClick={() => setPreviewImage({ url: item.product.image, title: item.product.name })}
                                      className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-white rounded-lg border dark:border-gray-200 border-gray-200 p-1 flex items-center justify-center cursor-zoom-in group shadow-xs"
                                    >
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-110"
                                      />
                                      <span className="absolute bottom-1 right-1 bg-black/70 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-[10px]">zoom_in</span>
                                      </span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-black dark:text-[#F2F2F2] text-gray-900 text-xs sm:text-sm truncate">
                                      {item.product ? item.product.name : 'Deactivated Shoe'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold dark:bg-[#262626] bg-gray-200 dark:text-gray-300 text-gray-700">
                                        Size: {item.selectedSize}
                                      </span>
                                      <span className="text-[11px] font-extrabold dark:text-[#F2F2F2] text-gray-900">
                                        Qty: {item.quantity}
                                      </span>
                                    </div>
                                    <p className="text-[11px] dark:text-[#868686] text-gray-500 mt-0.5">
                                      Unit: ₹{((item.product ? item.product.price : 0)).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[10px] font-bold uppercase tracking-wider dark:text-[#868686] text-gray-500 block">Line Total</span>
                                  <span className="font-black text-sm dark:text-[#F2F2F2] text-gray-900">
                                    ₹{(((item.product ? item.product.price : 0) * item.quantity)).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

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

                    {/* Preserved Sneaker Images */}
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                        o.itemSnapshots.map((snap, sIdx) => (
                          <div
                            key={sIdx}
                            onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                            className="flex items-center gap-2 p-2 dark:bg-[#0D0D0D] bg-white rounded-lg border dark:border-[#262626] border-gray-200 cursor-zoom-in hover:border-red-500 transition-colors"
                          >
                            <img src={snap.image} alt={snap.productName} className="w-10 h-10 object-contain mix-blend-multiply bg-white rounded" />
                            <div>
                              <p className="font-bold dark:text-[#F2F2F2] text-gray-900 text-[11px]">{snap.productName}</p>
                              <p className="text-[10px] dark:text-[#868686] text-gray-500">Size: {snap.selectedSize} • {snap.quantity}x</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        o.items.map((it, iIdx) => it.product?.image ? (
                          <div
                            key={iIdx}
                            onClick={() => setPreviewImage({ url: it.product.image, title: it.product.name })}
                            className="flex items-center gap-2 p-2 dark:bg-[#0D0D0D] bg-white rounded-lg border dark:border-[#262626] border-gray-200 cursor-zoom-in hover:border-red-500 transition-colors"
                          >
                            <img src={it.product.image} alt={it.product.name} className="w-10 h-10 object-contain mix-blend-multiply bg-white rounded" />
                            <div>
                              <p className="font-bold dark:text-[#F2F2F2] text-gray-900 text-[11px]">{it.product.name}</p>
                              <p className="text-[10px] dark:text-[#868686] text-gray-500">Size: {it.selectedSize} • {it.quantity}x</p>
                            </div>
                          </div>
                        ) : null)
                      )}
                    </div>

                    <div className="dark:bg-[#0D0D0D] bg-white p-3.5 rounded-lg border dark:border-[#262626] border-gray-200 space-y-1">
                      <p className="dark:text-[#F2F2F2] text-gray-900"><strong>Reason / Details:</strong> {o.returnReason || 'Fit / Size Adjustment'}</p>
                      <p className="dark:text-[#868686] text-gray-500"><strong>Total Order Amount:</strong> ₹{o.total.toLocaleString('en-IN')} • <strong>Payment Channel:</strong> {o.paymentMethod}</p>
                      <p className="dark:text-[#868686] text-gray-500"><strong>Current Refund Status:</strong> {o.refundStatus || `Refund Initiated (₹${o.total.toLocaleString('en-IN')})`}</p>
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

                  {/* Sneakers inside shipment box */}
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {o.itemSnapshots && o.itemSnapshots.length > 0 ? (
                      o.itemSnapshots.map((snap, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => setPreviewImage({ url: snap.image, title: snap.productName })}
                          className="flex items-center gap-2.5 p-2 dark:bg-[#141414] bg-gray-50 rounded-lg border dark:border-[#262626] border-gray-200 cursor-zoom-in hover:border-red-500 transition-colors"
                        >
                          <img src={snap.image} alt={snap.productName} className="w-11 h-11 object-contain mix-blend-multiply bg-white rounded p-0.5 border" />
                          <div className="text-xs">
                            <p className="font-bold dark:text-[#F2F2F2] text-gray-900">{snap.productName}</p>
                            <p className="text-[11px] dark:text-[#868686] text-gray-500">Size: {snap.selectedSize} • {snap.quantity} Pair{snap.quantity === 1 ? '' : 's'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      o.items.map((it, iIdx) => it.product?.image ? (
                        <div
                          key={iIdx}
                          onClick={() => setPreviewImage({ url: it.product.image, title: it.product.name })}
                          className="flex items-center gap-2.5 p-2 dark:bg-[#141414] bg-gray-50 rounded-lg border dark:border-[#262626] border-gray-200 cursor-zoom-in hover:border-red-500 transition-colors"
                        >
                          <img src={it.product.image} alt={it.product.name} className="w-11 h-11 object-contain mix-blend-multiply bg-white rounded p-0.5 border" />
                          <div className="text-xs">
                            <p className="font-bold dark:text-[#F2F2F2] text-gray-900">{it.product.name}</p>
                            <p className="text-[11px] dark:text-[#868686] text-gray-500">Size: {it.selectedSize} • {it.quantity} Pair{it.quantity === 1 ? '' : 's'}</p>
                          </div>
                        </div>
                      ) : null)
                    )}
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
          </div>
        </main>
      </div>

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

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-white dark:bg-[#141414] border dark:border-[#262626] border-gray-200 rounded-2xl p-6 shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b dark:border-[#262626] border-gray-200">
              <h4 className="font-black text-sm dark:text-[#F2F2F2] text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D10000]" />
                <span>{previewImage.title}</span>
              </h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#262626] dark:text-gray-300 text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-4/3 w-full bg-white rounded-xl flex items-center justify-center p-4 border border-gray-100">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="dark:text-[#868686] text-gray-500">High-Resolution Preserved Silhouette Snapshot</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-[#D10000] text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-[#8a0000] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

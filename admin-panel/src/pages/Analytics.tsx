import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  MousePointerClick, ShoppingCart, ShoppingBag, Search, RefreshCw, 
  User, Mail, Phone, ExternalLink, Calendar, ChevronLeft, ChevronRight, 
  Package, Copy, Check
} from 'lucide-react';

interface AddToCartItem {
  _id: string;
  serialNumber: number;
  url: string;
  sessionId: string;
  createdAt: string;
  product: {
    id?: string;
    title: string;
    slug?: string;
    image?: string;
    price?: number;
    sku?: string;
    quantity?: number;
    size?: string;
    color?: string;
  };
  user: {
    isGuest: boolean;
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    sessionId?: string;
  };
}

interface AnalyticsProps {
  defaultTab?: 'overview' | 'carts' | 'all';
}

export default function Analytics({ defaultTab = 'all' }: AnalyticsProps) {
  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'carts'>(defaultTab);

  // Add to Cart table state
  const [cartEvents, setCartEvents] = useState<AddToCartItem[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [refreshingCarts, setRefreshingCarts] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCartEvents, setTotalCartEvents] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Fetch overview stats
  const fetchStats = () => {
    setLoadingStats(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/custom`)
      .then(res => {
        setStats(res.data.data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Error fetching analytics stats:', err);
        setLoadingStats(false);
      });
  };

  // Fetch Add to Cart events
  const fetchCartEvents = useCallback((isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshingCarts(true);
    } else {
      setLoadingCarts(true);
    }

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (dateRange === 'today') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      startDate = now.toISOString();
    } else if (dateRange === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      startDate = past.toISOString();
    } else if (dateRange === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      startDate = past.toISOString();
    }

    axios.get(`${import.meta.env.VITE_API_URL}/api/analytics/add-to-carts`, {
      params: {
        page,
        limit,
        search: search.trim() || undefined,
        startDate,
        endDate
      }
    })
      .then(res => {
        if (res.data?.success) {
          setCartEvents(res.data.data || []);
          if (res.data.pagination) {
            setTotalPages(res.data.pagination.totalPages || 1);
            setTotalCartEvents(res.data.pagination.total || 0);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching add-to-cart events:', err);
      })
      .finally(() => {
        setLoadingCarts(false);
        setRefreshingCarts(false);
      });
  }, [page, limit, search, dateRange]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCartEvents();
  }, [fetchCartEvents]);

  // Debounced or on-submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSessionId(text);
    setTimeout(() => {
      setCopiedSessionId(null);
    }, 2000);
  };

  const eventsOverTime = stats?.eventsOverTime || [];
  const topPages = stats?.topPages || [];

  return (
    <div className="space-y-8">
      {/* Header and View Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Store Analytics & Cart Tracking</h2>
          <p className="text-sm text-gray-500 mt-1">
            Monitor real-time store activity, visitor engagements, and customer Add to Cart actions.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl self-start md:self-auto border border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab('carts')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'carts'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={14} className="text-emerald-600" />
            Add to Cart Table
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Charts & Trends
          </button>
        </div>
      </div>

      {/* Top Metric Cards (shown in 'all' and 'overview' tabs) */}
      {(activeTab === 'all' || activeTab === 'overview') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Page Views</p>
                <p className="text-4xl font-extrabold mt-2 text-indigo-900">
                  {loadingStats ? '...' : (stats?.totalPageViews || 0).toLocaleString()}
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-1">Past 30 days website traffic</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <MousePointerClick className="text-indigo-600" size={32} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Add to Carts</p>
                <p className="text-4xl font-extrabold mt-2 text-emerald-900">
                  {loadingStats ? '...' : (stats?.totalAddToCarts || totalCartEvents || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Products added to shopper carts</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <ShoppingCart className="text-emerald-600" size={32} />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events Over Time */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Traffic & Cart Activity Over Time</h3>
                  <p className="text-xs text-gray-400">Daily breakdown of visitors vs. add-to-cart clicks</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                  Last 30 Days
                </span>
              </div>
              <div className="h-72">
                {loadingStats ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">Loading chart data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eventsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" name="Page Views" dataKey="page_view" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" name="Add to Carts" dataKey="add_to_cart" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Top Visited Pages</h3>
                  <p className="text-xs text-gray-400">Most viewed product and collection pages</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                  Top 10 URLs
                </span>
              </div>
              <div className="h-72 flex-1">
                {loadingStats ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">Loading chart data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topPages} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={120} />
                      <RechartsTooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        formatter={(value: any) => [value, 'Views']}
                      />
                      <Bar dataKey="views" fill="#f59e0b" radius={[0, 6, 6, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add to Cart Events Table Section (shown in 'all' and 'carts' tabs) */}
      {(activeTab === 'all' || activeTab === 'carts') && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header Bar */}
          <div className="p-6 border-b border-gray-100 bg-white space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <ShoppingBag size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">Add to Cart Activity</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {totalCartEvents} Total Events
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Live log of shoppers adding products to cart, including product details, quantities, and customer info.
                  </p>
                </div>
              </div>

              {/* Refresh & Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchCartEvents(true)}
                  disabled={refreshingCarts || loadingCarts}
                  title="Refresh cart events"
                  className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshingCarts ? 'animate-spin text-indigo-600' : ''} />
                </button>

                {/* Date Filter Dropdown */}
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value as any);
                      setPage(1);
                    }}
                    className="bg-transparent border-none text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>

                {/* Per Page Selector */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600">
                  <span>Show</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="bg-transparent border-none text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU, customer name, email, phone, or session ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Search
              </button>
            </form>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">#</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-6">Customer / User</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingCarts ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="animate-spin text-indigo-600" size={24} />
                        <span>Loading add to cart events...</span>
                      </div>
                    </td>
                  </tr>
                ) : cartEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingBag className="text-gray-300" size={36} />
                        <span className="font-semibold text-gray-700">No Add to Cart events found</span>
                        <p className="text-xs text-gray-400 max-w-sm">
                          {search ? `No events matched your search "${search}". Try searching for something else.` : 'Shoppers have not added any items matching the selected filters yet.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cartEvents.map((item) => {
                    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });
                    const formattedTime = new Date(item.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });

                    const productUrl = item.product.slug 
                      ? `https://heywomaniyaa.com/product/${item.product.slug}`
                      : (item.url ? `https://heywomaniyaa.com${item.url}` : '#');

                    return (
                      <tr key={item._id} className="hover:bg-indigo-50/20 transition-colors">
                        {/* Serial Number / Count */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 font-mono">
                            #{item.serialNumber}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
                          <div className="text-xs text-gray-400 font-mono">{formattedTime}</div>
                        </td>

                        {/* Product Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            {/* Product Thumbnail */}
                            <div className="w-12 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                              {item.product.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.title}
                                  className="w-full h-full object-cover"
                                  onError={(e: any) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Package size={20} className="text-gray-400" />
                              )}
                            </div>

                            {/* Title & Metadata */}
                            <div className="space-y-1 max-w-xs md:max-w-md">
                              <a
                                href={productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-sm text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 flex items-center gap-1 group"
                              >
                                {item.product.title}
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                              </a>

                              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                {item.product.price != null && (
                                  <span className="font-bold text-gray-900">
                                    ₹{Number(item.product.price).toLocaleString('en-IN')}
                                  </span>
                                )}

                                {item.product.sku && (
                                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono text-[11px]">
                                    SKU: {item.product.sku}
                                  </span>
                                )}

                                {item.product.size && (
                                  <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                                    Size: {item.product.size}
                                  </span>
                                )}

                                {item.product.color && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-medium">
                                    Color: {item.product.color}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Quantity Added */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.product.quantity || 1}
                          </span>
                        </td>

                        {/* Customer / User Info */}
                        <td className="py-4 px-6">
                          {!item.user.isGuest ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-gray-900">
                                  {item.user.name || 'Registered Customer'}
                                </span>
                                {item.user.role && (
                                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                    {item.user.role}
                                  </span>
                                )}
                              </div>

                              {item.user.email && (
                                <a
                                  href={`mailto:${item.user.email}`}
                                  className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                >
                                  <Mail size={12} className="text-gray-400 shrink-0" />
                                  <span className="truncate max-w-[200px]">{item.user.email}</span>
                                </a>
                              )}

                              {item.user.phone && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone size={12} className="text-gray-400 shrink-0" />
                                  <span>{item.user.phone}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <User size={12} className="text-amber-600" /> Guest Visitor
                              </span>
                              <div className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                <span className="truncate max-w-[140px]" title={item.sessionId}>
                                  {item.sessionId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(item.sessionId)}
                                  title="Copy Session ID"
                                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                                >
                                  {copiedSessionId === item.sessionId ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Action Link */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <a
                            href={productUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>View Item</span>
                            <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/60">
            <div className="text-xs text-gray-500">
              Showing page <span className="font-semibold text-gray-800">{page}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalPages}</span> ({totalCartEvents} total recorded events)
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || loadingCarts}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="text-xs font-medium text-gray-700 px-2">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loadingCarts}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

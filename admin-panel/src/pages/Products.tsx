import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, CheckCircle2, XCircle } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, DRAFT
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Mapping official category display names to database category query values
  const CATEGORY_API_QUERY_MAP: Record<string, string> = {
    "CO-ORDS": "Co-Ords",
    "SHIRTS STORIES": "Shirt",
    "TOP STYLE": "top-style",
    "DESI COLLECTIONS": "DesiCollections",
    "BRANDS STUDIO": "BrandsStudio",
    "JEWEL ROOM": "Jewel-Room",
    "BAG AFFAIRS": "Bag-Affairs",
    "BIG SIZES STYL": "BrandsStudio",
    "DRESS GALLERY": "DesiCollections",
    "EVERYDAY": "Co-Ords"
  };

  const fetchProducts = (pageNumber: number) => {
    // If TOP STYLE is selected, keep it blank for now as requested
    if (selectedCategory === "TOP STYLE") {
      setProducts([]);
      setTotalPages(1);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    let url = `${import.meta.env.VITE_API_URL}/api/admin/products?page=${pageNumber}&limit=20`;
    
    if (selectedCategory && selectedCategory !== 'ALL') {
      const apiCategory = CATEGORY_API_QUERY_MAP[selectedCategory] || selectedCategory;
      url += `&category=${encodeURIComponent(apiCategory)}`;
    }
    if (statusFilter === 'ACTIVE') {
      url += `&isLive=true`;
    } else if (statusFilter === 'DRAFT') {
      url += `&isLive=false`;
    }
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    axios.get(url)
      .then(res => {
        let data = res.data.data ? res.data.data : (Array.isArray(res.data) ? res.data : []);

        // When SHIRTS STORIES is chosen, show all matching Shirt and ShirtsStories products
        if (selectedCategory === "SHIRTS STORIES") {
          data = data.filter((p: any) => {
            const cat = String(p.category || "").toLowerCase();
            return cat.includes("shirt");
          });
        }

        setProducts(data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages || 1);
          setTotalCount(selectedCategory === "SHIRTS STORIES" ? (res.data.pagination.totalItems || data.length) : (res.data.pagination.totalItems || data.length));
        } else {
          setTotalCount(data.length);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page, selectedCategory, statusFilter]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1);
  };

  // Toggle Live/Draft status for an individual product
  const handleToggleProductStatus = async (product: any) => {
    const productId = product.id || product._id;
    const currentStatus = product.isLive !== false && product.isActive !== false;
    const newStatus = !currentStatus;

    setTogglingId(productId);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/products/${productId}`, {
        isLive: newStatus,
        isActive: newStatus
      });

      setProducts(prev =>
        prev.map(p =>
          (p.id === productId || p._id === productId)
            ? { ...p, isLive: newStatus, isActive: newStatus }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to toggle product status:", err);
      alert("Failed to toggle product status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  // Bulk category toggle: toggle all products in current category to active or draft
  const handleToggleAllCategory = async (targetActive: boolean) => {
    if (products.length === 0) return;
    const confirmMsg = targetActive
      ? `Are you sure you want to activate all currently visible products${selectedCategory !== 'ALL' ? ` in ${selectedCategory}` : ''}?`
      : `Are you sure you want to deactivate all currently visible products${selectedCategory !== 'ALL' ? ` in ${selectedCategory}` : ''}?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      await Promise.all(
        products.map(p => {
          const pid = p.id || p._id;
          return axios.put(`${import.meta.env.VITE_API_URL}/api/admin/products/${pid}`, {
            isLive: targetActive,
            isActive: targetActive
          });
        })
      );
      fetchProducts(page);
    } catch (err) {
      console.error("Failed bulk toggle:", err);
      alert("An error occurred during bulk toggle.");
      setLoading(false);
    }
  };

  // The official store categories from Shop By Category
  const OFFICIAL_CATEGORIES = useMemo(() => [
    "CO-ORDS",
    "SHIRTS STORIES",
    "TOP STYLE",
    "DESI COLLECTIONS",
    "BRANDS STUDIO",
    "JEWEL ROOM",
    "BAG AFFAIRS",
    "BIG SIZES STYL",
    "DRESS GALLERY",
    "EVERYDAY"
  ], []);

  const categoryOptions = OFFICIAL_CATEGORIES;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total {totalCount} product{totalCount === 1 ? '' : 's'} available
          </p>
        </div>

        {/* Bulk Category Toggle Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleToggleAllCategory(true)}
            disabled={loading || products.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
            title="Set all visible products to Active"
          >
            <CheckCircle2 size={16} />
            <span>Enable All</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleAllCategory(false)}
            disabled={loading || products.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
            title="Set all visible products to Draft"
          >
            <XCircle size={16} />
            <span>Disable All</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search by Product Title / SKU */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative flex items-center">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by product name, SKU, variant SKU, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Dropdown Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DRAFT">Draft Only</option>
            </select>
          </div>
        </div>

        {/* Quick Category Pill Toggles */}
        {categoryOptions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
            <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Categories:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL');
                setPage(1);
              }}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categoryOptions.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Feedback</th>
                <th className="p-4 font-semibold">Status (Toggle)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No products found matching filters.</td>
                </tr>
              ) : (
                products.map((product) => {
                  const productId = product.id || product._id;
                  const isLive = product.isLive !== false && product.isActive !== false;
                  const isBusy = togglingId === productId;
                  const mainSku = product.sku || product.zohoSku;
                  const variants = Array.isArray(product.variants) ? product.variants : [];

                  return (
                    <tr key={productId} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0].startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL}${product.images[0]}`}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs">No img</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.title}</div>
                            {product.slug && (
                              <div className="text-xs text-gray-400 mt-0.5 font-mono">
                                /{product.slug}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-mono text-gray-800">
                        {mainSku ? (
                          <div className="font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-2 py-0.5 inline-block">
                            {mainSku}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">No Main SKU</span>
                        )}
                        {variants.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1 max-w-xs">
                            {variants.map((v: any, idx: number) => (
                              <span
                                key={v.sku || idx}
                                className="inline-block text-[11px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 font-mono"
                                title={`Size: ${v.size || 'N/A'}, Stock: ${v.availableStock ?? 0}`}
                              >
                                {v.sku ? `${v.sku} (${v.size || 'std'})` : v.size}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600 capitalize">
                        {product.category || product.categorySlug?.replace(/-/g, ' ') || 'Uncategorized'}
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        <div>₹{product.salePrice || product.price}</div>
                        {product.salePrice && product.salePrice < product.price && (
                          <div className="text-xs text-gray-400 line-through">₹{product.price}</div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div>Stock: {product.totalStock ?? product.stock ?? 'N/A'}</div>
                        {variants.length > 0 && (
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            {variants.length} variant{variants.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {product.feedback ? (
                          <div className="flex gap-2 text-xs">
                            {product.feedback.thumbs_up > 0 && <span>👍 {product.feedback.thumbs_up}</span>}
                            {product.feedback.thumbs_down > 0 && <span>👎 {product.feedback.thumbs_down}</span>}
                            {product.feedback.heart > 0 && <span>❤️ {product.feedback.heart}</span>}
                            {product.feedback.fire > 0 && <span>🔥 {product.feedback.fire}</span>}
                            {product.feedback.star > 0 && <span>⭐ {product.feedback.star}</span>}
                            {product.feedback.smile > 0 && <span>😊 {product.feedback.smile}</span>}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        {/* Interactive Toggle Switch */}
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleProductStatus(product)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isLive ? 'bg-green-600' : 'bg-gray-300'
                          } ${isBusy ? 'opacity-50 cursor-wait' : ''}`}
                          title={`Click to switch to ${isLive ? 'Draft' : 'Active'}`}
                        >
                          <span className="sr-only">Toggle product active status</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isLive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="ml-2 text-xs font-semibold text-gray-600 align-middle">
                          {isLive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

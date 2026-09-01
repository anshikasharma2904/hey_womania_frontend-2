import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/products')
      .then(res => {
        // the endpoint /api/admin/products returns a list directly or in .data
        const data = res.data.data ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id || product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`} alt={product.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-gray-400 text-xs">No img</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.title}</div>
                          <div className="text-xs text-gray-500 font-mono">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 capitalize">
                      {product.categorySlug?.replace(/-/g, ' ') || 'Uncategorized'}
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      <div>₹{product.salePrice || product.price}</div>
                      {product.salePrice && product.salePrice < product.price && (
                        <div className="text-xs text-gray-400 line-through">₹{product.price}</div>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.totalStock ?? product.stock ?? 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isLive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.isLive !== false ? 'Active' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

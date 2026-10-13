import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/orders`)
      .then(res => {
        if (res.data && res.data.data) {
          setOrders(res.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCancelClick = (id: string) => {
    setSelectedOrderId(id);
    setCancelModalOpen(true);
  };

  const confirmCancelOrder = () => {
    if (!selectedOrderId) return;
    setCancelLoading(true);
    axios.put(`${import.meta.env.VITE_API_URL}/api/admin/orders/${selectedOrderId}/status`, { status: 'Cancelled' })
      .then(() => {
        setCancelModalOpen(false);
        setSelectedOrderId(null);
        fetchOrders(); // Refresh orders
      })
      .catch(err => console.error(err))
      .finally(() => setCancelLoading(false));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer & Address</th>
                <th className="p-4 font-semibold">Products</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-900">
                      <div className="font-bold text-gray-900">#{order.orderNumber || (order.id ? order.id.slice(0, 8) : 'N/A')}</div>
                      <div className="text-[11px] text-gray-400 font-mono break-all max-w-[140px] truncate" title={order.id || order._id}>
                        {order.id || order._id}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-900 max-w-[240px]">
                      <div className="font-semibold text-gray-900">{order.address?.fullName || order.address?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.address?.phone || ''}</div>
                      <div className="text-xs text-gray-600 leading-tight mt-1 line-clamp-2" title={`${order.address?.streetAddress || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} ${order.address?.pincode || ''}`}>
                        {order.address?.streetAddress || order.address?.street || ''}{order.address?.city ? `, ${order.address.city}` : ''}{order.address?.pincode ? ` - ${order.address.pincode}` : ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 max-w-[280px]">
                        {(order.items || []).map((item: any, idx: number) => {
                          const img = item.img || (item.images && item.images[0]);
                          const isGift = Boolean(item.isFreeGift || item.sku === 'SURPRISE-GIFT' || item.productId === 'surprise-gift');
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {img ? (
                                <img
                                  src={img}
                                  alt={item.name || 'Product'}
                                  className="w-9 h-9 object-cover rounded-md border border-gray-200 shrink-0 bg-gray-50"
                                />
                              ) : (
                                <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center text-[9px] text-gray-400 shrink-0">
                                  No img
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-gray-900 truncate" title={item.name || item.title}>
                                  {item.name || item.title || 'Product'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {isGift ? (
                                    <span className="text-emerald-600 font-semibold">🎁 Free Gift</span>
                                  ) : (
                                    <>Qty: {item.qty || item.quantity || 1}{item.size ? ` • ${item.size}` : ''}</>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{order.total}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setViewOrder(order);
                            setViewModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          View Details
                        </button>
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <button
                            onClick={() => handleCancelClick(order.id || order._id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Order</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No, Keep Order
              </button>
              <button
                onClick={confirmCancelOrder}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewModalOpen && viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                <p className="text-xs font-mono text-gray-500 mt-0.5">#{viewOrder.orderNumber || viewOrder.id || viewOrder._id}</p>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Order Information</h4>
                  <div className="space-y-1.5 text-sm">
                    <p className="break-all"><span className="text-gray-500">Order ID:</span> <span className="font-mono text-xs">{viewOrder.id || viewOrder._id}</span></p>
                    <p><span className="text-gray-500">Date:</span> {new Date(viewOrder.createdAt).toLocaleString()}</p>
                    <p><span className="text-gray-500">Total Amount:</span> <span className="font-bold text-gray-900">{viewOrder.total}</span></p>
                    <p><span className="text-gray-500">Payment:</span> <span className="font-semibold uppercase">{viewOrder.paymentMode || viewOrder.paymentMethod || 'COD'}</span> ({viewOrder.paymentStatus || 'Pending'})</p>
                    <p>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        viewOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        viewOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        viewOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {viewOrder.status || 'Pending'}
                      </span>
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Delivery Address</h4>
                  <div className="space-y-1 text-sm bg-white p-3 rounded-lg border border-gray-200">
                    <p className="font-bold text-gray-900">{viewOrder.address?.fullName || viewOrder.address?.name || 'N/A'}</p>
                    <p className="text-gray-600 font-medium text-xs">📞 {viewOrder.address?.phone || 'N/A'}</p>
                    <p className="text-gray-700 text-xs leading-relaxed mt-1">
                      {viewOrder.address?.streetAddress || viewOrder.address?.street || ''}
                      {viewOrder.address?.streetAddressLine2 ? `, ${viewOrder.address.streetAddressLine2}` : ''}
                    </p>
                    <p className="text-gray-700 text-xs">
                      {viewOrder.address?.city ? `${viewOrder.address.city}, ` : ''}
                      {viewOrder.address?.state ? `${viewOrder.address.state} ` : ''}
                      {viewOrder.address?.pincode ? `- ${viewOrder.address.pincode}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {viewOrder.items && viewOrder.items.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Ordered Products ({viewOrder.items.length})
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold">Product</th>
                          <th className="p-3 font-semibold">SKU / Options</th>
                          <th className="p-3 font-semibold text-center">Qty</th>
                          <th className="p-3 font-semibold text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewOrder.items.map((item: any, i: number) => {
                          const itemImg = item.img || (item.images && item.images[0]) || '';
                          const isGift = Boolean(item.isFreeGift || item.sku === 'SURPRISE-GIFT' || item.productId === 'surprise-gift');
                          return (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {itemImg ? (
                                    <img
                                      src={itemImg}
                                      alt={item.name || 'Product'}
                                      className="w-14 h-14 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-50"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs font-semibold shrink-0">
                                      No Image
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-gray-900 leading-snug">{item.name || item.title || 'Product'}</p>
                                    {isGift && (
                                      <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                        🎁 Free Reward
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-xs text-gray-600">
                                <p className="font-mono">{item.sku || 'N/A'}</p>
                                {(item.size || item.color) && (
                                  <p className="text-gray-500 mt-1 font-sans">
                                    {item.size ? `Size: ${item.size}` : ''}
                                    {item.size && item.color ? ' • ' : ''}
                                    {item.color ? `Color: ${item.color}` : ''}
                                  </p>
                                )}
                              </td>
                              <td className="p-3 text-center font-semibold text-gray-900">{item.qty || item.quantity || 1}</td>
                              <td className="p-3 text-right font-bold text-gray-900">{item.price || '₹0'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

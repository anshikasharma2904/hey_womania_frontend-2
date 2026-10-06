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
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-900">{order.id || order._id}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {order.address?.fullName || order.address?.name || 'N/A'}
                      <div className="text-xs text-gray-500">{order.address?.phone || ''}</div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{order.total}</td>
                    <td className="p-4">
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
                      {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                        <button
                          onClick={() => handleCancelClick(order.id || order._id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      {order.status === 'Delivered' && (
                        <button
                          onClick={() => {
                            setViewOrder(order);
                            setViewModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                      )}
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Order Information</h4>
                  <div className="space-y-1 text-sm">
                    <p className="break-all"><span className="font-medium text-gray-700">Order ID:</span> {viewOrder.id || viewOrder._id}</p>
                    <p><span className="font-medium text-gray-700">Date:</span> {new Date(viewOrder.createdAt).toLocaleString()}</p>
                    <p><span className="font-medium text-gray-700">Total Amount:</span> {viewOrder.total}</p>
                    <p><span className="font-medium text-gray-700">Payment Mode:</span> {viewOrder.paymentMode || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Status:</span> <span className="text-green-600 font-semibold">{viewOrder.status}</span></p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-gray-700">Name:</span> {viewOrder.address?.fullName || viewOrder.address?.name || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Phone:</span> {viewOrder.address?.phone || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Address:</span> {viewOrder.address?.streetAddress || viewOrder.address?.street}{viewOrder.address?.streetAddressLine2 ? `, ${viewOrder.address.streetAddressLine2}` : ''}</p>
                    <p><span className="font-medium text-gray-700">Location:</span> {viewOrder.address?.city ? `${viewOrder.address.city}, ` : ''}{viewOrder.address?.state ? `${viewOrder.address.state} ` : ''}{viewOrder.address?.pincode}</p>
                  </div>
                </div>
              </div>

              {viewOrder.items && viewOrder.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold">Product</th>
                          <th className="p-3 font-semibold">SKU</th>
                          <th className="p-3 font-semibold text-center">Qty</th>
                          <th className="p-3 font-semibold text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {viewOrder.items.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-3 font-medium text-gray-900">{item.name || item.title || 'Product'}</td>
                            <td className="p-3 text-gray-600">{item.sku || 'N/A'}</td>
                            <td className="p-3 text-center">{item.qty || item.quantity || 1}</td>
                            <td className="p-3 text-right">₹{item.price || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
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

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Payouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/payouts`)
      .then(res => {
        setPayouts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Are you sure you want to mark this payout as ${status}?`)) return;
    try {
      let payload: any = { status };
      if (status === 'Paid') {
        const refId = prompt('Enter Bank Reference ID for this payment:');
        if (!refId) return; // cancel
        payload.bankReferenceId = refId;
      } else if (status === 'Rejected') {
        const reason = prompt('Enter Rejection Reason:');
        if (!reason) return;
        payload.rejectionReason = reason;
      }
      
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/payouts/${id}/status`, payload);
      if (res.data.success) {
        fetchPayouts();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update payout status');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payout Requests</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Payout ID</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Partner</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading payouts...</td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No payout requests found.</td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id || payout._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-gray-900">{payout.id || payout._id}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {payout.userName}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">₹{payout.amount}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payout.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        payout.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {payout.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {payout.status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(payout.id || payout._id, 'Paid')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Pay
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(payout.id || payout._id, 'Rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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

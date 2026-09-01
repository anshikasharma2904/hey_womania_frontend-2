import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/users')
      .then(res => {
        if (res.data.success) {
          setUsers(res.data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Email & Phone</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Wallet Balances</th>
                <th className="p-4 font-semibold">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {user.firstName || user.name || 'N/A'} {user.lastName || ''}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{user.email}</div>
                      <div className="text-xs text-gray-400 mt-1">{user.phone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isPartner || user.role === 'partner' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.isPartner || user.role === 'partner' ? 'Partner' : 'Normal User'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {(user.isPartner || user.role === 'partner') ? (
                        <>
                          <div>Network: ₹{user.partnerProfile?.networkWalletBalance || 0}</div>
                          <div className="text-xs mt-1">Shopping: ₹{user.partnerProfile?.walletBalance || 0}</div>
                        </>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
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

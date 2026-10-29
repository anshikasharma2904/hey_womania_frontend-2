import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Users as UsersIcon, Award, ShieldCheck, Search, RefreshCw, KeyRound, Phone, Mail, Calendar, Wallet } from 'lucide-react';

export default function Users() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'partners' | 'admins'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`)
      .then(res => {
        if (res.data.success) {
          const rawUsers: any[] = res.data.data || [];
          const rawAdmins: any[] = res.data.admins || [];
          
          const combinedAdmins = [...rawAdmins];
          const partnerList: any[] = [];
          const customerList: any[] = [];

          rawUsers.forEach((u) => {
            const role = (u.role || '').toLowerCase();
            const isPartner = Boolean(u.isPartner || role === 'partner');
            const isAdmin = Boolean(role === 'admin' || role === 'superadmin' || u.isAdmin);

            if (isAdmin) {
              if (!combinedAdmins.some(a => (a.id && a.id === u.id) || (a.email && a.email === u.email))) {
                combinedAdmins.push(u);
              }
            } else if (isPartner) {
              partnerList.push(u);
            } else {
              customerList.push(u);
            }
          });

          setCustomers(customerList);
          setPartners(partnerList);
          setAdmins(combinedAdmins);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading users:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return customers;
    return customers.filter(u => {
      const name = `${u.firstName || u.name || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [customers, searchTerm]);

  const filteredPartners = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return partners;
    return partners.filter(u => {
      const name = `${u.firstName || u.name || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const code = (u.partnerReferralCode || u.referralCode || '').toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term) || code.includes(term);
    });
  }, [partners, searchTerm]);

  const filteredAdmins = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return admins;
    return admins.filter(a => {
      const name = (a.name || '').toLowerCase();
      const email = (a.email || '').toLowerCase();
      const phone = (a.phone || '').toLowerCase();
      const role = (a.role || '').toLowerCase();
      return name.includes(term) || email.includes(term) || phone.includes(term) || role.includes(term);
    });
  }, [admins, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Accounts &amp; Access</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage normal store customers, partners, and portal administrators in separate views.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab 1: Normal Users */}
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <UsersIcon size={17} />
            <span>Normal Users</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'users' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {customers.length}
            </span>
          </button>

          {/* Tab 2: Partners */}
          <button
            type="button"
            onClick={() => setActiveTab('partners')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'partners'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Award size={17} />
            <span>Partners</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'partners' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {partners.length}
            </span>
          </button>

          {/* Tab 3: Admins */}
          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'admins'
                ? 'bg-gray-900 text-white shadow-sm shadow-gray-400'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck size={17} />
            <span>Admins</span>
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'admins' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {admins.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'users'
                ? "Search users..."
                : activeTab === 'partners'
                ? "Search partners..."
                : "Search admins..."
            }
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Tab 1: Normal Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email &amp; Phone</th>
                  <th className="p-4 font-semibold">Password</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500">
                      <div className="inline-flex items-center gap-2 text-sm">
                        <RefreshCw size={18} className="animate-spin text-indigo-600" />
                        <span>Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-500">
                      <UsersIcon size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium">No normal users found.</p>
                      {searchTerm && <p className="text-xs text-gray-400 mt-1">Try clearing your search query.</p>}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs uppercase border border-gray-300/60">
                            {(user.firstName || user.name || 'U')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.firstName || user.name || 'N/A'} {user.lastName || ''}
                            </p>
                            {user.id && (
                              <p className="text-[11px] text-gray-400 font-mono">ID: {user.id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span>{user.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{user.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.plainPassword ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-800">
                            {user.plainPassword}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Encrypted</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 shrink-0" />
                          <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Partners Table */}
      {activeTab === 'partners' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/50 border-b border-gray-200 text-xs text-purple-900 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Partner</th>
                  <th className="p-4 font-semibold">Email &amp; Phone</th>
                  <th className="p-4 font-semibold">Referral Code</th>
                  <th className="p-4 font-semibold">Password</th>
                  <th className="p-4 font-semibold">Wallet Balances</th>
                  <th className="p-4 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <div className="inline-flex items-center gap-2 text-sm">
                        <RefreshCw size={18} className="animate-spin text-purple-600" />
                        <span>Loading partners...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <Award size={32} className="mx-auto text-purple-300 mb-2" />
                      <p className="text-sm font-medium">No partners found.</p>
                      {searchTerm && <p className="text-xs text-gray-400 mt-1">Try clearing your search query.</p>}
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr key={partner._id || partner.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                            {(partner.firstName || partner.name || 'P')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {partner.firstName || partner.name || 'N/A'} {partner.lastName || ''}
                            </p>
                            {partner.id && (
                              <p className="text-[11px] text-gray-400 font-mono">ID: {partner.id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <Mail size={13} className="text-purple-500 shrink-0" />
                          <span>{partner.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                          <Phone size={12} className="text-gray-400 shrink-0" />
                          <span>{partner.phone || 'No phone'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          {partner.partnerReferralCode || partner.referralCode || '—'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {partner.plainPassword ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-800">
                            {partner.plainPassword}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Encrypted</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="space-y-0.5">
                          <div className="text-xs font-medium text-gray-800 flex items-center gap-1">
                            <Wallet size={12} className="text-purple-600 shrink-0" />
                            <span>Network: ₹{(partner.partnerProfile?.networkWalletBalance || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 pl-4">
                            Shopping: ₹{(partner.partnerProfile?.walletBalance || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 shrink-0" />
                          <span>{partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admins Table */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-semibold">Administrator</th>
                  <th className="p-4 font-semibold">Email &amp; Contact</th>
                  <th className="p-4 font-semibold">Role / Permissions</th>
                  <th className="p-4 font-semibold">Security</th>
                  <th className="p-4 font-semibold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      <div className="inline-flex items-center gap-2 text-sm">
                        <RefreshCw size={18} className="animate-spin text-gray-900" />
                        <span>Loading administrators...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-medium">No admin accounts found.</p>
                      {searchTerm && <p className="text-xs text-gray-400 mt-1">Try clearing your search query.</p>}
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id || admin.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                            {(admin.name || admin.email || 'A')[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {admin.name || 'System Admin'}
                            </p>
                            {admin.id && (
                              <p className="text-[11px] text-gray-400 font-mono">ID: {admin.id}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                          <Mail size={13} className="text-indigo-500 shrink-0" />
                          <span>{admin.email}</span>
                        </div>
                        {admin.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Phone size={12} className="text-gray-400 shrink-0" />
                            <span>{admin.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300">
                          <ShieldCheck size={13} />
                          {admin.role || 'Superadmin'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit font-medium">
                          <KeyRound size={12} />
                          <span>Password Hash Protected</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 shrink-0" />
                          <span>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Active'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

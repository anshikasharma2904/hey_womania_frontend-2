import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeedbacks = (pageNumber: number) => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/feedbacks?page=${pageNumber}&limit=20`, {
      withCredentials: true
    })
      .then(res => {
        const data = res.data.data ? res.data.data : [];
        setFeedbacks(data);
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks(page);
  }, [page]);

  const ratingEmojiMap: Record<string, string> = {
    thumbs_up: '👍 Like',
    thumbs_down: '👎 Not Like',
    heart: '❤️ Love',
    fire: '🔥 Amazing',
    star: '⭐ Very Nice',
    smile: '😊 Good'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Product Feedbacks</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Loading feedbacks...</td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No feedbacks found.</td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.productTitle || item.productId}</div>
                      <div className="text-xs text-gray-500 font-mono">{item.productSku}</div>
                    </td>
                    <td className="p-4">
                      {item.userId ? (
                        <div>
                          <div className="font-medium text-gray-900">{item.userName || 'Unknown User'}</div>
                          {item.userEmail && <div className="text-xs text-gray-500">{item.userEmail}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-sm">Guest</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {ratingEmojiMap[item.rating] || item.rating}
                      </span>
                    </td>
                  </tr>
                ))
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

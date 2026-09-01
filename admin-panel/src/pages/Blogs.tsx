import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', excerpt: '', status: 'Draft' });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/admin/blogs')
      .then(res => {
        if (res.data.success) {
          setBlogs(res.data.blogs);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/blogs', formData);
      setIsCreating(false);
      setFormData({ title: '', content: '', excerpt: '', status: 'Draft' });
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert('Failed to create blog');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete blog');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Blog Management</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {isCreating ? 'Cancel' : 'Create New Blog'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 mb-8 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">New Blog Post</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Short description)</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea required rows={5} className="w-full border rounded-lg px-3 py-2" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full border rounded-lg px-3 py-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
            Save Blog
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Loading blogs...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No blogs found.</td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {blog.title}
                      <div className="text-xs text-gray-400 font-normal">{blog.slug}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        blog.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm">
                      <button onClick={() => handleDelete(blog.id)} className="text-red-600 hover:text-red-900">Delete</button>
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

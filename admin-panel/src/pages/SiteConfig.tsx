import { useState, useEffect } from 'react';
import axios from 'axios';

const DEFAULT_CATEGORIES = [
  "LAST CHANCE", "EVERYDAY", "Co-Ords", "SHIRTS STORIES", 
  "TOP STYLE", "DESI COLLECTIONS", "BRANDS STUDIO", 
  "JEWEL ROOM", "BAG AFFAIRS", "BIG SIZES STYL", "DRESS GALLERY"
];

export default function SiteConfig() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states
  const [heroVideoDesktop, setHeroVideoDesktop] = useState("");
  const [heroVideoMobile, setHeroVideoMobile] = useState("");
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  
  // Upload state
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      setSettings(res.data);
      setHeroVideoDesktop(res.data.heroVideoDesktop || "https://www.youtube.com/watch?v=fAdYAOFqIC4");
      setHeroVideoMobile(res.data.heroVideoMobile || "/phoneVideo.mp4");
      setCategoryImages(res.data.categoryImages || {});
    } catch (err) {
      console.error("Error fetching settings:", err);
      showMessage("Error fetching settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await axios.put('http://localhost:5000/api/settings', {
        heroVideoDesktop,
        heroVideoMobile,
        categoryImages
      });
      showMessage("Site Configuration Saved Successfully!", "success");
    } catch (err) {
      console.error("Error saving settings:", err);
      showMessage("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleCategoryChange = (category: string, url: string) => {
    setCategoryImages(prev => ({
      ...prev,
      [category]: url
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const fileUrl = res.data.url;
      
      if (fieldName === 'heroVideoDesktop') setHeroVideoDesktop(fileUrl);
      else if (fieldName === 'heroVideoMobile') setHeroVideoMobile(fileUrl);
      else handleCategoryChange(fieldName, fileUrl);
      
      showMessage(`File uploaded successfully for ${fieldName}`, "success");
    } catch (err) {
      console.error("Upload failed", err);
      showMessage(`Upload failed for ${fieldName}`, "error");
    } finally {
      setUploadingField(null);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Site Configuration</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Hero Video Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Header Video</h3>
          <p className="text-sm text-gray-500 mt-1">Update the main video playing on the homepage header. You can paste a URL or upload a file.</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Video</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={heroVideoDesktop} 
                onChange={(e) => setHeroVideoDesktop(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="relative overflow-hidden rounded-lg">
                <button 
                  type="button"
                  disabled={uploadingField === 'heroVideoDesktop'}
                  className="bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-sm h-full w-28"
                >
                  {uploadingField === 'heroVideoDesktop' ? 'Uploading...' : 'Upload File'}
                </button>
                <input 
                  type="file" 
                  accept="video/*,image/*" 
                  onChange={(e) => handleFileUpload(e, 'heroVideoDesktop')}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Accepts YouTube URL or direct MP4/Image upload.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Video</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={heroVideoMobile} 
                onChange={(e) => setHeroVideoMobile(e.target.value)}
                placeholder="/phoneVideo.mp4 or https://..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="relative overflow-hidden rounded-lg">
                <button 
                  type="button"
                  disabled={uploadingField === 'heroVideoMobile'}
                  className="bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium text-sm h-full w-28"
                >
                  {uploadingField === 'heroVideoMobile' ? 'Uploading...' : 'Upload File'}
                </button>
                <input 
                  type="file" 
                  accept="video/*,image/*" 
                  onChange={(e) => handleFileUpload(e, 'heroVideoMobile')}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Accepts direct MP4/Image upload.</p>
          </div>
        </div>
      </div>

      {/* Category Images Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Shop By Category Images</h3>
          <p className="text-sm text-gray-500 mt-1">Provide image/video URLs or upload files for each category card on the homepage.</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {DEFAULT_CATEGORIES.map(cat => (
              <div key={cat} className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">{cat}</label>
                <div className="flex gap-3 items-center">
                  <div className="h-12 w-12 rounded bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                    {(categoryImages[cat]) ? (
                      categoryImages[cat].match(/\.(mp4|webm)$/i) ? (
                         <video src={categoryImages[cat].startsWith('http') ? categoryImages[cat] : `http://localhost:5000${categoryImages[cat]}`} className="h-full w-full object-cover" muted />
                      ) : (
                         <img src={categoryImages[cat].startsWith('http') ? categoryImages[cat] : `http://localhost:5000${categoryImages[cat]}`} alt={cat} className="h-full w-full object-cover" />
                      )
                    ) : (
                       <span className="flex items-center justify-center h-full w-full text-xs text-gray-400">Default</span>
                    )}
                  </div>
                  
                  <input 
                    type="text" 
                    value={categoryImages[cat] || ''} 
                    onChange={(e) => handleCategoryChange(cat, e.target.value)}
                    placeholder="/categoryImage/default.jpeg"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  />
                  
                  <div className="relative overflow-hidden rounded-lg h-[38px]">
                    <button 
                      type="button"
                      disabled={uploadingField === cat}
                      className="bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium text-sm h-full w-24"
                    >
                      {uploadingField === cat ? 'Uploading' : 'Upload'}
                    </button>
                    <input 
                      type="file" 
                      accept="video/*,image/*" 
                      onChange={(e) => handleFileUpload(e, cat)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

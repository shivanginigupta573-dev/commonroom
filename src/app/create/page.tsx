'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

export default function CreateListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Books',
    listing_type: 'sell',
    condition: 'good',
    program: 'BTech',
    year: '1st Year',
    seller: '',
    campus: 'NIT Durgapur',
    is_negotiable: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
    } else {
      setIsAuthenticated(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setFormData(prev => ({
            ...prev,
            seller: user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.username
          }));
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
    }
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('listing_type', formData.listing_type);
      data.append('condition', formData.condition);
      data.append('program', formData.program);
      data.append('year', formData.year);
      data.append('seller', formData.seller);
      data.append('campus', formData.campus);
      data.append('is_negotiable', String(formData.is_negotiable));
      if (image) {
        data.append('image', image);
      }

      await api.post('/listings/', data);

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      loading && setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <main className="bg-gray-50/50 min-h-screen pb-16">
      <Navbar />
      
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header Block */}
        <div className="border-b border-gray-200 pb-5 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Post a New Item</h1>
          <p className="mt-2 text-sm text-gray-500">List an item out to the NIT Durgapur campus community.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-medium animate-pulse">
            Listing created successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-xs">
          
          {/* SECTION 1: Product Strategy Segment */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">1. Listing Type &amp; Category</h3>
            
            {/* Custom Interactive Segment Radio Pill instead of generic inputs */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2.5">What are you looking to do? *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['sell', 'rent', 'borrow', 'free'].map((type) => (
                  <label 
                    key={type}
                    className={`border rounded-xl p-3 text-center cursor-pointer font-medium text-sm transition capitalize block ${
                      formData.listing_type === type 
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-700 font-semibold' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="listing_type" 
                      value={type} 
                      checked={formData.listing_type === type}
                      onChange={handleInputChange}
                      className="sr-only" 
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value="Books">Books</option>
                  <option value="Hostel Essentials">Hostel Essentials</option>
                  <option value="Cycles">Cycles</option>
                  <option value="Study Material">Study Material</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Item Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New / Mint</option>
                  <option value="good">Good Condition</option>
                  <option value="fair">Fair / Used</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 2: Core Data Content Form Elements */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">2. Core Details</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Item Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={80}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                placeholder="e.g., HC Verma Physics Vol 1 (With Solutions)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Detailed Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
                placeholder="Mention features, specific wear details, pickup locations around campus, or specific blocks..."
              />
            </div>

            {/* Price block styling adjustments */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-xl space-y-4">
              <div className="max-w-xs">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Target Price (₹) *</label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-medium">₹</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    disabled={formData.listing_type === 'free'}
                    step="1"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 disabled:bg-gray-100 disabled:text-gray-400 font-semibold"
                    placeholder={formData.listing_type === 'free' ? "0" : "Enter price"}
                  />
                </div>
              </div>

              {formData.listing_type !== 'free' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_negotiable"
                    name="is_negotiable"
                    checked={formData.is_negotiable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="is_negotiable" className="ml-2 text-sm text-gray-600 select-none font-medium">
                    I am open to price negotiations
                  </label>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 3: Customized Professional Media Uploader */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">3. Media Presentation</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Product Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-gray-300 transition relative bg-gray-50/30">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative mx-auto max-h-48 overflow-hidden rounded-lg mb-2">
                      <img src={imagePreview} alt="Upload Preview" className="object-contain h-44 w-auto rounded-md" />
                      <button
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(null); }}
                        className="absolute top-1 right-1 bg-gray-900/80 text-white rounded-full p-1 hover:bg-gray-900 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4-4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-white rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          Upload a file
                        </span>
                        <p className="pl-1 text-gray-500">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                    </>
                  )}
                  <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* SECTION 4: Context parameters */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">4. Context Metadata</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Program Context *</label>
                <select
                  name="program"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value="BTech">BTech</option>
                  <option value="MTech">MTech</option>
                  <option value="PhD">PhD</option>
                  <option value="MSc">MSc</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Target Academic Year *</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 bg-white"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Seller Signoff</label>
                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  readOnly
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Hub Campus Area</label>
              <input
                type="text"
                name="campus"
                value={formData.campus}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                placeholder="NIT Durgapur"
              />
            </div>
          </div>

          {/* Form Action Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-950 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition text-sm tracking-wide shadow-xs"
            >
              {loading ? 'Publishing Entry...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
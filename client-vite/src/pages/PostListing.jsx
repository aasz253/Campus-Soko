import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../utils/api';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CATEGORIES = ['Electronics', 'Books', 'Clothes', 'Furniture', 'Others'];

export default function PostListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    images: [],
    videos: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach(file => formDataUpload.append('media', file));

      const res = await axios.post(`${API_BASE_URL}/listings/upload`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newImages = res.data.media
        .filter(m => m.type === 'image')
        .map(m => m.url);

      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload images');
    }
    setUploading(false);
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      files.forEach(file => formDataUpload.append('media', file));

      const res = await axios.post(`${API_BASE_URL}/listings/upload`, formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const newVideos = res.data.media
        .filter(m => m.type === 'video')
        .map(m => m.url);
      
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...newVideos] }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload videos');
    }
    setUploading(false);
  };

  const removeImage = (idx) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const removeVideo = (idx) => {
    setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await listingAPI.create(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>Post New Item</h1>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
            placeholder="What are you selling?"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'vertical' }}
            placeholder="Describe your item in detail..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Price (KES)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              placeholder="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
            placeholder="e.g., University Hostel, Library"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Images</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {formData.images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
          <label style={{ display: 'inline-block', padding: '10px 20px', background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer' }}>
            + Add Images
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
          {uploading && <span style={{ marginLeft: '10px' }}>Uploading...</span>}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Videos</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            {formData.videos.map((vid, idx) => (
              <div key={idx} style={{ position: 'relative', width: '150px', height: '100px' }}>
                <video src={vid} controls style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#000' }} />
                <button type="button" onClick={() => removeVideo(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}>×</button>
              </div>
            ))}
          </div>
          <label style={{ display: 'inline-block', padding: '10px 20px', background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer' }}>
            + Add Videos
            <input type="file" accept="video/*" multiple onChange={handleVideoUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          style={{ width: '100%', padding: '14px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Posting...' : 'Post Item'}
        </button>
      </form>
    </div>
  );
}

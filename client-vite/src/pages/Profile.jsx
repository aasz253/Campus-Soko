import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { Camera, X, User as UserIcon } from 'lucide-react';
import { getFileUrl } from '../config';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    profileImage: user?.profileImage || ''
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await authAPI.uploadProfileImage(uploadData);
      updateUser(res.data.user);
      setFormData(prev => ({ ...prev, profileImage: res.data.profileImage }));
      setSuccess('Profile image uploaded successfully!');
      setPreviewImage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image');
      setPreviewImage(null);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const clearPreview = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDisplayImage = () => {
    if (previewImage) return previewImage;
    if (formData.profileImage) {
      return getFileUrl(formData.profileImage);
    }
    return null;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#f8fafc',
      padding: '32px 16px',
    },
    wrapper: {
      maxWidth: '500px',
      margin: '0 auto',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '24px',
    },
    errorBox: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '10px',
      marginBottom: '16px',
      fontSize: '14px',
    },
    successBox: {
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      color: '#16a34a',
      padding: '12px 16px',
      borderRadius: '10px',
      marginBottom: '16px',
      fontSize: '14px',
    },
    card: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      padding: '32px',
    },
    imageContainer: {
      textAlign: 'center',
      marginBottom: '32px',
    },
    imageWrapper: {
      position: 'relative',
      display: 'inline-block',
    },
    imageCircle: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      background: '#e2e8f0',
      margin: '0 auto 16px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '4px solid #0ea5e9',
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    uploadBtn: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      background: '#0ea5e9',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
      transition: 'background 0.2s',
    },
    clearBtn: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      background: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    },
    hintText: {
      color: '#64748b',
      fontSize: '14px',
      marginTop: '8px',
    },
    smallHint: {
      color: '#94a3b8',
      fontSize: '12px',
      marginTop: '4px',
    },
    inputGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '10px',
      fontSize: '15px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    inputDisabled: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '15px',
      background: '#f3f4f6',
      color: '#9ca3af',
      cursor: 'not-allowed',
    },
    submitBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    submitBtnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>My Profile</h1>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.card}>
          {/* Profile Image Section */}
          <div style={styles.imageContainer}>
            <div style={styles.imageWrapper}>
              <div style={styles.imageCircle}>
                {getDisplayImage() ? (
                  <img src={getDisplayImage()} alt="Profile" style={styles.img} />
                ) : (
                  <UserIcon size={48} color="#94a3b8" />
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={styles.uploadBtn}
              >
                {uploading ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                ) : (
                  <Camera size={18} />
                )}
              </button>

              {previewImage && (
                <button type="button" onClick={clearPreview} style={styles.clearBtn}>
                  <X size={14} />
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />

            <p style={styles.hintText}>
              {uploading ? 'Uploading...' : 'Click the camera icon to upload a photo'}
            </p>
            <p style={styles.smallHint}>Max size: 5MB (JPEG, PNG, GIF, WebP)</p>
          </div>

          {/* Name Field */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Email Field */}
          <div style={{ ...styles.inputGroup, marginBottom: '24px' }}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={styles.inputDisabled}
            />
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
              Email cannot be changed
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            style={{
              ...styles.submitBtn,
              ...(loading || uploading ? styles.submitBtnDisabled : {}),
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

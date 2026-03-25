import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Loading from '../components/Loading';
import { formatPrice, formatDate } from '../utils/helpers';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  Edit,
  Trash2,
  Share2,
  User,
  Boost
} from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { isOnline } = useSocket();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const res = await listingAPI.getOne(id);
      setListing(res.data);
    } catch (err) {
      console.error('Failed to fetch listing:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await listingAPI.delete(id);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this item on Campus Soko: ${listing.title} - ${formatPrice(listing.price)}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isOwner = user && listing && user._id === listing.user._id;

  if (loading) return <Loading text="Loading listing..." />;
  if (!listing) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative h-96 bg-gray-100">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[currentImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">📦</span>
                </div>
              )}
              
              {listing.isBoosted && (
                <div className="absolute top-4 left-4 bg-accent-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center">
                  <Boost className="w-4 h-4 mr-1" /> Boosted Listing
                </div>
              )}
            </div>

            {listing.images && listing.images.length > 1 && (
              <div className="p-4 flex gap-3 overflow-x-auto scrollbar-hide">
                {listing.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      currentImage === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <span className="badge bg-primary-100 text-primary-700">
                {listing.category}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {isOwner && (
                  <>
                    <Link
                      to={`/edit/${listing._id}`}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{listing.title}</h1>
            
            <div className="text-3xl font-bold text-primary-600 mb-6">
              {formatPrice(listing.price)}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Posted {formatDate(listing.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Eye className="w-5 h-5" />
                <span>{listing.views} views</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {listing.user?.profileImage ? (
                  <img
                    src={listing.user.profileImage}
                    alt={listing.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{listing.user?.name}</p>
                <p className="text-sm text-gray-500">
                  {isOnline(listing.user?._id) ? (
                    <span className="text-green-600">● Online</span>
                  ) : (
                    <span>● Offline</span>
                  )}
                </p>
              </div>
            </div>

            {!isOwner && (
              <Link
                to={`/chat/${listing.user._id}?listing=${listing._id}`}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat with Seller
              </Link>
            )}

            {isOwner && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">This is your listing</p>
                <Link
                  to="/dashboard"
                  className="btn-secondary w-full text-center block"
                >
                  Manage in Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{listing.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;

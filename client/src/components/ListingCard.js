import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice, formatDate, truncateText } from '../utils/helpers';

const ListingCard = ({ listing }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/listing/${listing._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="card cursor-pointer group"
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-4xl">📦</span>
          </div>
        )}
        
        {listing.isBoosted && (
          <div className="absolute top-2 left-2 bg-accent-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <span className="mr-1">⚡</span> Boosted
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
            {listing.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {listing.title}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {truncateText(listing.description, 80)}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(listing.price)}
          </span>
          <span className="text-xs text-gray-400 flex items-center">
            <span className="mr-1">📍</span>
            {listing.location}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
              {listing.user?.profileImage ? (
                <img
                  src={listing.user.profileImage}
                  alt={listing.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-600 text-xs font-medium">
                  {listing.user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">{listing.user?.name}</span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(listing.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;

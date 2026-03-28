const Listing = require('../models/Listing');
const path = require('path');

const uploadMedia = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const mediaUrls = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      type: file.mimetype.startsWith('video') ? 'video' : 'image'
    }));

    res.status(200).json({ media: mediaUrls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error uploading media' });
  }
};

const createListing = async (req, res) => {
  try {
    const { title, description, price, category, images, videos, location } = req.body;

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      images: images || [],
      videos: videos || [],
      location,
      user: req.user._id
    });

    const populatedListing = await Listing.findById(listing._id).populate('user', 'name email profileImage');

    res.status(201).json(populatedListing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Server error creating listing' });
  }
};

const getListings = async (req, res) => {
  try {
    const { search, category, sort, page = 1, limit = 12 } = req.query;

    const query = { isSold: false };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const listings = await Listing.find(query)
      .populate('user', 'name email profileImage')
      .sort({ ...sortOption, isBoosted: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Server error fetching listings' });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name email profileImage isOnline lastSeen');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.views += 1;
    await listing.save();

    res.json(listing);
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ message: 'Server error fetching listing' });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const { title, description, price, category, images, location, isSold, isBoosted } = req.body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price !== undefined) listing.price = price;
    if (category) listing.category = category;
    if (images) listing.images = images;
    if (location) listing.location = location;
    if (isSold !== undefined) listing.isSold = isSold;
    if (isBoosted !== undefined) listing.isBoosted = isBoosted;

    await listing.save();

    const updatedListing = await Listing.findById(listing._id).populate('user', 'name email profileImage');

    res.json(updatedListing);
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ message: 'Server error updating listing' });
  }
};

const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ message: 'Server error deleting listing' });
  }
};

const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id })
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ message: 'Server error fetching your listings' });
  }
};

const getCategories = async (req, res) => {
  const categories = ['Electronics', 'Books', 'Clothes', 'Furniture', 'Others'];
  res.json(categories);
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  getCategories,
  uploadMedia
};

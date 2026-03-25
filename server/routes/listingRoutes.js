const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  getCategories
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/my', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);
router.get('/', getListings);

module.exports = router;

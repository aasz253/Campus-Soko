const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getConversation,
  getConversations,
  getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/unread', protect, getUnreadCount);
router.get('/conversation/:otherUserId', protect, getConversation);
router.get('/', protect, getMessages);

module.exports = router;

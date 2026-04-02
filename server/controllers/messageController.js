const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, listingId, message, type } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      listing: listingId || null,
      message,
      type: type || 'text'
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('listing', 'title images');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('listing', 'title images')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error fetching conversation' });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name profileImage isOnline')
      .populate('receiver', 'name profileImage isOnline')
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });

    const conversationMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.sender._id.toString() === userId.toString()
        ? msg.receiver._id.toString()
        : msg.sender._id.toString();

      if (!conversationMap.has(otherUserId)) {
        const otherUser = msg.sender._id.toString() === userId.toString()
          ? msg.receiver
          : msg.sender;

        conversationMap.set(otherUserId, {
          user: otherUser,
          listing: msg.listing,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      if (msg.receiver._id.toString() === userId.toString() && !msg.isRead) {
        const conv = conversationMap.get(otherUserId);
        conv.unreadCount += 1;
      }
    });

    const conversations = Array.from(conversationMap.values());

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getConversation,
  getConversations,
  getUnreadCount
};

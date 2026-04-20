const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Send a connection request
// @route   POST /api/connections/send
// @access  Private (Student)
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const { receiverId, postId, message } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }

    // Check if the receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    // 1. Check if exact connection already exists
    let forwardConnection = await Connection.findOne({
      sender: senderId,
      receiver: receiverId,
      post: postId
    });

    if (forwardConnection) {
      if (['pending', 'accepted'].includes(forwardConnection.status)) {
        return res.status(400).json({ success: false, message: 'Connection request already exists or is accepted' });
      } else {
        // Was rejected, just 'renew' it to allow resending
        forwardConnection.status = 'pending';
        if (message) forwardConnection.message = message;
        await forwardConnection.save();
        return res.status(200).json({ success: true, data: forwardConnection });
      }
    }

    // 2. Also verify no pending/accepted connection exists in the REVERSE direction
    let reverseConnection = await Connection.findOne({
      sender: receiverId,
      receiver: senderId,
      post: postId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (reverseConnection) {
      return res.status(400).json({ success: false, message: 'A connection request from this user already exists' });
    }

    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      post: postId,
      message
    });

    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Connection request is already being processed' });
    }
    next(error);
  }
};

// @desc    Get my pending incoming requests
// @route   GET /api/connections/my-requests
// @access  Private (Student)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await Connection.find({
      receiver: req.user.id,
      status: 'pending'
    }).populate('sender', 'firstName lastName _id role email')
      .populate('post', 'location budgetRange bio');

    // Filter out connections where sender might have been deleted from DB
    const validRequests = requests.filter(req => req.sender != null);

    res.status(200).json({
      success: true,
      count: validRequests.length,
      data: validRequests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to a connection request (Accept / Reject)
// @route   PUT /api/connections/respond
// @access  Private (Student)
exports.respondToRequest = async (req, res, next) => {
  try {
    const { connectionId, status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    // Ensure only the receiver can respond
    if (connection.receiver.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    connection.status = status;
    await connection.save();

    res.status(200).json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get connection status with a specific user
// @route   GET /api/connections/status/:userId
// @access  Private (Student)
exports.getConnectionStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const postId = req.params.postId;
    const currentUserId = req.user._id.toString();

    if (targetUserId === currentUserId) {
      return res.status(200).json({ success: true, status: 'self' });
    }

    const connection = await Connection.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId, post: postId },
        { sender: targetUserId, receiver: currentUserId, post: postId }
      ]
    });

    if (!connection) {
      return res.status(200).json({ success: true, status: 'none' });
    }

    // Determine context based on who sent it
    const isSender = connection.sender.toString() === currentUserId;

    res.status(200).json({
      success: true,
      status: connection.status,
      connectionId: connection._id,
      isSender
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my active matches (accepted connections)
// @route   GET /api/connections/my-matches
// @access  Private (Student)
exports.getMyMatches = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    // A match is when status is 'accepted' where user is either sender or receiver
    const matches = await Connection.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ],
      status: 'accepted'
    }).populate('sender receiver', 'firstName lastName email phoneNumber role')
      .populate('post', 'location budgetRange bio');

    // Filter out matches where either sender or receiver was deleted
    const validMatches = matches.filter(match => match.sender != null && match.receiver != null);

    // Format the response to just send the "other" user
    const formattedMatches = validMatches.map(match => {
      // Determine the matched user object
      let matchedUser = match.sender._id.toString() === userId ? match.receiver : match.sender;
      
      return {
        connectionId: match._id,
        matchedAt: match.updatedAt,
        user: matchedUser,
        post: match.post
      };
    });

    res.status(200).json({
      success: true,
      count: formattedMatches.length,
      data: formattedMatches
    });
  } catch (error) {
    next(error);
  }
};

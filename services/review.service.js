const Review = require('../models/review.model');
const Game = require('../models/game.model');
const User = require('../models/user.model');

exports.getAllReviews = async (query = {}) => {
  const { 
    status, 
    limit = 10, 
    page = 1, 
    populate, 
    sort = '-created_at',
    game_id,
    author_id,
    rating,
    search
  } = query;
  
  const filter = {};
  
  if (status) filter.status = status;
  if (game_id) filter.game_id = game_id;
  if (author_id) filter.author_id = author_id;
  if (rating) filter.rating = rating;
  if (search) {
    filter.content = { $regex: search, $options: 'i' };
  }
  
  const populateFields = populate || 'author_id game_id';
  const selectFields = populate === 'author_id,game_id' ? 'profile email title cover_url' : '';
  
  const reviews = await Review.find(filter)
    .populate(populateFields, selectFields)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sort);
    
  const total = await Review.countDocuments(filter);
  
  return { 
    reviews, 
    total, 
    totalPages: Math.ceil(total / limit),
    currentPage: page 
  };
};

exports.getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId)
    .populate('author_id', 'profile email')
    .populate('game_id', 'title cover_url')
    .populate('replies.user_id', 'profile email');
    
  if (!review) {
    const err = new Error('Review không tồn tại');
    err.status = 404;
    throw err;
  }
  
  return review;
};

exports.getReviewsByGame = async (gameId, query = {}) => {
  const { limit = 10, page = 1, sort = '-created_at' } = query;
  
  const reviews = await Review.find({ 
    game_id: gameId, 
    status: 'approved' 
  })
    .populate('author_id', 'profile email')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sort);
    
  const total = await Review.countDocuments({ 
    game_id: gameId, 
    status: 'approved' 
  });
    
  return { 
    reviews, 
    total, 
    totalPages: Math.ceil(total / limit) 
  };
};

exports.getReviewsByUser = async (userId, query = {}) => {
  const { limit = 10, page = 1, sort = '-created_at' } = query;
  
  const reviews = await Review.find({ author_id: userId })
    .populate('game_id', 'title cover_url')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort(sort);
    
  const total = await Review.countDocuments({ author_id: userId });
    
  return { 
    reviews, 
    total, 
    totalPages: Math.ceil(total / limit) 
  };
};

exports.createReview = async (reviewData, authorId) => {
  const { content, rating, images, game_id } = reviewData;
  
  // Kiểm tra game tồn tại
  const game = await Game.findById(game_id);
  if (!game) {
    const err = new Error('Game không tồn tại');
    err.status = 404;
    throw err;
  }
  
  // Kiểm tra user đã review chưa
  const existingReview = await Review.findOne({
    game_id,
    author_id: authorId
  });
  
  if (existingReview) {
    const err = new Error('Bạn đã review game này rồi');
    err.status = 400;
    throw err;
  }
  
  const review = new Review({
    content,
    rating,
    images: images || [],
    game_id,
    author_id: authorId,
    status: 'pending' // Admin sẽ duyệt sau
  });
  
  await review.save();
  
  // Populate thông tin sau khi tạo
  await review.populate('author_id', 'profile email');
  await review.populate('game_id', 'title cover_url');
  
  return review;
};

exports.updateReview = async (reviewId, updateData, userId, userRole) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    const err = new Error('Review không tồn tại');
    err.status = 404;
    throw err;
  }
  
  // Chỉ author hoặc admin mới được update
  if (review.author_id.toString() !== userId && userRole !== 'admin') {
    const err = new Error('Bạn không có quyền cập nhật review này');
    err.status = 403;
    throw err;
  }
  
  // Nếu review đã được duyệt, chỉ admin mới được sửa
  if (review.status === 'approved' && userRole !== 'admin') {
    const err = new Error('Không thể sửa review đã được duyệt');
    err.status = 403;
    throw err;
  }
  
  const allowedUpdates = ['content', 'rating', 'images'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });
  
  // Nếu user update, set lại status về pending
  if (userRole !== 'admin' && Object.keys(updates).length > 0) {
    updates.status = 'pending';
  }
  
  Object.assign(review, updates);
  await review.save();
  
  await review.populate('author_id', 'profile email');
  await review.populate('game_id', 'title cover_url');
  
  return review;
};

exports.deleteReview = async (reviewId, userId, userRole) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    const err = new Error('Review không tồn tại');
    err.status = 404;
    throw err;
  }
  
  // Chỉ author hoặc admin mới được xóa
  if (review.author_id.toString() !== userId && userRole !== 'admin') {
    const err = new Error('Bạn không có quyền xóa review này');
    err.status = 403;
    throw err;
  }
  
  await review.deleteOne();
  return { message: 'Xóa review thành công' };
};

exports.updateReviewStatus = async (reviewId, status, adminId) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    const err = new Error('Review không tồn tại');
    err.status = 404;
    throw err;
  }
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    const err = new Error('Status không hợp lệ');
    err.status = 400;
    throw err;
  }
  
  review.status = status;
  await review.save();
  
  await review.populate('author_id', 'profile email');
  await review.populate('game_id', 'title cover_url');
  
  return review;
};

exports.likeReview = async (reviewId, userId) => {
  const review = await Review.findById(reviewId);
  
  if (!review) {
    const err = new Error('Review không tồn tại');
    err.status = 404;
    throw err;
  }
  
  const existingLike = review.likes.find(
    like => like.user_id.toString() === userId
  );
  
  if (existingLike) {
    // Unlike
    review.likes = review.likes.filter(
      like => like.user_id.toString() !== userId
    );
  } else {
    // Like
    review.likes.push({ user_id: userId });
  }
  
  await review.save();
  return { 
    liked: !existingLike, 
    likes_count: review.likes.length 
  };
};

exports.addReply = async (reviewId, replyData, userId) => {
  const { content } = replyData;
  const review = await Review.findById(reviewId);
  
  if (!review) {
    const err = new Error('Review không tồn tại');
    err.status = 404;
    throw err;
  }
  
  review.replies.push({
    user_id: userId,
    content
  });
  
  await review.save();
  await review.populate('replies.user_id', 'profile email');
  
  return review.replies[review.replies.length - 1];
};

exports.getReviewStats = async () => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const ratingStats = await Review.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return { stats, ratingStats };
};
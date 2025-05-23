const express = require('express');
const router = express.Router();
const likeController = require('../controllers/like.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Middleware để xác định loại đối tượng
function setTargetType(type) {
  return (req, res, next) => {
    req.targetType = type;
    next();
  };
}

router.post('/reviews/:id/like', verifyToken, setTargetType('Review'), likeController.likeTarget);
router.post('/comments/:id/like', verifyToken, setTargetType('Comment'), likeController.likeTarget);
router.post('/games/:id/like', verifyToken, setTargetType('Game'), likeController.likeTarget);
router.get('/reviews/:id/reactions', setTargetType('Review'), likeController.getReactionCount);
router.get('/comments/:id/reactions', setTargetType('Comment'), likeController.getReactionCount);
router.get('/games/:id/reactions', setTargetType('Game'), likeController.getReactionCount);
router.get('/reviews/:id/likers', setTargetType('Review'), likeController.getLikers);
router.get('/comments/:id/likers', setTargetType('Comment'), likeController.getLikers);
router.get('/games/:id/likers', setTargetType('Game'), likeController.getLikers);


module.exports = router;
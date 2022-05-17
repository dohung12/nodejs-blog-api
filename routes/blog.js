const express = require('express');
const router = express.Router();

const {
  getAllBlog,
  createBlog,
  deleteBlog,
  updateBlog,
  getBlog,
} = require('../controllers/blogController');
const {
  create_Message,
  update_Message,
  delete_Message,
} = require('../controllers/messageController');
router.route('/').get(getAllBlog).post(createBlog);
router.route('/:blogId').delete(deleteBlog).put(updateBlog).get(getBlog);

router.route('/:blogId/message').post(create_Message);
router
  .route('/:blogId/message/:messageId')
  .put(update_Message)
  .delete(delete_Message);

module.exports = router;
